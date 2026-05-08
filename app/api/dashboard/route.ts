import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyAuthToken } from "@/lib/auth";
import { getDashboardData } from "@/lib/dataService";

export async function GET() {
  const token = cookies().get("gocash_token")?.value;
  if (!token) {
    return NextResponse.json({ success: false, error: "No autorizado." }, { status: 401 });
  }

  const payload = await verifyAuthToken(token);
  if (!payload) {
    return NextResponse.json({ success: false, error: "Token inválido." }, { status: 401 });
  }

  const dashboardData = await getDashboardData(payload.sub);

  return NextResponse.json({
    success: true,
    data: {
      user: {
        id: payload.sub,
        name: payload.name,
        email: payload.email,
        role: payload.role,
      },
      dashboard: dashboardData,
    },
    timestamp: new Date().toISOString(),
  });
}
