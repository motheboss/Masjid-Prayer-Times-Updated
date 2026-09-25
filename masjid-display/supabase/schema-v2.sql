-- Run after schema.sql + themes-seed.sql. Safe to re-run.
-- Adds: multi-screen support (screens table), a date-keyed prayer_times
-- calendar (so CSV upload and API mode both feed the same table), and
-- moves theme selection from the old `themes.active` flag to a per-screen
-- `screens.theme` column so different screens can show different themes
-- at the same time.

-- ---------- screens ----------
create table if not exists screens (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Main display',
  layout text not null default 'horizontal' check (layout in ('horizontal', 'vertical')),
  theme text not null default 'default',
  mode text not null default 'api' check (mode in ('api', 'csv')),
  created_at timestamptz not null default now()
);
insert into screens (name, layout, theme, mode)
  select 'Main display', 'horizontal',
    coalesce((select name from themes where active limit 1), 'default'), 'api'
  where not exists (select 1 from screens);

-- ---------- prayer_times: move from one static row to one row per date ----------
-- date,fajr,dhuhr,asr,maghrib,isha,jumua  (jumua kept optional: falls back to the
-- static Jumu'ah time set on /admin/iqamah when a date has no jumua value)
create table if not exists prayer_times_new (
  date date primary key,
  fajr text not null,
  dhuhr text not null,
  asr text not null,
  maghrib text not null,
  isha text not null,
  jumua text,
  created_at timestamptz not null default now()
);
insert into prayer_times_new (date, fajr, dhuhr, asr, maghrib, isha, jumua)
  select current_date, fajr, dhuhr, asr, maghrib, isha, jumuah from prayer_times where id = 1
  on conflict (date) do nothing;
drop table if exists prayer_times;
alter table prayer_times_new rename to prayer_times;

alter table screens enable row level security;
alter table prayer_times enable row level security;
create policy "public read" on screens for select using (true);
create policy "admin write" on screens for all to authenticated using (true) with check (true);
create policy "public read" on prayer_times for select using (true);
create policy "admin write" on prayer_times for all to authenticated using (true) with check (true);

-- Jumu'ah default is now 1:10 PM (was 1:30 PM)
update iqamah_settings set fixed_time = '13:10' where prayer_name = 'jumuah';
