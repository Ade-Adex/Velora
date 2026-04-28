// /app/components/providers/AuthProvider.tsx
'use client'
import { useEffect } from 'react'
import { useUserStore } from '@/app/store/useUserStore'
import { SessionProvider } from 'next-auth/react'
import { IUser, Serialized } from '@/app/types' // Import Serialized

export default function AuthProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode
  initialUser: Serialized<IUser> | null 
}) {
  const setUser = useUserStore((state) => state.setUser)

  useEffect(() => {
    setUser(initialUser)
  }, [initialUser, setUser])

  return <SessionProvider>{children}</SessionProvider>
}
