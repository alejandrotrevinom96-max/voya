"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * Asigna una actividad a un día específico (o la actualiza si ya está asignada)
 */
export async function scheduleActivity(
  activityId: string,
  tripId: string,
  dayDate: string,
  startTime?: string
) {
  const supabase = createClient();

  // Verificar si ya existe en schedule
  const { data: existing } = await supabase
    .from("schedule")
    .select("id, order_index")
    .eq("trip_id", tripId)
    .eq("activity_id", activityId)
    .maybeSingle();

  // Calcular el siguiente order_index para ese día
  const { data: dayItems } = await supabase
    .from("schedule")
    .select("order_index")
    .eq("trip_id", tripId)
    .eq("day_date", dayDate)
    .order("order_index", { ascending: false })
    .limit(1);

  const nextOrder =
    dayItems && dayItems.length > 0 ? dayItems[0].order_index + 1 : 0;

  if (existing) {
    // Update: cambiar el día
    const { error } = await supabase
      .from("schedule")
      .update({
        day_date: dayDate,
        start_time: startTime || null,
        order_index: nextOrder,
      })
      .eq("id", existing.id);

    if (error) {
      console.error("Schedule update error:", error);
      return { error: "No se pudo actualizar la programación" };
    }
  } else {
    // Insert: crear nuevo
    const { error } = await supabase.from("schedule").insert({
      trip_id: tripId,
      activity_id: activityId,
      day_date: dayDate,
      start_time: startTime || null,
      order_index: nextOrder,
    });

    if (error) {
      console.error("Schedule insert error:", error);
      return { error: "No se pudo programar la actividad" };
    }
  }

  revalidatePath(`/trip/${tripId}`);
  return { success: true };
}

/**
 * Quita una actividad del calendario (no la borra del catálogo)
 */
export async function unscheduleActivity(activityId: string, tripId: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from("schedule")
    .delete()
    .eq("trip_id", tripId)
    .eq("activity_id", activityId);

  if (error) {
    console.error("Unschedule error:", error);
    return { error: "No se pudo quitar del calendario" };
  }

  revalidatePath(`/trip/${tripId}`);
  return { success: true };
}

/**
 * Actualiza la hora de inicio de una actividad agendada
 */
export async function updateScheduleTime(
  scheduleId: string,
  tripId: string,
  startTime: string | null
) {
  const supabase = createClient();

  const { error } = await supabase
    .from("schedule")
    .update({ start_time: startTime })
    .eq("id", scheduleId);

  if (error) {
    return { error: "No se pudo actualizar la hora" };
  }

  revalidatePath(`/trip/${tripId}`);
  return { success: true };
}

/**
 * Reordena actividades dentro de un día (mueve una arriba o abajo)
 */
export async function reorderActivity(
  scheduleId: string,
  tripId: string,
  direction: "up" | "down"
) {
  const supabase = createClient();

  // Obtener el item actual
  const { data: current } = await supabase
    .from("schedule")
    .select("day_date, order_index")
    .eq("id", scheduleId)
    .single();

  if (!current) return { error: "Item no encontrado" };

  // Obtener items del mismo día ordenados
  const { data: dayItems } = await supabase
    .from("schedule")
    .select("id, order_index")
    .eq("trip_id", tripId)
    .eq("day_date", current.day_date)
    .order("order_index", { ascending: true });

  if (!dayItems) return { error: "No hay actividades" };

  const currentIndex = dayItems.findIndex((i) => i.id === scheduleId);
  const swapIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

  if (swapIndex < 0 || swapIndex >= dayItems.length) {
    return { success: true }; // ya está en el extremo, no hace nada
  }

  const swapItem = dayItems[swapIndex];

  // Intercambiar order_index (necesitamos un valor temporal para evitar conflictos)
  await supabase
    .from("schedule")
    .update({ order_index: -1 })
    .eq("id", scheduleId);
  await supabase
    .from("schedule")
    .update({ order_index: current.order_index })
    .eq("id", swapItem.id);
  await supabase
    .from("schedule")
    .update({ order_index: swapItem.order_index })
    .eq("id", scheduleId);

  revalidatePath(`/trip/${tripId}`);
  return { success: true };
}
