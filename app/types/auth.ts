// /app/types/auth.ts

import { type JWTPayload } from 'jose'

export interface UserPayload extends JWTPayload {
  // id: string
  _id: string
  email: string
  role: 'customer' | 'admin' | 'editor' | 'vendor' 
}
