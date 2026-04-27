import Link from "next/link";
import type { Trip } from "@/types";
import {
  formatDateRange,
  tripDuration,
  getTripStatus,
  daysUntilTrip,
} from "@/lib/utils/date";

interface TripCardProps {
  trip: Trip;
  activitiesCount?: number;
  estimatedBudget?: number;
}

export default function TripCard({
  trip,
  activitiesCount = 0,
  estimatedBudget = 0,
}: TripCardProps) {
  const status = getTripStatus(trip.start_date, trip.end_date);
  const duration = tripDuration(trip.start_date, trip.end_date);
  const days = daysUntilTrip(trip.start_date);

  const statusBadge = {
    upcoming:
      days <= 30
        ? { text: `En ${days} días`, color: "bg-terracotta text-cream" }
        : { text: "Próximamente", color: "bg-cream-warm text-brown-mid" },
    ongoing: { text: "En curso", color: "bg-success text-white" },
    past: { text: "Completado", color: "bg-sand-dark text-brown-mid" },
  }[status];

  return (
    <Link
      href={`/trip/${trip.id}`}
      className="group block card-base hover:shadow-lg transition-shadow"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="w-14 h-14 rounded-2xl bg-cream-warm flex items-center justify-center text-3xl">
          {trip.emoji}
        </div>
        <span
          className={`text-xs px-3 py-1 rounded-full ${statusBadge.color}`}
        >
          {statusBadge.text}
        </span>
      </div>

      <h3 className="font-display text-2xl font-medium text-brown-dark mb-1 group-hover:text-terracotta transition">
        {trip.name}
      </h3>
      <p className="text-sm text-brown-soft mb-4">
        {trip.destination}
        {trip.country ? `, ${trip.country}` : ""}
      </p>

      <div className="flex items-center justify-between text-sm border-t border-border pt-4">
        <div>
          <p className="text-brown-mid">
            {formatDateRange(trip.start_date, trip.end_date)}
          </p>
          <p className="text-xs text-brown-soft mt-0.5">
            {duration} {duration === 1 ? "día" : "días"} ·{" "}
            {trip.travelers}{" "}
            {trip.travelers === 1 ? "viajero" : "viajeros"}
          </p>
        </div>
        {activitiesCount > 0 && (
          <div className="text-right">
            <p className="font-display italic text-terracotta">
              {activitiesCount} actividad{activitiesCount !== 1 ? "es" : ""}
            </p>
          </div>
        )}
      </div>
    </Link>
  );
}
