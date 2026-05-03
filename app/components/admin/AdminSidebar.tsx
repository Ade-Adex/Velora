// /app/components/admin/AdminSidebar.tsx
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
import { Stack, Text, Box, ScrollArea, Title, Tooltip } from '@mantine/core'

const navLinks = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Team', href: '/admin/team', icon: Users },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminSidebar({ 
  onClose, 
  isExpanded = true 
}: { 
  onClose?: () => void; 
  isExpanded?: boolean 
}) {
  const pathname = usePathname()

  return (
    <Box h="100%" className="flex flex-col text-white transition-all duration-300">
      {/* Sidebar Header */}
      <div className={`hidden md:block transition-all duration-300 overflow-hidden whitespace-nowrap ${isExpanded ? 'p-8' : 'p-4 py-8'}`}>
        {isExpanded ? (
          <>
            <Title order={3} fw={900} lts="-1.5px" c="white">VELORA</Title>
            <Text size="xs" fw={800} c="blue.5" lts="1px" className="uppercase">Management Suite</Text>
          </>
        ) : (
          <Title order={3} fw={900} className="text-center">V<span className="text-red-500">.</span></Title>
        )}
      </div>

      <ScrollArea flex={1} px={isExpanded ? "md" : "xs"}>
        <Stack gap={4}>
          {navLinks.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href))

            const content = (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={`flex items-center rounded-lg transition-all duration-200 no-underline overflow-hidden whitespace-nowrap ${
                  isExpanded ? 'px-4 py-3 gap-3' : 'p-3 justify-center'
                } ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} className="shrink-0" />
                {isExpanded && (
                  <span className="text-sm font-semibold tracking-tight">
                    {link.label}
                  </span>
                )}
              </Link>
            )

            // Show tooltips only when sidebar is collapsed
            return !isExpanded ? (
              <Tooltip key={link.href} label={link.label} position="right" withArrow>
                {content}
              </Tooltip>
            ) : content
          })}
        </Stack>
      </ScrollArea>

      {/* Footer Actions */}
      <div className={`border-t border-white/10 bg-white/5 transition-all duration-300 ${isExpanded ? 'p-6' : 'p-4'}`}>
        <Link
          href="/"
          className={`flex items-center text-gray-400 hover:text-white no-underline group transition-colors ${
            isExpanded ? 'gap-3' : 'justify-center'
          }`}
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform shrink-0" />
          {isExpanded && (
            <span className="text-xs font-bold uppercase tracking-widest whitespace-nowrap">
              Exit Admin
            </span>
          )}
        </Link>
      </div>
    </Box>
  )
}