import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";
import TripCard from "@/components/trip/TripCard";
import EmptyTrips from "@/components/trip/EmptyTrips";
import type { Trip } from "@/types";

export default async function DashboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Obtener perfil (incluye is_admin)
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email, is_admin")
    .eq("id", user!.id)
    .single();

  // Obtener viajes
  const { data: trips } = await supabase
    .from("trips")
    .select("*")
    .eq("user_id", user!.id)
    .order("start_date", { ascending: true });

  // Obtener conteo de actividades agregadas por viaje
  const tripsWithCounts: Array<{ trip: Trip; count: number }> = [];

  if (trips && trips.length > 0) {
    for (const trip of trips) {
      const { count } = await supabase
        .from("activities")
        .select("*", { count: "exact", head: true })
        .eq("trip_id", trip.id)
        .eq("is_added", true);

      tripsWithCounts.push({ trip, count: count || 0 });
    }
  }

  const firstName = profile?.full_name?.split(" ")[0] || "viajera";

  return (
    <div className="min-h-screen">
      <AppHeader userEmail={user?.email} />

      <main className="px-6 md:px-12 lg:px-20 py-12 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <h1 className="font-display text-4xl md:text-5xl font-light text-brown-dark mb-2">
              Hola, {firstName}{" "}
              <span className="italic text-terracotta">✦</span>
            </h1>
            <p className="text-brown-mid font-light">
              {trips && trips.length > 0
                ? `Tienes ${trips.length} ${
                    trips.length === 1 ? "viaje" : "viajes"
                  } en tu lista.`
                : "¿A dónde te lleva el viento esta vez?"}
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto flex-wrap">
            {profile?.is_admin && (
              <Link
                href="/admin/feedback"
                className="text-sm px-4 py-2 rounded-full bg-cream-warm text-brown-mid hover:bg-sand transition"
                title="Solo visible para admins"
              >
                📊 Admin
              </Link>
            )}
            {trips && trips.length > 0 && (
              <Link href="/trip/new" className="btn-primary">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 12h14" />
                  <path d="M12 5v14" />
                </svg>
                <span>Nuevo viaje</span>
              </Link>
            )}
          </div>
        </div>

        {!trips || trips.length === 0 ? (
          <EmptyTrips />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {tripsWithCounts.map(({ trip, count }) => (
              <TripCard key={trip.id} trip={trip} activitiesCount={count} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
