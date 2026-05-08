import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAuthPayload } from "@/lib/withAuth";
import { ContributeGoalSchema } from "@/lib/schemas";
import { contributeToGoal } from "@/lib/dataService";

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const auth = await getAuthPayload({ cookies: cookies() } as any);
  if (!auth) {
    return NextResponse.json({ success: false, error: "No autorizado." }, { status: 401 });
  }

  const body = await request.json();
  const parsed = ContributeGoalSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.errors[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  try {
    const goal = await contributeToGoal(params.id, auth.sub, parsed.data);
    return NextResponse.json({ success: true, data: goal, timestamp: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "No se pudo contribuir a la meta." }, { status: 400 });
  }
}
