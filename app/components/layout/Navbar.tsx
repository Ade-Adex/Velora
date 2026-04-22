'use client'
import Link from 'next/link'
import { Search, ShoppingCart, User, Heart, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useApp } from '@/app/context/AppContext'
import { useCartStore } from '@/app/store/useCartStore'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { setAuthModalOpen, user, searchTerm, setSearchTerm } = useApp()
  const cart = useCartStore((state) => state.cart)

  // Calculate total items in cart for the badge
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0)

  const navLinks = [
    { name: 'Deals', href: '/deals' },
    { name: 'New Arrivals', href: '/new-arrivals' },
    { name: 'Electronics', href: '/category/electronics' },
    { name: 'Fashion', href: '/category/fashion' },
    { name: 'Home', href: '/category/home' },
  ]

  return (
    <header className="w-full bg-white sticky top-0 z-50 shadow-sm">
      {/* Top Bar: Logo, Search, and Actions */}
      <div className="container mx-auto px-4 py-3 lg:py-4 flex items-center justify-between gap-4">
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
            className="w-full bg-[#F4F7FA] border-none rounded-full py-2.5 px-6 focus:ring-2 focus:ring-[#0052CC] transition-all outline-none text-sm"
          />
          <button className="absolute right-1 top-1/2 -translate-y-1/2 bg-[#FF8A00] p-2 rounded-full text-white hover:bg-orange-600 transition">
            <Search size={18} />
          </button>
        </div>

        {/* User Actions */}
        <div className="flex items-center gap-3 lg:gap-6">
          <button
            onClick={() => setAuthModalOpen(true)}
            className="flex items-center gap-2 text-gray-700 hover:text-[#0052CC] transition font-medium"
          >
            <User size={20} />
            <span className="hidden lg:inline text-sm">
              {user ? user.fullName : 'Account'}
            </span>
          </button>

          <Link
            href="/wishlist"
            className="hidden sm:block text-gray-700 hover:text-[#0052CC]"
          >
            <Heart size={20} />
          </Link>

          <Link
            href="/cart"
            className="relative text-gray-700 hover:text-[#0052CC]"
          >
            <ShoppingCart size={22} />
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-[#FF8A00] text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          <button
            className="md:hidden text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Bottom Bar: Category Links (Desktop) */}
      <nav className="hidden md:block bg-[#0052CC] text-white">
        <div className="container mx-auto px-4 flex items-center gap-8 py-2.5">
          <button className="flex items-center gap-2 bg-[#0041a3] px-4 py-1.5 rounded-md font-semibold text-xs uppercase tracking-wider">
            <Menu size={14} /> All Categories
          </button>
          <div className="flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-xs lg:text-sm font-medium hover:text-orange-400 transition-colors"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Dropdown */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t p-4 space-y-4 animate-in slide-in-from-top duration-300">
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-gray-100 rounded-lg py-2.5 px-4 outline-none text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="text-gray-700 font-semibold py-3 border-b border-gray-50 flex items-center justify-between"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  )
}
