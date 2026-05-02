// /app/components/vendor/VendorSidebar.tsx

'use client';
import { Stack, Text, Box, ScrollArea, Title, NavLink, ThemeIcon, rem } from '@mantine/core';
import { LayoutDashboard, ShoppingBag, Package, Settings, BarChart3, HelpCircle, Store } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const menuItems = [
  { label: 'Dashboard', href: '/vendor', icon: LayoutDashboard },
  { label: 'My Catalog', href: '/vendor/products', icon: Package },
  { label: 'Sales Ledger', href: '/vendor/orders', icon: ShoppingBag },
  { label: 'Growth Insights', href: '/vendor/analytics', icon: BarChart3 },
  { label: 'Merchant Settings', href: '/vendor/settings', icon: Settings },
];

export default function VendorSidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();

  return (
    <Box h="100%" className="flex flex-col bg-[#0F172A] text-white">
      <Box p="xl" mb="md">
        <Group gap="xs" mb={4}>
          <ThemeIcon variant="gradient" gradient={{ from: 'indigo', to: 'cyan' }} size="lg" radius="md">
            <Store size={20} />
          </ThemeIcon>
          <Title order={3} fw={900} lts="-1px">VELORA</Title>
        </Group>
        <Text size="xs" fw={800} c="indigo.3" lts="1px" tt="uppercase">Merchant Hub</Text>
      </Box>

      <ScrollArea flex={1} px="md">
        <Stack gap={4}>
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = pathname === item.href;
            return (
              <NavLink
                key={item.href}
                component={Link}
                href={item.href}
                onClick={onClose}
                label={item.label}
                leftSection={<Icon size={18} strokeWidth={active ? 2.5 : 1.5} />}
                active={active}
                color="indigo.5"
                variant="filled"
                className="rounded-lg py-3"
                styles={{
                  label: { fontWeight: active ? 800 : 500, fontSize: rem(14) },
                  root: { transition: 'all 0.2s ease' }
                }}
              />
            );
          })}
        </Stack>
      </ScrollArea>

      <Box p="lg" className="border-t border-slate-800 bg-slate-900/50">
        <NavLink
          component={Link}
          href="/support"
          label="Merchant Support"
          leftSection={<HelpCircle size={18} />}
          className="rounded-lg text-slate-400"
        />
      </Box>
    </Box>
  );
}
