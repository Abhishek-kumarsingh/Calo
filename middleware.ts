import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the path is for taking an interview
  const isInterviewTakePath = pathname.match(/^\/dashboard\/interviews\/(.+)\/take$/);

  // Check if the path is for interview API endpoints related to taking an interview
  const isInterviewTakeApi = pathname.match(/^\/api\/interviews\/(.+)\/(responses|questions)$/);

  // Check if it's the main interview API endpoint
  const isInterviewMainApi = pathname.match(/^\/api\/interviews\/(.+)$/);

  // Extract interview ID if it's a take path
  const takePathMatch = isInterviewTakePath ? pathname.match(/^\/dashboard\/interviews\/(.+)\/take$/) : null;
  const interviewId = takePathMatch ? takePathMatch[1] : null;

  // If it's an interview take path or related API, allow access without authentication
  if (isInterviewTakePath || isInterviewTakeApi ||
      (isInterviewMainApi && request.headers.get('referer')?.includes('/take'))) {
    return NextResponse.next();
  }

  // Check if the path is an analytics API route
  const isAnalyticsApi = pathname.startsWith('/api/analytics');

  // Check if the path is an interview analysis API route
  const isInterviewAnalysisApi = pathname.match(/^\/api\/interviews\/(.+)\/analysis$/);

  // Check if the path is an admin route
  const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/api/admin') || pathname.startsWith('/dashboard/admin');

  // Check if the path is a protected route
  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/admin') ||
    (pathname.startsWith('/api/interviews') && !isAnalyticsApi && !isInterviewAnalysisApi) ||
    pathname.startsWith('/api/candidates') ||
    pathname.startsWith('/api/admin');

  // Check if the path is an auth route
  const isAuthRoute =
    pathname.startsWith('/auth/login') ||
    pathname.startsWith('/auth/register');

  // Get the token
  const token = await getToken({ req: request });

  console.log(`Middleware - Path: ${pathname}, Token:`, token ? `Found (role: ${token.role})` : 'Not found');

  // If the route is protected and the user is not authenticated, redirect to login
  if (isProtectedRoute && !token) {
    console.log(`Middleware - Redirecting unauthenticated user to login from ${pathname}`);
    const url = new URL('/auth/login', request.url);
    url.searchParams.set('callbackUrl', encodeURI(pathname));
    return NextResponse.redirect(url);
  }

  // If the user is authenticated and trying to access auth routes
  if (isAuthRoute && token) {
    // Redirect admins to admin dashboard, regular users to user dashboard
    if (token.role === 'admin') {
      console.log('Redirecting admin user to admin dashboard');
      return NextResponse.redirect(new URL('/admin', request.url));
    } else {
      console.log('Redirecting regular user to dashboard');
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // If the user is authenticated but not an admin and trying to access admin routes
  if (token && isAdminRoute && token.role !== 'admin') {
    const dashboardUrl = new URL('/dashboard', request.url);
    dashboardUrl.searchParams.set('message', 'You do not have administrator privileges');
    dashboardUrl.searchParams.set('error', 'insufficient_permissions');
    return NextResponse.redirect(dashboardUrl);
  }

  // Redirect admin users to admin dashboard if they try to access regular user pages
  // unless they explicitly bypass this with a query parameter
  if (token && token.role === 'admin' && pathname.startsWith('/dashboard')) {
    // Check if there's a specific parameter to bypass this redirect
    const params = request.nextUrl.searchParams;
    const bypassAdminRedirect = params.get('bypassAdminRedirect');

    if (!bypassAdminRedirect) {
      // Suggest the admin dashboard instead
      const adminUrl = new URL('/admin', request.url);
      adminUrl.searchParams.set('message', 'Redirected to admin dashboard');
      return NextResponse.redirect(adminUrl);
    }
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/api/interviews/:path*',
    '/api/analytics/:path*',
    '/api/candidates/:path*',
    '/api/admin/:path*',
    '/auth/login',
    '/auth/register',
  ],
};
