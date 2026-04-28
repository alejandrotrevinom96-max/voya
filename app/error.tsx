"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="text-6xl mb-6">🌪️</div>
      <h1 className="font-display text-4xl md:text-5xl font-light text-brown-dark mb-4">
        Algo se <span className="italic text-terracotta">torció</span>
      </h1>
      <p className="text-brown-mid font-light max-w-md mb-8">
        Tuvimos un problema cargando esto. Inténtalo de nuevo o vuelve al
        dashboard.
      </p>
      <div className="flex gap-3">
        <button onClick={reset} className="btn-primary">
          Intentar de nuevo
        </button>
        <Link href="/dashboard" className="btn-secondary">
          Ir al dashboard
        </Link>
      </div>
    </div>
  );
}
