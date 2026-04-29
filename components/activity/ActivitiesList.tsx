"use client";

import { useState, useMemo, useRef } from "react";
import type { Activity, ActivityCategory, ScheduleItem } from "@/types";
import type { TripDay } from "@/lib/utils/calendar";
import { CATEGORY_LABELS } from "@/types";
import ActivityCard from "./ActivityCard";
import FeedbackModal from "@/components/feedback/FeedbackModal";

interface ActivitiesListProps {
  activities: Activity[];
  scheduleItems: ScheduleItem[];
  tripDays: TripDay[];
  currency: string;
  tripId: string;
  /** Si el server determinó que este user puede ver el modal de feedback */
  shouldShowFeedback: boolean;
}

type Filter = "all" | "added" | "scheduled" | ActivityCategory;

export default function ActivitiesList({
  activities,
  scheduleItems,
  tripDays,
  currency,
  tripId,
  shouldShowFeedback,
}: ActivitiesListProps) {
  const [filter, setFilter] = useState<Filter>("all");

  // Estado del modal de feedback
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  // Snapshot del addedCount al cargar la página.
  // Si era 0, la próxima activación será la "1ra".
  const initialAddedCountRef = useRef(
    activities.filter((a) => a.is_added).length
  );

  // Flag: ya disparamos el modal en esta sesión (para no abrirlo doble)
  const triggeredRef = useRef(false);

  /**
   * Callback que ActivityCard invoca DESPUÉS de un toggle exitoso a "agregada".
   * Si era la 1ra del usuario en este viaje (snapshot inicial = 0) y aún no
   * dispara, abre el modal de feedback con 800ms de delay.
   */
  function handleActivityAdded() {
    if (
      shouldShowFeedback &&
      initialAddedCountRef.current === 0 &&
      !triggeredRef.current
    ) {
      triggeredRef.current = true;
      setTimeout(() => {
        setFeedbackOpen(true);
      }, 800);
    }
  }

  // Map de scheduleItems por activity_id
  const scheduleByActivity = useMemo(() => {
    const map = new Map<string, ScheduleItem>();
    scheduleItems.forEach((item) => map.set(item.activity_id, item));
    return map;
  }, [scheduleItems]);

  const availableCategories = useMemo(() => {
    const cats = new Set<ActivityCategory>();
    activities.forEach((a) => cats.add(a.category));
    return Array.from(cats);
  }, [activities]);

  const filtered = useMemo(() => {
    if (filter === "all") return activities;
    if (filter === "added") return activities.filter((a) => a.is_added);
    if (filter === "scheduled")
      return activities.filter((a) => scheduleByActivity.has(a.id));
    return activities.filter((a) => a.category === filter);
  }, [activities, filter, scheduleByActivity]);

  const currentAddedCount = activities.filter((a) => a.is_added).length;
  const scheduledCount = scheduleByActivity.size;

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-6">
        <button
          onClick={() => setFilter("all")}
          className={`text-sm px-4 py-2 rounded-full transition ${
            filter === "all"
              ? "bg-brown-dark text-cream"
              : "bg-white border border-sand-dark text-brown-mid hover:bg-cream-warm"
          }`}
        >
          Todas ({activities.length})
        </button>

        {currentAddedCount > 0 && (
          <button
            onClick={() => setFilter("added")}
            className={`text-sm px-4 py-2 rounded-full transition ${
              filter === "added"
                ? "bg-terracotta text-cream"
                : "bg-white border border-sand-dark text-brown-mid hover:bg-cream-warm"
            }`}
          >
            ✓ En plan ({currentAddedCount})
          </button>
        )}

        {scheduledCount > 0 && (
          <button
            onClick={() => setFilter("scheduled")}
            className={`text-sm px-4 py-2 rounded-full transition ${
              filter === "scheduled"
                ? "bg-success text-white"
                : "bg-white border border-sand-dark text-brown-mid hover:bg-cream-warm"
            }`}
          >
            📅 Programadas ({scheduledCount})
          </button>
        )}

        {availableCategories.map((cat) => {
          const info = CATEGORY_LABELS[cat];
          const count = activities.filter((a) => a.category === cat).length;
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`text-sm px-4 py-2 rounded-full transition ${
                filter === cat
                  ? "bg-brown-dark text-cream"
                  : "bg-white border border-sand-dark text-brown-mid hover:bg-cream-warm"
              }`}
            >
              {info.emoji} {info.label} ({count})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12 text-brown-soft">
          No hay actividades en esta categoría.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((activity) => (
            <ActivityCard
              key={activity.id}
              activity={activity}
              currency={currency}
              tripId={tripId}
              scheduleItem={scheduleByActivity.get(activity.id)}
              tripDays={tripDays}
              onActivityAdded={handleActivityAdded}
            />
          ))}
        </div>
      )}

      {/* Modal de feedback: se abre directamente cuando el usuario agrega su 1ra actividad */}
      {feedbackOpen && (
        <FeedbackModal
          tripId={tripId}
          onClose={() => setFeedbackOpen(false)}
          onSubmitted={() => setFeedbackOpen(false)}
        />
      )}
    </div>
  );
}
