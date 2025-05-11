import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const isMaintenanceMode = process.env.MAINTENANCE_MODE === "true";

  // Skip maintenance mode for non-production environments or specific routes
  if (
    !isMaintenanceMode ||
    process.env.NODE_ENV !== "production" ||
    request.nextUrl.pathname.startsWith("/api") || // Allow API routes
    request.nextUrl.pathname.startsWith("/_next") || // Allow Next.js assets
    request.nextUrl.pathname === "/maintenance" // Allow maintenance page
  ) {
    return NextResponse.next();
  }

  // Redirect all other requests to the maintenance page
  return NextResponse.rewrite(new URL("/maintenance", request.url));
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"], // Apply to all routes except static assets
};