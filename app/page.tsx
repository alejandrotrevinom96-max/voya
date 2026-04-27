import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Home() {
  // Si el user ya está logueado, mandarlo al dashboard
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <>
      {/* NAV */}
      <nav className="px-6 md:px-12 lg:px-20 py-6 flex items-center justify-between">
        <div className="font-display text-2xl font-medium tracking-tight text-brown-dark">
          Voya<span className="text-terracotta">.</span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/auth/login" className="btn-ghost text-sm">
            Iniciar sesión
          </Link>
          <Link href="/auth/signup" className="btn-primary text-sm">
            Empezar gratis
          </Link>
        </div>
      </nav>

      {/* HERO */}
      <section className="px-6 md:px-12 lg:px-20 pt-12 md:pt-20 pb-32">
        <div className="max-w-7xl mx-auto grid md:grid-cols-12 gap-8 items-center">
          <div className="md:col-span-7">
            <div className="flex items-center gap-2 mb-8">
              <div className="h-px w-8 bg-terracotta" />
              <span className="text-xs tracking-[0.25em] uppercase text-terracotta">
                Versión beta · Gratis
              </span>
            </div>

            <h1 className="font-display text-[3.5rem] md:text-[5.5rem] lg:text-[6.5rem] leading-[0.95] font-light tracking-tight mb-8 text-brown-dark">
              Planea el viaje
              <br />
              de tus <span className="italic text-terracotta">sueños</span>
              <br />
              <span className="italic font-light">sin el caos</span>
            </h1>

            <p className="text-lg md:text-xl max-w-xl leading-relaxed mb-10 font-light text-brown-mid">
              Descubre las mejores actividades de cada destino con AI, agrégalas
              a tu calendario y obtén un presupuesto realista — todo en un solo
              lugar.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
              <Link href="/auth/signup" className="btn-primary px-8 py-4">
                <span>Empezar gratis</span>
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
              <span className="text-sm text-brown-soft">
                Sin tarjeta · Cancela cuando quieras
              </span>
            </div>
          </div>

          <div className="md:col-span-5 relative h-[400px] md:h-[500px] hidden md:block">
            <div className="absolute top-0 right-0 w-72 md:w-80 p-6 rounded-3xl shadow-xl bg-white border border-border">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs tracking-widest uppercase text-terracotta">
                  Viaje 01
                </span>
                <span className="text-xs text-brown-soft">5 días</span>
              </div>
              <h3 className="font-display text-3xl font-medium mb-1 text-brown-dark">
                Mérida
              </h3>
              <p className="text-sm mb-5 text-brown-soft">Yucatán, México</p>
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-brown-mid">Cenote Ik Kil</span>
                  <span className="font-display italic text-terracotta">
                    $280
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-brown-mid">Chichén Itzá</span>
                  <span className="font-display italic text-terracotta">
                    $614
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-brown-mid">La Chaya Maya</span>
                  <span className="font-display italic text-terracotta">
                    $450
                  </span>
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 w-64 md:w-72 p-6 rounded-3xl shadow-xl bg-sand border border-sand-dark">
              <span className="text-xs tracking-widest uppercase text-terracotta-deep">
                Viaje 02
              </span>
              <h3 className="font-display text-3xl font-medium mt-3 mb-1 text-brown-dark">
                Perú
              </h3>
              <p className="text-sm text-terracotta-deep">10 días</p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER simple */}
      <footer className="px-6 md:px-12 lg:px-20 py-8 border-t border-sand-dark">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-display text-xl font-medium text-brown-dark">
            Voya<span className="text-terracotta">.</span>
          </div>
          <p className="text-sm font-light text-brown-soft">
            © 2026 Voya. Hecho con cariño para quienes sueñan con viajar.
          </p>
        </div>
      </footer>
    </>
  );
}
