import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuthPayload } from "@/lib/withAuth";
import { CreateCategorySchema } from "@/lib/schemas";
import { createCategory, getCategories } from "@/lib/dataService";

export async function GET() {
  const token = cookies().get("gocash_token")?.value;
  if (!token) {
    return NextResponse.json({ success: false, error: "No autorizado." }, { status: 401 });
  }

  const auth = await getAuthPayload({ cookies: cookies() } as any);
  if (!auth) {
    return NextResponse.json({ success: false, error: "Token inválido." }, { status: 401 });
  }

  const categories = await getCategories(auth.sub);
  return NextResponse.json({ success: true, data: categories, timestamp: new Date().toISOString() });
}

export async function POST(request: Request) {
  const token = cookies().get("gocash_token")?.value;
  if (!token) {
    return NextResponse.json({ success: false, error: "No autorizado." }, { status: 401 });
  }

  const auth = await getAuthPayload({ cookies: cookies() } as any);
  if (!auth) {
    return NextResponse.json({ success: false, error: "Token inválido." }, { status: 401 });
  }

  const body = await request.json();
  const parsed = CreateCategorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.errors[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  try {
    const category = await createCategory(auth.sub, parsed.data);
    return NextResponse.json({ success: true, data: category, timestamp: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "No se pudo crear la categoría." }, { status: 400 });
  }
}
