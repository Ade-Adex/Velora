// /app/components/shop/TrustSignals.tsx

import { Truck, ShieldCheck, RefreshCcw, Headset } from 'lucide-react'

const signals = [
  {
    icon: Truck,
    title: 'Fast Shipping',
    desc: 'Reliable delivery across Nigeria',
  },
  {
    icon: ShieldCheck,
    title: 'Secure Payment',
    desc: '100% encrypted transactions',
  },
  {
    icon: RefreshCcw,
    title: 'Easy Returns',
    desc: '14-day hassle-free return policy',
  },
  { icon: Headset, title: '24/7 Support', desc: 'Dedicated support team' },
]

export default function TrustSignals() {
  return (
    <div className="border-y border-gray-100 bg-white py-8">
      <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
        {signals.map((s, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="p-3 bg-gray-50 rounded-full text-primary">
              <s.icon size={24} />
            </div>
            <div>
              <h4 className="font-semibold text-sm">{s.title}</h4>
              <p className="text-xs text-muted-foreground">{s.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}