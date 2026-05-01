import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('session')?.value
  const { pathname } = request.nextUrl

  // 1. Define Route Groups
  const isAuthPage = pathname.startsWith('/auth')
  const isAdminPage = pathname.startsWith('/admin')
  const isVendorPage = pathname.startsWith('/vendor') // Added vendor route
  const isProfilePage = pathname.startsWith('/profile')

  // 2. Logic: User is NOT authenticated
  if (!token) {
    if (isAdminPage || isVendorPage || isProfilePage) {
      const loginUrl = new URL('/auth', request.url)
      loginUrl.searchParams.set('callbackUrl', pathname)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  // 3. Logic: User IS authenticated
  try {
    const secret = new TextEncoder().encode(process.env.JWT_SECRET)
    const { payload } = await jwtVerify(token, secret)

    if (isAuthPage) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // --- Role-Based Access Control (RBAC) ---

    // A. Protect Admin/Editor Area
    // Only 'admin' and 'editor' can access /admin
    if (isAdminPage && !['admin', 'editor'].includes(payload.role as string)) {
      return NextResponse.redirect(new URL('/', request.url))
    }

    // B. Protect Vendor Area
    // Only 'vendor' and 'admin' can access /vendor
    if (isVendorPage && !['vendor', 'admin'].includes(payload.role as string)) {
      return NextResponse.redirect(new URL('/', request.url))
    }

  } catch (error) {
    const response = NextResponse.redirect(new URL('/auth', request.url))
    response.cookies.delete('session')
    return response
  }

  return NextResponse.next()
}

// 4. Matcher configuration
export const config = {
  // Corrected 'matcher' spelling (it was 'matc her')
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
      }
