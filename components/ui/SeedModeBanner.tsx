interface SeedModeBannerProps {
  seedMode: boolean;
  userName: string;
  categoriesCount: number;
}

export default function SeedModeBanner({ seedMode, userName, categoriesCount }: SeedModeBannerProps) {
  return (
    <div className="rounded-[1.75rem] border border-emerald-400/20 bg-emerald-400/10 p-6 text-slate-100 shadow-soft backdrop-blur-xl">
      <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">Seed mode</p>
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-lg font-semibold text-white">Hola, {userName}. El sistema está en modo seed.</p>
          <p className="mt-2 max-w-2xl text-sm text-slate-200">
            El dashboard muestra un estado inicial y los datos reales se cargarán en fases siguientes.
          </p>
        </div>
        <div className="rounded-3xl bg-slate-950/80 px-4 py-3 text-sm text-slate-200">
          <p className="text-slate-400">Categorías globales</p>
          <p className="mt-1 text-2xl font-semibold text-white">{categoriesCount}</p>
        </div>
      </div>
    </div>
  );
}
