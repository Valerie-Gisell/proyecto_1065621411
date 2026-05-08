"use client";

import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import AppLayout from "@/components/ui/AppLayout";

interface EmotionAnalysisItem {
  emotion: string;
  total_amount: number;
  percentage: number;
}

const emotionLabels: Record<string, string> = {
  feliz: "Feliz",
  tranquilo: "Tranquilo",
  triste: "Triste",
  estresado: "Estresado",
  emocionado: "Emocionado",
};

export default function EmotionsPage() {
  const [analysis, setAnalysis] = useState<EmotionAnalysisItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalysis();
  }, []);

  async function loadAnalysis() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/emotions/analysis");
      const payload = await response.json();
      if (!payload.success) {
        throw new Error(payload.error || "No se pudo cargar el análisis.");
      }
      setAnalysis(payload.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado.");
    }
    setLoading(false);
  }

  return (
    <AppLayout>
      <div className="space-y-8 pb-32">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-soft backdrop-blur-xl">
          <p className="text-sm uppercase tracking-[0.28em] text-pink-300">Emociones</p>
          <h1 className="mt-4 text-4xl font-semibold text-white">Tu relación con el gasto</h1>
          <p className="mt-4 text-slate-300">Explora cómo tus emociones influyen en tus gastos y identifica patrones de comportamiento.</p>
        </div>

        {error ? (
          <div className="rounded-[2rem] border border-rose-500/20 bg-rose-950/20 p-8 text-rose-200">{error}</div>
        ) : null}

        <section className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-soft backdrop-blur-xl">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-emerald-300">Resumen emocional</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Gastos por emoción</h2>
            </div>
            <button
              onClick={loadAnalysis}
              className="rounded-3xl bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              Actualizar
            </button>
          </div>

          {loading ? (
            <p className="mt-6 text-slate-300">Cargando análisis...</p>
          ) : analysis.length === 0 ? (
            <p className="mt-6 text-slate-300">No hay gastos con emociones registradas.</p>
          ) : (
            <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_0.6fr]">
              <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6">
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analysis} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="emotion" tickFormatter={(value) => emotionLabels[value] || value} tick={{ fill: "#94a3b8" }} />
                      <YAxis tick={{ fill: "#94a3b8" }} />
                      <Tooltip contentStyle={{ backgroundColor: "#0f172a", border: "1px solid #334155" }} formatter={(value) => [`${value} COP`, "Gasto"]} />
                      <Bar dataKey="total_amount" fill="#f472b6" radius={[12, 12, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="space-y-4">
                {analysis.map((item) => (
                  <div key={item.emotion} className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-400">{emotionLabels[item.emotion] || item.emotion}</p>
                      <p className="text-sm font-semibold text-white">{item.percentage}%</p>
                    </div>
                    <p className="mt-3 text-2xl font-semibold text-white">{item.total_amount} COP</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
