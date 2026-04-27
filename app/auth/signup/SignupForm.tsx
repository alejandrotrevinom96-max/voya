"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { signup } from "../actions";

export default function SignupForm() {
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await signup(formData);

    // Si llega aquí es porque hubo error (success hace redirect)
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="full_name"
          className="block text-sm font-medium mb-2 text-brown-mid"
        >
          ¿Cómo te llamas?
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          placeholder="Tu nombre"
          className="input-base"
          disabled={loading}
        />
      </div>

      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium mb-2 text-brown-mid"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          placeholder="tu@email.com"
          className="input-base"
          disabled={loading}
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium mb-2 text-brown-mid"
        >
          Contraseña
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          placeholder="Mínimo 6 caracteres"
          className="input-base"
          disabled={loading}
        />
      </div>

      {error && (
        <div className="px-4 py-3 rounded-2xl bg-error/10 text-error text-sm">
          {error}
        </div>
      )}

      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? "Creando cuenta..." : "Crear cuenta"}
      </button>

      <p className="text-sm text-center text-brown-soft pt-2">
        ¿Ya tienes cuenta?{" "}
        <Link href="/auth/login" className="text-terracotta hover:underline">
          Inicia sesión
        </Link>
      </p>
    </form>
  );
}
