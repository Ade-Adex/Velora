'use client'

import { Pagination, Group } from '@mantine/core'
import Link from 'next/link'

interface Props {
  totalPages: number
  activePage: number
  queryText: string
  statusFilter: string
}

export default function LogisticsPagination({
  totalPages,
  activePage,
  queryText,
  statusFilter,
}: Props) {
  const baseUrl = `?q=${queryText}&status=${statusFilter}`

  return (
    <Group justify="center">
      <Pagination
        total={totalPages}
        value={activePage}
        // Use the 'getItemProps' pattern inside a Client Component
        getItemProps={(page) => ({
          component: Link,
          href: `${baseUrl}&page=${page}`,
        })}
        getControlProps={(control) => {
          const targetPage =
            control === 'next' ? activePage + 1 : activePage - 1
          return {
            component: Link,
            href: `${baseUrl}&page=${targetPage}`,
          }
        }}
      />
    </Group>
  )
}
