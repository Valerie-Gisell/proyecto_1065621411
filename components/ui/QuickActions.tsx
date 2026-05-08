import Link from "next/link";

export default function QuickActions() {
  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-6 shadow-soft backdrop-blur-xl">
      <p className="text-sm uppercase tracking-[0.3em] text-amber-300">Acciones rápidas</p>
      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        <Link
          href="/transactions/new"
          className="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
        >
          Registrar gasto
        </Link>
        <Link
          href="/goals"
          className="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
        >
          Mis metas
        </Link>
        <Link
          href="/profile"
          className="rounded-full border border-white/10 bg-white/5 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-white/10"
        >
          Mi perfil
        </Link>
      </div>
    </div>
  );
}
