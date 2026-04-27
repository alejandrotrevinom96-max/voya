"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createTrip } from "../actions";
import { INTEREST_OPTIONS } from "@/types";
import { toDateInput } from "@/lib/utils/date";

type Step = 1 | 2 | 3;

export default function NewTripWizard() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [destination, setDestination] = useState("");
  const [country, setCountry] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [travelers, setTravelers] = useState(1);
  const [currency, setCurrency] = useState("MXN");
  const [interests, setInterests] = useState<string[]>([]);

  // Validaciones por paso
  const canProceedStep1 =
    name.trim().length > 0 && destination.trim().length > 0;
  const canProceedStep2 =
    startDate.length > 0 && endDate.length > 0 && new Date(endDate) >= new Date(startDate);
  const canSubmit = canProceedStep1 && canProceedStep2;

  function toggleInterest(value: string) {
    setInterests((prev) =>
      prev.includes(value) ? prev.filter((i) => i !== value) : [...prev, value]
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setError("");
    setLoading(true);

    const result = await createTrip({
      name,
      destination,
      country: country || undefined,
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

  // Sugerir fecha mínima como hoy
  const today = toDateInput(new Date());

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Progress indicator */}
      <div className="flex items-center gap-3 mb-8">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex items-center gap-3 flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition ${
                step >= n
                  ? "bg-brown-dark text-cream"
                  : "bg-cream-warm text-brown-soft"
              }`}
            >
              {n}
            </div>
            {n < 3 && (
              <div
                className={`flex-1 h-px transition ${
                  step > n ? "bg-brown-dark" : "bg-sand-dark"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* PASO 1: Lo básico */}
      {step === 1 && (
        <div className="space-y-6 animate-in fade-in duration-300">
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
                Destino (ciudad)
              </label>
              <input
                type="text"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                placeholder="Ej: Mérida"
                className="input-base"
                maxLength={80}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-brown-mid">
                País <span className="text-brown-soft text-xs">(opcional)</span>
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                placeholder="Ej: México"
                className="input-base"
                maxLength={80}
              />
            </div>
          </div>
        </div>
      )}

      {/* PASO 2: Fechas y viajeros */}
      {step === 2 && (
        <div className="space-y-6 animate-in fade-in duration-300">
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
              <input
                type="number"
                value={travelers}
                onChange={(e) => setTravelers(Math.max(1, parseInt(e.target.value) || 1))}
                min={1}
                max={50}
                className="input-base"
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

      {/* PASO 3: Intereses */}
      {step === 3 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div>
            <h2 className="font-display text-3xl font-light text-brown-dark mb-2">
              ¿Qué te <span className="italic text-terracotta">emociona</span>?
            </h2>
            <p className="text-brown-mid font-light">
              Elige todos los que te llamen. Esto nos ayuda a recomendarte mejor.
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
              Puedes saltarte este paso si lo prefieres.
            </p>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="px-4 py-3 rounded-2xl bg-error/10 text-error text-sm">
          {error}
        </div>
      )}

      {/* Botones de navegación */}
      <div className="flex items-center justify-between pt-6 border-t border-border">
        {step === 1 ? (
          <Link href="/dashboard" className="btn-ghost">
            Cancelar
          </Link>
        ) : (
          <button
            type="button"
            onClick={() => setStep((step - 1) as Step)}
            className="btn-ghost"
            disabled={loading}
          >
            ← Atrás
          </button>
        )}

        {step < 3 ? (
          <button
            type="button"
            onClick={() => setStep((step + 1) as Step)}
            disabled={
              (step === 1 && !canProceedStep1) ||
              (step === 2 && !canProceedStep2)
            }
            className="btn-primary"
          >
            Siguiente →
          </button>
        ) : (
          <button type="submit" disabled={!canSubmit || loading} className="btn-primary">
            {loading ? "Creando..." : "Crear viaje ✦"}
          </button>
        )}
      </div>
    </form>
  );
}
