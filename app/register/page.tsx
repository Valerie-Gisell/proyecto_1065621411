import AuthForm from "@/components/ui/AuthForm";
import Logo from "@/components/ui/Logo";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,113,133,0.18),_transparent_26%),radial-gradient(circle_at_bottom_left,_rgba(16,185,129,0.24),_transparent_28%),linear-gradient(180deg,#020617,_#08111f)] text-white">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16 sm:px-10 lg:px-12">
        <header className="mb-12 flex items-center justify-between">
          <Logo />
          <a href="/login" className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-200 transition hover:border-amber-300/50">
            Ya tengo cuenta
          </a>
        </header>
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.28em] text-amber-300">Registro público</p>
            <h1 className="text-4xl font-semibold text-white sm:text-5xl">Crea tu cuenta y comienza a presupuestar.</h1>
            <p className="max-w-xl text-slate-300">Regístrate con tu correo electrónico y accede a una capa inicial de GoCash preparada para modo seed o Supabase en producción.</p>
          </div>
          <AuthForm mode="register" />
        </div>
      </div>
    </main>
  );
}
