import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

function escapeCSV(value: string | null | undefined | number): string {
  if (value === null || value === undefined) return "";
  const str = String(value);
  // Si tiene coma, comilla o salto de línea, encerrar en comillas y escapar comillas
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  // Verificar admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    return NextResponse.json({ error: "Acceso denegado" }, { status: 403 });
  }

  // Traer todo el feedback
  const { data: feedback } = await supabase
    .from("feedback")
    .select("*")
    .order("created_at", { ascending: false });

  if (!feedback || feedback.length === 0) {
    return NextResponse.json(
      { error: "No hay feedback para exportar" },
      { status: 400 }
    );
  }

  // Hidratar info de profiles y trips
  const userIds = Array.from(
    new Set(feedback.map((f) => f.user_id).filter(Boolean))
  );
  const tripIds = Array.from(
    new Set(feedback.map((f) => f.trip_id).filter(Boolean))
  );

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, full_name")
    .in("id", userIds.length > 0 ? userIds : ["00000000-0000-0000-0000-000000000000"]);

  const { data: trips } = await supabase
    .from("trips")
    .select("id, name, destination")
    .in("id", tripIds.length > 0 ? tripIds : ["00000000-0000-0000-0000-000000000000"]);

  const profilesById = new Map((profiles || []).map((p) => [p.id, p]));
  const tripsById = new Map((trips || []).map((t) => [t.id, t]));

  // Generar CSV
  const headers = [
    "Fecha",
    "Email",
    "Nombre",
    "Trip",
    "Destino",
    "NPS (1-10)",
    "Lo más útil",
    "Lo que faltó",
    "Premium",
    "Razón específica",
    "Source",
  ];

  const rows = feedback.map((f) => {
    const userProfile = f.user_id ? profilesById.get(f.user_id) : null;
    const trip = f.trip_id ? tripsById.get(f.trip_id) : null;

    return [
      escapeCSV(f.created_at),
      escapeCSV(userProfile?.email),
      escapeCSV(userProfile?.full_name),
      escapeCSV(trip?.name),
      escapeCSV(trip?.destination),
      escapeCSV(f.nps_score),
      escapeCSV(f.most_useful),
      escapeCSV(f.what_was_missing),
      escapeCSV(f.willingness_to_pay),
      escapeCSV(f.specific_pay_reason),
      escapeCSV(f.source),
    ].join(",");
  });

  // BOM para que Excel lo abra con UTF-8 correcto
  const csvContent = "\uFEFF" + headers.join(",") + "\n" + rows.join("\n");

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="voya-feedback-${new Date().toISOString().split("T")[0]}.csv"`,
    },
  });
}
