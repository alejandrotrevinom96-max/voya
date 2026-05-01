// Tipos del feature de demo en landing

export interface VisibleActivity {
  id: string;                    // uuid generado al vuelo (no de DB)
  name: string;                  // "Cenote Dos Ojos"
  category: string;              // "outdoor" | "food" | "culture" | "nightlife" | "hidden_gem"
  emoji: string;                 // "🌿"
  description: string;           // 1-2 líneas
  location_hint: string | null;  // "Carretera Tulum-Cobá, km 16"
  estimated_cost: number;        // en MXN
  duration_minutes: number;      // estimado
  highlight_label: string | null; // "Hidden gem ✦", "Local favorito ✦", null
}

export interface BlurredActivity {
  id: string;
  category: string;
  emoji: string;
  teaser: string;               // "Cena con vista al mar"
  highlight_label: string | null; // "Hidden gem ✦", "Romántico ✦", null
}

export interface DemoTripPreview {
  destination_key: string;      // "tulum"
  destination_display: string;  // "Tulum"
  duration_days: number;
  trip_emoji: string;
  trip_summary: string;         // "5 días · ~$8,500 MXN"
  total_estimated_cost: number;
  visible_activities: VisibleActivity[];   // 5 con detalle
  blurred_activities: BlurredActivity[];   // 8 blureadas
  tone_hint?: string | null;    // "reset" | "celebration" | "social" | "default"
  served_from_cache: boolean;
}

export interface ParsedQuery {
  destination: string | null;        // "Tulum", "Oaxaca", null si no se entiende
  destination_normalized: string;    // "tulum", lowercase para cache lookup
  duration_days: number | null;     // 5, 7, null
  context: string | null;           // "porque cumplo 30", "porque me divorcié"
  tone_hint: string | null;         // "celebration" | "reset" | "social" | "default"
  group_size_hint: string | null;   // "alone" | "couple" | "friends" | "family"
}

export interface RateLimitStatus {
  allowed: boolean;
  remaining: number;             // cuántas le quedan (0, 1, 2)
  total_used: number;            // cuántas ha usado total
}

export interface GeneratePreviewResponse {
  success: boolean;
  preview?: DemoTripPreview;
  parsed?: ParsedQuery;
  rateLimit: RateLimitStatus;
  error?: string;
}
