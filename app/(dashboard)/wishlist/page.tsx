// /app/(dashboard)/wishlist/page.tsx
'use client'

import { useEffect, useState } from 'react'
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
  Loader,
} from '@mantine/core'
import { useWishlistStore } from '@/app/store/useWishlistStore'
import { useCartStore } from '@/app/store/useCartStore'
import { useUserStore } from '@/app/store/useUserStore'
import {
  getUserWishlistAction,
  syncWishlistAction,
} from '@/app/services/wishlist-service'
import { ShoppingCart, Trash2, HeartOff } from 'lucide-react'
import Link from 'next/link'
import { IProduct } from '@/app/types'

export default function WishlistPage() {
  const { wishlist, toggleWishlist, setWishlist } = useWishlistStore()
  const { addToCart } = useCartStore()
  const { user } = useUserStore()
  const [loading, setLoading] = useState(true)

  // 1. Sync from DB on Mount
  useEffect(() => {
    const fetchDBWishlist = async () => {
      if (user?._id) {
        const result = await getUserWishlistAction(user._id.toString())
        if (result.success) {
          setWishlist(result.data)
        }
      }
      setLoading(false)
    }
    fetchDBWishlist()
  }, [user?._id, setWishlist])

  // 2. Handle Removal and Sync
  const handleRemove = async (product: IProduct) => {
    toggleWishlist(product) 

    if (user?._id) {
      // Get state after toggle
      const currentWishlist = useWishlistStore.getState().wishlist
      const ids = currentWishlist.map((p) => p._id!.toString())
      await syncWishlistAction(user._id.toString(), ids)
    }
  }

  if (loading) {
    return (
      <Container size="md" py={100}>
        <Center>
          <Loader color="blue" />
        </Center>
      </Container>
    )
  }

  if (wishlist.length === 0) {
    return (
      <Container size="md" py={100}>
        <Center>
          <Stack align="center" gap="md">
            <HeartOff size={80} strokeWidth={1} color="gray" />
            <Title order={2}>Your wishlist is empty</Title>
            <Text c="dimmed">
              Items synced to your account will appear here.
            </Text>
            <Button component={Link} href="/shop" variant="light">
              Go Shopping
            </Button>
          </Stack>
        </Center>
      </Container>
    )
  }

  return (
    <Container size="lg" py="lg">
      <Title order={3} fw={700} c="blue.9" ta="center" mb="lg">
        My Wishlist ({wishlist.length})
      </Title>
      <Grid gap="md">
        {wishlist.map((product) => (
          <Grid.Col
            key={product._id?.toString()}
            span={{ base: 12, sm: 6, md: 3 }}
          >
            <Card withBorder radius="md" p="md">
              <Card.Section
                component={Link}
                href={`/product/${product.slug}`}
                bg="gray.0"
              >
                <Image
                  src={
                    typeof product.mainImage === 'string'
                      ? product.mainImage
                      : product.mainImage.src
                  }
                  height={140}
                  alt={product.name}
                  fit="contain"
                  w="auto" 
                  mx="auto" 
                  p="lg" 
                />
              </Card.Section>

              <Stack gap="xs" mt="md">
                <Text fw={700} fz="sm" lineClamp={1}>
                  {product.name}
                </Text>
                <Text fw={900} c="blue.9">
                  ₦{product.basePrice.toLocaleString()}
                </Text>

                <Group gap="xs" grow mt="sm">
                  <Button
                    variant="light"
                    leftSection={<ShoppingCart size={16} />}
                    onClick={() =>
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
                    }
                  >
                    Add
                  </Button>
                  <Button
                    variant="subtle"
                    color="red"
                    onClick={() => handleRemove(product)}
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
