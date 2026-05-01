// /app/lib/auth-utils.ts

import { cookies } from 'next/headers'
import { SignJWT, jwtVerify } from 'jose'
import { UserPayload } from '@/app/types/auth'

const secret = new TextEncoder().encode(process.env.JWT_SECRET || '')

export async function getSessionUser(): Promise<UserPayload | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value

    if (!token) return null

    const { payload } = await jwtVerify(token, secret)

    /**
     * Since UserPayload extends JWTPayload, this cast is
     * valid and safe without needing 'unknown' or 'any'.
     */
    return payload as UserPayload
  } catch (error) {
    // Log error internally if needed, but return null for the UI
    return null
  }
}

export async function createSessionToken(
  payload: UserPayload,
): Promise<string> {
  // SignJWT accepts UserPayload because it satisfies JWTPayload
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret)
}