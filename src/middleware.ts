import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Middleware for protected routes
const authMiddleware = withAuth(
  function middleware(req) {
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: '/auth/signin',
    },
  }
);

// Middleware for API routes to handle CORS
function corsMiddleware(request: NextRequest) {
  // Check if the request is for an API route
  const isApiRoute = request.nextUrl.pathname.startsWith('/api/')
  
  // For API routes, handle CORS
  if (isApiRoute) {
    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return NextResponse.json({}, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
          'Access-Control-Max-Age': '86400',
        },
      })
    }
    
    // Add CORS headers to all API responses
    const response = NextResponse.next()
    response.headers.set('Access-Control-Allow-Origin', '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    return response
  }
  
  // For non-API routes, continue without modification
  return NextResponse.next()
}

// Combined middleware function
export default function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Apply CORS middleware for API routes
  if (pathname.startsWith('/api/')) {
    return corsMiddleware(request);
  }
  
  // Apply auth middleware for protected routes
  if (pathname.startsWith('/novels/') || pathname.startsWith('/settings/')) {
    // @ts-ignore - TypeScript expects the second argument but withAuth already handles it
    return authMiddleware(request);
  }
  
  // For other routes, continue without middleware
  return NextResponse.next();
}

// Configure middleware to run on specific paths
export const config = {
  matcher: [
    '/novels/:path*',
    '/settings/:path*',
    '/api/:path*',
  ],
}; 