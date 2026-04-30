// /app/types/auth.ts
import { JwtPayload } from 'jsonwebtoken'

export interface UserPayload extends JwtPayload {
  id: string
  email: string
  role: 'user' | 'admin' // Better to define the specific roles
}
