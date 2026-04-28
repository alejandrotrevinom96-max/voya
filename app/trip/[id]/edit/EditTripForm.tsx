"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updateTrip } from "@/app/trip/actions";
import { INTEREST_OPTIONS, TRIP_TYPE_OPTIONS, type TripType } from "@/types";
import type { Trip } from "@/types";
import ChipsInput from "@/components/ui/ChipsInput";
import NumberStepper from "@/components/ui/NumberStepper";

interface EditTripFormProps {
  trip: Trip;
}

export default function EditTripForm({ trip }: EditTripFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [name, setName] = useState(trip.name);
  const [destination, setDestination] = useState(trip.destination);
  const [country, setCountry] = useState(trip.country || "");
  const [cities, setCities] = useState<string[]>(trip.cities || []);
  const [tripType, setTripType] = useState<TripType | null>(trip.trip_type);
  const [startDate, setStartDate] = useState(trip.start_date);
  const [endDate, setEndDate] = useState(trip.end_date);
  const [travelers, setTravelers] = useState(trip.travelers);
  const [currency, setCurrency] = useState(trip.currency);
  const [interests, setInterests] = useState<string[]>(trip.interests);
  const [notes, setNotes] = useState(trip.notes || "");

  function toggleInterest(value: string) {
    setInterests((prev) =>
      prev.includes(value) ? prev.filter((i) => i !== value) : [...prev, value]
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await updateTrip(trip.id, {
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
      notes: notes || undefined,
    });

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    router.push(`/trip/${trip.id}`);
    router.refresh();
  }

  // Prevenir Enter accidentalmente submitiendo el form
  function handleFormKeyDown(e: React.KeyboardEvent<HTMLFormElement>) {
    const target = e.target as HTMLElement;
    if (e.key === "Enter" && target.tagName !== "TEXTAREA") {
      const isSubmitButton =
        target.tagName === "BUTTON" &&
        (target as HTMLButtonElement).type === "submit";
      if (!isSubmitButton) {
        e.preventDefault();
      }
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      onKeyDown={handleFormKeyDown}
      className="space-y-8"
    >
      <div>
        <h2 className="font-display text-3xl font-light text-brown-dark mb-2">
          Editar <span className="italic text-terracotta">viaje</span>
        </h2>
        <p className="text-brown-mid font-light">
          Actualiza los detalles de tu aventura.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-brown-mid">
            Nombre del viaje
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input-base"
            maxLength={80}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-brown-mid">
              Destino
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="input-base"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2 text-brown-mid">
              País
            </label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="input-base"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-brown-mid">
            Ciudades a visitar
          </label>
          <ChipsInput
            values={cities}
            onChange={setCities}
            placeholder="Agregar ciudad..."
            maxItems={10}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-3 text-brown-mid">
            Tipo de viaje
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {TRIP_TYPE_OPTIONS.map((option) => {
              const selected = tripType === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setTripType(selected ? null : option.value)
                  }
                  className={`p-3 rounded-2xl border-2 text-left transition ${
                    selected
                      ? "border-terracotta bg-cream-warm"
                      : "border-sand-dark bg-white hover:border-terracotta-soft"
                  }`}
                >
                  <span className="text-lg mr-2">{option.emoji}</span>
                  <span className="text-sm text-brown-dark">
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-brown-mid">
              Salida
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
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
              min={startDate}
              className="input-base"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2 text-brown-mid">
              Viajeros
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
              <option value="MXN">MXN</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="COP">COP</option>
              <option value="ARS">ARS</option>
              <option value="CLP">CLP</option>
              <option value="PEN">PEN</option>
              <option value="BRL">BRL</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-3 text-brown-mid">
            Intereses
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {INTEREST_OPTIONS.map((option) => {
              const selected = interests.includes(option.value);
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => toggleInterest(option.value)}
                  className={`p-3 rounded-2xl border-2 text-left transition ${
                    selected
                      ? "border-terracotta bg-cream-warm"
                      : "border-sand-dark bg-white hover:border-terracotta-soft"
                  }`}
                >
                  <span className="text-lg mr-2">{option.emoji}</span>
                  <span className="text-sm text-brown-dark">
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-brown-mid">
            Notas{" "}
            <span className="text-brown-soft text-xs">(opcional)</span>
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Recordatorios, preferencias, lo que quieras..."
            className="input-base min-h-[100px] resize-none"
            maxLength={500}
          />
        </div>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-2xl bg-error/10 text-error text-sm">
          {error}
        </div>
      )}

      <div className="flex items-center justify-between pt-6 border-t border-border">
        <Link href={`/trip/${trip.id}`} className="btn-ghost">
          Cancelar
        </Link>
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  );
}
