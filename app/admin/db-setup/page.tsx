import AppLayout from "@/components/ui/AppLayout";

export default function AdminDbSetupPage() {
  return (
    <AppLayout>
      <div className="space-y-8">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-soft backdrop-blur-xl">
          <p className="text-sm uppercase tracking-[0.3em] text-amber-300">Administración</p>
          <h1 className="mt-4 text-4xl font-semibold text-white">DB Setup</h1>
          <p className="mt-4 text-slate-300">
            Aquí se debe ejecutar el bootstrap de la base de datos y las migraciones para Supabase. Por ahora esta página es un shell de administración de fase 2.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-6 shadow-soft backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.28em] text-emerald-300">Estado actual</p>
            <p className="mt-4 text-slate-300">Modo seed activo. Las migraciones todavía no se aplican automáticamente desde esta interfaz.</p>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-slate-950/80 p-6 shadow-soft backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.28em] text-coral-300">Próximo paso</p>
            <p className="mt-4 text-slate-300">Añadir soporte de migraciones y bootstrap de Supabase en la Fase 3.</p>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
