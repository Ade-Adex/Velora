import { Timer, ShoppingBag, Crown } from 'lucide-react'
import Link from 'next/link'

export default function QuickNav() {
 const items = [
   {
     title: 'Flash Sales',
     sub: 'Ending Soon',
     href: '/collections/flash-sales', 
     icon: Timer,
     color: 'text-orange-500',
     bg: 'bg-orange-50',
   },
   {
     title: 'New Arrivals',
     sub: 'Just In This Week',
     href: '/collections/new-arrivals',
     icon: ShoppingBag,
     color: 'text-blue-500',
     bg: 'bg-blue-50',
   },
   {
     title: 'Best Sellers',
     sub: 'Top Rated Items',
     href: '/collections/best-sellers',
     icon: Crown,
     color: 'text-yellow-500',
     bg: 'bg-yellow-50',
   },
 ]
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {items.map((item, i) => (
        <Link
          key={i}
          href={item.href}
          className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-4 border border-gray-100 hover:shadow-md hover:border-blue-100 transition-all cursor-pointer group"
        >
          <div
            className={`p-3 rounded-xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}
          >
            <item.icon size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h4 className="font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
              {item.title}
            </h4>
            <p className="text-xs text-gray-500">{item.sub}</p>
          </div>
        </Link>
      ))}
    </div>
  )
}
