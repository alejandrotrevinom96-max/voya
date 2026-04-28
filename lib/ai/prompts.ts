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

═══════════════════════════════════════════════════════════
TIPO DE VIAJE: REGLA OBLIGATORIA (NO opcional)
═══════════════════════════════════════════════════════════

Cuando el usuario especifica un tipo de viaje, ESTE ES EL FILTRO PRINCIPAL.
TODAS las recomendaciones deben encajar con este tipo. Si una actividad genial
del destino NO encaja con el tipo de viaje, NO la incluyas.

Reglas estrictas por tipo:

▸ "romantic":
  - PRIORIDAD: atmósferas íntimas, lugares con vista, ambientes para parejas
  - INCLUIR: restaurantes con ambiente especial, miradores, paseos al atardecer,
    spas para parejas, viñedos, terrazas, experiencias gastronómicas íntimas
  - EVITAR: lugares con multitudes, zonas familiares ruidosas, actividades grupales
  - En 'notes' menciona por qué es romántico (ej: "Ideal para aniversarios")

▸ "family":
  - PRIORIDAD: actividades para todas las edades, especialmente con niños
  - INCLUIR: parques temáticos, museos interactivos, zoológicos, playas seguras,
    restaurantes familiares con menú de niños, talleres educativos
  - EVITAR: nightlife, bares, lugares 18+, actividades de adrenalina extrema,
    restaurantes solo para adultos
  - En 'notes' especifica si es apto para niños y rangos de edad

▸ "adventure":
  - PRIORIDAD: deportes outdoor, adrenalina, naturaleza activa
  - INCLUIR: senderismo, kayak, escalada, ciclismo, surf, parapente,
    rapel, tirolesa, exploración de cuevas, tours de aventura
  - EVITAR: museos pasivos, shopping, spa, lugares solo para sentarse
  - En 'notes' menciona nivel de dificultad y equipo necesario

▸ "low-cost":
  - PRIORIDAD: maximizar experiencia con presupuesto ajustado
  - INCLUIR: lugares gratis (price 0), mercados locales, free walking tours,
    parques públicos, puestos de comida callejera, museos con días gratis
  - EVITAR: restaurantes premium, tours guiados caros, experiencias exclusivas
  - PRECIO: la mayoría debe estar en 0 o muy bajo. Si no, omitir.

▸ "luxury":
  - PRIORIDAD: experiencias premium y exclusivas
  - INCLUIR: restaurantes con estrellas, hoteles boutique, tours privados,
    experiencias VIP, spas premium, helicópteros, yates
  - EVITAR: opciones budget, fast food, atracciones masivas
  - PRECIO: pueden y deben ser altos. Refleja el premium.

▸ "business":
  - PRIORIDAD: actividades cortas (1-2h) cerca de zonas de negocios
  - INCLUIR: restaurantes para almuerzo de negocios, cafés con wifi,
    bares de hotel, gimnasios, spas express, museos con visitas rápidas
  - EVITAR: actividades de día completo, tours largos, lugares lejanos
  - DURACIÓN: máximo 120 minutos por actividad

▸ "solo":
  - PRIORIDAD: espacios sociales seguros para conocer gente o disfrutar solx
  - INCLUIR: hostels con eventos, cafés con buena vibe para trabajar,
    free walking tours grupales, bares amistosos, experiencias culturales,
    yoga grupal, clases de cocina
  - EVITAR: restaurantes románticos solo para parejas, lugares aislados,
    zonas con problemas de seguridad
  - En 'notes' indica si es seguro y/o social

═══════════════════════════════════════════════════════════
CIUDADES MÚLTIPLES
═══════════════════════════════════════════════════════════
Si el usuario lista varias ciudades, distribuye las actividades de forma equilibrada
entre ellas. Cada actividad debe especificar claramente en su location_name la
ciudad correspondiente (ej: "Centro Histórico, Cusco" no solo "Centro Histórico").

═══════════════════════════════════════════════════════════
FORMATO DE RESPUESTA
═══════════════════════════════════════════════════════════

CATEGORÍAS PERMITIDAS (usa exactamente estos valores):
restaurant, museum, tour, nature, nightlife, shopping, beach, culture, other

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
      "notes": "Tip útil opcional (max 150 caracteres). Si aplica, menciona por qué encaja con el tipo de viaje."
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

  // Tipo de viaje: ahora es MUY explícito y va arriba como prioridad
  const tripTypeSection = tripTypeOption
    ? `\n\n⚠️ TIPO DE VIAJE: ${tripTypeOption.label.toUpperCase()} (${tripTypeOption.description})\nESTE ES EL FILTRO PRINCIPAL. Todas las actividades DEBEN encajar con este estilo.`
    : "";

  const citiesSection = trip.cities && trip.cities.length > 0
    ? `\n- Ciudades a visitar: ${trip.cities.join(", ")}`
    : "";

  const countryInfo = trip.country ? `, ${trip.country}` : "";

  const distributionNote = trip.cities && trip.cities.length > 1
    ? `\n\nIMPORTANTE: Distribuye las actividades de forma equilibrada entre las ${trip.cities.length} ciudades. Cada location_name debe especificar la ciudad.`
    : "";

  const tripTypeReminder = tripTypeOption
    ? `\n\nRECUERDA: TIPO DE VIAJE = ${tripTypeOption.label.toUpperCase()}. Filtra TODAS tus recomendaciones por este criterio. Si una actividad popular del destino no encaja con este tipo, NO la incluyas.`
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

Todos los precios en ${trip.currency}.${distributionNote}${tripTypeReminder}`;
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
