"use client";

import { useEffect, useState } from "react";
import AppLayout from "@/components/ui/AppLayout";

interface ProfileData {
  id: string;
  name: string;
  email: string;
  role: string;
  currency: string;
  is_active: boolean;
  must_change_password: boolean;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", currency: "" });
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    setLoading(true);
    const response = await fetch("/api/profile");
    const payload = await response.json();
    if (payload.success) {
      setProfile(payload.data);
      setForm({ name: payload.data.name, currency: payload.data.currency || "COP" });
    } else {
      setError(payload.error || "No se pudo obtener el perfil.");
    }
    setLoading(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    const payloadData: Record<string, unknown> = { name: form.name, currency: form.currency };
    if (password) {
      payloadData.password = password;
    }

    const response = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payloadData),
    });
    const payload = await response.json();
    if (payload.success) {
      setProfile(payload.data);
      setSuccessMessage("Perfil actualizado correctamente.");
      setPassword("");
    } else {
      setError(payload.error || "No se pudo actualizar el perfil.");
    }
  }

  return (
    <AppLayout>
      <div className="space-y-8 pb-32">
        <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-soft backdrop-blur-xl">
          <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">Perfil</p>
          <h1 className="mt-4 text-4xl font-semibold text-white">Mi perfil</h1>
          <p className="mt-4 text-slate-300">Actualiza tu información personal y cambia tu contraseña de forma segura.</p>
        </div>

        <section className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-soft backdrop-blur-xl">
          {loading ? (
            <p className="text-slate-300">Cargando perfil...</p>
          ) : profile ? (
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <div className="space-y-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-emerald-300">Información</p>
                  <h2 className="mt-2 text-2xl font-semibold text-white">Datos de tu cuenta</h2>
                </div>
                <div className="rounded-3xl border border-slate-800/80 bg-slate-900/80 p-6">
                  <p className="text-sm text-slate-400">Correo</p>
                  <p className="mt-1 text-lg font-medium text-white">{profile.email}</p>
                  <p className="mt-4 text-sm text-slate-400">Rol</p>
                  <p className="mt-1 text-lg font-medium text-white">{profile.role}</p>
                  <p className="mt-4 text-sm text-slate-400">Estado</p>
                  <p className="mt-1 text-lg font-medium text-white">{profile.is_active ? "Activo" : "Inactivo"}</p>
                </div>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm text-slate-300">Nombre</label>
                  <input
                    className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-emerald-300"
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300">Moneda preferida</label>
                  <input
                    className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-emerald-300"
                    value={form.currency}
                    onChange={(event) => setForm({ ...form, currency: event.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300">Nueva contraseña</label>
                  <input
                    type="password"
                    className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950/90 px-4 py-3 text-white outline-none transition focus:border-emerald-300"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Dejar en blanco para mantener la contraseña actual"
                  />
                </div>
                <button className="inline-flex items-center justify-center rounded-3xl bg-emerald-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300">
                  Guardar cambios
                </button>
                {error ? <p className="text-sm text-rose-400">{error}</p> : null}
                {successMessage ? <p className="text-sm text-emerald-300">{successMessage}</p> : null}
              </form>
            </div>
          ) : (
            <p className="text-slate-300">No se encontró información de usuario.</p>
          )}
        </section>
      </div>
    </AppLayout>
  );
}
