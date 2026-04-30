'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  ShoppingBag,
  Users,
  Package,
  Settings,
  ArrowLeft,
} from 'lucide-react'

const navLinks = [
  { label: 'Overview', href: '/admin', icon: LayoutDashboard },
  { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
  { label: 'Products', href: '/admin/products', icon: Package },
  { label: 'Team', href: '/admin/team', icon: Users },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-black text-white h-screen fixed left-0 top-0 p-6 flex flex-col">
      <div className="mb-10 px-2">
        <h2 className="text-xl font-black tracking-tighter">VELORA ADMIN</h2>
        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
          Management Suite
        </p>
      </div>

      <nav className="flex-1 space-y-2">
        {navLinks.map((link) => {
          const Icon = link.icon
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? 'bg-white text-black'
                  : 'text-gray-400 hover:text-white hover:bg-gray-900'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{link.label}</span>
            </Link>
          )
        })}
      </nav>

      <div className="mt-auto pt-6 border-t border-gray-800">
        <Link
          href="/"
          className="flex items-center gap-3 text-gray-400 hover:text-white px-4 py-2"
        >
          <ArrowLeft size={18} />
          <span className="text-sm">Back to Store</span>
        </Link>
      </div>
    </aside>
  )
}
