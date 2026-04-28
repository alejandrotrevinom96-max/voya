interface SpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function Spinner({ size = "md", className = "" }: SpinnerProps) {
  const dimensions = {
    sm: "w-4 h-4 border-2",
    md: "w-6 h-6 border-2",
    lg: "w-10 h-10 border-[3px]",
  }[size];

  return (
    <div
      className={`${dimensions} rounded-full border-current border-t-transparent animate-spin ${className}`}
      role="status"
      aria-label="Cargando"
    />
  );
}
