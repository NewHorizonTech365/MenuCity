import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const cleanEnv = (value: string | undefined) =>
  (value ?? "").trim().replace(/^['"]|['"]$/g, "").replace(/;$/, "");

const SUPABASE_URL = cleanEnv(process.env.EXPO_PUBLIC_SUPABASE_URL);
const SUPABASE_ANON_KEY = cleanEnv(process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error(
    "Missing Supabase env vars: EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY"
  );
}

try {
  const parsed = new URL(SUPABASE_URL);
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error("Invalid protocol");
  }
} catch {
  throw new Error(
    "Invalid EXPO_PUBLIC_SUPABASE_URL format. Use: https://your-project.supabase.co"
  );
}

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      storage: AsyncStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
    },
  }
);
