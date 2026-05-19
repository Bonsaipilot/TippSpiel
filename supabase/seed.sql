-- ============================================================
-- WM 2026 Tippspiel – Vollständige Daten (alle 48 Teams, 72 Gruppenspiele)
-- Bestehende Daten werden vorher gelöscht.
-- Ausführen im Supabase SQL Editor (nach schema.sql)
-- ============================================================

-- Bestehende Daten löschen (Reihenfolge wegen FK-Constraints)
truncate table tips, matches, teams restart identity cascade;

-- ============================================================
-- 48 Teams nach Gruppen
-- ============================================================
insert into teams (name, code, flag, group_id) values
  -- Gruppe A  (Gastgeber: USA)
  ('USA',             'USA', '🇺🇸',  1),
  ('Panama',          'PAN', '🇵🇦',  1),
  ('Uruguay',         'URU', '🇺🇾',  1),
  ('Bolivien',        'BOL', '🇧🇴',  1),
  -- Gruppe B  (Gastgeber: Mexiko)
  ('Mexiko',          'MEX', '🇲🇽',  2),
  ('Jamaika',         'JAM', '🇯🇲',  2),
  ('Venezuela',       'VEN', '🇻🇪',  2),
  ('Ecuador',         'ECU', '🇪🇨',  2),
  -- Gruppe C  (Gastgeber: Kanada)
  ('Kanada',          'CAN', '🇨🇦',  3),
  ('Honduras',        'HON', '🇭🇳',  3),
  ('Marokko',         'MAR', '🇲🇦',  3),
  ('Belgien',         'BEL', '🇧🇪',  3),
  -- Gruppe D
  ('Argentinien',     'ARG', '🇦🇷',  4),
  ('Südkorea',        'KOR', '🇰🇷',  4),
  ('Serbien',         'SRB', '🇷🇸',  4),
  ('Nigeria',         'NGA', '🇳🇬',  4),
  -- Gruppe E
  ('Spanien',         'ESP', '🇪🇸',  5),
  ('Japan',           'JPN', '🇯🇵',  5),
  ('Elfenbeinküste',  'CIV', '🇨🇮',  5),
  ('Polen',           'POL', '🇵🇱',  5),
  -- Gruppe F
  ('Deutschland',     'GER', '🇩🇪',  6),
  ('Kolumbien',       'COL', '🇨🇴',  6),
  ('Algerien',        'ALG', '🇩🇿',  6),
  ('Australien',      'AUS', '🇦🇺',  6),
  -- Gruppe G
  ('Frankreich',      'FRA', '🇫🇷',  7),
  ('Costa Rica',      'CRC', '🇨🇷',  7),
  ('Kroatien',        'CRO', '🇭🇷',  7),
  ('Tunesien',        'TUN', '🇹🇳',  7),
  -- Gruppe H
  ('Brasilien',       'BRA', '🇧🇷',  8),
  ('T&T',             'TTO', '🇹🇹',  8),
  ('Türkei',          'TUR', '🇹🇷',  8),
  ('Südafrika',       'RSA', '🇿🇦',  8),
  -- Gruppe I
  ('England',         'ENG', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 9),
  ('Senegal',         'SEN', '🇸🇳',  9),
  ('Slowakei',        'SVK', '🇸🇰',  9),
  ('Iran',            'IRN', '🇮🇷',  9),
  -- Gruppe J
  ('Niederlande',     'NED', '🇳🇱', 10),
  ('Neuseeland',      'NZL', '🇳🇿', 10),
  ('Ungarn',          'HUN', '🇭🇺', 10),
  ('Kamerun',         'CMR', '🇨🇲', 10),
  -- Gruppe K
  ('Portugal',        'POR', '🇵🇹', 11),
  ('Jordanien',       'JOR', '🇯🇴', 11),
  ('Dänemark',        'DEN', '🇩🇰', 11),
  ('Usbekistan',      'UZB', '🇺🇿', 11),
  -- Gruppe L
  ('Schweiz',         'SUI', '🇨🇭', 12),
  ('Irak',            'IRQ', '🇮🇶', 12),
  ('Österreich',      'AUT', '🇦🇹', 12),
  ('Saudi-Arabien',   'KSA', '🇸🇦', 12);

-- Hilfsfunktion
create or replace function team_id(p_code text) returns int as $$
  select id from teams where code = p_code limit 1;
$$ language sql stable;

-- ============================================================
-- 72 Gruppenspiele  (je Gruppe: ST1=Sp1+Sp2, ST2=Sp3+Sp4, ST3=Sp5+Sp6 simultan)
-- Alle Zeiten UTC
-- ============================================================

-- Gruppe A  (MetLife Stadium / SoFi Stadium)
insert into matches (home_team_id, away_team_id, kickoff, stage, group_id, venue) values
  (team_id('USA'), team_id('PAN'), '2026-06-12 21:00+00', 'group', 1, 'SoFi Stadium, Los Angeles'),
  (team_id('URU'), team_id('BOL'), '2026-06-13 00:00+00', 'group', 1, 'MetLife Stadium, New York'),
  (team_id('USA'), team_id('URU'), '2026-06-17 21:00+00', 'group', 1, 'MetLife Stadium, New York'),
  (team_id('PAN'), team_id('BOL'), '2026-06-18 00:00+00', 'group', 1, 'SoFi Stadium, Los Angeles'),
  (team_id('USA'), team_id('BOL'), '2026-06-22 21:00+00', 'group', 1, 'SoFi Stadium, Los Angeles'),
  (team_id('PAN'), team_id('URU'), '2026-06-22 21:00+00', 'group', 1, 'MetLife Stadium, New York');

-- Gruppe B  (Estadio Azteca / Estadio Akron / Estadio BBVA)
insert into matches (home_team_id, away_team_id, kickoff, stage, group_id, venue) values
  (team_id('MEX'), team_id('JAM'), '2026-06-13 18:00+00', 'group', 2, 'Estadio Azteca, Mexiko-Stadt'),
  (team_id('VEN'), team_id('ECU'), '2026-06-13 21:00+00', 'group', 2, 'Estadio Akron, Guadalajara'),
  (team_id('MEX'), team_id('VEN'), '2026-06-18 18:00+00', 'group', 2, 'Estadio BBVA, Monterrey'),
  (team_id('JAM'), team_id('ECU'), '2026-06-18 21:00+00', 'group', 2, 'Estadio Azteca, Mexiko-Stadt'),
  (team_id('MEX'), team_id('ECU'), '2026-06-23 18:00+00', 'group', 2, 'Estadio Azteca, Mexiko-Stadt'),
  (team_id('JAM'), team_id('VEN'), '2026-06-23 18:00+00', 'group', 2, 'Estadio Akron, Guadalajara');

-- Gruppe C  (BMO Field, Toronto / BC Place, Vancouver)
insert into matches (home_team_id, away_team_id, kickoff, stage, group_id, venue) values
  (team_id('CAN'), team_id('HON'), '2026-06-14 15:00+00', 'group', 3, 'BMO Field, Toronto'),
  (team_id('MAR'), team_id('BEL'), '2026-06-14 18:00+00', 'group', 3, 'BC Place, Vancouver'),
  (team_id('CAN'), team_id('MAR'), '2026-06-19 15:00+00', 'group', 3, 'BC Place, Vancouver'),
  (team_id('HON'), team_id('BEL'), '2026-06-19 18:00+00', 'group', 3, 'BMO Field, Toronto'),
  (team_id('CAN'), team_id('BEL'), '2026-06-24 15:00+00', 'group', 3, 'BMO Field, Toronto'),
  (team_id('HON'), team_id('MAR'), '2026-06-24 15:00+00', 'group', 3, 'BC Place, Vancouver');

-- Gruppe D  (AT&T Stadium, Dallas / Levi's Stadium, San Francisco)
insert into matches (home_team_id, away_team_id, kickoff, stage, group_id, venue) values
  (team_id('ARG'), team_id('KOR'), '2026-06-14 21:00+00', 'group', 4, 'AT&T Stadium, Dallas'),
  (team_id('SRB'), team_id('NGA'), '2026-06-15 00:00+00', 'group', 4, 'Levi''s Stadium, San Francisco'),
  (team_id('ARG'), team_id('SRB'), '2026-06-19 21:00+00', 'group', 4, 'Levi''s Stadium, San Francisco'),
  (team_id('KOR'), team_id('NGA'), '2026-06-20 00:00+00', 'group', 4, 'AT&T Stadium, Dallas'),
  (team_id('ARG'), team_id('NGA'), '2026-06-24 21:00+00', 'group', 4, 'AT&T Stadium, Dallas'),
  (team_id('KOR'), team_id('SRB'), '2026-06-24 21:00+00', 'group', 4, 'Levi''s Stadium, San Francisco');

-- Gruppe E  (Lumen Field, Seattle / Rose Bowl, Los Angeles)
insert into matches (home_team_id, away_team_id, kickoff, stage, group_id, venue) values
  (team_id('ESP'), team_id('JPN'), '2026-06-15 15:00+00', 'group', 5, 'Rose Bowl, Los Angeles'),
  (team_id('CIV'), team_id('POL'), '2026-06-15 18:00+00', 'group', 5, 'Lumen Field, Seattle'),
  (team_id('ESP'), team_id('CIV'), '2026-06-20 15:00+00', 'group', 5, 'Lumen Field, Seattle'),
  (team_id('JPN'), team_id('POL'), '2026-06-20 18:00+00', 'group', 5, 'Rose Bowl, Los Angeles'),
  (team_id('ESP'), team_id('POL'), '2026-06-25 15:00+00', 'group', 5, 'Rose Bowl, Los Angeles'),
  (team_id('JPN'), team_id('CIV'), '2026-06-25 15:00+00', 'group', 5, 'Lumen Field, Seattle');

-- Gruppe F  (Mercedes-Benz Stadium, Atlanta / NRG Stadium, Houston)
insert into matches (home_team_id, away_team_id, kickoff, stage, group_id, venue) values
  (team_id('GER'), team_id('COL'), '2026-06-15 21:00+00', 'group', 6, 'Mercedes-Benz Stadium, Atlanta'),
  (team_id('ALG'), team_id('AUS'), '2026-06-16 00:00+00', 'group', 6, 'NRG Stadium, Houston'),
  (team_id('GER'), team_id('ALG'), '2026-06-20 21:00+00', 'group', 6, 'NRG Stadium, Houston'),
  (team_id('COL'), team_id('AUS'), '2026-06-21 00:00+00', 'group', 6, 'Mercedes-Benz Stadium, Atlanta'),
  (team_id('GER'), team_id('AUS'), '2026-06-25 21:00+00', 'group', 6, 'Mercedes-Benz Stadium, Atlanta'),
  (team_id('COL'), team_id('ALG'), '2026-06-25 21:00+00', 'group', 6, 'NRG Stadium, Houston');

-- Gruppe G  (Hard Rock Stadium, Miami / Lincoln Financial Field, Philadelphia)
insert into matches (home_team_id, away_team_id, kickoff, stage, group_id, venue) values
  (team_id('FRA'), team_id('CRC'), '2026-06-16 15:00+00', 'group', 7, 'Hard Rock Stadium, Miami'),
  (team_id('CRO'), team_id('TUN'), '2026-06-16 18:00+00', 'group', 7, 'Lincoln Financial Field, Philadelphia'),
  (team_id('FRA'), team_id('CRO'), '2026-06-21 15:00+00', 'group', 7, 'Lincoln Financial Field, Philadelphia'),
  (team_id('CRC'), team_id('TUN'), '2026-06-21 18:00+00', 'group', 7, 'Hard Rock Stadium, Miami'),
  (team_id('FRA'), team_id('TUN'), '2026-06-26 15:00+00', 'group', 7, 'Hard Rock Stadium, Miami'),
  (team_id('CRC'), team_id('CRO'), '2026-06-26 15:00+00', 'group', 7, 'Lincoln Financial Field, Philadelphia');

-- Gruppe H  (Arrowhead Stadium, Kansas City / Allegiant Stadium, Las Vegas)
insert into matches (home_team_id, away_team_id, kickoff, stage, group_id, venue) values
  (team_id('BRA'), team_id('TTO'), '2026-06-16 21:00+00', 'group', 8, 'Arrowhead Stadium, Kansas City'),
  (team_id('TUR'), team_id('RSA'), '2026-06-17 00:00+00', 'group', 8, 'Allegiant Stadium, Las Vegas'),
  (team_id('BRA'), team_id('TUR'), '2026-06-21 21:00+00', 'group', 8, 'Allegiant Stadium, Las Vegas'),
  (team_id('TTO'), team_id('RSA'), '2026-06-22 00:00+00', 'group', 8, 'Arrowhead Stadium, Kansas City'),
  (team_id('BRA'), team_id('RSA'), '2026-06-26 21:00+00', 'group', 8, 'Arrowhead Stadium, Kansas City'),
  (team_id('TTO'), team_id('TUR'), '2026-06-26 21:00+00', 'group', 8, 'Allegiant Stadium, Las Vegas');

-- Gruppe I  (Gillette Stadium, Boston / Q2 Stadium, Austin)
insert into matches (home_team_id, away_team_id, kickoff, stage, group_id, venue) values
  (team_id('ENG'), team_id('SEN'), '2026-06-17 15:00+00', 'group', 9, 'Gillette Stadium, Boston'),
  (team_id('SVK'), team_id('IRN'), '2026-06-17 18:00+00', 'group', 9, 'Q2 Stadium, Austin'),
  (team_id('ENG'), team_id('SVK'), '2026-06-22 15:00+00', 'group', 9, 'Q2 Stadium, Austin'),
  (team_id('SEN'), team_id('IRN'), '2026-06-22 18:00+00', 'group', 9, 'Gillette Stadium, Boston'),
  (team_id('ENG'), team_id('IRN'), '2026-06-27 15:00+00', 'group', 9, 'Gillette Stadium, Boston'),
  (team_id('SEN'), team_id('SVK'), '2026-06-27 15:00+00', 'group', 9, 'Q2 Stadium, Austin');

-- Gruppe J  (SoFi Stadium / Rose Bowl)
insert into matches (home_team_id, away_team_id, kickoff, stage, group_id, venue) values
  (team_id('NED'), team_id('NZL'), '2026-06-17 21:00+00', 'group', 10, 'Rose Bowl, Los Angeles'),
  (team_id('HUN'), team_id('CMR'), '2026-06-18 00:00+00', 'group', 10, 'SoFi Stadium, Los Angeles'),
  (team_id('NED'), team_id('HUN'), '2026-06-22 21:00+00', 'group', 10, 'SoFi Stadium, Los Angeles'),
  (team_id('NZL'), team_id('CMR'), '2026-06-23 00:00+00', 'group', 10, 'Rose Bowl, Los Angeles'),
  (team_id('NED'), team_id('CMR'), '2026-06-27 21:00+00', 'group', 10, 'SoFi Stadium, Los Angeles'),
  (team_id('NZL'), team_id('HUN'), '2026-06-27 21:00+00', 'group', 10, 'Rose Bowl, Los Angeles');

-- Gruppe K  (AT&T Stadium / Levi's Stadium)
insert into matches (home_team_id, away_team_id, kickoff, stage, group_id, venue) values
  (team_id('POR'), team_id('JOR'), '2026-06-18 15:00+00', 'group', 11, 'AT&T Stadium, Dallas'),
  (team_id('DEN'), team_id('UZB'), '2026-06-18 18:00+00', 'group', 11, 'Levi''s Stadium, San Francisco'),
  (team_id('POR'), team_id('DEN'), '2026-06-23 15:00+00', 'group', 11, 'Levi''s Stadium, San Francisco'),
  (team_id('JOR'), team_id('UZB'), '2026-06-23 18:00+00', 'group', 11, 'AT&T Stadium, Dallas'),
  (team_id('POR'), team_id('UZB'), '2026-06-28 15:00+00', 'group', 11, 'AT&T Stadium, Dallas'),
  (team_id('JOR'), team_id('DEN'), '2026-06-28 15:00+00', 'group', 11, 'Levi''s Stadium, San Francisco');

-- Gruppe L  (Mercedes-Benz Stadium / NRG Stadium)
insert into matches (home_team_id, away_team_id, kickoff, stage, group_id, venue) values
  (team_id('SUI'), team_id('IRQ'), '2026-06-18 21:00+00', 'group', 12, 'NRG Stadium, Houston'),
  (team_id('AUT'), team_id('KSA'), '2026-06-19 00:00+00', 'group', 12, 'Mercedes-Benz Stadium, Atlanta'),
  (team_id('SUI'), team_id('AUT'), '2026-06-23 21:00+00', 'group', 12, 'Mercedes-Benz Stadium, Atlanta'),
  (team_id('IRQ'), team_id('KSA'), '2026-06-24 00:00+00', 'group', 12, 'NRG Stadium, Houston'),
  (team_id('SUI'), team_id('KSA'), '2026-06-28 21:00+00', 'group', 12, 'NRG Stadium, Houston'),
  (team_id('IRQ'), team_id('AUT'), '2026-06-28 21:00+00', 'group', 12, 'Mercedes-Benz Stadium, Atlanta');

-- Aufräumen
drop function if exists team_id(text);
