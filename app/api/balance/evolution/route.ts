import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuthPayload } from "@/lib/withAuth";
import { getDailyBalanceEvolution } from "@/lib/dataService";

export async function GET(request: Request) {
  const token = cookies().get("gocash_token")?.value;
  if (!token) {
    return NextResponse.json({ success: false, error: "No autorizado." }, { status: 401 });
  }

  const auth = await getAuthPayload({ cookies: cookies() } as any);
  if (!auth) {
    return NextResponse.json({ success: false, error: "Token inválido." }, { status: 401 });
  }

  const url = new URL(request.url);
  const year = Number(url.searchParams.get("year") ?? new Date().getUTCFullYear());
  const month = Number(url.searchParams.get("month") ?? new Date().getUTCMonth() + 1);

  const evolution = await getDailyBalanceEvolution(auth.sub, year, month);
  return NextResponse.json({ success: true, data: evolution, timestamp: new Date().toISOString() });
}
