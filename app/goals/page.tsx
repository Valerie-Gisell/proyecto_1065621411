"use client";

import { useEffect, useMemo, useState } from "react";
import AppLayout from "@/components/ui/AppLayout";

interface Goal {
  id: string;
  name: string;
  emoji: string;
  target_amount: number;
  current_amount: number;
  deadline?: string | null;
  description?: string;
  status: string;
  progress: number;
  remaining: number;
}

const initialForm = {
  name: "",
  emoji: "🎯",
  target_amount: 0,
  deadline: "",
  description: "",
};

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const activeGoals = useMemo(() => goals.filter((goal) => goal.status !== "completada"), [goals]);
  const completedGoals = useMemo(() => goals.filter((goal) => goal.status === "completada"), [goals]);

  useEffect(() => {
    fetchGoals();
  }, []);

  async function fetchGoals() {
    setLoading(true);
    const response = await fetch("/api/goals");
    const payload = await response.json();
    if (payload.success) {
      setGoals(payload.data);
    } else {
      setError(payload.error || "No se pudo cargar las metas.");
    }
    setLoading(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const response = await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        emoji: form.emoji,
        target_amount: Number(form.target_amount),
        deadline: form.deadline || undefined,
        description: form.description || undefined,
      }),
    });

    const payload = await response.json();
    if (payload.success) {
      setGoals((prev) => [payload.data, ...prev]);
      setForm(initialForm);
      setSuccessMessage("Meta creada con éxito.");
    } else {
      setError(payload.error || "No se pudo crear la meta.");
    }
  }

  async function handleContribute(goalId: string) {
    const amount = Number(prompt("Ingresa el monto a aportar:", "0"));
    if (!amount || amount <= 0) return;

    const response = await fetch(`/api/goals/${goalId}/contribute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount }),
    });
    const payload = await response.json();
    if (payload.success) {
      setGoals((prev) => prev.map((goal) => (goal.id === goalId ? payload.data : goal)));
      setSuccessMessage("Aporte registrado.");
    } else {
      setError(payload.error || "No se pudo aportar a la meta.");
    }
  }

  async function handleDelete(goalId: string) {
    if (!confirm("¿Deseas eliminar esta meta?")) return;
    const response = await fetch(`/api/goals/${goalId}`, { method: "DELETE" });
    const payload = await response.json();
    if (payload.success) {
      setGoals((prev) => prev.filter((goal) => goal.id !== goalId));
    } else {
      setError(payload.error || "No se pudo eliminar la meta.");
    }
  }

  return (
    <AppLayout>
      <div className="space-y-8 pb-32">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-soft backdrop-blur-xl">
          <p className="text-sm uppercase tracking-[0.28em] text-amber-300">Metas</p>
          <h1 className="mt-4 text-4xl font-semibold text-white">Planifica tu ahorro</h1>
          <p className="mt-4 text-slate-300">Crea objetivos de ahorro y registra aportes para ver el progreso de tus metas financieras.</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <section className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-soft backdrop-blur-xl">
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-emerald-300">Nueva meta</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Agrega un objetivo</h2>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm text-slate-300">Nombre</span>
                    <input
                      className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-emerald-300"
                      value={form.name}
                      onChange={(event) => setForm({ ...form, name: event.target.value })}
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm text-slate-300">Emoji</span>
                    <input
                      className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-emerald-300"
                      value={form.emoji}
                      onChange={(event) => setForm({ ...form, emoji: event.target.value })}
                      required
                    />
                  </label>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="text-sm text-slate-300">Monto objetivo</span>
                    <input
                      type="number"
                      min="1"
                      className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-emerald-300"
                      value={form.target_amount}
                      onChange={(event) => setForm({ ...form, target_amount: Number(event.target.value) })}
                      required
                    />
                  </label>
                  <label className="block">
                    <span className="text-sm text-slate-300">Fecha límite</span>
                    <input
                      type="date"
                      className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-emerald-300"
                      value={form.deadline}
                      onChange={(event) => setForm({ ...form, deadline: event.target.value })}
                    />
                  </label>
                </div>
                <label className="block">
                  <span className="text-sm text-slate-300">Descripción</span>
                  <textarea
                    className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-emerald-300"
                    value={form.description}
                    onChange={(event) => setForm({ ...form, description: event.target.value })}
                    rows={4}
                  />
                </label>
                <button className="inline-flex items-center justify-center rounded-3xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300">
                  Crear meta
                </button>
              </form>
              {error ? <p className="text-sm text-rose-400">{error}</p> : null}
              {successMessage ? <p className="text-sm text-emerald-300">{successMessage}</p> : null}
            </div>
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-soft backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.28em] text-emerald-300">Insight</p>
            <h2 className="mt-4 text-2xl font-semibold text-white">Tus metas al instante</h2>
            <p className="mt-4 text-slate-300">Administra tus objetivos, visualiza progreso y crea aportes rápidos desde la misma pantalla.</p>
            <div className="mt-6 grid gap-4">
              <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-5">
                <p className="text-sm text-slate-400">Metas activas</p>
                <p className="mt-2 text-3xl font-semibold text-white">{activeGoals.length}</p>
              </div>
              <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-5">
                <p className="text-sm text-slate-400">Metas completadas</p>
                <p className="mt-2 text-3xl font-semibold text-emerald-300">{completedGoals.length}</p>
              </div>
            </div>
          </section>
        </div>

        <section className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-soft backdrop-blur-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Lista de metas</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Revisa tus objetivos</h2>
            </div>
            <p className="text-sm text-slate-300">Actualiza los aportes según tus avances.</p>
          </div>

          {loading ? (
            <p className="mt-6 text-slate-300">Cargando metas...</p>
          ) : goals.length === 0 ? (
            <p className="mt-6 text-slate-300">Aún no tienes metas. Crea una para comenzar.</p>
          ) : (
            <div className="mt-6 grid gap-4">
              {goals.map((goal) => (
                <article key={goal.id} className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-3xl">{goal.emoji}</p>
                      <h3 className="mt-3 text-2xl font-semibold text-white">{goal.name}</h3>
                      <p className="mt-2 text-sm text-slate-400">{goal.description || "Sin descripción"}</p>
                    </div>
                    <div className="space-y-2 text-right">
                      <span className="block rounded-full bg-slate-800/90 px-3 py-1 text-xs uppercase tracking-[0.2em] text-slate-400">
                        {goal.status.replace("_", " ")}
                      </span>
                      <p className="text-sm text-slate-400">Meta: {goal.target_amount} COP</p>
                      <p className="text-lg font-semibold text-white">Aportado: {goal.current_amount} COP</p>
                    </div>
                  </div>
                  <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-800">
                    <div className="h-full rounded-full bg-emerald-400 transition-all" style={{ width: `${Math.min(goal.progress, 100)}%` }} />
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-sm text-slate-400">Progreso: {goal.progress}% · Restan {goal.remaining} COP</p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => handleContribute(goal.id)}
                        className="rounded-3xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
                      >
                        Aportar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(goal.id)}
                        className="rounded-3xl border border-white/10 bg-slate-900/90 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-white/5"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
