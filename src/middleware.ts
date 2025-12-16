import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Define protected routes that require authentication
  const isAdminRoute = pathname.startsWith("/admin");
  const isSignInPage = pathname === "/admin/signin";
  const isErrorPage = pathname === "/admin/error";

  // Allow access to signin and error pages without authentication
  if (isSignInPage || isErrorPage) {
    return NextResponse.next();
  }

  // Check if the user is authenticated for admin routes
  if (isAdminRoute) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });

    // If not authenticated, redirect to sign-in page
    if (!token) {
      const signInUrl = new URL("/admin/signin", request.url);
      signInUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(signInUrl);
    }

    // Optional: Check if the user's email is in the allowed list
    const allowedEmails = process.env.ADMIN_EMAILS?.split(",") || [];
    if (token.email && !allowedEmails.includes(token.email as string)) {
      // User is authenticated but not authorized - redirect to error page
      const errorUrl = new URL("/admin/error?error=AccessDenied", request.url);
      return NextResponse.redirect(errorUrl);
    }
  }

  return NextResponse.next();
}

// Configure which routes the middleware should run on
export const config = {
  matcher: [
    /*
     * Match all admin routes except:
     * - api routes (handled separately)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/admin/:path*",
  ],
};
