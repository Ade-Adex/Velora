'use client'
import React from 'react'
import { AppContextProvider } from '@/app/context/AppContext'
import { SnackbarProvider } from 'notistack'
import Navbar from './Navbar'
import { MantineProvider, createTheme } from '@mantine/core'
import AuthProvider from '@/app/components/providers/AuthProvider' // Add this import
import '@mantine/core/styles.css'
import { IUser } from '@/app/types'
import { ModalsProvider } from '@mantine/modals'

const theme = createTheme({
  primaryColor: 'blue',
})

interface AppWrapperProps {
  children: React.ReactNode
  initialUser: IUser | null
}

export default function AppWrapper({ children, initialUser }: AppWrapperProps) {
  
  return (
    <MantineProvider theme={theme} defaultColorScheme="light">
      <ModalsProvider>
        <AuthProvider initialUser={initialUser}>
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
      </ModalsProvider>
    </MantineProvider>
  )
}
