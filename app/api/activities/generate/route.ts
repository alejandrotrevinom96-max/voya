import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAnthropicClient, CLAUDE_MODEL } from "@/lib/ai/client";
import {
  buildSystemPrompt,
  buildUserPrompt,
  validateAIResponse,
} from "@/lib/ai/prompts";

// Forzar runtime de Node.js (no edge) porque el SDK de Anthropic
// y supabase server client necesitan APIs de Node
export const runtime = "nodejs";

// Permitir hasta 60s en producción (requiere Vercel Pro para >10s)
// En plan free se queda en 10s default
export const maxDuration = 60;

// No cachear esta route — cada llamada debe ejecutarse fresh
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();

    // 1. Verificar auth
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "No autorizado" },
        { status: 401 }
      );
    }

    // 2. Obtener trip_id del body
    const body = await req.json();
    const tripId = body?.tripId;

    if (!tripId) {
      return NextResponse.json(
        { error: "tripId es requerido" },
        { status: 400 }
      );
    }

    // 3. Obtener el viaje (RLS valida que sea del usuario)
    const { data: trip, error: tripError } = await supabase
      .from("trips")
      .select("*")
      .eq("id", tripId)
      .single();

    if (tripError || !trip) {
      return NextResponse.json(
        { error: "Viaje no encontrado" },
        { status: 404 }
      );
    }

    // 4. Verificar que no haya muchas actividades ya (prevenir abuso)
    const { count } = await supabase
      .from("activities")
      .select("*", { count: "exact", head: true })
      .eq("trip_id", tripId);

    if (count && count >= 50) {
      return NextResponse.json(
        {
          error:
            "Este viaje ya tiene muchas actividades. Borra algunas o crea un viaje nuevo.",
        },
        { status: 400 }
      );
    }

    // 5. Llamar a Claude (lazy init evita errores en build)
    const anthropic = getAnthropicClient();

    const message = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
      system: buildSystemPrompt(),
      messages: [
        {
          role: "user",
          content: buildUserPrompt(trip),
        },
      ],
    });

    // Extraer el texto de la respuesta
    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { error: "Claude no devolvió texto. Intenta de nuevo." },
        { status: 500 }
      );
    }

    // 6. Validar respuesta
    let aiResponse;
    try {
      aiResponse = validateAIResponse(textBlock.text);
    } catch (err) {
      console.error("AI validation error:", err);
      console.error("Raw response:", textBlock.text);
      return NextResponse.json(
        {
          error:
            err instanceof Error
              ? err.message
              : "Error procesando respuesta de AI",
        },
        { status: 500 }
      );
    }

    // 7. Guardar las actividades en la DB
    const activitiesToInsert = aiResponse.activities.map((act) => ({
      trip_id: tripId,
      name: act.name,
      category: act.category,
      description: act.description,
      estimated_price_min: act.estimated_price_min,
      estimated_price_max: act.estimated_price_max,
      estimated_duration_minutes: act.estimated_duration_minutes,
      location_name: act.location_name,
      ai_confidence: act.ai_confidence,
      notes: act.notes,
      is_added: false,
    }));

    const { data: inserted, error: insertError } = await supabase
      .from("activities")
      .insert(activitiesToInsert)
      .select();

    if (insertError) {
      console.error("Insert error:", insertError);
      return NextResponse.json(
        { error: "No se pudieron guardar las actividades" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      count: inserted?.length || 0,
      activities: inserted,
    });
  } catch (err) {
    console.error("Generate activities error:", err);

    // Errores específicos de Anthropic
    if (err && typeof err === "object" && "status" in err) {
      const status = (err as { status: number }).status;
      if (status === 401) {
        return NextResponse.json(
          {
            error:
              "API key de Claude inválida. Verifica tu configuración en Vercel.",
          },
          { status: 500 }
        );
      }
      if (status === 429) {
        return NextResponse.json(
          {
            error:
              "Demasiadas solicitudes. Espera un momento e intenta de nuevo.",
          },
          { status: 429 }
        );
      }
    }

    // Error de configuración (API key faltante)
    if (err instanceof Error && err.message.includes("ANTHROPIC_API_KEY")) {
      return NextResponse.json(
        {
          error:
            "Falta configurar la API key de Claude. Contacta al administrador.",
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "Algo salió mal generando actividades. Intenta de nuevo." },
      { status: 500 }
    );
  }
}
