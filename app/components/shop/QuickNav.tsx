import { quickNavItems } from '@/app/data/quickNav'
import Link from 'next/link'

export default function QuickNav() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {quickNavItems.map((item, i) => (
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
