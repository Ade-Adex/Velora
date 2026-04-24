'use client'
import React from 'react'
import { AppContextProvider } from '@/app/context/AppContext'
import { SnackbarProvider } from 'notistack'
import Navbar from './Navbar'
import { MantineProvider, createTheme } from '@mantine/core'
import AuthProvider from '@/app/components/providers/AuthProvider' // Add this import
import '@mantine/core/styles.css'

const theme = createTheme({
  primaryColor: 'blue',
})

interface AppWrapperProps {
  children: React.ReactNode
}

export default function AppWrapper({ children }: AppWrapperProps) {
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      {/* AuthProvider must wrap the parts of the app using useSession */}
      <AuthProvider>
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
      </AuthProvider>
    </MantineProvider>
  )
}
