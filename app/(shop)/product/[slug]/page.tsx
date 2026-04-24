//  /app/(shop)/product/[slug]/page.tsx

'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  Container,
  Grid,
  Stack,
  Title,
  Text,
  Group,
  Button,
  Badge,
  Divider,
  Rating,
  ActionIcon,
  Tabs,
  Table,
  Paper,
} from '@mantine/core'
import {
  ShoppingCart,
  Heart,
  Share2,
  Truck,
  ShieldCheck,
  RefreshCcw,
  Minus,
  Plus,
  ArrowLeft,
} from 'lucide-react'
import { products } from '@/app/data/products'
import { useCartStore } from '@/app/store/useCartStore'
import { CartItem } from '@/app/types'

export default function ProductDetails() {
  const { slug } = useParams()
  const router = useRouter()

  const { cart, addToCart, updateQuantity } = useCartStore()

  const product = products.find((p) => p.slug === slug)

  // 2. Check if product exists in cart
  const cartItem = cart.find((item) => item.id === product?.id)

  // 3. Local state for items NOT yet in cart
  const [localQuantity, setLocalQuantity] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)

  if (!product) return null

  const currentQuantity = cartItem ? cartItem.quantity : localQuantity

  const handleQuantityChange = (newQty: number) => {
    const val = Math.max(1, newQty)
    if (cartItem) {
      updateQuantity(product.id, val)
    } else {
      setLocalQuantity(val)
    }
  }

  const handleAddToCart = () => {
    if (cartItem) {
      // Optional: Redirect to cart or show a "Go to Cart" state
      router.push('/cart')
    } else {
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: localQuantity,
        slug: product.slug,
      } as CartItem)
    }
  }

  return (
    <Container size="lg" py="xl">
      {/* Breadcrumbs / Back button */}
      <Button
        variant="subtle"
        color="gray"
        leftSection={<ArrowLeft size={16} />}
        onClick={() => router.back()}
        mb="xl"
      >
        Back
      </Button>

      <Grid gap={50}>
        {/* LEFT SIDE: Image Gallery */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Stack pos="sticky" top={100}>
            <Paper withBorder radius="md" p="md" bg="#F8F9FA">
              <div className="relative aspect-square">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  style={{ objectFit: 'contain' }}
                  priority
                />
              </div>
            </Paper>

            {/* Thumbnail Row (Mocking gallery for now) */}
            <Group gap="sm">
              {[...Array(4)].map((_, i) => (
                <Paper
                  key={i}
                  withBorder
                  radius="md"
                  p={5}
                  onClick={() => setSelectedImage(i)}
                  className={`cursor-pointer transition-all ${selectedImage === i ? 'border-blue-500' : ''}`}
                >
                  <Image
                    src={product.image}
                    alt="thumb"
                    width={70}
                    height={70}
                    style={{ objectFit: 'contain' }}
                  />
                </Paper>
              ))}
            </Group>
          </Stack>
        </Grid.Col>

        {/* RIGHT SIDE: Product Info */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Stack gap="md">
            <div>
              <Badge color="blue" variant="light" mb="xs">
                {product.brand}
              </Badge>
              <Title order={1} fz={32} fw={900}>
                {product.name}
              </Title>

              <Group gap="xs" mt="sm">
                <Rating value={product.rating} readOnly />
                <Text size="sm" c="dimmed">
                  ({product.reviews.toLocaleString()} Reviews)
                </Text>
              </Group>
            </div>

            <Group align="flex-end" gap="xs">
              <Text fz={32} fw={900} c="blue">
                ${product.price.toLocaleString()}
              </Text>
              {product.onSale && (
                <Text fz="xl" c="dimmed" td="line-through" mb={5}>
                  ${product.basePrice.toLocaleString()}
                </Text>
              )}
              {product.onSale && (
                <Badge color="red" variant="filled" size="lg" mb={8}>
                  SAVE{' '}
                  {Math.round(
                    ((product.basePrice - product.price) / product.basePrice) *
                      100,
                  )}
                  %
                </Badge>
              )}
            </Group>

            <Text size="md" c="gray.7" lh={1.6}>
              {product.description}
            </Text>

            <Divider my="md" />

            {/* Quantity and Actions */}
            <Group align="flex-end" gap="md">
              <Stack gap={5}>
                <Text size="xs" fw={700} tt="uppercase">
                  Quantity
                </Text>
                <Group gap={5} className="bg-gray-100 p-1 rounded-lg w-fit">
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    onClick={() => handleQuantityChange(currentQuantity - 1)}
                    disabled={currentQuantity <= 1}
                  >
                    <Minus size={16} />
                  </ActionIcon>
                  <Text fw={700} w={40} ta="center">
                    {currentQuantity}
                  </Text>
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    onClick={() => handleQuantityChange(currentQuantity + 1)}
                    disabled={product.stock <= currentQuantity}
                  >
                    <Plus size={16} />
                  </ActionIcon>
                </Group>
              </Stack>

              <Button
                size="md"
                radius="md"
                flex={1}
                leftSection={cartItem ? null : <ShoppingCart size={20} />}
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                variant={cartItem ? 'light' : 'filled'}
                className={
                  !cartItem
                    ? 'shadow-lg shadow-blue-100 text-xs! md:text-sm!'
                    : 'text-xs! md:text-sm!'
                }
              >
                {product.stock <= 0
                  ? 'Out of Stock'
                  : cartItem
                    ? 'View in Cart'
                    : 'Add to Cart'}
              </Button>

              <ActionIcon size={45} variant="light" color="gray" radius="md">
                <Heart size={20} />
              </ActionIcon>
            </Group>

            {/* Trust Signals Block */}
            <Paper withBorder p="md" radius="md" mt="xl" bg="gray.0">
              <Grid gap="xs">
                <Grid.Col span={4}>
                  <Stack align="center" gap={5}>
                    <Truck size={20} className="text-blue-600" />
                    <Text size="xs" fw={700}>
                      Free Delivery
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={4}>
                  <Stack align="center" gap={5}>
                    <ShieldCheck size={20} className="text-blue-600" />
                    <Text size="xs" fw={700}>
                      1 Year Warranty
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={4}>
                  <Stack align="center" gap={5}>
                    <RefreshCcw size={20} className="text-blue-600" />
                    <Text size="xs" fw={700}>
                      7 Days Return
                    </Text>
                  </Stack>
                </Grid.Col>
              </Grid>
            </Paper>
          </Stack>
        </Grid.Col>
      </Grid>

      {/* Tabs Section for Specs/Reviews */}
      <Tabs defaultValue="specifications" mt={50}>
        <Tabs.List>
          <Tabs.Tab value="specifications" fz="lg" fw={600}>
            Specifications
          </Tabs.Tab>
          <Tabs.Tab value="reviews" fz="lg" fw={600}>
            Reviews
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="specifications" pt="xl">
          <Paper withBorder radius="md" p="md">
            <Table variant="vertical" layout="fixed" withTableBorder>
              <Table.Tbody>
                <Table.Tr>
                  <Table.Th w={200} bg="gray.0">
                    Brand
                  </Table.Th>
                  <Table.Td>{product.brand}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Th bg="gray.0">Category</Table.Th>
                  <Table.Td>{product.category}</Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Th bg="gray.0">Availability</Table.Th>
                  <Table.Td>
                    {product.stock > 0
                      ? `${product.stock} in stock`
                      : 'Out of Stock'}
                  </Table.Td>
                </Table.Tr>
                <Table.Tr>
                  <Table.Th bg="gray.0">Tags</Table.Th>
                  <Table.Td>
                    <Group gap={5}>
                      {product.tags.map((tag) => (
                        <Badge key={tag} variant="outline" color="gray">
                          {tag}
                        </Badge>
                      ))}
                    </Group>
                  </Table.Td>
                </Table.Tr>
              </Table.Tbody>
            </Table>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="reviews" pt="xl">
          <Text c="dimmed">No reviews yet for this product.</Text>
        </Tabs.Panel>
      </Tabs>
    </Container>
  )
}
