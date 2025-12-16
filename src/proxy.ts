import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// ✅ Rename "middleware" → "proxy"
export async function proxy(request: NextRequest) {
  const isMaintenanceMode = process.env.MAINTENANCE_MODE === "true";

  // 🧩 1️⃣ Handle maintenance mode
  if (
    isMaintenanceMode &&
    process.env.NODE_ENV === "production" &&
    !request.nextUrl.pathname.startsWith("/api") &&
    !request.nextUrl.pathname.startsWith("/_next") &&
    request.nextUrl.pathname !== "/maintenance"
  ) {
    return NextResponse.rewrite(new URL("/maintenance", request.url));
  }

  // 🧩 2️⃣ Protect /admin routes (except signin)
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  if (isAdminRoute && !request.nextUrl.pathname.startsWith("/admin/signin")) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      const signinUrl = new URL("/admin/signin", request.url);
      signinUrl.searchParams.set("callbackUrl", request.url);
      return NextResponse.redirect(signinUrl);
    }
  }

  // 🧩 3️⃣ Default: Continue normally
  return NextResponse.next();
}

// ✅ Keep same matcher config
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
