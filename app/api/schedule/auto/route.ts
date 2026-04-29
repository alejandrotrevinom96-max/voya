import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAnthropicClient, CLAUDE_MODEL } from "@/lib/ai/client";
import {
  buildScheduleSystemPrompt,
  buildScheduleUserPrompt,
  validateScheduleResponse,
} from "@/lib/ai/schedule-prompts";

export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json();
    const tripId = body?.tripId;

    if (!tripId) {
      return NextResponse.json(
        { error: "tripId es requerido" },
        { status: 400 }
      );
    }

    // Obtener el viaje (RLS valida que sea del user)
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

    // Obtener actividades agregadas (is_added = true)
    const { data: activities } = await supabase
      .from("activities")
      .select("*")
      .eq("trip_id", tripId)
      .eq("is_added", true);

    if (!activities || activities.length === 0) {
      return NextResponse.json(
        {
          error: "No hay actividades agregadas para agendar",
        },
        { status: 400 }
      );
    }

    // Obtener schedule actual
    const { data: existingSchedule } = await supabase
      .from("schedule")
      .select("*")
      .eq("trip_id", tripId);

    const scheduledIds = new Set(
      (existingSchedule || []).map((s) => s.activity_id)
    );

    // Separar agendadas vs sin agendar
    const unscheduled = activities.filter((a) => !scheduledIds.has(a.id));
    const alreadyScheduled = (existingSchedule || [])
      .map((s) => ({
        schedule: s,
        activity: activities.find((a) => a.id === s.activity_id),
      }))
      .filter((x): x is { schedule: typeof x.schedule; activity: typeof activities[0] } =>
        x.activity !== undefined
      );

    if (unscheduled.length === 0) {
      return NextResponse.json(
        {
          error: "Todas tus actividades ya están agendadas",
        },
        { status: 400 }
      );
    }

    // Generar set de fechas válidas
    const validDates = new Set<string>();
    const start = new Date(trip.start_date);
    const end = new Date(trip.end_date);
    const current = new Date(start);
    while (current <= end) {
      validDates.add(current.toISOString().split("T")[0]);
      current.setDate(current.getDate() + 1);
    }

    const validActivityIds = new Set(unscheduled.map((a) => a.id));

    // Llamar a Claude
    const anthropic = getAnthropicClient();

    const message = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 4096,
      system: buildScheduleSystemPrompt(),
      messages: [
        {
          role: "user",
          content: buildScheduleUserPrompt(trip, unscheduled, alreadyScheduled),
        },
      ],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { error: "Claude no devolvió texto. Intenta de nuevo." },
        { status: 500 }
      );
    }

    let aiResponse;
    try {
      aiResponse = validateScheduleResponse(
        textBlock.text,
        validActivityIds,
        validDates
      );
    } catch (err) {
      console.error("Schedule validation error:", err);
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

    if (aiResponse.schedule.length === 0) {
      return NextResponse.json(
        { error: "AI no pudo agendar ninguna actividad. Intenta agendar manualmente." },
        { status: 500 }
      );
    }

    // Calcular order_index basado en hora del día
    // Para cada día, ordenar por hora y asignar índices secuenciales
    const byDay = new Map<string, typeof aiResponse.schedule>();
    for (const item of aiResponse.schedule) {
      if (!byDay.has(item.day_date)) byDay.set(item.day_date, []);
      byDay.get(item.day_date)!.push(item);
    }

    const inserts = [];
    for (const [day, items] of byDay) {
      // Ordenar por hora ascendente
      items.sort((a, b) => a.start_time.localeCompare(b.start_time));
      for (let i = 0; i < items.length; i++) {
        inserts.push({
          trip_id: tripId,
          activity_id: items[i].activity_id,
          day_date: items[i].day_date,
          start_time: items[i].start_time,
          order_index: i,
        });
      }
    }

    // Insertar el nuevo schedule
    const { error: insertError } = await supabase
      .from("schedule")
      .insert(inserts);

    if (insertError) {
      console.error("Insert schedule error:", insertError);
      return NextResponse.json(
        { error: "No se pudo guardar el agendado" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      scheduledCount: inserts.length,
      skippedCount: unscheduled.length - inserts.length,
    });
  } catch (err) {
    console.error("Auto-schedule error:", err);

    if (err && typeof err === "object" && "status" in err) {
      const status = (err as { status: number }).status;
      if (status === 401) {
        return NextResponse.json(
          { error: "API key de Claude inválida" },
          { status: 500 }
        );
      }
      if (status === 429) {
        return NextResponse.json(
          { error: "Demasiadas solicitudes. Espera un momento." },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: "Algo salió mal. Intenta de nuevo." },
      { status: 500 }
    );
  }
}
