import LandingInteractive from "@/components/landing/LandingInteractive";
import BetaBanner from "@/components/landing/BetaBanner";
import TemplateCard from "@/components/landing/TemplateCard";
import LandingDemoHero from "@/components/landing/LandingDemoHero";
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
              <a href="#voyaa-search-anchor" className="btn-primary-landing">
                Empezar gratis
              </a>
            </div>
          </div>
        </nav>

        {/* ============ HERO con DEMO ============ */}
        <LandingDemoHero />

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
              <TemplateCard
                href="/auth/signup?template=pareja"
                tag="💕 Pareja"
                emoji="🏞️"
                title="Fin de semana romántico"
                description="CDMX → Tepoztlán. Cabaña, temazcal y comida real."
                price="desde $1,200 MXN"
                contentName="Fin de semana romántico"
              />
              <TemplateCard
                href="/auth/signup?template=amigas"
                tag="👯 Con amigas"
                emoji="🌊"
                title="5 días en Tulum"
                description="Cenotes, beach club, mezcal. Sin presupuesto inflado."
                price="desde $4,800 MXN"
                contentName="5 días en Tulum"
              />
              <TemplateCard
                href="/auth/signup?template=sola"
                tag="🌅 Sola"
                emoji="🏛️"
                title="Primer viaje sola"
                description="San Miguel de Allende. Seguro, caminable, sin culpa."
                price="desde $1,400 MXN"
                contentName="Primer viaje sola"
              />
              <TemplateCard
                href="/auth/signup?template=lunademiel"
                tag="💍 Luna de miel"
                emoji="🌺"
                title="Luna de miel económica"
                description="Oaxaca + Mazunte. 7 días. Sin endeudarse."
                price="desde $6,500 MXN"
                contentName="Luna de miel económica"
              />
              <TemplateCard
                href="/auth/signup?template=reset"
                tag="✨ Capítulo nuevo"
                emoji="🌅"
                title="Reset · Sayulita"
                description="5 días sola. Surf, yoga, atardeceres. Para empezar de nuevo."
                price="desde $5,500 MXN"
                contentName="Reset · Sayulita"
              />
              <TemplateCard
                href="/auth/signup?template=daytrip"
                tag="🌊 Day trip"
                emoji="🏖️"
                title="Day trip Acapulco"
                description="Salida CDMX. Transporte + playa. Mismo día."
                price="desde $999 MXN"
                contentName="Day trip Acapulco"
              />
            </div>
          </div>
        </section>

        {/* ============ HOW IT WORKS ============ */}
        <section className="section how" id="como">
          <div className="container">
            <div className="section-eyebrow">Sin fricción</div>
            <h2 className="section-title">
              30 segundos. <em>Ese es el plan.</em>
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
                  actividades. En 30 segundos.
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
            <a href="#voyaa-search-anchor" className="btn-hero">
              Planear mi primer viaje · gratis →
            </a>
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
