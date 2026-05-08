import { cookies } from "next/headers";
import { getAuthPayload } from "@/lib/withAuth";
import { getCategories } from "@/lib/dataService";
import TransactionForm from "@/components/ui/TransactionForm";

export default async function NewTransactionPage() {
  const auth = await getAuthPayload({ cookies: cookies() } as any);
  if (!auth) {
    return <div className="p-6 text-white">Acceso denegado.</div>;
  }

  const categories = await getCategories(auth.sub);
  const options = categories.map((category) => ({ id: category.id, name: category.name }));

  return (
    <div className="space-y-8 p-6">
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-soft backdrop-blur-xl">
        <h1 className="text-2xl font-semibold text-white">Agregar transacción</h1>
        <p className="mt-2 text-sm text-slate-400">Registra tus ingresos y gastos para llevar control financiero.</p>
      </div>
      <TransactionForm categories={options} />
    </div>
  );
}
