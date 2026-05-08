import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuthPayload } from "@/lib/withAuth";
import { UpdateCategorySchema } from "@/lib/schemas";
import { deleteCategory, updateCategory } from "@/lib/dataService";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const token = cookies().get("gocash_token")?.value;
  if (!token) {
    return NextResponse.json({ success: false, error: "No autorizado." }, { status: 401 });
  }

  const auth = await getAuthPayload({ cookies: cookies() } as any);
  if (!auth) {
    return NextResponse.json({ success: false, error: "Token inválido." }, { status: 401 });
  }

  const body = await request.json();
  const parsed = UpdateCategorySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.errors[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  try {
    const category = await updateCategory(params.id, auth.sub, parsed.data);
    return NextResponse.json({ success: true, data: category, timestamp: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "No se pudo actualizar la categoría." }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const token = cookies().get("gocash_token")?.value;
  if (!token) {
    return NextResponse.json({ success: false, error: "No autorizado." }, { status: 401 });
  }

  const auth = await getAuthPayload({ cookies: cookies() } as any);
  if (!auth) {
    return NextResponse.json({ success: false, error: "Token inválido." }, { status: 401 });
  }

  try {
    await deleteCategory(params.id, auth.sub);
    return NextResponse.json({ success: true, data: { id: params.id }, timestamp: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "No se pudo eliminar la categoría." }, { status: 400 });
  }
}
