create table if not exists prayer_times (
  id int primary key default 1,
  fajr text not null default '05:30',
  dhuhr text not null default '12:30',
  asr text not null default '15:45',
  maghrib text not null default '18:00',
  isha text not null default '19:30',
  jumuah text not null default '13:00',
  updated_at timestamptz default now()
);

create table if not exists iqamah_settings (
  id serial primary key,
  prayer_name text unique not null,          -- fajr | dhuhr | asr | maghrib | isha | jumuah
  offset_minutes int not null default 10,
  fixed_time time,
  mode text not null default 'dynamic' check (mode in ('dynamic','static'))
);

create table if not exists announcements (
  id serial primary key,
  message text not null,
  active boolean not null default true
);

create table if not exists themes (
  id serial primary key,
  name text unique not null,
  json jsonb not null,
  active boolean not null default false      -- extra column: which theme the display uses
);

insert into prayer_times (id) values (1) on conflict do nothing;
insert into iqamah_settings (prayer_name, offset_minutes, mode) values
  ('fajr',20,'dynamic'),('dhuhr',10,'dynamic'),('asr',10,'dynamic'),
  ('maghrib',5,'dynamic'),('isha',15,'dynamic'),('jumuah',0,'static')
on conflict do nothing;
update iqamah_settings set fixed_time = '13:30' where prayer_name = 'jumuah';

-- Themes are seeded by supabase/themes-seed.sql

-- Row level security: public read (display screen), authenticated write (admins)
alter table prayer_times enable row level security;
alter table iqamah_settings enable row level security;
alter table announcements enable row level security;
alter table themes enable row level security;

do $$ declare t text; begin
  foreach t in array array['prayer_times','iqamah_settings','announcements','themes'] loop
    execute format('create policy "public read" on %I for select using (true)', t);
    execute format('create policy "admin write" on %I for all to authenticated using (true) with check (true)', t);
  end loop;
end $$;
