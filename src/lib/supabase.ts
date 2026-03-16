import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// 클라이언트 사이드 Supabase 클라이언트 (SSR 쿠키 기반)
export function createClient() {
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

// 기존 hooks 호환용 싱글톤 클라이언트
export const supabase = createSupabaseClient(supabaseUrl, supabaseAnonKey);

// 서버 사이드 Supabase 클라이언트 (Service Role)
export function createServerSupabase() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createSupabaseClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
