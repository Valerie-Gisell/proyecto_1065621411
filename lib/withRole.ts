import type { AuthTokenPayload } from "@/lib/auth";

export function hasRole(payload: AuthTokenPayload | null, allowedRoles: Array<AuthTokenPayload["role"]>) {
  if (!payload) return false;
  return allowedRoles.includes(payload.role);
}
