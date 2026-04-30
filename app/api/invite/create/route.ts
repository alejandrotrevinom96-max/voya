import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateVotingToken } from "@/lib/voting/tokens";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/invite/create
 * Body: { tripId: string }
 * Habilita la votación en un viaje y genera un voting_token.
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const tripId = body?.tripId;

    if (!tripId) {
      return NextResponse.json({ error: "tripId requerido" }, { status: 400 });
    }

    // Verificar que el trip existe y es del usuario
    const { data: trip, error: tripError } = await supabase
      .from("trips")
      .select("id, user_id, voting_token, voting_enabled")
      .eq("id", tripId)
      .single();

    if (tripError || !trip) {
      return NextResponse.json({ error: "Viaje no encontrado" }, { status: 404 });
    }

    if (trip.user_id !== user.id) {
      return NextResponse.json({ error: "No es tu viaje" }, { status: 403 });
    }

    // Si ya tiene token, lo regresamos. Si no, lo generamos.
    let token = trip.voting_token;

    if (!token || !trip.voting_enabled) {
      token = generateVotingToken();

      const { error: updateError } = await supabase
        .from("trips")
        .update({
          voting_enabled: true,
          voting_token: token,
          voting_opened_at: new Date().toISOString(),
        })
        .eq("id", tripId);

      if (updateError) {
        console.error("Error enabling voting:", updateError);
        return NextResponse.json(
          { error: "No se pudo habilitar la votación" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      token,
      url: `/invite/${token}`,
    });
  } catch (err) {
    console.error("Create invite error:", err);
    return NextResponse.json(
      { error: "Algo salió mal" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/invite/create
 * Body: { tripId: string }
 * Deshabilita la votación (los votos existentes se conservan).
 */
export async function DELETE(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const tripId = body?.tripId;

    if (!tripId) {
      return NextResponse.json({ error: "tripId requerido" }, { status: 400 });
    }

    const { error } = await supabase
      .from("trips")
      .update({ voting_enabled: false })
      .eq("id", tripId)
      .eq("user_id", user.id);

    if (error) {
      return NextResponse.json(
        { error: "No se pudo cerrar la votación" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Disable invite error:", err);
    return NextResponse.json(
      { error: "Algo salió mal" },
      { status: 500 }
    );
  }
}
