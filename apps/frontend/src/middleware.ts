import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

async function verifyToken(token: string): Promise<boolean> {
  if (!token) return false;
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    await jwtVerify(token, secret);
    return true;
  } catch (error) {
    return false;
  }
}

const protectedRoutes = ['/dashboard', '/orders', '/profile', '/admin', '/checkout'];
const publicRoutes = ['/login', '/register'];

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.some((prefix) => path.startsWith(prefix));
  const isPublicRoute = publicRoutes.includes(path);

  const accessToken = req.cookies.get('access_token')?.value;

  const isAccessTokenValid = await verifyToken(accessToken || '');

  // PROTECTED ROUTES - require authentication
  if (isProtectedRoute) {
    if (isAccessTokenValid) {
      return NextResponse.next();
    }

    // No valid token - redirect to login
    const loginUrl = new URL('/login', req.nextUrl.origin);
    loginUrl.searchParams.set('redirect_to', path);
    return NextResponse.redirect(loginUrl);
  }

  // PUBLIC ROUTES - redirect to menu if already authenticated
  if (isPublicRoute && isAccessTokenValid) {
    return NextResponse.redirect(new URL('/menu', req.nextUrl.origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
