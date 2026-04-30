import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * POST /api/votes/save-with-account
 * Body: { sessionId: string }
 *
 * El invitado acaba de crear cuenta. Asociamos sus votos previos al nuevo user_id.
 * Esta ruta REQUIERE auth (el invitado YA se registró/logueó).
 */
export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Debes iniciar sesión" }, { status: 401 });
    }

    const body = await req.json();
    const sessionId = body?.sessionId;

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId requerido" }, { status: 400 });
    }

    // Asociar los votos del session_id al nuevo user_id
    const { error: votesError } = await supabase
      .from("votes")
      .update({ voter_user_id: user.id })
      .eq("voter_session_id", sessionId);

    if (votesError) {
      console.error("Error linking votes:", votesError);
    }

    // Asociar también las entradas de invitee
    const { error: inviteesError } = await supabase
      .from("trip_invitees")
      .update({
        voter_user_id: user.id,
        voter_email: user.email || null,
      })
      .eq("voter_session_id", sessionId);

    if (inviteesError) {
      console.error("Error linking invitees:", inviteesError);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Save with account error:", err);
    return NextResponse.json(
      { error: "Algo salió mal" },
      { status: 500 }
    );
  }
}
