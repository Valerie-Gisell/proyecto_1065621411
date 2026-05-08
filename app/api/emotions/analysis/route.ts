import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuthPayload } from "@/lib/withAuth";
import { getEmotionAnalysis } from "@/lib/dataService";

export async function GET() {
  const token = cookies().get("gocash_token")?.value;
  if (!token) {
    return NextResponse.json({ success: false, error: "No autorizado." }, { status: 401 });
  }

  const auth = await getAuthPayload({ cookies: cookies() } as any);
  if (!auth) {
    return NextResponse.json({ success: false, error: "Token inválido." }, { status: 401 });
  }

  const analysis = await getEmotionAnalysis(auth.sub);
  return NextResponse.json({ success: true, data: analysis, timestamp: new Date().toISOString() });
}
