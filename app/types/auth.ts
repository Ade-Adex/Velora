// /app/types/auth.ts

import { type JWTPayload } from 'jose'

export interface UserPayload extends JWTPayload {
  id: string
  email: string
  role: 'customer' | 'admin' | 'editor'
}