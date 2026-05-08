import { getAuthPayload } from "@/lib/withAuth";
import { cookies } from "next/headers";
import { getGlobalCategories } from "@/lib/dataService";
import CategoryForm from "@/components/ui/CategoryForm";
import { hasRole } from "@/lib/withRole";

export default async function AdminCategoriesPage() {
  const auth = await getAuthPayload({ cookies: cookies() } as any);
  if (!auth || !hasRole(auth, ["superadmin"])) {
    return <div className="p-6 text-white">Acceso denegado.</div>;
  }

  const categories = await getGlobalCategories();

  return (
    <div className="space-y-8 p-6">
      <div className="rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-soft backdrop-blur-xl">
        <h1 className="text-2xl font-semibold text-white">Categorías globales</h1>
        <p className="mt-2 text-sm text-slate-400">Crea y gestiona las categorías disponibles para todos los usuarios.</p>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-4 rounded-[2rem] border border-white/10 bg-slate-950/80 p-8 shadow-soft backdrop-blur-xl">
          <h2 className="text-xl font-semibold text-white">Catálogo global</h2>
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

        <CategoryForm endpoint="/api/admin/categories" />
      </div>
    </div>
  );
}
