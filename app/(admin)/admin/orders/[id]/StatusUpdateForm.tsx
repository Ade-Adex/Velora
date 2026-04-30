//  /app/(dashboard)/admin/orders/[id]/StatusUpdateForm.tsx

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function StatusUpdateForm({
  orderId,
  currentStatus,
}: {
  orderId: string
  currentStatus: string
}) {
  const [status, setStatus] = useState(currentStatus)
  const [tracking, setTracking] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const res = await fetch('/api/orders/update-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          status,
          trackingNumber: tracking,
        }),
      })

      if (res.ok) {
        alert('Order updated successfully!')
        router.refresh() // Updates the UI with new data
      } else {
        const data = await res.json()
        alert(`Error: ${data.error}`)
      }
    } catch (err) {
      alert('Failed to connect to server')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form
      onSubmit={handleUpdate}
      className="p-6 bg-white border rounded-lg shadow-sm"
    >
      <h3 className="text-lg font-semibold mb-4">Manage Order Fulfillment</h3>

      <div className="space-y-4">
        {/* Status Dropdown */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Order Status
          </label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="mt-1 block w-full border rounded-md p-2"
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {/* Conditional Tracking Input */}
        {status === 'shipped' && (
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Tracking Number (Courier ID)
            </label>
            <input
              type="text"
              placeholder="e.g. GIGL-12345"
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
              className="mt-1 block w-full border rounded-md p-2"
              required={status === 'shipped'}
            />
          </div>
        )}

        <button
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded-md hover:bg-gray-800 disabled:bg-gray-400"
        >
          {loading ? 'Updating...' : 'Save Changes'}
        </button>
      </div>
    </form>
  )
}