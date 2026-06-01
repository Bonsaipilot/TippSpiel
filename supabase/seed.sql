-- ============================================================
-- WM 2026 Tippspiel – Vollständige Daten (alle 48 Teams, 72 Gruppenspiele)
-- Bestehende Daten werden vorher gelöscht.
-- Ausführen im Supabase SQL Editor (nach schema.sql)
-- HINWEIS: Gruppen K und L (DR Kongo, Portugal, Kolumbien, Usbekistan /
--          England, Kroatien, Ghana, Panama) bitte nochmal gegen offizielle
--          FIFA-Quelle prüfen, falls sportschau.de diese anzeigt.
-- ============================================================

-- Bestehende Daten löschen (Reihenfolge wegen FK-Constraints)
do $$ begin
  update profiles set champion_team_id = null, champion_points = 0, total_points = 0;
exception when undefined_column then
  update profiles set total_points = 0;
end; $$;
update settings set value = '0' where key = 'champion_team_id';
truncate table tips, bracket_rules, matches restart identity;
delete from teams;
select setval(pg_get_serial_sequence('teams', 'id'), 1, false);

-- ============================================================
-- 48 Teams nach Gruppen (Quelle: sportschau.de, Stand Mai 2026)
-- ============================================================
insert into teams (name, code, flag, group_id) values
  -- Gruppe A  (Gastgeber: Mexiko)
  ('Tschechien',           'CZE', '🇨🇿',  1),
  ('Mexiko',               'MEX', '🇲🇽',  1),
  ('Südafrika',            'RSA', '🇿🇦',  1),
  ('Südkorea',             'KOR', '🇰🇷',  1),
  -- Gruppe B  (Gastgeber: Kanada)
  ('Bosnien-Herzegowina',  'BIH', '🇧🇦',  2),
  ('Kanada',               'CAN', '🇨🇦',  2),
  ('Katar',                'QAT', '🇶🇦',  2),
  ('Schweiz',              'SUI', '🇨🇭',  2),
  -- Gruppe C
  ('Brasilien',            'BRA', '🇧🇷',  3),
  ('Marokko',              'MAR', '🇲🇦',  3),
  ('Haiti',                'HAI', '🇭🇹',  3),
  ('Schottland',           'SCO', '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 3),
  -- Gruppe D  (Gastgeber: USA)
  ('Türkei',               'TUR', '🇹🇷',  4),
  ('USA',                  'USA', '🇺🇸',  4),
  ('Paraguay',             'PAR', '🇵🇾',  4),
  ('Australien',           'AUS', '🇦🇺',  4),
  -- Gruppe E
  ('Deutschland',          'GER', '🇩🇪',  5),
  ('Curaçao',              'CUW', '🇨🇼',  5),
  ('Elfenbeinküste',       'CIV', '🇨🇮',  5),
  ('Ecuador',              'ECU', '🇪🇨',  5),
  -- Gruppe F
  ('Schweden',             'SWE', '🇸🇪',  6),
  ('Niederlande',          'NED', '🇳🇱',  6),
  ('Japan',                'JPN', '🇯🇵',  6),
  ('Tunesien',             'TUN', '🇹🇳',  6),
  -- Gruppe G
  ('Belgien',              'BEL', '🇧🇪',  7),
  ('Ägypten',              'EGY', '🇪🇬',  7),
  ('Iran',                 'IRN', '🇮🇷',  7),
  ('Neuseeland',           'NZL', '🇳🇿',  7),
  -- Gruppe H
  ('Spanien',              'ESP', '🇪🇸',  8),
  ('Kapverdische Inseln',  'CPV', '🇨🇻',  8),
  ('Saudi-Arabien',        'KSA', '🇸🇦',  8),
  ('Uruguay',              'URU', '🇺🇾',  8),
  -- Gruppe I
  ('Irak',                 'IRQ', '🇮🇶',  9),
  ('Frankreich',           'FRA', '🇫🇷',  9),
  ('Sénégal',              'SEN', '🇸🇳',  9),
  ('Norwegen',             'NOR', '🇳🇴',  9),
  -- Gruppe J
  ('Argentinien',          'ARG', '🇦🇷', 10),
  ('Algerien',             'ALG', '🇩🇿', 10),
  ('Österreich',           'AUT', '🇦🇹', 10),
  ('Jordanien',            'JOR', '🇯🇴', 10),
  -- Gruppe K  (bitte gegen sportschau.de prüfen)
  ('DR Kongo',             'COD', '🇨🇩', 11),
  ('Portugal',             'POR', '🇵🇹', 11),
  ('Kolumbien',            'COL', '🇨🇴', 11),
  ('Usbekistan',           'UZB', '🇺🇿', 11),
  -- Gruppe L  (bitte gegen sportschau.de prüfen)
  ('England',              'ENG', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 12),
  ('Kroatien',             'CRO', '🇭🇷', 12),
  ('Ghana',                'GHA', '🇬🇭', 12),
  ('Panama',               'PAN', '🇵🇦', 12);

-- Hilfsfunktion
create or replace function team_id(p_code text) returns int as $$
  select id from teams where code = p_code limit 1;
$$ language sql stable;

-- ============================================================
-- 72 Gruppenspiele  (je Gruppe: ST1=Sp1+Sp2, ST2=Sp3+Sp4, ST3=Sp5+Sp6 simultan)
-- Alle Zeiten UTC
-- ============================================================

-- Gruppe A  (Estadio Azteca, Mexiko-Stadt / Estadio Akron, Guadalajara)
insert into matches (home_team_id, away_team_id, kickoff, stage, group_id, venue) values
  (team_id('CZE'), team_id('MEX'), '2026-06-12 21:00+00', 'group', 1, 'Estadio Azteca, Mexiko-Stadt'),
  (team_id('RSA'), team_id('KOR'), '2026-06-13 00:00+00', 'group', 1, 'Estadio Akron, Guadalajara'),
  (team_id('CZE'), team_id('RSA'), '2026-06-17 21:00+00', 'group', 1, 'Estadio Akron, Guadalajara'),
  (team_id('MEX'), team_id('KOR'), '2026-06-18 00:00+00', 'group', 1, 'Estadio Azteca, Mexiko-Stadt'),
  (team_id('CZE'), team_id('KOR'), '2026-06-22 21:00+00', 'group', 1, 'Estadio Azteca, Mexiko-Stadt'),
  (team_id('MEX'), team_id('RSA'), '2026-06-22 21:00+00', 'group', 1, 'Estadio Akron, Guadalajara');

-- Gruppe B  (BMO Field, Toronto / BC Place, Vancouver)
insert into matches (home_team_id, away_team_id, kickoff, stage, group_id, venue) values
  (team_id('BIH'), team_id('CAN'), '2026-06-13 18:00+00', 'group', 2, 'BMO Field, Toronto'),
  (team_id('QAT'), team_id('SUI'), '2026-06-13 21:00+00', 'group', 2, 'BC Place, Vancouver'),
  (team_id('BIH'), team_id('QAT'), '2026-06-18 18:00+00', 'group', 2, 'BC Place, Vancouver'),
  (team_id('CAN'), team_id('SUI'), '2026-06-18 21:00+00', 'group', 2, 'BMO Field, Toronto'),
  (team_id('BIH'), team_id('SUI'), '2026-06-23 18:00+00', 'group', 2, 'BMO Field, Toronto'),
  (team_id('CAN'), team_id('QAT'), '2026-06-23 18:00+00', 'group', 2, 'BC Place, Vancouver');

-- Gruppe C  (Hard Rock Stadium, Miami / Lincoln Financial Field, Philadelphia)
insert into matches (home_team_id, away_team_id, kickoff, stage, group_id, venue) values
  (team_id('BRA'), team_id('MAR'), '2026-06-14 15:00+00', 'group', 3, 'Hard Rock Stadium, Miami'),
  (team_id('HAI'), team_id('SCO'), '2026-06-14 18:00+00', 'group', 3, 'Lincoln Financial Field, Philadelphia'),
  (team_id('BRA'), team_id('HAI'), '2026-06-19 15:00+00', 'group', 3, 'Hard Rock Stadium, Miami'),
  (team_id('MAR'), team_id('SCO'), '2026-06-19 18:00+00', 'group', 3, 'Lincoln Financial Field, Philadelphia'),
  (team_id('BRA'), team_id('SCO'), '2026-06-24 15:00+00', 'group', 3, 'Hard Rock Stadium, Miami'),
  (team_id('MAR'), team_id('HAI'), '2026-06-24 15:00+00', 'group', 3, 'Lincoln Financial Field, Philadelphia');

-- Gruppe D  (MetLife Stadium, New York / SoFi Stadium, Los Angeles)
insert into matches (home_team_id, away_team_id, kickoff, stage, group_id, venue) values
  (team_id('TUR'), team_id('USA'), '2026-06-14 21:00+00', 'group', 4, 'MetLife Stadium, New York'),
  (team_id('PAR'), team_id('AUS'), '2026-06-15 00:00+00', 'group', 4, 'SoFi Stadium, Los Angeles'),
  (team_id('TUR'), team_id('PAR'), '2026-06-19 21:00+00', 'group', 4, 'SoFi Stadium, Los Angeles'),
  (team_id('USA'), team_id('AUS'), '2026-06-20 00:00+00', 'group', 4, 'MetLife Stadium, New York'),
  (team_id('TUR'), team_id('AUS'), '2026-06-24 21:00+00', 'group', 4, 'MetLife Stadium, New York'),
  (team_id('USA'), team_id('PAR'), '2026-06-24 21:00+00', 'group', 4, 'SoFi Stadium, Los Angeles');

-- Gruppe E  (Rose Bowl, Los Angeles / Lumen Field, Seattle)
insert into matches (home_team_id, away_team_id, kickoff, stage, group_id, venue) values
  (team_id('GER'), team_id('CUW'), '2026-06-15 15:00+00', 'group', 5, 'Rose Bowl, Los Angeles'),
  (team_id('CIV'), team_id('ECU'), '2026-06-15 18:00+00', 'group', 5, 'Lumen Field, Seattle'),
  (team_id('GER'), team_id('CIV'), '2026-06-20 15:00+00', 'group', 5, 'Rose Bowl, Los Angeles'),
  (team_id('CUW'), team_id('ECU'), '2026-06-20 18:00+00', 'group', 5, 'Lumen Field, Seattle'),
  (team_id('GER'), team_id('ECU'), '2026-06-25 15:00+00', 'group', 5, 'Rose Bowl, Los Angeles'),
  (team_id('CUW'), team_id('CIV'), '2026-06-25 15:00+00', 'group', 5, 'Lumen Field, Seattle');

-- Gruppe F  (AT&T Stadium, Dallas / NRG Stadium, Houston)
insert into matches (home_team_id, away_team_id, kickoff, stage, group_id, venue) values
  (team_id('SWE'), team_id('NED'), '2026-06-15 21:00+00', 'group', 6, 'AT&T Stadium, Dallas'),
  (team_id('JPN'), team_id('TUN'), '2026-06-16 00:00+00', 'group', 6, 'NRG Stadium, Houston'),
  (team_id('SWE'), team_id('JPN'), '2026-06-20 21:00+00', 'group', 6, 'NRG Stadium, Houston'),
  (team_id('NED'), team_id('TUN'), '2026-06-21 00:00+00', 'group', 6, 'AT&T Stadium, Dallas'),
  (team_id('SWE'), team_id('TUN'), '2026-06-25 21:00+00', 'group', 6, 'AT&T Stadium, Dallas'),
  (team_id('NED'), team_id('JPN'), '2026-06-25 21:00+00', 'group', 6, 'NRG Stadium, Houston');

-- Gruppe G  (Mercedes-Benz Stadium, Atlanta / Gillette Stadium, Boston)
insert into matches (home_team_id, away_team_id, kickoff, stage, group_id, venue) values
  (team_id('BEL'), team_id('EGY'), '2026-06-16 15:00+00', 'group', 7, 'Mercedes-Benz Stadium, Atlanta'),
  (team_id('IRN'), team_id('NZL'), '2026-06-16 18:00+00', 'group', 7, 'Gillette Stadium, Boston'),
  (team_id('BEL'), team_id('IRN'), '2026-06-21 15:00+00', 'group', 7, 'Mercedes-Benz Stadium, Atlanta'),
  (team_id('EGY'), team_id('NZL'), '2026-06-21 18:00+00', 'group', 7, 'Gillette Stadium, Boston'),
  (team_id('BEL'), team_id('NZL'), '2026-06-26 15:00+00', 'group', 7, 'Mercedes-Benz Stadium, Atlanta'),
  (team_id('EGY'), team_id('IRN'), '2026-06-26 15:00+00', 'group', 7, 'Gillette Stadium, Boston');

-- Gruppe H  (Allegiant Stadium, Las Vegas / Arrowhead Stadium, Kansas City)
insert into matches (home_team_id, away_team_id, kickoff, stage, group_id, venue) values
  (team_id('ESP'), team_id('CPV'), '2026-06-16 21:00+00', 'group', 8, 'Allegiant Stadium, Las Vegas'),
  (team_id('KSA'), team_id('URU'), '2026-06-17 00:00+00', 'group', 8, 'Arrowhead Stadium, Kansas City'),
  (team_id('ESP'), team_id('KSA'), '2026-06-21 21:00+00', 'group', 8, 'Arrowhead Stadium, Kansas City'),
  (team_id('CPV'), team_id('URU'), '2026-06-22 00:00+00', 'group', 8, 'Allegiant Stadium, Las Vegas'),
  (team_id('ESP'), team_id('URU'), '2026-06-26 21:00+00', 'group', 8, 'Allegiant Stadium, Las Vegas'),
  (team_id('CPV'), team_id('KSA'), '2026-06-26 21:00+00', 'group', 8, 'Arrowhead Stadium, Kansas City');

-- Gruppe I  (Q2 Stadium, Austin / Levi's Stadium, San Francisco)
insert into matches (home_team_id, away_team_id, kickoff, stage, group_id, venue) values
  (team_id('IRQ'), team_id('FRA'), '2026-06-17 15:00+00', 'group', 9, 'Q2 Stadium, Austin'),
  (team_id('SEN'), team_id('NOR'), '2026-06-17 18:00+00', 'group', 9, 'Levi''s Stadium, San Francisco'),
  (team_id('IRQ'), team_id('SEN'), '2026-06-22 15:00+00', 'group', 9, 'Q2 Stadium, Austin'),
  (team_id('FRA'), team_id('NOR'), '2026-06-22 18:00+00', 'group', 9, 'Levi''s Stadium, San Francisco'),
  (team_id('IRQ'), team_id('NOR'), '2026-06-27 15:00+00', 'group', 9, 'Q2 Stadium, Austin'),
  (team_id('FRA'), team_id('SEN'), '2026-06-27 15:00+00', 'group', 9, 'Levi''s Stadium, San Francisco');

-- Gruppe J  (AT&T Stadium, Dallas / Rose Bowl, Los Angeles)
insert into matches (home_team_id, away_team_id, kickoff, stage, group_id, venue) values
  (team_id('ARG'), team_id('ALG'), '2026-06-17 21:00+00', 'group', 10, 'AT&T Stadium, Dallas'),
  (team_id('AUT'), team_id('JOR'), '2026-06-18 00:00+00', 'group', 10, 'Rose Bowl, Los Angeles'),
  (team_id('ARG'), team_id('AUT'), '2026-06-22 21:00+00', 'group', 10, 'AT&T Stadium, Dallas'),
  (team_id('ALG'), team_id('JOR'), '2026-06-23 00:00+00', 'group', 10, 'Rose Bowl, Los Angeles'),
  (team_id('ARG'), team_id('JOR'), '2026-06-27 21:00+00', 'group', 10, 'AT&T Stadium, Dallas'),
  (team_id('ALG'), team_id('AUT'), '2026-06-27 21:00+00', 'group', 10, 'Rose Bowl, Los Angeles');

-- Gruppe K  (NRG Stadium, Houston / Mercedes-Benz Stadium, Atlanta)
insert into matches (home_team_id, away_team_id, kickoff, stage, group_id, venue) values
  (team_id('COD'), team_id('POR'), '2026-06-18 15:00+00', 'group', 11, 'NRG Stadium, Houston'),
  (team_id('COL'), team_id('UZB'), '2026-06-18 18:00+00', 'group', 11, 'Mercedes-Benz Stadium, Atlanta'),
  (team_id('COD'), team_id('COL'), '2026-06-23 15:00+00', 'group', 11, 'NRG Stadium, Houston'),
  (team_id('POR'), team_id('UZB'), '2026-06-23 18:00+00', 'group', 11, 'Mercedes-Benz Stadium, Atlanta'),
  (team_id('COD'), team_id('UZB'), '2026-06-28 15:00+00', 'group', 11, 'NRG Stadium, Houston'),
  (team_id('POR'), team_id('COL'), '2026-06-28 15:00+00', 'group', 11, 'Mercedes-Benz Stadium, Atlanta');

-- Gruppe L  (SoFi Stadium, Los Angeles / MetLife Stadium, New York)
insert into matches (home_team_id, away_team_id, kickoff, stage, group_id, venue) values
  (team_id('ENG'), team_id('CRO'), '2026-06-18 21:00+00', 'group', 12, 'SoFi Stadium, Los Angeles'),
  (team_id('GHA'), team_id('PAN'), '2026-06-19 00:00+00', 'group', 12, 'MetLife Stadium, New York'),
  (team_id('ENG'), team_id('GHA'), '2026-06-23 21:00+00', 'group', 12, 'SoFi Stadium, Los Angeles'),
  (team_id('CRO'), team_id('PAN'), '2026-06-24 00:00+00', 'group', 12, 'MetLife Stadium, New York'),
  (team_id('ENG'), team_id('PAN'), '2026-06-28 21:00+00', 'group', 12, 'SoFi Stadium, Los Angeles'),
  (team_id('CRO'), team_id('GHA'), '2026-06-28 21:00+00', 'group', 12, 'MetLife Stadium, New York');

-- Aufräumen
drop function if exists team_id(text);
