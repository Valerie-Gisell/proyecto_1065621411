import { NextResponse } from "next/server";
import { createUser } from "@/lib/dataService";
import { createAuthToken } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json();

  const name = typeof body.name === "string" ? body.name.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!name || !email || !password) {
    return NextResponse.json(
      { success: false, error: "Nombre, correo y contraseña son requeridos." },
      { status: 400 }
    );
  }

  try {
    const user = await createUser({ name, email, password });
    const token = await createAuthToken({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    const response = NextResponse.json({ success: true, data: { user } });
    response.cookies.set("gocash_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Error en el registro." },
      { status: 400 }
    );
  }
}
