// /app/components/vendor/VendorShell.tsx

'use client'

import { AppShell, Burger, Group, Text, NavLink, Stack, Box, Badge } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { LayoutDashboard, Package, ListOrdered, Settings, ArrowLeft, Store } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { IUser, Serialized } from '@/app/types'

interface VendorShellProps {
  children: React.ReactNode
  user: Serialized<IUser> // Using Serialized type for client-side safety
}

export default function VendorShell({ children, user }: VendorShellProps) {
  const [opened, { toggle, close }] = useDisclosure()
  const pathname = usePathname()

  const links = [
    { label: 'Overview', icon: LayoutDashboard, href: '/vendor' },
    { label: 'My Products', icon: Package, href: '/vendor/products' },
    { label: 'Order Requests', icon: ListOrdered, href: '/vendor/orders' },
    { label: 'Store Settings', icon: Settings, href: '/vendor/settings' },
  ]

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 280,
        breakpoint: 'md',
        collapsed: { mobile: !opened },
      }}
      padding="xl"
      styles={{
        main: { background: '#fcfcfc' },
      }}
    >
      <AppShell.Header withBorder={false} className="shadow-sm">
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="md" size="sm" />
            <Text fw={900} lts="-1.5px" size="xl" className="italic">
              VELORA<span className="text-[#FF8A00]">.</span>
            </Text>
          </Group>
          
          <Group gap="xs">
            <Badge size="lg" color="blue.0" c="blue.9" radius="sm" fw={800} variant="flat">
               {user.vendorProfile?.shopName || 'Merchant'}
            </Badge>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md" bg="white" withBorder>
        <Stack gap="xs" flex={1}>
           <Text size="xs" fw={800} c="dimmed" tt="uppercase" px="sm" mb={4}>
             Store Management
           </Text>
          {links.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <NavLink
                key={item.href}
                component={Link}
                href={item.href}
                label={item.label}
                onClick={close}
                leftSection={<Icon size={18} strokeWidth={isActive ? 2.5 : 2} />}
                active={isActive}
                variant="filled"
                color="blue.7"
                className="rounded-xl font-bold"
              />
            )
          })}
        </Stack>

        <Box className="border-t border-gray-100 pt-4">
          <NavLink
            component={Link}
            href="/"
            label="Exit to Marketplace"
            leftSection={<ArrowLeft size={18} />}
            className="rounded-xl text-gray-500 font-bold"
          />
        </Box>
      </AppShell.Navbar>

      <AppShell.Main>
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </AppShell.Main>
    </AppShell>
  )
    }
