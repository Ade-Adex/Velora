// /app/(vendor)/vendor/products/edit/[id]/page.tsx
export const dynamic = 'force-dynamic'

import {
  Box,
  Title,
  Text,
  Container,
  Paper,
  Breadcrumbs,
  Anchor,
  Stack,
} from '@mantine/core'
import { getVendorProductById } from '@/app/services/vendor-service'
import ProductEditForm from '@/app/components/vendor/ProductEditForm'
import Link from 'next/link'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
}

export default async function VendorEditProductPage({ params }: Props) {
  const { id } = await params
  const product = await getVendorProductById(id)

  if (!product) {
    notFound()
  }

  // FIX: Don't pass Link as a prop to Anchor
  const breadcrumbItems = [
    { title: 'Inventory', href: '/vendor/products' },
    { title: 'Edit Product', href: '#' },
  ].map((item, index) => (
    <Link
      key={index}
      href={item.href}
      style={{
        textDecoration: 'none',
        fontSize: '12px',
        color: 'var(--mantine-color-dimmed)',
      }}
    >
      {item.title}
    </Link>
  ))

  return (
    <Container size="lg" py="md">
      <Stack gap="lg">
        {/* Breadcrumbs works fine as long as children are simple links/elements */}
        <Breadcrumbs>{breadcrumbItems}</Breadcrumbs>

        <Box>
          <Title order={2} fw={900} fz={{ base: 'xl', md: '26px' }}>
            Edit Product
          </Title>
          <Text c="dimmed" size="sm">
            Updating your listing will set its status to &quot;Pending&quot; for
            admin review.
          </Text>
        </Box>

        <Paper withBorder p={{ base: 'md', sm: 'xl' }} radius="md" shadow="sm">
          <ProductEditForm product={product} />
        </Paper>
      </Stack>
    </Container>
  )
}