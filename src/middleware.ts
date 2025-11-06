// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const isMaintenanceMode = process.env.MAINTENANCE_MODE === "true";

  // 1️⃣ Skip maintenance logic for system assets and API
  if (
    !isMaintenanceMode ||
    process.env.NODE_ENV !== "production" ||
    request.nextUrl.pathname.startsWith("/api") ||
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname === "/maintenance"
  ) {
    // Proceed to authentication check below
  } else {
    // If in maintenance mode, rewrite all pages to /maintenance
    return NextResponse.rewrite(new URL("/maintenance", request.url));
  }

  // 2️⃣ Protect /admin routes
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  if (isAdminRoute && !request.nextUrl.pathname.startsWith("/admin/signin")) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      const signinUrl = new URL("/admin/signin", request.url);
      // Preserve redirect back to original page
      signinUrl.searchParams.set("callbackUrl", request.url);
      return NextResponse.redirect(signinUrl);
    }
  }

  // 3️⃣ Default: continue normally
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
