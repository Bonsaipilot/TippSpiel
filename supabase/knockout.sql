-- ============================================================
-- WM 2026 Tippspiel – K.O.-Runden
-- Ausführen im Supabase SQL Editor (nach schema.sql + seed.sql)
-- ============================================================

-- ============================================================
-- 1) Gruppenstandings berechnen
-- ============================================================
create or replace function get_group_standings(p_group_id int)
returns table (
  rank       int,
  team_id    int,
  team_name  text,
  team_flag  text,
  team_code  text,
  played     int,
  won        int,
  drawn      int,
  lost       int,
  goals_for  int,
  goals_against int,
  goal_diff  int,
  points     int
) language sql stable security definer as $$
  with
  home_stats as (
    select home_team_id as tid,
      count(*)::int                                                   as played,
      sum(case when home_score > away_score then 1 else 0 end)::int  as won,
      sum(case when home_score = away_score then 1 else 0 end)::int  as drawn,
      sum(case when home_score < away_score then 1 else 0 end)::int  as lost,
      sum(home_score)::int                                            as gf,
      sum(away_score)::int                                            as ga
    from matches
    where group_id = p_group_id and is_finished = true
    group by home_team_id
  ),
  away_stats as (
    select away_team_id as tid,
      count(*)::int                                                   as played,
      sum(case when away_score > home_score then 1 else 0 end)::int  as won,
      sum(case when away_score = home_score then 1 else 0 end)::int  as drawn,
      sum(case when away_score < home_score then 1 else 0 end)::int  as lost,
      sum(away_score)::int                                            as gf,
      sum(home_score)::int                                            as ga
    from matches
    where group_id = p_group_id and is_finished = true
    group by away_team_id
  ),
  combined as (
    select
      t.id   as team_id,
      t.name as team_name,
      t.flag as team_flag,
      t.code as team_code,
      coalesce(h.played,0)+coalesce(a.played,0) as played,
      coalesce(h.won,0)  +coalesce(a.won,0)     as won,
      coalesce(h.drawn,0)+coalesce(a.drawn,0)   as drawn,
      coalesce(h.lost,0) +coalesce(a.lost,0)    as lost,
      coalesce(h.gf,0)   +coalesce(a.gf,0)      as goals_for,
      coalesce(h.ga,0)   +coalesce(a.ga,0)      as goals_against,
      (coalesce(h.gf,0)+coalesce(a.gf,0)) -
      (coalesce(h.ga,0)+coalesce(a.ga,0))       as goal_diff,
      3*(coalesce(h.won,0)+coalesce(a.won,0)) +
        (coalesce(h.drawn,0)+coalesce(a.drawn,0)) as points
    from teams t
    left join home_stats h on h.tid = t.id
    left join away_stats  a on a.tid = t.id
    where t.group_id = p_group_id
  )
  select
    row_number() over (order by points desc, goal_diff desc, goals_for desc)::int,
    team_id, team_name, team_flag, team_code,
    played, won, drawn, lost, goals_for, goals_against, goal_diff, points
  from combined
  order by points desc, goal_diff desc, goals_for desc
$$;

-- ============================================================
-- 2) 8 besten Drittplatzierten ermitteln
-- ============================================================
create or replace function get_best_third_placed()
returns table (
  rank        int,
  team_id     int,
  team_name   text,
  team_flag   text,
  group_name  text,
  points      int,
  goal_diff   int,
  goals_for   int
) language sql stable security definer as $$
  with thirds as (
    select
      s.team_id, s.team_name, s.team_flag,
      g.name as group_name,
      s.points, s.goal_diff, s.goals_for
    from groups g
    cross join lateral (
      select * from get_group_standings(g.id) where rank = 3 limit 1
    ) s
    where s.played > 0   -- nur Gruppen mit gespielten Spielen
  )
  select
    row_number() over (order by points desc, goal_diff desc, goals_for desc)::int,
    team_id, team_name, team_flag, group_name, points, goal_diff, goals_for
  from thirds
  order by points desc, goal_diff desc, goals_for desc
$$;

-- ============================================================
-- 3) Bracket-Regelwerk (R32-Paarungen als Labels)
--    Labels: '1A' = Sieger Gruppe A | '2B' = 2. Gruppe B
--            '3-1' = bester Drittplatzierter usw.
--
--    HINWEIS: Dieses Bracket ist eine logische Vorlage.
--    Bitte vor dem Turnier gegen das offizielle FIFA-Bracket prüfen!
-- ============================================================
create table if not exists bracket_rules (
  id         serial primary key,
  match_id   int unique references matches(id) on delete cascade,
  home_label text not null,  -- z.B. '1A'
  away_label text not null   -- z.B. '2G'
);

alter table bracket_rules enable row level security;
create policy "Bracket public read"
  on bracket_rules for select using (true);
create policy "Admins manage bracket"
  on bracket_rules for all
  using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));

-- ============================================================
-- 4) Hilfsfunktion: Label → Team-ID auflösen
-- ============================================================
create or replace function resolve_bracket_label(p_label text)
returns int language plpgsql stable security definer as $$
declare
  v_pos  int;
  v_grp  text;
  v_rank int;
  v_id   int;
begin
  if p_label ~ '^[12][A-L]$' then
    v_pos := left(p_label,1)::int;
    v_grp := right(p_label,1);
    select team_id into v_id
    from get_group_standings((select id from groups where name = v_grp))
    where rank = v_pos limit 1;
    return v_id;

  elsif p_label ~ '^3-[1-8]$' then
    v_rank := right(p_label, length(p_label)-2)::int;
    select team_id into v_id
    from get_best_third_placed()
    where rank = v_rank limit 1;
    return v_id;
  end if;
  return null;
end;
$$;

-- ============================================================
-- 5) Auto-Fill: R32-Teams aus Gruppenphase befüllen
-- ============================================================
create or replace function fill_r32_teams()
returns text language plpgsql security definer as $$
declare
  r record;
  v_home int;
  v_away int;
  v_done int := 0;
  v_skip int := 0;
begin
  for r in select * from bracket_rules loop
    v_home := resolve_bracket_label(r.home_label);
    v_away := resolve_bracket_label(r.away_label);

    if v_home is not null and v_away is not null then
      update matches
      set home_team_id = v_home, away_team_id = v_away
      where id = r.match_id;
      v_done := v_done + 1;
    else
      v_skip := v_skip + 1;
    end if;
  end loop;

  return v_done || ' Paarungen befüllt, ' || v_skip || ' übersprungen (Gruppe noch nicht abgeschlossen)';
end;
$$;

-- ============================================================
-- 6) 31 Platzhalter-Spiele anlegen
-- ============================================================

-- Runde der 32 (16 Spiele, 1.–4. Juli)
insert into matches (home_team_id, away_team_id, kickoff, stage, venue) values
  (null, null, '2026-07-01 18:00+00', 'r32', 'MetLife Stadium, New York'),
  (null, null, '2026-07-01 21:00+00', 'r32', 'SoFi Stadium, Los Angeles'),
  (null, null, '2026-07-02 00:00+00', 'r32', 'AT&T Stadium, Dallas'),
  (null, null, '2026-07-02 03:00+00', 'r32', 'Levi''s Stadium, San Francisco'),
  (null, null, '2026-07-02 18:00+00', 'r32', 'Lumen Field, Seattle'),
  (null, null, '2026-07-02 21:00+00', 'r32', 'Mercedes-Benz Stadium, Atlanta'),
  (null, null, '2026-07-03 00:00+00', 'r32', 'NRG Stadium, Houston'),
  (null, null, '2026-07-03 03:00+00', 'r32', 'Rose Bowl, Los Angeles'),
  (null, null, '2026-07-03 18:00+00', 'r32', 'Hard Rock Stadium, Miami'),
  (null, null, '2026-07-03 21:00+00', 'r32', 'Lincoln Financial Field, Philadelphia'),
  (null, null, '2026-07-04 00:00+00', 'r32', 'Arrowhead Stadium, Kansas City'),
  (null, null, '2026-07-04 03:00+00', 'r32', 'Allegiant Stadium, Las Vegas'),
  (null, null, '2026-07-04 18:00+00', 'r32', 'Gillette Stadium, Boston'),
  (null, null, '2026-07-04 21:00+00', 'r32', 'BMO Field, Toronto'),
  (null, null, '2026-07-05 00:00+00', 'r32', 'BC Place, Vancouver'),
  (null, null, '2026-07-05 03:00+00', 'r32', 'Q2 Stadium, Austin');

-- Bracket-Regeln für R32 (Sieger Gruppe X vs Zweiter Gruppe Y)
-- Vorlage – bitte gegen offizielles FIFA-Bracket prüfen!
insert into bracket_rules (match_id, home_label, away_label)
select m.id, r.home_label, r.away_label
from (
  select row_number() over (order by kickoff) as rn, id
  from matches where stage = 'r32'
) m
join (values
  (1,  '1A', '2G'),
  (2,  '1B', '2H'),
  (3,  '1C', '2I'),
  (4,  '1D', '2J'),
  (5,  '1E', '2K'),
  (6,  '1F', '2L'),
  (7,  '1G', '2A'),
  (8,  '1H', '2B'),
  (9,  '1I', '3-1'),
  (10, '1J', '3-2'),
  (11, '1K', '3-3'),
  (12, '1L', '3-4'),
  (13, '2C', '3-5'),
  (14, '2D', '3-6'),
  (15, '2E', '3-7'),
  (16, '2F', '3-8')
) as r(rn, home_label, away_label) on m.rn = r.rn
on conflict (match_id) do nothing;

-- Achtelfinale (8 Spiele, 6.–9. Juli)
insert into matches (home_team_id, away_team_id, kickoff, stage, venue) values
  (null, null, '2026-07-06 18:00+00', 'r16', 'MetLife Stadium, New York'),
  (null, null, '2026-07-06 21:00+00', 'r16', 'SoFi Stadium, Los Angeles'),
  (null, null, '2026-07-07 18:00+00', 'r16', 'AT&T Stadium, Dallas'),
  (null, null, '2026-07-07 21:00+00', 'r16', 'Rose Bowl, Los Angeles'),
  (null, null, '2026-07-08 18:00+00', 'r16', 'Mercedes-Benz Stadium, Atlanta'),
  (null, null, '2026-07-08 21:00+00', 'r16', 'Levi''s Stadium, San Francisco'),
  (null, null, '2026-07-09 18:00+00', 'r16', 'Hard Rock Stadium, Miami'),
  (null, null, '2026-07-09 21:00+00', 'r16', 'Lumen Field, Seattle');

-- Viertelfinale (4 Spiele, 11.–12. Juli)
insert into matches (home_team_id, away_team_id, kickoff, stage, venue) values
  (null, null, '2026-07-11 18:00+00', 'qf', 'MetLife Stadium, New York'),
  (null, null, '2026-07-11 21:00+00', 'qf', 'SoFi Stadium, Los Angeles'),
  (null, null, '2026-07-12 18:00+00', 'qf', 'AT&T Stadium, Dallas'),
  (null, null, '2026-07-12 21:00+00', 'qf', 'Rose Bowl, Los Angeles');

-- Halbfinale (2 Spiele, 14.–15. Juli)
insert into matches (home_team_id, away_team_id, kickoff, stage, venue) values
  (null, null, '2026-07-14 21:00+00', 'sf', 'MetLife Stadium, New York'),
  (null, null, '2026-07-15 21:00+00', 'sf', 'SoFi Stadium, Los Angeles');

-- Finale (19. Juli, MetLife Stadium, New York)
insert into matches (home_team_id, away_team_id, kickoff, stage, venue) values
  (null, null, '2026-07-19 20:00+00', 'final', 'MetLife Stadium, New York');
