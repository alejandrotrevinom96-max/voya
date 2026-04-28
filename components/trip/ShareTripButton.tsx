"use client";

import { useState, useTransition } from "react";
import {
  enableShareLink,
  disableShareLink,
  regenerateShareLink,
} from "@/app/trip/actions";
import { useToast } from "@/components/ui/Toast";
import ConfirmModal from "@/components/ui/ConfirmModal";

interface ShareTripButtonProps {
  tripId: string;
  shareToken: string | null;
  isShareEnabled: boolean;
}

export default function ShareTripButton({
  tripId,
  shareToken,
  isShareEnabled,
}: ShareTripButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);
  const { showToast } = useToast();

  const shareUrl =
    shareToken && typeof window !== "undefined"
      ? `${window.location.origin}/share/${shareToken}`
      : "";

  const isActive = isShareEnabled && shareToken;

  function handleEnable() {
    startTransition(async () => {
      const result = await enableShareLink(tripId);
      if (result.error) {
        showToast(result.error, "error");
      } else {
        showToast("Link de compartir activado ✓", "success");
      }
    });
  }

  function handleDisable() {
    startTransition(async () => {
      const result = await disableShareLink(tripId);
      if (result.error) {
        showToast(result.error, "error");
      } else {
        showToast("Link desactivado", "info");
      }
    });
  }

  function handleRegenerate() {
    startTransition(async () => {
      const result = await regenerateShareLink(tripId);
      if (result.error) {
        showToast(result.error, "error");
      } else {
        showToast("Link nuevo generado ✓", "success");
      }
      setShowRegenerateConfirm(false);
    });
  }

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast("Link copiado ✓", "success");
    } catch {
      showToast("No se pudo copiar. Selecciónalo manualmente.", "error");
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn-secondary text-sm"
      >
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
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
          <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
        </svg>
        <span>Compartir</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 bg-brown-dark/40 z-[90]"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed inset-0 z-[91] flex items-center justify-center p-4 pointer-events-none">
            <div
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-display text-xl font-medium text-brown-dark">
                  Compartir viaje
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-brown-soft hover:text-brown-dark text-xl leading-none -mt-1"
                >
                  ✕
                </button>
              </div>
              <p className="text-brown-mid text-sm mb-6 leading-relaxed">
                Genera un link público para que cualquier persona pueda ver tu
                viaje (modo lectura, sin necesidad de cuenta).
              </p>

              {!isActive ? (
                <div className="space-y-4">
                  <div className="bg-cream-warm rounded-2xl p-4 text-sm text-brown-mid">
                    El link estará desactivado hasta que lo generes. Quien tenga
                    el link podrá ver:
                    <ul className="mt-2 space-y-1 text-xs">
                      <li>· Detalles del viaje (destino, fechas, etc.)</li>
                      <li>· Actividades sugeridas</li>
                      <li>· Itinerario por día</li>
                      <li>· Presupuesto estimado</li>
                    </ul>
                  </div>
                  <button
                    onClick={handleEnable}
                    disabled={isPending}
                    className="btn-primary w-full"
                  >
                    {isPending ? "Generando..." : "Generar link de compartir"}
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium uppercase tracking-wider text-brown-soft mb-2">
                      Tu link público
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={shareUrl}
                        readOnly
                        onClick={(e) => e.currentTarget.select()}
                        className="input-base text-sm flex-1 bg-cream-warm cursor-pointer"
                      />
                      <button
                        onClick={copyToClipboard}
                        className="px-4 py-3 rounded-2xl bg-brown-dark text-cream font-medium text-sm hover:scale-105 active:scale-95 transition flex-shrink-0"
                      >
                        Copiar
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-success bg-success/10 px-3 py-2 rounded-xl">
                    <span>✓</span>
                    <span>Link activo · Cualquiera con el link puede ver el viaje</span>
                  </div>

                  <div className="flex flex-col gap-2 pt-3 border-t border-border">
                    <button
                      onClick={() => setShowRegenerateConfirm(true)}
                      disabled={isPending}
                      className="text-sm text-brown-mid hover:bg-cream-warm px-4 py-2 rounded-full transition"
                    >
                      🔄 Generar nuevo link (revoca el anterior)
                    </button>
                    <button
                      onClick={handleDisable}
                      disabled={isPending}
                      className="text-sm text-error hover:bg-error/10 px-4 py-2 rounded-full transition"
                    >
                      Desactivar link
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      <ConfirmModal
        isOpen={showRegenerateConfirm}
        onClose={() => !isPending && setShowRegenerateConfirm(false)}
        onConfirm={handleRegenerate}
        title="¿Generar link nuevo?"
        description="El link anterior dejará de funcionar inmediatamente. Cualquiera que lo tenga ya no podrá acceder. Los nuevos links permanecen activos hasta que los desactives."
        confirmLabel="Sí, generar nuevo"
        loading={isPending}
      />
    </>
  );
}
