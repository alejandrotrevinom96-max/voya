import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";
import type {
  DemoTripPreview,
  ParsedQuery,
  VisibleActivity,
  BlurredActivity,
} from "./types";
import { normalizeDestinationKey } from "./parser";

function getServiceClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

// Headers / etiquetas según tono
const TONE_HEADERS: Record<string, string> = {
  reset: "Reset",
  celebration: "Celebración",
  social: "Con tu gente",
  default: "Aventura",
};

/**
 * Busca el viaje en el cache. Devuelve null si no hay match.
 * Si hay match, también incrementa el hit_count.
 */
export async function lookupCache(
  destinationKey: string
): Promise<DemoTripPreview | null> {
  if (!destinationKey) return null;

  const supabase = getServiceClient();

  const { data, error } = await supabase
    .from("landing_demo_cache")
    .select("*")
    .eq("destination_key", destinationKey)
    .maybeSingle();

  if (error || !data) return null;

  // Incrementar hit_count en background (no esperamos)
  supabase
    .from("landing_demo_cache")
    .update({
      hit_count: (data.hit_count || 0) + 1,
      last_hit_at: new Date().toISOString(),
    })
    .eq("id", data.id)
    .then(() => {});

  return {
    destination_key: data.destination_key,
    destination_display: data.destination_display,
    duration_days: data.duration_days,
    trip_emoji: data.trip_emoji,
    trip_summary: data.trip_summary,
    total_estimated_cost: data.total_estimated_cost,
    visible_activities: data.visible_activities as VisibleActivity[],
    blurred_activities: data.blurred_activities as BlurredActivity[],
    served_from_cache: true,
  };
}

/**
 * Aplica el "tono" al cache hit:
 * - Cambia el header del trip ("Reset", "Celebración", etc.)
 * - Reordena las visibles para que la primera sea más afín al tono
 * - NO cambia las actividades (eso costaría tokens extra)
 */
export function applyToneToPreview(
  preview: DemoTripPreview,
  parsed: ParsedQuery
): DemoTripPreview {
  const tone = parsed.tone_hint || "default";
  const toneHeader = TONE_HEADERS[tone];

  // Si el tono es "default", no cambiamos nada
  if (tone === "default") return { ...preview, tone_hint: tone };

  // Cambiar el summary para incluir el header de tono
  const newSummary = preview.trip_summary.includes("·")
    ? preview.trip_summary.replace(
        /^([^·]+·\s*\d+\s*d[ií]as?)/,
        `$1 · ${toneHeader}`
      )
    : `${toneHeader} · ${preview.trip_summary}`;

  // Reordenar visibles según afinidad con el tono
  const reordered = [...preview.visible_activities].sort((a, b) => {
    const aScore = scoreActivityForTone(a, tone);
    const bScore = scoreActivityForTone(b, tone);
    return bScore - aScore;
  });

  return {
    ...preview,
    trip_summary: newSummary,
    visible_activities: reordered,
    tone_hint: tone,
  };
}

function scoreActivityForTone(
  activity: VisibleActivity,
  tone: string
): number {
  const cat = activity.category.toLowerCase();
  if (tone === "reset") {
    if (/(yoga|spa|playa|retiro|meditac|amanecer|wellness|hidden_gem)/.test(cat)) return 3;
    if (/(nightlife|party|fiesta)/.test(cat)) return -2;
    return 0;
  }
  if (tone === "celebration") {
    if (/(nightlife|food|romantic|cena|rooftop)/.test(cat)) return 3;
    return 0;
  }
  if (tone === "social") {
    if (/(food|nightlife|outdoor|tour)/.test(cat)) return 3;
    if (/(spa|yoga|solo)/.test(cat)) return -1;
    return 0;
  }
  return 0;
}

/**
 * Genera un viaje con Claude Sonnet cuando NO está en cache.
 * Más costoso (~$0.05 USD por llamada) — usar como fallback.
 */
export async function generateWithAI(
  parsed: ParsedQuery
): Promise<DemoTripPreview | null> {
  if (!parsed.destination) return null;

  const client = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY!,
  });

  const duration = parsed.duration_days || 5;
  const tone = parsed.tone_hint || "default";

  const systemPrompt = `Eres Voyaa, una app que arma viajes para mexicanos. Genera un preview de viaje en JSON estricto.

CONTEXTO:
- Destino: ${parsed.destination}
- Duración: ${duration} días
- Tono: ${tone}
- Contexto del usuario: ${parsed.context || "(no especificado)"}

REGLAS:
1. Genera EXACTAMENTE 13 actividades visibles con detalle completo (blurred_activities SIEMPRE vacío []).
2. Distribución: 3 cultura/historia, 3 comida (calle+mid+fine), 3 outdoor/naturaleza, 2 nightlife/atardecer, 2 hidden gems.
3. Costos en MXN realistas para el mercado mexicano.
4. NO inventes lugares — usa lugares reales del destino.
5. Responde SOLO con JSON válido, sin markdown, sin explicación.

Schema:
{
  "trip_emoji": "🌴",
  "trip_summary": "5 días · ~$8,500 MXN",
  "total_estimated_cost": 8500,
  "visible_activities": [
    {
      "id": "1",
      "name": "Cenote Dos Ojos",
      "category": "outdoor",
      "emoji": "🌿",
      "description": "Snorkel en cenote cristalino, ideal por la mañana.",
      "location_hint": "Carretera Tulum-Cobá km 16",
      "estimated_cost": 400,
      "duration_minutes": 180,
      "highlight_label": null
    }
  ],
  "blurred_activities": []
}`;

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2500,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: `Genera el preview para ${parsed.destination}, ${duration} días.`,
        },
      ],
    });

    const text = response.content
      .map((b) => (b.type === "text" ? b.text : ""))
      .join("");
    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed_response = JSON.parse(cleaned);

    return {
      destination_key: normalizeDestinationKey(parsed.destination),
      destination_display: parsed.destination,
      duration_days: duration,
      trip_emoji: parsed_response.trip_emoji || "✈️",
      trip_summary: parsed_response.trip_summary,
      total_estimated_cost: parsed_response.total_estimated_cost,
      visible_activities: parsed_response.visible_activities,
      blurred_activities: parsed_response.blurred_activities,
      tone_hint: tone,
      served_from_cache: false,
    };
  } catch (e) {
    console.error("AI generation failed:", e);
    return null;
  }
}
