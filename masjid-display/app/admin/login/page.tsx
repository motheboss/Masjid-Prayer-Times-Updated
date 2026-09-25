"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setError(error.message); else router.replace("/admin/iqamah");
  }

  return (
    <form onSubmit={submit} className="mx-auto mt-24 flex max-w-sm flex-col gap-4 rounded-xl bg-white p-8 shadow">
      <h1 className="text-2xl font-semibold">Admin sign in</h1>
      <input className="rounded border p-3" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input className="rounded border p-3" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      {error && <p role="alert" className="text-red-600">{error}</p>}
      <button disabled={busy} className="rounded bg-neutral-900 p-3 text-white disabled:opacity-50">{busy ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}
