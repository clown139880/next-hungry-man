import { createClient } from "@supabase/supabase-js";
import { Database } from "./types";

const supabaseClient = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    realtime: {
      params: {
        eventsPerSecond: 1000,
      },
    },
  }
);

export default supabaseClient;
