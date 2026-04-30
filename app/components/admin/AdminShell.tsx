//  /app/components/admin/AdminShell.tsx

'use client'

import { AppShell, Burger, Group, Text, Title } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import AdminSidebar from './AdminSidebar'

export default function AdminShell({
  children,
}: {
  children: React.ReactNode
}) {
  const [opened, { toggle, close }] = useDisclosure()

  return (
    <AppShell
      header={{ height: 60, collapsed: false }}
      navbar={{
        width: 280,
        breakpoint: 'md',
        collapsed: { mobile: !opened },
      }}
      padding="md"
      // This adds a nice subtle gray background to the main area
      styles={{
        main: { background: '#f8f9fa' },
      }}
    >
      <AppShell.Header withBorder={false} bg="black" c="white">
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="md"
              size="sm"
              color="white"
            />
            <div className="md:hidden">
              <Text fw={900} lts="-1px" size="xl">
                VELORA
              </Text>
            </div>
          </Group>

          <Text
            size="xs"
            fw={700}
            c="dimmed"
            className="hidden md:block uppercase tracking-widest"
          >
            Administrator Portal
          </Text>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="0" bg="black" withBorder={false}>
        <AdminSidebar onClose={close} />
      </AppShell.Navbar>

      <AppShell.Main>
        <div className="max-w-7xl mx-auto py-4">{children}</div>
      </AppShell.Main>
    </AppShell>
  )
}