// /app/components/vendor/VendorShell.tsx

'use client'
import { IUser } from '@/app/types'
import { AppShell, Burger, Group, Text, NavLink, Stack, Box, Badge } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { LayoutDashboard, Package, ListOrdered, Settings, Store, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function VendorShell({ children, user }: { children: React.ReactNode, user: IUser }) {
  const [opened, { toggle }] = useDisclosure()
  const pathname = usePathname()

  const links = [
    { label: 'Overview', icon: LayoutDashboard, href: '/vendor' },
    { label: 'My Products', icon: Package, href: '/vendor/products' },
    { label: 'Order Requests', icon: ListOrdered, href: '/vendor/orders' },
    { label: 'Store Settings', icon: Settings, href: '/vendor/settings' },
  ]

  return (
    <AppShell
      header={{ height: 70 }}
      navbar={{ width: 260, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header px="md" className="flex items-center justify-between border-b-0 shadow-sm">
        <Group>
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Text fw={900} size="xl" tracking="-1px">VELORA <span className="text-blue-600">MERCHANT</span></Text>
        </Group>
        <Group>
           <Badge size="lg" color="blue.1" c="blue.7" radius="sm">Vendor Account</Badge>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md" bg="gray.0">
        <Stack gap="xs" flex={1}>
          {links.map((item) => (
            <NavLink
              key={item.href}
              component={Link}
              href={item.href}
              label={item.label}
              leftSection={<item.icon size={18} />}
              active={pathname === item.href}
              variant="filled"
              color="blue"
              className="rounded-lg"
            />
          ))}
        </Stack>

        <Box className="border-t pt-4">
          <NavLink
            component={Link}
            href="/"
            label="Back to Marketplace"
            leftSection={<ArrowLeft size={18} />}
            className="rounded-lg"
          />
        </Box>
      </AppShell.Navbar>

      <AppShell.Main bg="gray.0">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </AppShell.Main>
    </AppShell>
  )
}