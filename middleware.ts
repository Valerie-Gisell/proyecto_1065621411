import { NextResponse, type NextRequest } from "next/server";
import { getAuthPayload } from "@/lib/withAuth";

const PUBLIC_PATHS = ["/", "/login", "/register", "/favicon.ico", "/api/auth/login", "/api/auth/register"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(path + "/"))) {
    return NextResponse.next();
  }

  const authPayload = await getAuthPayload(request);
  if (!authPayload) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (pathname.startsWith("/admin") && authPayload.role !== "superadmin") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/transactions/:path*",
    "/goals/:path*",
    "/profile/:path*",
    "/admin/:path*",
    "/api/dashboard",
    "/api/categories/:path*",
    "/api/transactions/:path*",
    "/api/balance/:path*",
    "/api/emotions/:path*",
    "/api/admin/categories/:path*",
  ],
};
