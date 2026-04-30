"use client";

import { useState, useEffect, useRef } from "react";
import FeedbackModal from "./FeedbackModal";

interface FirstActivityFeedbackTriggerProps {
  tripId: string;
  initialAddedCount: number;
  shouldEverShow: boolean;
  triggerCount: number;
}

export default function FirstActivityFeedbackTrigger({
  tripId,
  initialAddedCount,
  shouldEverShow,
  triggerCount,
}: FirstActivityFeedbackTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);
  const prevTriggerCount = useRef(triggerCount);

  // Log de mount inicial
  useEffect(() => {
    console.log("[FeedbackTrigger] MOUNTED with props:", {
      tripId,
      initialAddedCount,
      shouldEverShow,
      triggerCount,
    });
  }, []);

  // Log de cada cambio en triggerCount
  useEffect(() => {
    if (prevTriggerCount.current !== triggerCount) {
      console.log(
        `[FeedbackTrigger] triggerCount changed: ${prevTriggerCount.current} → ${triggerCount}`
      );
      prevTriggerCount.current = triggerCount;
    }
  }, [triggerCount]);

  useEffect(() => {
    console.log("[FeedbackTrigger] checking conditions:", {
      shouldEverShow,
      initialAddedCount,
      triggerCount,
      hasTriggered,
      willTrigger:
        shouldEverShow &&
        initialAddedCount === 0 &&
        triggerCount === 1 &&
        !hasTriggered,
    });

    if (
      shouldEverShow &&
      initialAddedCount === 0 &&
      triggerCount === 1 &&
      !hasTriggered
    ) {
      console.log("[FeedbackTrigger] ✅ ALL CONDITIONS MET — opening modal in 800ms");
      setHasTriggered(true);
      const timer = setTimeout(() => {
        console.log("[FeedbackTrigger] ⏰ timer fired, opening modal");
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
