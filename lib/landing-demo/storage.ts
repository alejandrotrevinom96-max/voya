import type { DemoTripPreview } from "./types";

const STORAGE_KEY = "voyaa_demo_trip";
const STORAGE_QUERY_KEY = "voyaa_demo_query";
const TTL_DAYS = 7;

interface StoredTrip {
  preview: DemoTripPreview;
  query: string;
  saved_at: string; // ISO
}

/**
 * Guarda el viaje generado en localStorage.
 * Se usa si el usuario cierra el navegador y vuelve.
 */
export function saveTripToLocalStorage(
  preview: DemoTripPreview,
  query: string
): void {
  if (typeof window === "undefined") return;
  try {
    const data: StoredTrip = {
      preview,
      query,
      saved_at: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    localStorage.setItem(STORAGE_QUERY_KEY, query);
  } catch (e) {
    console.warn("Could not save trip", e);
  }
}

/**
 * Recupera el viaje guardado.
 * Devuelve null si no hay, está expirado, o hay error.
 */
export function loadTripFromLocalStorage(): StoredTrip | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const parsed: StoredTrip = JSON.parse(raw);

    // Validar TTL
    const savedAt = new Date(parsed.saved_at);
    const ageMs = Date.now() - savedAt.getTime();
    const ttlMs = TTL_DAYS * 24 * 60 * 60 * 1000;
    if (ageMs > ttlMs) {
      clearStoredTrip();
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

/**
 * Borra el viaje guardado.
 * Útil cuando el usuario quiere generar otro o ya se registró.
 */
export function clearStoredTrip(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(STORAGE_QUERY_KEY);
  } catch {}
}
