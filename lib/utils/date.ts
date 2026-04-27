import { format, differenceInDays, parseISO, isPast, isFuture, isToday } from "date-fns";
import { es } from "date-fns/locale";

/**
 * Formatea una fecha ISO a formato legible en español
 * Ej: "2026-03-15" → "15 mar"
 */
export function formatDateShort(isoDate: string): string {
  return format(parseISO(isoDate), "d MMM", { locale: es });
}

/**
 * Formatea rango de fechas
 * Ej: "15-20 nov" o "28 nov - 3 dic"
 */
export function formatDateRange(startDate: string, endDate: string): string {
  const start = parseISO(startDate);
  const end = parseISO(endDate);

  const startMonth = format(start, "MMM", { locale: es });
  const endMonth = format(end, "MMM", { locale: es });

  if (startMonth === endMonth) {
    return `${format(start, "d", { locale: es })}-${format(end, "d MMM", { locale: es })}`;
  }

  return `${format(start, "d MMM", { locale: es })} - ${format(end, "d MMM", { locale: es })}`;
}

/**
 * Calcula los días totales del viaje (inclusivo)
 */
export function tripDuration(startDate: string, endDate: string): number {
  return differenceInDays(parseISO(endDate), parseISO(startDate)) + 1;
}

/**
 * Estado del viaje: "futuro", "en curso", "pasado"
 */
export type TripStatus = "upcoming" | "ongoing" | "past";

export function getTripStatus(startDate: string, endDate: string): TripStatus {
  const start = parseISO(startDate);
  const end = parseISO(endDate);

  if (isPast(end) && !isToday(end)) return "past";
  if (isFuture(start) && !isToday(start)) return "upcoming";
  return "ongoing";
}

/**
 * Días restantes hasta el viaje
 */
export function daysUntilTrip(startDate: string): number {
  return differenceInDays(parseISO(startDate), new Date());
}

/**
 * Formato de moneda
 */
export function formatCurrency(amount: number, currency = "MXN"): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Convierte fecha JS a formato YYYY-MM-DD para inputs
 */
export function toDateInput(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

/**
 * Obtiene el emoji default según el destino o intereses
 */
export function getTripEmoji(interests: string[]): string {
  if (interests.includes("playa")) return "🏖️";
  if (interests.includes("naturaleza")) return "🌿";
  if (interests.includes("aventura")) return "🧗";
  if (interests.includes("cultura")) return "🏛️";
  if (interests.includes("gastronomia")) return "🍽️";
  if (interests.includes("nightlife")) return "🌙";
  if (interests.includes("wellness")) return "🧘";
  return "✈️";
}
