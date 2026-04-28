"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getTripEmoji } from "@/lib/utils/date";
import type { TripType } from "@/types";

export interface CreateTripData {
  name: string;
  destination: string;
  country?: string;
  cities?: string[];
  trip_type?: TripType | null;
  start_date: string;
  end_date: string;
  travelers: number;
  interests: string[];
  currency?: string;
  notes?: string;
}

export async function createTrip(data: CreateTripData) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "No has iniciado sesión" };
  }

  if (!data.name?.trim()) {
    return { error: "El nombre del viaje es requerido" };
  }
  if (!data.destination?.trim()) {
    return { error: "El destino es requerido" };
  }
  if (!data.start_date || !data.end_date) {
    return { error: "Las fechas son requeridas" };
  }
  if (new Date(data.end_date) < new Date(data.start_date)) {
    return { error: "La fecha de regreso debe ser después de la salida" };
  }

  const { data: trip, error } = await supabase
    .from("trips")
    .insert({
      user_id: user.id,
      name: data.name.trim(),
      destination: data.destination.trim(),
      country: data.country?.trim() || null,
      cities: data.cities || [],
      trip_type: data.trip_type || null,
      start_date: data.start_date,
      end_date: data.end_date,
      travelers: data.travelers || 1,
      interests: data.interests || [],
      currency: data.currency || "MXN",
      emoji: getTripEmoji(data.interests || []),
      notes: data.notes?.trim() || null,
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating trip:", error);
    return { error: "No se pudo crear el viaje. Inténtalo de nuevo." };
  }

  revalidatePath("/dashboard");
  return { success: true, tripId: trip.id };
}

export async function updateTrip(
  tripId: string,
  data: Partial<CreateTripData>
) {
  const supabase = createClient();

  const updates: Record<string, unknown> = {};
  if (data.name !== undefined) updates.name = data.name.trim();
  if (data.destination !== undefined) updates.destination = data.destination.trim();
  if (data.country !== undefined) updates.country = data.country?.trim() || null;
  if (data.cities !== undefined) updates.cities = data.cities;
  if (data.trip_type !== undefined) updates.trip_type = data.trip_type;
  if (data.start_date !== undefined) updates.start_date = data.start_date;
  if (data.end_date !== undefined) updates.end_date = data.end_date;
  if (data.travelers !== undefined) updates.travelers = data.travelers;
  if (data.interests !== undefined) {
    updates.interests = data.interests;
    updates.emoji = getTripEmoji(data.interests);
  }
  if (data.currency !== undefined) updates.currency = data.currency;
  if (data.notes !== undefined) updates.notes = data.notes?.trim() || null;

  const { error } = await supabase.from("trips").update(updates).eq("id", tripId);

  if (error) {
    console.error("Error updating trip:", error);
    return { error: "No se pudo actualizar el viaje" };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/trip/${tripId}`);
  return { success: true };
}

export async function deleteTrip(tripId: string) {
  const supabase = createClient();

  const { error } = await supabase.from("trips").delete().eq("id", tripId);

  if (error) {
    console.error("Error deleting trip:", error);
    return { error: "No se pudo borrar el viaje" };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}

// ============================================
// SHARE: activar/desactivar/regenerar link
// ============================================

function generateShareToken(): string {
  // Token corto pero único (16 chars alfanuméricos)
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  let token = "";
  for (let i = 0; i < 16; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export async function enableShareLink(tripId: string) {
  const supabase = createClient();

  // Verificar si ya tiene token
  const { data: trip } = await supabase
    .from("trips")
    .select("share_token")
    .eq("id", tripId)
    .single();

  let token = trip?.share_token;

  // Si no tiene, generar uno nuevo
  if (!token) {
    token = generateShareToken();
  }

  const { error } = await supabase
    .from("trips")
    .update({
      share_token: token,
      is_share_enabled: true,
    })
    .eq("id", tripId);

  if (error) {
    console.error("Enable share error:", error);
    return { error: "No se pudo activar el link" };
  }

  revalidatePath(`/trip/${tripId}`);
  return { success: true, token };
}

export async function disableShareLink(tripId: string) {
  const supabase = createClient();

  const { error } = await supabase
    .from("trips")
    .update({ is_share_enabled: false })
    .eq("id", tripId);

  if (error) {
    return { error: "No se pudo desactivar el link" };
  }

  revalidatePath(`/trip/${tripId}`);
  return { success: true };
}

export async function regenerateShareLink(tripId: string) {
  const supabase = createClient();

  const newToken = generateShareToken();

  const { error } = await supabase
    .from("trips")
    .update({
      share_token: newToken,
      is_share_enabled: true,
    })
    .eq("id", tripId);

  if (error) {
    return { error: "No se pudo regenerar el link" };
  }

  revalidatePath(`/trip/${tripId}`);
  return { success: true, token: newToken };
}
