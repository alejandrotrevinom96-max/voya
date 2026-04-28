import Anthropic from "@anthropic-ai/sdk";

// Modelo a usar — Sonnet 4.6 es el balance recomendado de precio/calidad
// ($3/M input, $15/M output). Si quieres ahorrar, cambia a "claude-haiku-4-5"
// Si quieres máxima calidad, cambia a "claude-opus-4-7" (5x más caro)
export const CLAUDE_MODEL = "claude-sonnet-4-6";

let _client: Anthropic | null = null;

/**
 * Lazy initialization del cliente de Anthropic.
 * Solo valida la API key cuando se usa, no al importar el módulo.
 * Esto evita que Next.js falle el build si por alguna razón la env var
 * no está disponible durante el build phase.
 */
export function getAnthropicClient(): Anthropic {
  if (_client) return _client;

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error(
      "Falta ANTHROPIC_API_KEY. Configúrala en tu .env.local (desarrollo) o en Variables de Entorno de Vercel (producción). Obtén tu key en https://console.anthropic.com/settings/keys"
    );
  }

  _client = new Anthropic({ apiKey });
  return _client;
}
