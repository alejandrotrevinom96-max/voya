import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AppHeader from "@/components/AppHeader";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

const WILLINGNESS_LABELS: Record<string, { label: string; emoji: string; color: string }> = {
  "yes-no-question": { label: "Sí, sin pensarlo", emoji: "🟢", color: "bg-success/10 text-success" },
  "would-consider": { label: "Lo consideraría", emoji: "🟡", color: "bg-cream-warm text-brown-mid" },
  "specific-need": { label: "Solo por algo específico", emoji: "💎", color: "bg-terracotta/10 text-terracotta" },
  "prefer-free": { label: "Prefiero la gratuita", emoji: "🔴", color: "bg-error/10 text-error" },
  "unsure": { label: "No estoy segura aún", emoji: "⚪", color: "bg-sand text-brown-mid" },
};

export const dynamic = "force-dynamic";

export default async function AdminFeedbackPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth/login");
  }

  // Verificar que el user sea admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin, email")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    notFound();
  }

  // Obtener TODO el feedback (RLS permite a admin ver todo)
  const { data: feedbackList } = await supabase
    .from("feedback")
    .select("*")
    .order("created_at", { ascending: false });

  const allFeedback = feedbackList || [];

  // Para mostrar emails de los users, hacemos un query separado a profiles
  const userIds = Array.from(new Set(allFeedback.map((f) => f.user_id).filter(Boolean)));

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, full_name")
    .in("id", userIds.length > 0 ? userIds : ["00000000-0000-0000-0000-000000000000"]);

  const profilesById = new Map(
    (profiles || []).map((p) => [p.id, p])
  );

  // Para mostrar destinos de los trips
  const tripIds = Array.from(new Set(allFeedback.map((f) => f.trip_id).filter(Boolean)));

  const { data: trips } = await supabase
    .from("trips")
    .select("id, name, destination")
    .in("id", tripIds.length > 0 ? tripIds : ["00000000-0000-0000-0000-000000000000"]);

  const tripsById = new Map((trips || []).map((t) => [t.id, t]));

  // Calcular stats
  const total = allFeedback.length;
  const npsScores = allFeedback
    .map((f) => f.nps_score)
    .filter((s): s is number => s !== null);

  const avgNps =
    npsScores.length > 0
      ? (npsScores.reduce((a, b) => a + b, 0) / npsScores.length).toFixed(1)
      : "—";

  // NPS real: % promotores (9-10) - % detractores (0-6)
  const promoters = npsScores.filter((s) => s >= 9).length;
  const detractors = npsScores.filter((s) => s <= 6).length;
  const npsReal =
    npsScores.length > 0
      ? Math.round(((promoters - detractors) / npsScores.length) * 100)
      : null;

  // Distribución willingness to pay
  const willingnessCounts = new Map<string, number>();
  allFeedback.forEach((f) => {
    if (f.willingness_to_pay) {
      willingnessCounts.set(
        f.willingness_to_pay,
        (willingnessCounts.get(f.willingness_to_pay) || 0) + 1
      );
    }
  });

  return (
    <div className="min-h-screen">
      <AppHeader userEmail={user.email} />

      <main className="px-6 md:px-12 lg:px-20 py-8 max-w-7xl mx-auto">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-brown-soft hover:text-brown-mid transition mb-6"
        >
          ← Volver al dashboard
        </Link>

        <div className="mb-8">
          <div className="text-xs uppercase tracking-wider text-terracotta mb-2">
            Admin · Solo tú puedes ver esto
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-light text-brown-dark mb-2">
            Feedback de <span className="italic text-terracotta">usuarios</span>
          </h1>
          <p className="text-brown-mid">
            {total} {total === 1 ? "respuesta" : "respuestas"} · Actualizado en
            tiempo real
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="card-base text-center">
            <p className="text-xs uppercase tracking-wider text-brown-soft mb-1">
              Total respuestas
            </p>
            <p className="font-display text-3xl font-medium text-brown-dark">
              {total}
            </p>
          </div>
          <div className="card-base text-center">
            <p className="text-xs uppercase tracking-wider text-brown-soft mb-1">
              NPS promedio (1-10)
            </p>
            <p className="font-display text-3xl font-medium text-brown-dark">
              {avgNps}
            </p>
          </div>
          <div className="card-base text-center">
            <p className="text-xs uppercase tracking-wider text-brown-soft mb-1">
              NPS real (-100 a +100)
            </p>
            <p
              className={`font-display text-3xl font-medium ${
                npsReal === null
                  ? "text-brown-soft"
                  : npsReal >= 50
                  ? "text-success"
                  : npsReal >= 0
                  ? "text-terracotta"
                  : "text-error"
              }`}
            >
              {npsReal === null ? "—" : npsReal > 0 ? `+${npsReal}` : npsReal}
            </p>
          </div>
          <div className="card-base text-center">
            <p className="text-xs uppercase tracking-wider text-brown-soft mb-1">
              Premium "sí" 🟢
            </p>
            <p className="font-display text-3xl font-medium text-brown-dark">
              {willingnessCounts.get("yes-no-question") || 0}
              <span className="text-base text-brown-soft ml-1">
                / {total}
              </span>
            </p>
          </div>
        </div>

        {/* Distribución willingness */}
        {total > 0 && (
          <div className="card-base mb-8">
            <h2 className="font-display text-xl font-medium text-brown-dark mb-4">
              Willingness to Pay
            </h2>
            <div className="space-y-2">
              {Object.entries(WILLINGNESS_LABELS).map(([value, info]) => {
                const count = willingnessCounts.get(value) || 0;
                const pct = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={value} className="flex items-center gap-3">
                    <div className="w-48 text-sm text-brown-mid flex items-center gap-2">
                      <span>{info.emoji}</span>
                      <span>{info.label}</span>
                    </div>
                    <div className="flex-1 h-6 bg-cream rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          value === "yes-no-question"
                            ? "bg-success"
                            : value === "specific-need"
                            ? "bg-terracotta"
                            : value === "prefer-free"
                            ? "bg-error"
                            : "bg-sand-dark"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="w-16 text-sm text-brown-mid text-right">
                      {count} ({pct.toFixed(0)}%)
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Lista de respuestas */}
        {allFeedback.length === 0 ? (
          <div className="card-base text-center py-16">
            <div className="text-5xl mb-4">📊</div>
            <h2 className="font-display text-2xl font-medium text-brown-dark mb-2">
              Sin respuestas todavía
            </h2>
            <p className="text-brown-mid">
              Cuando los usuarios completen su primer viaje y respondan el
              modal, sus respuestas aparecerán aquí.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <h2 className="font-display text-2xl font-light text-brown-dark mb-4">
              Respuestas individuales
            </h2>
            {allFeedback.map((fb) => {
              const userProfile = fb.user_id
                ? profilesById.get(fb.user_id)
                : null;
              const trip = fb.trip_id ? tripsById.get(fb.trip_id) : null;
              const willingness = fb.willingness_to_pay
                ? WILLINGNESS_LABELS[fb.willingness_to_pay]
                : null;

              return (
                <div key={fb.id} className="card-base">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-4 pb-4 border-b border-border">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-brown-dark">
                          {userProfile?.full_name || userProfile?.email || "Usuario"}
                        </span>
                        {userProfile?.email &&
                          userProfile.full_name && (
                            <span className="text-xs text-brown-soft">
                              · {userProfile.email}
                            </span>
                          )}
                      </div>
                      <div className="text-xs text-brown-soft">
                        {format(parseISO(fb.created_at), "d MMM yyyy, HH:mm", {
                          locale: es,
                        })}
                        {trip && (
                          <>
                            {" · "}
                            <span className="text-brown-mid">
                              Viaje: {trip.name} ({trip.destination})
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-xs uppercase tracking-wider text-brown-soft">
                          NPS
                        </div>
                        <div
                          className={`font-display text-2xl font-medium ${
                            fb.nps_score && fb.nps_score >= 9
                              ? "text-success"
                              : fb.nps_score && fb.nps_score <= 6
                              ? "text-error"
                              : "text-brown-dark"
                          }`}
                        >
                          {fb.nps_score}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-brown-soft mb-1">
                        Lo más útil
                      </p>
                      <p className="text-sm text-brown-dark whitespace-pre-wrap">
                        {fb.most_useful || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-brown-soft mb-1">
                        Lo que faltó
                      </p>
                      <p className="text-sm text-brown-dark whitespace-pre-wrap">
                        {fb.what_was_missing || (
                          <span className="italic text-brown-soft">
                            (no respondió)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {willingness && (
                    <div className="pt-4 border-t border-border">
                      <p className="text-xs uppercase tracking-wider text-brown-soft mb-2">
                        Pagaría por Premium
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm ${willingness.color}`}
                        >
                          <span>{willingness.emoji}</span>
                          <span>{willingness.label}</span>
                        </span>
                      </div>
                      {fb.specific_pay_reason && (
                        <div className="mt-2 px-4 py-2 rounded-2xl bg-cream-warm text-sm text-brown-dark">
                          <span className="text-terracotta">💎</span>{" "}
                          <span className="italic">"{fb.specific_pay_reason}"</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Export CSV link */}
        {allFeedback.length > 0 && (
          <div className="mt-8 text-center">
            <a
              href="/api/admin/feedback/export"
              download="voya-feedback.csv"
              className="btn-secondary text-sm inline-flex"
            >
              📥 Exportar a CSV
            </a>
          </div>
        )}
      </main>
    </div>
  );
}
