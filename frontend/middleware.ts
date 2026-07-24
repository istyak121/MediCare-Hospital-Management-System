import { NextRequest, NextResponse } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './src/i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

// Role-based route access rules
const routeRules: { pattern: RegExp; roles: string[] }[] = [
  { pattern: /^\/admin(?:\/|$)/, roles: ['super_admin', 'admin'] },
  { pattern: /^\/doctor(?:\/|$)/, roles: ['doctor'] },
  { pattern: /^\/nurse(?:\/|$)/, roles: ['nurse'] },
  { pattern: /^\/receptionist(?:\/|$)/, roles: ['receptionist'] },
  { pattern: /^\/pharmacy(?:\/|$)/, roles: ['pharmacist'] },
  { pattern: /^\/lab(?:\/|$)/, roles: ['lab_technician'] },
  { pattern: /^\/accountant(?:\/|$)/, roles: ['accountant'] },
  { pattern: /^\/portal(?:\/|$)/, roles: ['patient'] },
  { pattern: /^\/patients(?:\/|$)/, roles: ['super_admin', 'admin', 'receptionist', 'doctor'] },
  { pattern: /^\/appointments(?:\/|$)/, roles: ['super_admin', 'admin', 'receptionist', 'doctor', 'nurse'] },
  { pattern: /^\/billing(?:\/|$)/, roles: ['super_admin', 'admin', 'receptionist', 'accountant'] },
  { pattern: /^\/prescriptions(?:\/|$)/, roles: ['super_admin', 'admin', 'doctor', 'nurse'] },
  { pattern: /^\/staff(?:\/|$)/, roles: ['super_admin', 'admin'] },
  { pattern: /^\/admissions(?:\/|$)/, roles: ['super_admin', 'admin', 'receptionist', 'doctor', 'nurse'] },
  { pattern: /^\/schedules(?:\/|$)/, roles: ['super_admin', 'admin', 'doctor'] },
  { pattern: /^\/reports(?:\/|$)/, roles: ['super_admin', 'admin', 'accountant'] },
  { pattern: /^\/settings(?:\/|$)/, roles: ['super_admin', 'admin'] },
];

// Default landing page for each role
const roleDefaultRoute: Record<string, string> = {
  super_admin: '/admin',
  admin: '/admin',
  doctor: '/doctor',
  nurse: '/nurse',
  receptionist: '/receptionist',
  pharmacist: '/pharmacy',
  lab_technician: '/lab',
  accountant: '/accountant',
  patient: '/portal',
};

// Public routes that don't require authentication
const publicRoutePatterns = [
  /^\/login(?:\/|$)/,
  /^\/display(?:\/|$)/,
];

// Strip locale prefix from pathname (next-intl adds /en/ or /bn/)
function stripLocale(pathname: string): string {
  return pathname.replace(/^\/(en|bn)(?:\/|$)/, '/');
}

export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const strippedPath = stripLocale(pathname);

  // Allow static assets and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return intlMiddleware(request);
  }

  // Allow public routes without authentication
  if (publicRoutePatterns.some((p) => p.test(strippedPath))) {
    return intlMiddleware(request);
  }

  // Check JWT auth token from cookie
  const accessToken = request.cookies.get('accessToken')?.value;
  if (!accessToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Decode JWT payload to extract role (JWT verification happens on backend)
  let role: string | null = null;
  try {
    const payloadBase64 = accessToken.split('.')[1];
    const payload = JSON.parse(atob(payloadBase64));
    role = payload.role || null;
  } catch {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  if (!role) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Check if the current path is restricted to specific roles
  for (const rule of routeRules) {
    if (rule.pattern.test(strippedPath)) {
      if (!rule.roles.includes(role)) {
        // Redirect to user's own default dashboard
        const defaultRoute = roleDefaultRoute[role] || '/login';
        return NextResponse.redirect(new URL(defaultRoute, request.url));
      }
      break;
    }
  }

  return intlMiddleware(request);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\..*).*)'],
};
