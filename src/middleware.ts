import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtDecode } from "jwt-decode";

// Define public routes that don't require authentication
const PUBLIC_ROUTES = ['/login', '/forgotPassword', '/notFound'];

// Define role-based route permissions
const ROLE_ROUTES = {
    MANAGER: ['/', '/students', '/lecturers', '/rooms', '/schedules/manage', '/reports', '/subjects', '/classes', '/courses'],
    LECTURER: ['/lecturer/schedules', '/lecturer/reports'],
};

const COMMON_ROUTES = ['/profile', '/schedules'];

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip middleware for public routes and static files
    if (
        PUBLIC_ROUTES.some(route => pathname.startsWith(route)) ||
        pathname.includes('_next') ||
        pathname.includes('favicon.ico')
    ) {
        return NextResponse.next();
    }

    const token = request.cookies.get('token')?.value;

    if (!token) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('from', pathname);
        return NextResponse.redirect(loginUrl);
    }

    try {
        // Verify token and extract role
        const decoded = jwtDecode<{ authorities: string[], exp: number }>(token);

        // Check if token is expired
        if (decoded.exp * 1000 < Date.now()) {
            const loginUrl = new URL('/login', request.url);
            return NextResponse.redirect(loginUrl);
        }

        const userRole = decoded.authorities[0]; 
        console.log("User role:", userRole);

        // Allow access to common routes
        if (COMMON_ROUTES.some(route => pathname.startsWith(route))) {
            return NextResponse.next();
        }

        if (pathname === '/' || pathname === '') {
            if (userRole === 'MANAGER') {
                console.log(userRole)
                return NextResponse.next();
            }
        }

        // Check role-based permissions
        if (userRole && ROLE_ROUTES[userRole as keyof typeof ROLE_ROUTES]) {
            const permitted = ROLE_ROUTES[userRole as keyof typeof ROLE_ROUTES]
                .some(route => pathname.startsWith(route));

            if (permitted) {
                return NextResponse.next();
            }
        }

        return NextResponse.redirect(new URL('/notFound', request.url));

    } catch (error) {
        console.error('Token verification failed:', error);
        const loginUrl = new URL('/login', request.url);
        return NextResponse.redirect(loginUrl);
    }
}

// Configure to run middleware on specific paths
export const config = {
    matcher: [
        '/((?!api/public|_next/static|_next/image|favicon.ico).*)',
    ],
};