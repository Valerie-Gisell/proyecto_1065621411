"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

interface AuthFormProps {
  mode: "login" | "register";
}

export default function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const actionUrl = mode === "login" ? "/api/auth/login" : "/api/auth/register";
  const title = mode === "login" ? "Iniciar sesión" : "Registro público";
  const subtitle =
    mode === "login"
      ? "Accede a tu espacio financiero seguro."
      : "Crea tu cuenta pública para iniciar el control de gastos.";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(actionUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        setError(result.error || "Ocurrió un error inesperado.");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
    } catch (error) {
      setError("No fue posible conectar con el servidor.");
      setLoading(false);
    }
  }

  return (
    <div className="rounded-[2rem] border border-white/10 bg-slate-950/70 p-8 shadow-soft backdrop-blur-xl sm:p-10">
      <div className="mb-6">
        <p className="text-3xl font-semibold text-white">{title}</p>
        <p className="mt-2 text-sm text-slate-400">{subtitle}</p>
      </div>
      <form className="space-y-5" onSubmit={handleSubmit}>
        {mode === "register" && (
          <label className="block text-sm text-slate-200">
            Nombre completo
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Tu nombre"
              required
              className="mt-3 w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
            />
          </label>
        )}
        <label className="block text-sm text-slate-200">
          Correo electrónico
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="nombre@ejemplo.com"
            required
            className="mt-3 w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-sm text-white outline-none transition focus:border-coral-400 focus:ring-2 focus:ring-coral-400/20"
          />
        </label>
        <label className="block text-sm text-slate-200">
          Contraseña
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="••••••••••"
            required
            className="mt-3 w-full rounded-3xl border border-slate-700 bg-slate-950/90 px-4 py-3 text-sm text-white outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
          />
        </label>
        {error && <p className="rounded-3xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-emerald-400 to-amber-300 px-5 py-3 text-sm font-semibold text-slate-900 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? "Procesando..." : mode === "login" ? "Ingresar" : "Crear cuenta"}
        </button>
      </form>
      <p className="mt-4 text-xs text-slate-500">El registro es público y no necesita invitación.</p>
    </div>
  );
}
