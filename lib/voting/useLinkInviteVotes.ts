"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY_PREFIX = "voyaa_invite_";

/**
 * Cuando un invitado se registra, asociamos sus votos previos al nuevo user_id.
 * Este hook busca TODAS las sesiones de invitado guardadas en localStorage y
 * las envía al backend para asociarlas.
 */
export function useLinkInviteVotes() {
  const [linked, setLinked] = useState(false);

  useEffect(() => {
    if (linked) return;
    if (typeof window === "undefined") return;

    async function link() {
      try {
        // Recolectar todos los session_ids del invitado
        const sessionIds = new Set<string>();
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(STORAGE_KEY_PREFIX)) {
            try {
              const value = JSON.parse(localStorage.getItem(key) || "{}");
              if (value.sessionId) sessionIds.add(value.sessionId);
            } catch {}
          }
        }

        if (sessionIds.size === 0) {
          setLinked(true);
          return;
        }

        // Asociar cada session_id al nuevo user
        const requests = Array.from(sessionIds).map((sessionId) =>
          fetch("/api/votes/save-with-account", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ sessionId }),
          })
        );

        await Promise.allSettled(requests);
        setLinked(true);
      } catch (e) {
        console.warn("Could not link invite votes", e);
        setLinked(true);
      }
    }

    link();
  }, [linked]);

  return { linked };
}
