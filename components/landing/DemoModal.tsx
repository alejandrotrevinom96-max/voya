"use client";

import Link from "next/link";

interface DemoModalProps {
  open: boolean;
  onClose: () => void;
  variant: "rate_limit" | "share_intent" | "no_destination";
  destinationKey?: string;
}

export default function DemoModal({
  open,
  onClose,
  variant,
  destinationKey,
}: DemoModalProps) {
  if (!open) return null;

  return (
    <div
      className="voyaa-modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="voyaa-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="voyaa-modal-close"
          aria-label="Cerrar"
          type="button"
        >
          ×
        </button>

        {variant === "rate_limit" && (
          <>
            <div className="voyaa-modal-emoji">🌴</div>
            <h2 className="voyaa-modal-title">Has probado Voyaa 2 veces.</h2>
            <p className="voyaa-modal-body">
              Para seguir generando viajes, crea tu cuenta gratis. Todo gratis
              durante beta — sin tarjeta, sin truco.
            </p>
            <Link
              href={`/auth/signup?from=demo${destinationKey ? `&dest=${encodeURIComponent(destinationKey)}` : ""}`}
              className="voyaa-modal-cta"
            >
              Crear mi cuenta gratis →
            </Link>
            <p className="voyaa-modal-microcopy">
              30 segundos · sin tarjeta · viajes ilimitados durante beta
            </p>
          </>
        )}

        {variant === "share_intent" && (
          <>
            <div className="voyaa-modal-emoji">💌</div>
            <h2 className="voyaa-modal-title">
              Compartir con tu pareja o amigas
            </h2>
            <p className="voyaa-modal-body">
              Para que otras personas puedan votar tu itinerario, primero
              guárdalo en tu cuenta. Toma 30 segundos.
            </p>
            <Link
              href={`/auth/signup?from=demo-share${destinationKey ? `&dest=${encodeURIComponent(destinationKey)}` : ""}`}
              className="voyaa-modal-cta"
            >
              Crear cuenta y compartir →
            </Link>
            <p className="voyaa-modal-microcopy">
              Tu viaje queda guardado · invitas con un link · ellas votan sin
              cuenta
            </p>
          </>
        )}

        {variant === "no_destination" && (
          <>
            <div className="voyaa-modal-emoji">🤔</div>
            <h2 className="voyaa-modal-title">
              ¿A qué destino te refieres?
            </h2>
            <p className="voyaa-modal-body">
              No reconocí un destino en tu mensaje. Prueba con algo como:
              <br />
              <em>&ldquo;Tulum 5 días&rdquo;</em> o{" "}
              <em>&ldquo;Oaxaca con amigas&rdquo;</em>.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="voyaa-modal-cta"
            >
              Intentar de nuevo
            </button>
          </>
        )}
      </div>
    </div>
  );
}
