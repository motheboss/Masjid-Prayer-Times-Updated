import { supabase } from "@/lib/supabase";
import type { Layout } from "@/lib/theme";

export interface Screen {
  id: string;
  name: string;
  layout: Layout;
  theme: string;
  mode: "api" | "csv";
  created_at: string;
}

export async function fetchScreen(id: string) {
  return supabase.from("screens").select("*").eq("id", id).maybeSingle();
}
export async function fetchScreens() {
  return supabase.from("screens").select("*").order("created_at");
}
export async function fetchDefaultScreen() {
  return supabase.from("screens").select("*").order("created_at").limit(1).maybeSingle();
}
