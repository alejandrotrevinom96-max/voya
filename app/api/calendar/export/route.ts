import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { formatICSDate } from "@/lib/utils/calendar";
import { addDays, parseISO, format } from "date-fns";

/**
 * Escapa caracteres especiales en strings ICS
 */
function escapeICS(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "");
}

/**
 * Wrap líneas a 75 caracteres (estándar ICS)
 */
function foldLine(line: string): string {
  if (line.length <= 75) return line;
  const chunks: string[] = [];
  let remaining = line;
  while (remaining.length > 75) {
    chunks.push(remaining.slice(0, 75));
    remaining = remaining.slice(75);
  }
  chunks.push(remaining);
  return chunks.join("\r\n ");
}

export async function GET(req: NextRequest) {
  try {
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const tripId = req.nextUrl.searchParams.get("tripId");
    if (!tripId) {
      return NextResponse.json(
        { error: "tripId es requerido" },
        { status: 400 }
      );
    }

    // Obtener viaje (RLS valida ownership)
    const { data: trip } = await supabase
      .from("trips")
      .select("*")
      .eq("id", tripId)
      .single();

    if (!trip) {
      return NextResponse.json({ error: "Viaje no encontrado" }, { status: 404 });
    }

    // Obtener schedule + activities
    const { data: schedule } = await supabase
      .from("schedule")
      .select(`
        id,
        day_date,
        start_time,
        order_index,
        activity:activities (
          id,
          name,
          description,
          location_name,
          estimated_duration_minutes,
          category
        )
      `)
      .eq("trip_id", tripId)
      .order("day_date", { ascending: true })
      .order("order_index", { ascending: true });

    if (!schedule || schedule.length === 0) {
      return NextResponse.json(
        { error: "No hay actividades programadas" },
        { status: 400 }
      );
    }

    // Generar ICS
    const lines: string[] = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Voya//Travel Planner//ES",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      `X-WR-CALNAME:${escapeICS(trip.name)}`,
      `X-WR-CALDESC:Itinerario de ${escapeICS(trip.destination)} generado por Voya`,
    ];

    const now = format(new Date(), "yyyyMMdd'T'HHmmss");

    schedule.forEach((item: any) => {
      const activity = item.activity;
      if (!activity) return;

      const uid = `voya-${item.id}@voya.app`;
      const duration = activity.estimated_duration_minutes || 60;

      lines.push("BEGIN:VEVENT");
      lines.push(`UID:${uid}`);
      lines.push(`DTSTAMP:${now}Z`);

      if (item.start_time) {
        // Evento con hora
        const startDateTime = formatICSDate(item.day_date, item.start_time);
        const startDate = parseISO(item.day_date);
        const [h, m] = item.start_time.split(":").map(Number);
        const endDate = new Date(startDate);
        endDate.setHours(h, m + duration, 0);
        const endDateTime = format(endDate, "yyyyMMdd'T'HHmmss");

        lines.push(`DTSTART:${startDateTime}`);
        lines.push(`DTEND:${endDateTime}`);
      } else {
        // Evento de día completo
        const start = formatICSDate(item.day_date);
        const endDate = addDays(parseISO(item.day_date), 1);
        const end = format(endDate, "yyyyMMdd");

        lines.push(`DTSTART;VALUE=DATE:${start}`);
        lines.push(`DTEND;VALUE=DATE:${end}`);
      }

      lines.push(foldLine(`SUMMARY:${escapeICS(activity.name)}`));

      if (activity.description) {
        lines.push(
          foldLine(
            `DESCRIPTION:${escapeICS(activity.description)}\\n\\n— Generado por Voya`
          )
        );
      }

      if (activity.location_name) {
        lines.push(foldLine(`LOCATION:${escapeICS(activity.location_name)}`));
      }

      lines.push("END:VEVENT");
    });

    lines.push("END:VCALENDAR");

    const icsContent = lines.join("\r\n");

    return new NextResponse(icsContent, {
      status: 200,
      headers: {
        "Content-Type": "text/calendar; charset=utf-8",
        "Content-Disposition": `attachment; filename="voya-${trip.name.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.ics"`,
      },
    });
  } catch (err) {
    console.error("Export ICS error:", err);
    return NextResponse.json(
      { error: "Error generando calendario" },
      { status: 500 }
    );
  }
}
