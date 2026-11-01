import { NextResponse } from "next/server";

/**
 * Liveness check for hosting health probes and uptime monitors.
 * Deliberately returns no environment or dependency details.
 */
export function GET() {
  return NextResponse.json({ status: "ok" }, { headers: { "Cache-Control": "no-store" } });
}
