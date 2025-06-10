import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes qui nécessitent une authentification
const protectedRoutes = [
  '/dashboard',
  '/profile',
  '/settings',
  '/admin',
  '/partenaires',
  '/employees',
  '/demandes',
];

// Routes accessibles uniquement aux administrateurs
const adminRoutes = [
  '/admin',
  '/partenaires/create',
  '/partenaires/edit',
];

// Routes accessibles uniquement aux RH
const rhRoutes = [
  '/employees/manage',
  '/demandes/approve',
];

// Routes publiques (pas besoin d'authentification)
const publicRoutes = [
  '/',
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/about',
  '/contact',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Vérifier si la route est protégée
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route));
  const isRHRoute = rhRoutes.some(route => pathname.startsWith(route));
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  
  // Si c'est une route publique, autoriser l'accès
  if (isPublicRoute) {
    return NextResponse.next();
  }
  
  // Récupérer le token d'authentification depuis les cookies
  const sessionCookie = request.cookies.get('session')?.value;
  
  // Si aucun cookie de session n'est trouvé et que la route est protégée
  if (!sessionCookie && isProtectedRoute) {
    // Rediriger vers la page de connexion
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  // Au lieu de vérifier le token ici, nous allons simplement vérifier sa présence
  // La vérification complète sera effectuée dans l'API route
  if (sessionCookie) {
    // Récupérer le rôle depuis les headers (si disponible)
    const userRole = request.headers.get('x-user-role') || '';
    
    // Vérifier les autorisations en fonction du rôle
    if (isAdminRoute && userRole !== 'admin') {
      // Rediriger vers le tableau de bord si l'utilisateur n'est pas admin
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    if (isRHRoute && userRole !== 'rh' && userRole !== 'admin') {
      // Rediriger vers le tableau de bord si l'utilisateur n'est ni RH ni admin
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    
    // Continuer normalement
    return NextResponse.next();
  }
  
  // Si aucune condition n'est remplie, continuer normalement
  return NextResponse.next();
}

// Configurer le middleware pour s'exécuter sur toutes les routes sauf les ressources statiques
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|images|api/auth/session).*)',
  ],
}; 