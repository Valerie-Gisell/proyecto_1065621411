"use client";

import { useEffect, useState, type FormEvent } from "react";

interface TransactionFormProps {
  categories: Array<{ id: string; name: string }>; 
  onCreated?: () => void;
}

export default function TransactionForm({ categories, onCreated }: TransactionFormProps) {
  const [type, setType] = useState<"ingreso" | "gasto">("gasto");
  const [amount, setAmount] = useState(0);
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<string>(categories[0]?.id ?? "");
  const [transactionDate, setTransactionDate] = useState(new Date().toISOString().slice(0, 10));
  const [emotion, setEmotion] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!categoryId && categories.length > 0) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          amount,
          description,
          category_id: categoryId || null,
          transaction_date: transactionDate,
          emotion: emotion || null,
        }),
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        setError(result.error || "No se pudo crear la transacción.");
        setLoading(false);
        return;
      }

      setType("gasto");
      setAmount(0);
      setDescription("");
      setCategoryId(categories[0]?.id ?? "");
      setEmotion("");
      setTransactionDate(new Date().toISOString().slice(0, 10));
      onCreated?.();
    } catch (err) {
      setError("Error de conexión.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-6 shadow-soft backdrop-blur-xl">
      <h2 className="text-lg font-semibold text-white">Nueva transacción</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm text-slate-300">
          Monto
          <input
            type="number"
            value={amount}
            onChange={(event) => setAmount(Number(event.target.value))}
            required
            min={0}
            step={0.01}
            className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
          />
        </label>
        <label className="block text-sm text-slate-300">
          Fecha
          <input
            type="date"
            value={transactionDate}
            onChange={(event) => setTransactionDate(event.target.value)}
            required
            className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
          />
        </label>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm text-slate-300">
          Tipo
          <select
            value={type}
            onChange={(event) => setType(event.target.value as "ingreso" | "gasto")}
            className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
          >
            <option value="gasto">Gasto</option>
            <option value="ingreso">Ingreso</option>
          </select>
        </label>
        <label className="block text-sm text-slate-300">
          Categoría
          <select
            value={categoryId}
            onChange={(event) => setCategoryId(event.target.value)}
            className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
          >
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="block text-sm text-slate-300">
        Descripción
        <input
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="Pago de servicios"
          className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm text-slate-300">
          Emoción
          <input
            value={emotion}
            onChange={(event) => setEmotion(event.target.value)}
            placeholder="Motivado, preocupado..."
            className="mt-2 w-full rounded-3xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/20"
          />
        </label>
      </div>
      {error && <p className="rounded-3xl bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? "Creando..." : "Registrar transacción"}
      </button>
    </form>
  );
}
