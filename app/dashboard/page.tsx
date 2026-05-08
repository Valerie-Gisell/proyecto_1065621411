import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { verifyAuthToken } from "@/lib/auth";
import { getDashboardData } from "@/lib/dataService";
import BalanceCard from "@/components/ui/BalanceCard";
import QuickActions from "@/components/ui/QuickActions";
import SeedModeBanner from "@/components/ui/SeedModeBanner";
import LogoutButton from "@/components/ui/LogoutButton";

export default async function DashboardPage() {
  const token = cookies().get("gocash_token")?.value;
  if (!token) {
    redirect("/login");
  }

  const payload = await verifyAuthToken(token);
  if (!payload) {
    redirect("/login");
  }

  const dashboardData = await getDashboardData(payload.sub);

  return (
    <div className="space-y-8 pb-32">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-emerald-300">Dashboard</p>
          <h1 className="mt-3 text-4xl font-semibold text-white">Bienvenido de nuevo, {payload.name}</h1>
          <p className="mt-3 text-slate-300">Shell de la fase 2 con layout mobile-first, tarjetas suaves y navegación inicial.</p>
        </div>
        <div className="flex items-center gap-3">
          <LogoutButton />
        </div>
      </div>

      <SeedModeBanner seedMode={dashboardData.seedMode} userName={payload.name} categoriesCount={dashboardData.categoriesCount} />

      <BalanceCard balance="$0" income="$0" expenses="$0" />

      <QuickActions />

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-soft backdrop-blur-xl">
          <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">Próximos datos</p>
          <h2 className="mt-4 text-2xl font-semibold text-white">Contenido pendiente</h2>
          <p className="mt-4 text-slate-300">Las gráficas reales, el balance mensual y las transacciones se integrarán en fases posteriores del roadmap.</p>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-soft backdrop-blur-xl">
          <p className="text-sm uppercase tracking-[0.3em] text-amber-300">Acceso rápido</p>
          <h2 className="mt-4 text-2xl font-semibold text-white">Navega por el shell</h2>
          <p className="mt-4 text-slate-300">Esta vista ya está preparada para recibir componentes de categorías, metas y transacciones en las siguientes fases.</p>
        </div>
      </div>
    </div>
  );
}
