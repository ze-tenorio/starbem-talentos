import { createClient } from "@supabase/supabase-js";
import { ENV } from "./_core/env";

export function getSupabaseAdmin() {
  if (!ENV.supabaseUrl || !ENV.supabaseSecretKey) {
    throw new Error("SUPABASE_URL and SUPABASE_SECRET_KEY are required");
  }
  return createClient(ENV.supabaseUrl, ENV.supabaseSecretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export async function verifySupabaseToken(token: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}
