-- ============================================================
-- WM 2026 Tippspiel – Einladungscode
-- Einmalig im Supabase SQL Editor ausführen
-- ============================================================

-- Einstellungen-Tabelle (Key-Value)
create table if not exists settings (
  key   text primary key,
  value text not null
);

-- Zufälligen 8-stelligen Einladungscode anlegen
insert into settings (key, value)
values ('invite_code', upper(substring(md5(random()::text), 1, 8)))
on conflict do nothing;

-- RLS: nur Admins können settings lesen/schreiben
alter table settings enable row level security;

create policy "Admins can read settings"
  on settings for select
  using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));

create policy "Admins can update settings"
  on settings for update
  using (exists (select 1 from profiles where id = auth.uid() and is_admin = true));

-- Öffentliche Funktion: Code prüfen (ohne Login aufrufbar)
create or replace function verify_invite_code(p_code text)
returns boolean language sql security definer as $$
  select exists (
    select 1 from settings
    where key = 'invite_code' and value = upper(trim(p_code))
  )
$$;
