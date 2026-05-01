// /app/components/providers/AuthProvider.tsx


'use client'
import { useEffect, useCallback } from 'react'
import { useUserStore } from '@/app/store/useUserStore'
import { IUser, Serialized } from '@/app/types'
import { useRouter } from 'next/navigation'

export default function AuthProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode
  initialUser: Serialized<IUser> | null
}) {
  const setUser = useUserStore((state) => state.setUser)
  const user = useUserStore((state) => state.user)
  const router = useRouter()

  // 1. Memoized silent check function
  const checkSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/session', { cache: 'no-store' })

      if (res.ok) {
        const data = await res.json()
        setUser(data.user)
      } else {
        // If 401 (Unauthorized), the session is dead
        if (user) {
          setUser(null)
          router.refresh()
        }
      }
    } catch (err) {
      console.error('Silent session check failed')
    }
  }, [setUser, user, router])

  useEffect(() => {
    if (initialUser && '_id' in initialUser) {
      setUser(initialUser)
    } else {
      setUser(null)
    }
  }, [initialUser, setUser])

  useEffect(() => {
    const authChannel = new BroadcastChannel('velora_auth')

    authChannel.onmessage = (event) => {
      if (event.data.type === 'LOGIN_SUCCESS') {
        setUser(event.data.user)
        router.refresh()
      }
      if (event.data.type === 'LOGOUT') {
        setUser(null)
        window.location.href = '/auth'
      }
    }

    return () => authChannel.close()
  }, [setUser, router])

  // 2. The Visibility Listener
  useEffect(() => {
    const handleVisibilityChange = () => {
      // Only check if the user comes back to the tab
      if (document.visibilityState === 'visible') {
        checkSession()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    // Also perform a check when the window regains focus (optional but professional)
    window.addEventListener('focus', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleVisibilityChange)
    }
  }, [checkSession])

  return <>{children}</>
}