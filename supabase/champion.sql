-- ============================================================
-- WM 2026 – Weltmeistertipp
-- Einmalig im Supabase SQL Editor ausführen
-- ============================================================

-- Felder in profiles
alter table profiles add column if not exists champion_team_id int references teams(id);
alter table profiles add column if not exists champion_points int not null default 0;

-- Champion-Eintrag in settings anlegen
insert into settings (key, value) values ('champion_team_id', '0') on conflict do nothing;

-- ============================================================
-- calculate_tip_points: champion_points in total_points einbeziehen
-- (überschreibt die Version aus schema.sql)
-- ============================================================
create or replace function calculate_tip_points(p_tip_id int)
returns int language plpgsql as $$
declare
  v_tip    tips%rowtype;
  v_match  matches%rowtype;
  v_points int := 0;
begin
  select * into v_tip   from tips    where id = p_tip_id;
  select * into v_match from matches where id = v_tip.match_id;

  if not v_match.is_finished or v_match.home_score is null then
    return null;
  end if;

  if sign(v_tip.home_score - v_tip.away_score) =
     sign(v_match.home_score - v_match.away_score) then
    v_points := v_points + 1;
    if (v_tip.home_score - v_tip.away_score) =
       (v_match.home_score - v_match.away_score) then
      v_points := v_points + 1;
      if v_tip.home_score = v_match.home_score and
         v_tip.away_score = v_match.away_score then
        v_points := v_points + 1;
      end if;
    end if;
  end if;

  update tips set points = v_points, updated_at = now() where id = p_tip_id;

  -- Gesamtpunkte inkl. Weltmeister-Bonus
  update profiles
  set total_points = (
    select coalesce(sum(points), 0) from tips
    where user_id = v_tip.user_id and points is not null
  ) + champion_points
  where id = v_tip.user_id;

  return v_points;
end;
$$;

-- ============================================================
-- reset_match: champion_points in total_points einbeziehen
-- (überschreibt die Version aus admin.sql)
-- ============================================================
create or replace function reset_match(p_match_id int)
returns text language plpgsql security definer as $$
begin
  update tips set points = null where match_id = p_match_id;

  update profiles p
  set total_points = (
    select coalesce(sum(points), 0) from tips
    where user_id = p.id and points is not null
  ) + p.champion_points
  where id in (select user_id from tips where match_id = p_match_id);

  update matches
  set is_finished = false, home_score = null, away_score = null
  where id = p_match_id;

  return 'Spiel zurückgesetzt';
end;
$$;

-- ============================================================
-- Weltmeister setzen + Punkte vergeben
-- ============================================================
create or replace function set_champion(p_team_id int)
returns int language plpgsql security definer as $$
declare v_count int;
begin
  -- Admin-Check (wird bei Cron-Aufruf per Service Role übersprungen)
  if auth.uid() is not null and not exists (
    select 1 from profiles where id = auth.uid() and is_admin = true
  ) then
    raise exception 'Unauthorized';
  end if;

  update settings set value = p_team_id::text where key = 'champion_team_id';

  -- Für alle Profile: 5 Punkte wenn richtig, 0 wenn falsch
  update profiles p
  set
    champion_points = case when champion_team_id = p_team_id then 5 else 0 end,
    total_points = (
      select coalesce(sum(points), 0) from tips where user_id = p.id and points is not null
    ) + case when p.champion_team_id = p_team_id then 5 else 0 end;

  select count(*) into v_count from profiles where champion_team_id = p_team_id;
  return v_count;
end;
$$;

-- ============================================================
-- Weltmeister zurücksetzen (Admin-Korrektur)
-- ============================================================
create or replace function reset_champion()
returns void language plpgsql security definer as $$
begin
  if auth.uid() is not null and not exists (
    select 1 from profiles where id = auth.uid() and is_admin = true
  ) then
    raise exception 'Unauthorized';
  end if;

  update settings set value = '0' where key = 'champion_team_id';

  update profiles p
  set
    champion_points = 0,
    total_points = (
      select coalesce(sum(points), 0) from tips where user_id = p.id and points is not null
    );
end;
$$;
