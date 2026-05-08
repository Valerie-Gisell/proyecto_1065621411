interface BalanceCardProps {
  balance: string;
  income: string;
  expenses: string;
}

export default function BalanceCard({ balance, income, expenses }: BalanceCardProps) {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-8 shadow-soft backdrop-blur-xl sm:p-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Balance mensual</p>
          <p className="mt-4 text-5xl font-semibold text-white sm:text-6xl">{balance}</p>
        </div>
        <div className="rounded-3xl bg-slate-900/90 px-4 py-3 text-sm text-slate-300">
          <p className="font-medium text-slate-100">Estado inicial</p>
          <p className="mt-1 text-xs leading-5 text-slate-500">placeholder seed shell</p>
        </div>
      </div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-5">
          <p className="text-sm text-slate-400">Ingresos</p>
          <p className="mt-3 text-2xl font-semibold text-emerald-300">{income}</p>
        </div>
        <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-5">
          <p className="text-sm text-slate-400">Gastos</p>
          <p className="mt-3 text-2xl font-semibold text-coral-300">{expenses}</p>
        </div>
      </div>
    </div>
  );
}
