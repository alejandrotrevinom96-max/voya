// ============================================
// Tipos de la base de datos
// ============================================

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  updated_at: string;
}

export type ActivityCategory =
  | "restaurant"
  | "museum"
  | "tour"
  | "nature"
  | "nightlife"
  | "shopping"
  | "beach"
  | "culture"
  | "other";

export type AIConfidence = "high" | "medium" | "low";

export interface Trip {
  id: string;
  user_id: string;
  name: string;
  destination: string;
  country: string | null;
  start_date: string; // ISO date
  end_date: string;
  travelers: number;
  interests: string[];
  currency: string;
  emoji: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  trip_id: string;
  name: string;
  category: ActivityCategory;
  description: string | null;
  estimated_price_min: number | null;
  estimated_price_max: number | null;
  estimated_duration_minutes: number | null;
  location_name: string | null;
  ai_confidence: AIConfidence;
  notes: string | null;
  is_added: boolean;
  created_at: string;
}

export interface ScheduleItem {
  id: string;
  trip_id: string;
  activity_id: string;
  day_date: string;
  start_time: string | null;
  order_index: number;
  created_at: string;
}

// ============================================
// Tipos de UI
// ============================================

export const INTEREST_OPTIONS = [
  { value: "gastronomia", label: "Gastronomía", emoji: "🍽️" },
  { value: "cultura", label: "Cultura e historia", emoji: "🏛️" },
  { value: "naturaleza", label: "Naturaleza", emoji: "🌿" },
  { value: "aventura", label: "Aventura", emoji: "🧗" },
  { value: "playa", label: "Playa y relax", emoji: "🏖️" },
  { value: "nightlife", label: "Vida nocturna", emoji: "🌙" },
  { value: "shopping", label: "Shopping", emoji: "🛍️" },
  { value: "arte", label: "Arte y diseño", emoji: "🎨" },
  { value: "fotografia", label: "Fotografía", emoji: "📸" },
  { value: "wellness", label: "Wellness y spa", emoji: "🧘" },
] as const;

export const CATEGORY_LABELS: Record<ActivityCategory, { label: string; emoji: string }> = {
  restaurant: { label: "Restaurante", emoji: "🍽️" },
  museum: { label: "Museo", emoji: "🏛️" },
  tour: { label: "Tour", emoji: "🎫" },
  nature: { label: "Naturaleza", emoji: "🌿" },
  nightlife: { label: "Vida nocturna", emoji: "🌙" },
  shopping: { label: "Shopping", emoji: "🛍️" },
  beach: { label: "Playa", emoji: "🏖️" },
  culture: { label: "Cultural", emoji: "🎭" },
  other: { label: "Otro", emoji: "✨" },
};
