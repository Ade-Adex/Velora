import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose' 

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('session')?.value
  const { pathname } = request.nextUrl

  // 1. Define Route Groups
  const isAuthPage = pathname.startsWith('/auth')
  const isAdminPage = pathname.startsWith('/admin')
  const isProfilePage = pathname.startsWith('/profile')

  // 2. Logic: User is NOT authenticated
  if (!token) {
    // If they try to access Admin or Profile, send them to login
    if (isAdminPage || isProfilePage) {
      const loginUrl = new URL('/auth', request.url)
      // Professional touch: store the current URL to redirect back after login
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
    // Allow them to stay on the Auth page or Home
    return NextResponse.next()
  }

  // 3. Logic: User IS authenticated
  try {
    // Verify the JWT (Standard jsonwebtoken lib doesn't work in Middleware)
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)

    // A. Prevent authenticated users from seeing the Login/Auth page
    if (isAuthPage) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // B. Role-Based Access Control (RBAC)
    // Prevent non-admins from accessing /admin
    if (isAdminPage && payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  } catch (error) {
    // If token is malformed or expired, clear it and send to login
    const response = NextResponse.redirect(new URL('/auth', request.url))
    response.cookies.delete('session')
    return response
  }

  return NextResponse.next()
}

// 4. Matcher configuration
export const config = {
  /*
   * Match all request paths except for the ones starting with:
   * - api (API routes)
   * - _next/static (static files)
   * - _next/image (image optimization files)
   * - favicon.ico (favicon file)
   */
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
