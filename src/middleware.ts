import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;

    // ⛔️ No aplicar middleware a /api/auth y /login
    if (pathname.startsWith('/api/auth') || pathname.startsWith('/login') || pathname.startsWith('/unauthorized') ||
      pathname.startsWith('/api/mp')) {
      return NextResponse.next();
    }

    console.log("🔍 Cookies:", req.cookies.getAll());
    console.log("🔍 Token:", req.nextauth.token);

    const role = req.nextauth.token?.role;

    // Protejo /admin sólo para admin
    if (pathname.startsWith('/admin') && role !== 'admin') {
      console.log("⛔️ Acceso denegado para rol:", role);
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }

    console.log("✅ Acceso permitido para rol:", role);
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => {
        console.log("Authorized callback token:", token);
        return !!token;
      },
    },
  }
);

// Defino qué rutas quiero proteger
export const config = {
  matcher: ['/admin/:path*', '/api/cart/:path*', '/api/orders/:path*', '/cart/:path*' ], // o las que necesites
};

