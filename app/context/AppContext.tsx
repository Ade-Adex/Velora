'use client'
import React, { createContext, useContext, useState, ReactNode } from 'react'
import { IUser } from '@/app/types'

// 1. Define the interface using the imported IUser type
interface AppContextType {
  user: IUser | null
  setUser: (user: IUser | null) => void
  isAuthModalOpen: boolean
  setAuthModalOpen: (open: boolean) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

// 2. Create the Context object with the strict type
const AppContext = createContext<AppContextType | undefined>(undefined)

// 3. The Provider component
export function AppContextProvider({ children }: { children: ReactNode }) {
  // Use IUser | null to maintain strict typing without 'any'
  const [user, setUser] = useState<IUser | null>(null)
  const [isAuthModalOpen, setAuthModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        isAuthModalOpen,
        setAuthModalOpen,
        searchTerm,
        setSearchTerm,
        isLoading,
        setIsLoading,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}

// 4. The Custom Hook
export function useApp() {
  const context = useContext(AppContext)

  if (context === undefined) {
    throw new Error('useApp must be used within an AppContextProvider')
  }

  return context
}
