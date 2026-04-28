"use client";

import { useState, useTransition } from "react";
import type { Activity, ScheduleItem } from "@/types";
import { CATEGORY_LABELS } from "@/types";
import { formatCurrency } from "@/lib/utils/date";
import {
  unscheduleActivity,
  updateScheduleTime,
  reorderActivity,
} from "@/app/trip/schedule-actions";
import { useToast } from "@/components/ui/Toast";

interface ScheduledActivityProps {
  activity: Activity;
  scheduleItem: ScheduleItem;
  tripId: string;
  currency: string;
  isFirst: boolean;
  isLast: boolean;
}

export default function ScheduledActivity({
  activity,
  scheduleItem,
  tripId,
  currency,
  isFirst,
  isLast,
}: ScheduledActivityProps) {
  const [isPending, startTransition] = useTransition();
  const [editingTime, setEditingTime] = useState(false);
  const [tempTime, setTempTime] = useState(scheduleItem.start_time || "");
  const { showToast } = useToast();

  const category = CATEGORY_LABELS[activity.category];

  const priceText =
    activity.estimated_price_min === 0 && activity.estimated_price_max === 0
      ? "Gratis"
      : activity.estimated_price_min === activity.estimated_price_max
      ? formatCurrency(activity.estimated_price_min ?? 0, currency)
      : `${formatCurrency(activity.estimated_price_min ?? 0, currency)} - ${formatCurrency(activity.estimated_price_max ?? 0, currency)}`;

  function handleUnschedule() {
    startTransition(async () => {
      const result = await unscheduleActivity(activity.id, tripId);
      if (result?.error) {
        showToast(result.error, "error");
      } else {
        showToast("Quitada del calendario", "info");
      }
    });
  }

  function handleSaveTime() {
    startTransition(async () => {
      const result = await updateScheduleTime(
        scheduleItem.id,
        tripId,
        tempTime || null
      );
      if (result?.error) {
        showToast(result.error, "error");
      } else {
        setEditingTime(false);
      }
    });
  }

  function handleClearTime() {
    setTempTime("");
    startTransition(async () => {
      await updateScheduleTime(scheduleItem.id, tripId, null);
      setEditingTime(false);
    });
  }

  function handleReorder(direction: "up" | "down") {
    startTransition(async () => {
      await reorderActivity(scheduleItem.id, tripId, direction);
    });
  }

  function formatTime(time: string): string {
    const [h, m] = time.split(":");
    const hour = parseInt(h);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${m} ${ampm}`;
  }

  return (
    <div
      className={`group relative flex gap-3 p-4 rounded-2xl border transition ${
        isPending
          ? "opacity-50"
          : "bg-white border-border hover:border-sand-dark"
      }`}
    >
      <div className="flex flex-col gap-1 self-start">
        <button
          onClick={() => handleReorder("up")}
          disabled={isFirst || isPending}
          className="w-6 h-6 rounded text-brown-soft hover:bg-cream disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center justify-center text-xs"
          aria-label="Mover arriba"
        >
          ▲
        </button>
        <button
          onClick={() => handleReorder("down")}
          disabled={isLast || isPending}
          className="w-6 h-6 rounded text-brown-soft hover:bg-cream disabled:opacity-30 disabled:cursor-not-allowed transition flex items-center justify-center text-xs"
          aria-label="Mover abajo"
        >
          ▼
        </button>
      </div>

      <div className="w-10 h-10 rounded-xl bg-cream flex items-center justify-center text-xl flex-shrink-0">
        {category.emoji}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h4 className="font-medium text-brown-dark leading-tight">
            {activity.name}
          </h4>
          <button
            onClick={handleUnschedule}
            disabled={isPending}
            className="text-brown-soft hover:text-error transition text-xs px-2 py-1 -mt-1 -mr-1 rounded"
            aria-label="Quitar del calendario"
          >
            ✕
          </button>
        </div>

        {activity.location_name && (
          <p className="text-xs text-brown-soft mb-2">
            📍 {activity.location_name}
          </p>
        )}

        <div className="flex items-center gap-3 flex-wrap mt-2">
          {editingTime ? (
            <div className="flex items-center gap-1 flex-wrap">
              <input
                type="time"
                value={tempTime}
                onChange={(e) => setTempTime(e.target.value)}
                className="px-2 py-1 text-xs rounded-lg border border-sand-dark"
                autoFocus
              />
              <button
                onClick={handleSaveTime}
                disabled={isPending}
                className="text-xs px-2 py-1 rounded-lg bg-brown-dark text-cream"
              >
                ✓
              </button>
              {scheduleItem.start_time && (
                <button
                  onClick={handleClearTime}
                  disabled={isPending}
                  className="text-xs px-2 py-1 rounded-lg text-brown-soft hover:bg-cream"
                >
                  Quitar hora
                </button>
              )}
              <button
                onClick={() => {
                  setTempTime(scheduleItem.start_time || "");
                  setEditingTime(false);
                }}
                disabled={isPending}
                className="text-xs px-2 py-1 rounded-lg text-brown-soft hover:bg-cream"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditingTime(true)}
              className="text-xs px-2 py-1 rounded-lg bg-cream-warm text-brown-mid hover:bg-sand transition"
            >
              {scheduleItem.start_time
                ? `🕐 ${formatTime(scheduleItem.start_time)}`
                : "+ Agregar hora"}
            </button>
          )}

          <span className="font-display italic text-terracotta text-sm">
            {priceText}
          </span>
        </div>
      </div>
    </div>
  );
}
