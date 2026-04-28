"use client";

import { useState } from "react";
import { useToast } from "@/components/ui/Toast";

interface ExportCalendarButtonProps {
  tripId: string;
  tripName: string;
}

export default function ExportCalendarButton({
  tripId,
  tripName,
}: ExportCalendarButtonProps) {
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  async function handleExport() {
    setLoading(true);
    try {
      const res = await fetch(`/api/calendar/export?tripId=${tripId}`);

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "No se pudo exportar");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      const safeName = tripName
        .toLowerCase()
        .replace(/[^a-z0-9]+/gi, "-")
        .replace(/^-+|-+$/g, "");
      a.download = `voya-${safeName || "trip"}.ics`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      showToast("Calendario descargado ✓", "success");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Error al exportar",
        "error"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="btn-secondary text-sm whitespace-nowrap disabled:opacity-50"
    >
      {loading ? (
        "Generando..."
      ) : (
        <>
          <span>📥</span>
          <span>Exportar a calendario</span>
        </>
      )}
    </button>
  );
}
