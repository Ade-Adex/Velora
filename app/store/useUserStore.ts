//  /app/store/useUserStore.ts

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { IUser } from '@/app/types'

interface UserState {
  user: IUser | null
  setUser: (user: IUser | null) => void
  logout: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => {
        set({ user: null })
        // Optional: Call your API to clear the server-side cookie
        fetch('/api/auth/logout', { method: 'POST' })
      },
    }),
    {
      name: 'velora-user-storage', // key in localStorage
    },
  ),
)