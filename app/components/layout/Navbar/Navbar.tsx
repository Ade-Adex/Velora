// /app/components/layout/Navbar/Navbar.tsx



'use client'

import React from 'react'
import Link from 'next/link'
import { 
  Burger, 
  Drawer, 
  Group, 
  Text, 
  Divider, 
  ScrollArea, 
  Button, 
  Center, 
  NavLink, 
  rem, 
  Stack
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import { 
  ShoppingCart, 
  Search, 
  User as UserIcon, 
  LayoutGrid, 
  Settings, 
  Package, 
  Heart, 
  LogOut, 
  ShieldCheck
} from 'lucide-react'

import { useApp } from '@/app/context/AppContext'
import { useCartStore } from '@/app/store/useCartStore'
import { useUserStore } from '@/app/store/useUserStore'
import UserMenu from './UserMenu' // The shared component we discussed

export default function Navbar() {
  const [opened, { toggle, close }] = useDisclosure(false)
  const { searchTerm, setSearchTerm } = useApp()

  const user = useUserStore((state) => state.user)
  const logout = useUserStore((state) => state.logout)
  const cart = useCartStore((state) => state.cart)
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0)

  // Professional Role-Based Branding
  const roleColors = {
    admin: { bg: 'bg-slate-900', hover: 'hover:text-red-400' },
    vendor: { bg: 'bg-indigo-700', hover: 'hover:text-indigo-300' },
    customer: { bg: 'bg-[#0052CC]', hover: 'hover:text-orange-400' },
    guest: { bg: 'bg-[#0052CC]', hover: 'hover:text-orange-400' },
  }

  const currentTheme = user ? roleColors[user.role as keyof typeof roleColors] : roleColors.guest

  const navLinks = [
    { name: 'Deals', href: '/deals' },
    { name: 'New Arrivals', href: '/new-arrivals' },
    { name: 'Electronics', href: '/category/electronics' },
    { name: 'Fashion', href: '/category/fashion' },
    { name: 'Home', href: '/category/home' },
  ]

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      logout()
      close()
      window.location.href = '/'
    } catch (error) {
      console.error('Logout failed', error)
    }
  }

  return (
    <header className="w-full bg-white sticky top-0 z-50 shadow-sm">
      {/* --- TOP BAR --- */}
      <div className="container mx-auto px-4 py-3 lg:py-4 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 group">
          <div
            className={`w-10 h-10 ${currentTheme.bg} rounded-xl flex items-center justify-center group-hover:rotate-6 transition-transform`}
          >
            <ShoppingCart className="text-white" size={22} />
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-2xl font-black text-[#171717] tracking-tight">
              Velora<span className="text-[#FF8A00]">.</span>
            </span>
            <span className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase">
              {user?.role === 'vendor' ? 'Vendor Portal' : 'Premium Retail'}
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
            <div className="hidden md:block">
              <UserMenu user={user} onLogout={handleLogout} variant="public" />
            </div>
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

          {/* Cart - Hide for Admin */}
          {user?.role !== 'admin' && (
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
          )}

          <Burger
            opened={opened}
            onClick={toggle}
            hiddenFrom="md"
            size="sm"
            aria-label="Toggle navigation"
          />
        </div>
      </div>

      {/* --- SUB-NAV BAR (Desktop) --- */}
      <nav
        className={`${currentTheme.bg} text-white hidden md:block transition-colors duration-500`}
      >
        <div className="container mx-auto px-4 flex items-center gap-8 py-2.5">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={`text-xs lg:text-sm font-semibold opacity-90 transition-all ${currentTheme.hover}`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      </nav>

      {/* --- MOBILE DRAWER --- */}
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
            {/* 1. User Profile Section */}
            {user ? (
              <Group
                p="md"
                className="bg-gray-50 rounded-2xl mb-4"
                wrap="nowrap"
              >
                <UserMenu
                  user={user}
                  onLogout={handleLogout}
                  variant="dashboard"
                />
                <div style={{ flex: 1, overflow: 'hidden' }}>
                  <Text size="sm" fw={700} truncate>
                    {user.fullName}
                  </Text>
                  <Text size="xs" c="dimmed" truncate>
                    {user.email}
                  </Text>
                </div>
              </Group>
            ) : (
              <Center mb="md" py="md">
                <Button
                  component={Link}
                  href="/auth"
                  onClick={close}
                  radius="xl"
                  color="blue"
                  fullWidth
                  className="bg-[#0052CC]!"
                >
                  Sign In / Register
                </Button>
              </Center>
            )}

            {/* 2. Primary Navigation (Explore) */}
            {/* Logic: Only hide Explore on mobile for Admin/Vendor if you want them to focus solely on management */}
            <div
              className={
                user?.role === 'admin' || user?.role === 'vendor'
                  ? 'hidden md:block'
                  : 'block'
              }
            >
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
                  className="rounded-lg mb-1"
                />
              ))}
            </div>

            {/* 3. Management Section (Vendor/Admin) */}
            {(user?.role === 'vendor' || user?.role === 'admin') && (
              <>
                <Divider my="sm" label="Management" labelPosition="center" />
                <Stack gap={4}>
                  {user.role === 'vendor' && (
                    <NavLink
                      component={Link}
                      href="/vendor"
                      label="Shop Manager"
                      leftSection={<LayoutGrid size={18} />}
                      color="indigo"
                      variant="filled" 
                      onClick={close}
                      className="rounded-lg"
                    />
                  )}

                  {user.role === 'admin' && (
                    <NavLink
                      component={Link}
                      href="/admin"
                      label="Admin Panel"
                      leftSection={<ShieldCheck size={18} />}
                      color="red"
                      variant="filled"
                      onClick={close}
                      className="rounded-lg"
                    />
                  )}
                </Stack>
              </>
            )}

            {/* 4. Personal Account Section */}
            {user && (
              <>
                <Divider my="sm" label="Your Account" labelPosition="center" />
                <Stack gap={4}>
                  <NavLink
                    component={Link}
                    href="/profile"
                    label="Profile Settings"
                    leftSection={<Settings size={18} />}
                    onClick={close}
                    className="rounded-lg"
                  />
                  <NavLink
                    component={Link}
                    href="/profile?tab=orders"
                    label="Track Orders"
                    leftSection={<Package size={18} />}
                    onClick={close}
                    className="rounded-lg"
                  />
                  <NavLink
                    component={Link}
                    href="/wishlist"
                    label="My Wishlist"
                    leftSection={<Heart size={18} />}
                    onClick={close}
                    className="rounded-lg"
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
                </Stack>
              </>
            )}
          </div>
        </ScrollArea>
      </Drawer>
    </header>
  )
}