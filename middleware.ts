// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { API_BASE_URL, REFRESH_TOKEN_MAX_AGE } from '@/lib/config';

// Backs the public-project view counter's per-visitor dedup for anonymous
// visitors (logged-in visitors dedup by user id instead) — see
// lib/public-project.ts and tramo-api's ProjectView entity.
const ANON_ID_COOKIE = 'tramo_anon_id';

const ACCESS_TOKEN_MAX_AGE = 60 * 15;
const REFRESH_MARGIN_SECONDS = 60;

// Server Components can't refresh the access token mid-render (cookies() is
// read-only there), so every protected page read would silently 401 once the
// 15-minute access token expires. Refreshing here, before the page renders at
// all, is what actually fixes that. Critically the backend ROTATES the refresh
// token on every refresh (and treats a re-presented revoked token as theft,
// nuking the whole session), so we must persist BOTH new tokens — dropping the
// rotated refresh token would log the user out on the next refresh.
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
}

function isExpiringSoon(token: string): boolean {
  const payload = decodeJwtPayload(token);
  if (!payload) return true;
  if (typeof payload.exp !== 'number') return false;
  return payload.exp * 1000 - Date.now() < REFRESH_MARGIN_SECONDS * 1000;
}

// Only used for redirect UX (e.g. bouncing an admin away from /projects) — not
// an authorization check, so an unverified decode is fine here. Any real admin
// action still gets the JWT signature re-verified backend-side.
function getRole(token: string): string | null {
  const role = decodeJwtPayload(token)?.role;
  return typeof role === 'string' ? role : null;
}

// Mirrors JwtService's requiresBirthDate claim (true when the account has no
// birthDate yet - new Google sign-ups, or pre-gate accounts). Redirect-only
// signal, same trust level as getRole above - the backend re-checks on every
// request via BirthDateGateFilter regardless of what this decode says.
function needsBirthDate(token: string): boolean {
  return decodeJwtPayload(token)?.requiresBirthDate === true;
}

async function refreshAccessToken(
  refreshToken: string,
): Promise<{ accessToken: string; refreshToken: string } | null> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    if (!data.accessToken) return null;
    // The backend rotates the refresh token; fall back to the presented one only
    // if the response omits it (older backends), never drop it.
    return { accessToken: data.accessToken, refreshToken: data.refreshToken ?? refreshToken };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isOnboarding = path.startsWith('/onboarding/birth-date');
  const isProtected = path.startsWith('/editor') || path.startsWith('/projects') || path.startsWith('/profile') || path.startsWith('/admin') || path.startsWith('/settings') || isOnboarding;

  let accessToken = request.cookies.get('accessToken')?.value ?? null;
  const refreshToken = request.cookies.get('refreshToken')?.value ?? null;
  let refreshed: { accessToken: string; refreshToken: string } | null = null;

  // Server actions can write cookies themselves (lib/api.ts refresh-on-401), so
  // we don't refresh or gate them here — that would break the action POST.
  const isServerAction = request.headers.has('next-action');
  const accessValid = !!accessToken && !isExpiringSoon(accessToken);

  if (isProtected && !isServerAction && !accessValid && refreshToken) {
    refreshed = await refreshAccessToken(refreshToken);
    if (refreshed) accessToken = refreshed.accessToken;
  }

  // Terminal auth failure on a protected navigation: no usable access token and
  // no way to mint one. Clear the stale cookies and send them to login. Only
  // fires when a refresh actually failed (or there was no refresh token) — not
  // on mere cookie presence — so a still-valid session is never bounced.
  if (isProtected && !isServerAction && !accessValid && !refreshed) {
    const res = NextResponse.redirect(new URL('/login', request.url));
    res.cookies.delete('accessToken');
    res.cookies.delete('refreshToken');
    res.cookies.delete('username');
    return res;
  }

  const isLoggedIn = !!(accessToken || refreshToken);

  const pendingBirthDate = !!accessToken && needsBirthDate(accessToken);

  // Bounce any other protected route to onboarding until birthDate is set, and
  // bounce away from onboarding once it's already satisfied (nothing to do there).
  if (isProtected && !isServerAction && !isOnboarding && pendingBirthDate) {
    return NextResponse.redirect(new URL('/onboarding/birth-date', request.url));
  }
  const admin = !!accessToken && getRole(accessToken) === 'ADMIN';

  if (isOnboarding && !isServerAction && (accessValid || refreshed) && !pendingBirthDate) {
    return NextResponse.redirect(new URL(admin ? '/explore' : '/projects', request.url));
  }

  if (path.startsWith('/projects') && admin) {
    return NextResponse.redirect(new URL('/explore', request.url));
  }

  if (path.startsWith('/admin') && !admin) {
    return NextResponse.redirect(new URL('/projects', request.url));
  }

  if ((path === '/login' || path === '/signup') && isLoggedIn) {
    return NextResponse.redirect(new URL(admin ? '/explore' : '/projects', request.url));
  }

  const needsAnonId = path.startsWith('/p/') && !request.cookies.get(ANON_ID_COOKIE);
  const anonId = needsAnonId ? crypto.randomUUID() : null;

  // Forwarded on the request too, so this same render already sees the fresh
  // values via cookies() instead of only the next navigation.
  if (anonId) request.cookies.set(ANON_ID_COOKIE, anonId);
  if (refreshed) {
    request.cookies.set('accessToken', refreshed.accessToken);
    request.cookies.set('refreshToken', refreshed.refreshToken);
  }

  const response = NextResponse.next({ request });

  if (anonId) {
    response.cookies.set(ANON_ID_COOKIE, anonId, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
      path: '/',
    });
  }
  if (refreshed) {
    const secure = process.env.NODE_ENV === 'production';
    response.cookies.set('accessToken', refreshed.accessToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      maxAge: ACCESS_TOKEN_MAX_AGE,
      path: '/',
    });
    response.cookies.set('refreshToken', refreshed.refreshToken, {
      httpOnly: true,
      secure,
      sameSite: 'lax',
      maxAge: REFRESH_TOKEN_MAX_AGE,
      path: '/',
    });
  }

  return response;
}

export const config = {
  matcher: [
    '/editor/:path*',
    '/projects/:path*',
    '/profile/:path*',
    '/admin/:path*',
    '/settings/:path*',
    '/onboarding/:path*',
    '/login',
    '/signup',
    '/p/:path*',
  ],
};
