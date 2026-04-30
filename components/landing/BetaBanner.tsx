"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "voyaa_beta_banner_dismissed";

export default function BetaBanner() {
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setMounted(true);
    if (localStorage.getItem(STORAGE_KEY) === "true") {
      setIsVisible(false);
    }
  }, []);

  if (!mounted) return null;
  if (!isVisible) return null;

  function handleClose() {
    setIsVisible(false);
    localStorage.setItem(STORAGE_KEY, "true");
  }

  return (
    <div className="beta-banner">
      <span className="banner-text-desktop">
        ✨ <strong>Estamos en beta.</strong> Tu feedback vale más que tu dinero — viajes ilimitados gratis. Aprovecha mientras dura.
      </span>
      <span className="banner-text-mobile">
        ✨ <strong>Beta.</strong> Tu feedback vale más que tu dinero — viajes ilimitados gratis.
      </span>
      <button
        onClick={handleClose}
        className="banner-close"
        aria-label="Cerrar"
      >
        ×
      </button>
    </div>
  );
}
