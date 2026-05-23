-- ============================================================
-- WM 2026 Tippspiel – Admin-Setup
-- Einmalig im Supabase SQL Editor ausführen
-- ============================================================

-- Admin-Flag in profiles
alter table profiles add column if not exists is_admin boolean default false;

-- Admins dürfen Matches updaten (Ergebnis + is_finished)
create policy "Admins can update matches"
  on matches for update
  using (
    exists (select 1 from profiles where id = auth.uid() and is_admin = true)
  );

-- ============================================================
-- Alle Tipps eines Spiels auf einmal bewerten
-- Wird nach Eintragen des Ergebnisses per RPC aufgerufen
-- ============================================================
create or replace function calculate_match_points(p_match_id int)
returns int language plpgsql security definer as $$
declare
  v_count int := 0;
  v_tip_id int;
begin
  for v_tip_id in
    select id from tips where match_id = p_match_id
  loop
    perform calculate_tip_points(v_tip_id);
    v_count := v_count + 1;
  end loop;
  return v_count;
end;
$$;

-- ============================================================
-- Spielergebnis zurücksetzen (Admin-Korrektur)
-- Setzt is_finished=false, löscht Scores + alle Tipppunkte
-- ============================================================
create or replace function reset_match(p_match_id int)
returns text language plpgsql security definer as $$
begin
  -- Tipppunkte zurücksetzen
  update tips set points = null where match_id = p_match_id;

  -- Gesamtpunkte aller betroffenen Spieler neu berechnen
  update profiles p
  set total_points = (
    select coalesce(sum(points), 0) from tips
    where user_id = p.id and points is not null
  )
  where id in (select user_id from tips where match_id = p_match_id);

  -- Spiel zurücksetzen
  update matches
  set is_finished = false, home_score = null, away_score = null
  where id = p_match_id;

  return 'Spiel zurückgesetzt';
end;
$$;

-- ============================================================
-- Admin-Rechte vergeben (Username anpassen!)
-- ============================================================
-- update profiles set is_admin = true where username = 'DeinUsername';
