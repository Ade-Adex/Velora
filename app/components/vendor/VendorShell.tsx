// /app/components/vendor/VendorShell.tsx

'use client'
import { AppShell, Burger, Group, Text, ActionIcon, Box } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import VendorSidebar from './VendorSidebar'
import UserMenu from '@/app/components/layout/Navbar/UserMenu'
import { IUser, Serialized } from '@/app/types'
import { PanelLeftClose, PanelLeft, Bell } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useUserStore } from '@/app/store/useUserStore'

export default function VendorShell({
  children,
  user,
}: {
  children: React.ReactNode
  user: Serialized<IUser>
}) {
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure()
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true)

  const logout = useUserStore((state) => state.logout)
  
    const handleLogout = async () => {
      try {
        await fetch('/api/auth/logout', { method: 'POST' })
        logout()
        window.location.href = '/'
      } catch (error) {
        console.error('Logout failed', error)
      }
    }
  

  return (
    <AppShell
      header={{ height: 70 }}
      navbar={{
        width: desktopOpened ? 280 : 80,
        breakpoint: 'md',
        collapsed: { mobile: !mobileOpened },
      }}
      padding="xl"
      transitionDuration={300}
      styles={{ main: { backgroundColor: '#F8FAFC' } }}
    >
      <AppShell.Header withBorder={false} bg="white" className="shadow-sm border-b border-slate-100">
        <Group h="100%" px="xl" justify="space-between">
          <Group gap="lg">
            <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="md" size="sm" />
            <ActionIcon variant="subtle" color="gray" onClick={toggleDesktop} visibleFrom="md" size="lg">
              {desktopOpened ? <PanelLeftClose size={20} /> : <PanelLeft size={20} />}
            </ActionIcon>
            <Text fw={900} size="xl" c="indigo.7" lts="-1px">
              VELORA <Text component="span" fw={300} c="gray.5">VNDR</Text>
            </Text>
          </Group>

          <Group gap="md">
            <ActionIcon variant="subtle" color="gray" radius="xl" size="lg">
              <Bell size={20} />
            </ActionIcon>
            {/* Using the Shared Component */}
            <UserMenu 
              user={user as unknown as IUser} 
              onLogout={handleLogout} 
              variant="dashboard" 
            />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar withBorder={false} p={0} className="z-50 shadow-xl">
        <VendorSidebar onClose={closeMobile} isCollapsed={!desktopOpened} />
      </AppShell.Navbar>

      <AppShell.Main>
        <Box className="max-w-7xl mx-auto">{children}</Box>
      </AppShell.Main>
    </AppShell>
  )
}