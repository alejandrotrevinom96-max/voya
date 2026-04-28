"use client";

import { useState, KeyboardEvent, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createTrip } from "../actions";
import { INTEREST_OPTIONS, TRIP_TYPE_OPTIONS, type TripType } from "@/types";
import { toDateInput } from "@/lib/utils/date";
import ChipsInput from "@/components/ui/ChipsInput";
import NumberStepper from "@/components/ui/NumberStepper";

type Step = 1 | 2 | 3 | 4;

export default function NewTripWizard() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Cooldown anti click fantasma: cuando se cambia de paso,
  // se bloquean todos los onClick por 400ms para que el "mouseup"
  // del click anterior NO active el botón nuevo en la misma posición.
  const lastStepChangeRef = useRef<number>(0);

  // Form state
  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");
  const [country, setCountry] = useState("");
  const [cities, setCities] = useState<string[]>([]);
  const [tripType, setTripType] = useState<TripType | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [travelers, setTravelers] = useState(1);
  const [currency, setCurrency] = useState("MXN");
  const [interests, setInterests] = useState<string[]>([]);

  const canProceedStep1 =
    name.trim().length > 0 && destination.trim().length > 0;
  const canProceedStep2 =
    startDate.length > 0 &&
    endDate.length > 0 &&
    new Date(endDate) >= new Date(startDate);
  const canSubmit = canProceedStep1 && canProceedStep2;

  function toggleInterest(value: string) {
    setInterests((prev) =>
      prev.includes(value) ? prev.filter((i) => i !== value) : [...prev, value]
    );
  }

  function handleFormKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const target = e.target as HTMLElement;
    if (e.key === "Enter" && target.tagName !== "TEXTAREA") {
      e.preventDefault();
    }
  }

  // Avanzar/retroceder paso. Marca el timestamp para activar cooldown.
  function goToStep(newStep: Step) {
    lastStepChangeRef.current = Date.now();
    setStep(newStep);
  }

  // Detecta si estamos dentro del cooldown post-cambio-de-paso
  function isInCooldown(): boolean {
    return Date.now() - lastStepChangeRef.current < 400;
  }

  async function handleCreate() {
    // Protección 1: no submit si estamos dentro del cooldown
    // (esto bloquea el click fantasma que viene justo después del paso 3 → 4)
    if (isInCooldown()) {
      console.log("[wizard] click ignored (cooldown)");
      return;
    }

    // Protección 2: no submit si ya estamos cargando
    if (loading) return;

    // Protección 3: solo permitir si todos los campos requeridos están completos
    if (!canSubmit) {
      setError("Completa los datos básicos del viaje");
      return;
    }

    setError("");
    setLoading(true);

    const result = await createTrip({
      name,
      destination,
      country: country || undefined,
      cities,
      trip_type: tripType,
      start_date: startDate,
      end_date: endDate,
      travelers,
      interests,
      currency,
    });

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    if (result.success && result.tripId) {
      router.push(`/trip/${result.tripId}`);
    }
  }

  const today = toDateInput(new Date());

  return (
    // CRÍTICO: <div> en vez de <form>. Sin form, no hay submit posible.
    <div onKeyDown={handleFormKeyDown} className="space-y-8">
      {/* Progress indicator */}
      <div className="flex items-center gap-3 mb-8">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className="flex items-center gap-3 flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition flex-shrink-0 ${
                step >= n
                  ? "bg-brown-dark text-cream"
                  : "bg-cream-warm text-brown-soft"
              }`}
            >
              {n}
            </div>
            {n < 4 && (
              <div
                className={`flex-1 h-px transition ${
                  step > n ? "bg-brown-dark" : "bg-sand-dark"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* PASO 1: Lo básico + ciudades */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-3xl font-light text-brown-dark mb-2">
              Empecemos por lo <span className="italic text-terracotta">básico</span>
            </h2>
            <p className="text-brown-mid font-light">
              ¿Cómo se llama esta aventura y a dónde vas?
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-brown-mid">
              Nombre del viaje
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Mérida con las amigas"
              className="input-base"
              maxLength={80}
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-brown-mid">
                Destino principal
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Ej: Perú"
                className="input-base"
                maxLength={80}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-brown-mid">
                País{" "}
                <span className="text-brown-soft text-xs">(opcional)</span>
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Ej: Perú"
                className="input-base"
                maxLength={80}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-brown-mid">
              Ciudades a visitar{" "}
              <span className="text-brown-soft text-xs">(opcional)</span>
            </label>
            <p className="text-xs text-brown-soft mb-3">
              Si visitarás varias ciudades, agrégalas para que la AI distribuya las
              actividades por ciudad.
            </p>
            <ChipsInput
              values={cities}
              onChange={setCities}
              placeholder="Ej: Cusco, Lima, Arequipa..."
              maxItems={10}
            />
          </div>
        </div>
      )}

      {/* PASO 2: Fechas y viajeros */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-3xl font-light text-brown-dark mb-2">
              ¿Cuándo y con <span className="italic text-terracotta">quién</span>?
            </h2>
            <p className="text-brown-mid font-light">
              Define las fechas y cuántos viajan.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-brown-mid">
                Salida
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (endDate && new Date(endDate) < new Date(e.target.value)) {
                    setEndDate(e.target.value);
                  }
                }}
                min={today}
                className="input-base"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-brown-mid">
                Regreso
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || today}
                className="input-base"
              />
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-brown-mid">
                Número de viajeros
              </label>
              <NumberStepper
                value={travelers}
                onChange={setTravelers}
                min={1}
                max={50}
                label="viajeros"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-brown-mid">
                Moneda
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="input-base"
              >
                <option value="MXN">Pesos mexicanos (MXN)</option>
                <option value="USD">Dólares (USD)</option>
                <option value="EUR">Euros (EUR)</option>
                <option value="GBP">Libras (GBP)</option>
                <option value="COP">Pesos colombianos (COP)</option>
                <option value="ARS">Pesos argentinos (ARS)</option>
                <option value="CLP">Pesos chilenos (CLP)</option>
                <option value="PEN">Soles (PEN)</option>
                <option value="BRL">Reales (BRL)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* PASO 3: Tipo de viaje */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-3xl font-light text-brown-dark mb-2">
              ¿Qué <span className="italic text-terracotta">tipo</span> de viaje es?
            </h2>
            <p className="text-brown-mid font-light">
              Esto ayuda a la AI a sugerirte experiencias acordes a tu estilo.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TRIP_TYPE_OPTIONS.map((option) => {
              const selected = tripType === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setTripType(selected ? null : option.value)
                  }
                  className={`p-4 rounded-2xl border-2 text-left transition ${
                    selected
                      ? "border-terracotta bg-cream-warm"
                      : "border-sand-dark bg-white hover:border-terracotta-soft"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-1">
                    <span className="text-2xl">{option.emoji}</span>
                    <span className="font-medium text-brown-dark">
                      {option.label}
                    </span>
                  </div>
                  <p className="text-xs text-brown-soft pl-9">
                    {option.description}
                  </p>
                </button>
              );
            })}
          </div>

          <p className="text-sm text-brown-soft italic">
            ¿No te decides? Puedes saltar este paso.
          </p>
        </div>
      )}

      {/* PASO 4: Intereses */}
      {step === 4 && (
        <div className="space-y-6">
          <div>
            <h2 className="font-display text-3xl font-light text-brown-dark mb-2">
              ¿Qué te <span className="italic text-terracotta">emociona</span>?
            </h2>
            <p className="text-brown-mid font-light">
              Elige todos los que te llamen la atención.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {INTEREST_OPTIONS.map((option) => {
              const selected = interests.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleInterest(option.value)}
                  className={`p-4 rounded-2xl border-2 text-left transition ${
                    selected
                      ? "border-terracotta bg-cream-warm"
                      : "border-sand-dark bg-white hover:border-terracotta-soft"
                  }`}
                >
                  <div className="text-2xl mb-1">{option.emoji}</div>
                  <div className="text-sm font-medium text-brown-dark">
                    {option.label}
                  </div>
                </button>
              );
            })}
          </div>

          {interests.length === 0 && (
            <p className="text-sm text-brown-soft italic">
              Puedes saltar este paso si lo prefieres.
            </p>
          )}
        </div>
      )}

      {error && (
        <div className="px-4 py-3 rounded-2xl bg-error/10 text-error text-sm">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between pt-6 border-t border-border">
        {step === 1 ? (
          <Link href="/dashboard" className="btn-ghost">
            Cancelar
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => goToStep((step - 1) as Step)}
            className="btn-ghost"
            disabled={loading}
          >
            ← Atrás
          </button>
        )}

        {step < 4 ? (
          <button
            type="button"
            onClick={() => goToStep((step + 1) as Step)}
            disabled={
              (step === 1 && !canProceedStep1) ||
              (step === 2 && !canProceedStep2)
            }
            className="btn-primary"
          >
            Siguiente →
          </button>
        ) : (
          // BULLETPROOF: type="button" + onClick + cooldown anti click fantasma.
          // No hay manera de crear el viaje sin un click intencional del usuario.
          <button
            type="button"
            onClick={handleCreate}
            disabled={!canSubmit || loading}
            className="btn-primary"
          >
            {loading ? "Creando..." : "Crear viaje ✦"}
          </button>
        )}
      </div>
    </div>
  );
}
