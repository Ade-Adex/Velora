// /app/components/layout/Navbar/UserMenu.tsx


'use client'


import { IUser, Serialized } from '@/app/types'
import {
  Menu,
  UnstyledButton,
  Group,
  Avatar,
  Text,
  Badge,
  Divider,
  Box,
} from '@mantine/core'
import {
  ChevronDown,
  User,
  Package,
  Heart,
  LogOut,
  Store,
  ShieldCheck,
  Settings,
} from 'lucide-react'
import Link from 'next/link'

export default function UserMenu({
  user,
  onLogout,
  variant = 'public',
}: {
  user: IUser | Serialized<IUser>
  onLogout: () => void
  variant?: 'public' | 'dashboard'
}) {
  const firstName = user.fullName?.split(' ')[0] || 'User'
  const isVendor = user.role === 'vendor'
  const isAdmin = user.role === 'admin'

  return (
    <Menu
      shadow="xl"
      width={260}
      radius="md"
      position="bottom-end"
      withArrow
      transitionProps={{ transition: 'pop-top-right' }}
    >
      <Menu.Target>
        <UnstyledButton className="p-1 pr-2 rounded-full hover:bg-gray-100/50 transition-colors border border-transparent">
          <Group gap={8}>
            <Avatar
              src={user.image}
              radius="xl"
              size="sm"
              color={isVendor ? 'indigo' : isAdmin ? 'red' : 'blue'}
            >
              {user.fullName?.charAt(0)}
            </Avatar>
            {/* Show name on public navbar, maybe just arrow on dashboard */}
            {variant === 'public' && (
              <div className="hidden lg:block text-left">
                <Text
                  c="dimmed"
                  fw={700}
                  tt="uppercase"
                  lts="0.5px"
                  className="text-[8px]! leading-none mb-1"
                >
                  {user.role} Account
                </Text>
                <Group gap={4}>
                  <Text size="sm" fw={800} className="text-black leading-none">
                    {firstName}
                  </Text>
                  <ChevronDown size={14} className="text-gray-400" />
                </Group>
              </div>
            )}
            {variant === 'dashboard' && (
              <ChevronDown size={14} className="text-gray-400" />
            )}
          </Group>
        </UnstyledButton>
      </Menu.Target>

      <Menu.Dropdown p="xs">
        <Box p="xs">
          <Group gap="sm" mb="xs">
            <Avatar
              src={user.image}
              radius="md"
              size="lg"
              color={isVendor ? 'indigo' : 'blue'}
            />
            <Box style={{ flex: 1 }}>
              <Text size="sm" fw={800} truncate>
                {user.fullName}
              </Text>
              <Text size="xs" c="dimmed" truncate>
                {user.email}
              </Text>
            </Box>
          </Group>
          {isVendor && user.vendorProfile?.shopName && (
            <Badge variant="light" color="indigo" fullWidth size="sm">
              {user.vendorProfile.shopName}
            </Badge>
          )}
        </Box>

        <Divider my="xs" />

        {/* PRIMARY ROLE ACTIONS */}
        {isVendor && (
          <Menu.Item
            leftSection={<Store size={16} className="text-indigo-600" />}
            component={Link}
            href="/vendor"
            className="bg-indigo-50 hover:bg-indigo-100 mb-1"
          >
            <Text fw={700} c="indigo.9">
              Shop Manager
            </Text>
          </Menu.Item>
        )}

        {isAdmin && (
          <Menu.Item
            leftSection={<ShieldCheck size={16} className="text-red-600" />}
            component={Link}
            href="/admin"
            className="bg-red-50 hover:bg-red-100 mb-1"
          >
            <Text fw={700} c="red.9">
              Admin Panel
            </Text>
          </Menu.Item>
        )}

        <Menu.Label>Account Settings</Menu.Label>
        <Menu.Item
          leftSection={<User size={16} />}
          component={Link}
          href={isVendor ? '/vendor/profile' : '/profile'}
        >
          My Profile
        </Menu.Item>

        {user.role === 'customer' && (
          <>
            <Menu.Item
              leftSection={<Package size={16} />}
              component={Link}
              href="/profile?tab=orders"
            >
              Orders
            </Menu.Item>
            <Menu.Item
              leftSection={<Heart size={16} />}
              component={Link}
              href="/wishlist"
            >
              Wishlist
            </Menu.Item>
          </>
        )}

        <Menu.Item
          leftSection={<Settings size={16} />}
          component={Link}
          href={isVendor ? '/vendor/settings' : '/settings'}
        >
          Settings
        </Menu.Item>

        <Divider my="xs" />
        <Menu.Item
          color="red"
          leftSection={<LogOut size={16} />}
          onClick={onLogout}
        >
          Log out
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  )
}
