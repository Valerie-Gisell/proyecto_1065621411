"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900/90 px-5 py-3 text-sm font-semibold text-slate-100 transition hover:border-emerald-400/50 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {loading ? "Cerrando sesión..." : "Cerrar sesión"}
    </button>
  );
}
