// /app/api/auth/verify/route.ts

// import { NextResponse } from 'next/server'
// import { verifyMagicToken } from '@/app/services/auth-service'
// import { cookies } from 'next/headers'
// import jwt from 'jsonwebtoken'

// export async function GET(req: Request) {
//   const { searchParams } = new URL(req.url)
//   const token = searchParams.get('token')

//   if (!token) {
//     return NextResponse.json({ error: 'Token is required' }, { status: 400 })
//   }

//   const user = await verifyMagicToken(token)

//   if (!user) {
//     return NextResponse.json(
//       { error: 'Invalid or expired token' },
//       { status: 401 },
//     )
//   }

//   // Create JWT Session
//   const sessionToken = jwt.sign(
//     { id: user._id, email: user.email, role: user.role },
//     process.env.JWT_SECRET!,
//     { expiresIn: '7d' },
//   )

//   // Set the secure cookie
//   const cookieStore = await cookies()
//   cookieStore.set('session', sessionToken, {
//     httpOnly: true,
//     secure: process.env.NODE_ENV === 'production',
//     sameSite: 'lax',
//     path: '/',
//     maxAge: 60 * 60 * 24 * 7, // 7 days
//   })

//   // Return the user data so the frontend can "setUser(data.user)"
//   return NextResponse.json({
//     success: true,
//     user: {
//       _id: user._id,
//       email: user.email,
//       fullName: user.fullName,
//       role: user.role,
//       addresses: user.addresses,
//       wishlist: user.wishlist,
//     },
//   })
// }

import { NextResponse } from 'next/server'
import { verifyMagicToken } from '@/app/services/auth-service'
import { cookies } from 'next/headers'
import { createSessionToken } from '@/app/lib/auth-utils' // Import helper

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const token = searchParams.get('token')

  if (!token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 })
  }

  const user = await verifyMagicToken(token)

  if (!user) {
    return NextResponse.json(
      { error: 'Invalid or expired token' },
      { status: 401 },
    )
  }

  // Create JWT Session using jose
  const sessionToken = await createSessionToken({
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  })

  const cookieStore = await cookies()
  cookieStore.set('session', sessionToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7 days
  })

  return NextResponse.json({
    success: true,
    user: {
      _id: user._id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
      addresses: user.addresses,
      wishlist: user.wishlist,
    },
  })
}