// Estilos de la landing — scoped a .voyaa-landing para no chocar con Tailwind global.
// Se inyecta via <style dangerouslySetInnerHTML> en page.tsx.

export const LANDING_CSS = `
.voyaa-landing {
  --ink: #1a1a1a;
  --ink-soft: #4a4a4a;
  --paper: #fdfbf7;
  --warm: #f5ede0;
  --accent: #d97757;
  --accent-dark: #b8593c;
  --green: #2d5a3d;
  --rose: #e8b4a8;
  --line: #e8e0d0;
  --gold: #d4a843;

  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  background: var(--paper);
  color: var(--ink);
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  scroll-behavior: smooth;
}

.voyaa-landing * { box-sizing: border-box; }

.voyaa-landing .container {
  max-width: 1140px;
  margin: 0 auto;
  padding: 0 24px;
}

/* NAV */
.voyaa-landing nav {
  padding: 20px 0;
  border-bottom: 1px solid var(--line);
  background: var(--paper);
  position: sticky;
  top: 0;
  z-index: 100;
}
.voyaa-landing .nav-inner { display: flex; justify-content: space-between; align-items: center; }
.voyaa-landing .logo { font-family: Georgia, serif; font-size: 24px; font-weight: 700; letter-spacing: -0.5px; }
.voyaa-landing .logo span { color: var(--accent); }
.voyaa-landing .nav-links { display: flex; gap: 28px; align-items: center; font-size: 15px; }
.voyaa-landing .nav-links a { color: var(--ink-soft); text-decoration: none; }
.voyaa-landing .nav-links a:hover { color: var(--ink); }
.voyaa-landing .btn-primary-landing {
  background: var(--ink);
  color: var(--paper) !important;
  padding: 10px 20px;
  border-radius: 100px;
  text-decoration: none;
  font-weight: 500;
  font-size: 14px;
  border: none;
  cursor: pointer;
  transition: transform 0.15s;
}
.voyaa-landing .btn-primary-landing:hover { transform: translateY(-1px); color: var(--paper) !important; }

/* HERO */
.voyaa-landing .hero { padding: 80px 0 60px; text-align: center; position: relative; }
.voyaa-landing .hero-tag {
  display: inline-block;
  background: var(--warm);
  color: var(--accent-dark);
  padding: 6px 14px;
  border-radius: 100px;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 24px;
}
.voyaa-landing .hero h1 {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(38px, 6vw, 68px);
  line-height: 1.05;
  letter-spacing: -1.5px;
  font-weight: 400;
  margin-bottom: 8px;
  color: var(--ink);
}
.voyaa-landing .hero h1 em {
  font-style: italic;
  color: var(--accent);
}
.voyaa-landing .hero .underline-word {
  position: relative;
  display: inline-block;
}
.voyaa-landing .hero .underline-word::after {
  content: '';
  position: absolute;
  bottom: 4px;
  left: 0;
  right: 0;
  height: 8px;
  background: var(--rose);
  z-index: -1;
  opacity: 0.6;
}
.voyaa-landing .hero-sub {
  font-size: 19px;
  color: var(--ink-soft);
  max-width: 580px;
  margin: 28px auto 36px;
  line-height: 1.55;
}
.voyaa-landing .hero-cta-row {
  display: flex;
  gap: 12px;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
}
.voyaa-landing .btn-hero {
  background: var(--ink);
  color: var(--paper) !important;
  padding: 16px 32px;
  border-radius: 100px;
  text-decoration: none;
  font-weight: 600;
  font-size: 16px;
  transition: transform 0.15s;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: none;
  cursor: pointer;
}
.voyaa-landing .btn-hero:hover { transform: translateY(-2px); color: var(--paper) !important; }
.voyaa-landing .hero-microcopy {
  margin-top: 16px;
  font-size: 13px;
  color: var(--ink-soft);
}

/* QUOTE STRIP */
.voyaa-landing .quote-strip {
  background: var(--warm);
  padding: 28px 0;
  margin-top: 48px;
  border-top: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
}
.voyaa-landing .quote-strip-inner {
  text-align: center;
  font-family: Georgia, serif;
  font-style: italic;
  font-size: 22px;
  color: var(--ink);
}
.voyaa-landing .quote-strip-inner small {
  display: block;
  margin-top: 8px;
  font-style: normal;
  font-family: 'Inter', sans-serif;
  font-size: 13px;
  color: var(--ink-soft);
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

/* SECTION GENERICS */
.voyaa-landing .section { padding: 80px 0; }
.voyaa-landing .section-eyebrow {
  text-align: center;
  font-size: 13px;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 600;
  margin-bottom: 12px;
}
.voyaa-landing .section-title {
  font-family: Georgia, serif;
  font-size: clamp(30px, 4vw, 44px);
  text-align: center;
  margin-bottom: 16px;
  letter-spacing: -1px;
  line-height: 1.1;
  font-weight: 400;
  color: var(--ink);
}
.voyaa-landing .section-title em { font-style: italic; color: var(--accent); }
.voyaa-landing .section-sub {
  text-align: center;
  font-size: 17px;
  color: var(--ink-soft);
  max-width: 620px;
  margin: 0 auto 56px;
  line-height: 1.55;
}

/* TEMPLATES */
.voyaa-landing .templates-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}
.voyaa-landing .template-card {
  background: white;
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: 28px;
  transition: all 0.2s;
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  min-height: 220px;
}
.voyaa-landing .template-card:hover {
  border-color: var(--accent);
  transform: translateY(-3px);
  box-shadow: 0 12px 24px rgba(217, 119, 87, 0.08);
}
.voyaa-landing .template-emoji { font-size: 28px; margin-bottom: 12px; }
.voyaa-landing .template-tag {
  display: inline-block;
  background: var(--warm);
  color: var(--accent-dark);
  padding: 4px 10px;
  border-radius: 100px;
  font-size: 12px;
  font-weight: 500;
  margin-bottom: 10px;
  width: fit-content;
}
.voyaa-landing .template-card h3 {
  font-family: Georgia, serif;
  font-size: 22px;
  margin-bottom: 8px;
  letter-spacing: -0.3px;
  font-weight: 400;
  color: var(--ink);
}
.voyaa-landing .template-card p {
  font-size: 14px;
  color: var(--ink-soft);
  margin-bottom: 16px;
  line-height: 1.5;
  flex-grow: 1;
}
.voyaa-landing .template-price {
  font-family: Georgia, serif;
  font-style: italic;
  color: var(--accent);
  font-size: 18px;
  margin-bottom: 16px;
}
.voyaa-landing .template-cta {
  color: var(--ink);
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* HOW IT WORKS */
.voyaa-landing .how { background: white; }
.voyaa-landing .how-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}
.voyaa-landing .how-step { position: relative; }
.voyaa-landing .how-step-num {
  font-family: Georgia, serif;
  font-style: italic;
  color: var(--accent);
  font-size: 60px;
  line-height: 1;
  opacity: 0.4;
  margin-bottom: 16px;
  letter-spacing: -2px;
}
.voyaa-landing .how-step h3 {
  font-family: Georgia, serif;
  font-size: 24px;
  margin-bottom: 10px;
  letter-spacing: -0.3px;
  font-weight: 400;
  color: var(--ink);
}
.voyaa-landing .how-step p {
  color: var(--ink-soft);
  font-size: 15px;
  line-height: 1.6;
}

/* GROUP / VOTING */
.voyaa-landing .group-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 60px;
  align-items: center;
}
.voyaa-landing .group-text h2 {
  font-family: Georgia, serif;
  font-size: clamp(28px, 3.6vw, 40px);
  line-height: 1.15;
  letter-spacing: -0.8px;
  margin-bottom: 20px;
  font-weight: 400;
  color: var(--ink);
}
.voyaa-landing .group-text h2 em { font-style: italic; color: var(--accent); }
.voyaa-landing .group-text p {
  font-size: 16px;
  color: var(--ink-soft);
  margin-bottom: 20px;
  line-height: 1.6;
}
.voyaa-landing .group-list { list-style: none; margin-bottom: 24px; padding: 0; }
.voyaa-landing .group-list li {
  padding: 10px 0 10px 28px;
  position: relative;
  font-size: 15px;
  color: var(--ink);
}
.voyaa-landing .group-list li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--accent);
  font-weight: 700;
}
.voyaa-landing .group-mockup {
  background: white;
  border: 1px solid var(--line);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 24px 48px rgba(26, 26, 26, 0.04);
}
.voyaa-landing .group-mockup-header {
  padding-bottom: 16px;
  border-bottom: 1px solid var(--line);
  margin-bottom: 16px;
}
.voyaa-landing .group-mockup-trip-name {
  font-family: Georgia, serif;
  font-size: 20px;
  margin-bottom: 4px;
  color: var(--ink);
}
.voyaa-landing .group-mockup-meta {
  font-size: 13px;
  color: var(--ink-soft);
}
.voyaa-landing .vote-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid var(--line);
}
.voyaa-landing .vote-row:last-child { border-bottom: none; }
.voyaa-landing .vote-emoji {
  font-size: 28px;
  width: 40px;
  text-align: center;
}
.voyaa-landing .vote-name {
  flex-grow: 1;
  font-size: 14px;
  font-weight: 500;
  color: var(--ink);
}
.voyaa-landing .vote-name small {
  display: block;
  font-weight: 400;
  color: var(--ink-soft);
  font-size: 12px;
}
.voyaa-landing .vote-counts {
  display: flex;
  gap: 8px;
  font-size: 13px;
}
.voyaa-landing .vote-up { color: var(--green); }
.voyaa-landing .vote-down { color: #b8593c; }
.voyaa-landing .vote-meh { color: var(--ink-soft); }

/* AGE INCLUSION */
.voyaa-landing .age-section {
  background: var(--warm);
  border-radius: 24px;
  padding: 60px 48px;
  text-align: center;
}
.voyaa-landing .age-section h2 {
  font-family: Georgia, serif;
  font-size: clamp(28px, 3.6vw, 40px);
  line-height: 1.15;
  letter-spacing: -0.8px;
  margin-bottom: 24px;
  font-weight: 400;
  color: var(--ink);
}
.voyaa-landing .age-section h2 em { font-style: italic; color: var(--accent); }
.voyaa-landing .age-section p {
  color: var(--ink-soft);
  font-size: 17px;
  max-width: 640px;
  margin: 0 auto 28px;
  line-height: 1.6;
}
.voyaa-landing .age-quote {
  font-family: Georgia, serif;
  font-style: italic;
  font-size: 19px;
  color: var(--ink);
  max-width: 580px;
  margin: 32px auto;
  padding: 24px 32px;
  border-left: 3px solid var(--accent);
  text-align: left;
  background: white;
  border-radius: 0 12px 12px 0;
}
.voyaa-landing .age-quote small {
  display: block;
  margin-top: 12px;
  font-style: normal;
  font-family: 'Inter', sans-serif;
  font-size: 12px;
  color: var(--ink-soft);
  letter-spacing: 0.5px;
  text-transform: uppercase;
}

/* PRICING */
.voyaa-landing .pricing { background: var(--warm); }
.voyaa-landing .pricing-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  max-width: 820px;
  margin: 0 auto;
}
.voyaa-landing .price-card {
  background: white;
  border: 1px solid var(--line);
  border-radius: 20px;
  padding: 40px 32px;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: all 0.2s;
}
.voyaa-landing .price-card.featured {
  border: 2px solid var(--accent);
  background: linear-gradient(180deg, #fff 0%, #fff8f3 100%);
  box-shadow: 0 24px 48px rgba(217, 119, 87, 0.12);
}
.voyaa-landing .price-badge {
  position: absolute;
  top: -12px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--accent);
  color: white;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 14px;
  border-radius: 100px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}
.voyaa-landing .price-card-name {
  font-family: Georgia, serif;
  font-size: 28px;
  margin-bottom: 4px;
  letter-spacing: -0.3px;
  font-weight: 400;
  color: var(--ink);
}
.voyaa-landing .price-card-tagline {
  color: var(--ink-soft);
  font-size: 14px;
  margin-bottom: 28px;
  min-height: 42px;
}
.voyaa-landing .price-amount {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 4px;
}
.voyaa-landing .price-amount .currency { font-size: 18px; color: var(--ink-soft); font-weight: 500; }
.voyaa-landing .price-amount .number {
  font-family: Georgia, serif;
  font-size: 56px;
  font-weight: 400;
  line-height: 1;
  letter-spacing: -2px;
  color: var(--ink);
}
.voyaa-landing .price-amount .period { font-size: 15px; color: var(--ink-soft); }
.voyaa-landing .price-detail {
  font-size: 13px;
  color: var(--ink-soft);
  margin-bottom: 28px;
  min-height: 20px;
}
.voyaa-landing .price-toggle {
  display: flex;
  background: var(--warm);
  border-radius: 100px;
  padding: 4px;
  margin-bottom: 20px;
  width: fit-content;
}
.voyaa-landing .price-toggle button {
  border: none;
  background: transparent;
  padding: 8px 16px;
  border-radius: 100px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: var(--ink-soft);
  transition: all 0.15s;
  font-family: inherit;
}
.voyaa-landing .price-toggle button.active {
  background: white;
  color: var(--ink);
  box-shadow: 0 2px 4px rgba(0,0,0,0.08);
}
.voyaa-landing .price-features {
  list-style: none;
  margin-bottom: 32px;
  flex-grow: 1;
  padding: 0;
}
.voyaa-landing .price-features li {
  padding: 10px 0;
  padding-left: 28px;
  position: relative;
  font-size: 15px;
  color: var(--ink);
  border-bottom: 1px solid var(--line);
}
.voyaa-landing .price-features li:last-child { border-bottom: none; }
.voyaa-landing .price-features li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: var(--accent);
  font-weight: 700;
}
.voyaa-landing .price-features li strong { font-weight: 600; color: var(--ink); }
.voyaa-landing .price-cta {
  width: 100%;
  padding: 14px;
  border-radius: 100px;
  border: 1px solid var(--ink);
  background: white;
  color: var(--ink) !important;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  text-decoration: none;
  text-align: center;
  transition: all 0.15s;
  display: block;
}
.voyaa-landing .price-cta:hover { background: var(--ink); color: white !important; }
.voyaa-landing .price-card.featured .price-cta {
  background: var(--ink);
  color: white !important;
}
.voyaa-landing .price-card.featured .price-cta:hover { background: var(--accent); border-color: var(--accent); color: white !important; }
.voyaa-landing .price-disclaimer {
  text-align: center;
  margin-top: 36px;
  color: var(--ink-soft);
  font-size: 14px;
}

/* MARKET PRICES */
.voyaa-landing .market-prices {
  margin-top: 60px;
  max-width: 720px;
  margin-left: auto;
  margin-right: auto;
  padding: 28px;
  background: white;
  border-radius: 16px;
  border: 1px solid var(--line);
}
.voyaa-landing .market-prices h4 {
  font-family: Georgia, serif;
  font-size: 18px;
  margin-bottom: 6px;
  font-weight: 400;
  color: var(--ink);
}
.voyaa-landing .market-prices p { font-size: 13px; color: var(--ink-soft); margin-bottom: 16px; }
.voyaa-landing .market-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid var(--line);
  font-size: 14px;
  color: var(--ink);
}
.voyaa-landing .market-row:last-child { border-bottom: none; }
.voyaa-landing .market-row strong { font-weight: 600; }
.voyaa-landing .market-summary {
  margin-top: 18px;
  padding-top: 18px;
  border-top: 2px solid var(--ink);
  text-align: center;
  font-family: Georgia, serif;
  font-size: 16px;
  font-style: italic;
  color: var(--ink);
}
.voyaa-landing .market-summary strong { font-style: normal; color: var(--accent); }

/* FAQ */
.voyaa-landing .faq { max-width: 760px; margin: 0 auto; }
.voyaa-landing .faq-item {
  border-bottom: 1px solid var(--line);
  padding: 0;
}
.voyaa-landing .faq-q {
  width: 100%;
  background: none;
  border: none;
  text-align: left;
  padding: 24px 0;
  cursor: pointer;
  font-size: 17px;
  font-weight: 500;
  color: var(--ink);
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  font-family: inherit;
}
.voyaa-landing .faq-q:hover { color: var(--accent); }
.voyaa-landing .faq-q::after {
  content: '+';
  font-size: 24px;
  color: var(--accent);
  transition: transform 0.2s;
  flex-shrink: 0;
}
.voyaa-landing .faq-item.open .faq-q::after { content: '−'; }
.voyaa-landing .faq-a {
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease, padding 0.3s ease;
  color: var(--ink-soft);
  font-size: 15px;
  line-height: 1.6;
}
.voyaa-landing .faq-item.open .faq-a {
  max-height: 400px;
  padding: 0 0 24px;
}

/* FINAL CTA */
.voyaa-landing .final-cta {
  background: var(--ink);
  color: var(--paper);
  text-align: center;
  padding: 100px 0;
}
.voyaa-landing .final-cta h2 {
  font-family: Georgia, serif;
  font-size: clamp(34px, 5vw, 56px);
  line-height: 1.1;
  letter-spacing: -1.5px;
  margin-bottom: 24px;
  font-weight: 400;
  color: var(--paper);
}
.voyaa-landing .final-cta h2 em { font-style: italic; color: var(--accent); }
.voyaa-landing .final-cta p {
  font-size: 19px;
  color: rgba(253, 251, 247, 0.7);
  margin-bottom: 36px;
}
.voyaa-landing .final-cta .btn-hero {
  background: var(--paper);
  color: var(--ink) !important;
}
.voyaa-landing .final-cta .btn-hero:hover { background: var(--accent); color: white !important; }
.voyaa-landing .final-cta-fine {
  margin-top: 20px;
  font-size: 13px;
  color: rgba(253, 251, 247, 0.5);
}

/* FOOTER */
.voyaa-landing .landing-footer {
  background: var(--ink);
  color: rgba(253, 251, 247, 0.6);
  padding: 32px 0;
  text-align: center;
  font-size: 13px;
  border-top: 1px solid rgba(253, 251, 247, 0.1);
}

/* BETA BANNER */
.voyaa-landing .beta-banner {
  position: sticky;
  top: 0;
  z-index: 101;
  background: var(--accent);
  color: white;
  text-align: center;
  padding: 12px 48px;
  font-size: 14px;
  line-height: 1.4;
}
.voyaa-landing .banner-text-mobile { display: none; }
.voyaa-landing .banner-close {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: white;
  font-size: 20px;
  line-height: 1;
  width: 28px;
  height: 28px;
  cursor: pointer;
  opacity: 0.7;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}
.voyaa-landing .banner-close:hover { opacity: 1; }

/* RESPONSIVE */
@media (max-width: 768px) {
  .voyaa-landing .nav-links { gap: 16px; font-size: 14px; }
  .voyaa-landing .nav-links a:not(.btn-primary-landing) { display: none; }
  .voyaa-landing .section { padding: 60px 0; }
  .voyaa-landing .templates-grid { grid-template-columns: 1fr; }
  .voyaa-landing .how-grid { grid-template-columns: 1fr; gap: 28px; }
  .voyaa-landing .group-section { grid-template-columns: 1fr; gap: 40px; }
  .voyaa-landing .age-section { padding: 40px 24px; }
  .voyaa-landing .pricing-grid { grid-template-columns: 1fr; max-width: 420px; }
  .voyaa-landing .quote-strip-inner { font-size: 18px; padding: 0 16px; }
  .voyaa-landing .beta-banner { padding: 10px 40px; font-size: 13px; }
  .voyaa-landing .banner-text-desktop { display: none; }
  .voyaa-landing .banner-text-mobile { display: inline; }
}
`;
