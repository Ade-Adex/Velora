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
  Breadcrumbs,
  Anchor,
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
import { IProduct, ICategory, CartItem, ImageSource, IUser } from '@/app/types'
import { Types } from 'mongoose'
import { useProductStore } from '@/app/store/useProductStore'
import { addProductReview } from '@/app/services/product-service'
import { useUserStore } from '@/app/store/useUserStore'
import { useSnackbar } from 'notistack'
import dayjs from 'dayjs'
import { useWishlistStore } from '@/app/store/useWishlistStore'
import { syncWishlistAction } from '@/app/services/wishlist-service'
import Link from 'next/link'


interface BreadcrumbItem {
  title: string
  href: string
}
export default function ProductDetailsClient({
  product,
}: {
  product: IProduct
}) {
  const router = useRouter()
  const { cart, addToCart, updateQuantity } = useCartStore()

  const allProductsInStore = useProductStore((state) => state.products)
  const user = useUserStore((state) => state.user)

  const { enqueueSnackbar } = useSnackbar()

  // Example: Get products from the same brand (excluding the current one)
  const relatedByBrand = allProductsInStore
    .filter((p) => p.brand === product.brand && p.slug !== product.slug)
    .slice(0, 4)

  const [activeImg, setActiveImg] = useState<ImageSource>(product.mainImage)

  const isActuallyOnSale =
    product.onSale &&
    !!product.discountPrice &&
    (!product.saleEndsAt || dayjs().isBefore(dayjs(product.saleEndsAt)))

  const currentPrice = isActuallyOnSale
    ? product.discountPrice!
    : product.basePrice
  const hasDiscount =
    isActuallyOnSale && product.discountPrice! < product.basePrice

  const discountPercentage = hasDiscount
    ? Math.round(
        ((product.basePrice - product.discountPrice!) / product.basePrice) *
          100,
      )
    : null

  const productId = product._id ? product._id.toString() : ''
  const cartItem = cart.find((item) => item.id === productId)
  const [localQuantity, setLocalQuantity] = useState(1)
  const currentQuantity = cartItem ? cartItem.quantity : localQuantity

  const [rating, setRating] = useState<number>(5)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { toggleWishlist, isInWishlist } = useWishlistStore()
  const isFavorite = isInWishlist(product._id?.toString())

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
    const maxStock = product.stock || 0
    const val = Math.max(1, Math.min(newQty, maxStock))

    if (cartItem) {
      updateQuantity(productId, val)
    } else {
      setLocalQuantity(val)
    }
  }

  const handleSubmitReview = async () => {
    if (!comment.trim()) return

    if (!user) {
      enqueueSnackbar('You must be logged in to leave a review', {
        variant: 'error',
      })
      return
    }

    setSubmitting(true)
    try {
      await addProductReview(productId, {
        userId: user._id.toString(),
        name: user.fullName,
        rating,
        comment,
      })

      setComment('')
      setRating(5)
      enqueueSnackbar('Review submitted successfully!', { variant: 'success' })
      router.refresh() // Refreshes the server data to show the new review
    } catch (error) {
      enqueueSnackbar('Failed to submit review. Please try again.', {
        variant: 'error',
      })
      console.error('Review Error:', error)
    } finally {
      setSubmitting(false)
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

  const handleShare = async () => {
    const shareData = {
      title: product.name,
      text: `Check out this ${product.name} on our shop!`,
      url: window.location.href, // Automatically gets the current product URL
    }

    try {
      if (navigator.share) {
        // triggers mobile share sheet
        await navigator.share(shareData)
      } else {
        // Fallback: Copy to clipboard for desktop users
        await navigator.clipboard.writeText(window.location.href)
        enqueueSnackbar('Link copied to clipboard!', { variant: 'info' })
      }
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  const handleWishlistToggle = async () => {
    // 1. Update Local UI immediately (Zustand)
    toggleWishlist(product)

    // 2. Sync to Database if user is logged in
    if (user?._id) {
      // We get the updated state immediately from Zustand
      const updatedWishlist = useWishlistStore.getState().wishlist
      const productIds = updatedWishlist.map((p) => p._id!.toString())

      const result = await syncWishlistAction(user._id.toString(), productIds)

      if (result.success) {
        enqueueSnackbar(
          isFavorite ? 'Removed from wishlist' : 'Added to wishlist',
          {
            variant: 'success',
          },
        )
      }
    } else {
      // If not logged in, it stays in local storage only
      enqueueSnackbar('Saved to local wishlist', { variant: 'info' })
    }
  }

  // Combine main image and gallery for the thumbnails
  const allImages = [product.mainImage, ...(product.gallery || [])]

  // 1. Logic to build the trail
  const getBreadcrumbs = (
    category: ICategory | Types.ObjectId,
    items: BreadcrumbItem[] = [],
  ): BreadcrumbItem[] => {
    // Type guard: Check if category is populated and not just an ID
    if (!category || !('name' in category)) return items

    const currentItem: BreadcrumbItem = {
      title: category.name,
      href: `/category/${category.slug}`,
    }

    const updatedItems = [currentItem, ...items]

    // If there's a parent category populated, move up the tree
    if (category.parent && typeof category.parent === 'object') {
      return getBreadcrumbs(category.parent as ICategory, updatedItems)
    }

    return updatedItems
  }

  // 2. Generate the final list
  const categoryBreadcrumbs = isPopulatedCategory(product.category)
    ? getBreadcrumbs(product.category)
    : []

  const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Home', href: '/' },
    ...categoryBreadcrumbs,
    { title: product.name, href: '#' },
  ]

  /**
   * Narrows the vendor type from ObjectId | IUser to a populated IUser object.
   * We check for '_id' and 'fullName' which are guaranteed on a populated User document.
   */
  const isPopulatedVendor = (
    vendor: Types.ObjectId | IUser,
  ): vendor is IUser => {
    return (
      vendor !== null &&
      typeof vendor === 'object' &&
      '_id' in vendor &&
      'fullName' in vendor
    )
  }

  return (
    <Container size="lg" py="lg">
      <Group justify="space-between" mb="md">
        <Button
          variant="subtle"
          color="gray"
          leftSection={<ArrowLeft size={16} />}
          onClick={() => router.back()}
        >
          Back to shopping
        </Button>

        {/* --- BREADCRUMBS PLACEMENT --- */}
        <Breadcrumbs separator="→" fz="xs">
          {breadcrumbs.map((item, index) => (
            <Anchor
              component={Link}
              href={item.href}
              key={index}
              c={index === breadcrumbs.length - 1 ? 'dimmed' : 'blue'}
              underline="hover"
              className="text-xs! md:text-sm!"
            >
              {item.title}
            </Anchor>
          ))}
        </Breadcrumbs>
      </Group>

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
          <Stack gap="lg">
            <Stack gap={5}>
              <Group justify="space-between" align="center">
                <Badge variant="filled" color="blue" size="sm" radius="sm">
                  {product.brand}
                </Badge>
                <Group gap="xs">
                  {product.stock === 0 ? (
                    <Badge color="gray" variant="outline" radius="sm">
                      OUT OF STOCK
                    </Badge>
                  ) : (
                    isActuallyOnSale && (
                      <Group gap={4}>
                        {/* SALE LABEL */}
                        <Badge
                          color="red"
                          variant="filled"
                          size="sm"
                          radius="sm"
                          styles={{ label: { fontWeight: 900 } }}
                        >
                          SALE
                        </Badge>
                      </Group>
                    )
                  )}

                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    radius="xl"
                    onClick={handleShare}
                    title="Share product"
                    className="bg-gray-300! p-1!"
                  >
                    <Share2 size={18} />
                  </ActionIcon>
                </Group>
              </Group>

              <Title
                order={1}
                fz={{ base: 18, md: 28 }}
                fw={900}
                lh={1.1}
                mt="sm"
              >
                {product.name}
              </Title>


              <Group gap={6} mt={4}>
                <Text size="xs" c="dimmed" fw={500}>
                  Sold by:
                </Text>

                {isPopulatedVendor(product.vendor) ? (
                  <Anchor
                    component={Link}
                    href={`/vendors/${product.vendor._id.toString()}`}
                    size="xs"
                    fw={700}
                    c="blue.7"
                    underline="hover"
                  >
         
                    {product.vendor.vendorProfile?.shopName ||
                      product.vendor.fullName ||
                      'Official Store'}
                  </Anchor>
                ) : (
                  <Text size="xs" fw={700} c="blue.7">
                    Official Store
                  </Text>
                )}
              </Group>

              <Group gap="xs" mt="xs">
                <Rating value={product.ratings?.average || 0} readOnly />
                <Text size="xs" c="blue.7" fw={600}>
                  ({product.ratings?.count || 0} customer reviews)
                </Text>
              </Group>
            </Stack>

            <Stack gap="xs">
              {/* PRICE GROUP */}
              <Group align="flex-end" gap="sm">
                <Text fz={28} fw={900} c="blue.9" style={{ lineHeight: 1 }}>
                  ₦{currentPrice.toLocaleString()}
                </Text>

                {hasDiscount && (
                  <Group gap={6} align="center">
                    <Text fz="sm" c="dimmed" td="line-through">
                      ₦{product.basePrice.toLocaleString()}
                    </Text>

                    <Badge
                      color="red.1"
                      c="red.9"
                      variant="filled"
                      size="sm"
                      radius="sm"
                      styles={{ label: { fontWeight: 900 } }}
                    >
                      -{discountPercentage}%
                    </Badge>
                  </Group>
                )}
              </Group>

              {/* STOCK STATUS GROUP */}
              <Group gap={8} align="center">
                <Box
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: product.stock > 0 ? '#2f9e44' : '#e03131',
                    boxShadow:
                      product.stock > 0
                        ? '0 0 0 3px #ebfbee'
                        : '0 0 0 3px #fff5f5',
                  }}
                />

                <Text
                  size="xs"
                  fw={700}
                  c={product.stock > 0 ? 'green.9' : 'red.9'}
                >
                  {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                </Text>

                {/* {product.stock > 0 && product.stock <= 10 && ( */}
                <Text
                  fz={10}
                  c="orange.9"
                  fw={700}
                  bg="orange.0"
                  px={5}
                  py={1}
                  style={{
                    borderRadius: 3,
                    letterSpacing: '0.3px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    textTransform: 'uppercase',
                  }}
                >
                  {product.stock} {product.stock > 1 ? 'units' : 'unit'} left
                </Text>
                {/* )} */}
              </Group>
            </Stack>

            <Text size="sm" c="gray.7" lh={1.7} fw={400}>
              {product.shortDescription ||
                product.description.substring(0, 200) + '...'}
            </Text>

            <Divider />

            {/* ACTION SECTION */}
            <Stack gap="md">
              <Group
                align="flex-end"
                gap="lg"
                wrap="wrap"
                className="flex-col sm:flex-row"
              >
                {/* QUANTITY SELECTOR - Full width on mobile */}
                <Stack gap={5} className="w-full sm:w-auto">
                  <Text size="xs" fw={800} tt="uppercase" c="dimmed">
                    Quantity
                  </Text>
                  {product.stock > 0 && product.stock <= 10 && (
                    <Badge
                      variant="light"
                      color="orange"
                      size="xs"
                      radius="sm"
                      style={{ width: 'fit-content' }}
                    >
                      Only {product.stock} units left in stock!
                    </Badge>
                  )}
                  <Group
                    gap={0}
                    style={{
                      border: '1px solid #e0e0e0',
                      borderRadius: '8px',
                      overflow: 'hidden',
                    }}
                    grow
                    className="w-full sm:w-auto"
                  >
                    <ActionIcon
                      variant="filled"
                      color="gray.1" // Different background for Minus
                      size={36}
                      onClick={() => handleQuantityChange(currentQuantity - 1)}
                      disabled={currentQuantity <= 1}
                      style={{ borderRadius: 0, color: '#000' }}
                    >
                      <Minus size={18} />
                    </ActionIcon>

                    <Text
                      fw={800}
                      w={40}
                      ta="center"
                      style={{ backgroundColor: '#fff' }}
                    >
                      {currentQuantity}
                    </Text>

                    <ActionIcon
                      variant="filled"
                      color="gray.1" // Different background for Plus
                      size={36}
                      onClick={() => handleQuantityChange(currentQuantity + 1)}
                      disabled={product.stock <= currentQuantity}
                      style={{ borderRadius: 0, color: '#000' }} // Square corners for the segment look
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
                    size={40}
                    variant={isFavorite ? 'filled' : 'light'}
                    color="red"
                    radius="md"
                    className="shrink-0"
                    onClick={handleWishlistToggle}
                  >
                    <Heart
                      size={16}
                      fill={isFavorite ? 'white' : 'transparent'}
                    />
                  </ActionIcon>
                </Group>
              </Group>
            </Stack>

            {/* TRUST AREA */}
            <Paper p="sm" radius="md" withBorder bg="gray.0">
              <Grid>
                <Grid.Col span={4}>
                  <Stack align="center" gap={4}>
                    <Truck size={20} className="text-blue-600" />
                    <Text fz="xs" fw={700}>
                      Fast Shipping
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={4}>
                  <Stack align="center" gap={4}>
                    <ShieldCheck size={20} className="text-blue-600" />
                    <Text fz="xs" fw={700}>
                      Secure Pay
                    </Text>
                  </Stack>
                </Grid.Col>
                <Grid.Col span={4}>
                  <Stack align="center" gap={4}>
                    <RefreshCcw size={20} className="text-blue-600" />
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
            Description
          </Tabs.Tab>
          <Tabs.Tab value="specifications" fz="md" fw={700} py="sm">
            Specs
          </Tabs.Tab>
          <Tabs.Tab value="reviews">Reviews ({product.ratings.count})</Tabs.Tab>
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
                <Table.Th bg="gray.0" w={150} className="text-xs! md:text-sm!">
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

        <Tabs.Panel value="reviews" pt="xl">
          <Grid gap="xl">
            {/* List Reviews */}
            <Grid.Col span={{ base: 12, md: 7 }}>
              <Stack gap="lg">
                {product.reviews?.length > 0 ? (
                  product.reviews.map((rev, i) => (
                    <Paper key={i} withBorder p="md" radius="md">
                      <Group justify="space-between" mb="xs">
                        <Text fw={700} size="sm">
                          {rev.name}
                        </Text>
                        <Rating value={rev.rating} readOnly size="xs" />
                      </Group>
                      <Text size="sm" c="gray.7">
                        {rev.comment}
                      </Text>
                      <Text size="xs" c="dimmed" mt="xs">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </Text>
                    </Paper>
                  ))
                ) : (
                  <Text c="dimmed" ta="center" py="xl">
                    No reviews yet. Be the first!
                  </Text>
                )}
              </Stack>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 5 }}>
              <Paper withBorder p="xl" radius="md" bg="gray.0">
                <Title order={4} mb="md">
                  Write a Review
                </Title>
                <Stack gap="sm">
                  <Rating value={rating} onChange={setRating} size="lg" />
                  <textarea
                    placeholder="Share your experience..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full p-3 rounded-md border border-gray-300 min-h-[100px] text-sm"
                  />
                  <Button
                    color="blue"
                    fullWidth
                    loading={submitting}
                    onClick={handleSubmitReview}
                    disabled={!comment.trim()}
                  >
                    Submit Review
                  </Button>
                </Stack>
              </Paper>
            </Grid.Col>
          </Grid>
        </Tabs.Panel>
      </Tabs>
    </Container>
  )
}
