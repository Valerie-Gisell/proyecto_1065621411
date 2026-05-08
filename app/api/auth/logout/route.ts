import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ success: true, data: { message: "Sesión finalizada." } });
  response.cookies.set("gocash_token", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  });
  return response;
}
