"use client";

import Link from "next/link";
import type { DemoTripPreview } from "@/lib/landing-demo/types";

interface DemoResultsProps {
  preview: DemoTripPreview;
  onShareIntent: () => void;
  onResetSearch: () => void;
}

function formatMXN(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.round(minutes / 60);
  return hours === 1 ? "1 hora" : `${hours} horas`;
}

export default function DemoResults({
  preview,
  onShareIntent,
  onResetSearch,
}: DemoResultsProps) {
  return (
    <div className="voyaa-demo-results">
      {/* Header del trip */}
      <div className="voyaa-demo-trip-header">
        <button
          onClick={onResetSearch}
          className="voyaa-demo-reset-btn"
          aria-label="Buscar otro destino"
        >
          ← Otro destino
        </button>

        <div className="voyaa-demo-trip-emoji">{preview.trip_emoji}</div>
        <h2 className="voyaa-demo-trip-name">
          Tu viaje a {preview.destination_display}
        </h2>
        <p className="voyaa-demo-trip-summary">{preview.trip_summary}</p>
      </div>

      {/* CTAs principales arriba (también van abajo) */}
      <div className="voyaa-demo-cta-row voyaa-demo-cta-row-top">
        <Link
          href={`/auth/signup?from=demo&dest=${encodeURIComponent(preview.destination_key)}`}
          className="voyaa-demo-cta-primary"
        >
          🔓 Desbloquear itinerario completo
        </Link>
        <button
          onClick={onShareIntent}
          className="voyaa-demo-cta-secondary"
          type="button"
        >
          💌 Compartir con mi pareja
        </button>
      </div>

      {/* Actividades visibles */}
      <div className="voyaa-demo-activities-section">
        <p className="voyaa-demo-section-eyebrow">
          Aquí va una probada de tu viaje · {preview.visible_activities.length} de{" "}
          {preview.visible_activities.length + preview.blurred_activities.length}{" "}
          actividades
        </p>

        <div className="voyaa-demo-activities-grid">
          {preview.visible_activities.map((act) => (
            <div key={act.id} className="voyaa-demo-activity-card">
              {act.highlight_label && (
                <span className="voyaa-demo-highlight-label">
                  {act.highlight_label}
                </span>
              )}
              <div className="voyaa-demo-activity-emoji">{act.emoji}</div>
              <h3 className="voyaa-demo-activity-name">{act.name}</h3>
              <p className="voyaa-demo-activity-desc">{act.description}</p>
              <div className="voyaa-demo-activity-meta">
                {act.location_hint && (
                  <span className="voyaa-demo-activity-loc">
                    📍 {act.location_hint}
                  </span>
                )}
                <span className="voyaa-demo-activity-cost">
                  {act.estimated_cost === 0
                    ? "Gratis"
                    : formatMXN(act.estimated_cost)}
                </span>
                {act.duration_minutes > 0 && (
                  <span className="voyaa-demo-activity-time">
                    ⏱ {formatDuration(act.duration_minutes)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Actividades blureadas */}
      <div className="voyaa-demo-blurred-section">
        <div className="voyaa-demo-blurred-header">
          <span className="voyaa-demo-lock-icon">🔒</span>
          <span className="voyaa-demo-blurred-title">
            +{preview.blurred_activities.length} actividades únicas en tu itinerario completo
          </span>
        </div>

        <div className="voyaa-demo-blurred-grid">
          {preview.blurred_activities.map((act) => (
            <div key={act.id} className="voyaa-demo-blurred-card">
              <div className="voyaa-demo-blurred-content">
                {act.highlight_label && (
                  <span className="voyaa-demo-highlight-label voyaa-demo-highlight-blurred">
                    {act.highlight_label}
                  </span>
                )}
                <div className="voyaa-demo-blurred-emoji">{act.emoji}</div>
                <p className="voyaa-demo-blurred-teaser">{act.teaser}</p>
              </div>
              <div className="voyaa-demo-blur-overlay" />
            </div>
          ))}
        </div>

        <p className="voyaa-demo-blurred-footer">
          Incluye: cenas con vista, spots locales secretos, ruta de cafés,
          experiencias únicas y más.
        </p>
      </div>

      {/* CTAs finales */}
      <div className="voyaa-demo-cta-row voyaa-demo-cta-row-bottom">
        <Link
          href={`/auth/signup?from=demo&dest=${encodeURIComponent(preview.destination_key)}`}
          className="voyaa-demo-cta-primary voyaa-demo-cta-large"
        >
          🔓 Desbloquear mi itinerario completo
        </Link>
        <p className="voyaa-demo-cta-microcopy">
          Crea tu cuenta gratis · 30 segundos · sin tarjeta
        </p>
      </div>
    </div>
  );
}
