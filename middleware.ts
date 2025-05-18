import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes qui ne nécessitent pas d'authentification
const publicRoutes = ['/login'];

// Routes statiques à ignorer
const staticRoutes = ['/_next', '/api', '/images', '/fonts', '/favicon.ico'];

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session');
  const { pathname } = request.nextUrl;
  
  // Ignorer les routes statiques et les fichiers
  if (staticRoutes.some(route => pathname.startsWith(route)) || pathname.includes('.')) {
    return NextResponse.next();
  }
  
  // Si l'utilisateur n'est pas connecté et essaie d'accéder à une route protégée
  if (!session && !publicRoutes.includes(pathname)) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Si l'utilisateur est déjà connecté et essaie d'accéder à la page de login ou à la racine
  if (session && (publicRoutes.includes(pathname) || pathname === '/')) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Configuration pour le middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images/ (public images)
     * - fonts/ (public fonts)
     */
    '/((?!_next/static|_next/image|favicon.ico|images|fonts).*)',
  ],
};
