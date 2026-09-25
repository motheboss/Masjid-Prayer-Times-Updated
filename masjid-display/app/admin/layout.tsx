"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const router = useRouter();
  const isLogin = path === "/admin/login";
  const [ready, setReady] = useState(isLogin);

  useEffect(() => {
    if (isLogin) { setReady(true); return; }
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.replace("/admin/login"); else setReady(true);
    });
  }, [isLogin, router]);

  if (!ready) return null;
  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 font-sans">
      {!isLogin && (
        <nav className="flex items-center gap-6 border-b bg-white px-6 py-4">
          <strong>Masjid admin</strong>
          <Link href="/admin/iqamah" className={path === "/admin/iqamah" ? "font-semibold underline" : ""}>Iqamah</Link>
          <Link href="/admin/announcements" className={path === "/admin/announcements" ? "font-semibold underline" : ""}>Announcements</Link>
          <Link href="/admin/screens" className={path === "/admin/screens" ? "font-semibold underline" : ""}>Screens</Link>
          <Link href="/display" className="ml-auto text-neutral-600">View display</Link>
          <button className="text-neutral-600" onClick={async () => { await supabase.auth.signOut(); router.replace("/admin/login"); }}>Sign out</button>
        </nav>
      )}
      <main className="mx-auto max-w-3xl p-6">{children}</main>
    </div>
  );
}
