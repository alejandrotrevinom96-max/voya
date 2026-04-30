"use client";

import { useState, useMemo } from "react";
import type { Activity } from "@/types";
import type { VoteType } from "@/lib/voting/types";
import { CATEGORY_LABELS } from "@/types";
import { formatCurrency } from "@/lib/utils/date";

interface TripBasic {
  id: string;
  name: string;
  destination: string;
  country: string | null;
  emoji: string;
  start_date: string;
  end_date: string;
  cities: string[];
  currency: string;
}

interface VotingInterfaceProps {
  trip: TripBasic;
  tripTypeLabel: string | null;
  tripTypeEmoji: string | null;
  formattedDates: string;
  ownerName: string;
  activities: Activity[];
  token: string;
  voterName: string;
  sessionId: string;
  onComplete: () => void;
}

export default function VotingInterface({
  trip,
  ownerName,
  activities,
  token,
  voterName,
  sessionId,
  onComplete,
}: VotingInterfaceProps) {
  // Estado local: votos por activity_id
  const [votes, setVotes] = useState<Record<string, VoteType>>({});
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");

  const votedCount = useMemo(() => Object.keys(votes).length, [votes]);
  const totalCount = activities.length;
  const allVoted = votedCount === totalCount;

  async function castVote(activityId: string, vote: VoteType) {
    if (pending[activityId]) return;

    // Optimistic update
    setVotes((prev) => ({ ...prev, [activityId]: vote }));
    setPending((prev) => ({ ...prev, [activityId]: true }));
    setError("");

    try {
      const res = await fetch("/api/votes/cast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          activityId,
          vote,
          sessionId,
          voterName,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        // Revertir cambio optimista
        setVotes((prev) => {
          const next = { ...prev };
          delete next[activityId];
          return next;
        });
        setError(data.error || "No se pudo guardar el voto");
      }
    } catch (err) {
      setVotes((prev) => {
        const next = { ...prev };
        delete next[activityId];
        return next;
      });
      setError("Sin conexión. Intenta otra vez.");
    } finally {
      setPending((prev) => {
        const next = { ...prev };
        delete next[activityId];
        return next;
      });
    }
  }

  return (
    <div className="px-6 md:px-12 py-8 max-w-3xl mx-auto">
      {/* Header sticky con progreso */}
      <div className="sticky top-0 -mx-6 md:-mx-12 px-6 md:px-12 pt-2 pb-4 bg-cream z-10 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-brown-soft uppercase tracking-wider">
              Hola, {voterName}
            </p>
            <h1 className="font-display text-xl md:text-2xl text-brown-dark">
              {trip.emoji} {trip.name}
            </h1>
          </div>
          <div className="text-right">
            <p className="text-xs text-brown-soft uppercase tracking-wider">
              Progreso
            </p>
            <p className="font-medium text-brown-dark">
              {votedCount} / {totalCount}
            </p>
          </div>
        </div>
        {/* Barra de progreso */}
        <div className="h-1.5 bg-sand rounded-full overflow-hidden">
          <div
            className="h-full bg-terracotta transition-all duration-300"
            style={{ width: `${(votedCount / totalCount) * 100}%` }}
          />
        </div>
      </div>

      {/* Instrucciones */}
      <div className="card-base mb-6 bg-cream-warm border-terracotta-soft">
        <p className="text-sm text-brown-mid font-light">
          <strong className="text-brown-dark">Vota cada actividad</strong> para
          que {ownerName} sepa qué te late, qué no, y qué da igual.{" "}
          <span className="italic">{ownerName} decide al final</span>.
        </p>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-2xl bg-error/10 text-error text-sm mb-4">
          {error}
        </div>
      )}

      {/* Lista de actividades */}
      <div className="space-y-3">
        {activities.map((activity) => {
          const myVote = votes[activity.id];
          const isPending = pending[activity.id];
          const category = CATEGORY_LABELS[activity.category];

          const priceText =
            activity.estimated_price_min === 0 &&
            activity.estimated_price_max === 0
              ? "Gratis"
              : activity.estimated_price_min === activity.estimated_price_max
              ? formatCurrency(activity.estimated_price_min ?? 0, trip.currency)
              : `${formatCurrency(
                  activity.estimated_price_min ?? 0,
                  trip.currency
                )} - ${formatCurrency(
                  activity.estimated_price_max ?? 0,
                  trip.currency
                )}`;

          return (
            <div
              key={activity.id}
              className={`rounded-3xl p-5 border-2 transition ${
                myVote
                  ? myVote === "up"
                    ? "bg-success/5 border-success/30"
                    : myVote === "down"
                    ? "bg-error/5 border-error/30"
                    : "bg-cream-warm border-sand-dark"
                  : "bg-white border-border"
              } ${isPending ? "opacity-60" : ""}`}
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-cream flex items-center justify-center text-xl flex-shrink-0">
                  {category.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-brown-soft mb-1">
                    {category.label}
                  </p>
                  <h3 className="font-display text-lg font-medium text-brown-dark leading-tight">
                    {activity.name}
                  </h3>
                </div>
              </div>

              {activity.description && (
                <p className="text-sm text-brown-mid font-light mb-3 line-clamp-3">
                  {activity.description}
                </p>
              )}

              <div className="flex items-center gap-3 text-xs text-brown-soft mb-4 flex-wrap">
                {activity.location_name && (
                  <span>📍 {activity.location_name}</span>
                )}
                <span className="font-display italic text-terracotta">
                  {priceText}
                </span>
              </div>

              {/* Botones de voto */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => castVote(activity.id, "up")}
                  disabled={isPending}
                  className={`py-3 rounded-2xl font-medium text-sm transition ${
                    myVote === "up"
                      ? "bg-success text-white"
                      : "bg-cream hover:bg-cream-warm text-brown-dark"
                  } disabled:opacity-50`}
                >
                  👍 Me late
                </button>
                <button
                  onClick={() => castVote(activity.id, "meh")}
                  disabled={isPending}
                  className={`py-3 rounded-2xl font-medium text-sm transition ${
                    myVote === "meh"
                      ? "bg-brown-soft text-white"
                      : "bg-cream hover:bg-cream-warm text-brown-dark"
                  } disabled:opacity-50`}
                >
                  🤷 Da igual
                </button>
                <button
                  onClick={() => castVote(activity.id, "down")}
                  disabled={isPending}
                  className={`py-3 rounded-2xl font-medium text-sm transition ${
                    myVote === "down"
                      ? "bg-error text-white"
                      : "bg-cream hover:bg-cream-warm text-brown-dark"
                  } disabled:opacity-50`}
                >
                  👎 No, gracias
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* CTA al terminar */}
      <div className="mt-8 sticky bottom-4">
        <button
          onClick={onComplete}
          disabled={votedCount === 0}
          className={`btn-primary w-full ${
            allVoted
              ? "bg-brown-dark"
              : votedCount > 0
              ? "bg-terracotta"
              : "opacity-50"
          }`}
        >
          {allVoted
            ? "✓ Ya voté todas — Terminar"
            : votedCount > 0
            ? `Ya votaste ${votedCount} de ${totalCount} — Terminar de todas formas`
            : "Vota al menos una para continuar"}
        </button>
      </div>
    </div>
  );
}
