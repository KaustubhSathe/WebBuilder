import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    const code = requestUrl.searchParams.get('code');

    if (code) {
      const cookieStore = cookies();
      const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
      
      const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error || !session) {
        console.error('Auth error:', error);
        return NextResponse.redirect(new URL('/', requestUrl.origin));
      }

      // Set cookie with the session
      const response = NextResponse.redirect(new URL('/dashboard', requestUrl.origin));
      response.cookies.set('supabase-auth-token', JSON.stringify(session));
      
      return response;
    }

    return NextResponse.redirect(new URL('/', requestUrl.origin));
  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
} 