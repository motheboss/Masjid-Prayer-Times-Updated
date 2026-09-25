"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Ann { id: number; message: string; active: boolean }

export default function AnnouncementsAdmin() {
  const [items, setItems] = useState<Ann[]>([]);
  const [text, setText] = useState("");
  const [msg, setMsg] = useState("");

  const load = async () => {
    const { data } = await supabase.from("announcements").select("*").order("id", { ascending: false });
    setItems((data ?? []) as Ann[]);
  };
  useEffect(() => { load(); }, []);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim()) return;
    const { error } = await supabase.from("announcements").insert({ message: text.trim(), active: true });
    if (error) setMsg(error.message); else { setText(""); setMsg(""); load(); }
  }
  async function toggle(a: Ann) {
    await supabase.from("announcements").update({ active: !a.active }).eq("id", a.id);
    load();
  }
  async function remove(a: Ann) {
    await supabase.from("announcements").delete().eq("id", a.id);
    load();
  }

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-2xl font-semibold">Announcements</h1>
      <form onSubmit={add} className="flex gap-3">
        <input className="flex-1 rounded border p-3" placeholder="New announcement" value={text} onChange={(e) => setText(e.target.value)} />
        <button className="rounded bg-neutral-900 px-5 text-white">Add announcement</button>
      </form>
      {msg && <p role="alert" className="text-red-600">{msg}</p>}
      {items.length === 0 && <p className="text-neutral-600">No announcements yet. Add one above and it will scroll on the display.</p>}
      {items.map((a) => (
        <div key={a.id} className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm">
          <input type="checkbox" checked={a.active} onChange={() => toggle(a)} aria-label="Active" className="h-5 w-5" />
          <span className={`flex-1 ${a.active ? "" : "text-neutral-400 line-through"}`}>{a.message}</span>
          <button onClick={() => remove(a)} className="text-red-600">Delete</button>
        </div>
      ))}
    </div>
  );
}
