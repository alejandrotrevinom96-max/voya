import Anthropic from "@anthropic-ai/sdk";
import type { ParsedQuery } from "./types";

// Lista de destinos que tenemos en cache (top 10 + variaciones)
// Cada entry: { keys que matchean, display, key normalizada para cache }
const KNOWN_DESTINATIONS: Array<{
  match: RegExp;
  display: string;
  key: string;
}> = [
  { match: /\btulum\b/i, display: "Tulum", key: "tulum" },
  { match: /\boaxaca\b/i, display: "Oaxaca", key: "oaxaca" },
  { match: /\b(cdmx|ciudad de m[eé]xico|mexico city|df)\b/i, display: "CDMX", key: "cdmx" },
  { match: /\b(san miguel|sma|san miguel de allende)\b/i, display: "San Miguel de Allende", key: "san_miguel" },
  { match: /\bcanc[uú]n\b/i, display: "Cancún", key: "cancun" },
  { match: /\bm[eé]rida\b/i, display: "Mérida", key: "merida" },
  { match: /\bsayulita\b/i, display: "Sayulita", key: "sayulita" },
  { match: /\bbacalar\b/i, display: "Bacalar", key: "bacalar" },
  { match: /\b(puerto escondido|po)\b/i, display: "Puerto Escondido", key: "puerto_escondido" },
  { match: /\bholbox\b/i, display: "Holbox", key: "holbox" },
];

// Detección de duración por keywords
const DURATION_PATTERNS: Array<{ match: RegExp; days: number }> = [
  { match: /\b(fin de semana|finde|weekend)\b/i, days: 2 },
  { match: /\b(\d+)\s*d[ií]as?\b/i, days: 0 }, // captura el número
  { match: /\buna semana\b/i, days: 7 },
  { match: /\bsemana\b/i, days: 7 },
  { match: /\b(\d+)\s*noches?\b/i, days: 0 },
];

// Tono por contexto detectado
function detectTone(context: string | null): string {
  if (!context) return "default";
  const lower = context.toLowerCase();

  // Reset / transición de vida
  if (
    /\b(divorci|separ|sola|solita|empezar de nuevo|reset|resetear|crisis|me siento perdid|recientemente|cero|de nuevo)\b/.test(lower) ||
    /\b(cumple|cumplo)\s+(30|40|50)\b/.test(lower)
  ) {
    if (/\b(divorci|separ|crisis|perdid|reset)\b/.test(lower)) return "reset";
  }

  // Celebración
  if (
    /\b(cumpl|aniversari|gradu[aé]|aprob|asens|despedida|titul|recibi|terminé|terminar|festejar)\b/.test(lower)
  ) {
    return "celebration";
  }

  // Social / con grupo
  if (
    /\b(amig|novi|esposo|esposa|pareja|mi mam[aá]|mi pap[aá]|mi hermana?|familia|hijos?)\b/.test(lower)
  ) {
    return "social";
  }

  // Frustración / escape
  if (
    /\b(no aguanto|cansad|harta|hart[oóa]|trabajar|trabajo|junta|aburrida?|reni|deprim)\b/.test(lower)
  ) {
    return "reset";
  }

  return "default";
}

function detectGroupSize(input: string): string | null {
  const lower = input.toLowerCase();
  if (/\b(amig[oa]s?|amigues|grupo)\b/.test(lower)) return "friends";
  if (/\b(novi[oa]|esposo|esposa|pareja|con [eé]l|con ella)\b/.test(lower)) return "couple";
  if (/\b(mam[aá]|pap[aá]|familia|hijos?|hermana?o?s?)\b/.test(lower)) return "family";
  if (/\b(sola?|solit[ao]|solo|por mi cuenta)\b/.test(lower)) return "alone";
  return null;
}

/**
 * Parser rápido vía regex (sin llamar a la API).
 * Cubre el 90% de los casos. Para los demás, fallback a Claude Haiku.
 */
function regexParse(input: string): ParsedQuery | null {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      destination: null,
      destination_normalized: "",
      duration_days: null,
      context: null,
      tone_hint: "default",
      group_size_hint: null,
    };
  }

  // Match destino conocido
  let matched: { display: string; key: string } | null = null;
  for (const dest of KNOWN_DESTINATIONS) {
    if (dest.match.test(trimmed)) {
      matched = { display: dest.display, key: dest.key };
      break;
    }
  }

  if (!matched) {
    // No matcheamos un destino conocido — devolvemos null para que el caller decida
    return null;
  }

  // Match duración
  let duration: number | null = null;
  for (const pattern of DURATION_PATTERNS) {
    const m = trimmed.match(pattern.match);
    if (m) {
      if (pattern.days > 0) {
        duration = pattern.days;
      } else if (m[1]) {
        duration = parseInt(m[1], 10);
      }
      break;
    }
  }

  // Extraer contexto (lo que está después de "porque" o "para")
  let context: string | null = null;
  const contextMatch = trimmed.match(/\b(porque|para|p[ao]rq[ue]|xq|x q)\b\s+(.+)$/i);
  if (contextMatch) {
    context = contextMatch[2].trim();
  }

  return {
    destination: matched.display,
    destination_normalized: matched.key,
    duration_days: duration,
    context,
    tone_hint: detectTone(context || trimmed),
    group_size_hint: detectGroupSize(trimmed),
  };
}

/**
 * Parser principal: intenta regex primero, fallback a Claude Haiku si no encuentra destino.
 */
export async function parseQuery(input: string): Promise<ParsedQuery> {
  // 1. Intento rápido con regex
  const regexResult = regexParse(input);
  if (regexResult && regexResult.destination) {
    return regexResult;
  }

  // 2. Fallback: Claude Haiku para casos ambiguos
  // Costo: ~$0.0005 por llamada
  try {
    const client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });

    const response = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 200,
      system: `Eres un parser de queries de viajes en español. Extrae destino, duración, contexto.
Responde SOLO con JSON válido, sin markdown, sin explicación.
Schema: {"destination":"string|null","duration_days":number|null,"context":"string|null"}
Si no hay destino claro, destination=null.
Ejemplos:
- "Tulum porque cumplo 30" → {"destination":"Tulum","duration_days":null,"context":"porque cumplo 30"}
- "5 dias en oaxaca con amigas" → {"destination":"Oaxaca","duration_days":5,"context":"con amigas"}
- "Algo barato cerca de CDMX" → {"destination":"CDMX","duration_days":null,"context":"barato cerca"}
- "asdfgh" → {"destination":null,"duration_days":null,"context":null}`,
      messages: [{ role: "user", content: input }],
    });

    const text = response.content
      .map((block) => (block.type === "text" ? block.text : ""))
      .join("");
    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    const destination = parsed.destination || null;
    const destinationNormalized = destination
      ? normalizeDestinationKey(destination)
      : "";

    return {
      destination,
      destination_normalized: destinationNormalized,
      duration_days: parsed.duration_days || null,
      context: parsed.context || null,
      tone_hint: detectTone(parsed.context || input),
      group_size_hint: detectGroupSize(input),
    };
  } catch (e) {
    console.error("Haiku parse failed:", e);
    // Si todo falla, devolvemos parsing vacío
    return {
      destination: null,
      destination_normalized: "",
      duration_days: null,
      context: null,
      tone_hint: "default",
      group_size_hint: null,
    };
  }
}

/**
 * Normaliza el destino para usar como key de cache.
 */
export function normalizeDestinationKey(destination: string): string {
  // Match contra los conocidos primero
  for (const dest of KNOWN_DESTINATIONS) {
    if (dest.match.test(destination)) {
      return dest.key;
    }
  }
  // Fallback: lowercase + sin acentos + sin espacios
  return destination
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

/**
 * Lista de destinos pre-cacheados para mostrar en sugerencias.
 */
export const CACHED_DESTINATIONS = KNOWN_DESTINATIONS.map((d) => ({
  display: d.display,
  key: d.key,
}));
