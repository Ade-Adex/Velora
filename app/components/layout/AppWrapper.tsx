// 'use client'
// import React from 'react'
// import { AppContextProvider } from '@/app/context/AppContext'
// import { SnackbarProvider } from 'notistack'
// import Navbar from './Navbar'
// import { MantineProvider, createTheme } from '@mantine/core'
// import AuthProvider from '@/app/components/providers/AuthProvider' // Add this import
// import '@mantine/core/styles.css'
// import { IUser, Serialized } from '@/app/types'
// import { ModalsProvider } from '@mantine/modals'
// import { usePathname } from 'next/navigation'

// const theme = createTheme({
//   primaryColor: 'blue',
// })

// interface AppWrapperProps {
//   children: React.ReactNode
//   initialUser: Serialized<IUser> | null
// }

// export default function AppWrapper({ children, initialUser }: AppWrapperProps) {
//   const pathname = usePathname()
//   const isDashboard =
//     pathname?.startsWith('/admin') || pathname?.startsWith('/vendor')
//   return (
//     <MantineProvider theme={theme} defaultColorScheme="light">
//       <ModalsProvider>
//         <AuthProvider initialUser={initialUser}>
//           <AppContextProvider>
//             <SnackbarProvider
//               maxSnack={3}
//               anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
//               autoHideDuration={4000}
//             >
//               <div className="flex flex-col min-h-screen bg-[#F4F7FA]">
//                 {/* <Navbar /> */}
//                 {!isDashboard && <Navbar />}
//                 <main className="flex-grow">{children}</main>
//               </div>
//             </SnackbarProvider>
//           </AppContextProvider>
//         </AuthProvider>
//       </ModalsProvider>
//     </MantineProvider>
//   )
// }






// /app/components/layout/AppWrapper.tsx
'use client'
import React from 'react'
import { AppContextProvider } from '@/app/context/AppContext'
import { SnackbarProvider } from 'notistack'
import Navbar from './Navbar/Navbar'
import { MantineProvider, createTheme } from '@mantine/core'
import AuthProvider from '@/app/components/providers/AuthProvider'
import { ModalsProvider } from '@mantine/modals'
import { usePathname } from 'next/navigation'
import { IUser, Serialized } from '@/app/types'
import '@mantine/core/styles.css'

const theme = createTheme({
  primaryColor: 'blue',
  fontFamily: 'Arial, Helvetica, sans-serif', // Matching your CSS variables
})

interface AppWrapperProps {
  children: React.ReactNode
  initialUser: Serialized<IUser> | null
}

export default function AppWrapper({ children, initialUser }: AppWrapperProps) {
  const pathname = usePathname()
  
  // Dashboard logic: Hide main Navbar if we are in admin or vendor routes
  const isDashboard = pathname?.startsWith('/admin') || pathname?.startsWith('/vendor')

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
                {!isDashboard && <Navbar />}
                <main className={`flex-grow ${isDashboard ? '' : 'w-full'}`}>
                  {children}
                </main>
              </div>
            </SnackbarProvider>
          </AppContextProvider>
        </AuthProvider>
      </ModalsProvider>
    </MantineProvider>
  )
}