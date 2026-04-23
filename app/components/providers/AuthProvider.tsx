// /app/components/providers/AuthProvider.tsx



'use client'
import { useEffect } from 'react'
import { useUserStore } from '@/app/store/useUserStore'

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const setUser = useUserStore((state) => state.setUser)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me')
        const data = await res.json()
        if (data.user) {
          setUser(data.user)
        } else {
          setUser(null)
        }
      } catch (err) {
        console.error('Auth sync failed', err)
      }
    }

    checkAuth()
  }, [setUser])

  return <>{children}</>
}
