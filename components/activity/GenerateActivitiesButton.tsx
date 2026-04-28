"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Spinner from "@/components/ui/Spinner";
import { useToast } from "@/components/ui/Toast";

interface GenerateActivitiesButtonProps {
  tripId: string;
  hasExistingActivities: boolean;
}

export default function GenerateActivitiesButton({
  tripId,
  hasExistingActivities,
}: GenerateActivitiesButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { showToast } = useToast();

  async function generate() {
    setLoading(true);
    setShowConfirm(false);

    try {
      const res = await fetch("/api/activities/generate", {
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

      showToast(
        `${data.count} actividades generadas ✦`,
        "success"
      );
      router.refresh();
      setLoading(false);
    } catch (err) {
      showToast("Sin conexión. Verifica tu internet.", "error");
      setLoading(false);
    }
  }

  function handleClick() {
    if (hasExistingActivities) {
      setShowConfirm(true);
    } else {
      generate();
    }
  }

  return (
    <>
      <div>
        <button
          onClick={handleClick}
          disabled={loading}
          className="btn-primary w-full sm:w-auto disabled:opacity-50"
        >
          {loading ? (
            <>
              <Spinner size="sm" />
              <span>Pensando en tu viaje...</span>
            </>
          ) : (
            <>
              <span>✦</span>
              <span>
                {hasExistingActivities
                  ? "Generar más actividades"
                  : "Descubrir actividades con AI"}
              </span>
            </>
          )}
        </button>

        {loading && (
          <p className="text-xs text-brown-soft mt-3 italic">
            Esto puede tardar 15-30 segundos. La AI está investigando los
            mejores lugares para tu viaje.
          </p>
        )}
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={generate}
        title="¿Generar más actividades?"
        description="Esto agregará MÁS opciones al catálogo (no reemplaza las existentes). Las que ya tienes en tu plan se mantienen."
        confirmLabel="Sí, generar más"
      />
    </>
  );
}
