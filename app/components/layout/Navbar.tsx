'use client'
import Link from 'next/link'
import {
  Search,
  ShoppingCart,
  User as UserIcon,
  Heart,
  Menu as MenuIcon,
  X,
  LogOut,
  Package,
  Settings,
  ChevronDown
} from 'lucide-react'
import { useState } from 'react'
import { useApp } from '@/app/context/AppContext'
import { useCartStore } from '@/app/store/useCartStore'
import { 
  Menu, 
  Button, 
  Text, 
  Avatar, 
  Group, 
  UnstyledButton, 
  rem, 
  Divider 
} from '@mantine/core'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, searchTerm, setSearchTerm, setUser } = useApp()
  const cart = useCartStore((state) => state.cart)

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0)

  const navLinks = [
    { name: 'Deals', href: '/deals' },
    { name: 'New Arrivals', href: '/new-arrivals' },
    { name: 'Electronics', href: '/category/electronics' },
    { name: 'Fashion', href: '/category/fashion' },
    { name: 'Home', href: '/category/home' },
  ]

  const handleLogout = () => {
    setUser(null)
    // Add any logic to clear cookies/tokens here
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
          <button className="absolute right-1 top-1/2 -translate-y-1/2 bg-[#FF8A00] p-2 rounded-full text-white hover:bg-orange-600 transition">
            <Search size={18} />
          </button>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-3 lg:gap-6">
          {user ? (
            /* SIGNED IN STATE: Mantine Dropdown */
            <Menu
              shadow="md"
              width={220}
              radius="md"
              transitionProps={{ transition: 'pop-top-right' }}
              position="bottom-end"
              withinPortal
            >
              <Menu.Target>
                <UnstyledButton className="p-1 pr-2 rounded-xl hover:bg-gray-50 transition-colors">
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
                  leftSection={
                    <UserIcon style={{ width: rem(16), height: rem(16) }} />
                  }
                  component={Link}
                  href="/profile"
                >
                  Profile Details
                </Menu.Item>
                <Menu.Item
                  leftSection={
                    <Package style={{ width: rem(16), height: rem(16) }} />
                  }
                  component={Link}
                  href="/orders"
                >
                  My Orders
                </Menu.Item>
                <Menu.Item
                  leftSection={
                    <Heart style={{ width: rem(16), height: rem(16) }} />
                  }
                  component={Link}
                  href="/wishlist"
                >
                  Wishlist
                </Menu.Item>

                <Divider my="xs" />

                <Menu.Label>Settings</Menu.Label>
                <Menu.Item
                  leftSection={
                    <Settings style={{ width: rem(16), height: rem(16) }} />
                  }
                  component={Link}
                  href="/settings"
                >
                  Account Settings
                </Menu.Item>
                <Menu.Item
                  color="red"
                  leftSection={
                    <LogOut style={{ width: rem(16), height: rem(16) }} />
                  }
                  onClick={handleLogout}
                >
                  Log out
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          ) : (
            /* LOGGED OUT STATE */
            <Link
              href="/auth"
              className="flex items-center gap-2 text-gray-700 hover:text-[#0052CC] transition font-medium"
            >
              <div className="p-2 bg-gray-100 rounded-full">
                <UserIcon size={20} />
              </div>
              <div className="hidden lg:flex flex-col items-start leading-tight">
                <span className="text-[10px] text-gray-400 font-bold uppercase">
                  Sign In
                </span>
                <span className="text-sm font-bold">Account</span>
              </div>
            </Link>
          )}

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

          <button
            className="md:hidden text-gray-700 p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <MenuIcon size={24} />}
          </button>
        </div>
      </div>

      {/* Categories Navigation (Desktop) */}
      <nav className="hidden md:block bg-[#0052CC] text-white">
        <div className="container mx-auto px-4 flex items-center gap-8 py-2">
          <div className="flex items-center gap-7">
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
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t p-4 space-y-4 shadow-xl">
          {!user && (
            <Button
              fullWidth
              component={Link}
              href="/auth"
              color="blue"
              radius="md"
              size="md"
              onClick={() => setIsMenuOpen(false)}
            >
              Sign In to Velora
            </Button>
          )}

          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-800 font-bold py-3 border-b border-gray-50 flex items-center justify-between"
              >
                {link.name}
              </Link>
            ))}
            {user && (
              <button
                onClick={handleLogout}
                className="text-red-500 font-bold py-3 flex items-center gap-2"
              >
                <LogOut size={18} /> Logout
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  )
}