import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server-public";
import VotingFlow from "@/components/voting/VotingFlow";
import { TRIP_TYPE_OPTIONS } from "@/types";
import { formatDateRange } from "@/lib/utils/date";

export const dynamic = "force-dynamic";

interface InvitePageProps {
  params: { token: string };
}

export default async function InvitePage({ params }: InvitePageProps) {
  const supabase = createClient();

  // Cargar trip por voting_token
  const { data: trip } = await supabase
    .from("trips")
    .select("*")
    .eq("voting_token", params.token)
    .eq("voting_enabled", true)
    .single();

  if (!trip) {
    notFound();
  }

  // Cargar info del dueño (solo el nombre)
  const { data: owner } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", trip.user_id)
    .single();

  // Cargar actividades agregadas (is_added=true)
  const { data: activities } = await supabase
    .from("activities")
    .select("*")
    .eq("trip_id", trip.id)
    .eq("is_added", true)
    .order("created_at", { ascending: true });

  if (!activities || activities.length === 0) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center px-6">
        <div className="card-base max-w-md text-center">
          <div className="text-5xl mb-4">🤔</div>
          <h1 className="font-display text-2xl text-brown-dark mb-2">
            Aún no hay nada que votar
          </h1>
          <p className="text-brown-mid">
            {owner?.full_name || "El organizador"} todavía no agregó actividades
            al viaje. Vuelve más tarde.
          </p>
        </div>
      </div>
    );
  }

  const ownerFirstName = owner?.full_name?.split(" ")[0] || "El organizador";
  const tripTypeOption = trip.trip_type
    ? TRIP_TYPE_OPTIONS.find((o) => o.value === trip.trip_type)
    : null;

  return (
    <VotingFlow
      trip={{
        id: trip.id,
        name: trip.name,
        destination: trip.destination,
        country: trip.country,
        emoji: trip.emoji,
        start_date: trip.start_date,
        end_date: trip.end_date,
        cities: trip.cities || [],
        currency: trip.currency,
      }}
      tripTypeLabel={tripTypeOption?.label || null}
      tripTypeEmoji={tripTypeOption?.emoji || null}
      formattedDates={formatDateRange(trip.start_date, trip.end_date)}
      ownerName={ownerFirstName}
      activities={activities}
      token={params.token}
    />
  );
}
