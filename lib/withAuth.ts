import { verifyAuthToken } from "@/lib/auth";
import type { NextRequest } from "next/server";

export async function getAuthPayload(request: NextRequest) {
  const token = request.cookies.get("gocash_token")?.value;
  if (!token) return null;
  return await verifyAuthToken(token);
}
