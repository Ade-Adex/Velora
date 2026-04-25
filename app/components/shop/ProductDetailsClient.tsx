'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
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
  AspectRatio,
  Box,
} from '@mantine/core'
import {
  ShoppingCart,
  Heart,
  Truck,
  ShieldCheck,
  RefreshCcw,
  Minus,
  Plus,
  ArrowLeft,
  Share2,
} from 'lucide-react'
import { useCartStore } from '@/app/store/useCartStore'
import { IProduct, ICategory, CartItem, ImageSource } from '@/app/types'
import { Types } from 'mongoose'
import { useProductStore } from '@/app/store/useProductStore'

export default function ProductDetailsClient({
  product,
}: {
  product: IProduct
}) {
  const router = useRouter()
  const { cart, addToCart, updateQuantity } = useCartStore()

  const allProductsInStore = useProductStore((state) => state.products)

  // Example: Get products from the same brand (excluding the current one)
  const relatedByBrand = allProductsInStore
    .filter((p) => p.brand === product.brand && p.slug !== product.slug)
    .slice(0, 4)

  const [activeImg, setActiveImg] = useState<ImageSource>(product.mainImage)

  const currentPrice = product.discountPrice || product.basePrice
  const hasDiscount =
    !!product.discountPrice && product.discountPrice < product.basePrice
  const productId = product._id ? product._id.toString() : ''
  const cartItem = cart.find((item) => item.id === productId)
  const [localQuantity, setLocalQuantity] = useState(1)
  const currentQuantity = cartItem ? cartItem.quantity : localQuantity

  // Helper to extract string URL from ImageSource
  const getImageUrl = (src: ImageSource): string => {
    return typeof src === 'string' ? src : src.src
  }

  const isPopulatedCategory = (
    cat: ICategory | Types.ObjectId,
  ): cat is ICategory => {
    return cat && (cat as ICategory).name !== undefined
  }

  const handleQuantityChange = (newQty: number) => {
    const val = Math.max(1, Math.min(newQty, product.stock || 99))
    if (cartItem) {
      updateQuantity(productId, val)
    } else {
      setLocalQuantity(val)
    }
  }

  const handleAddToCart = () => {
    if (cartItem) {
      router.push('/cart')
    } else {
      const itemToAdd: CartItem = {
        id: productId,
        name: product.name,
        price: currentPrice,
        image: product.mainImage,
        quantity: localQuantity,
        slug: product.slug,
        brand: product.brand,
        stock: product.stock,
      }
      addToCart(itemToAdd)
    }
  }

  // Combine main image and gallery for the thumbnails
  const allImages = [product.mainImage, ...(product.gallery || [])]

  return (
    <Container size="lg" py="xl">
      <Button
        variant="subtle"
        color="gray"
        leftSection={<ArrowLeft size={16} />}
        onClick={() => router.back()}
        mb="xl"
      >
        Back to shopping
      </Button>

      <Grid gap={60}>
        {/* LEFT: GALLERY SECTION */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Stack pos="sticky" top={100}>
            {/* Main Feature Image */}
            <Paper
              withBorder
              radius="lg"
              bg="#fff"
              style={{
                overflow: 'hidden',
                boxShadow: 'var(--mantine-shadow-md)',
                position: 'relative',
              }}
            >
              <AspectRatio ratio={1}>
                <Box style={{ overflow: 'hidden' }}>
                  <Image
                    src={getImageUrl(activeImg)}
                    alt={product.name}
                    fill
                    style={{
                      objectFit: 'contain',
                      padding: '20px',
                      transition: 'transform 0.5s ease',
                    }}
                    className="hover:scale-110" // Simple CSS zoom effect
                    priority
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </Box>
              </AspectRatio>
            </Paper>

            {/* Thumbnail Navigation */}
            <Group gap="sm" justify="center">
              {allImages.map((img, i) => {
                const isSelected = getImageUrl(activeImg) === getImageUrl(img)
                return (
                  <Paper
                    key={i}
                    withBorder
                    radius="md"
                    onClick={() => setActiveImg(img)}
                    style={{
                      cursor: 'pointer',
                      width: 80,
                      height: 80,
                      padding: 6,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#fff',
                      borderColor: isSelected
                        ? 'var(--mantine-color-blue-filled)'
                        : undefined,
                      boxShadow: isSelected
                        ? '0 0 0 2px var(--mantine-color-blue-1)'
                        : undefined,
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <Image
                      src={getImageUrl(img)}
                      alt={`${product.name} thumb ${i}`}
                      width={65}
                      height={65}
                      style={{ objectFit: 'contain' }}
                    />
                  </Paper>
                )
              })}
            </Group>
          </Stack>
        </Grid.Col>

        {/* RIGHT: INFO SECTION */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Stack gap="xl">
            <Stack gap={5}>
              <Group justify="space-between" align="center">
                <Badge variant="filled" color="blue" size="md" radius="sm">
                  {product.brand}
                </Badge>
                <Group gap="xs">
                  {product.onSale && (
                    <Badge color="red" variant="light">
                      SALE
                    </Badge>
                  )}
                  <ActionIcon variant="subtle" color="gray" radius="xl">
                    <Share2 size={18} />
                  </ActionIcon>
                </Group>
              </Group>

              <Title
                order={1}
                fz={{ base: 24, md: 35 }}
                fw={900}
                lh={1.1}
                mt="sm"
              >
                {product.name}
              </Title>

              <Group gap="xs" mt="xs">
                <Rating value={product.ratings?.average || 0} readOnly />
                <Text size="xs" c="dimmed" fw={600}>
                  ({product.ratings?.count || 0} customer reviews)
                </Text>
              </Group>
            </Stack>

            <Group align="flex-end" gap="sm">
              <Text fz={32} fw={900} c="blue.9">
                ${currentPrice.toLocaleString()}
              </Text>
              {hasDiscount && (
                <Text fz="lg" c="dimmed" td="line-through" mb={12}>
                  ${product.basePrice.toLocaleString()}
                </Text>
              )}
            </Group>

            <Text size="md" c="gray.7" lh={1.7} fw={400}>
              {product.shortDescription ||
                product.description.substring(0, 200) + '...'}
            </Text>

            <Divider />

            {/* ACTION SECTION */}
            <Stack gap="md">
              <Group
                align="flex-end"
                gap="lg"
                // On mobile (below sm), we use a vertical stack. On desktop, it stays a horizontal Group.
                wrap="wrap"
                className="flex-col sm:flex-row"
              >
                {/* QUANTITY SELECTOR - Full width on mobile */}
                <Stack gap={5} className="w-full sm:w-auto">
                  <Text size="xs" fw={800} tt="uppercase" c="dimmed">
                    Quantity
                  </Text>
                  <Group
                    gap={0}
                    style={{ border: '1px solid #e0e0e0', borderRadius: '8px' }}
                    // grow makes it take full width of the parent stack on mobile
                    grow
                    className="w-full sm:w-auto"
                  >
                    <ActionIcon
                      variant="transparent"
                      size={36}
                      onClick={() => handleQuantityChange(currentQuantity - 1)}
                      disabled={currentQuantity <= 1}
                    >
                      <Minus size={18} />
                    </ActionIcon>
                    <Text fw={800} w={40} ta="center">
                      {currentQuantity}
                    </Text>
                    <ActionIcon
                      variant="transparent"
                      size={36}
                      onClick={() => handleQuantityChange(currentQuantity + 1)}
                      disabled={product.stock <= currentQuantity}
                    >
                      <Plus size={18} />
                    </ActionIcon>
                  </Group>
                </Stack>

                {/* BUTTONS GROUP - Stays side-by-side on mobile and desktop */}
                <Group gap="md" flex={1} className="w-full sm:w-auto">
                  <Button
                    size="md"
                    radius="md"
                    flex={1}
                    leftSection={!cartItem && <ShoppingCart size={22} />}
                    onClick={handleAddToCart}
                    disabled={product.stock <= 0}
                    color="blue.8"
                    className="text-xs! md:text-sm!"
                  >
                    {product.stock <= 0
                      ? 'Out of Stock'
                      : cartItem
                        ? 'View in Cart'
                        : 'Add to Cart'}
                  </Button>

                  <ActionIcon
                    size={48}
                    variant="light"
                    color="red"
                    radius="md"
                    className="shrink-0"
                  >
                    <Heart size={20} />
                  </ActionIcon>
                </Group>
              </Group>
            </Stack>

            {/* TRUST AREA */}
            <Paper p="lg" radius="md" withBorder bg="gray.0">
              <Grid>
                <Grid.Col span={4}>
                  <Stack align="center" gap={4}>
                    <Truck size={24} className="text-blue-600" />
                    <Text fz="xs" fw={700}>
                      Fast Shipping
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={4}>
                  <Stack align="center" gap={4}>
                    <ShieldCheck size={24} className="text-blue-600" />
                    <Text fz="xs" fw={700}>
                      Secure Pay
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={4}>
                  <Stack align="center" gap={4}>
                    <RefreshCcw size={24} className="text-blue-600" />
                    <Text fz="xs" fw={700}>
                      Easy Returns
                    </Text>
                  </Stack>
                </Grid.Col>
              </Grid>
            </Paper>
          </Stack>
        </Grid.Col>
      </Grid>

      {/* TABS SECTION */}
      <Tabs defaultValue="description" mt={80} variant="pills" radius="md">
        <Tabs.List grow>
          <Tabs.Tab value="description" fz="md" fw={700} py="sm">
            Product Description
          </Tabs.Tab>
          <Tabs.Tab value="specifications" fz="md" fw={700} py="sm">
            Technical Details
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="description" pt="xl">
          <Paper withBorder p="xl" radius="lg">
            <Text
              size="sm"
              c="gray.8"
              lh={1.8}
              style={{ whiteSpace: 'pre-line' }}
            >
              {product.description}
            </Text>
          </Paper>
        </Tabs.Panel>

        <Tabs.Panel value="specifications" pt="xl">
          <Table withTableBorder withColumnBorders verticalSpacing="md" fz="md">
            <Table.Tbody>
              <Table.Tr>
                <Table.Th bg="gray.0" w={300} className="text-xs! md:text-sm!">
                  Product Identity
                </Table.Th>
                <Table.Td className="text-xs! md:text-sm!">
                  {product.name}
                </Table.Td>
              </Table.Tr>
              {product.specifications?.map((spec, i) => (
                <Table.Tr key={i}>
                  <Table.Th bg="gray.0" className="text-xs! md:text-sm!">
                    {spec.label}
                  </Table.Th>
                  <Table.Td className="text-xs! md:text-sm!">
                    {spec.value}
                  </Table.Td>
                </Table.Tr>
              ))}
              <Table.Tr>
                <Table.Th bg="gray.0" className="text-xs! md:text-sm!">
                  Category
                </Table.Th>
                <Table.Td className="text-xs! md:text-sm!">
                  {isPopulatedCategory(product.category)
                    ? product.category.name
                    : 'General Retail'}
                </Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
        </Tabs.Panel>
      </Tabs>
    </Container>
  )
}
