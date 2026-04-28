import type { Trip } from "@/types";
import { tripDuration } from "@/lib/utils/date";
import { INTEREST_OPTIONS } from "@/types";

/**
 * Construye el prompt de sistema para Claude
 * Diseñado para:
 * - Forzar a Claude a sugerir SOLO lugares conocidos y consolidados
 * - Pedir nivel de confianza explícito en cada recomendación
 * - Estructurar respuesta en JSON válido
 * - Estimar precios realistas en la moneda del viaje
 */
export function buildSystemPrompt(): string {
  return `Eres un asistente experto en planeación de viajes que conoce bien destinos turísticos del mundo.

REGLAS CRÍTICAS:
1. SOLO recomienda lugares, restaurantes y atracciones que sean CONOCIDOS y CONSOLIDADOS (con al menos 3-5 años de operación, reconocidos en guías de viaje, mencionados frecuentemente en reviews).
2. NUNCA inventes nombres de lugares. Si no estás seguro de que un lugar existe, NO lo incluyas.
3. Para cada recomendación, evalúa tu nivel de confianza:
   - "high": lugar muy conocido, icónico del destino, casi seguro de que existe y opera
   - "medium": lugar conocido pero podrías tener detalles imprecisos (precios, horarios)
   - "low": tienes dudas razonables — solo úsalo si es necesario completar variedad
4. PREFIERE alta confianza. Es mejor sugerir 8 lugares "high" que 15 mezclados.
5. Estima precios REALISTAS basados en el destino y la moneda solicitada. Investiga mentalmente el costo de vida del lugar.
6. Para restaurantes, usa el ticket promedio por persona (no por mesa).
7. Para tours/atracciones, usa el precio de entrada/tour por persona.
8. Si un lugar es gratis (parques públicos, miradores), pon precio min y max en 0.
9. NO incluyas hospedaje, vuelos, ni transporte (eso lo cubre el usuario aparte).
10. NO uses comillas dobles dentro de los strings JSON (usa comillas simples o reescribe).

CATEGORÍAS PERMITIDAS (usa exactamente estos valores):
- restaurant
- museum
- tour
- nature
- nightlife
- shopping
- beach
- culture
- other

RESPONDE SIEMPRE EN JSON VÁLIDO con esta estructura exacta:

{
  "activities": [
    {
      "name": "Nombre del lugar",
      "category": "restaurant",
      "description": "Descripción breve y atractiva (max 200 caracteres). Por qué vale la pena ir.",
      "estimated_price_min": 200,
      "estimated_price_max": 400,
      "estimated_duration_minutes": 90,
      "location_name": "Zona o barrio del destino",
      "ai_confidence": "high",
      "notes": "Tip útil opcional (max 150 caracteres). Ej: 'Reservar con anticipación', 'Ir temprano para evitar fila'"
    }
  ]
}

NO agregues texto antes o después del JSON. NO uses bloques de markdown (\`\`\`). Devuelve SOLO el objeto JSON.`;
}

/**
 * Construye el prompt del usuario con el contexto del viaje
 */
export function buildUserPrompt(trip: Trip): string {
  const duration = tripDuration(trip.start_date, trip.end_date);

  // Mapear los intereses a labels legibles
  const interestLabels = trip.interests
    .map((val) => INTEREST_OPTIONS.find((o) => o.value === val)?.label || val)
    .filter(Boolean)
    .join(", ");

  // Calcular cuántas actividades sugerir según duración
  const targetCount = Math.min(15, Math.max(8, duration * 2));

  const interestsSection = trip.interests.length > 0
    ? `\n- Intereses: ${interestLabels}`
    : "";

  const countryInfo = trip.country ? `, ${trip.country}` : "";

  return `Necesito recomendaciones para mi próximo viaje. Aquí los detalles:

- Destino: ${trip.destination}${countryInfo}
- Duración: ${duration} ${duration === 1 ? "día" : "días"}
- Viajeros: ${trip.travelers} ${trip.travelers === 1 ? "persona" : "personas"}
- Moneda: ${trip.currency}${interestsSection}

Por favor sugiéreme entre ${targetCount - 2} y ${targetCount} actividades variadas considerando mis intereses y la duración del viaje. Incluye una mezcla de:
- Restaurantes (3-5 opciones de distintos precios y estilos)
- Atracciones turísticas y culturales relevantes al destino
- Experiencias únicas del lugar
- Si tengo intereses específicos, dales prioridad

Todos los precios en ${trip.currency}.`;
}

/**
 * Schema de validación para parsear la respuesta de Claude
 */
export interface AIActivity {
  name: string;
  category: string;
  description: string;
  estimated_price_min: number;
  estimated_price_max: number;
  estimated_duration_minutes: number;
  location_name: string;
  ai_confidence: "high" | "medium" | "low";
  notes?: string;
}

export interface AIResponse {
  activities: AIActivity[];
}

const VALID_CATEGORIES = [
  "restaurant",
  "museum",
  "tour",
  "nature",
  "nightlife",
  "shopping",
  "beach",
  "culture",
  "other",
];

/**
 * Valida y limpia la respuesta de Claude
 */
export function validateAIResponse(text: string): AIResponse {
  // Limpiar posibles bloques de markdown si Claude los puso
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "");
  cleaned = cleaned.replace(/\s*```$/i, "");

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    throw new Error("Claude devolvió un JSON inválido. Intenta de nuevo.");
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    !("activities" in parsed) ||
    !Array.isArray((parsed as AIResponse).activities)
  ) {
    throw new Error("Formato inesperado de respuesta de Claude");
  }

  const response = parsed as AIResponse;

  // Filtrar y normalizar cada actividad
  const validActivities: AIActivity[] = [];

  for (const act of response.activities) {
    if (!act.name || !act.category) continue;

    const category = VALID_CATEGORIES.includes(act.category)
      ? act.category
      : "other";

    const confidence: "high" | "medium" | "low" =
      ["high", "medium", "low"].includes(act.ai_confidence)
        ? act.ai_confidence
        : "medium";

    validActivities.push({
      name: String(act.name).slice(0, 200),
      category,
      description: String(act.description || "").slice(0, 500),
      estimated_price_min: Math.max(0, Math.floor(Number(act.estimated_price_min) || 0)),
      estimated_price_max: Math.max(0, Math.floor(Number(act.estimated_price_max) || 0)),
      estimated_duration_minutes: Math.max(
        0,
        Math.floor(Number(act.estimated_duration_minutes) || 60)
      ),
      location_name: String(act.location_name || "").slice(0, 200),
      ai_confidence: confidence,
      notes: act.notes ? String(act.notes).slice(0, 300) : undefined,
    });
  }

  if (validActivities.length === 0) {
    throw new Error("No se generaron actividades válidas. Intenta de nuevo.");
  }

  return { activities: validActivities };
}
