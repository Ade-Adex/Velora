//  /app/api/auth/session/route.ts

import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/app/services/auth-service'

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json({ authenticated: false }, { status: 401 })
    }

    return NextResponse.json({
      authenticated: true,
      user: user,
    })
  } catch (error) {
    return NextResponse.json({ authenticated: false }, { status: 500 })
  }
}