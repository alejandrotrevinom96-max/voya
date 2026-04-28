"use client";

import { useState, useTransition } from "react";
import type { TripDay } from "@/lib/utils/calendar";
import { scheduleActivity } from "@/app/trip/schedule-actions";

interface AddToDayButtonProps {
  activityId: string;
  tripId: string;
  days: TripDay[];
  currentDay?: string | null;
}

export default function AddToDayButton({
  activityId,
  tripId,
  days,
  currentDay,
}: AddToDayButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleAssign(date: string) {
    setIsOpen(false);
    startTransition(async () => {
      await scheduleActivity(activityId, tripId, date);
    });
  }

  if (currentDay) {
    const day = days.find((d) => d.date === currentDay);
    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isPending}
          className="text-xs px-3 py-1.5 rounded-full bg-success/10 text-success font-medium hover:bg-success/20 transition disabled:opacity-50"
        >
          ✓ {day?.shortLabel || "Programada"} · cambiar
        </button>
        {isOpen && (
          <DayDropdown
            days={days}
            currentDay={currentDay}
            onSelect={handleAssign}
            onClose={() => setIsOpen(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isPending}
        className="text-xs px-3 py-1.5 rounded-full bg-cream text-brown-mid hover:bg-cream-warm transition disabled:opacity-50"
      >
        {isPending ? "..." : "📅 Asignar a día"}
      </button>
      {isOpen && (
        <DayDropdown
          days={days}
          onSelect={handleAssign}
          onClose={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}

function DayDropdown({
  days,
  currentDay,
  onSelect,
  onClose,
}: {
  days: TripDay[];
  currentDay?: string;
  onSelect: (date: string) => void;
  onClose: () => void;
}) {
  return (
    <>
      <div className="fixed inset-0 z-30" onClick={onClose} />
      <div className="absolute right-0 top-full mt-2 z-40 bg-white border border-border rounded-2xl shadow-lg overflow-hidden min-w-[200px] max-h-[280px] overflow-y-auto">
        <div className="px-3 py-2 border-b border-border bg-cream sticky top-0">
          <p className="text-xs uppercase tracking-wider text-brown-soft">
            Elige día
          </p>
        </div>
        {days.map((day) => (
          <button
            key={day.date}
            onClick={() => onSelect(day.date)}
            className={`w-full text-left px-3 py-2.5 text-sm hover:bg-cream-warm transition ${
              currentDay === day.date
                ? "bg-cream-warm font-medium"
                : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-brown-dark">
                Día {day.dayNumber} · {day.shortLabel}
              </span>
              {currentDay === day.date && (
                <span className="text-success text-xs">✓</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </>
  );
}
