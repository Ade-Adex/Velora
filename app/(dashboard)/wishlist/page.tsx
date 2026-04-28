//  /app/(dashboard)/wishlist/page.tsx

'use client'

import {
  Container,
  Title,
  Grid,
  Card,
  Image,
  Text,
  Button,
  Group,
  Stack,
  Center,
} from '@mantine/core'
import { useWishlistStore } from '@/app/store/useWishlistStore'
import { useCartStore } from '@/app/store/useCartStore'
import { ShoppingCart, Trash2, HeartOff } from 'lucide-react'
import Link from 'next/link'

export default function WishlistPage() {
  const { wishlist, toggleWishlist } = useWishlistStore()
  const { addToCart } = useCartStore()

  if (wishlist.length === 0) {
    return (
      <Container size="md" py={100}>
        <Center>
          <Stack align="center" gap="md">
            <HeartOff size={80} strokeWidth={1} color="gray" />
            <Title order={2}>Your wishlist is empty</Title>
            <Text c="dimmed">Save items you like to see them here.</Text>
            <Button component={Link} href="/" variant="light">
              Go Shopping
            </Button>
          </Stack>
        </Center>
      </Container>
    )
  }

  return (
    <Container size="lg" py="xl">
      <Title order={1} mb="xl">
        My Wishlist ({wishlist.length})
      </Title>

      <Grid gap="md">
        {wishlist.map((product) => (
          <Grid.Col
            key={product._id?.toString()}
            span={{ base: 12, sm: 6, md: 4 }}
          >
            <Card withBorder radius="md" p="md">
              <Card.Section component={Link} href={`/product/${product.slug}`}>
                <Image
                  src={
                    typeof product.mainImage === 'string'
                      ? product.mainImage
                      : product.mainImage.src
                  }
                  height={200}
                  alt={product.name}
                  fit="contain"
                  p="md"
                />
              </Card.Section>

              <Stack gap="xs" mt="md">
                <Text fw={700} fz="lg" lineClamp={1}>
                  {product.name}
                </Text>
                <Text fw={900} c="blue.9">
                  ₦{product.basePrice.toLocaleString()}
                </Text>

                <Group gap="xs" grow mt="sm">
                  <Button
                    variant="light"
                    color="blue"
                    leftSection={<ShoppingCart size={16} />}
                    onClick={() => {
                      addToCart({
                        id: product._id!.toString(),
                        name: product.name,
                        price: product.basePrice,
                        image: product.mainImage,
                        quantity: 1,
                        slug: product.slug,
                        brand: product.brand,
                        stock: product.stock,
                      })
                    }}
                  >
                    Add
                  </Button>
                  <Button
                    variant="subtle"
                    color="red"
                    onClick={() => toggleWishlist(product)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </Group>
              </Stack>
            </Card>
          </Grid.Col>
        ))}
      </Grid>
    </Container>
  )
}