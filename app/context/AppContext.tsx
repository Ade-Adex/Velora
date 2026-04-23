'use client'
import React, { createContext, useContext, useState, ReactNode } from 'react'

interface AppContextType {
  isAuthModalOpen: boolean
  setAuthModalOpen: (open: boolean) => void
  searchTerm: string
  setSearchTerm: (term: string) => void
  isLoading: boolean
  setIsLoading: (loading: boolean) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppContextProvider({ children }: { children: ReactNode }) {
  const [isAuthModalOpen, setAuthModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  return (
    <AppContext.Provider
      value={{
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

export function useApp() {
  const context = useContext(AppContext)
  if (context === undefined)
    throw new Error('useApp must be used within AppContextProvider')
  return context
}
