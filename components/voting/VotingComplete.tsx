"use client";

import { useState } from "react";
import Link from "next/link";

interface VotingCompleteProps {
  ownerName: string;
  voterName: string;
  sessionId: string;
  activitiesCount: number;
  onVoteAgain: () => void;
}

export default function VotingComplete({
  ownerName,
  voterName,
  activitiesCount,
  onVoteAgain,
}: VotingCompleteProps) {
  const [showRegister, setShowRegister] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-12">
      <div className="max-w-lg w-full">
        {/* Hero de éxito */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-success/10 text-5xl mb-4">
            ✨
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-light text-brown-dark mb-2">
            Listo, {voterName}.
          </h1>
          <p className="text-brown-mid">
            {ownerName} ya recibió tus votos.
            <br />
            Ahora {ownerName} arma la versión final.
          </p>
        </div>

        {/* CTA principal: pueden registrarse o no */}
        {!showRegister ? (
          <div className="space-y-4">
            <div className="card-base bg-cream-warm border-terracotta-soft">
              <h2 className="font-display text-xl text-brown-dark mb-2">
                ¿Tú también planeas viajes?
              </h2>
              <p className="text-sm text-brown-mid mb-4 font-light">
                Voyaa arma itinerarios completos con presupuesto en 3 minutos.
                Tu primer viaje es gratis. Sin tarjeta.
              </p>
              <button
                onClick={() => setShowRegister(true)}
                className="btn-primary w-full"
              >
                Crear mi propio viaje gratis →
              </button>
            </div>

            <button
              onClick={onVoteAgain}
              className="w-full text-sm text-brown-soft hover:text-brown-mid py-3"
            >
              ← Volver a revisar mis votos
            </button>
          </div>
        ) : (
          <RegisterCTA voterName={voterName} />
        )}

        {/* Footer */}
        <p className="text-xs text-brown-soft text-center mt-8 italic">
          Voyaa · Deja de pensar. Tu viaje, ya planeado.
        </p>
      </div>
    </div>
  );
}

function RegisterCTA({ voterName }: { voterName: string }) {
  return (
    <div className="card-base">
      <h2 className="font-display text-xl text-brown-dark mb-2">
        Crea tu cuenta para empezar
      </h2>
      <p className="text-sm text-brown-mid mb-6">
        En menos de 30 segundos. 1 viaje gratis cada 3 meses, para siempre.
      </p>

      <Link
        href={`/auth/signup?from=invite&name=${encodeURIComponent(voterName)}`}
        className="btn-primary w-full mb-3"
      >
        Crear cuenta gratis →
      </Link>

      <p className="text-xs text-brown-soft text-center">
        ¿Ya tienes cuenta?{" "}
        <Link href="/auth/login" className="text-terracotta hover:underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
