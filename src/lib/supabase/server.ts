import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies(); // ✅ await 추가

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 디버깅 로그
  if (process.env.NODE_ENV === "development") {
    console.log("[DEBUG_SUPABASE ENV]", {
      NEXT_PUBLIC_SUPABASE_URL: supabaseUrl ? `${supabaseUrl.substring(0, 30)}...` : "[MISSING]",
      NEXT_PUBLIC_SUPABASE_ANON_KEY: supabaseKey ? "[OK]" : "[MISSING]",
    });
  }

  if (!supabaseUrl || !supabaseKey) {
    const missing = [];
    if (!supabaseUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL");
    if (!supabaseKey) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
    throw new Error(
      `Supabase environment variables are not configured. Missing: ${missing.join(", ")}. Please set these in your .env.local file.`
    );
  }

  return createServerClient(
    supabaseUrl,
    supabaseKey, // ⚠️ SERVICE_ROLE_KEY 대신 ANON_KEY 권장
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component에서 호출 시 무시 가능
          }
        },
      },
    }
  );
}
