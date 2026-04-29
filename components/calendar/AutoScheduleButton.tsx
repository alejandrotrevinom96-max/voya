"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import Spinner from "@/components/ui/Spinner";

interface AutoScheduleButtonProps {
  tripId: string;
  unscheduledCount: number;
}

export default function AutoScheduleButton({
  tripId,
  unscheduledCount,
}: AutoScheduleButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  async function handleAutoSchedule() {
    if (loading || unscheduledCount === 0) return;

    setLoading(true);

    try {
      const res = await fetch("/api/schedule/auto", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.error || "Algo salió mal", "error");
        setLoading(false);
        return;
      }

      const scheduled = data.scheduledCount || 0;
      const skipped = data.skippedCount || 0;

      let message = `✨ ${scheduled} ${
        scheduled === 1 ? "actividad agendada" : "actividades agendadas"
      }`;
      if (skipped > 0) {
        message += ` (${skipped} omitidas para no sobrecargar)`;
      }

      showToast(message, "success");
      router.refresh();
      setLoading(false);
    } catch (err) {
      showToast("Sin conexión. Verifica tu internet.", "error");
      setLoading(false);
    }
  }

  if (unscheduledCount === 0) {
    return null;
  }

  return (
    <div>
      <button
        onClick={handleAutoSchedule}
        disabled={loading}
        className="btn-primary w-full sm:w-auto disabled:opacity-50"
      >
        {loading ? (
          <>
            <Spinner size="sm" />
            <span>Organizando tu viaje...</span>
          </>
        ) : (
          <>
            <span>✨</span>
            <span>
              Auto-agendar {unscheduledCount}{" "}
              {unscheduledCount === 1 ? "actividad" : "actividades"}
            </span>
          </>
        )}
      </button>

      {loading && (
        <p className="text-xs text-brown-soft mt-3 italic">
          La AI está creando un itinerario realista para ti. Tarda 10-20 segundos.
        </p>
      )}
    </div>
  );
}
