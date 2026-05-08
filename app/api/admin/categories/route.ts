import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuthPayload } from "@/lib/withAuth";
import { hasRole } from "@/lib/withRole";
import { CreateCategorySchema } from "@/lib/schemas";
import { createGlobalCategory, getGlobalCategories } from "@/lib/dataService";

export async function GET() {
  const token = cookies().get("gocash_token")?.value;
  if (!token) {
    return NextResponse.json({ success: false, error: "No autorizado." }, { status: 401 });
  }

  const auth = await getAuthPayload({ cookies: cookies() } as any);
  if (!auth || !hasRole(auth, ["superadmin"])) {
    return NextResponse.json({ success: false, error: "Sin permisos." }, { status: 403 });
  }

  const categories = await getGlobalCategories();
  return NextResponse.json({ success: true, data: categories, timestamp: new Date().toISOString() });
}

export async function POST(request: Request) {
  const token = cookies().get("gocash_token")?.value;
  if (!token) {
    return NextResponse.json({ success: false, error: "No autorizado." }, { status: 401 });
  }

  const auth = await getAuthPayload({ cookies: cookies() } as any);
  if (!auth || !hasRole(auth, ["superadmin"])) {
    return NextResponse.json({ success: false, error: "Sin permisos." }, { status: 403 });
  }

  const body = await request.json();
  const parsed = CreateCategorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.errors[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  try {
    const category = await createGlobalCategory(parsed.data);
    return NextResponse.json({ success: true, data: category, timestamp: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "No se pudo crear la categoría global." }, { status: 400 });
  }
}
