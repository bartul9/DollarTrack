import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://lwkypiavkhqusiupukjk.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx3a3lwaWF2a2hxdXNpdXB1a2prIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgwNDg3NDMsImV4cCI6MjA3MzYyNDc0M30.9gZDe6Q1Xa-vBNCwXqSoIcPGi8mCCaN83ENmPiKs2cQ";

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Supabase environment variables are missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
