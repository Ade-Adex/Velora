'use client'
import React from 'react'
import { AppContextProvider } from '@/app/context/AppContext'
import { SnackbarProvider } from 'notistack'
import Navbar from './Navbar'

interface AppWrapperProps {
  children: React.ReactNode
}

export default function AppWrapper({ children }: AppWrapperProps) {
  return (
    <AppContextProvider>
      <SnackbarProvider
        maxSnack={3}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        autoHideDuration={4000}
      >
        <div className="flex flex-col min-h-screen bg-[#F4F7FA]">
          <Navbar />
          <main className="flex-grow">{children}</main>
        </div>
      </SnackbarProvider>
    </AppContextProvider>
  )
}
