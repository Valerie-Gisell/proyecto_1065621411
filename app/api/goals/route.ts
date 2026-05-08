import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAuthPayload } from "@/lib/withAuth";
import { CreateGoalSchema } from "@/lib/schemas";
import { createGoal, getGoals } from "@/lib/dataService";

export async function GET() {
  const auth = await getAuthPayload({ cookies: cookies() } as any);
  if (!auth) {
    return NextResponse.json({ success: false, error: "No autorizado." }, { status: 401 });
  }

  const goals = await getGoals(auth.sub);
  return NextResponse.json({ success: true, data: goals, timestamp: new Date().toISOString() });
}

export async function POST(request: Request) {
  const auth = await getAuthPayload({ cookies: cookies() } as any);
  if (!auth) {
    return NextResponse.json({ success: false, error: "No autorizado." }, { status: 401 });
  }

  const body = await request.json();
  const parsed = CreateGoalSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.errors[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  try {
    const goal = await createGoal(auth.sub, parsed.data);
    return NextResponse.json({ success: true, data: goal, timestamp: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "No se pudo crear la meta." }, { status: 400 });
  }
}
