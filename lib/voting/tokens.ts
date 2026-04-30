import { randomBytes } from "crypto";

/**
 * Genera un token único para invitación (24 caracteres URL-safe).
 * Más corto que un UUID pero criptográficamente seguro.
 */
export function generateVotingToken(): string {
  return randomBytes(18).toString("base64url");
}

/**
 * Genera un session ID para invitados sin cuenta.
 * Se guarda en cookie del invitado.
 */
export function generateSessionId(): string {
  return `vsess_${randomBytes(16).toString("base64url")}`;
}
