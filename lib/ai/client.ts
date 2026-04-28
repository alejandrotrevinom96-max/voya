import Anthropic from "@anthropic-ai/sdk";

if (!process.env.ANTHROPIC_API_KEY) {
  throw new Error(
    "Falta ANTHROPIC_API_KEY. Agrégala a tu .env.local. Obtén tu key en https://console.anthropic.com/settings/keys"
  );
}

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Modelo a usar — Sonnet 4.6 es el balance recomendado de precio/calidad
// ($3/M input, $15/M output). Si quieres ahorrar, cambia a "claude-haiku-4-5"
// Si quieres máxima calidad, cambia a "claude-opus-4-7" (5x más caro)
export const CLAUDE_MODEL = "claude-sonnet-4-6";
