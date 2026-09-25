"use client";
import { useEffect, useState } from "react";
import DisplayClient from "@/components/DisplayClient";
import type { Layout } from "@/lib/theme";

/** /display?layout=vertical|horizontal&theme=haram|nabawi|aqsa|default|modern|geometric
 *  A screen-less preview: theme/layout come from the URL, falling back to whichever
 *  theme is marked `active` in Supabase. For a real screen with its own saved layout,
 *  theme and prayer-time source, use /display/[id] (see /admin/screens for the link). */
export default function DisplayPage() {
  const [url, setUrl] = useState<string | null>(null);
  const [layout, setLayout] = useState<Layout | null>(null);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const params = new URLSearchParams();
    if (q.get("theme")) params.set("theme", q.get("theme")!);
    const l = q.get("layout");
    if (l === "vertical" || l === "horizontal") { params.set("layout", l); setLayout(l); }
    setUrl(`/api/display${params.toString() ? `?${params}` : ""}`);
  }, []);

  if (!url) return null;
  return <DisplayClient apiUrl={url} layoutOverride={layout} />;
}
