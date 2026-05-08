import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getAuthPayload } from "@/lib/withAuth";
import { hasRole } from "@/lib/withRole";
import { readAuditEntries } from "@/lib/blobAudit";

export async function GET() {
  const auth = await getAuthPayload({ cookies: cookies() } as any);
  if (!auth || !hasRole(auth, ["superadmin"])) {
    return NextResponse.json({ success: false, error: "Sin permisos." }, { status: 403 });
  }

  const entries = readAuditEntries();
  return NextResponse.json({ success: true, data: entries, timestamp: new Date().toISOString() });
}
