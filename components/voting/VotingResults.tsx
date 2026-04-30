"use client";

import { useState, useEffect, useMemo } from "react";
import type { Activity } from "@/types";
import type { TripVotingSummary } from "@/lib/voting/types";

interface VotingResultsProps {
  tripId: string;
  activities: Activity[];
  votingEnabled: boolean;
}

export default function VotingResults({
  tripId,
  activities,
  votingEnabled,
}: VotingResultsProps) {
  const [summary, setSummary] = useState<TripVotingSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!votingEnabled) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    async function load() {
      try {
        const res = await fetch(`/api/votes/summary?tripId=${tripId}`);
        if (!res.ok) {
          setLoading(false);
          return;
        }
        const data = await res.json();
        if (!cancelled) {
          setSummary(data);
          setLoading(false);
        }
      } catch (e) {
        if (!cancelled) setLoading(false);
      }
    }
    load();

    // Auto-refrescar cada 30 segundos
    const timer = setInterval(load, 30000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [tripId, votingEnabled]);

  // Map de votos por activity_id
  const votesByActivity = useMemo(() => {
    if (!summary) return new Map();
    return new Map(summary.by_activity.map((s) => [s.activity_id, s]));
  }, [summary]);

  if (!votingEnabled) return null;

  if (loading) {
    return (
      <div className="card-base text-center py-8">
        <p className="text-sm text-brown-soft">Cargando resultados...</p>
      </div>
    );
  }

  if (!summary || summary.total_votes === 0) {
    return (
      <div className="card-base bg-cream-warm border-terracotta-soft">
        <h3 className="font-display text-lg text-brown-dark mb-2">
          Esperando votos
        </h3>
        <p className="text-sm text-brown-mid font-light">
          Comparte el link y tus invitadas verán las actividades. Aquí
          aparecerán sus votos en tiempo real.
        </p>
      </div>
    );
  }

  // Ordenar actividades por más populares primero (más up - más down)
  const rankedActivities = [...activities]
    .filter((a) => a.is_added)
    .map((a) => {
      const v = votesByActivity.get(a.id);
      const score = v ? v.up - v.down : 0;
      return { activity: a, votes: v, score };
    })
    .sort((a, b) => b.score - a.score);

  return (
    <div>
      {/* Resumen general */}
      <div className="card-base mb-4 bg-cream-warm border-terracotta-soft">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-brown-soft mb-1">
              Personas
            </p>
            <p className="font-display text-2xl text-brown-dark">
              {summary.invitees_count}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-brown-soft mb-1">
              Votos totales
            </p>
            <p className="font-display text-2xl text-brown-dark">
              {summary.total_votes}
            </p>
          </div>
        </div>

        {summary.invitees.length > 0 && (
          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs uppercase tracking-wider text-brown-soft mb-2">
              Han votado
            </p>
            <div className="flex flex-wrap gap-2">
              {summary.invitees.map((inv) => (
                <span
                  key={inv.name}
                  className="px-3 py-1 rounded-full bg-white text-sm text-brown-dark border border-border"
                  title={`${inv.vote_count} ${
                    inv.vote_count === 1 ? "voto" : "votos"
                  }`}
                >
                  {inv.name} · {inv.vote_count}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Ranking de actividades */}
      <div className="space-y-2">
        <h3 className="font-display text-lg text-brown-dark mb-3">
          Lo más votado por el grupo
        </h3>
        {rankedActivities.map(({ activity, votes }, idx) => (
          <div
            key={activity.id}
            className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-border"
          >
            <div className="w-8 h-8 rounded-full bg-cream-warm flex items-center justify-center text-sm font-medium text-brown-dark flex-shrink-0">
              {idx + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-brown-dark truncate">
                {activity.name}
              </p>
              {votes && (
                <div className="flex items-center gap-3 text-xs mt-1">
                  <span className="text-success">👍 {votes.up}</span>
                  <span className="text-brown-soft">🤷 {votes.meh}</span>
                  <span className="text-error">👎 {votes.down}</span>
                </div>
              )}
              {!votes && (
                <p className="text-xs text-brown-soft italic mt-1">
                  Sin votos aún
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
