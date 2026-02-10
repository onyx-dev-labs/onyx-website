import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { Database } from "@/types/database.types";

export default async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  );

  // refreshing the auth token
  const { data: { user } } = await supabase.auth.getUser();

  // PROTECTED ROUTE LOGIC
  // Only redirect if accessing admin routes and not authenticated
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    // Role-Based Access Control (RBAC)
    // Check if user has 'admin' or 'member' role for general admin access
    // Viewers might be restricted to read-only paths if we want granular control
    const role = user.user_metadata?.role;
    
    // Debug logging for RBAC issues
    if (!role) {
      console.log(`[Proxy] Access denied to /admin: User ${user.email} has no role assigned.`);
    } else if (!['admin', 'member', 'viewer'].includes(role)) {
      console.log(`[Proxy] Access denied to /admin: User ${user.email} has invalid role '${role}'.`);
    }

    // Allow 'admin', 'member', and 'viewer' to access /admin, but specific actions are protected server-side.
    // However, if a user has NO role (e.g. random signup if enabled), deny access.
    const allowedRoles = ['admin', 'member', 'viewer'];
    if (!role || !allowedRoles.includes(role)) {
       // If they are logged in but don't have a valid team role, redirect to home or unauthorized page
       // For now, redirect to home to prevent access
       return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
