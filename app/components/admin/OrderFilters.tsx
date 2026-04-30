//  /app/components/admin/OrderFilters.tsx

'use client'

import { TextInput, Select, Group, Paper } from '@mantine/core'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { Search } from 'lucide-react'
import { useDebouncedCallback } from '@mantine/hooks'

export default function OrderFilters({
  currentQuery,
  currentStatus,
}: {
  currentQuery?: string
  currentStatus?: string
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Update URL when filtering
  const handleFilter = useDebouncedCallback((name: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    params.set('page', '1') // Reset to page 1 on new search
    if (value && value !== 'all') {
      params.set(name, value)
    } else {
      params.delete(name)
    }
    router.push(`${pathname}?${params.toString()}`)
  }, 400)

  return (
    <Paper withBorder p="md" radius="md" shadow="xs">
      <Group grow align="flex-end">
        <TextInput
          label="Search Orders"
          placeholder="Order # or Name..."
          leftSection={<Search size={16} />}
          defaultValue={currentQuery}
          onChange={(e) => handleFilter('q', e.currentTarget.value)}
        />

        <Select
          label="Filter Status"
          placeholder="All Statuses"
          defaultValue={currentStatus || 'all'}
          onChange={(val) => handleFilter('status', val || 'all')}
          data={[
            { value: 'all', label: 'All Statuses' },
            { value: 'pending', label: 'Pending' },
            { value: 'shipped', label: 'Shipped' },
            { value: 'delivered', label: 'Delivered' },
            { value: 'cancelled', label: 'Cancelled' },
          ]}
        />
      </Group>
    </Paper>
  )
}