# Masjid Prayer Display (Next.js + Supabase)

## Setup
1. `npm install`
2. Create a Supabase project, run `supabase/schema.sql`, then `supabase/themes-seed.sql` in the SQL editor (the seed is safe to re-run, and updates existing DBs to the new theme format).
3. Supabase > Authentication > Users: add an admin user (email + password).
4. `cp .env.example .env.local` and fill in the values.
5. `npm run dev`, then open:
   - `/display` (add `?layout=vertical|horizontal` and `&theme=haram|nabawi|aqsa|default|modern|geometric`)
   - `/admin/login`

## Deploy
Push to GitHub, import in Vercel, add the same env vars. `vercel.json` schedules
`/api/cron/prayer-times` daily (Aladhan API) to refresh athan times. Jumu'ah time is set manually in the `prayer_times` table.

## Notes
- Iqamah: `dynamic` = athan + offset, `static` = fixed_time. Only dynamic prayers generate automatic "iqamah at" ticker messages.
- Blackout: active from the iqamah time until 15 minutes after, for every prayer. Shows only the clock and prayer name, black background, theme accent color.
- Times are computed in the display device's timezone, so set it to the masjid's timezone.
- Themes: `/themes/*.json` (local fallback) or the `themes` table (`active = true` is the default when no `?theme=`). Set the active theme in Supabase.

## Theme photos
Your originals live in `assets-src/` (haram.jpg, nabawi.jpg, aqsa.jpg). `python3 scripts/prepare_photos.py` crops each into
`public/backgrounds/<theme>-horizontal.jpg` (1920x1080) and `<theme>-vertical.jpg` (1080x1920); the display picks the one matching its layout.
To use a better photo, replace the file in `assets-src/` and re-run the script (or drop finished files straight into `public/backgrounds/`).
Overlay patterns come from `python3 scripts/generate_assets.py`. Both scripts need Pillow (and numpy is not required).

Theme JSON extras beyond the base fields: `backgroundImageVertical`, `backgroundPosition`, `backgroundPositionVertical`, optional `gradient`.


## What's new: bilingual table, multi-screen admin, dynamic prayer-time source

### Display
- The prayer table now shows English names on the left, Arabic on the right, with Athan/Iqamah
  times inset toward the middle - the theme's photo stays visible on both sides of the panel.
- Rows use a translucent card (`bg-card/45`) and a translucent accent tint for the next prayer
  (`bg-accent/20`), instead of a solid fill, so the background photo is never fully covered.
- A **Jumu'ah** row is always shown at the bottom (every day, not only Fridays) with one fixed
  time and no countdown/highlight. Its time comes from the CSV's `jumua` column for that date if
  present, else the static time set on `/admin/iqamah` (default 1:10 PM).
- The "next athan/iqamah" countdown moved out of the middle of the screen into the bottom-left
  corner, above the announcements ticker, so the background is the focal point.
- The prayer table now floats as an inset panel to one side (right, on both layouts) rather than
  spanning full width.

### Multi-screen admin (`/admin/screens`)
Each screen has its own:
- **Layout** - horizontal or vertical, stored in `screens.layout`.
- **Prayer-time source** - `API` (nightly cron pulls from Aladhan using `PRAYER_LAT`/`PRAYER_LON`/
  `PRAYER_TIMEZONE`/`PRAYER_CALC_METHOD`) or `CSV` (upload a file, no cron writes for that screen),
  stored in `screens.mode`.
- **Theme** - chosen from a thumbnail grid (the six built-in themes, plus any custom theme saved
  in Supabase's `themes` table), stored in `screens.theme`. Because this is now per screen instead
  of a single global `themes.active` flag, different screens can show different themes at once.

Open a screen's live display at `/display/<screen id>` (linked from the admin page). The old
`/display?theme=...&layout=...` route still works for a quick preview with no screen selected.

### CSV upload format
```
date,fajr,dhuhr,asr,maghrib,isha,jumua
2026-01-05,05:40,12:53,16:10,18:53,20:07,13:10
2026-01-06,05:41,12:52,16:09,18:51,20:05,
```
`jumua` is optional - leave it blank to fall back to the static time on `/admin/iqamah`. Iqamah
times themselves are still computed as athan + offset (or a fixed time), unchanged from before;
the CSV/API only supplies athan times. If a date has no row, the display uses the most recent
earlier date rather than showing nothing.

### Database migration
Run **`supabase/schema-v2.sql`** after the original `schema.sql` (safe to re-run). It:
1. Creates the `screens` table and seeds one row from whatever theme is currently active.
2. Replaces the old single-row `prayer_times` (id, fajr, dhuhr, …) with a date-keyed table
   (`date` primary key, `fajr`…`isha`, `jumua`), copying today's existing values over first.
3. Updates the default Jumu'ah time from 1:30 PM to 1:10 PM (edit on `/admin/iqamah` if yours differs).

### Environment variables
`MASJID_LAT`/`MASJID_LON` are renamed to `PRAYER_LAT`/`PRAYER_LON` (the old names still work as a
fallback so existing deployments don't break) and a new `PRAYER_TIMEZONE` was added so the cron
job computes "today" correctly for the masjid's local time rather than the server's UTC day.

### Unchanged
The blackout screen, the theme CSS-variable system (`ThemeLoader`), announcement ticker, iqamah
offset/static settings, and Supabase auth on the admin panel all work exactly as before.
