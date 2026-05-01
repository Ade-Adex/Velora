// /app/types/next-auth.d.ts

import NextAuth, { DefaultSession } from 'next-auth'
import { IAddress } from './index'

declare module 'next-auth' {
  interface Session {
    user: {
      _id: string
      role: string
      addresses: IAddress[]
    } & DefaultSession['user']
  }

  // This ensures the User object returned from the authorize/adapter
  // includes the addresses property
  interface User {
    _id: string
    role: string
    addresses: IAddress[]
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    _id: string
    role: string
    addresses: IAddress[]
  }
}