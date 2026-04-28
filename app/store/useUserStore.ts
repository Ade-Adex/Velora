// /app/store/useUserStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { IUser, Serialized } from '@/app/types' // Import Serialized

interface UserState {
  // Change IUser to Serialized<IUser>
  user: Serialized<IUser> | null
  setUser: (user: Serialized<IUser> | null) => void
  logout: () => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user) => set({ user }),
      logout: () => {
        set({ user: null })
        fetch('/api/auth/logout', { method: 'POST' })
          .then((res) => {
            if (!res.ok) {
              console.error('Failed to log out')
            }
          })
          .catch((err) => console.error('Logout error:', err))
      },
    }),
    { name: 'velora-user-storage' },
  ),
)
