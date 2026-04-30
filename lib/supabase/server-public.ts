import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente de Supabase para rutas públicas que NO requieren auth.
 * Usa la anon key. Las RLS policies deben permitir los queries.
 *
 * Diferencia con `createClient()` de /server: este NO lee cookies de sesión.
 * Apropiado para endpoints donde el invitado no está logueado.
 */
export function createClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    }
  );
}
