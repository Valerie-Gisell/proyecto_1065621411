import { NextResponse } from "next/server";
import type { ApiResponse, HealthStatus } from "@/lib/types";

export function GET(): NextResponse<ApiResponse<HealthStatus>> {
  return NextResponse.json({
    success: true,
    data: {
      status: "ok",
      version: process.env.NEXT_PUBLIC_APP_VERSION ?? "unknown",
      environment: process.env.NODE_ENV,
    },
    timestamp: new Date().toISOString(),
  });
}
