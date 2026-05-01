import { createClient } from "@supabase/supabase-js";
import { createHash } from "crypto";
import type { RateLimitStatus } from "./types";

const LIFETIME_LIMIT = 2;

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

/**
 * Hash de una string para almacenamiento (privacidad: no guardamos IPs en claro).
 */
export function hashString(input: string): string {
  return createHash("sha256").update(input).digest("hex").substring(0, 32);
}

/**
 * Verifica si la IP+fingerprint puede generar.
 * Devuelve { allowed, remaining, total_used }.
 *
 * NO incrementa el contador — eso se hace después del éxito con `incrementRateLimit`.
 */
export async function checkRateLimit(
  ip: string,
  fingerprint: string | null
): Promise<RateLimitStatus> {
  const ipHash = hashString(ip || "unknown");
  const fpHash = fingerprint ? hashString(fingerprint) : "no_fp";

  const supabase = getServiceClient();

  const { data } = await supabase
    .from("landing_demo_rate_limit")
    .select("generation_count")
    .eq("ip_hash", ipHash)
    .eq("fingerprint", fpHash)
    .maybeSingle();

  const used = data?.generation_count || 0;
  const remaining = Math.max(0, LIFETIME_LIMIT - used);

  return {
    allowed: remaining > 0,
    remaining,
    total_used: used,
  };
}

/**
 * Incrementa el contador después de una generación exitosa.
 * Idempotente: si no existe el registro, lo crea.
 */
export async function incrementRateLimit(
  ip: string,
  fingerprint: string | null
): Promise<void> {
  const ipHash = hashString(ip || "unknown");
  const fpHash = fingerprint ? hashString(fingerprint) : "no_fp";

  const supabase = getServiceClient();

  // Upsert: si existe, +1; si no, crea con count=1
  const { data: existing } = await supabase
    .from("landing_demo_rate_limit")
    .select("id, generation_count")
    .eq("ip_hash", ipHash)
    .eq("fingerprint", fpHash)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("landing_demo_rate_limit")
      .update({
        generation_count: (existing.generation_count || 0) + 1,
        last_generation_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
  } else {
    await supabase.from("landing_demo_rate_limit").insert({
      ip_hash: ipHash,
      fingerprint: fpHash,
      generation_count: 1,
    });
  }
}
