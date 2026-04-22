// /app/

import { Timer, ShoppingBag, Crown } from 'lucide-react'

export default function QuickNav() {
  const items = [
    {
      title: 'Flash Sales',
      sub: '(Ends in 2h 15m)',
      icon: Timer,
      color: 'text-orange-500',
      bg: 'bg-orange-50',
    },
    {
      title: 'New Arrivals',
      sub: 'New Items',
      icon: ShoppingBag,
      color: 'text-blue-500',
      bg: 'bg-blue-50',
    },
    {
      title: 'Best Sellers',
      sub: 'Best Items Available',
      icon: Crown,
      color: 'text-yellow-500',
      bg: 'bg-yellow-50',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {items.map((item, i) => (
        <div
          key={i}
          className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-4 border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
        >
          <div className={`p-3 rounded-xl ${item.bg} ${item.color}`}>
            <item.icon size={28} strokeWidth={2.5} />
          </div>
          <div>
            <h4 className="font-bold text-gray-800">{item.title}</h4>
            <p className="text-xs text-gray-500">{item.sub}</p>
          </div>
        </div>
      ))}
    </div>
  )
}