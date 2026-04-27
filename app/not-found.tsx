import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="text-7xl mb-6">🗺️</div>
      <h1 className="font-display text-5xl md:text-6xl font-light text-brown-dark mb-4">
        Te <span className="italic text-terracotta">perdiste</span>
      </h1>
      <p className="text-brown-mid font-light max-w-md mb-8">
        No encontramos lo que buscas. Quizá tomaste un atajo que no existe o el
        viaje fue borrado.
      </p>
      <Link href="/dashboard" className="btn-primary">
        Volver al dashboard
      </Link>
    </div>
  );
}
