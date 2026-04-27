import Link from "next/link";
import SignupForm from "./SignupForm";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="px-6 md:px-12 py-6">
        <Link
          href="/"
          className="font-display text-2xl font-medium tracking-tight text-brown-dark"
        >
          Voya<span className="text-terracotta">.</span>
        </Link>
      </nav>

      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            <h1 className="font-display text-4xl md:text-5xl font-light leading-tight text-brown-dark mb-4">
              Empieza a planear<br />
              tu próximo <span className="italic text-terracotta">viaje</span>
            </h1>
            <p className="text-brown-mid font-light">
              Crea tu cuenta gratis. Sin tarjeta requerida.
            </p>
          </div>

          <div className="card-base shadow-sm">
            <SignupForm />
          </div>

          <p className="text-xs text-center text-brown-soft mt-6 px-4 leading-relaxed">
            Al crear tu cuenta aceptas nuestros términos. Las recomendaciones de
            actividades son generadas por AI y deben verificarse antes del viaje.
          </p>
        </div>
      </div>
    </div>
  );
}
