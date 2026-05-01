// Estos estilos se AGREGAN a `landing-styles.ts` que ya existe.
// Pegar al final del template literal LANDING_CSS, antes del backtick de cierre.

export const LANDING_DEMO_CSS_ADDITIONS = `

/* ============ DEMO HERO ============ */
.voyaa-landing .voyaa-demo-hero {
  padding: 60px 0 40px;
  text-align: center;
}

/* ============ SEARCH BAR ============ */
.voyaa-landing .voyaa-search-form {
  margin: 32px auto 0;
  max-width: 720px;
}

.voyaa-landing .voyaa-search-row {
  display: flex;
  align-items: center;
  gap: 16px;
  background: white;
  border: 2px solid var(--line);
  border-radius: 100px;
  padding: 8px 8px 8px 28px;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.voyaa-landing .voyaa-search-row:focus-within {
  border-color: var(--accent);
  box-shadow: 0 0 0 4px rgba(217, 119, 87, 0.12);
}

.voyaa-landing .voyaa-search-brand {
  font-family: Georgia, serif;
  font-size: 32px;
  font-weight: 700;
  color: var(--ink);
  letter-spacing: -0.5px;
  line-height: 1;
  flex-shrink: 0;
}

.voyaa-landing .voyaa-search-input-wrap {
  flex: 1;
  position: relative;
  height: 48px;
  display: flex;
  align-items: center;
  overflow: hidden;
}

.voyaa-landing .voyaa-search-input {
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-family: inherit;
  font-size: 18px;
  color: var(--ink);
  padding: 0 16px;
  position: relative;
  z-index: 2;
}

.voyaa-landing .voyaa-search-input::placeholder {
  color: transparent;
}

.voyaa-landing .voyaa-search-placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  padding: 0 16px;
  pointer-events: none;
  z-index: 1;
  overflow: hidden;
}

.voyaa-landing .voyaa-placeholder-text {
  font-size: 18px;
  color: var(--ink-soft);
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  display: inline-block;
  font-style: italic;
  opacity: 0.7;
  animation: voyaa-slide-in 400ms ease;
}

.voyaa-landing .voyaa-placeholder-text.animating-out {
  animation: voyaa-slide-out 400ms ease forwards;
}

@keyframes voyaa-slide-in {
  from { transform: translateY(-12px); opacity: 0; }
  to { transform: translateY(0); opacity: 0.7; }
}

@keyframes voyaa-slide-out {
  from { transform: translateY(0); opacity: 0.7; }
  to { transform: translateY(12px); opacity: 0; }
}

.voyaa-landing .voyaa-search-cta {
  display: block;
  width: 100%;
  margin-top: 16px;
  background: var(--ink);
  color: var(--paper);
  padding: 18px 32px;
  border-radius: 100px;
  border: none;
  font-family: inherit;
  font-weight: 600;
  font-size: 17px;
  cursor: pointer;
  transition: transform 0.15s, opacity 0.15s;
}

.voyaa-landing .voyaa-search-cta:not(:disabled):hover {
  transform: translateY(-2px);
}

.voyaa-landing .voyaa-search-cta:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.voyaa-landing .voyaa-loading-text {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.voyaa-landing .voyaa-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(253,251,247,0.3);
  border-top-color: var(--paper);
  border-radius: 50%;
  animation: voyaa-spin 600ms linear infinite;
}

@keyframes voyaa-spin {
  to { transform: rotate(360deg); }
}

.voyaa-landing .voyaa-search-microcopy {
  margin-top: 12px;
  font-size: 13px;
  color: var(--ink-soft);
}

.voyaa-landing .voyaa-demo-error {
  margin-top: 16px;
  padding: 12px 20px;
  background: #fdecea;
  color: #b8593c;
  border-radius: 12px;
  font-size: 14px;
}

/* ============ RECOVERY BANNER ============ */
.voyaa-landing .voyaa-demo-recovery-banner {
  margin-top: 24px;
  padding: 14px 20px;
  background: var(--warm);
  border: 1px solid var(--line);
  border-radius: 100px;
  display: inline-flex;
  align-items: center;
  gap: 16px;
  font-size: 14px;
  color: var(--ink);
}

.voyaa-landing .voyaa-demo-recovery-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.voyaa-landing .voyaa-demo-recovery-btn-primary {
  background: var(--accent);
  color: white;
  border: none;
  padding: 6px 14px;
  border-radius: 100px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.voyaa-landing .voyaa-demo-recovery-btn-primary:hover {
  background: var(--accent-dark);
}

.voyaa-landing .voyaa-demo-recovery-btn-dismiss {
  background: transparent;
  border: none;
  color: var(--ink-soft);
  font-size: 18px;
  cursor: pointer;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.voyaa-landing .voyaa-demo-recovery-btn-dismiss:hover {
  background: rgba(0,0,0,0.05);
}

/* ============ DEMO RESULTS ============ */
.voyaa-landing .voyaa-demo-results-section {
  background: white;
  padding: 60px 0;
}

.voyaa-landing .voyaa-demo-results {
  max-width: 960px;
  margin: 0 auto;
}

.voyaa-landing .voyaa-demo-trip-header {
  text-align: center;
  margin-bottom: 40px;
  position: relative;
}

.voyaa-landing .voyaa-demo-reset-btn {
  position: absolute;
  top: 0;
  left: 0;
  background: transparent;
  border: 1px solid var(--line);
  padding: 8px 16px;
  border-radius: 100px;
  font-family: inherit;
  font-size: 13px;
  color: var(--ink-soft);
  cursor: pointer;
  transition: all 0.15s;
}

.voyaa-landing .voyaa-demo-reset-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
}

.voyaa-landing .voyaa-demo-trip-emoji {
  font-size: 56px;
  margin-bottom: 8px;
}

.voyaa-landing .voyaa-demo-trip-name {
  font-family: Georgia, serif;
  font-size: clamp(28px, 4vw, 42px);
  font-weight: 400;
  letter-spacing: -1px;
  margin-bottom: 8px;
  color: var(--ink);
}

.voyaa-landing .voyaa-demo-trip-summary {
  font-family: Georgia, serif;
  font-style: italic;
  font-size: 18px;
  color: var(--accent);
}

/* ============ CTAs ============ */
.voyaa-landing .voyaa-demo-cta-row {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 48px;
}

.voyaa-landing .voyaa-demo-cta-row-bottom {
  flex-direction: column;
  align-items: center;
  margin-top: 32px;
  margin-bottom: 16px;
}

.voyaa-landing .voyaa-demo-cta-primary {
  background: var(--ink);
  color: var(--paper) !important;
  padding: 14px 28px;
  border-radius: 100px;
  text-decoration: none;
  font-weight: 600;
  font-size: 15px;
  transition: transform 0.15s;
  display: inline-block;
  text-align: center;
}

.voyaa-landing .voyaa-demo-cta-primary:hover {
  transform: translateY(-2px);
  background: var(--accent);
  color: white !important;
}

.voyaa-landing .voyaa-demo-cta-large {
  padding: 18px 36px;
  font-size: 17px;
}

.voyaa-landing .voyaa-demo-cta-secondary {
  background: white;
  color: var(--ink);
  padding: 14px 28px;
  border-radius: 100px;
  border: 1px solid var(--line);
  font-family: inherit;
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.15s;
}

.voyaa-landing .voyaa-demo-cta-secondary:hover {
  border-color: var(--accent);
  color: var(--accent);
  transform: translateY(-2px);
}

.voyaa-landing .voyaa-demo-cta-microcopy {
  margin-top: 12px;
  font-size: 13px;
  color: var(--ink-soft);
}

/* ============ ACTIVITIES ============ */
.voyaa-landing .voyaa-demo-section-eyebrow {
  text-align: center;
  font-size: 13px;
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-weight: 600;
  margin-bottom: 24px;
}

.voyaa-landing .voyaa-demo-activities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-bottom: 48px;
}

.voyaa-landing .voyaa-demo-activity-card {
  background: white;
  border: 1px solid var(--line);
  border-radius: 16px;
  padding: 24px;
  position: relative;
  transition: transform 0.2s, box-shadow 0.2s;
}

.voyaa-landing .voyaa-demo-activity-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 24px rgba(0,0,0,0.06);
}

.voyaa-landing .voyaa-demo-highlight-label {
  position: absolute;
  top: -10px;
  right: 16px;
  background: var(--accent);
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 100px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.voyaa-landing .voyaa-demo-highlight-blurred {
  background: var(--gold);
  z-index: 3;
}

.voyaa-landing .voyaa-demo-activity-emoji {
  font-size: 28px;
  margin-bottom: 10px;
}

.voyaa-landing .voyaa-demo-activity-name {
  font-family: Georgia, serif;
  font-size: 20px;
  font-weight: 400;
  margin-bottom: 8px;
  letter-spacing: -0.3px;
  color: var(--ink);
}

.voyaa-landing .voyaa-demo-activity-desc {
  font-size: 14px;
  color: var(--ink-soft);
  line-height: 1.5;
  margin-bottom: 14px;
}

.voyaa-landing .voyaa-demo-activity-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  font-size: 12px;
  color: var(--ink-soft);
}

.voyaa-landing .voyaa-demo-activity-cost {
  font-family: Georgia, serif;
  font-style: italic;
  color: var(--accent);
  font-weight: 600;
}

/* ============ BLURRED ACTIVITIES ============ */
.voyaa-landing .voyaa-demo-blurred-section {
  background: var(--warm);
  border-radius: 24px;
  padding: 32px;
  margin-bottom: 32px;
}

.voyaa-landing .voyaa-demo-blurred-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 20px;
}

.voyaa-landing .voyaa-demo-lock-icon {
  font-size: 24px;
}

.voyaa-landing .voyaa-demo-blurred-title {
  font-family: Georgia, serif;
  font-size: 18px;
  color: var(--ink);
  font-weight: 500;
}

.voyaa-landing .voyaa-demo-blurred-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}

.voyaa-landing .voyaa-demo-blurred-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  position: relative;
  overflow: hidden;
  min-height: 100px;
}

.voyaa-landing .voyaa-demo-blurred-content {
  position: relative;
  z-index: 2;
  filter: blur(4px);
  user-select: none;
  pointer-events: none;
}

.voyaa-landing .voyaa-demo-blurred-emoji {
  font-size: 22px;
  margin-bottom: 6px;
}

.voyaa-landing .voyaa-demo-blurred-teaser {
  font-size: 14px;
  color: var(--ink);
  font-weight: 500;
  line-height: 1.4;
}

.voyaa-landing .voyaa-demo-blur-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(255,255,255,0.4) 0%, rgba(255,255,255,0.1) 100%);
  z-index: 3;
}

.voyaa-landing .voyaa-demo-blurred-footer {
  font-size: 14px;
  color: var(--ink-soft);
  font-style: italic;
  line-height: 1.6;
  margin-top: 8px;
}

/* ============ MODAL ============ */
.voyaa-landing .voyaa-modal-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(26, 26, 26, 0.5);
  backdrop-filter: blur(4px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  animation: voyaa-modal-fade 200ms ease;
}

@keyframes voyaa-modal-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}

.voyaa-landing .voyaa-modal-card {
  background: white;
  border-radius: 24px;
  padding: 48px 40px 40px;
  max-width: 460px;
  width: 100%;
  position: relative;
  text-align: center;
  box-shadow: 0 32px 64px rgba(0,0,0,0.2);
}

.voyaa-landing .voyaa-modal-close {
  position: absolute;
  top: 16px;
  right: 16px;
  background: transparent;
  border: none;
  font-size: 28px;
  color: var(--ink-soft);
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.voyaa-landing .voyaa-modal-close:hover {
  background: var(--warm);
  color: var(--ink);
}

.voyaa-landing .voyaa-modal-emoji {
  font-size: 56px;
  margin-bottom: 16px;
}

.voyaa-landing .voyaa-modal-title {
  font-family: Georgia, serif;
  font-size: 26px;
  font-weight: 400;
  letter-spacing: -0.5px;
  margin-bottom: 12px;
  color: var(--ink);
}

.voyaa-landing .voyaa-modal-body {
  font-size: 15px;
  color: var(--ink-soft);
  line-height: 1.6;
  margin-bottom: 24px;
}

.voyaa-landing .voyaa-modal-cta {
  display: inline-block;
  background: var(--ink);
  color: var(--paper) !important;
  padding: 14px 32px;
  border-radius: 100px;
  text-decoration: none;
  font-weight: 600;
  font-size: 15px;
  border: none;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.15s;
}

.voyaa-landing .voyaa-modal-cta:hover {
  background: var(--accent);
  color: white !important;
}

.voyaa-landing .voyaa-modal-microcopy {
  margin-top: 16px;
  font-size: 12px;
  color: var(--ink-soft);
}

/* ============ RESPONSIVE ============ */
@media (max-width: 768px) {
  .voyaa-landing .voyaa-search-row {
    flex-direction: column;
    border-radius: 24px;
    padding: 16px;
    gap: 8px;
    align-items: stretch;
  }

  .voyaa-landing .voyaa-search-brand {
    font-size: 28px;
    text-align: center;
  }

  .voyaa-landing .voyaa-search-input-wrap {
    height: 44px;
  }

  .voyaa-landing .voyaa-search-input,
  .voyaa-landing .voyaa-placeholder-text {
    font-size: 16px;
  }

  .voyaa-landing .voyaa-demo-cta-row {
    flex-direction: column;
  }

  .voyaa-landing .voyaa-demo-reset-btn {
    position: static;
    margin-bottom: 16px;
  }

  .voyaa-landing .voyaa-demo-blurred-section {
    padding: 24px 20px;
  }

  .voyaa-landing .voyaa-modal-card {
    padding: 36px 24px 28px;
  }
}
`;
