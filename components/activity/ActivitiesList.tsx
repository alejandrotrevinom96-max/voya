"use client";

import { useState, useMemo, useEffect } from "react";
import type { Activity, ActivityCategory, ScheduleItem } from "@/types";
import type { TripDay } from "@/lib/utils/calendar";
import { CATEGORY_LABELS } from "@/types";
import ActivityCard from "./ActivityCard";
import FirstActivityFeedbackTrigger from "@/components/feedback/FirstActivityFeedbackTrigger";

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

  // Snapshot del addedCount cuando montamos (para saber si el user llega con 0 o ya tenía algunas)
  const [initialAddedCount] = useState(
    () => activities.filter((a) => a.is_added).length
  );

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

  // Conteo actual (cambia cada vez que `activities` se actualiza vía router.refresh)
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
            />
          ))}
        </div>
      )}

      {/* Trigger de feedback para la 1ra actividad agregada */}
      <FirstActivityFeedbackTrigger
        tripId={tripId}
        initialAddedCount={initialAddedCount}
        shouldEverShow={shouldShowFeedback}
        triggerCount={currentAddedCount}
      />
    </div>
  );
}
