import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAuthPayload } from "@/lib/withAuth";
import { UpdateGoalSchema } from "@/lib/schemas";
import { deleteGoal, getGoalById, updateGoal } from "@/lib/dataService";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const auth = await getAuthPayload({ cookies: cookies() } as any);
  if (!auth) {
    return NextResponse.json({ success: false, error: "No autorizado." }, { status: 401 });
  }

  const goal = await getGoalById(params.id, auth.sub);
  if (!goal) {
    return NextResponse.json({ success: false, error: "Meta no encontrada." }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: goal, timestamp: new Date().toISOString() });
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const auth = await getAuthPayload({ cookies: cookies() } as any);
  if (!auth) {
    return NextResponse.json({ success: false, error: "No autorizado." }, { status: 401 });
  }

  const body = await request.json();
  const parsed = UpdateGoalSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ success: false, error: parsed.error.errors[0]?.message ?? "Datos inválidos." }, { status: 400 });
  }

  try {
    const goal = await updateGoal(params.id, auth.sub, parsed.data);
    return NextResponse.json({ success: true, data: goal, timestamp: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "No se pudo actualizar la meta." }, { status: 400 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const auth = await getAuthPayload({ cookies: cookies() } as any);
  if (!auth) {
    return NextResponse.json({ success: false, error: "No autorizado." }, { status: 401 });
  }

  try {
    await deleteGoal(params.id, auth.sub);
    return NextResponse.json({ success: true, data: { id: params.id }, timestamp: new Date().toISOString() });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : "No se pudo eliminar la meta." }, { status: 400 });
  }
}
