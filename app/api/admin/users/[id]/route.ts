import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAuthPayload } from "@/lib/withAuth";
import { hasRole } from "@/lib/withRole";
import { UpdateUserSchema } from "@/lib/schemas";
import { getUserById, updateUser } from "@/lib/dataService";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const auth = await getAuthPayload({ cookies: cookies() } as any);
  if (!auth || !hasRole(auth, ["superadmin"])) {
    return NextResponse.json({ success: false, error: "Sin permisos." }, { status: 403 });
  }

  const user = await getUserById(params.id);
  if (!user) {
    return NextResponse.json({ success: false, error: "Usuario no encontrado." }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: user, timestamp: new Date().toISOString() });
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const auth = await getAuthPayload({ cookies: cookies() } as any);
  if (!auth || !hasRole(auth, ["superadmin"])) {
    return NextResponse.json({ success: false, error: "Sin permisos." }, { status: 403 });
  }

  const body = await request.json();
  const parsed = UpdateUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.errors[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  try {
    const result = await updateUser(params.id, parsed.data);
    return NextResponse.json({ success: true, data: result, timestamp: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "No se pudo actualizar el usuario." }, { status: 400 });
  }
}
