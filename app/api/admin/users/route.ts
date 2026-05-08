import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAuthPayload } from "@/lib/withAuth";
import { hasRole } from "@/lib/withRole";
import { CreateAdminUserSchema } from "@/lib/schemas";
import { createUser, listUsers } from "@/lib/dataService";

function generateTemporaryPassword() {
  return Math.random().toString(36).slice(-10) + "A1!";
}

export async function GET() {
  const auth = await getAuthPayload({ cookies: cookies() } as any);
  if (!auth || !hasRole(auth, ["superadmin"])) {
    return NextResponse.json({ success: false, error: "Sin permisos." }, { status: 403 });
  }

  const users = await listUsers();
  return NextResponse.json({ success: true, data: users, timestamp: new Date().toISOString() });
}

export async function POST(request: Request) {
  const auth = await getAuthPayload({ cookies: cookies() } as any);
  if (!auth || !hasRole(auth, ["superadmin"])) {
    return NextResponse.json({ success: false, error: "Sin permisos." }, { status: 403 });
  }

  const body = await request.json();
  const parsed = CreateAdminUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.errors[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  try {
    const password = generateTemporaryPassword();
    const user = await createUser({
      name: parsed.data.name,
      email: parsed.data.email,
      currency: parsed.data.currency,
      role: parsed.data.role ?? "usuario",
      password,
    });
    return NextResponse.json({ success: true, data: { user, password }, timestamp: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "No se pudo crear el usuario." }, { status: 400 });
  }
}
