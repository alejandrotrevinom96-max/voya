"use client";

import { useState } from "react";

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
    a: "Voyaa no te hace esperar. No mandas un mensaje y rezas. El itinerario aparece en 30 segundos, a la hora que sea. Esa es la diferencia.",
  },
  {
    q: "¿Puedo cancelar Pro cuando quiera?",
    a: 'En cualquier momento. El pay-per-trip ni siquiera tiene cancelación — solo pagas cuando armas un viaje. El anual lo cancelas con un click. Sin llamadas, sin "déjenme transferirte con un asesor". Tu cuenta, tus reglas.',
  },
];

export default function LandingInteractive() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <>
      {/* ============ PRICING SIMPLIFICADO BETA ============ */}
      <section className="section pricing-beta" id="precios">
        <div className="container">
          <div className="section-eyebrow">Precios honestos</div>
          <h2 className="section-title">
            Gratis durante beta. <em>Y punto.</em>
          </h2>
          <p className="pricing-beta-line">
            Después del beta: <strong>$150 por viaje</strong> o{" "}
            <strong>$600 al año</strong> (viajes ilimitados).
          </p>
          <p className="pricing-beta-microcopy">
            Sin tarjeta · sin compromiso · cancela cuando quieras
          </p>
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
