'use client'

import Link from 'next/link'
import {
  Search,
  ShoppingCart,
  User as UserIcon,
  Heart,
  LogOut,
  Package,
  Settings,
  ChevronDown,
  LayoutGrid,
} from 'lucide-react'
import { useApp } from '@/app/context/AppContext'
import { useCartStore } from '@/app/store/useCartStore'
import { useUserStore } from '@/app/store/useUserStore'
import { useDisclosure } from '@mantine/hooks'
import {
  Menu,
  Button,
  Text,
  Avatar,
  Group,
  UnstyledButton,
  rem,
  Divider,
  Drawer,
  Burger,
  ScrollArea,
  NavLink,
  Center,
} from '@mantine/core'

export default function Navbar() {
  const [opened, { toggle, close }] = useDisclosure(false)
  const { searchTerm, setSearchTerm } = useApp()

  // Zustand State Management
  const user = useUserStore((state) => state.user)
  const logout = useUserStore((state) => state.logout)
  const cart = useCartStore((state) => state.cart)

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0)

  const navLinks = [
    { name: 'Deals', href: '/deals' },
    { name: 'New Arrivals', href: '/new-arrivals' },
    { name: 'Electronics', href: '/category/electronics' },
    { name: 'Fashion', href: '/category/fashion' },
    { name: 'Home', href: '/category/home' },
  ]

  // Inside your Navbar component
  const handleLogout = async () => {
    try {
      // 1. Call the API to destroy the server cookie
      await fetch('/api/auth/logout', { method: 'POST' })

      // 2. Clear the Zustand store (local storage)
      logout()

      // 3. Close the mobile drawer if open
      close()

      // 4. Force a refresh or redirect to home to ensure all states are reset
      window.location.href = '/'
    } catch (error) {
      console.error('Logout failed', error)
    }
  }

  return (
    <header className="w-full bg-white sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 py-3 lg:py-4 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <div className="w-10 h-10 bg-[#0052CC] rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform">
            <ShoppingCart className="text-white" size={22} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-2xl font-black text-[#171717] tracking-tight">
              Velora<span className="text-[#FF8A00]">.</span>
            </span>
            <span className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase">
              Premium Retail
            </span>
          </div>
        </Link>

        {/* Search Bar (Desktop) */}
        <div className="hidden md:flex flex-1 max-w-xl relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products, brands..."
            className="w-full bg-[#F4F7FA] border-none rounded-full py-2.5 px-6 focus:ring-2 focus:ring-[#0052CC] transition-all outline-none text-sm text-black"
          />
          <button className="absolute right-1 top-1/2 -translate-y-1/2 bg-[#FF8A00] p-2 rounded-full text-white hover:bg-orange-600 transition shadow-md">
            <Search size={18} />
          </button>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-3 lg:gap-6">
          {user ? (
            <Menu
              shadow="md"
              width={220}
              radius="md"
              position="bottom-end"
              withinPortal
              transitionProps={{ transition: 'pop-top-right' }}
            >
              <Menu.Target>
                <UnstyledButton className="p-1 pr-2 rounded-xl hover:bg-gray-50 transition-colors hidden md:block border border-transparent hover:border-gray-100">
                  <Group gap={8}>
                    <Avatar color="blue" radius="xl" size="sm" variant="filled">
                      {user.fullName?.charAt(0).toUpperCase()}
                    </Avatar>
                    <div className="hidden lg:block text-left">
                      <Text
                        size="xs"
                        c="dimmed"
                        fw={700}
                        tt="uppercase"
                        lts="0.5px"
                        style={{ lineHeight: 1 }}
                      >
                        Welcome
                      </Text>
                      <Group gap={4}>
                        <Text
                          size="sm"
                          fw={800}
                          className="text-black leading-none"
                        >
                          {user.fullName.split(' ')[0]}
                        </Text>
                        <ChevronDown size={14} className="text-gray-400" />
                      </Group>
                    </div>
                  </Group>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown p="xs">
                <Menu.Label>My Account</Menu.Label>
                <Menu.Item
                  leftSection={<UserIcon size={16} />}
                  component={Link}
                  href="/profile"
                >
                  Profile Details
                </Menu.Item>
                <Menu.Item
                  leftSection={<Package size={16} />}
                  component={Link}
                  href="/orders"
                >
                  My Orders
                </Menu.Item>
                <Menu.Item
                  leftSection={<Heart size={16} />}
                  component={Link}
                  href="/wishlist"
                >
                  Wishlist
                </Menu.Item>
                <Divider my="xs" />
                <Menu.Item
                  color="red"
                  leftSection={<LogOut size={16} />}
                  onClick={handleLogout}
                >
                  Log out
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          ) : (
            <Link
              href="/auth"
              className="hidden md:flex items-center gap-2 text-gray-700 hover:text-[#0052CC] font-medium transition-colors"
            >
              <div className="p-2 bg-gray-100 rounded-full">
                <UserIcon size={20} />
              </div>
              <div className="hidden lg:flex flex-col leading-tight">
                <span className="text-[10px] text-gray-400 font-bold uppercase">
                  Sign In
                </span>
                <span className="text-sm font-bold">Account</span>
              </div>
            </Link>
          )}

          {/* Cart Icon */}
          <Link
            href="/cart"
            className="relative text-gray-700 hover:text-[#0052CC] p-2 hover:bg-gray-50 rounded-full transition"
          >
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute top-0 right-0 bg-[#FF8A00] text-white text-[10px] font-bold min-w-4.5 h-4.5 px-1 rounded-full flex items-center justify-center border-2 border-white">
                {cartCount}
              </span>
            )}
          </Link>

          <Burger
            opened={opened}
            onClick={toggle}
            hiddenFrom="md"
            size="sm"
            aria-label="Toggle navigation"
          />
        </div>
      </div>

      {/* Desktop Navigation Sub-bar */}
      <nav className="hidden md:block bg-[#0052CC] text-white">
        <div className="container mx-auto px-4 flex items-center gap-8 py-2.5">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-xs lg:text-sm font-semibold opacity-90 hover:opacity-100 hover:text-orange-400 transition-all"
            >
              {link.name}
            </Link>
          ))}
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <Drawer
        opened={opened}
        onClose={close}
        size="80%"
        padding="md"
        title={
          <Text fw={900} size="xl">
            Velora<span className="text-[#FF8A00]">.</span>
          </Text>
        }
        hiddenFrom="md"
        zIndex={1000}
      >
        <ScrollArea h={`calc(100vh - ${rem(80)})`} mx="-md">
          <div className="px-md pb-xl">
            {user ? (
              <Group p="md" className="bg-gray-50 rounded-2xl mb-4">
                <Avatar color="blue" radius="xl" size="lg" variant="filled">
                  {user.fullName?.charAt(0).toUpperCase()}
                </Avatar>
                <div style={{ flex: 1 }}>
                  <Text size="sm" fw={700}>
                    {user.fullName}
                  </Text>
                  <Text size="xs" c="dimmed" className="truncate w-40">
                    {user.email}
                  </Text>
                </div>
              </Group>
            ) : (
              <Center mb="md">
                <Button
                  component={Link}
                  href="/auth"
                  onClick={close}
                  radius="xl"
                  color="blue"
                  px="xl"
                  className="bg-[#0052CC]! hover:bg-[#0045ad]! transition-colors"
                >
                  Sign In / Register
                </Button>
              </Center>
            )}

            <Divider my="sm" label="Explore" labelPosition="center" />
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                component={Link}
                href={link.href}
                label={link.name}
                onClick={close}
                leftSection={<LayoutGrid size={18} strokeWidth={1.5} />}
                styles={{ label: { fontWeight: 600 } }}
              />
            ))}

            {user && (
              <>
                <Divider my="sm" label="Your Account" labelPosition="center" />
                <NavLink
                  component={Link}
                  href="/profile"
                  label="Profile Settings"
                  leftSection={<Settings size={18} />}
                  onClick={close}
                />
                <NavLink
                  component={Link}
                  href="/orders"
                  label="Track Orders"
                  leftSection={<Package size={18} />}
                  onClick={close}
                />
                <NavLink
                  component={Link}
                  href="/wishlist"
                  label="My Wishlist"
                  leftSection={<Heart size={18} />}
                  onClick={close}
                />

                <NavLink
                  label="Logout"
                  color="red"
                  leftSection={<LogOut size={18} />}
                  onClick={handleLogout}
                  mt="xl"
                  variant="light"
                  className="rounded-lg"
                />
              </>
            )}
          </div>
        </ScrollArea>
      </Drawer>
    </header>
  )
}
