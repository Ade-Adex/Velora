// /app/components/admin/ProductFilters.tsx

'use client'

import { TextInput, Select, Group, Paper } from '@mantine/core'
import { Search } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTransition } from 'react'

interface ProductFiltersProps {
  categories: { _id: string; name: string }[]
  currentQuery?: string
  currentCategory?: string
}

export default function ProductFilters({
  categories,
  currentQuery,
  currentCategory,
}: ProductFiltersProps) {
  // Add the interface here
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams(window.location.search)
    if (value && value !== 'all') {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    params.set('page', '1')

    startTransition(() => {
      router.push(`/admin/products?${params.toString()}`)
    })
  }

  return (
    <Paper withBorder p="md" radius="md" shadow="sm">
      <Group grow>
        <TextInput
          placeholder="Search products..."
          leftSection={<Search size={16} />}
          defaultValue={currentQuery}
          onChange={(e) => handleFilter('q', e.currentTarget.value)}
        />
        <Select
          placeholder="All Categories"
          // Map your MongoDB categories to Mantine's Select format
          data={[
            { value: 'all', label: 'All Categories' },
            ...categories.map((cat) => ({ value: cat._id, label: cat.name })),
          ]}
          defaultValue={currentCategory || 'all'}
          onChange={(value) => handleFilter('category', value)}
        />
      </Group>
    </Paper>
  )
}