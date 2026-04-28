"use client";

interface NumberStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
  label?: string;
}

export default function NumberStepper({
  value,
  onChange,
  min = 1,
  max = 50,
  disabled = false,
  label,
}: NumberStepperProps) {
  function decrement() {
    if (value > min) onChange(value - 1);
  }

  function increment() {
    if (value < max) onChange(value + 1);
  }

  function handleManualChange(e: React.ChangeEvent<HTMLInputElement>) {
    const num = parseInt(e.target.value);
    if (isNaN(num)) {
      onChange(min);
      return;
    }
    onChange(Math.min(max, Math.max(min, num)));
  }

  const canDecrement = value > min && !disabled;
  const canIncrement = value < max && !disabled;

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={decrement}
        disabled={!canDecrement}
        aria-label={label ? `Disminuir ${label}` : "Disminuir"}
        className="w-12 h-12 rounded-2xl bg-cream-warm text-brown-dark text-xl font-medium flex items-center justify-center hover:bg-sand active:scale-95 transition disabled:opacity-30 disabled:cursor-not-allowed"
      >
        −
      </button>
      <input
        type="number"
        value={value}
        onChange={handleManualChange}
        min={min}
        max={max}
        disabled={disabled}
        className="input-base text-center w-20 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button
        type="button"
        onClick={increment}
        disabled={!canIncrement}
        aria-label={label ? `Aumentar ${label}` : "Aumentar"}
        className="w-12 h-12 rounded-2xl bg-cream-warm text-brown-dark text-xl font-medium flex items-center justify-center hover:bg-sand active:scale-95 transition disabled:opacity-30 disabled:cursor-not-allowed"
      >
        +
      </button>
    </div>
  );
}
