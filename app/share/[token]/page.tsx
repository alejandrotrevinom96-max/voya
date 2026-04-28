import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import {
  formatDateRange,
  tripDuration,
  formatCurrency,
} from "@/lib/utils/date";
import { getTripDays } from "@/lib/utils/calendar";
import {
  INTEREST_OPTIONS,
  TRIP_TYPE_OPTIONS,
  CATEGORY_LABELS,
} from "@/types";
import type { Trip, Activity, ScheduleItem } from "@/types";

interface SharePageProps {
  params: { token: string };
}

export async function generateMetadata({
  params,
}: SharePageProps): Promise<Metadata> {
  const supabase = createClient();
  const { data: trip } = await supabase
    .from("trips")
    .select("name, destination, country")
    .eq("share_token", params.token)
    .eq("is_share_enabled", true)
    .maybeSingle();

  if (!trip) {
    return {
      title: "Viaje no disponible",
    };
  }

  return {
    title: `${trip.name}`,
    description: `Itinerario de viaje a ${trip.destination}${
      trip.country ? `, ${trip.country}` : ""
    } compartido vía Voya.`,
  };
}

export default async function SharePage({ params }: SharePageProps) {
  const supabase = createClient();

  // RLS permite lectura pública si is_share_enabled = true
  const { data: trip } = await supabase
    .from("trips")
    .select("*")
    .eq("share_token", params.token)
    .eq("is_share_enabled", true)
    .maybeSingle();

  if (!trip) {
    notFound();
  }

  const [activitiesRes, scheduleRes] = await Promise.all([
    supabase
      .from("activities")
      .select("*")
      .eq("trip_id", trip.id)
      .eq("is_added", true)
      .order("created_at", { ascending: false }),
    supabase
      .from("schedule")
      .select("*")
      .eq("trip_id", trip.id)
      .order("order_index", { ascending: true }),
  ]);

  const addedActivities: Activity[] = activitiesRes.data || [];
  const scheduleItems: ScheduleItem[] = scheduleRes.data || [];

  const tripDays = getTripDays(trip.start_date, trip.end_date);
  const duration = tripDuration(trip.start_date, trip.end_date);

  const interestLabels = trip.interests
    .map(
      (val: string) =>
        INTEREST_OPTIONS.find((o) => o.value === val)?.label || val
    )
    .filter(Boolean);

  const tripTypeOption = trip.trip_type
    ? TRIP_TYPE_OPTIONS.find((o) => o.value === trip.trip_type)
    : null;

  // Calcular presupuesto
  const totalMin = addedActivities.reduce(
    (sum, a) => sum + (a.estimated_price_min || 0),
    0
  );
  const totalMax = addedActivities.reduce(
    (sum, a) => sum + (a.estimated_price_max || 0),
    0
  );

  // Schedule por día
  const activitiesById = new Map(addedActivities.map((a) => [a.id, a]));
  const scheduleByDay = new Map<string, ScheduleItem[]>();
  for (const item of scheduleItems) {
    if (!scheduleByDay.has(item.day_date)) {
      scheduleByDay.set(item.day_date, []);
    }
    scheduleByDay.get(item.day_date)!.push(item);
  }
  scheduleByDay.forEach((items) => {
    items.sort((a, b) => {
      if (a.start_time && b.start_time)
        return a.start_time.localeCompare(b.start_time);
      if (a.start_time) return -1;
      if (b.start_time) return 1;
      return a.order_index - b.order_index;
    });
  });

  function formatTime(time: string | null): string | null {
    if (!time) return null;
    const [h, m] = time.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${m} ${ampm}`;
  }

  return (
    <div className="min-h-screen">
      {/* Banner de Voya */}
      <nav className="px-6 md:px-12 py-4 flex items-center justify-between border-b border-sand-dark bg-cream">
        <Link
          href="/"
          className="font-display text-2xl font-medium tracking-tight text-brown-dark"
        >
          Voya<span className="text-terracotta">.</span>
        </Link>
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-xs text-brown-soft">
            Compartido vía Voya
          </span>
          <Link href="/auth/signup" className="btn-primary text-sm">
            Crea tu propio viaje
          </Link>
        </div>
      </nav>

      <main className="px-6 md:px-12 lg:px-20 py-8 max-w-5xl mx-auto">
        {/* Header del viaje */}
        <div className="card-base mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-cream-warm flex items-center justify-center text-4xl flex-shrink-0">
              {trip.emoji}
            </div>
            <div className="min-w-0">
              <p className="text-xs uppercase tracking-wider text-terracotta mb-1">
                ✦ Itinerario compartido
              </p>
              <h1 className="font-display text-2xl md:text-4xl font-light text-brown-dark mb-1 leading-tight">
                {trip.name}
              </h1>
              <p className="text-brown-soft text-sm">
                {trip.destination}
                {trip.country ? `, ${trip.country}` : ""}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-border">
            <div>
              <p className="text-xs uppercase tracking-wider text-brown-soft mb-1">
                Fechas
              </p>
              <p className="font-medium text-brown-dark text-sm">
                {formatDateRange(trip.start_date, trip.end_date)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-brown-soft mb-1">
                Duración
              </p>
              <p className="font-medium text-brown-dark text-sm">
                {duration} {duration === 1 ? "día" : "días"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-brown-soft mb-1">
                Viajeros
              </p>
              <p className="font-medium text-brown-dark text-sm">
                {trip.travelers}{" "}
                {trip.travelers === 1 ? "persona" : "personas"}
              </p>
            </div>
            {tripTypeOption && (
              <div>
                <p className="text-xs uppercase tracking-wider text-brown-soft mb-1">
                  Estilo
                </p>
                <p className="font-medium text-brown-dark text-sm">
                  {tripTypeOption.emoji} {tripTypeOption.label}
                </p>
              </div>
            )}
          </div>

          {trip.cities && trip.cities.length > 0 && (
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-xs uppercase tracking-wider text-brown-soft mb-3">
                Ciudades a visitar
              </p>
              <div className="flex flex-wrap gap-2">
                {trip.cities.map((city: string) => (
                  <span
                    key={city}
                    className="px-3 py-1 rounded-full bg-cream-warm text-sm text-brown-mid"
                  >
                    📍 {city}
                  </span>
                ))}
              </div>
            </div>
          )}

          {interestLabels.length > 0 && (
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-xs uppercase tracking-wider text-brown-soft mb-3">
                Intereses
              </p>
              <div className="flex flex-wrap gap-2">
                {interestLabels.map((label: string) => (
                  <span
                    key={label}
                    className="px-3 py-1 rounded-full bg-cream-warm text-sm text-brown-mid"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Presupuesto */}
        {addedActivities.length > 0 && totalMin > 0 && (
          <div className="card-base bg-cream-warm border-terracotta-soft mb-8">
            <div className="text-center">
              <p className="text-xs uppercase tracking-wider text-brown-soft mb-1">
                Presupuesto estimado · por persona
              </p>
              <p className="font-display italic text-3xl text-terracotta">
                {totalMin === totalMax
                  ? formatCurrency(totalMin, trip.currency)
                  : `${formatCurrency(totalMin, trip.currency)} - ${formatCurrency(totalMax, trip.currency)}`}
              </p>
              <p className="text-xs text-brown-soft mt-2">
                {addedActivities.length}{" "}
                {addedActivities.length === 1
                  ? "actividad incluida"
                  : "actividades incluidas"}{" "}
                · No incluye vuelos, hospedaje ni transporte
              </p>
            </div>
          </div>
        )}

        {/* Itinerario por día */}
        {scheduleItems.length > 0 ? (
          <div className="mb-8">
            <h2 className="font-display text-2xl font-light text-brown-dark mb-6">
              Itinerario <span className="italic text-terracotta">día por día</span>
            </h2>
            <div className="space-y-4">
              {tripDays.map((day) => {
                const items = scheduleByDay.get(day.date) || [];
                if (items.length === 0) return null;

                return (
                  <div key={day.date} className="card-base">
                    <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
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
                        <p className="font-display text-lg font-medium text-brown-dark">
                          Día {day.dayNumber}
                        </p>
                        <p className="text-xs text-brown-soft capitalize">
                          {day.fullLabel}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      {items.map((item) => {
                        const activity = activitiesById.get(item.activity_id);
                        if (!activity) return null;
                        const category = CATEGORY_LABELS[activity.category];
                        const time = formatTime(item.start_time);

                        return (
                          <div
                            key={item.id}
                            className="flex gap-3 p-3 rounded-2xl bg-cream"
                          >
                            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-xl flex-shrink-0">
                              {category.emoji}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-brown-dark text-sm leading-tight">
                                {activity.name}
                              </h4>
                              {activity.location_name && (
                                <p className="text-xs text-brown-soft mt-1">
                                  📍 {activity.location_name}
                                </p>
                              )}
                              {time && (
                                <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded-full bg-cream-warm text-brown-mid">
                                  🕐 {time}
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : addedActivities.length > 0 ? (
          // Hay actividades pero no están agendadas — mostrar como lista
          <div className="mb-8">
            <h2 className="font-display text-2xl font-light text-brown-dark mb-6">
              Actividades <span className="italic text-terracotta">planeadas</span>
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {addedActivities.map((activity) => {
                const category = CATEGORY_LABELS[activity.category];
                return (
                  <div key={activity.id} className="card-base">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 rounded-xl bg-cream flex items-center justify-center text-xl flex-shrink-0">
                        {category.emoji}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-display text-base font-medium text-brown-dark leading-tight">
                          {activity.name}
                        </h4>
                        {activity.location_name && (
                          <p className="text-xs text-brown-soft mt-1">
                            📍 {activity.location_name}
                          </p>
                        )}
                      </div>
                    </div>
                    {activity.description && (
                      <p className="text-sm text-brown-mid font-light line-clamp-3">
                        {activity.description}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="card-base text-center py-12">
            <div className="text-4xl mb-3">✨</div>
            <p className="text-brown-mid">
              Este viaje aún no tiene actividades planeadas.
            </p>
          </div>
        )}

        {/* CTA al final */}
        <div className="card-base text-center bg-brown-dark text-cream py-10 mt-8">
          <h3 className="font-display text-2xl font-medium mb-2">
            ¿Te gusta este viaje?
          </h3>
          <p className="text-cream/70 mb-6 text-sm">
            Crea tu propio plan en minutos con Voya.
          </p>
          <Link
            href="/auth/signup"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-full bg-cream text-brown-dark font-medium hover:scale-105 transition"
          >
            Empezar gratis →
          </Link>
        </div>

        <p className="text-xs text-brown-soft text-center mt-6">
          ✦ Las recomendaciones son sugerencias generadas por AI. Verifica
          horarios, precios y disponibilidad antes del viaje.
        </p>
      </main>
    </div>
  );
}
