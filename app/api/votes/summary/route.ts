import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { VoteSummary, TripVotingSummary } from "@/lib/voting/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * GET /api/votes/summary?tripId=...
 * Solo el dueño del trip puede consultar.
 * Regresa el resumen agregado de votos por actividad + lista de invitados.
 */
export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const tripId = searchParams.get("tripId");

    if (!tripId) {
      return NextResponse.json({ error: "tripId requerido" }, { status: 400 });
    }

    // Verificar que es dueño del trip
    const { data: trip } = await supabase
      .from("trips")
      .select("id, user_id")
      .eq("id", tripId)
      .single();

    if (!trip || trip.user_id !== user.id) {
      return NextResponse.json({ error: "No tienes acceso" }, { status: 403 });
    }

    // Obtener votos
    const { data: votes } = await supabase
      .from("votes")
      .select("*")
      .eq("trip_id", tripId);

    // Obtener invitados
    const { data: invitees } = await supabase
      .from("trip_invitees")
      .select("voter_name, vote_count, last_active_at")
      .eq("trip_id", tripId)
      .order("last_active_at", { ascending: false });

    // Agrupar por actividad
    const byActivity = new Map<string, VoteSummary>();
    (votes || []).forEach((v) => {
      const existing = byActivity.get(v.activity_id) || {
        activity_id: v.activity_id,
        up: 0,
        down: 0,
        meh: 0,
        total: 0,
        voters_up: [] as string[],
        voters_down: [] as string[],
        voters_meh: [] as string[],
      };

      existing.total++;
      if (v.vote === "up") {
        existing.up++;
        existing.voters_up.push(v.voter_name);
      } else if (v.vote === "down") {
        existing.down++;
        existing.voters_down.push(v.voter_name);
      } else if (v.vote === "meh") {
        existing.meh++;
        existing.voters_meh.push(v.voter_name);
      }

      byActivity.set(v.activity_id, existing);
    });

    const summary: TripVotingSummary = {
      trip_id: tripId,
      invitees_count: (invitees || []).length,
      total_votes: (votes || []).length,
      by_activity: Array.from(byActivity.values()),
      invitees: (invitees || []).map((i) => ({
        name: i.voter_name,
        vote_count: i.vote_count,
        last_active_at: i.last_active_at,
      })),
    };

    return NextResponse.json(summary);
  } catch (err) {
    console.error("Summary error:", err);
    return NextResponse.json(
      { error: "Algo salió mal" },
      { status: 500 }
    );
  }
}
