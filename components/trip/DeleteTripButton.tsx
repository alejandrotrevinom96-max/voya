"use client";

import { useState } from "react";
import { deleteTrip } from "@/app/trip/actions";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { useToast } from "@/components/ui/Toast";

interface DeleteTripButtonProps {
  tripId: string;
  tripName: string;
}

export default function DeleteTripButton({
  tripId,
  tripName,
}: DeleteTripButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  async function handleDelete() {
    setLoading(true);
    try {
      await deleteTrip(tripId);
      // No necesitamos toast porque deleteTrip hace redirect
    } catch (err) {
      showToast("No se pudo borrar el viaje", "error");
      setLoading(false);
      setShowConfirm(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setShowConfirm(true)}
        className="text-sm text-error hover:bg-error/10 px-4 py-2 rounded-full transition"
      >
        Borrar viaje
      </button>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => !loading && setShowConfirm(false)}
        onConfirm={handleDelete}
        title={`¿Borrar "${tripName}"?`}
        description="Esta acción no se puede deshacer. Se borrarán todas las actividades y el calendario de este viaje."
        confirmLabel="Sí, borrar"
        variant="danger"
        loading={loading}
      />
    </>
  );
}
