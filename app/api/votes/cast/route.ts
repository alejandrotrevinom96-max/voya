import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server-public";
import type { VoteType } from "@/lib/voting/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/votes/cast
 * Body: { token, activityId, vote, sessionId, voterName }
 * El invitado emite un voto. NO requiere auth.
 * Si ya existía un voto del mismo session_id sobre esa actividad, lo actualiza.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token, activityId, vote, sessionId, voterName } = body || {};

    if (!token || !activityId || !vote || !sessionId || !voterName) {
      return NextResponse.json(
        { error: "Faltan datos" },
        { status: 400 }
      );
    }

    if (!["up", "down", "meh"].includes(vote)) {
      return NextResponse.json(
        { error: "Tipo de voto inválido" },
        { status: 400 }
      );
    }

    const trimmedName = String(voterName).trim().substring(0, 50);
    if (trimmedName.length < 1) {
      return NextResponse.json(
        { error: "Nombre requerido" },
        { status: 400 }
      );
    }

    const supabase = createClient();

    // Validar que el trip exista, esté con voting habilitado y el token coincida
    const { data: trip } = await supabase
      .from("trips")
      .select("id, voting_enabled, voting_token")
      .eq("voting_token", token)
      .eq("voting_enabled", true)
      .single();

    if (!trip) {
      return NextResponse.json(
        { error: "Esta votación ya no está activa" },
        { status: 404 }
      );
    }

    // Validar que la actividad pertenezca a este trip
    const { data: activity } = await supabase
      .from("activities")
      .select("id, trip_id")
      .eq("id", activityId)
      .eq("trip_id", trip.id)
      .single();

    if (!activity) {
      return NextResponse.json(
        { error: "Actividad no válida" },
        { status: 400 }
      );
    }

    // Upsert del voto (si ya existe del mismo session_id, actualiza)
    const { error: voteError } = await supabase
      .from("votes")
      .upsert(
        {
          trip_id: trip.id,
          activity_id: activityId,
          voter_session_id: sessionId,
          voter_name: trimmedName,
          vote: vote as VoteType,
        },
        { onConflict: "activity_id,voter_session_id" }
      );

    if (voteError) {
      console.error("Vote insert error:", voteError);
      return NextResponse.json(
        { error: "No se pudo guardar el voto" },
        { status: 500 }
      );
    }

    // Asegurar que el invitado esté registrado en trip_invitees
    await supabase.from("trip_invitees").upsert(
      {
        trip_id: trip.id,
        voter_session_id: sessionId,
        voter_name: trimmedName,
        last_active_at: new Date().toISOString(),
      },
      { onConflict: "trip_id,voter_session_id" }
    );

    // Recalcular vote_count en trip_invitees
    const { count } = await supabase
      .from("votes")
      .select("*", { count: "exact", head: true })
      .eq("trip_id", trip.id)
      .eq("voter_session_id", sessionId);

    if (count !== null) {
      await supabase
        .from("trip_invitees")
        .update({ vote_count: count })
        .eq("trip_id", trip.id)
        .eq("voter_session_id", sessionId);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Cast vote error:", err);
    return NextResponse.json(
      { error: "Algo salió mal" },
      { status: 500 }
    );
  }
}
