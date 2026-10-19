import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/lib/site";

// Client Supabase côté serveur (Server Components, Server Actions, Route Handlers).
// Lit/écrit la session via les cookies Next.js — remplace le storageKey 'cai-auth'
// de localStorage utilisé par l'ancien SPA (love20/index.html).
export async function supabaseServer() {
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
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
          // Appelé depuis un Server Component (lecture seule) : le proxy
          // rafraîchit déjà la session sur chaque requête, donc on ignore.
        }
      },
    },
  });
}
