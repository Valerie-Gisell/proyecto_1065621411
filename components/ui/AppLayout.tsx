"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navItems = [
  { label: "Inicio", href: "/dashboard", icon: "🏠" },
  { label: "Gastos", href: "/transactions", icon: "💸" },
  { label: "Nueva", href: "/transactions/new", icon: "+" },
  { label: "Metas", href: "/goals", icon: "🎯" },
  { label: "Reportes", href: "/reports", icon: "📊" },
  { label: "Emociones", href: "/emotions", icon: "😊" },
  { label: "Perfil", href: "/profile", icon: "👤" },
];

export default function AppLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const active = (href: string) => pathname === href;

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.14),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(251,113,133,0.12),_transparent_26%),linear-gradient(180deg,#020617,_#08111f)] text-white">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid flex-1 gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="hidden rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-soft backdrop-blur-xl lg:block">
            <div className="space-y-8">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-emerald-300">GoCash</p>
                <p className="mt-3 text-3xl font-semibold text-white">Navegación</p>
              </div>
              <nav className="space-y-3">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 rounded-3xl px-4 py-3 text-sm font-semibold transition ${
                      active(item.href)
                        ? "bg-emerald-400/10 text-emerald-300 shadow-soft"
                        : "border border-white/5 text-slate-300 hover:bg-white/5"
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </nav>
            </div>
          </aside>

          <main className="flex flex-1 flex-col gap-6">
            {children}
          </main>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 bg-slate-950/95 px-4 py-3 shadow-soft backdrop-blur-xl lg:hidden">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-2">
          {navItems.map((item, index) => {
            if (index === 2) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400 text-slate-950 shadow-soft"
                >
                  {item.icon}
                </Link>
              );
            }
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex h-14 min-w-[3.5rem] items-center justify-center rounded-3xl text-xs font-semibold transition ${
                  active(item.href)
                    ? "bg-emerald-400/10 text-emerald-300"
                    : "text-slate-400 hover:bg-white/5"
                }`}
              >
                {item.icon}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
