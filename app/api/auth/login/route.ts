import { NextResponse } from "next/server";
import { authenticateUser } from "@/lib/dataService";
import { createAuthToken } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json();

  const email = typeof body.email === "string" ? body.email.trim() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!email || !password) {
    return NextResponse.json(
      { success: false, error: "Correo electrónico y contraseña son requeridos." },
      { status: 400 }
    );
  }

  const user = await authenticateUser(email, password);
  if (!user) {
    return NextResponse.json(
      { success: false, error: "Credenciales inválidas." },
      { status: 401 }
    );
  }

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
}
