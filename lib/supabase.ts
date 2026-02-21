import { createClient } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";

const SUPABASE_URL = "https://dauaftjvlpcmjppaaxds.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhdWFmdGp2bHBjbWpwcGFheGRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk0MTE5NzksImV4cCI6MjA4NDk4Nzk3OX0.SovTgH2Gzc6GvGju6Jp6LRkquW351kAvxUJDVWc-lDw";

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