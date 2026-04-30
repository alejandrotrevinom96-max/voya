// Meta Pixel helper
// Safe wrapper — no rompe si fbq no está cargado (adblock, SSR, etc.)

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    fbq: (...args: any[]) => void;
  }
}

export function event(name: string, options?: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  if (typeof window.fbq === "undefined") {
    console.warn(`[Pixel] fbq not loaded — skipping event: ${name}`);
    return;
  }
  window.fbq("track", name, options);
}
