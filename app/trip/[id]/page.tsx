import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";
import DeleteTripButton from "@/components/trip/DeleteTripButton";
import ShareTripButton from "@/components/trip/ShareTripButton";
import GenerateActivitiesButton from "@/components/activity/GenerateActivitiesButton";
import ActivitiesList from "@/components/activity/ActivitiesList";
import BudgetSummary from "@/components/activity/BudgetSummary";
import CalendarView from "@/components/calendar/CalendarView";
import {
  formatDateRange,
  tripDuration,
  getTripStatus,
  daysUntilTrip,
} from "@/lib/utils/date";
import { getTripDays } from "@/lib/utils/calendar";
import { INTEREST_OPTIONS, TRIP_TYPE_OPTIONS } from "@/types";

interface TripPageProps {
  params: { id: string };
}

export default async function TripPage({ params }: TripPageProps) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: trip } = await supabase
    .from("trips")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user!.id)
    .single();

  if (!trip) {
    notFound();
  }

  const [activitiesRes, scheduleRes] = await Promise.all([
    supabase
      .from("activities")
      .select("*")
      .eq("trip_id", trip.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("schedule")
      .select("*")
      .eq("trip_id", trip.id)
      .order("order_index", { ascending: true }),
  ]);

  const allActivities = activitiesRes.data || [];
  const scheduleItems = scheduleRes.data || [];
  const hasActivities = allActivities.length > 0;

  // Verificar si el user puede ver el modal de feedback
  // Reglas: no ha respondido feedback antes, no ha dismisseado
  const [feedbackCheck, dismissalCheck] = await Promise.all([
    supabase
      .from("feedback")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user!.id),
    supabase
      .from("feedback_dismissals")
      .select("user_id")
      .eq("user_id", user!.id)
      .eq("source", "first-trip-modal")
      .maybeSingle(),
  ]);

  const hasResponded = (feedbackCheck.count || 0) > 0;
  const hasDismissed = !!dismissalCheck.data;
  const shouldShowFeedback = !hasResponded && !hasDismissed;

  const tripDays = getTripDays(trip.start_date, trip.end_date);
  const status = getTripStatus(trip.start_date, trip.end_date);
  const duration = tripDuration(trip.start_date, trip.end_date);
  const days = daysUntilTrip(trip.start_date);

  const interestLabels = trip.interests
    .map(
      (val: string) =>
        INTEREST_OPTIONS.find((o) => o.value === val)?.label || val
    )
    .filter(Boolean);

  const tripTypeOption = trip.trip_type
    ? TRIP_TYPE_OPTIONS.find((o) => o.value === trip.trip_type)
    : null;

  return (
    <div className="min-h-screen">
      <AppHeader userEmail={user?.email} />

      <main className="px-6 md:px-12 lg:px-20 py-8 max-w-6xl mx-auto">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-brown-soft hover:text-brown-mid transition mb-6"
        >
          ← Volver al dashboard
        </Link>

        {/* Header del viaje */}
        <div className="card-base mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-cream-warm flex items-center justify-center text-4xl flex-shrink-0">
                {trip.emoji}
              </div>
              <div>
                <h1 className="font-display text-3xl md:text-4xl font-light text-brown-dark mb-1">
                  {trip.name}
                </h1>
                <p className="text-brown-soft">
                  {trip.destination}
                  {trip.country ? `, ${trip.country}` : ""}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-start flex-wrap">
              <ShareTripButton
                tripId={trip.id}
                shareToken={trip.share_token}
                isShareEnabled={trip.is_share_enabled}
              />
              <Link
                href={`/trip/${trip.id}/edit`}
                className="btn-secondary text-sm"
              >
                Editar
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-border">
            <div>
              <p className="text-xs uppercase tracking-wider text-brown-soft mb-1">
                Fechas
              </p>
              <p className="font-medium text-brown-dark">
                {formatDateRange(trip.start_date, trip.end_date)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-brown-soft mb-1">
                Duración
              </p>
              <p className="font-medium text-brown-dark">
                {duration} {duration === 1 ? "día" : "días"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-brown-soft mb-1">
                Viajeros
              </p>
              <p className="font-medium text-brown-dark">
                {trip.travelers}{" "}
                {trip.travelers === 1 ? "persona" : "personas"}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-brown-soft mb-1">
                Estado
              </p>
              <p className="font-medium text-brown-dark">
                {status === "upcoming" && days > 0
                  ? `En ${days} días`
                  : status === "ongoing"
                  ? "En curso ✦"
                  : "Completado"}
              </p>
            </div>
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

          {tripTypeOption && (
            <div className="mt-6 pt-6 border-t border-border">
              <p className="text-xs uppercase tracking-wider text-brown-soft mb-3">
                Tipo de viaje
              </p>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cream-warm text-sm text-brown-mid">
                <span className="text-lg">{tripTypeOption.emoji}</span>
                {tripTypeOption.label}
              </span>
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

        {!hasActivities ? (
          <div className="card-base text-center py-16">
            <div className="text-6xl mb-6">✨</div>
            <h2 className="font-display text-2xl md:text-3xl font-medium text-brown-dark mb-3">
              Descubre las mejores actividades
              <br />
              de <span className="italic text-terracotta">{trip.destination}</span>
            </h2>
            <p className="text-brown-mid font-light max-w-md mx-auto mb-8">
              Nuestra AI analizará tu viaje y te recomendará lugares,
              restaurantes y experiencias perfectas para ti.
            </p>
            <GenerateActivitiesButton
              tripId={trip.id}
              hasExistingActivities={false}
            />
            <p className="text-xs text-brown-soft mt-6 max-w-md mx-auto">
              Las recomendaciones son sugerencias generadas por AI. Verifica
              horarios, precios y disponibilidad antes de tu viaje.
            </p>
          </div>
        ) : (
          <>
            <div className="grid lg:grid-cols-[1fr_320px] gap-8 mb-12">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
                  <div>
                    <h2 className="font-display text-2xl md:text-3xl font-light text-brown-dark mb-1">
                      Actividades{" "}
                      <span className="italic text-terracotta">curadas</span>
                    </h2>
                    <p className="text-sm text-brown-mid">
                      Marca las que te emocionen y asígnalas a un día.
                    </p>
                  </div>
                  <GenerateActivitiesButton
                    tripId={trip.id}
                    hasExistingActivities={true}
                  />
                </div>

                <ActivitiesList
                  activities={allActivities}
                  scheduleItems={scheduleItems}
                  tripDays={tripDays}
                  currency={trip.currency}
                  tripId={trip.id}
                  shouldShowFeedback={shouldShowFeedback}
                />
              </div>

              <aside className="lg:sticky lg:top-6 lg:self-start space-y-6">
                <BudgetSummary
                  activities={allActivities}
                  currency={trip.currency}
                  travelers={trip.travelers}
                />
              </aside>
            </div>

            <div className="border-t border-sand-dark pt-12">
              <CalendarView
                days={tripDays}
                activities={allActivities}
                scheduleItems={scheduleItems}
                tripId={trip.id}
                tripName={trip.name}
                currency={trip.currency}
              />
            </div>
          </>
        )}

        <div className="mt-12 pt-8 border-t border-sand-dark">
          <DeleteTripButton tripId={trip.id} tripName={trip.name} />
        </div>
      </main>
    </div>
  );
}
