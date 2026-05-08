import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAuthPayload } from "@/lib/withAuth";
import { UpdateUserSchema } from "@/lib/schemas";
import { getUserById, updateUser } from "@/lib/dataService";

export async function GET() {
  const auth = await getAuthPayload({ cookies: cookies() } as any);
  if (!auth) {
    return NextResponse.json({ success: false, error: "No autorizado." }, { status: 401 });
  }

  const user = await getUserById(auth.sub);
  if (!user) {
    return NextResponse.json({ success: false, error: "Usuario no encontrado." }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: user });
}

export async function PUT(request: Request) {
  const auth = await getAuthPayload({ cookies: cookies() } as any);
  if (!auth) {
    return NextResponse.json({ success: false, error: "No autorizado." }, { status: 401 });
  }

  const body = await request.json();
  const parsed = UpdateUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.errors[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  try {
    const user = await updateUser(auth.sub, parsed.data);
    return NextResponse.json({ success: true, data: user });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "No se pudo actualizar el perfil." }, { status: 400 });
  }
}
