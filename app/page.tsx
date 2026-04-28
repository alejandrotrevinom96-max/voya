import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import LandingNav from "@/components/landing/LandingNav";

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
    <div className="landing">
      <LandingNav />

      {/* HERO */}
      <section className="landing-hero-section">
        <div className="hero">
          <div className="hero-left">
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              Beta gratuita — sin tarjeta de crédito
            </div>
            <h1 className="hero-h1">
              Tu próximo viaje,
              <br />
              <em>planeado en minutos.</em>
              <br />
              Vivido para siempre.
            </h1>
            <p className="hero-sub">
              Voya usa inteligencia artificial para crear itinerarios
              personalizados, con actividades reales, presupuestos claros y
              calendarios listos para usar.
            </p>
            <div className="hero-actions">
              <Link href="/auth/signup" className="btn-primary">
                Planea tu viaje gratis
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M3 8h10M9 4l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
              <span className="hero-note">
                Sin tarjeta · Cancela cuando quieras
              </span>
            </div>
          </div>

          <div className="hero-visual">
            <div className="bg-blob" />

            {/* Card 1 — Mérida */}
            <div className="trip-card trip-card-1">
              <div className="card-label">
                <span>Viaje 01</span>
                <span>5 días</span>
              </div>
              <div className="card-city">Mérida</div>
              <div className="card-region">Yucatán, México</div>
              <div className="card-item">
                <span className="card-item-name">Cenote Ik Kil</span>
                <span className="card-item-price">$280</span>
              </div>
              <div className="card-item">
                <span className="card-item-name">Chichén Itzá</span>
                <span className="card-item-price">$614</span>
              </div>
              <div className="card-item">
                <span className="card-item-name">La Chaya Maya</span>
                <span className="card-item-price">$130</span>
              </div>
              <div className="card-tag">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <circle
                    cx="6"
                    cy="6"
                    r="5"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                  <path
                    d="M6 3v3l2 2"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
                Agregado al calendario
              </div>
            </div>

            {/* Card 2 — Perú */}
            <div className="trip-card trip-card-2">
              <div className="card-label">
                <span>Viaje 02</span>
                <span>10 días</span>
              </div>
              <div className="card-city">Perú</div>
              <div className="card-region">Cusco · Machu Picchu · Lima</div>
              <div
                style={{
                  marginTop: 12,
                  fontSize: 13,
                  color: "var(--landing-sand-mid)",
                }}
              >
                Itinerario listo ✦ 3 ciudades
              </div>
            </div>

            {/* Card 3 — small floating */}
            <div className="trip-card trip-card-3">
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 600,
                  letterSpacing: "1.2px",
                  textTransform: "uppercase",
                  color: "var(--landing-olive)",
                  marginBottom: 8,
                }}
              >
                IA sugiere
              </div>
              <div
                style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 18,
                  fontWeight: 600,
                  color: "var(--landing-espresso)",
                  marginBottom: 4,
                }}
              >
                Oaxaca
              </div>
              <div
                style={{ fontSize: 12, color: "var(--landing-sand-mid)" }}
              >
                Según tu estilo de viaje
              </div>
            </div>

            {/* AI bubble */}
            <div className="ai-bubble">
              Encontré <strong>12 actividades</strong> perfectas para ti en
              Mérida 🌴
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="hiw-bg" id="como-funciona">
        <div className="landing-container">
          <div className="section-label">Proceso</div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-end",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <h2
              className="section-title"
              style={{ color: "var(--landing-cream)" }}
            >
              De la idea al itinerario
              <br />
              <em>en 60 segundos.</em>
            </h2>
            <p className="section-sub">
              Sin horas de investigación. Sin tabs abiertos.
              <br />
              Solo tu próxima aventura, lista para vivirse.
            </p>
          </div>
          <div className="steps-grid">
            {[
              {
                num: "01",
                icon: "🌍",
                title: "Dinos a dónde quieres ir",
                desc: "Escribe tu destino, fechas y presupuesto. Puedes ser tan específico o tan vago como quieras.",
              },
              {
                num: "02",
                icon: "🤖",
                title: "La IA crea tu itinerario",
                desc: "En segundos, Voya genera un plan personalizado con actividades reales, restaurantes y experiencias únicas.",
              },
              {
                num: "03",
                icon: "✏️",
                title: "Personaliza a tu gusto",
                desc: "Ajusta cada día, cambia actividades, agrega notas. Tu viaje, tus reglas.",
              },
              {
                num: "04",
                icon: "📅",
                title: "Exporta y sal a vivir",
                desc: "Sincroniza con tu calendario, comparte con tus compañeros de viaje y listo.",
              },
            ].map((s) => (
              <div key={s.num} className="step">
                <div className="step-num">{s.num}</div>
                <div className="step-icon">{s.icon}</div>
                <div className="step-title">{s.title}</div>
                <p className="step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DESTINOS DE EJEMPLO */}
      <section id="destinos">
        <div className="landing-container">
          <div className="trips-header">
            <div>
              <div className="section-label">Destinos para inspirarte</div>
              <h2 className="section-title">
                Algunas ideas para
                <br />
                <em>tu próxima aventura.</em>
              </h2>
            </div>
          </div>
          <div className="trips-grid">
            {[
              {
                city: "Mérida",
                country: "Yucatán, México",
                days: "5 días",
                imgUrl:
                  "https://images.unsplash.com/photo-1518638150340-f706e86654de?w=800&q=80&auto=format&fit=crop",
                imgAlt: "Cenote en Yucatán, México",
                tags: ["Cenotes", "Arqueología", "Gastronomía", "Cultura"],
                budget: "~$1,024",
                budgetLabel: "estimado por persona",
              },
              {
                city: "Cusco",
                country: "Perú",
                days: "10 días",
                imgUrl:
                  "https://images.unsplash.com/photo-1526392060635-9d6019884377?w=800&q=80&auto=format&fit=crop",
                imgAlt: "Machu Picchu, Perú",
                tags: ["Trekking", "Historia Inca", "Gastronomía", "Naturaleza"],
                budget: "~$2,340",
                budgetLabel: "estimado por persona",
              },
              {
                city: "Oaxaca",
                country: "México",
                days: "4 días",
                imgUrl:
                  "https://images.unsplash.com/photo-1585464231875-d9ef1f5ad396?w=800&q=80&auto=format&fit=crop",
                imgAlt: "Oaxaca, México",
                tags: ["Arte", "Mezcal", "Mercados", "Tradición"],
                budget: "~$780",
                budgetLabel: "estimado por persona",
              },
            ].map((t) => (
              <div key={t.city} className="trip-showcase">
                <div className="trip-img">
                  <img src={t.imgUrl} alt={t.imgAlt} loading="lazy" />
                  <div className="trip-img-overlay">
                    <span className="trip-days">{t.days}</span>
                  </div>
                </div>
                <div className="trip-body">
                  <div className="trip-dest">{t.city}</div>
                  <div className="trip-sub">{t.country}</div>
                  <div className="trip-activities">
                    {t.tags.map((tag) => (
                      <span key={tag} className="activity-tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="trip-footer">
                    <div className="trip-budget">
                      <strong>{t.budget}</strong>
                      <br />
                      <span>{t.budgetLabel}</span>
                    </div>
                    <Link href="/auth/signup" className="trip-cta">
                      Planear ahora
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="benefits-bg">
        <div className="landing-container">
          <div className="benefits-grid">
            <div>
              <div className="section-label">Por qué Voya</div>
              <h2 className="section-title">
                Menos estrés.
                <br />
                <em>Más aventura.</em>
              </h2>
              <p className="section-sub" style={{ marginBottom: 48 }}>
                Diseñado para viajeros que quieren vivir experiencias reales,
                no perderse horas planeando.
              </p>
              <div className="benefits-list">
                {[
                  {
                    icon: "🧭",
                    cls: "bi-terra",
                    title: "Itinerarios personalizados",
                    desc: "La IA aprende tu estilo: aventurero, relajado, gastronómico. Cada plan es único para ti.",
                  },
                  {
                    icon: "💰",
                    cls: "bi-olive",
                    title: "Presupuesto claro",
                    desc: "Estimaciones de precios por actividad para que sepas en qué te vas a gastar tu dinero.",
                  },
                  {
                    icon: "📆",
                    cls: "bi-warm",
                    title: "Sincroniza con tu calendario",
                    desc: "Exporta tu itinerario a Google Calendar, Apple Calendar o Outlook en un clic.",
                  },
                  {
                    icon: "✈️",
                    cls: "bi-blue",
                    title: "Tú decides cada detalle",
                    desc: "Sin itinerarios impuestos. Tú eliges qué hacer, qué saltar y cómo organizar tu viaje.",
                  },
                ].map((b) => (
                  <div key={b.title} className="benefit-item">
                    <div className={`benefit-icon-wrap ${b.cls}`}>{b.icon}</div>
                    <div className="benefit-text">
                      <h3>{b.title}</h3>
                      <p>{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="benefits-visual">
              <div className="bv-header">Itinerario activo — Mérida</div>
              <div className="bv-itinerary">
                {[
                  {
                    day: "1",
                    title: "Llegada a Mérida",
                    sub: "Check-in y caminata por el centro",
                    badge: "badge-warm",
                    label: "Llegada",
                  },
                  {
                    day: "2",
                    title: "Chichén Itzá",
                    sub: "Tour guiado · día completo",
                    badge: "badge-warm",
                    label: "Arqueología",
                  },
                  {
                    day: "3",
                    title: "Cenote Ik Kil",
                    sub: "Excursión · tarde libre",
                    badge: "badge-olive",
                    label: "Naturaleza",
                  },
                  {
                    day: "4",
                    title: "Gastronomía local",
                    sub: "La Chaya Maya + mercado",
                    badge: "badge-terra",
                    label: "Gastro",
                  },
                  {
                    day: "5",
                    title: "Regreso",
                    sub: "Check-out · despedida",
                    badge: "badge-warm",
                    label: "Viaje",
                  },
                ].map((d) => (
                  <div key={d.day} className="bv-day">
                    <div className="bv-day-num">{d.day}</div>
                    <div className="bv-day-content">
                      <div className="bv-day-title">{d.title}</div>
                      <div className="bv-day-sub">{d.sub}</div>
                    </div>
                    <span className={`bv-day-badge ${d.badge}`}>{d.label}</span>
                  </div>
                ))}
              </div>
              <div className="bv-total">
                <span className="bv-total-label">
                  Presupuesto estimado por persona
                </span>
                <span className="bv-total-amount">~$1,024 USD</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="trust-bg">
        <div className="landing-container">
          <div className="trust-cta">
            <div
              className="section-label"
              style={{
                justifyContent: "center",
                color: "var(--landing-terracotta)",
              }}
            >
              Empieza tu aventura
            </div>
            <h2>
              ¿Listo para planear tu
              <br />
              <em>próxima aventura?</em>
            </h2>
            <p>
              Empieza gratis. Tu primer itinerario está a 60 segundos de
              distancia.
            </p>
            <Link href="/auth/signup" className="btn-cream">
              Empezar es gratis →
            </Link>
            <div className="trust-fine">
              Sin tarjeta de crédito · Cancela cuando quieras · Hecho con ❤️
              en México
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="landing-footer">
        <div className="footer-inner">
          <div className="footer-logo">
            Voya<span>.</span>
          </div>
          <div className="footer-copy">
            © 2026 Voya. Hecho con cariño para quienes sueñan con viajar.
          </div>
          <div className="footer-links">
            <Link href="/auth/login" className="footer-link">
              Iniciar sesión
            </Link>
            <Link href="/auth/signup" className="footer-link">
              Crear cuenta
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
