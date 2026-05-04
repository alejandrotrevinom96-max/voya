"use client";

import { useState, useEffect } from "react";
import { track } from "@vercel/analytics";
import AnimatedSearchBar from "./AnimatedSearchBar";
import DemoResults from "./DemoResults";
import DemoModal from "./DemoModal";
import {
  saveTripToLocalStorage,
  loadTripFromLocalStorage,
  clearStoredTrip,
} from "@/lib/landing-demo/storage";
import type {
  DemoTripPreview,
  GeneratePreviewResponse,
} from "@/lib/landing-demo/types";

type ModalVariant = "rate_limit" | "share_intent" | "no_destination" | null;

export default function LandingDemoHero() {
  const [preview, setPreview] = useState<DemoTripPreview | null>(null);
  const [lastQuery, setLastQuery] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modalVariant, setModalVariant] = useState<ModalVariant>(null);
  const [showRecoveryBanner, setShowRecoveryBanner] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hidratar desde localStorage al cargar
  useEffect(() => {
    const stored = loadTripFromLocalStorage();
    if (stored) {
      setShowRecoveryBanner(true);
    }
    setHydrated(true);
  }, []);

  function recoverPreviousTrip() {
    const stored = loadTripFromLocalStorage();
    if (stored) {
      setPreview(stored.preview);
      setLastQuery(stored.query);
      setShowRecoveryBanner(false);
      // Scroll al hero suavemente
      setTimeout(() => {
        document
          .querySelector(".voyaa-demo-results")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  }

  function dismissRecoveryBanner() {
    clearStoredTrip();
    setShowRecoveryBanner(false);
  }

  async function handleGenerate(query: string, fingerprint: string) {
    setIsLoading(true);
    setError(null);
    setLastQuery(query);

    try {
      const res = await fetch("/api/landing/generate-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, fingerprint }),
      });

      const data: GeneratePreviewResponse = await res.json();

      if (!res.ok || !data.success) {
        const errorType = data.error || "unknown";
        track("demo_error", { error_type: errorType });
        if (data.error === "limit_reached") {
          setModalVariant("rate_limit");
        } else if (data.error === "no_destination") {
          setModalVariant("no_destination");
        } else {
          setError(data.error || "Algo salió mal — intenta de nuevo");
        }
        setIsLoading(false);
        return;
      }

      if (data.preview) {
        track("demo_preview_shown", { destination_key: data.preview.destination_key });
        setPreview(data.preview);
        saveTripToLocalStorage(data.preview, query);
        setShowRecoveryBanner(false);

        // Scroll suave al resultado
        setTimeout(() => {
          document
            .querySelector(".voyaa-demo-results")
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 200);
      }
    } catch (err) {
      console.error("Generate failed:", err);
      setError("Sin conexión — intenta de nuevo");
    } finally {
      setIsLoading(false);
    }
  }

  function handleResetSearch() {
    setPreview(null);
    setLastQuery("");
    setError(null);
    clearStoredTrip();
    // Scroll arriba
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleShareIntent() {
    setModalVariant("share_intent");
  }

  return (
    <>
      {/* Hero search (siempre visible si no hay preview) */}
      {!preview && (
        <section className="voyaa-demo-hero" id="voyaa-search-anchor">
          <div className="container">
            <div className="hero-tag">🌴 Pruébalo gratis · sin cuenta</div>
            <h1>
              Deja de pensar.
              <br />
              Tu viaje, ya{" "}
              <span className="underline-word">
                <em>planeado</em>
              </span>
              .
            </h1>
            <p className="hero-sub">
              Escribe a dónde y por qué. Voyaa arma un itinerario real con
              actividades, presupuesto y todo. <strong>En 30 segundos.</strong>
            </p>

            <AnimatedSearchBar
              onSubmit={handleGenerate}
              isLoading={isLoading}
              disabled={false}
            />

            {error && (
              <p className="voyaa-demo-error">{error}</p>
            )}

            {/* Banner de recuperación */}
            {hydrated && showRecoveryBanner && (
              <div className="voyaa-demo-recovery-banner">
                <span>
                  ✨ ¿Sigues planeando tu viaje? Ya tenías uno guardado.
                </span>
                <div className="voyaa-demo-recovery-actions">
                  <button
                    type="button"
                    onClick={recoverPreviousTrip}
                    className="voyaa-demo-recovery-btn-primary"
                  >
                    Continuar →
                  </button>
                  <button
                    type="button"
                    onClick={dismissRecoveryBanner}
                    className="voyaa-demo-recovery-btn-dismiss"
                    aria-label="Descartar"
                  >
                    ×
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Resultados (visible si hay preview) */}
      {preview && (
        <section className="voyaa-demo-results-section">
          <div className="container">
            <DemoResults
              preview={preview}
              onShareIntent={handleShareIntent}
              onResetSearch={handleResetSearch}
            />
          </div>
        </section>
      )}

      {/* Modal */}
      <DemoModal
        open={modalVariant !== null}
        onClose={() => setModalVariant(null)}
        variant={modalVariant || "rate_limit"}
        destinationKey={preview?.destination_key}
      />
    </>
  );
}
