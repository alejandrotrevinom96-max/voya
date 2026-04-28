"use client";

import { useState, useEffect } from "react";
import FeedbackModal from "./FeedbackModal";

interface FeedbackTriggerProps {
  shouldShow: boolean;
  tripId: string | null;
}

export default function FeedbackTrigger({
  shouldShow,
  tripId,
}: FeedbackTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    // Solo abrir una vez por sesión, con un pequeño delay para que no se sienta brusco
    if (shouldShow && !hasTriggered) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        setHasTriggered(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [shouldShow, hasTriggered]);

  if (!isOpen) return null;

  return (
    <FeedbackModal
      tripId={tripId}
      onClose={() => setIsOpen(false)}
      onSubmitted={() => setIsOpen(false)}
    />
  );
}
