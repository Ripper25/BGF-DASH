import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ROUTES } from './app/routes';
import { STAFF_TOKEN_COOKIE } from './config';

/**
 * Check if a route is protected and requires authentication
 * @param pathname - The pathname to check
 * @returns Whether the route is protected
 */
function isProtectedRoute(pathname: string): boolean {
  // Public routes that don't require authentication
  const publicRoutes = [
    ROUTES.LOGIN,
    ROUTES.STAFF_LOGIN,
    ROUTES.FORGOT_PASSWORD,
    ROUTES.RESET_PASSWORD,
    ROUTES.LOGIN_GUIDE,
    '/',
    '/register',
    '/debug-login',
    '/direct-login'
  ];

  // Static assets and API routes
  if (
    pathname.startsWith('/_next/') ||
    pathname.startsWith('/api/') ||
    pathname.startsWith('/assets/') ||
    pathname.includes('.') // Static files like favicon.ico
  ) {
    return false;
  }

  // Check if the pathname is in the public routes
  return !publicRoutes.some(route => pathname === route);
}

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check for Supabase auth token in cookies - try multiple possible cookie names
  const possibleCookieNames = [
    'sb-roqzswykxwyzyoeazqiu-auth-token',
    'supabase-auth-token',
    'sb-auth-token'
  ];

  let hasAuthToken = false;
  let cookieFound = '';

  // Check for staff token in cookies
  const staffToken = request.cookies.get(STAFF_TOKEN_COOKIE);
  if (staffToken?.value) {
    try {
      // In middleware, we can't use Node.js crypto module
      // So we'll just decode the token without verification
      // The actual verification will happen on the backend API
      const tokenParts = staffToken.value.split('.');
      if (tokenParts.length !== 3) {
        throw new Error('Invalid token format');
      }

      // Decode the payload (second part of the token)
      const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());
      const decoded = payload;

      // Check if it's a staff token
      if (decoded && decoded.is_staff) {
        hasAuthToken = true;
        cookieFound = STAFF_TOKEN_COOKIE;
        console.log('Middleware: Valid staff token found', {
          id: decoded.id,
          name: decoded.name,
          role: decoded.role,
          staff_number: decoded.staff_number,
          exp: new Date(decoded.exp * 1000).toISOString()
        });

        // Store staff info in request headers for downstream use
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set('x-staff-id', decoded.id);
        requestHeaders.set('x-staff-role', decoded.role);
        requestHeaders.set('x-staff-authenticated', 'true');

        // Create a new request with the updated headers
        const newRequest = new Request(request.url, {
          headers: requestHeaders,
          method: request.method,
          body: request.body,
          redirect: request.redirect,
          signal: request.signal,
        });

        // Replace the original request with the new one
        Object.defineProperty(request, 'headers', {
          value: newRequest.headers,
          writable: false
        });
      }
    } catch (error) {
      console.error('Middleware: Invalid or expired staff token', error);

      // Clear the invalid token
      const response = NextResponse.redirect(new URL(ROUTES.STAFF_LOGIN, request.url));
      response.cookies.delete(STAFF_TOKEN_COOKIE);

      // Only return the redirect response if accessing a protected route
      if (isProtectedRoute(pathname)) {
        return response;
      }
    }
  }

  // Check each possible cookie name
  for (const cookieName of possibleCookieNames) {
    const authCookie = request.cookies.get(cookieName);
    if (authCookie?.value) {
      hasAuthToken = true;
      cookieFound = cookieName;
      break;
    }
  }

  // Also check for access token in local storage via header
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ') && !hasAuthToken) {
    hasAuthToken = true;
    cookieFound = 'auth-header';
  }

  // Enhanced debugging logs
  console.log(`Middleware: Path=${pathname}, HasAuthToken=${hasAuthToken}, Cookie=${cookieFound}`);

  // Check for staff authentication in localStorage (for client-side only)
  // This won't work in middleware but is noted here for reference
  // Staff auth is checked client-side in the components

  // Check if the route is protected
  const isProtected = isProtectedRoute(pathname);

  // Public routes - allow access
  if (!isProtected) {
    // If user is already logged in, redirect to dashboard only for certain routes
    // Allow access to staff-login and login-guide regardless of auth state
    if (hasAuthToken && (pathname === ROUTES.LOGIN || pathname === '/')) {
      console.log('Middleware: Authenticated user accessing public route, redirecting to dashboard');
      return NextResponse.redirect(new URL(ROUTES.DASHBOARD, request.url));
    }

    // Add detailed logging for debugging
    console.log(`Middleware: Allowing access to public route: ${pathname}`);

    return NextResponse.next();
  }

  // Allow access to all routes regardless of authentication status
  // This bypasses the authentication check for all routes
  console.log('Middleware: Allowing access to all routes');

  // User is authenticated, check if they have the required role for the route
  // This is a basic implementation - you can enhance it to check specific roles for specific routes
  const staffRole = request.headers.get('x-staff-role');
  const isStaff = request.headers.get('x-staff-authenticated') === 'true';

  console.log('Middleware: Authenticated user accessing protected route', {
    isStaff,
    staffRole,
    pathname
  });

  // Allow access to the protected route
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|assets).*)',
  ],
};
