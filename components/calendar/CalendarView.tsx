import type { Activity, ScheduleItem } from "@/types";
import type { TripDay } from "@/lib/utils/calendar";
import { formatCurrency } from "@/lib/utils/date";
import ScheduledActivity from "./ScheduledActivity";
import ExportCalendarButton from "./ExportCalendarButton";

interface CalendarViewProps {
  days: TripDay[];
  activities: Activity[];
  scheduleItems: ScheduleItem[];
  tripId: string;
  tripName: string;
  currency: string;
}

export default function CalendarView({
  days,
  activities,
  scheduleItems,
  tripId,
  tripName,
  currency,
}: CalendarViewProps) {
  // Agrupar schedule por día
  const scheduleByDay = new Map<string, ScheduleItem[]>();
  for (const item of scheduleItems) {
    if (!scheduleByDay.has(item.day_date)) {
      scheduleByDay.set(item.day_date, []);
    }
    scheduleByDay.get(item.day_date)!.push(item);
  }

  // Ordenar cada día por order_index (y por hora si la tienen)
  scheduleByDay.forEach((items) => {
    items.sort((a, b) => {
      // Si ambos tienen hora, ordenar por hora
      if (a.start_time && b.start_time) {
        return a.start_time.localeCompare(b.start_time);
      }
      // Si solo uno tiene hora, ese va primero
      if (a.start_time) return -1;
      if (b.start_time) return 1;
      // Si ninguno tiene hora, ordenar por order_index
      return a.order_index - b.order_index;
    });
  });

  // Map de actividades por id para búsqueda rápida
  const activitiesById = new Map(activities.map((a) => [a.id, a]));

  // Calcular presupuesto total programado
  const scheduledActivityIds = new Set(scheduleItems.map((s) => s.activity_id));
  const totalMin = activities
    .filter((a) => scheduledActivityIds.has(a.id))
    .reduce((sum, a) => sum + (a.estimated_price_min || 0), 0);
  const totalMax = activities
    .filter((a) => scheduledActivityIds.has(a.id))
    .reduce((sum, a) => sum + (a.estimated_price_max || 0), 0);

  const hasAnyScheduled = scheduleItems.length > 0;

  return (
    <div>
      {/* Header del calendario */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="font-display text-2xl md:text-3xl font-light text-brown-dark mb-1">
            Tu <span className="italic text-terracotta">itinerario</span>
          </h2>
          <p className="text-sm text-brown-mid">
            {hasAnyScheduled
              ? `${scheduleItems.length} ${
                  scheduleItems.length === 1 ? "actividad" : "actividades"
                } programadas en ${days.length} días`
              : "Asigna actividades a cada día desde la sección de arriba"}
          </p>
        </div>
        {hasAnyScheduled && (
          <ExportCalendarButton tripId={tripId} tripName={tripName} />
        )}
      </div>

      {/* Días */}
      <div className="space-y-4">
        {days.map((day) => {
          const items = scheduleByDay.get(day.date) || [];
          const dayBudgetMin = items.reduce((sum, item) => {
            const act = activitiesById.get(item.activity_id);
            return sum + (act?.estimated_price_min || 0);
          }, 0);
          const dayBudgetMax = items.reduce((sum, item) => {
            const act = activitiesById.get(item.activity_id);
            return sum + (act?.estimated_price_max || 0);
          }, 0);

          return (
            <div key={day.date} className="card-base">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-border">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center font-display text-xl ${
                      day.isWeekend
                        ? "bg-terracotta-soft text-brown-dark"
                        : "bg-cream-warm text-brown-dark"
                    }`}
                  >
                    {day.dayNumber}
                  </div>
                  <div>
                    <p className="font-display text-lg font-medium text-brown-dark capitalize">
                      Día {day.dayNumber}
                    </p>
                    <p className="text-xs text-brown-soft capitalize">
                      {day.fullLabel}
                    </p>
                  </div>
                </div>
                {items.length > 0 && (
                  <div className="text-right">
                    <p className="text-xs text-brown-soft uppercase tracking-wider">
                      {items.length} {items.length === 1 ? "act." : "acts."}
                    </p>
                    {dayBudgetMin > 0 && (
                      <p className="font-display italic text-terracotta text-sm">
                        {dayBudgetMin === dayBudgetMax
                          ? formatCurrency(dayBudgetMin, currency)
                          : `${formatCurrency(dayBudgetMin, currency)} - ${formatCurrency(dayBudgetMax, currency)}`}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {items.length === 0 ? (
                <p className="text-sm text-brown-soft italic text-center py-6">
                  Día libre · Asigna actividades desde el catálogo de arriba
                </p>
              ) : (
                <div className="space-y-2">
                  {items.map((item, index) => {
                    const activity = activitiesById.get(item.activity_id);
                    if (!activity) return null;

                    return (
                      <ScheduledActivity
                        key={item.id}
                        activity={activity}
                        scheduleItem={item}
                        tripId={tripId}
                        currency={currency}
                        isFirst={index === 0}
                        isLast={index === items.length - 1}
                      />
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Total general */}
      {hasAnyScheduled && totalMin > 0 && (
        <div className="mt-6 card-base bg-cream-warm border-terracotta-soft text-center">
          <p className="text-xs uppercase tracking-wider text-brown-soft mb-1">
            Total del itinerario (por persona)
          </p>
          <p className="font-display italic text-3xl text-terracotta">
            {totalMin === totalMax
              ? formatCurrency(totalMin, currency)
              : `${formatCurrency(totalMin, currency)} - ${formatCurrency(totalMax, currency)}`}
          </p>
        </div>
      )}
    </div>
  );
}
