-- ============================================================
-- finish_match: Ergebnis eintragen + Tipppunkte berechnen
-- Wird vom Vercel Cron-Job aufgerufen (api/sync-results.ts)
-- Ausführen im Supabase SQL Editor
-- ============================================================

create or replace function finish_match(
  p_match_id   int,
  p_home_score int,
  p_away_score int
)
returns void language plpgsql security definer as $$
begin
  -- Ergebnis speichern und Spiel als beendet markieren
  update matches
  set home_score  = p_home_score,
      away_score  = p_away_score,
      is_finished = true
  where id = p_match_id
    and is_finished = false;  -- nur wenn noch nicht fertig

  -- Punkte für alle Tipps dieses Spiels berechnen
  perform calculate_tip_points(t.id)
  from tips t
  where t.match_id = p_match_id;
end;
$$;
