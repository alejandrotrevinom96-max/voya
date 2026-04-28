"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleActivityAdded(activityId: string, tripId: string) {
  const supabase = createClient();

  // Obtener el estado actual
  const { data: activity, error: fetchError } = await supabase
    .from("activities")
    .select("is_added")
    .eq("id", activityId)
    .single();

  if (fetchError || !activity) {
    return { error: "Actividad no encontrada" };
  }

  // Toggle
  const { error } = await supabase
    .from("activities")
    .update({ is_added: !activity.is_added })
    .eq("id", activityId);

  if (error) {
    console.error("Toggle activity error:", error);
    return { error: "No se pudo actualizar la actividad" };
  }

  revalidatePath(`/trip/${tripId}`);
  return { success: true, is_added: !activity.is_added };
}

export async function deleteActivity(activityId: string, tripId: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from("activities")
    .delete()
    .eq("id", activityId);

  if (error) {
    console.error("Delete activity error:", error);
    return { error: "No se pudo borrar la actividad" };
  }

  revalidatePath(`/trip/${tripId}`);
  return { success: true };
}

export async function clearAllActivities(tripId: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from("activities")
    .delete()
    .eq("trip_id", tripId);

  if (error) {
    console.error("Clear activities error:", error);
    return { error: "No se pudieron borrar las actividades" };
  }

  revalidatePath(`/trip/${tripId}`);
  return { success: true };
}
