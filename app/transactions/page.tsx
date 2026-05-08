import Link from "next/link";
import { cookies } from "next/headers";
import { getAuthPayload } from "@/lib/withAuth";
import { getTransactions } from "@/lib/dataService";

export default async function TransactionsPage() {
  const auth = await getAuthPayload({ cookies: cookies() } as any);
  if (!auth) {
    return <div className="p-6 text-white">Acceso denegado.</div>;
  }

  const transactions = await getTransactions(auth.sub);

  return (
    <div className="space-y-8 p-6">
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-soft backdrop-blur-xl">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">Transacciones</h1>
            <p className="mt-2 text-sm text-slate-400">Revisa y controla tus ingresos y gastos.</p>
          </div>
          <Link href="/transactions/new" className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:brightness-110">
            Nueva transacción
          </Link>
        </div>
      </div>

      <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-soft backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-300">
            <thead className="border-b border-white/10 text-slate-400">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Descripción</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3">Monto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-slate-900/60">
                  <td className="px-4 py-4">{transaction.transaction_date}</td>
                  <td className="px-4 py-4">{transaction.description || "-"}</td>
                  <td className="px-4 py-4 capitalize">{transaction.type}</td>
                  <td className={`px-4 py-4 font-semibold ${transaction.type === "ingreso" ? "text-emerald-300" : "text-rose-300"}`}>
                    {transaction.type === "gasto" ? `- ${transaction.amount}` : `+ ${transaction.amount}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
