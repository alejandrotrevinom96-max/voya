"use client";

import { useState } from "react";

interface VotingWelcomeProps {
  ownerName: string;
  tripName: string;
  destination: string;
  country: string | null;
  emoji: string;
  formattedDates: string;
  activitiesCount: number;
  tripTypeLabel: string | null;
  tripTypeEmoji: string | null;
  onStart: (name: string) => void;
}

export default function VotingWelcome({
  ownerName,
  tripName,
  destination,
  country,
  emoji,
  formattedDates,
  activitiesCount,
  tripTypeLabel,
  tripTypeEmoji,
  onStart,
}: VotingWelcomeProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 1) {
      setError("Escribe tu nombre para continuar");
      return;
    }
    if (trimmed.length > 50) {
      setError("Máximo 50 caracteres");
      return;
    }
    onStart(trimmed);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="max-w-lg w-full">
        {/* Header con emoji del viaje */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-cream-warm text-5xl mb-4">
            {emoji || "✈️"}
          </div>
          <p className="text-brown-soft text-sm uppercase tracking-wider mb-2">
            {ownerName} te invitó a votar en
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-light text-brown-dark mb-1">
            {tripName}
          </h1>
          <p className="text-brown-mid">
            {destination}
            {country ? `, ${country}` : ""}
          </p>
        </div>

        {/* Card con detalles del viaje */}
        <div className="card-base mb-6">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <p className="text-xs uppercase tracking-wider text-brown-soft mb-1">
                Fechas
              </p>
              <p className="font-medium text-brown-dark">{formattedDates}</p>
            </div>
            {tripTypeLabel && (
              <div className="text-right">
                <p className="text-xs uppercase tracking-wider text-brown-soft mb-1">
                  Tipo
                </p>
                <p className="font-medium text-brown-dark">
                  {tripTypeEmoji} {tripTypeLabel}
                </p>
              </div>
            )}
          </div>
          <div className="pt-4 border-t border-border">
            <p className="text-sm text-brown-mid">
              <span className="font-medium text-brown-dark">
                {activitiesCount}
              </span>{" "}
              {activitiesCount === 1 ? "actividad" : "actividades"} para votar
            </p>
          </div>
        </div>

        {/* Form: pedir solo nombre */}
        <form onSubmit={handleSubmit} className="card-base">
          <h2 className="font-display text-xl text-brown-dark mb-2">
            ¿Cómo te llamas?
          </h2>
          <p className="text-sm text-brown-mid mb-4">
            Solo tu nombre. Sin cuenta, sin contraseña.
          </p>

          <input
            type="text"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError("");
            }}
            placeholder="Ej: Lucía"
            maxLength={50}
            autoFocus
            className="input-base mb-3"
          />

          {error && (
            <p className="text-error text-sm mb-3">{error}</p>
          )}

          <button type="submit" className="btn-primary w-full">
            Empezar a votar →
          </button>

          <p className="text-xs text-brown-soft text-center mt-4 italic">
            Tus votos son visibles solo para {ownerName}.
          </p>
        </form>
      </div>
    </div>
  );
}
