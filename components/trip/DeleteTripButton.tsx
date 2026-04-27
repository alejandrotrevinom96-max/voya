"use client";

import { useState } from "react";
import { deleteTrip } from "@/app/trip/actions";

interface DeleteTripButtonProps {
  tripId: string;
  tripName: string;
}

export default function DeleteTripButton({ tripId, tripName }: DeleteTripButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
    await deleteTrip(tripId);
    // No necesitamos resetear loading porque deleteTrip hace redirect
  }

  if (!showConfirm) {
    return (
      <button
        onClick={() => setShowConfirm(true)}
        className="text-sm text-error hover:bg-error/10 px-4 py-2 rounded-full transition"
      >
        Borrar viaje
      </button>
    );
  }

  return (
    <div className="card-base bg-error/5 border-error/20">
      <h3 className="font-display text-xl font-medium text-error mb-2">
        ¿Borrar "{tripName}"?
      </h3>
      <p className="text-sm text-brown-mid mb-4">
        Esta acción no se puede deshacer. Se borrarán todas las actividades y
        el calendario de este viaje.
      </p>
      <div className="flex gap-3">
        <button
          onClick={() => setShowConfirm(false)}
          disabled={loading}
          className="btn-secondary text-sm"
        >
          Cancelar
        </button>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="px-6 py-3 rounded-full bg-error text-white text-sm font-medium hover:scale-105 transition disabled:opacity-50"
        >
          {loading ? "Borrando..." : "Sí, borrar"}
        </button>
      </div>
    </div>
  );
}
