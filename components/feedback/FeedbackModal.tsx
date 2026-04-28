"use client";

import { useState, FormEvent } from "react";
import {
  submitFeedback,
  dismissFeedbackModal,
  type WillingnessToPay,
} from "@/app/feedback-actions";
import { useToast } from "@/components/ui/Toast";

interface FeedbackModalProps {
  tripId: string | null;
  onClose: () => void;
  onSubmitted: () => void;
}

const WILLINGNESS_OPTIONS: Array<{
  value: WillingnessToPay;
  label: string;
  description?: string;
}> = [
  {
    value: "yes-no-question",
    label: "Sí, sin pensarlo",
    description: "Por algo así pagaría hoy mismo.",
  },
  {
    value: "would-consider",
    label: "Lo consideraría",
    description: "Depende de los features y precio.",
  },
  {
    value: "specific-need",
    label: "Solo por algo específico que necesite",
    description: "Hay un feature muy puntual que me haría pagar.",
  },
  {
    value: "prefer-free",
    label: "Prefiero la versión gratuita",
    description: "No pagaría aunque quisiera.",
  },
  {
    value: "unsure",
    label: "No estoy segura aún",
    description: "Necesito usarlo más para decidir.",
  },
];

export default function FeedbackModal({
  tripId,
  onClose,
  onSubmitted,
}: FeedbackModalProps) {
  const [npsScore, setNpsScore] = useState<number | null>(null);
  const [mostUseful, setMostUseful] = useState("");
  const [whatWasMissing, setWhatWasMissing] = useState("");
  const [willingness, setWillingness] = useState<WillingnessToPay | null>(null);
  const [specificReason, setSpecificReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { showToast } = useToast();

  const canSubmit =
    npsScore !== null &&
    mostUseful.trim().length > 0 &&
    willingness !== null &&
    (willingness !== "specific-need" || specificReason.trim().length > 0);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setLoading(true);
    setError("");

    const result = await submitFeedback({
      trip_id: tripId,
      nps_score: npsScore!,
      most_useful: mostUseful,
      what_was_missing: whatWasMissing || undefined,
      willingness_to_pay: willingness!,
      specific_pay_reason:
        willingness === "specific-need" ? specificReason : undefined,
      source: "first-trip-modal",
    });

    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    showToast("¡Gracias por tu feedback! ✦", "success");
    onSubmitted();
  }

  async function handleDismiss() {
    setLoading(true);
    await dismissFeedbackModal("first-trip-modal");
    onClose();
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-brown-dark/50 z-[90] backdrop-blur-sm"
        onClick={() => !loading && handleDismiss()}
      />
      <div className="fixed inset-0 z-[91] flex items-center justify-center p-4 pointer-events-none overflow-y-auto">
        <div
          className="bg-white rounded-3xl shadow-2xl max-w-lg w-full pointer-events-auto my-auto"
          onClick={(e) => e.stopPropagation()}
        >
          <form onSubmit={handleSubmit}>
            <div className="p-6 md:p-8 max-h-[85vh] overflow-y-auto">
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2 text-terracotta text-sm">
                  <span className="text-lg">✦</span>
                  <span className="font-medium">¡Hiciste tu primer viaje!</span>
                </div>
                <h2 className="font-display text-2xl md:text-3xl font-light text-brown-dark mb-2">
                  ¿Cómo te <span className="italic text-terracotta">fue</span>?
                </h2>
                <p className="text-brown-mid text-sm">
                  Tu opinión nos ayuda a mejorar. 30 segundos, prometido.
                </p>
              </div>

              {/* Pregunta 1: NPS */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-brown-dark mb-3">
                  1. ¿Qué tan probable es que recomiendes Voya a una amiga?
                </label>
                <div className="flex gap-1.5 flex-wrap">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setNpsScore(n)}
                      className={`flex-1 min-w-[36px] h-10 rounded-xl text-sm font-medium transition ${
                        npsScore === n
                          ? "bg-brown-dark text-cream scale-110"
                          : "bg-cream-warm text-brown-mid hover:bg-sand"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-brown-soft mt-2">
                  <span>Nada probable</span>
                  <span>Muy probable</span>
                </div>
              </div>

              {/* Pregunta 2: Lo más útil */}
              <div className="mb-6">
                <label
                  htmlFor="most-useful"
                  className="block text-sm font-medium text-brown-dark mb-2"
                >
                  2. ¿Qué fue lo MÁS útil de Voya para ti?
                </label>
                <textarea
                  id="most-useful"
                  value={mostUseful}
                  onChange={(e) => setMostUseful(e.target.value)}
                  placeholder="Ej: La AI me ahorró horas de búsqueda..."
                  className="input-base min-h-[80px] resize-none text-sm"
                  maxLength={500}
                  required
                />
              </div>

              {/* Pregunta 3: Lo que faltó */}
              <div className="mb-6">
                <label
                  htmlFor="what-missing"
                  className="block text-sm font-medium text-brown-dark mb-2"
                >
                  3. ¿Qué te faltó o mejorarías?{" "}
                  <span className="text-brown-soft font-normal text-xs">
                    (opcional)
                  </span>
                </label>
                <textarea
                  id="what-missing"
                  value={whatWasMissing}
                  onChange={(e) => setWhatWasMissing(e.target.value)}
                  placeholder="Ej: Me gustaría poder..."
                  className="input-base min-h-[80px] resize-none text-sm"
                  maxLength={500}
                />
              </div>

              {/* Pregunta 4: Willingness to pay */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-brown-dark mb-3">
                  4. ¿Pagarías por una versión Premium de Voya?
                </label>
                <div className="space-y-2">
                  {WILLINGNESS_OPTIONS.map((option) => {
                    const selected = willingness === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setWillingness(option.value)}
                        className={`w-full text-left p-3 rounded-2xl border-2 transition ${
                          selected
                            ? "border-terracotta bg-cream-warm"
                            : "border-sand-dark bg-white hover:border-terracotta-soft"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0 transition ${
                              selected
                                ? "border-terracotta bg-terracotta"
                                : "border-sand-dark"
                            }`}
                          >
                            {selected && (
                              <div className="w-1.5 h-1.5 rounded-full bg-white m-auto mt-[3px]" />
                            )}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-brown-dark">
                              {option.label}
                            </div>
                            {option.description && (
                              <div className="text-xs text-brown-soft mt-0.5">
                                {option.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Follow-up condicional para "specific-need" */}
                {willingness === "specific-need" && (
                  <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <label
                      htmlFor="specific-reason"
                      className="block text-sm font-medium text-brown-dark mb-2"
                    >
                      ¿Qué feature específico te haría pagar?
                    </label>
                    <textarea
                      id="specific-reason"
                      value={specificReason}
                      onChange={(e) => setSpecificReason(e.target.value)}
                      placeholder="Ej: Sincronización con Google Calendar, modo offline..."
                      className="input-base min-h-[60px] resize-none text-sm"
                      maxLength={500}
                      required
                    />
                  </div>
                )}
              </div>

              {error && (
                <div className="px-4 py-3 rounded-2xl bg-error/10 text-error text-sm mb-4">
                  {error}
                </div>
              )}
            </div>

            {/* Footer con botones */}
            <div className="flex flex-col-reverse sm:flex-row gap-3 justify-between p-6 border-t border-border bg-cream/50">
              <button
                type="button"
                onClick={handleDismiss}
                disabled={loading}
                className="btn-ghost text-sm"
              >
                Ahora no
              </button>
              <button
                type="submit"
                disabled={!canSubmit || loading}
                className="btn-primary text-sm"
              >
                {loading ? "Enviando..." : "Enviar feedback ✦"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
