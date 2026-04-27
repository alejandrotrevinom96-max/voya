"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { login } from "../actions";

export default function LoginForm() {
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const result = await login(formData);

    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          placeholder="Tu contraseña"
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
        {loading ? "Iniciando sesión..." : "Iniciar sesión"}
      </button>

      <p className="text-sm text-center text-brown-soft pt-2">
        ¿No tienes cuenta?{" "}
        <Link href="/auth/signup" className="text-terracotta hover:underline">
          Regístrate gratis
        </Link>
      </p>
    </form>
  );
}
