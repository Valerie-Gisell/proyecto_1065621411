import { getAuthPayload } from "@/lib/withAuth";
import { cookies } from "next/headers";
import { getCategories } from "@/lib/dataService";
import CategoryForm from "@/components/ui/CategoryForm";

export default async function CategoriesPage() {
  const token = cookies().get("gocash_token")?.value;
  if (!token) {
    return <div className="p-6 text-white">No autorizado.</div>;
  }

  const auth = await getAuthPayload({ cookies: cookies() } as any);
  if (!auth) {
    return <div className="p-6 text-white">Sesión inválida.</div>;
  }

  const categories = await getCategories(auth.sub);

  return (
    <div className="space-y-8 p-6">
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-soft backdrop-blur-xl">
        <h1 className="text-2xl font-semibold text-white">Mis categorías</h1>
        <p className="mt-2 text-sm text-slate-400">Administra tus categorías de gasto e ingreso.</p>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4 rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-soft backdrop-blur-xl">
          <h2 className="text-xl font-semibold text-white">Catálogo de categorías</h2>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {categories.map((category) => (
              <div key={category.id} className="rounded-3xl border border-white/10 bg-slate-900/80 p-4 shadow-inner">
                <div className="flex items-center gap-3">
                  <div className="rounded-3xl bg-white/10 p-3 text-xl" style={{ backgroundColor: category.color }}>
                    {category.emoji}
                  </div>
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-slate-400">{category.type}</p>
                    <p className="text-xl font-semibold text-white">{category.name}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <CategoryForm />
      </div>
    </div>
  );
}
