import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/auth";

export async function GET() {
  const token = cookies().get("gocash_token")?.value;
  if (!token) {
    return NextResponse.json({ success: false, error: "No autorizado." }, { status: 401 });
  }

  const payload = await verifyAuthToken(token);
  if (!payload) {
    return NextResponse.json({ success: false, error: "Token inválido." }, { status: 401 });
  }

  return NextResponse.json({
    success: true,
    data: {
      id: payload.sub,
      name: payload.name,
      email: payload.email,
      role: payload.role,
    },
  });
}
