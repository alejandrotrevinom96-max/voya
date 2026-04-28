import type { Trip } from "@/types";
import { tripDuration } from "@/lib/utils/date";
import { INTEREST_OPTIONS, TRIP_TYPE_OPTIONS } from "@/types";

/**
 * Construye el prompt de sistema para Claude
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
5. Estima precios REALISTAS basados en el destino y la moneda solicitada.
6. Para restaurantes, usa el ticket promedio por persona (no por mesa).
7. Para tours/atracciones, usa el precio de entrada/tour por persona.
8. Si un lugar es gratis (parques públicos, miradores), pon precio min y max en 0.
9. NO incluyas hospedaje, vuelos, ni transporte (eso lo cubre el usuario aparte).
10. NO uses comillas dobles dentro de los strings JSON (usa comillas simples o reescribe).

ADAPTACIÓN AL TIPO DE VIAJE:
Si el usuario especifica un tipo de viaje, AJUSTA tus recomendaciones:
- "romantic": atmósferas íntimas, lugares con vista, restaurantes con ambiente especial, evita lugares ruidosos o muy familiares.
- "family": actividades aptas para niños, lugares con horarios accesibles, restaurantes con menú variado, evita nightlife.
- "adventure": deportes outdoor, hiking, actividades de adrenalina, naturaleza activa.
- "low-cost": prioriza opciones gratuitas o económicas, mercados locales, transporte público, free walking tours.
- "luxury": restaurantes premium, experiencias exclusivas, hoteles boutique, tours privados.
- "business": almuerzos rápidos cerca de centros de negocios, actividades de 1-2 horas para tiempo libre.
- "solo": espacios sociales para conocer gente, hostels con eventos, cafés para trabajar, lugares seguros.

CIUDADES MÚLTIPLES:
Si el usuario lista varias ciudades, distribuye las actividades por ciudad de forma equilibrada. Cada actividad debe especificar claramente en su location_name la ciudad correspondiente (ej: "Centro Histórico, Cusco" no solo "Centro Histórico").

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
      "location_name": "Zona, Ciudad",
      "ai_confidence": "high",
      "notes": "Tip útil opcional (max 150 caracteres)."
    }
  ]
}

NO agregues texto antes o después del JSON. NO uses bloques de markdown. Devuelve SOLO el objeto JSON.`;
}

/**
 * Construye el prompt del usuario con el contexto del viaje
 */
export function buildUserPrompt(trip: Trip): string {
  const duration = tripDuration(trip.start_date, trip.end_date);

  // Mapear intereses a labels legibles
  const interestLabels = trip.interests
    .map((val) => INTEREST_OPTIONS.find((o) => o.value === val)?.label || val)
    .filter(Boolean)
    .join(", ");

  // Tipo de viaje legible
  const tripTypeOption = trip.trip_type
    ? TRIP_TYPE_OPTIONS.find((o) => o.value === trip.trip_type)
    : null;

  // Cantidad sugerida de actividades
  const targetCount = Math.min(20, Math.max(8, duration * 2));

  // Secciones opcionales
  const interestsSection = trip.interests.length > 0
    ? `\n- Intereses específicos: ${interestLabels}`
    : "";

  const tripTypeSection = tripTypeOption
    ? `\n- Tipo de viaje: ${tripTypeOption.label} (${tripTypeOption.description})`
    : "";

  const citiesSection = trip.cities && trip.cities.length > 0
    ? `\n- Ciudades a visitar: ${trip.cities.join(", ")}`
    : "";

  const countryInfo = trip.country ? `, ${trip.country}` : "";

  const distributionNote = trip.cities && trip.cities.length > 1
    ? `\n\nIMPORTANTE: Distribuye las actividades de forma equilibrada entre las ${trip.cities.length} ciudades. Cada location_name debe especificar la ciudad.`
    : "";

  return `Necesito recomendaciones para mi próximo viaje. Aquí los detalles:

- Destino: ${trip.destination}${countryInfo}${citiesSection}
- Duración: ${duration} ${duration === 1 ? "día" : "días"}
- Viajeros: ${trip.travelers} ${trip.travelers === 1 ? "persona" : "personas"}
- Moneda: ${trip.currency}${tripTypeSection}${interestsSection}

Por favor sugiéreme entre ${targetCount - 2} y ${targetCount} actividades variadas. Incluye una mezcla de:
- Restaurantes (3-5 opciones de distintos precios y estilos)
- Atracciones turísticas y culturales relevantes
- Experiencias únicas del lugar
- Si tengo intereses o tipo de viaje específicos, dales prioridad

Todos los precios en ${trip.currency}.${distributionNote}`;
}

// ============================================
// Validación de respuesta (sin cambios)
// ============================================

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

export function validateAIResponse(text: string): AIResponse {
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
