/**
 * Script de pre-generación de cache para top 10 destinos.
 *
 * Uso:
 *   npx tsx scripts/seed-landing-demo-cache.ts
 *
 * Costo: ~10 llamadas a Sonnet × ~$0.05 USD = ~$0.50 USD total.
 *
 * Variables de entorno requeridas:
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY
 *   - ANTHROPIC_API_KEY
 */

// Carga vars desde .env.local antes de cualquier import
import { readFileSync } from "fs";
import { resolve } from "path";
try {
  const envFile = readFileSync(resolve(process.cwd(), ".env.local"), "utf8");
  for (const line of envFile.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.slice(0, eqIdx).trim();
    const val = trimmed.slice(eqIdx + 1).trim();
    if (key && !process.env[key]) process.env[key] = val;
  }
} catch { /* no .env.local — vars deben venir del entorno */ }
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@supabase/supabase-js";

const TOP_DESTINATIONS = [
  { key: "tulum", display: "Tulum", days: 5, emoji: "🐢" },
  { key: "oaxaca", display: "Oaxaca", days: 5, emoji: "🌽" },
  { key: "cdmx", display: "CDMX", days: 4, emoji: "🌆" },
  { key: "san_miguel", display: "San Miguel de Allende", days: 4, emoji: "🏛️" },
  { key: "cancun", display: "Cancún", days: 6, emoji: "🌊" },
  { key: "merida", display: "Mérida", days: 5, emoji: "🦩" },
  { key: "sayulita", display: "Sayulita", days: 5, emoji: "🏄" },
  { key: "bacalar", display: "Bacalar", days: 4, emoji: "💎" },
  { key: "puerto_escondido", display: "Puerto Escondido", days: 5, emoji: "🌅" },
  { key: "holbox", display: "Holbox", days: 4, emoji: "🦈" },
];

const SYSTEM_PROMPT = `Eres Voyaa, una app que arma viajes para mexicanos.
Genera un preview de viaje en JSON estricto. Lugares REALES del destino, NUNCA inventados.

REGLAS:
1. Genera EXACTAMENTE 13 actividades:
   - 5 visibles con detalle completo
   - 8 blureadas (solo teaser)
2. Las 5 visibles deben balancearse: 1 cultura, 1 comida, 1 outdoor, 1 hidden gem, 1 nightlife/atardecer.
3. Las 8 blureadas son LAS MÁS aspiracionales y específicas (cenas con vista, playas secretas, lugares con nombre real, experiencias únicas).
4. Costos en MXN realistas para mercado mexicano (no inflar precios gringos).
5. Categorías permitidas: "culture", "food", "outdoor", "hidden_gem", "nightlife", "shopping", "wellness".
6. highlight_label opcional: "Hidden gem ✦", "Local favorito ✦", "Romántico ✦", "Imperdible ✦", null.
7. Responde SOLO con JSON válido, sin markdown, sin explicación.

Schema:
{
  "trip_summary": "5 días · ~$8,500 MXN",
  "total_estimated_cost": 8500,
  "visible_activities": [
    {
      "id": "v1",
      "name": "string",
      "category": "string",
      "emoji": "string",
      "description": "1-2 líneas en español",
      "location_hint": "string|null",
      "estimated_cost": number,
      "duration_minutes": number,
      "highlight_label": "string|null"
    }
  ],
  "blurred_activities": [
    {
      "id": "b1",
      "category": "string",
      "emoji": "string",
      "teaser": "frase corta en español",
      "highlight_label": "string|null"
    }
  ]
}`;

async function generateForDestination(
  client: Anthropic,
  dest: typeof TOP_DESTINATIONS[number]
) {
  console.log(`🌴 Generando ${dest.display}...`);

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 3000,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Genera el preview para ${dest.display}, ${dest.days} días, viaje típico para mexicano de 25-40 años.`,
      },
    ],
  });

  const text = response.content
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("");
  const cleaned = text.replace(/```json|```/g, "").trim();
  const parsed = JSON.parse(cleaned);

  // Validación básica
  if (
    !Array.isArray(parsed.visible_activities) ||
    parsed.visible_activities.length !== 5 ||
    !Array.isArray(parsed.blurred_activities) ||
    parsed.blurred_activities.length !== 8
  ) {
    throw new Error(
      `Invalid response for ${dest.display}: expected 5 visible + 8 blurred`
    );
  }

  return {
    destination_key: dest.key,
    destination_display: dest.display,
    duration_days: dest.days,
    trip_emoji: dest.emoji,
    trip_summary: parsed.trip_summary,
    total_estimated_cost: parsed.total_estimated_cost,
    visible_activities: parsed.visible_activities,
    blurred_activities: parsed.blurred_activities,
  };
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error("Falta ANTHROPIC_API_KEY en .env");
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    throw new Error("Falta NEXT_PUBLIC_SUPABASE_URL en .env");
  }
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Falta SUPABASE_SERVICE_ROLE_KEY en .env");
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );

  console.log(`\n📦 Pre-generando ${TOP_DESTINATIONS.length} destinos...\n`);

  let success = 0;
  let failed = 0;

  for (const dest of TOP_DESTINATIONS) {
    try {
      const generated = await generateForDestination(client, dest);

      // Upsert en la DB
      const { error } = await supabase
        .from("landing_demo_cache")
        .upsert(generated, { onConflict: "destination_key" });

      if (error) {
        console.error(`❌ Error guardando ${dest.display}:`, error.message);
        failed++;
      } else {
        console.log(
          `✅ ${dest.display} guardado (${generated.visible_activities.length} visibles + ${generated.blurred_activities.length} blureadas)`
        );
        success++;
      }
    } catch (e: any) {
      console.error(`❌ Error generando ${dest.display}:`, e.message);
      failed++;
    }
  }

  console.log(`\n🎉 Done. Éxitos: ${success} / Fallos: ${failed}`);
  console.log(`💰 Costo aprox: $${(success * 0.05).toFixed(2)} USD\n`);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
