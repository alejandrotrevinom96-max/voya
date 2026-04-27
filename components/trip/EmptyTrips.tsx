import Link from "next/link";

export default function EmptyTrips() {
  return (
    <div className="card-base text-center py-16 px-6">
      <div className="text-6xl mb-6">🌴</div>
      <h2 className="font-display text-3xl font-medium text-brown-dark mb-3">
        Tu primer viaje te <span className="italic text-terracotta">espera</span>
      </h2>
      <p className="text-brown-mid font-light max-w-md mx-auto mb-8">
        Empieza a planear tu próxima aventura. Crea un viaje y descubre las
        mejores actividades de tu destino con AI.
      </p>
      <Link href="/trip/new" className="btn-primary inline-flex">
        <span>Crear mi primer viaje</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      </Link>
    </div>
  );
}
