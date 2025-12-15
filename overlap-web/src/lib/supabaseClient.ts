import { createClient } from "@supabase/supabase-js";

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL || "https://example.supabase.co";
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "public-anon-key";

// TODO: Replace fallback values with real env vars before production use.
export const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);




