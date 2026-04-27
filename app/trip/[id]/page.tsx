import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";
import DeleteTripButton from "@/components/trip/DeleteTripButton";
import {
  formatDateRange,
  tripDuration,
  getTripStatus,
  daysUntilTrip,
} from "@/lib/utils/date";
import { INTEREST_OPTIONS } from "@/types";

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

  const status = getTripStatus(trip.start_date, trip.end_date);
  const duration = tripDuration(trip.start_date, trip.end_date);
  const days = daysUntilTrip(trip.start_date);

  const interestLabels = trip.interests
    .map(
      (val: string) =>
        INTEREST_OPTIONS.find((o) => o.value === val)?.label || val
    )
    .filter(Boolean);

  return (
    <div className="min-h-screen">
      <AppHeader userEmail={user?.email} />

      <main className="px-6 md:px-12 lg:px-20 py-8 max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-brown-soft hover:text-brown-mid transition mb-6"
        >
          ← Volver al dashboard
        </Link>

        {/* Header del viaje */}
        <div className="card-base mb-8">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-cream-warm flex items-center justify-center text-4xl">
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
            <Link
              href={`/trip/${trip.id}/edit`}
              className="btn-secondary text-sm"
            >
              Editar
            </Link>
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
              <p className="font-medium text-brown-dark capitalize">
                {status === "upcoming" && days > 0
                  ? `En ${days} días`
                  : status === "ongoing"
                  ? "En curso ✦"
                  : "Completado"}
              </p>
            </div>
          </div>

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

        {/* Placeholder de actividades (bloque 3) */}
        <div className="card-base text-center py-16 mb-8">
          <div className="text-5xl mb-4">✨</div>
          <h2 className="font-display text-2xl font-medium text-brown-dark mb-3">
            Las actividades vienen <span className="italic text-terracotta">muy pronto</span>
          </h2>
          <p className="text-brown-mid font-light max-w-md mx-auto">
            Próximamente podrás descubrir actividades curadas con AI para tu
            destino, agregarlas a tu calendario y ver tu presupuesto en tiempo
            real.
          </p>
        </div>

        {/* Zona de peligro */}
        <DeleteTripButton tripId={trip.id} tripName={trip.name} />
      </main>
    </div>
  );
}
