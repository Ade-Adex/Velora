// /app/api/auth/logout/route.ts
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  const cookieStore = await cookies()

  // Delete the session cookie
  cookieStore.delete('session')

  return NextResponse.json({
    success: true,
    message: 'Logged out successfully',
  })
}
