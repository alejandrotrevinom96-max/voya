import Link from "next/link";
import LoginForm from "./LoginForm";

export default function LoginPage() {
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
              <span className="italic text-terracotta">Bienvenida</span> de vuelta
            </h1>
            <p className="text-brown-mid font-light">
              ¿A dónde te lleva el viento esta vez?
            </p>
          </div>

          <div className="card-base shadow-sm">
            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}
