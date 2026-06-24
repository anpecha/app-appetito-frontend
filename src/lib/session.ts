import { getIronSession } from 'iron-session';
import { cookies } from 'next/headers';

export interface SessionData {
  userId?: string;
  role?: string;
  restaurantId?: string;
}

export const defaultSession: SessionData = {};

export const sessionOptions = {
  password: process.env.SESSION_SECRET as string,
  cookieName: 'appetito_session',
  cookieOptions: {
    // A segurança do cookie dependerá do ambiente
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' as const,
  },
};

export async function getSession() {
  const session = await getIronSession<SessionData>(cookies(), sessionOptions);

  if (!session.userId) {
    session.userId = undefined;
    session.role = undefined;
    session.restaurantId = undefined;
  }

  return session;
}
