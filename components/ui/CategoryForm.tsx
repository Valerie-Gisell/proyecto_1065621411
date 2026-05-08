"use client";

import { useState, type FormEvent } from "react";

interface CategoryFormProps {
  endpoint?: string;
  onCreated?: () => void;
}

export default function CategoryForm({ endpoint = "/api/categories", onCreated }: CategoryFormProps) {
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("💸");
  const [color, setColor] = useState("#22c55e");
  const [type, setType] = useState<"gasto" | "ingreso" | "ambos">("gasto");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, emoji, color, type }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        setError(result.error || "No se pudo crear la categoría.");
        setLoading(false);
        return;
      }
      setName("");
      setEmoji("💸");
      setColor("#22c55e");
      setType("gasto");
      if (onCreated) {
        onCreated();
      } else {
        window.location.reload();
      }
    } catch (err) {
      setError("Error de conexión.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="space-y-4 rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-6 shadow-soft backdrop-blur-xl" onSubmit={handleSubmit}>
      <h2 className="text-lg font-semibold text-white">Nueva categoría personal</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm text-slate-300">
          Nombre
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Ej. Snacks"
            required
            className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
          />
        </label>
        <label className="block text-sm text-slate-300">
          Emoji
          <input
            value={emoji}
            onChange={(event) => setEmoji(event.target.value)}
            placeholder="🍓"
            required
            className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
          />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm text-slate-300">
          Color
          <input
            type="color"
            value={color}
            onChange={(event) => setColor(event.target.value)}
            className="mt-2 h-12 w-full rounded-3xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none"
          />
        </label>
        <label className="block text-sm text-slate-300">
          Tipo
          <select
            value={type}
            onChange={(event) => setType(event.target.value as "gasto" | "ingreso" | "ambos")}
            className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
          >
            <option value="gasto">Gasto</option>
            <option value="ingreso">Ingreso</option>
            <option value="ambos">Ambos</option>
          </select>
        </label>
      </div>
      {error && <p className="rounded-3xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? "Creando..." : "Crear categoría"}
      </button>
    </form>
  );
}
