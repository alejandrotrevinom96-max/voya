import { addDays, parseISO, format, differenceInDays } from "date-fns";
import { es } from "date-fns/locale";

export interface TripDay {
  date: string; // YYYY-MM-DD
  dayNumber: number; // 1, 2, 3...
  shortLabel: string; // "Lun 15"
  fullLabel: string; // "Lunes 15 de marzo"
  monthLabel: string; // "Marzo"
  isWeekend: boolean;
}

/**
 * Genera la lista de días del viaje
 */
export function getTripDays(startDate: string, endDate: string): TripDay[] {
  const start = parseISO(startDate);
  const totalDays = differenceInDays(parseISO(endDate), start) + 1;
  const days: TripDay[] = [];

  for (let i = 0; i < totalDays; i++) {
    const date = addDays(start, i);
    const dayOfWeek = date.getDay();

    days.push({
      date: format(date, "yyyy-MM-dd"),
      dayNumber: i + 1,
      shortLabel: format(date, "EEE d", { locale: es }),
      fullLabel: format(date, "EEEE d 'de' MMMM", { locale: es }),
      monthLabel: format(date, "MMMM yyyy", { locale: es }),
      isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
    });
  }

  return days;
}

/**
 * Genera string para archivo ICS
 */
export function formatICSDate(dateString: string, time?: string): string {
  // Formato: YYYYMMDDTHHmmss
  const date = parseISO(dateString);
  const dateStr = format(date, "yyyyMMdd");

  if (time) {
    // time viene como "HH:mm" o "HH:mm:ss"
    const cleanTime = time.replace(/:/g, "").padEnd(6, "0");
    return `${dateStr}T${cleanTime}`;
  }

  return dateStr;
}
