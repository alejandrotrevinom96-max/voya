"use client";

import { useState, useEffect } from "react";
import type { Activity } from "@/types";
import VotingWelcome from "./VotingWelcome";
import VotingInterface from "./VotingInterface";
import VotingComplete from "./VotingComplete";

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

interface VotingFlowProps {
  trip: TripBasic;
  tripTypeLabel: string | null;
  tripTypeEmoji: string | null;
  formattedDates: string;
  ownerName: string;
  activities: Activity[];
  token: string;
}

type Stage = "welcome" | "voting" | "complete";

const STORAGE_KEY_PREFIX = "voyaa_invite_";

export default function VotingFlow({
  trip,
  tripTypeLabel,
  tripTypeEmoji,
  formattedDates,
  ownerName,
  activities,
  token,
}: VotingFlowProps) {
  const [stage, setStage] = useState<Stage>("welcome");
  const [voterName, setVoterName] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [hydrated, setHydrated] = useState(false);

  // Hidratar desde localStorage si ya votó antes
  useEffect(() => {
    try {
      const storageKey = STORAGE_KEY_PREFIX + token;
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name && parsed.sessionId) {
          setVoterName(parsed.name);
          setSessionId(parsed.sessionId);
          setStage("voting");
        }
      }
    } catch (e) {
      console.warn("Could not load saved session", e);
    }
    setHydrated(true);
  }, [token]);

  function handleStart(name: string) {
    // Generar session_id local (cliente)
    const newSessionId =
      "vsess_" +
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15);

    setVoterName(name);
    setSessionId(newSessionId);

    try {
      const storageKey = STORAGE_KEY_PREFIX + token;
      localStorage.setItem(
        storageKey,
        JSON.stringify({ name, sessionId: newSessionId })
      );
    } catch (e) {
      console.warn("Could not save session", e);
    }

    setStage("voting");
  }

  function handleComplete() {
    setStage("complete");
  }

  function handleVoteAgain() {
    setStage("voting");
  }

  if (!hydrated) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <div className="text-brown-soft">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      {stage === "welcome" && (
        <VotingWelcome
          ownerName={ownerName}
          tripName={trip.name}
          destination={trip.destination}
          country={trip.country}
          emoji={trip.emoji}
          formattedDates={formattedDates}
          activitiesCount={activities.length}
          tripTypeLabel={tripTypeLabel}
          tripTypeEmoji={tripTypeEmoji}
          onStart={handleStart}
        />
      )}

      {stage === "voting" && (
        <VotingInterface
          trip={trip}
          tripTypeLabel={tripTypeLabel}
          tripTypeEmoji={tripTypeEmoji}
          formattedDates={formattedDates}
          ownerName={ownerName}
          activities={activities}
          token={token}
          voterName={voterName}
          sessionId={sessionId}
          onComplete={handleComplete}
        />
      )}

      {stage === "complete" && (
        <VotingComplete
          ownerName={ownerName}
          voterName={voterName}
          sessionId={sessionId}
          activitiesCount={activities.length}
          onVoteAgain={handleVoteAgain}
        />
      )}
    </div>
  );
}
