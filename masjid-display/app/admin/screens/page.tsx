"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { parseCsv, upsertCsvRows } from "@/lib/prayerTimes";
import { listLocalThemeMeta, ThemeMeta } from "@/lib/theme";
import type { Screen } from "@/lib/screens";

export default function ScreensAdmin() {
  const [screens, setScreens] = useState<Screen[]>([]);
  const [themes, setThemes] = useState<ThemeMeta[]>(listLocalThemeMeta());
  const [msg, setMsg] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<Record<string, boolean>>({});

  const load = async () => {
    const [s, custom] = await Promise.all([
      supabase.from("screens").select("*").order("created_at"),
      supabase.from("themes").select("name,json"),
    ]);
    setScreens((s.data ?? []) as Screen[]);
    const localIds = new Set(listLocalThemeMeta().map((t) => t.id));
    const extra = (custom.data ?? [])
      .filter((t) => !localIds.has(t.name))
      .map((t) => ({ id: t.name, name: (t.json as any)?.name ?? t.name, accent: (t.json as any)?.accent ?? "#999", background: (t.json as any)?.background ?? "#000" }));
    setThemes([...listLocalThemeMeta(), ...extra]);
  };
  useEffect(() => { load(); }, []);

  const patch = (id: string, p: Partial<Screen>) => setScreens((rs) => rs.map((r) => (r.id === id ? { ...r, ...p } : r)));
  const say = (id: string, text: string) => { setMsg((m) => ({ ...m, [id]: text })); setTimeout(() => setMsg((m) => ({ ...m, [id]: "" })), 3500); };

  async function save(s: Screen) {
    setBusy((b) => ({ ...b, [s.id]: true }));
    const { error } = await supabase.from("screens").update({ name: s.name, layout: s.layout, theme: s.theme, mode: s.mode }).eq("id", s.id);
    setBusy((b) => ({ ...b, [s.id]: false }));
    say(s.id, error ? `Could not save: ${error.message}` : "Saved. The display updates within a minute.");
  }

  async function addScreen() {
    const { data, error } = await supabase.from("screens").insert({ name: `Screen ${screens.length + 1}` }).select().single();
    if (error) return say("new", `Could not add screen: ${error.message}`);
    setScreens((rs) => [...rs, data as Screen]);
  }

  async function removeScreen(id: string) {
    if (!confirm("Delete this screen? Its saved layout/theme/mode will be lost.")) return;
    await supabase.from("screens").delete().eq("id", id);
    setScreens((rs) => rs.filter((r) => r.id !== id));
  }

  async function uploadCsv(id: string, file: File) {
    const text = await file.text();
    const { rows, errors } = parseCsv(text);
    if (errors.length) return say(id, `${errors.length} problem(s), e.g. "${errors[0]}"`);
    if (!rows.length) return say(id, "No valid rows found in that file.");
    const { error } = await upsertCsvRows(rows);
    say(id, error ? `Could not save: ${error.message}` : `Saved ${rows.length} day(s) of prayer times.`);
  }

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Screens</h1>
          <p className="mt-1 text-neutral-600">Each screen has its own layout, theme and prayer-time source.</p>
        </div>
        <button onClick={addScreen} className="rounded bg-neutral-900 px-4 py-2 text-white">Add screen</button>
      </div>

      {screens.map((s) => (
        <div key={s.id} className="flex flex-col gap-5 rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-3">
            <input className="rounded border p-2 font-semibold" value={s.name} onChange={(e) => patch(s.id, { name: e.target.value })} />
            <a href={`/display/${s.id}`} target="_blank" rel="noreferrer" className="text-sm text-blue-600 underline">Open display ↗</a>
            <button onClick={() => removeScreen(s.id)} className="ml-auto text-sm text-red-600">Delete screen</button>
          </div>

          {/* 1. Layout */}
          <div>
            <p className="mb-2 text-sm font-medium text-neutral-700">Layout</p>
            <div className="flex gap-2">
              {(["horizontal", "vertical"] as const).map((l) => (
                <button key={l} onClick={() => patch(s.id, { layout: l })}
                  className={`rounded-lg border px-4 py-2 capitalize ${s.layout === l ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300"}`}>
                  {l}
                </button>
              ))}
            </div>
          </div>

          {/* 2. Prayer times source */}
          <div>
            <p className="mb-2 text-sm font-medium text-neutral-700">Prayer times source</p>
            <div className="flex gap-2">
              {(["api", "csv"] as const).map((m) => (
                <button key={m} onClick={() => patch(s.id, { mode: m })}
                  className={`rounded-lg border px-4 py-2 ${s.mode === m ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300"}`}>
                  {m === "api" ? "API (Aladhan)" : "CSV upload"}
                </button>
              ))}
            </div>
            {s.mode === "api" ? (
              <p className="mt-2 text-sm text-neutral-500">
                Uses PRAYER_LAT, PRAYER_LON, PRAYER_TIMEZONE and PRAYER_CALC_METHOD (set in the environment) via the nightly cron job.
              </p>
            ) : (
              <div className="mt-2 flex items-center gap-3">
                <input type="file" accept=".csv,text/csv" onChange={(e) => e.target.files?.[0] && uploadCsv(s.id, e.target.files[0])} />
                <span className="text-sm text-neutral-500">date,fajr,dhuhr,asr,maghrib,isha,jumua</span>
              </div>
            )}
          </div>

          {/* 3. Theme */}
          <div>
            <p className="mb-2 text-sm font-medium text-neutral-700">Theme</p>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
              {themes.map((t) => (
                <button key={t.id} onClick={() => patch(s.id, { theme: t.id })}
                  className={`overflow-hidden rounded-xl border-2 text-left ${s.theme === t.id ? "border-neutral-900" : "border-transparent"}`}>
                  <div className="flex h-16 items-end p-2" style={{ background: t.thumbnail ? `url(${t.thumbnail}) center/cover` : t.background }}>
                    <span className="h-3 w-3 rounded-full" style={{ background: t.accent }} />
                  </div>
                  <p className="truncate bg-neutral-100 px-2 py-1 text-xs">{t.name}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => save(s)} disabled={busy[s.id]} className="rounded bg-neutral-900 px-5 py-2 text-white disabled:opacity-50">
              {busy[s.id] ? "Saving…" : "Save screen"}
            </button>
            {msg[s.id] && <p role="status" className="text-sm">{msg[s.id]}</p>}
          </div>
        </div>
      ))}
      {msg["new"] && <p role="alert" className="text-red-600">{msg["new"]}</p>}
    </div>
  );
}
