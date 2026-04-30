"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/Toast";

interface InviteShareButtonProps {
  tripId: string;
  initialToken: string | null;
  initialEnabled: boolean;
  hasAddedActivities: boolean;
}

export default function InviteShareButton({
  tripId,
  initialToken,
  initialEnabled,
  hasAddedActivities,
}: InviteShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [enabled, setEnabled] = useState(initialEnabled);
  const [token, setToken] = useState<string | null>(initialToken);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const inviteUrl =
    token && typeof window !== "undefined"
      ? `${window.location.origin}/invite/${token}`
      : "";

  async function handleEnable() {
    if (loading) return;
    setLoading(true);

    try {
      const res = await fetch("/api/invite/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId }),
      });

      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || "Error al activar votación", "error");
        setLoading(false);
        return;
      }

      setToken(data.token);
      setEnabled(true);
      setLoading(false);
    } catch (e) {
      showToast("Sin conexión", "error");
      setLoading(false);
    }
  }

  async function handleDisable() {
    if (loading) return;
    if (!confirm("Si cierras la votación, los invitados no podrán seguir votando. ¿Continuar?")) {
      return;
    }
    setLoading(true);

    try {
      const res = await fetch("/api/invite/create", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tripId }),
      });

      if (!res.ok) {
        showToast("Error al cerrar votación", "error");
        setLoading(false);
        return;
      }

      setEnabled(false);
      setLoading(false);
      showToast("Votación cerrada", "info");
    } catch (e) {
      showToast("Sin conexión", "error");
      setLoading(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(inviteUrl);
    showToast("Link copiado ✓", "success");
  }

  function handleWhatsApp() {
    const text = encodeURIComponent(
      `Hola! Estoy planeando un viaje y quiero saber qué te late. Vota aquí (sin cuenta, en 2 minutos): ${inviteUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  if (!hasAddedActivities) {
    return (
      <button
        disabled
        className="btn-secondary text-sm opacity-50 cursor-not-allowed"
        title="Agrega actividades al plan para poder invitar"
      >
        💌 Invitar a votar
      </button>
    );
  }

  return (
    <>
      <button onClick={() => setIsOpen(true)} className="btn-secondary text-sm">
        💌 {enabled ? "Compartir votación" : "Invitar a votar"}
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 bg-brown-dark/40 backdrop-blur-sm z-50 flex items-center justify-center px-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-2xl text-brown-dark">
                Invita a votar
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-cream flex items-center justify-center text-brown-soft text-xl"
              >
                ×
              </button>
            </div>

            {!enabled ? (
              <>
                <p className="text-brown-mid mb-6 font-light">
                  Comparte un link con tus amigas o pareja. Ven el itinerario y
                  votan cada actividad. <span className="italic">Tú decides al final</span>.
                </p>
                <div className="bg-cream-warm rounded-2xl p-4 mb-6">
                  <p className="text-sm text-brown-mid mb-3">Ellas pueden:</p>
                  <ul className="text-sm text-brown-dark space-y-1.5 ml-4">
                    <li>• Ver tu itinerario sin crear cuenta</li>
                    <li>• Votar 👍 / 🤷 / 👎 cada actividad</li>
                    <li>• Sin invitarse entre sí (solo a través de tu link)</li>
                  </ul>
                </div>
                <button
                  onClick={handleEnable}
                  disabled={loading}
                  className="btn-primary w-full"
                >
                  {loading ? "Generando link..." : "Activar votación"}
                </button>
              </>
            ) : (
              <>
                <p className="text-brown-mid mb-4 font-light">
                  Comparte este link. Quien tenga el link puede votar.
                </p>

                <div className="flex items-center gap-2 bg-cream rounded-2xl px-4 py-3 mb-4">
                  <span className="text-sm text-brown-dark truncate flex-1 font-mono">
                    {inviteUrl}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="text-xs px-3 py-1.5 rounded-full bg-brown-dark text-cream hover:opacity-90 flex-shrink-0"
                  >
                    Copiar
                  </button>
                </div>

                <button
                  onClick={handleWhatsApp}
                  className="w-full bg-[#25D366] hover:bg-[#1ea556] text-white py-3 rounded-full font-medium mb-3 flex items-center justify-center gap-2"
                >
                  <span>💬</span>
                  <span>Compartir por WhatsApp</span>
                </button>

                <button
                  onClick={handleDisable}
                  disabled={loading}
                  className="w-full text-sm text-brown-soft hover:text-error py-2"
                >
                  Cerrar votación
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
