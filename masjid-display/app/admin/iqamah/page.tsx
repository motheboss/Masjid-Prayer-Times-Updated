"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { IqamahSetting } from "@/lib/time";

type Row = IqamahSetting & { id: number };
const ORDER = ["fajr", "dhuhr", "asr", "maghrib", "isha", "jumuah"];

export default function IqamahAdmin() {
  const [rows, setRows] = useState<Row[]>([]);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    supabase.from("iqamah_settings").select("*").then(({ data }) =>
      setRows(((data ?? []) as Row[]).sort((a, b) => ORDER.indexOf(a.prayer_name) - ORDER.indexOf(b.prayer_name))));
  }, []);

  const patch = (id: number, p: Partial<Row>) => setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...p } : r)));

  async function save(r: Row) {
    // Static mode with no fixed time would silently fall back to the offset calculation,
    // which can leave iqamah showing at (or right after) athan without any warning. Block that.
    if (r.mode === "static" && !r.fixed_time) {
      setMsg(`${r.prayer_name}: set a fixed time before saving static mode.`);
      return;
    }
    const { error } = await supabase.from("iqamah_settings").update({
      offset_minutes: r.offset_minutes, fixed_time: r.fixed_time || null, mode: r.mode,
    }).eq("id", r.id);
    setMsg(error ? `Could not save ${r.prayer_name}: ${error.message}` : `Saved ${r.prayer_name}`);
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Iqamah settings</h1>
      <p className="text-neutral-600">Dynamic: iqamah = athan + offset. Static: iqamah = fixed time.</p>
      {rows.map((r) => (
        <div key={r.id} className="grid grid-cols-[6rem_1fr_1fr_1fr_auto] items-end gap-3 rounded-xl bg-white p-4 shadow-sm">
          <strong className="capitalize">{r.prayer_name}</strong>
          <label className="flex flex-col text-sm">Mode
            <select className="rounded border p-2" value={r.mode} onChange={(e) => patch(r.id, { mode: e.target.value as Row["mode"] })}>
              <option value="dynamic">Dynamic</option><option value="static">Static</option>
            </select>
          </label>
          <label className="flex flex-col text-sm">Offset (min)
            <input type="number" className="rounded border p-2 disabled:bg-neutral-100" disabled={r.mode !== "dynamic"}
              value={r.offset_minutes} onChange={(e) => patch(r.id, { offset_minutes: Number(e.target.value) })} />
          </label>
          <label className="flex flex-col text-sm">Fixed time
            <input type="time" className="rounded border p-2 disabled:bg-neutral-100" disabled={r.mode !== "static"}
              value={(r.fixed_time ?? "").slice(0, 5)} onChange={(e) => patch(r.id, { fixed_time: e.target.value })} />
          </label>
          <button onClick={() => save(r)} className="rounded bg-neutral-900 px-4 py-2 text-white">Save</button>
        </div>
      ))}
      {msg && <p role="status">{msg}</p>}
    </div>
  );
}
