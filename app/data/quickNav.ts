import { Timer, ShoppingBag, Crown } from 'lucide-react'


export const quickNavItems = [
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