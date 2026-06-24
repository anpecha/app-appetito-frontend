import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, SessionData } from './lib/session';

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const session = await getIronSession<SessionData>(request, response, sessionOptions);

  // Proteção básica: Se a rota começar com /admin ou /dashboard e não tiver usuário logado, redireciona
  // Protect /admin/* routes, EXCEPT /admin/login itself (to avoid infinite redirect loop)
  const isLoginPage = request.nextUrl.pathname === '/admin/login';
  const isProtectedPath =
    !isLoginPage &&
    (request.nextUrl.pathname.startsWith('/admin') ||
      request.nextUrl.pathname.startsWith('/dashboard'));

  if (isProtectedPath && !session.userId) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  // Permitir API requests
  return response;
}

export const config = {
  // Ignorar rotas de next.js staticas e images
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
