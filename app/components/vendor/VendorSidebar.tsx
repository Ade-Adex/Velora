// /app/components/vendor/VendorSidebar.tsx


'use client'
import {
  Stack,
  Text,
  Box,
  Group,
  ScrollArea,
  Title,
  NavLink,
  ThemeIcon,
  rem,
  Tooltip,
} from '@mantine/core'
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Settings,
  BarChart3,
  HelpCircle,
  Store,
  ArrowUpRight,
} from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const menuItems = [
  { label: 'Dashboard', href: '/vendor', icon: LayoutDashboard },
  { label: 'My Catalog', href: '/vendor/products', icon: Package },
  { label: 'Sales Ledger', href: '/vendor/orders', icon: ShoppingBag },
  { label: 'Growth Insights', href: '/vendor/analytics', icon: BarChart3 },
  { label: 'Merchant Settings', href: '/vendor/settings', icon: Settings },
]

export default function VendorSidebar({ 
  onClose, 
  isCollapsed 
}: { 
  onClose?: () => void, 
  isCollapsed?: boolean 
}) {
  const pathname = usePathname()

  return (
    <Box h="100%" className="flex flex-col bg-[#0F172A] text-white">
      {/* Brand Section */}
      <Box p={isCollapsed ? "md" : "xl"} py="xl" className="flex justify-center items-center">
        <Group gap="sm" wrap="nowrap" style={{ width: '100%' }} justify={isCollapsed ? 'center' : 'flex-start'}>
          <ThemeIcon
            variant="gradient"
            gradient={{ from: 'indigo.5', to: 'cyan.5' }}
            size={isCollapsed ? 42 : "lg"}
            radius="md"
          >
            <Store size={isCollapsed ? 24 : 20} />
          </ThemeIcon>
          {!isCollapsed && (
            <Box>
              <Title order={3} fw={900} lts="-1px">VELORA</Title>
              <Text size="10px" fw={800} c="indigo.3" lts="1px" tt="uppercase">Merchant</Text>
            </Box>
          )}
        </Group>
      </Box>

      {/* Navigation Section */}
      <ScrollArea flex={1} px={isCollapsed ? "xs" : "md"}>
        <Stack gap={8} py="md">
          {menuItems.map((item) => {
            const Icon = item.icon
            const active = pathname === item.href
            
            const navLink = (
              <NavLink
                key={item.href}
                component={Link}
                href={item.href}
                onClick={onClose}
                label={!isCollapsed && item.label}
                leftSection={
                  <Icon 
                    size={isCollapsed ? 22 : 20} 
                    strokeWidth={active ? 2.5 : 1.5} 
                    className={active ? 'text-white' : 'text-slate-400'}
                  />
                }
                active={active}
                color="indigo.6"
                variant="filled"
                className={`rounded-xl transition-all duration-200 ${isCollapsed ? 'justify-center h-[50px]' : 'py-3'}`}
                styles={{
                  label: { fontWeight: active ? 700 : 500, fontSize: rem(14) },
                  root: { 
                    backgroundColor: active ? undefined : 'transparent',
                    '&:hover': { backgroundColor: 'rgba(255,255,255,0.05)' } 
                  },
                }}
              />
            )

            return isCollapsed ? (
              <Tooltip key={item.href} label={item.label} position="right" withArrow offset={20}>
                {navLink}
              </Tooltip>
            ) : navLink
          })}
        </Stack>
      </ScrollArea>

      {/* Footer Section */}
      <Box p="md" className="mt-auto">
        {!isCollapsed && (
            <Box p="md" mb="md" className="bg-indigo-600/10 border border-indigo-500/20 rounded-2xl">
                <Group justify="space-between" mb="xs">
                    <Text size="xs" fw={700} c="indigo.2">PRO PLAN</Text>
                    <ArrowUpRight size={14} className="text-indigo.4" />
                </Group>
                <Text size="11px" c="slate.4">Unlock advanced analytics and bulk uploads.</Text>
            </Box>
        )}
        
        <Tooltip label="Support" disabled={!isCollapsed} position="right">
            <NavLink
              component={Link}
              href="/support"
              label={!isCollapsed && "Support Center"}
              leftSection={<HelpCircle size={isCollapsed ? 22 : 20} />}
              className={`rounded-xl text-slate-400 ${isCollapsed ? 'justify-center h-[50px]' : ''}`}
            />
        </Tooltip>
      </Box>
    </Box>
  )
}