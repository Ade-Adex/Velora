// /app/components/admin/AdminShell.tsx
'use client'

import { AppShell, Burger, Group, Text } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import AdminSidebar from './AdminSidebar'
import UserMenu from '../layout/Navbar/UserMenu'
import { useUserStore } from '@/app/store/useUserStore'
import { IUser, Serialized } from '@/app/types'

export default function AdminShell({
  children,
  user,
}: {
  children: React.ReactNode
  user: Serialized<IUser>
}) {
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] =
    useDisclosure()
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
      header={{ height: 60 }}
      navbar={{
        // DYNAMIC WIDTH: 280 when open, 80 when "mini"
        width: desktopOpened ? 280 : 80,
        breakpoint: 'md',
        collapsed: {
          mobile: !mobileOpened,
          // Remove desktop collapse so it stays visible as a mini-bar
        },
      }}
      padding="md"
      transitionDuration={300}
      transitionTimingFunction="ease"
      styles={{
        main: { background: '#f8f9fa' },
      }}
    >
      <AppShell.Header
        withBorder={false}
        bg="black"
        c="white"
        className="shadow-md"
      >
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={desktopOpened}
              onClick={toggleDesktop}
              visibleFrom="md"
              size="sm"
              color="white"
            />
            <Burger
              opened={mobileOpened}
              onClick={toggleMobile}
              hiddenFrom="md"
              size="sm"
              color="white"
            />
            <Text fw={900} lts="-1px" size="xl">
              VELORA<span className="text-red-500">.</span>
            </Text>
          </Group>

          <Group gap="lg">
            <Text
              size="xs"
              fw={700}
              c="dimmed"
              className="hidden lg:block uppercase tracking-widest"
            >
              Administrator Portal
            </Text>
            <UserMenu user={user} onLogout={handleLogout} variant="dashboard" />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar
        p="0"
        bg="black"
        withBorder={false}
        className="transition-all overflow-hidden"
      >
        {/* Pass desktopOpened state to the sidebar */}
        <AdminSidebar onClose={closeMobile} isExpanded={desktopOpened} />
      </AppShell.Navbar>

      <AppShell.Main>
        <div className="max-w-7xl mx-auto py-4">{children}</div>
      </AppShell.Main>
    </AppShell>
  )
}
