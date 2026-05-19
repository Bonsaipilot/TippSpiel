-- ============================================================
-- WM 2026 Tippspiel – Datenbankschema
-- Ausführen im Supabase SQL Editor
-- ============================================================

-- Gruppen (A–L, 12 Gruppen à 4 Teams)
create table if not exists groups (
  id   serial primary key,
  name text not null unique  -- 'A', 'B', ... 'L'
);

-- Nationalteams
create table if not exists teams (
  id       serial primary key,
  name     text not null,
  code     text not null unique,  -- 'GER', 'BRA', …
  flag     text,                  -- Emoji-Flag oder URL
  group_id int references groups(id)
);

-- Spiele
create table if not exists matches (
  id           serial primary key,
  home_team_id int  references teams(id),
  away_team_id int  references teams(id),
  home_score   int,
  away_score   int,
  kickoff      timestamptz not null,
  stage        text not null check (stage in ('group','r32','r16','qf','sf','final')),
  group_id     int  references groups(id),
  venue        text,
  is_finished  boolean default false
);

-- Benutzerprofile (wird per Trigger bei Signup angelegt)
create table if not exists profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  username     text unique not null,
  avatar_url   text,
  total_points int default 0,
  created_at   timestamptz default now()
);

-- Tipps der Benutzer
create table if not exists tips (
  id         serial primary key,
  user_id    uuid references profiles(id) on delete cascade,
  match_id   int  references matches(id) on delete cascade,
  home_score int  not null,
  away_score int  not null,
  points     int,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, match_id)
);

-- ============================================================
-- Trigger: Profil automatisch bei Signup anlegen
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================
alter table profiles enable row level security;
alter table tips     enable row level security;
alter table matches  enable row level security;
alter table teams    enable row level security;
alter table groups   enable row level security;

-- Profiles: jeder kann alle sehen, nur eigenes bearbeiten
create policy "Profiles are public"
  on profiles for select using (true);
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

-- Tips: jeder sieht alle Tipps, nur eigene schreiben/ändern
create policy "Tips are public"
  on tips for select using (true);
create policy "Users can insert own tips"
  on tips for insert with check (auth.uid() = user_id);
create policy "Users can update own tips"
  on tips for update using (auth.uid() = user_id);

-- Matches / Teams / Groups: für alle lesbar (kein Schreiben via Client)
create policy "Matches are public"  on matches for select using (true);
create policy "Teams are public"    on teams   for select using (true);
create policy "Groups are public"   on groups  for select using (true);

-- ============================================================
-- Hilfsfunktion: Punkte für einen Tipp berechnen
-- Aufruf nach Spielende: select calculate_tip_points(tip_id)
-- Wertung: Ergebnis = 3 Pkt | Tordifferenz = 2 Pkt | Tendenz = 1 Pkt
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

  -- Tendenz korrekt?
  if sign(v_tip.home_score - v_tip.away_score) =
     sign(v_match.home_score - v_match.away_score) then
    v_points := v_points + 1;

    -- Tordifferenz korrekt?
    if (v_tip.home_score - v_tip.away_score) =
       (v_match.home_score - v_match.away_score) then
      v_points := v_points + 1;

      -- Exaktes Ergebnis?
      if v_tip.home_score = v_match.home_score and
         v_tip.away_score = v_match.away_score then
        v_points := v_points + 1;
      end if;
    end if;
  end if;

  -- Punkte speichern
  update tips set points = v_points, updated_at = now()
  where id = p_tip_id;

  -- Gesamtpunkte des Benutzers aktualisieren
  update profiles
  set total_points = (
    select coalesce(sum(points), 0) from tips
    where user_id = v_tip.user_id and points is not null
  )
  where id = v_tip.user_id;

  return v_points;
end;
$$;

-- ============================================================
-- Beispieldaten: Gruppen eintragen
-- ============================================================
insert into groups (name) values
  ('A'),('B'),('C'),('D'),('E'),('F'),
  ('G'),('H'),('I'),('J'),('K'),('L')
on conflict do nothing;
