"use client";

import { useEffect, useState } from "react";
import { Area, AreaChart, CartesianGrid, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import AppLayout from "@/components/ui/AppLayout";

interface BalanceData {
  income: number;
  expenses: number;
  net: number;
}

interface CategoryBreakdownItem {
  category_name: string;
  total: number;
  color: string;
}

interface DailyBalanceItem {
  date: string;
  balance: number;
}

export default function ReportsPage() {
  const [balance, setBalance] = useState<BalanceData | null>(null);
  const [breakdown, setBreakdown] = useState<CategoryBreakdownItem[]>([]);
  const [evolution, setEvolution] = useState<DailyBalanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  async function loadReports() {
    setLoading(true);
    setError(null);
    try {
      const current = new Date();
      const year = current.getUTCFullYear();
      const month = current.getUTCMonth() + 1;

      const [balanceRes, breakdownRes, evolutionRes] = await Promise.all([
        fetch(`/api/balance?year=${year}&month=${month}`),
        fetch(`/api/categories/breakdown?year=${year}&month=${month}`),
        fetch(`/api/balance/evolution?year=${year}&month=${month}`),
      ]);

      const balanceData = await balanceRes.json();
      const breakdownData = await breakdownRes.json();
      const evolutionData = await evolutionRes.json();

      if (!balanceData.success || !breakdownData.success || !evolutionData.success) {
        throw new Error(balanceData.error || breakdownData.error || evolutionData.error || "No se pudo cargar la información.");
      }

      setBalance(balanceData.data);
      setBreakdown(breakdownData.data);
      setEvolution(evolutionData.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    }
    setLoading(false);
  }

  return (
    <AppLayout>
      <div className="space-y-8 pb-32">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-soft backdrop-blur-xl">
          <p className="text-sm uppercase tracking-[0.28em] text-violet-300">Reportes</p>
          <h1 className="mt-4 text-4xl font-semibold text-white">Inteligencia financiera</h1>
          <p className="mt-4 text-slate-300">Visualiza tu rendimiento mensual con gráficos de balance, evolución diaria y desglose por categorías.</p>
        </div>

        {error ? (
          <div className="rounded-[2rem] border border-rose-500/20 bg-rose-950/20 p-8 text-rose-200">{error}</div>
        ) : null}

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <section className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-soft backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-emerald-300">Balance mensual</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Visión rápida</h2>
              </div>
              <button
                onClick={loadReports}
                className="rounded-3xl bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                Actualizar
              </button>
            </div>

            {loading ? (
              <p className="mt-6 text-slate-300">Cargando datos...</p>
            ) : balance ? (
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-5 text-center">
                  <p className="text-sm text-slate-400">Ingresos</p>
                  <p className="mt-3 text-3xl font-semibold text-emerald-300">{balance.income} COP</p>
                </div>
                <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-5 text-center">
                  <p className="text-sm text-slate-400">Gastos</p>
                  <p className="mt-3 text-3xl font-semibold text-rose-400">{balance.expenses} COP</p>
                </div>
                <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-5 text-center">
                  <p className="text-sm text-slate-400">Neto</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{balance.net} COP</p>
                </div>
              </div>
            ) : null}
          </section>

          <section className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-soft backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Balance diario</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Evolución</h2>
            {loading ? (
              <p className="mt-6 text-slate-300">Cargando gráfica...</p>
            ) : evolution.length > 0 ? (
              <div className="mt-6 h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={evolution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                    <XAxis dataKey="date" tick={{ fill: "#94a3b8" }} />
                    <YAxis tick={{ fill: "#94a3b8" }} />
                    <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155" }} />
                    <Line type="monotone" dataKey="balance" stroke="#34d399" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="mt-6 text-slate-300">No hay datos disponibles para el mes actual.</p>
            )}
          </section>
        </div>

        <section className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-soft backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Gastos por categoría</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Distribución</h2>
            </div>
            <p className="text-sm text-slate-500">Actualizado al mes actual.</p>
          </div>

          {loading ? (
            <p className="mt-6 text-slate-300">Cargando desglose...</p>
          ) : breakdown.length > 0 ? (
            <div className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_0.6fr]">
              <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={breakdown} dataKey="total" nameKey="category_name" innerRadius={48} outerRadius={88} fill="#34d399">
                        {breakdown.map((entry, index) => (
                          <cell key={`slice-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155" }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="grid gap-4">
                {breakdown.map((entry) => (
                  <div key={entry.category_name} className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-5">
                    <div className="flex items-center gap-3">
                      <span className="inline-flex h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }} />
                      <p className="text-sm text-slate-300">{entry.category_name}</p>
                    </div>
                    <p className="mt-3 text-2xl font-semibold text-white">{entry.total} COP</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="mt-6 text-slate-300">No hay gastos registrados para mostrar.</p>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
