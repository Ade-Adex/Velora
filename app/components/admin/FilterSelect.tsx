'use client'
import { Select } from '@mantine/core'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

export default function FilterSelect({
  defaultValue,
  data,
}: {
  defaultValue?: string
  data: { value: string; label: string }[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleFilter = (val: string | null) => {
    const params = new URLSearchParams(searchParams)
    if (val) params.set('status', val)
    else params.delete('status')
    params.set('page', '1')
    router.push(`${pathname}?${params.toString()}`)
  }

  return (
    <Select
      data={data}
      defaultValue={defaultValue || 'all'}
      onChange={handleFilter}
      size="sm"
      w={{ base: '100%', sm: 200 }}
    />
  )
}
