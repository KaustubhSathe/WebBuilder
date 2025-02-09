import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Refresh session if expired - required for Server Components
  const { data: { session }, error } = await supabase.auth.getSession();

  // Allow access to auth callback route
  if (req.nextUrl.pathname.startsWith('/auth/callback')) {
    return res;
  }

  // If user is not signed in and trying to access protected routes, redirect to /
  if (!session && (req.nextUrl.pathname.startsWith('/builder') || req.nextUrl.pathname.startsWith('/dashboard'))) {
    const redirectUrl = new URL('/', req.url);
    return NextResponse.redirect(redirectUrl);
  }

  // If user is signed in and on the login page, redirect to /dashboard
  if (session && req.nextUrl.pathname === '/') {
    const redirectUrl = new URL('/dashboard', req.url);
    return NextResponse.redirect(redirectUrl);
  }

  // Set cookie for supabase auth
  return res;
}

export const config = {
  matcher: [
    '/',
    '/builder',
    '/dashboard',
    '/auth/callback'
  ],
}; 