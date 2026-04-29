"use client";

import { useState, useEffect } from "react";
import FeedbackModal from "./FeedbackModal";

interface FirstActivityFeedbackTriggerProps {
  tripId: string;
  /** Cantidad inicial de actividades agregadas al cargar la página */
  initialAddedCount: number;
  /** Si el usuario ya respondió o dismissed feedback antes (server side check) */
  shouldEverShow: boolean;
  /** Trigger desde el padre cuando agrega una actividad */
  triggerCount: number;
}

/**
 * Detecta cuando el usuario AGREGA su PRIMERA actividad al plan
 * (transición de 0 → 1 en addedActivitiesCount) y muestra el modal de feedback.
 *
 * Si el usuario ya tenía actividades agregadas al cargar (initialAddedCount > 0),
 * NO se considera "primera" y no se dispara.
 */
export default function FirstActivityFeedbackTrigger({
  tripId,
  initialAddedCount,
  shouldEverShow,
  triggerCount,
}: FirstActivityFeedbackTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    // Solo mostrar si:
    // - Server dijo que este user no ha respondido ni dismisseado
    // - Al cargar la página tenía 0 actividades agregadas (es genuinamente la 1ra)
    // - El triggerCount subió a 1 (acaban de agregar la 1ra)
    // - Aún no la disparamos en esta sesión
    if (
      shouldEverShow &&
      initialAddedCount === 0 &&
      triggerCount === 1 &&
      !hasTriggered
    ) {
      setHasTriggered(true);
      // Delay de 800ms para que el usuario vea el toast de "agregada" primero
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [triggerCount, initialAddedCount, shouldEverShow, hasTriggered]);

  if (!isOpen) return null;

  return (
    <FeedbackModal
      tripId={tripId}
      onClose={() => setIsOpen(false)}
      onSubmitted={() => setIsOpen(false)}
    />
  );
}
