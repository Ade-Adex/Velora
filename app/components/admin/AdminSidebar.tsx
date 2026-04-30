'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Package,
  ArrowLeft,
  Settings,
} from 'lucide-react'
import { Stack, Text, Box, ScrollArea, Title } from '@mantine/core'

const navLinks = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Team', href: '/admin/team', icon: Users },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminSidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname()

  return (
    <Box h="100%" className="flex flex-col text-white">
      {/* Sidebar Header - Hidden on mobile because it's in the App Header */}
      <div className="hidden md:block p-8">
        <Title order={3} fw={900} lts="-1.5px" c="white">
          VELORA
        </Title>
        <Text size="xs" fw={800} c="blue.5" lts="1px" className="uppercase">
          Management Suite
        </Text>
      </div>

      <ScrollArea flex={1} px="md">
        <Stack gap={4}>
          {navLinks.map((link) => {
            const Icon = link.icon
            // Check if active (handles nested routes like /admin/orders/[id])
            const isActive =
              pathname === link.href ||
              (link.href !== '/admin' && pathname.startsWith(link.href))

            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose} // Closes drawer on mobile when clicking a link
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 no-underline ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-sm font-semibold tracking-tight">
                  {link.label}
                </span>
              </Link>
            )
          })}
        </Stack>
      </ScrollArea>

      {/* Footer Actions */}
      <div className="p-6 border-t border-white/10 bg-white/5">
        <Link
          href="/"
          className="flex items-center gap-3 text-gray-400 hover:text-white no-underline group transition-colors"
        >
          <ArrowLeft
            size={18}
            className="group-hover:-translate-x-1 transition-transform"
          />
          <span className="text-xs font-bold uppercase tracking-widest">
            Exit Admin
          </span>
        </Link>
      </div>
    </Box>
  )
}
