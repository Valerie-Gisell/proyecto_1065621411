import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Logo from "@/components/ui/Logo";

export default function HomePage() {
  const token = cookies().get("gocash_token")?.value;
  if (token) {
    redirect("/dashboard");
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.22),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(251,113,133,0.18),_transparent_30%),linear-gradient(180deg,#020617,_#08111f)] text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16 sm:px-10 lg:px-12">
        <header className="mb-12 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-3 text-sm text-slate-300">
            <a href="/login" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 transition hover:border-emerald-400/50 hover:text-white">
              Iniciar sesión
            </a>
            <a href="/register" className="rounded-full bg-emerald-400 px-4 py-2 font-semibold text-slate-900 transition hover:brightness-110">
              Regístrate
            </a>
          </div>
        </header>

        <section className="grid gap-10 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div className="space-y-8">
            <p className="inline-flex rounded-full bg-emerald-400/10 px-4 py-2 text-sm font-medium uppercase tracking-[0.3em] text-emerald-300">
              Fase 1 / Seed Mode
            </p>
            <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">
              GoCash — Control de gastos con seguridad JWT y diseño financiero.
            </h1>
            <p className="max-w-2xl text-lg text-slate-300">
              Registro público, login seguro con cookie HttpOnly y un dataService unificado para conectar con Supabase o modo seed local.
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="/register" className="inline-flex items-center justify-center rounded-full bg-amber-300 px-6 py-3 font-semibold text-slate-900 transition hover:brightness-95">
                Crear cuenta
              </a>
              <a href="/login" className="inline-flex items-center justify-center rounded-full border border-white/10 px-6 py-3 text-white transition hover:border-emerald-400/50">
                Entrar a mi cuenta
              </a>
            </div>
          </div>

          <div className="rounded-[2.5rem] border border-white/10 bg-slate-950/70 p-8 shadow-soft backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.24em] text-emerald-300">Modo seed habilitado</p>
            <h2 className="mt-4 text-3xl font-semibold text-white">Funcionalidad inicial</h2>
            <ul className="mt-6 space-y-4 text-slate-300">
              <li className="rounded-3xl border border-slate-800/80 bg-slate-900/70 p-4">
                • Autenticación con JWT y cookie HttpOnly.
              </li>
              <li className="rounded-3xl border border-slate-800/80 bg-slate-900/70 p-4">
                • Registro público sin invitación.
              </li>
              <li className="rounded-3xl border border-slate-800/80 bg-slate-900/70 p-4">
                • DataService unificado con fallback local y auditoría básica.
              </li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}
