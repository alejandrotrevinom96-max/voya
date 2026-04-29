import type { Trip, Activity, ScheduleItem } from "@/types";
import { TRIP_TYPE_OPTIONS } from "@/types";
import { tripDuration } from "@/lib/utils/date";

/**
 * Prompt de sistema para auto-agendar actividades en días/horarios.
 */
export function buildScheduleSystemPrompt(): string {
  return `Eres un planificador experto de itinerarios de viaje. Tu trabajo es organizar actividades en un calendario de manera REALISTA y AGRADABLE para el viajero.

REGLAS CRÍTICAS:
1. Cada actividad recibe un día específico (entre las fechas del viaje) y una hora de inicio.
2. NUNCA agendas más actividades de las que el usuario ya marcó como "agregadas". No inventes actividades nuevas.
3. NUNCA cambias actividades que YA tienen día/hora asignados (las respetas exactamente como están).
4. Solo agendas actividades que NO tengan día/hora aún.

LÓGICA DE HORARIOS REALISTA:
- Desayunos (restaurant temprano): 8:00-9:30am
- Tours/atracciones culturales/museos: 10:00am-1:00pm
- Almuerzos (restaurant): 1:00-3:00pm
- Naturaleza/playa/actividades outdoor: 10:00am-2:00pm o 3:00-6:00pm (evitar mediodía solar fuerte)
- Atracciones de tarde/shopping: 3:00-6:00pm
- Cenas (restaurant): 7:00-9:00pm
- Vida nocturna/bares: 9:00pm-12:00am

DISTRIBUCIÓN POR DÍA:
- Máximo 4-5 actividades por día (no sobrecargar)
- Mínimo 1 hora de buffer entre actividades para traslados/descanso
- NO agendar 2 restaurantes seguidos (a menos que sean desayuno + almuerzo o almuerzo + cena con suficiente espacio)
- Mezclar tipos: una mañana cultural + tarde de naturaleza, no todo museos seguidos

AGRUPAR POR ZONA/CIUDAD:
- Si hay actividades en distintas ciudades, agrupa POR DÍA por ciudad cuando sea posible.
- No agendar Cusco en la mañana y Lima en la tarde (son ciudades distintas).
- Si una actividad menciona ubicación específica, agrupa con otras cercanas.

ADAPTACIÓN AL TIPO DE VIAJE:
- "romantic": cenas tarde (8-9pm), atardeceres, máximo 3 actividades/día
- "family": empezar más temprano (9am), terminar 7-8pm, evitar nightlife
- "adventure": outdoor temprano (8-9am), actividad principal por día
- "low-cost": distribución eficiente, sin actividades caras juntas
- "luxury": pocas actividades pero memorables (2-3/día), tiempo para spa/relax
- "business": máximo 2 actividades/día, espacios cortos (lunch + cena)
- "solo": espacios sociales tarde (almuerzo, cena), grupos para conocer gente

PRIMER Y ÚLTIMO DÍA:
- Día 1: empezar después de las 12pm (asumiendo llegada en la mañana). Solo 2-3 actividades.
- Último día: terminar antes de las 4pm (asumiendo regreso en la tarde). Solo 1-2 actividades.

FORMATO DE RESPUESTA (JSON estricto):
{
  "schedule": [
    {
      "activity_id": "uuid-de-la-actividad",
      "day_date": "YYYY-MM-DD",
      "start_time": "HH:MM"
    }
  ]
}

NO uses bloques de markdown. NO agregues texto antes o después del JSON. Devuelve SOLO el objeto JSON con el campo "schedule".

Si por alguna razón no puedes agendar una actividad (ej: ya hay demasiadas ese día), simplemente NO la incluyas en el schedule. Es mejor no agendarla que crear un calendario sobrecargado.`;
}

/**
 * Prompt de usuario con contexto del viaje y actividades a agendar
 */
export function buildScheduleUserPrompt(
  trip: Trip,
  unscheduledActivities: Activity[],
  alreadyScheduled: Array<{
    activity: Activity;
    schedule: ScheduleItem;
  }>
): string {
  const duration = tripDuration(trip.start_date, trip.end_date);
  const tripTypeOption = trip.trip_type
    ? TRIP_TYPE_OPTIONS.find((o) => o.value === trip.trip_type)
    : null;

  // Generar lista de fechas válidas
  const validDates: string[] = [];
  const start = new Date(trip.start_date);
  const end = new Date(trip.end_date);
  const current = new Date(start);
  while (current <= end) {
    validDates.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }

  // Lista de actividades a agendar
  const activitiesText = unscheduledActivities
    .map((a, i) => {
      const duration = a.estimated_duration_minutes
        ? `${a.estimated_duration_minutes} min`
        : "duración no especificada";
      return `${i + 1}. ID: ${a.id}
   Nombre: ${a.name}
   Categoría: ${a.category}
   Ubicación: ${a.location_name || "no especificada"}
   Duración estimada: ${duration}`;
    })
    .join("\n\n");

  // Lista de lo ya agendado (para que respete el contexto)
  const alreadyScheduledText =
    alreadyScheduled.length > 0
      ? `\n\nACTIVIDADES YA AGENDADAS (RESPETA estos horarios, NO los cambies):
${alreadyScheduled
  .map(
    (a) =>
      `- ${a.activity.name} → ${a.schedule.day_date}${
        a.schedule.start_time ? ` a las ${a.schedule.start_time}` : ""
      }`
  )
  .join("\n")}`
      : "";

  const tripTypeText = tripTypeOption
    ? `\n- Tipo de viaje: ${tripTypeOption.label} (${tripTypeOption.description})`
    : "";

  const citiesText =
    trip.cities && trip.cities.length > 0
      ? `\n- Ciudades a visitar: ${trip.cities.join(", ")}`
      : "";

  return `Por favor agenda las siguientes actividades en el calendario de mi viaje.

CONTEXTO DEL VIAJE:
- Destino: ${trip.destination}${trip.country ? `, ${trip.country}` : ""}${citiesText}
- Duración: ${duration} ${duration === 1 ? "día" : "días"}
- Fechas válidas: ${validDates.join(", ")}
- Viajeros: ${trip.travelers}${tripTypeText}

ACTIVIDADES A AGENDAR (${unscheduledActivities.length}):

${activitiesText}${alreadyScheduledText}

Crea un itinerario realista distribuyendo estas actividades a lo largo de los días disponibles, con horarios que tengan sentido lógico y agrupando por zona cuando sea posible.

Recuerda: usa EXACTAMENTE los IDs que te di, las fechas EXACTAS de la lista, y horarios en formato HH:MM (24h).`;
}

// ============================================
// Validación de respuesta
// ============================================

export interface ScheduledItem {
  activity_id: string;
  day_date: string;
  start_time: string;
}

export interface ScheduleAIResponse {
  schedule: ScheduledItem[];
}

export function validateScheduleResponse(
  text: string,
  validActivityIds: Set<string>,
  validDates: Set<string>
): ScheduleAIResponse {
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "");
  cleaned = cleaned.replace(/\s*```$/i, "");

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch (e) {
    throw new Error("Claude devolvió un JSON inválido para el schedule.");
  }

  if (
    !parsed ||
    typeof parsed !== "object" ||
    !("schedule" in parsed) ||
    !Array.isArray((parsed as ScheduleAIResponse).schedule)
  ) {
    throw new Error("Formato inesperado de respuesta de schedule");
  }

  const response = parsed as ScheduleAIResponse;
  const validItems: ScheduledItem[] = [];

  for (const item of response.schedule) {
    // Filtrar actividades inválidas
    if (!item.activity_id || !validActivityIds.has(item.activity_id)) continue;

    // Filtrar fechas inválidas
    if (!item.day_date || !validDates.has(item.day_date)) continue;

    // Validar formato hora HH:MM
    const time = item.start_time;
    if (!time || !/^\d{1,2}:\d{2}$/.test(time)) continue;

    const [h, m] = time.split(":").map(Number);
    if (h < 0 || h > 23 || m < 0 || m > 59) continue;

    // Normalizar formato (asegurar 2 dígitos)
    const normalizedTime = `${String(h).padStart(2, "0")}:${String(m).padStart(
      2,
      "0"
    )}`;

    validItems.push({
      activity_id: item.activity_id,
      day_date: item.day_date,
      start_time: normalizedTime,
    });
  }

  return { schedule: validItems };
}
