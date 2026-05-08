import { jwtVerify, SignJWT } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "gocash-dev-secret-2026";
const JWT_ALGORITHM = "HS256";
const JWT_EXPIRATION_SECONDS = 60 * 60 * 24 * 7; // 7 days

export type AuthTokenPayload = {
  sub: string;
  email: string;
  name: string;
  role: "usuario" | "superadmin";
};

export async function createAuthToken(payload: AuthTokenPayload): Promise<string> {
  const encoder = new TextEncoder();
  return await new SignJWT({
    email: payload.email,
    name: payload.name,
    role: payload.role,
  })
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${JWT_EXPIRATION_SECONDS}s`)
    .sign(encoder.encode(JWT_SECRET));
}

export async function verifyAuthToken(token: string): Promise<AuthTokenPayload | null> {
  try {
    const encoder = new TextEncoder();
    const { payload } = await jwtVerify(token, encoder.encode(JWT_SECRET));

    if (
      typeof payload.sub !== "string" ||
      typeof payload.email !== "string" ||
      typeof payload.name !== "string" ||
      typeof payload.role !== "string"
    ) {
      return null;
    }

    return {
      sub: payload.sub,
      email: payload.email,
      name: payload.name,
      role: payload.role as "usuario" | "superadmin",
    };
  } catch (error) {
    return null;
  }
}
