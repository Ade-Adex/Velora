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
import { IProduct, ICategory, CartItem } from '@/app/types'
import { Types } from 'mongoose'

export default function ProductDetailsClient({
  product,
}: {
  product: IProduct
}) {
  const router = useRouter()
  const { cart, addToCart, updateQuantity } = useCartStore()

  // Dynamic Image State - mainImage is typed as ImageSource
  const [activeImg, setActiveImg] = useState(product.mainImage)

  // Price Logic
  const currentPrice = product.discountPrice || product.basePrice
  const hasDiscount =
    !!product.discountPrice && product.discountPrice < product.basePrice

  // Extract ID safely. Since IProduct extends Document, _id exists.
  const productId = product._id.toString()

  const cartItem = cart.find((item) => item.id === productId)
  const [localQuantity, setLocalQuantity] = useState(1)
  const currentQuantity = cartItem ? cartItem.quantity : localQuantity

const isPopulatedCategory = (
  cat: ICategory | Types.ObjectId,
): cat is ICategory => {
  return (cat as ICategory).name !== undefined
}
  const handleQuantityChange = (newQty: number) => {
    const val = Math.max(1, newQty)
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

  return (
    <Container size="lg" py="xl">
      <Button
        variant="subtle"
        color="gray"
        leftSection={<ArrowLeft size={16} />}
        onClick={() => router.back()}
        mb="xl"
      >
        Back to Results
      </Button>

      <Grid gap={50}>
        {/* GALLERY SECTION */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Stack pos="sticky" top={100}>
            <Paper
              withBorder
              radius="lg"
              bg="gray.0"
              style={{ overflow: 'hidden' }}
            >
              <AspectRatio ratio={1}>
                <Image
                  src={activeImg}
                  alt={product.name}
                  fill
                  style={{ objectFit: 'contain', padding: '20px' }}
                  priority
                />
              </AspectRatio>
            </Paper>

            <Group gap="sm">
              {[product.mainImage, ...(product.gallery || [])].map((img, i) => (
                <Paper
                  key={i}
                  withBorder
                  radius="md"
                  p={4}
                  onClick={() => setActiveImg(img)}
                  className={`cursor-pointer transition-all ${
                    activeImg === img
                      ? 'border-blue-600 ring-2 ring-blue-100'
                      : 'hover:border-gray-400'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} gallery ${i}`}
                    width={70}
                    height={70}
                    style={{ objectFit: 'contain' }}
                  />
                </Paper>
              ))}
            </Group>
          </Stack>
        </Grid.Col>

        {/* INFO SECTION */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Stack gap="xl">
            <Stack gap="xs">
              <Group justify="space-between" align="flex-start">
                <Badge color="blue" variant="light" size="lg" radius="sm">
                  {product.brand}
                </Badge>
                <ActionIcon variant="subtle" color="gray">
                  <Share2 size={18} />
                </ActionIcon>
              </Group>

              <Title order={1} fz={36} fw={900} lh={1.1}>
                {product.name}
              </Title>

              <Group gap="xs">
                <Rating value={product.ratings?.average || 0} readOnly />
                <Text size="sm" c="dimmed" fw={500}>
                  ({product.ratings?.count || 0} Customer Reviews)
                </Text>
              </Group>
            </Stack>

            <Stack gap={5}>
              <Group align="flex-end" gap="sm">
                <Text fz={40} fw={900} c="blue.7">
                  ${currentPrice.toLocaleString()}
                </Text>
                {hasDiscount && (
                  <Text fz="xl" c="dimmed" td="line-through" mb={8}>
                    ${product.basePrice.toLocaleString()}
                  </Text>
                )}
              </Group>
              {product.stock > 0 && product.stock < 10 && (
                <Text c="orange" fz="sm" fw={700}>
                  Only {product.stock} items left in stock!
                </Text>
              )}
            </Stack>

            <Text size="lg" c="gray.7" lh={1.7}>
              {product.shortDescription ||
                product.description.substring(0, 160) + '...'}
            </Text>

            <Divider />

            <Group align="flex-end" gap="md">
              <Stack gap={5}>
                <Text size="xs" fw={800} tt="uppercase" c="dimmed">
                  Quantity
                </Text>
                <Group
                  gap={0}
                  className="border rounded-lg overflow-hidden border-gray-300"
                >
                  <ActionIcon
                    variant="transparent"
                    size={42}
                    onClick={() => handleQuantityChange(currentQuantity - 1)}
                    disabled={currentQuantity <= 1}
                  >
                    <Minus size={16} />
                  </ActionIcon>
                  <Text fw={700} w={40} ta="center">
                    {currentQuantity}
                  </Text>
                  <ActionIcon
                    variant="transparent"
                    size={42}
                    onClick={() => handleQuantityChange(currentQuantity + 1)}
                    disabled={product.stock <= currentQuantity}
                  >
                    <Plus size={16} />
                  </ActionIcon>
                </Group>
              </Stack>

              <Button
                size="xl"
                radius="md"
                flex={1}
                leftSection={cartItem ? null : <ShoppingCart size={22} />}
                onClick={handleAddToCart}
                disabled={product.stock <= 0}
                variant={cartItem ? 'outline' : 'filled'}
                color="blue.7"
              >
                {product.stock <= 0
                  ? 'Out of Stock'
                  : cartItem
                    ? 'View in Cart'
                    : 'Add to Cart'}
              </Button>

              <ActionIcon size={54} variant="light" color="red" radius="md">
                <Heart size={24} />
              </ActionIcon>
            </Group>

            {/* TRUST SIGNALS */}
            <Grid grow gap="sm">
              {[
                {
                  icon: Truck,
                  label: 'Free Shipping',
                  desc: 'On orders over $100',
                },
                {
                  icon: ShieldCheck,
                  label: 'Secure Payment',
                  desc: '100% Secure',
                },
                {
                  icon: RefreshCcw,
                  label: 'Easy Returns',
                  desc: '30-Day Money Back',
                },
              ].map((item, i) => (
                <Grid.Col span={4} key={i}>
                  <Paper withBorder p="sm" radius="md" ta="center" bg="gray.0">
                    <item.icon
                      size={22}
                      className="text-blue-600 mb-1 mx-auto"
                    />
                    <Text size="xs" fw={800}>
                      {item.label}
                    </Text>
                    <Text size="10px" c="dimmed">
                      {item.desc}
                    </Text>
                  </Paper>
                </Grid.Col>
              ))}
            </Grid>
          </Stack>
        </Grid.Col>
      </Grid>

      {/* TABS FOR DETAILS */}
      <Tabs defaultValue="description" mt={60} variant="outline">
        <Tabs.List>
          <Tabs.Tab value="description" fz="md" fw={700} px="xl">
            Description
          </Tabs.Tab>
          <Tabs.Tab value="specifications" fz="md" fw={700} px="xl">
            Specifications
          </Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="description" pt="xl">
          <Text
            size="lg"
            c="gray.8"
            lh={1.8}
            style={{ whiteSpace: 'pre-line' }}
          >
            {product.description}
          </Text>
        </Tabs.Panel>

        <Tabs.Panel value="specifications" pt="xl">
          <Table withTableBorder withColumnBorders verticalSpacing="md">
            <Table.Tbody>
              {product.specifications?.map((spec, i) => (
                <Table.Tr key={i}>
                  <Table.Th bg="gray.0" w={250}>
                    {spec.label}
                  </Table.Th>
                  <Table.Td>{spec.value}</Table.Td>
                </Table.Tr>
              ))}
              <Table.Tr>
                <Table.Th bg="gray.0">Category</Table.Th>
                <Table.Td>
                  {product?.category && isPopulatedCategory(product.category)
                    ? product.category.name
                    : 'General'}
                </Table.Td>
              </Table.Tr>
            </Table.Tbody>
          </Table>
        </Tabs.Panel>
      </Tabs>
    </Container>
  )
}
