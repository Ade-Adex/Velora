'use client'
import { TextInput } from '@mantine/core'
import { Search } from 'lucide-react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useDebouncedCallback } from '@mantine/hooks'

export default function SearchInput({ defaultValue, placeholder }: { defaultValue?: string, placeholder?: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams)
    if (term) params.set('q', term); else params.delete('q')
    params.set('page', '1')
    router.push(`${pathname}?${params.toString()}`)
  }, 400)

  return (
    <TextInput
      placeholder={placeholder || "Search..."}
      leftSection={<Search size={16} />}
      defaultValue={defaultValue}
      onChange={(e) => handleSearch(e.currentTarget.value)}
      size="sm"
    />
  )
}