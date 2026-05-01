import { NextRequest, NextResponse } from "next/server";
import { parseQuery } from "@/lib/landing-demo/parser";
import {
  lookupCache,
  applyToneToPreview,
  generateWithAI,
} from "@/lib/landing-demo/cache-lookup";
import {
  checkRateLimit,
  incrementRateLimit,
} from "@/lib/landing-demo/rate-limit";
import type { GeneratePreviewResponse } from "@/lib/landing-demo/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/landing/generate-preview
 * Body: { query: string, fingerprint?: string }
 *
 * Flow:
 *   1. Check rate limit (2 lifetime por IP+FP)
 *   2. Parse query (regex rápido + Haiku fallback)
 *   3. Lookup cache (top 10 destinos pre-generados)
 *   4. Si cache hit → aplicar tono → return
 *   5. Si cache miss → generar con Sonnet → return
 *   6. Incrementar rate limit counter
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const query = String(body?.query || "").trim();
    const fingerprint = body?.fingerprint
      ? String(body.fingerprint).substring(0, 200)
      : null;

    if (query.length < 2) {
      return NextResponse.json(
        { success: false, error: "Escribe a dónde quieres ir" } as GeneratePreviewResponse,
        { status: 400 }
      );
    }
    if (query.length > 300) {
      return NextResponse.json(
        { success: false, error: "Demasiado largo, sé más breve" } as GeneratePreviewResponse,
        { status: 400 }
      );
    }

    // 1. Detectar IP del request
    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      req.headers.get("x-real-ip") ||
      "unknown";

    // 2. Verificar rate limit ANTES de gastar tokens
    const rateLimitBefore = await checkRateLimit(ip, fingerprint);
    if (!rateLimitBefore.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: "limit_reached",
          rateLimit: rateLimitBefore,
        } as GeneratePreviewResponse,
        { status: 429 }
      );
    }

    // 3. Parsear query (regex barato + Haiku fallback ~$0.001)
    const parsed = await parseQuery(query);

    // 4. Si no entendimos un destino, devolvemos sugerencia sin gastar más tokens
    if (!parsed.destination) {
      return NextResponse.json(
        {
          success: false,
          error: "no_destination",
          parsed,
          rateLimit: rateLimitBefore,
        } as GeneratePreviewResponse,
        { status: 400 }
      );
    }

    // 5. Lookup cache primero (cubre top 10 = ~80% del tráfico, costo $0)
    let preview = await lookupCache(parsed.destination_normalized);

    // 6. Si no está en cache, generar con AI (costo ~$0.05)
    if (!preview) {
      preview = await generateWithAI(parsed);
    }

    if (!preview) {
      return NextResponse.json(
        {
          success: false,
          error: "generation_failed",
          parsed,
          rateLimit: rateLimitBefore,
        } as GeneratePreviewResponse,
        { status: 500 }
      );
    }

    // 7. Aplicar el tono (cambia header + reordena visibles, sin tokens extra)
    preview = applyToneToPreview(preview, parsed);

    // 8. Incrementar contador de rate limit (post-éxito)
    await incrementRateLimit(ip, fingerprint);

    const rateLimitAfter = {
      allowed: rateLimitBefore.remaining - 1 > 0,
      remaining: Math.max(0, rateLimitBefore.remaining - 1),
      total_used: rateLimitBefore.total_used + 1,
    };

    return NextResponse.json({
      success: true,
      preview,
      parsed,
      rateLimit: rateLimitAfter,
    } as GeneratePreviewResponse);
  } catch (err) {
    console.error("Generate preview error:", err);
    return NextResponse.json(
      { success: false, error: "Algo salió mal" } as GeneratePreviewResponse,
      { status: 500 }
    );
  }
}
