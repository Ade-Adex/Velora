// /app/components/providers/AuthProvider.tsx

'use client'
import { useEffect } from 'react'
import { useUserStore } from '@/app/store/useUserStore'
import { IUser, Serialized } from '@/app/types'

export default function AuthProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode
  initialUser: Serialized<IUser> | null
}) {
  const setUser = useUserStore((state) => state.setUser)

  useEffect(() => {
    /**
     * Professional Guard:
     * We check if initialUser exists AND has the '_id' property.
     * Since your Serialized helper adds { _id: string },
     * this check ensures we have a real user and not an error object.
     */
    if (initialUser && '_id' in initialUser) {
      setUser(initialUser)
    } else {
      setUser(null)
    }
  }, [initialUser, setUser])

  return <>{children}</>
}