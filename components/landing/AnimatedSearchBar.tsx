"use client";

import { useState, useEffect, useRef } from "react";
import { track } from "@vercel/analytics";

const ROTATING_PLACEHOLDERS = [
  // Frustración con la rutina
  "Tulum porque ya no aguanto otra junta",
  "CDMX porque vivo aburrida en mi pueblo",
  "Antártica porque ya no aguanto el calor",
  "Donde sea, ya no aguanto",
  // Transición de vida
  "Sayulita porque me voy a divorciar (mentira)",
  "Mérida porque empiezo de cero",
  "Holbox porque me prometí un viaje sola",
  "Puerto Escondido porque renuncié hoy",
  // Celebración / hito
  "San Miguel porque cumplo 30",
  "Bacalar porque aprobé mi tesis",
  "Cabo porque llevo 5 años en el mismo trabajo",
  // Conexión social
  "Oaxaca porque mi mejor amiga lo necesita",
  "Cancún con mis amigas porque ya nos hace falta",
  "Mérida porque mi mamá nunca ha viajado",
  "Valle de Guadalupe con mi novio porque le debo un viaje",
  // Sueños / FOMO
  "Bacalar porque vi un reel y me convencieron",
  "Tulum porque mi hermana ya fue 3 veces",
  "Japón porque algún día",
  // Auto-permiso
  "Quintana Roo porque puedo",
  "Veracruz porque me lo merezco",
];

const ROTATION_INTERVAL_MS = 4500;
const SLIDE_DURATION_MS = 400;

interface AnimatedSearchBarProps {
  onSubmit: (query: string, fingerprint: string) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export default function AnimatedSearchBar({
  onSubmit,
  isLoading,
  disabled,
}: AnimatedSearchBarProps) {
  const [value, setValue] = useState("");
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [hasTrackedTyped, setHasTrackedTyped] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus solo en desktop (mobile: abriría el teclado)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (!isMobile && inputRef.current) {
      const t = setTimeout(() => {
        inputRef.current?.focus();
      }, 600);
      return () => clearTimeout(t);
    }
  }, []);

  // Rotación del placeholder
  useEffect(() => {
    if (isFocused || value.length > 0) return; // pausa si el usuario está escribiendo

    const timer = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setPlaceholderIdx((prev) => (prev + 1) % ROTATING_PLACEHOLDERS.length);
        setIsAnimating(false);
      }, SLIDE_DURATION_MS);
    }, ROTATION_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [isFocused, value]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const query = value.trim();

    if (query.length < 2) {
      // Enfocar el input para que el usuario sepa que debe escribir
      inputRef.current?.focus();
      return;
    }

    if (isLoading || disabled) return;

    track("demo_submit", { query: query.substring(0, 50) });

    // Generar fingerprint simple del navegador
    const fingerprint = generateFingerprint();
    onSubmit(query, fingerprint);
  }

  return (
    <form onSubmit={handleSubmit} className="voyaa-search-form">
      <div className="voyaa-search-row">
        <span className="voyaa-search-brand">VoyAA</span>

        <div className="voyaa-search-input-wrap">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (!hasTrackedTyped && e.target.value.length > 0) {
                track("demo_input_typed");
                setHasTrackedTyped(true);
              }
            }}
            onFocus={() => {
              setIsFocused(true);
              track("demo_input_focused");
            }}
            onBlur={() => setIsFocused(false)}
            disabled={isLoading || disabled}
            maxLength={300}
            className="voyaa-search-input"
            aria-label="A dónde quieres ir"
          />

          {/* Placeholder animado custom — solo visible si input vacío */}
          {value.length === 0 && !isFocused && (
            <div className="voyaa-search-placeholder" aria-hidden="true">
              <span
                key={placeholderIdx}
                className={`voyaa-placeholder-text ${isAnimating ? "animating-out" : "animating-in"}`}
              >
                <span className="voyaa-placeholder-prefix">ej:</span>{" "}
                {ROTATING_PLACEHOLDERS[placeholderIdx]}
              </span>
            </div>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading || disabled}
        className="voyaa-search-cta"
      >
        {isLoading ? (
          <span className="voyaa-loading-text">
            <span className="voyaa-spinner" /> Generando tu viaje...
          </span>
        ) : (
          <>Generar mi viaje gratis →</>
        )}
      </button>

      <p className="voyaa-search-microcopy">
        ✨ Beta · sin tarjeta · 30 segundos
      </p>
    </form>
  );
}

/**
 * Genera un fingerprint simple del browser (no cripto).
 * Combina userAgent, screen, timezone, language.
 * Sirve para identificar el "mismo navegador" en rate limit.
 */
function generateFingerprint(): string {
  if (typeof window === "undefined") return "no_window";

  try {
    const parts = [
      navigator.userAgent || "",
      `${screen.width}x${screen.height}`,
      Intl.DateTimeFormat().resolvedOptions().timeZone || "",
      navigator.language || "",
    ];
    return parts.join("|").substring(0, 200);
  } catch {
    return "fp_error";
  }
}
