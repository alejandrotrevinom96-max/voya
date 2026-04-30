import Link from "next/link";
import LandingInteractive from "@/components/landing/LandingInteractive";
import BetaBanner from "@/components/landing/BetaBanner";
import { LANDING_CSS } from "@/components/landing/landing-styles";

export const metadata = {
  title: "Voyaa · Deja de pensar. Tu viaje, ya planeado.",
  description:
    "Voyaa arma tu próximo viaje en 3 minutos: itinerario, presupuesto y actividades con AI. Tu primer viaje gratis, sin tarjeta.",
  openGraph: {
    title: "Voyaa · Deja de pensar. Tu viaje, ya planeado.",
    description:
      "Ese viaje que llevas años posponiendo. Voyaa te lo arma en 3 minutos.",
    url: "https://voyaa.app",
    siteName: "Voyaa",
    locale: "es_MX",
    type: "website",
  },
};

export default function HomePage() {
  return (
    <>
      {/* CSS scoped a la landing — no interfiere con Tailwind del resto */}
      <style dangerouslySetInnerHTML={{ __html: LANDING_CSS }} />

      <div className="voyaa-landing">
        <BetaBanner />

        {/* ============ NAV ============ */}
        <nav>
          <div className="container nav-inner">
            <div className="logo">
              Voyaa<span>.</span>
            </div>
            <div className="nav-links">
              <a href="#templates">Viajes</a>
              <a href="#como">Cómo funciona</a>
              <a href="#precios">Precios</a>
              <Link href="/auth/signup" className="btn-primary-landing">
                Empezar gratis
              </Link>
            </div>
          </div>
        </nav>

        {/* ============ HERO ============ */}
        <section className="hero">
          <div className="container">
            <div className="hero-tag">🌴 Tu primer viaje, gratis · sin tarjeta</div>
            <h1>
              Deja de pensar.
              <br />
              Tu viaje, ya{" "}
              <span className="underline-word">
                <em>planeado</em>
              </span>
              .
            </h1>
            <p className="hero-sub">
              Ese viaje que llevas años posponiendo. Voyaa te lo arma en 3
              minutos — itinerario realista, presupuesto claro, sin tabs
              abiertos ni Excel a medias.
            </p>
            <div className="hero-cta-row">
              <Link href="/auth/signup" className="btn-hero">
                Planea mi primer viaje gratis →
              </Link>
            </div>
            <p className="hero-microcopy">
              No pides permiso. Solo eliges la fecha.
            </p>
          </div>
        </section>

        {/* ============ QUOTE STRIP ============ */}
        <div className="quote-strip">
          <div className="container">
            <div className="quote-strip-inner">
              &ldquo;Inf, me urge para no sobre pensar 🥺&rdquo;
              <small>— Comentario real en Instagram</small>
            </div>
          </div>
        </div>

        {/* ============ TEMPLATES ============ */}
        <section className="section" id="templates">
          <div className="container">
            <div className="section-eyebrow">Empieza con un click</div>
            <h2 className="section-title">
              ¿Cuál es <em>tu próximo viaje</em>?
            </h2>
            <p className="section-sub">
              Elige uno. Pon fechas. Listo. Sin investigar 17 blogs primero.
            </p>
            <div className="templates-grid">
              <Link
                href="/auth/signup?template=pareja"
                className="template-card"
              >
                <span className="template-tag">💕 Pareja</span>
                <div className="template-emoji">🏞️</div>
                <h3>Fin de semana romántico</h3>
                <p>CDMX → Tepoztlán. Cabaña, temazcal y comida real.</p>
                <div className="template-price">desde $1,200 MXN</div>
                <span className="template-cta">Planear →</span>
              </Link>
              <Link
                href="/auth/signup?template=amigas"
                className="template-card"
              >
                <span className="template-tag">👯 Con amigas</span>
                <div className="template-emoji">🌊</div>
                <h3>5 días en Tulum</h3>
                <p>Cenotes, beach club, mezcal. Sin presupuesto inflado.</p>
                <div className="template-price">desde $4,800 MXN</div>
                <span className="template-cta">Planear →</span>
              </Link>
              <Link
                href="/auth/signup?template=sola"
                className="template-card"
              >
                <span className="template-tag">🌅 Sola</span>
                <div className="template-emoji">🏛️</div>
                <h3>Primer viaje sola</h3>
                <p>San Miguel de Allende. Seguro, caminable, sin culpa.</p>
                <div className="template-price">desde $1,400 MXN</div>
                <span className="template-cta">Planear →</span>
              </Link>
              <Link
                href="/auth/signup?template=lunademiel"
                className="template-card"
              >
                <span className="template-tag">💍 Luna de miel</span>
                <div className="template-emoji">🌺</div>
                <h3>Luna de miel económica</h3>
                <p>Oaxaca + Mazunte. 7 días. Sin endeudarse.</p>
                <div className="template-price">desde $6,500 MXN</div>
                <span className="template-cta">Planear →</span>
              </Link>
              <Link
                href="/auth/signup?template=reset"
                className="template-card"
              >
                <span className="template-tag">✨ Capítulo nuevo</span>
                <div className="template-emoji">🌅</div>
                <h3>Reset · Sayulita</h3>
                <p>5 días sola. Surf, yoga, atardeceres. Para empezar de nuevo.</p>
                <div className="template-price">desde $5,500 MXN</div>
                <span className="template-cta">Planear →</span>
              </Link>
              <Link
                href="/auth/signup?template=daytrip"
                className="template-card"
              >
                <span className="template-tag">🌊 Day trip</span>
                <div className="template-emoji">🏖️</div>
                <h3>Day trip Acapulco</h3>
                <p>Salida CDMX. Transporte + playa. Mismo día.</p>
                <div className="template-price">desde $999 MXN</div>
                <span className="template-cta">Planear →</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ============ HOW IT WORKS ============ */}
        <section className="section how" id="como">
          <div className="container">
            <div className="section-eyebrow">Sin fricción</div>
            <h2 className="section-title">
              3 minutos. <em>Ese es el plan.</em>
            </h2>
            <p className="section-sub">
              No te vamos a hacer responder un quiz de 20 preguntas. Lo
              prometemos.
            </p>
            <div className="how-grid">
              <div className="how-step">
                <div className="how-step-num">01</div>
                <h3>Dinos a dónde y con quién</h3>
                <p>
                  Destino, fechas, presupuesto. Si vas con tu pareja o amigas,
                  las invitas con un link.
                </p>
              </div>
              <div className="how-step">
                <div className="how-step-num">02</div>
                <h3>Voyaa arma todo</h3>
                <p>
                  Itinerario día por día, presupuesto real en pesos, hospedaje,
                  actividades. En 3 minutos.
                </p>
              </div>
              <div className="how-step">
                <div className="how-step-num">03</div>
                <h3>Sale o no sale</h3>
                <p>
                  Tú decides la fecha. Lo demás ya está listo. Sin más juntas,
                  sin más Excel.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ============ GROUP / VOTING ============ */}
        <section className="section">
          <div className="container">
            <div className="group-section">
              <div className="group-text">
                <div
                  className="section-eyebrow"
                  style={{ textAlign: "left", marginBottom: "16px" }}
                >
                  Para los dos · Para todas
                </div>
                <h2>
                  Invita a tu pareja o amigas.{" "}
                  <em>Que voten ellas también.</em>
                </h2>
                <p>
                  El 70% de los viajes no son individuales. Pero planearlos en
                  grupo es una pesadilla de WhatsApp.
                </p>
                <p>
                  Con Voyaa, mandas un link, ven el itinerario y votan cada
                  actividad. <strong>Sin crear cuenta.</strong> Tú decides al
                  final. Sin discusiones.
                </p>
                <ul className="group-list">
                  <li>Comparte el plan con un link</li>
                  <li>Cada quien vota 👍 o 👎 (sin registrarse)</li>
                  <li>Tú armas la versión final</li>
                  <li>Adiós cadena de WhatsApp con 400 mensajes</li>
                </ul>
              </div>
              <div className="group-mockup">
                <div className="group-mockup-header">
                  <div className="group-mockup-trip-name">Tulum · 5 días</div>
                  <div className="group-mockup-meta">3 personas votando</div>
                </div>
                <div className="vote-row">
                  <div className="vote-emoji">🐠</div>
                  <div className="vote-name">
                    Snorkel en Akumal<small>Día 2 · $850 MXN</small>
                  </div>
                  <div className="vote-counts">
                    <span className="vote-up">👍 3</span>
                  </div>
                </div>
                <div className="vote-row">
                  <div className="vote-emoji">🌿</div>
                  <div className="vote-name">
                    Cenote Dos Ojos<small>Día 3 · $400 MXN</small>
                  </div>
                  <div className="vote-counts">
                    <span className="vote-up">👍 2</span>
                    <span className="vote-meh">🤷 1</span>
                  </div>
                </div>
                <div className="vote-row">
                  <div className="vote-emoji">🎶</div>
                  <div className="vote-name">
                    Beach club Papaya Playa<small>Día 4 · $1,200 MXN</small>
                  </div>
                  <div className="vote-counts">
                    <span className="vote-up">👍 1</span>
                    <span className="vote-down">👎 2</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============ AGE INCLUSION ============ */}
        <section className="section">
          <div className="container">
            <div className="age-section">
              <div className="section-eyebrow">No solo para morritas</div>
              <h2>
                Si tienes 45 y van puras chicas en el feed —
                <br />
                <em>esto también es para ti.</em>
              </h2>
              <p>
                El marketing de viajes te ha hecho sentir que ya pasó tu
                momento.
                <br />
                No es cierto.
              </p>
              <p>
                Voyaa arma viajes para mujeres que están empezando un capítulo
                nuevo: después de un divorcio, después de criar, después de lo
                que sea.
              </p>
              <div className="age-quote">
                &ldquo;Yo armaba los itinerarios y tours, pero ahora sola me da
                miedo. Mi pareja falleció en diciembre y su sueño era ir a
                Angkor.&rdquo;
                <small>— Comentario real en grupo de Facebook · 2026</small>
              </div>
              <p>
                Hay un viaje pendiente. Y hay una manera de armarlo sin sentirse
                perdida.
              </p>
              <Link
                href="/auth/signup"
                className="btn-hero"
                style={{ marginTop: "16px" }}
              >
                Empieza el tuyo →
              </Link>
            </div>
          </div>
        </section>

        {/* ============ PRICING + FAQ (Client Component) ============ */}
        <LandingInteractive />

        {/* ============ FINAL CTA ============ */}
        <section className="final-cta">
          <div className="container">
            <h2>
              Has pospuesto ese viaje
              <br />
              <em>suficiente.</em>
            </h2>
            <p>El primero es gratis. Tú solo decides la fecha.</p>
            <Link href="/auth/signup" className="btn-hero">
              Planear mi primer viaje · gratis →
            </Link>
            <p className="final-cta-fine">
              Sin tarjeta · Cancela cuando quieras · Hecho en México
            </p>
          </div>
        </section>

        <footer className="landing-footer">
          <div className="container">
            © 2026 Voyaa · Para quienes ya estaban listas para irse 🌴
          </div>
        </footer>
      </div>
    </>
  );
}
