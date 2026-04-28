"use client";

import { useState, useTransition } from "react";
import type { Activity, ScheduleItem } from "@/types";
import type { TripDay } from "@/lib/utils/calendar";
import { CATEGORY_LABELS } from "@/types";
import { formatCurrency } from "@/lib/utils/date";
import {
  toggleActivityAdded,
  deleteActivity,
} from "@/app/trip/activities-actions";
import AddToDayButton from "@/components/calendar/AddToDayButton";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useToast } from "@/components/ui/Toast";

interface ActivityCardProps {
  activity: Activity;
  currency: string;
  tripId: string;
  scheduleItem?: ScheduleItem;
  tripDays: TripDay[];
}

export default function ActivityCard({
  activity,
  currency,
  tripId,
  scheduleItem,
  tripDays,
}: ActivityCardProps) {
  const [isPending, startTransition] = useTransition();
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { showToast } = useToast();

  const category = CATEGORY_LABELS[activity.category];

  const priceText =
    activity.estimated_price_min === 0 && activity.estimated_price_max === 0
      ? "Gratis"
      : activity.estimated_price_min === activity.estimated_price_max
      ? formatCurrency(activity.estimated_price_min ?? 0, currency)
      : `${formatCurrency(activity.estimated_price_min ?? 0, currency)} - ${formatCurrency(activity.estimated_price_max ?? 0, currency)}`;

  const durationText = activity.estimated_duration_minutes
    ? activity.estimated_duration_minutes >= 60
      ? `${Math.round(activity.estimated_duration_minutes / 60)}h`
      : `${activity.estimated_duration_minutes}min`
    : null;

  const confidenceBadge = {
    high: { text: "Muy conocido", color: "bg-success/10 text-success" },
    medium: { text: "Verificar antes", color: "bg-cream-warm text-brown-mid" },
    low: { text: "Confirmar info", color: "bg-error/10 text-error" },
  }[activity.ai_confidence];

  function handleToggle() {
    startTransition(async () => {
      const result = await toggleActivityAdded(activity.id, tripId);
      if (result?.error) {
        showToast(result.error, "error");
      } else if (result?.is_added) {
        showToast(`"${activity.name}" agregada al plan`, "success");
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteActivity(activity.id, tripId);
      if (result?.error) {
        showToast(result.error, "error");
      } else {
        showToast("Actividad eliminada", "info");
      }
      setShowDeleteConfirm(false);
    });
  }

  return (
    <>
      <div
        className={`relative rounded-3xl p-5 border transition ${
          activity.is_added
            ? "bg-cream-warm border-terracotta"
            : "bg-white border-border hover:border-sand-dark"
        }`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-cream flex items-center justify-center text-xl flex-shrink-0">
              {category.emoji}
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-brown-soft">{category.label}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full self-start ${confidenceBadge.color}`}
              >
                {confidenceBadge.text}
              </span>
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="w-8 h-8 rounded-full hover:bg-cream flex items-center justify-center text-brown-soft"
              aria-label="Opciones"
            >
              ⋮
            </button>
            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowMenu(false)}
                />
                <div className="absolute right-0 top-full mt-1 z-20 bg-white border border-border rounded-2xl shadow-lg overflow-hidden min-w-[160px]">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      setShowDeleteConfirm(true);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error/5 transition"
                  >
                    Quitar de la lista
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <h4 className="font-display text-lg font-medium text-brown-dark mb-2 leading-tight">
          {activity.name}
        </h4>

        {activity.description && (
          <p className="text-sm text-brown-mid font-light mb-3 line-clamp-3">
            {activity.description}
          </p>
        )}

        {activity.notes && (
          <div className="bg-cream rounded-xl px-3 py-2 mb-3">
            <p className="text-xs text-brown-mid italic">
              <span className="text-terracotta">✦</span> {activity.notes}
            </p>
          </div>
        )}

        <div className="flex items-center gap-3 text-xs text-brown-soft mb-4 flex-wrap">
          {activity.location_name && (
            <span className="flex items-center gap-1">
              📍{" "}
              <span className="truncate max-w-[150px]">
                {activity.location_name}
              </span>
            </span>
          )}
          {durationText && (
            <span className="flex items-center gap-1">⏱ {durationText}</span>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 pt-3 border-t border-border flex-wrap">
          <span className="font-display italic text-terracotta text-lg">
            {priceText}
          </span>
          <div className="flex items-center gap-2">
            {activity.is_added && (
              <AddToDayButton
                activityId={activity.id}
                tripId={tripId}
                days={tripDays}
                currentDay={scheduleItem?.day_date}
              />
            )}
            <button
              onClick={handleToggle}
              disabled={isPending}
              className={`text-sm px-4 py-2 rounded-full font-medium transition ${
                activity.is_added
                  ? "bg-terracotta text-cream"
                  : "bg-cream text-brown-dark hover:bg-cream-warm"
              } disabled:opacity-50`}
            >
              {isPending
                ? "..."
                : activity.is_added
                ? "✓ En plan"
                : "+ Agregar"}
            </button>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => !isPending && setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title={`¿Borrar "${activity.name}"?`}
        description="Esta actividad se quitará del catálogo. Si la tenías programada, también se quitará del calendario."
        confirmLabel="Sí, borrar"
        variant="danger"
        loading={isPending}
      />
    </>
  );
}
