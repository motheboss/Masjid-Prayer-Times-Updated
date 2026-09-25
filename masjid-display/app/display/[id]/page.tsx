"use client";
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import DisplayClient from "@/components/DisplayClient";
import type { Layout } from "@/lib/theme";

/** /display/<screen id> - loads that screen's layout, theme and prayer-time mode from
 *  Supabase (set on /admin/screens). ?layout=... or ?theme=... on the URL still override
 *  the saved values, useful for previewing a change before saving it. */
export default function ScreenDisplayPage() {
  const { id } = useParams<{ id: string }>();
  const search = useSearchParams();
  const [url, setUrl] = useState<string | null>(null);
  const [layout, setLayout] = useState<Layout | null>(null);

  useEffect(() => {
    const params = new URLSearchParams({ screen: id });
    const theme = search.get("theme"); if (theme) params.set("theme", theme);
    const l = search.get("layout");
    if (l === "vertical" || l === "horizontal") { params.set("layout", l); setLayout(l); }
    setUrl(`/api/display?${params}`);
  }, [id, search]);

  if (!url) return null;
  return <DisplayClient apiUrl={url} layoutOverride={layout} />;
}
