// /app/lib/auth-utils.ts

import { cookies } from 'next/headers'
import jwt from 'jsonwebtoken'
import { UserPayload } from '@/app/types/auth'

/**
 * Gets the current user from the session cookie.
 * Returns the decoded payload or null if unauthorized.
 */
export async function getSessionUser(): Promise<UserPayload | null> {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('session')?.value

    if (!token) return null

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string,
    ) as UserPayload

    return decoded
  } catch (error) {
    return null
  }
}
