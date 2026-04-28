"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type WillingnessToPay =
  | "yes-no-question"
  | "would-consider"
  | "specific-need"
  | "prefer-free"
  | "unsure";

export interface FeedbackData {
  trip_id?: string | null;
  nps_score: number;
  most_useful: string;
  what_was_missing?: string;
  willingness_to_pay: WillingnessToPay;
  specific_pay_reason?: string;
  source?: string;
}

export async function submitFeedback(data: FeedbackData) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No has iniciado sesión" };
  }

  // Validaciones
  if (!data.nps_score || data.nps_score < 1 || data.nps_score > 10) {
    return { error: "El puntaje debe estar entre 1 y 10" };
  }

  if (!data.most_useful?.trim()) {
    return { error: "Cuéntanos qué fue lo más útil" };
  }

  if (!data.willingness_to_pay) {
    return { error: "Por favor responde la pregunta sobre la versión Premium" };
  }

  const { error } = await supabase.from("feedback").insert({
    user_id: user.id,
    trip_id: data.trip_id || null,
    nps_score: data.nps_score,
    most_useful: data.most_useful.trim().slice(0, 2000),
    what_was_missing: data.what_was_missing?.trim().slice(0, 2000) || null,
    willingness_to_pay: data.willingness_to_pay,
    specific_pay_reason:
      data.willingness_to_pay === "specific-need"
        ? data.specific_pay_reason?.trim().slice(0, 2000) || null
        : null,
    source: data.source || "first-trip-modal",
  });

  if (error) {
    console.error("Submit feedback error:", error);
    return { error: "No se pudo enviar tu feedback. Intenta de nuevo." };
  }

  revalidatePath("/dashboard");
  if (data.trip_id) {
    revalidatePath(`/trip/${data.trip_id}`);
  }
  return { success: true };
}

export async function dismissFeedbackModal(source: string) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "No autenticado" };

  // Upsert: si ya existe, actualiza; si no, crea
  const { error } = await supabase
    .from("feedback_dismissals")
    .upsert(
      {
        user_id: user.id,
        source,
        dismissed_at: new Date().toISOString(),
      },
      { onConflict: "user_id" }
    );

  if (error) {
    console.error("Dismiss feedback error:", error);
    return { error: "Error al guardar" };
  }

  return { success: true };
}

/**
 * Verifica si debemos mostrar el modal a este usuario.
 * Reglas:
 * - El usuario tiene activities con is_added = true (al menos 1)
 * - El usuario NO ha respondido feedback antes
 * - El usuario NO ha dismisseado el modal
 */
export async function shouldShowFeedbackModal(): Promise<{
  show: boolean;
  tripId: string | null;
}> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { show: false, tripId: null };

  // 1. ¿Ya respondió feedback?
  const { count: feedbackCount } = await supabase
    .from("feedback")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  if (feedbackCount && feedbackCount > 0) {
    return { show: false, tripId: null };
  }

  // 2. ¿Ya dismisseó?
  const { data: dismissal } = await supabase
    .from("feedback_dismissals")
    .select("user_id")
    .eq("user_id", user.id)
    .eq("source", "first-trip-modal")
    .maybeSingle();

  if (dismissal) {
    return { show: false, tripId: null };
  }

  // 3. ¿Tiene al menos 1 actividad agregada en algún viaje?
  const { data: addedActivity } = await supabase
    .from("activities")
    .select("trip_id")
    .eq("is_added", true)
    .limit(1)
    .maybeSingle();

  if (!addedActivity) {
    return { show: false, tripId: null };
  }

  // Verificar que ese trip pertenezca al user (RLS ya lo filtra, pero por si acaso)
  const { data: trip } = await supabase
    .from("trips")
    .select("id")
    .eq("id", addedActivity.trip_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!trip) {
    return { show: false, tripId: null };
  }

  return { show: true, tripId: trip.id };
}
