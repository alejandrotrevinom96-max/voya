"use client";

import { useState } from "react";
import Link from "next/link";

type PriceMode = "trip" | "annual";

const FAQS = [
  {
    q: '¿Cómo es eso de "1 viaje gratis cada 3 meses"?',
    a: "Justo así. Te registras, armas un itinerario completo, te lo llevas. Si en 3 meses quieres armar otro, también gratis. Si en ese tiempo necesitas armar varios, pagas $150 por viaje o $600 al año (ilimitados). Sin truco, sin trial que se vence.",
  },
  {
    q: "¿De dónde sale? ¿Funciona desde mi ciudad?",
    a: "Sí. Le dices desde dónde sales (CDMX, Monterrey, Guadalajara, lo que sea) y Voyaa calcula transporte, tiempos y presupuesto desde ahí. No es un itinerario genérico.",
  },
  {
    q: "¿Mis amigas tienen que pagar para votar?",
    a: "No. Tus amigas, tu pareja, tu mamá — todas pueden votar tu itinerario sin crear cuenta y sin pagar nada. Solo abren el link, escriben su nombre, y votan cada actividad. El feature de invitar es gratis para todos los planes, incluso el plan Free.",
  },
  {
    q: "¿Cuándo me conviene Pro vs pagar por viaje?",
    a: "Si haces 4 o más viajes al año, te conviene el anual ($600 = ~$50/mes). Si haces 2-3 al año, el pay-per-trip ($150 c/u) sale mejor. La buena noticia: puedes empezar con uno y cambiar cuando quieras.",
  },
  {
    q: "¿Aún hay lugar / cuándo es la próxima?",
    a: "Voyaa no es una agencia con fechas fijas. Tú eliges cuándo quieres ir y se arma alrededor de tus fechas. ¿Quieres irte el próximo viernes? Listo. ¿En seis meses? También.",
  },
  {
    q: "¿Qué incluye el itinerario?",
    a: "Hospedaje sugerido (con precios reales), transporte interno, actividades día por día, restaurantes recomendados, presupuesto total, y un calendario que sincroniza con tu Google Calendar. Todo en una pantalla.",
  },
  {
    q: "¿Y si no me responden? Las agencias tardan días.",
    a: "Voyaa no te hace esperar. No mandas un mensaje y rezas. El itinerario aparece en 3 minutos, a la hora que sea. Esa es la diferencia.",
  },
  {
    q: "¿Puedo cancelar Pro cuando quiera?",
    a: 'En cualquier momento. El pay-per-trip ni siquiera tiene cancelación — solo pagas cuando armas un viaje. El anual lo cancelas con un click. Sin llamadas, sin "déjenme transferirte con un asesor". Tu cuenta, tus reglas.',
  },
];

export default function LandingInteractive() {
  const [priceMode, setPriceMode] = useState<PriceMode>("trip");
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      {/* ============ PRICING ============ */}
      <section className="section pricing" id="precios">
        <div className="container">
          <div className="section-eyebrow">Precios honestos</div>
          <h2 className="section-title">
            Empieza gratis. <em>Paga solo si vuelves.</em>
          </h2>
          <p className="section-sub">
            Tu primer viaje sale gratis. Si te enamoras, pagas por viaje o
            anual. Sin suscripciones que se olvidan, sin sorpresas en tu
            tarjeta.
          </p>

          <div className="pricing-grid">
            {/* FREE */}
            <div className="price-card">
              <h3 className="price-card-name">Gratis</h3>
              <p className="price-card-tagline">
                Para probar antes de comprometerte. Para siempre.
              </p>
              <div className="price-amount">
                <span className="number">$0</span>
              </div>
              <p className="price-detail">Para siempre · sin tarjeta</p>
              <ul className="price-features">
                <li>
                  <strong>1 viaje</strong> cada 3 meses
                </li>
                <li>Itinerario completo con AI</li>
                <li>Presupuesto en pesos reales</li>
                <li>
                  <strong>Invita a tu pareja o amigas</strong> a votar (gratis)
                </li>
                <li>Auto-agendar actividades por día</li>
              </ul>
              <Link href="/auth/signup" className="price-cta">
                Empezar gratis
              </Link>
            </div>

            {/* PRO */}
            <div className="price-card featured">
              <span className="price-badge">⭐ Más popular</span>
              <h3 className="price-card-name">Pro</h3>
              <p className="price-card-tagline">
                Para la viajera que ya no se aguanta.
              </p>

              <div className="price-toggle">
                <button
                  className={priceMode === "trip" ? "active" : ""}
                  onClick={() => setPriceMode("trip")}
                  type="button"
                >
                  Por viaje
                </button>
                <button
                  className={priceMode === "annual" ? "active" : ""}
                  onClick={() => setPriceMode("annual")}
                  type="button"
                >
                  Anual (ahorra 67%)
                </button>
              </div>

              {priceMode === "trip" ? (
                <>
                  <div className="price-amount">
                    <span className="currency">$</span>
                    <span className="number">150</span>
                    <span className="period">/ viaje</span>
                  </div>
                  <p className="price-detail">
                    MXN · pagas solo cuando viajas
                  </p>
                </>
              ) : (
                <>
                  <div className="price-amount">
                    <span className="currency">$</span>
                    <span className="number">600</span>
                    <span className="period">/ año</span>
                  </div>
                  <p className="price-detail">
                    MXN · ~$50/mes · 4+ viajes salen rentables
                  </p>
                </>
              )}

              <ul className="price-features">
                <li>
                  <strong>Viajes ilimitados</strong>
                </li>
                <li>
                  <strong>Invitados ilimitados</strong> al grupo
                </li>
                <li>Itinerario AI personalizado</li>
                <li>Presupuesto y calendario sincronizado</li>
                <li>Cambios y rearmados sin límite</li>
                <li>Auto-agendar inteligente</li>
                <li>Soporte prioritario</li>
              </ul>
              <Link
                href={`/auth/signup?plan=pro&billing=${priceMode}`}
                className="price-cta"
              >
                Quiero Pro
              </Link>
            </div>
          </div>

          <p className="price-disclaimer">
            Sin tarjeta para empezar · Cancela cuando quieras · Precios en pesos
            mexicanos
          </p>

          <div className="market-prices">
            <h4>$150 por viaje pone en perspectiva</h4>
            <p>Lo que cuesta el viaje real (no Voyaa) en el mercado mexicano:</p>
            <div className="market-row">
              <span>Day trip Acapulco</span>
              <strong>$999 MXN</strong>
            </div>
            <div className="market-row">
              <span>Day trip Tepoztlán</span>
              <strong>$1,200 MXN</strong>
            </div>
            <div className="market-row">
              <span>Day trip San Miguel de Allende</span>
              <strong>$1,400 MXN</strong>
            </div>
            <div className="market-row">
              <span>Tour Marruecos · 6 días</span>
              <strong>~$8,000 MXN</strong>
            </div>
            <div className="market-summary">
              Voyaa cuesta menos que <strong>una pizza</strong>. Y te ahorra 8
              horas por viaje.
            </div>
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className="section">
        <div className="container">
          <div className="section-eyebrow">Lo que todas preguntan</div>
          <h2 className="section-title">
            Las dudas <em>reales</em>.
          </h2>

          <div className="faq" style={{ marginTop: "48px" }}>
            {FAQS.map((item, idx) => (
              <div
                key={idx}
                className={`faq-item ${openFaq === idx ? "open" : ""}`}
              >
                <button
                  className="faq-q"
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                >
                  {item.q}
                </button>
                <div className="faq-a">{item.a}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
