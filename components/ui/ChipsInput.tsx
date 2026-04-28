"use client";

import { useState, KeyboardEvent } from "react";

interface ChipsInputProps {
  values: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  maxItems?: number;
  disabled?: boolean;
}

export default function ChipsInput({
  values,
  onChange,
  placeholder = "Agregar...",
  maxItems = 20,
  disabled = false,
}: ChipsInputProps) {
  const [input, setInput] = useState("");

  function addChip() {
    const trimmed = input.trim();
    if (!trimmed) return;
    if (values.length >= maxItems) return;
    // Evitar duplicados (case-insensitive)
    if (values.some((v) => v.toLowerCase() === trimmed.toLowerCase())) {
      setInput("");
      return;
    }
    onChange([...values, trimmed]);
    setInput("");
  }

  function removeChip(index: number) {
    onChange(values.filter((_, i) => i !== index));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addChip();
    } else if (e.key === "Backspace" && input === "" && values.length > 0) {
      // Borrar el último chip si el input está vacío y aprietan backspace
      removeChip(values.length - 1);
    }
  }

  return (
    <div>
      {values.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {values.map((value, index) => (
            <div
              key={`${value}-${index}`}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cream-warm text-brown-dark text-sm border border-sand-dark"
            >
              <span>{value}</span>
              {!disabled && (
                <button
                  type="button"
                  onClick={() => removeChip(index)}
                  className="text-brown-soft hover:text-error transition w-4 h-4 flex items-center justify-center"
                  aria-label={`Quitar ${value}`}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || values.length >= maxItems}
          className="input-base flex-1"
          maxLength={60}
        />
        <button
          type="button"
          onClick={addChip}
          disabled={disabled || !input.trim() || values.length >= maxItems}
          className="px-5 py-3 rounded-2xl bg-brown-dark text-cream font-medium disabled:opacity-30 transition hover:scale-105 active:scale-95"
        >
          +
        </button>
      </div>

      {values.length >= maxItems && (
        <p className="text-xs text-brown-soft mt-2">
          Máximo {maxItems} elementos
        </p>
      )}
    </div>
  );
}
