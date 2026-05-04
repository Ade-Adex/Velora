// /app/(shop)/cart/page.tsx

'use client'

import Link from 'next/link'
import {
  Container,
  Grid,
  Paper,
  Text,
  Image,
  ActionIcon,
  Group,
  Stack,
  Button,
  Divider,
  Title,
  Tooltip,
  Alert,
  Radio,
} from '@mantine/core'
import {
  Trash2,
  Minus,
  Plus,
  ArrowLeft,
  ShieldCheck,
  Truck,
  MapPin,
  Lock,
} from 'lucide-react'
import { useCartStore } from '@/app/store/useCartStore'
import { ReactNode, useState } from 'react'
import { useUserStore } from '@/app/store/useUserStore'
import { useRouter } from 'next/navigation'
import { SHIPPING_CONFIG } from '@/app/lib/constants'

interface BadgeProps {
  children: ReactNode
}

function Badge({ children }: BadgeProps) {
  return (
    <span className="px-2 py-0.5 rounded text-sm font-bold bg-blue-100 text-blue-700">
      {children}
    </span>
  )
}

export default function CartPage() {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, clearCart } = useCartStore()
  const user = useUserStore((state) => state.user)

  const [paymentMethod, setPaymentMethod] = useState('card')
  const [loading, setLoading] = useState(false)

  const hasAddress = (user?.addresses?.length ?? 0) > 0
  const isAuthenticated = !!user

 const subtotal = cart.reduce(
   (acc, item) => acc + item.price * item.quantity,
   0,
 )

 // Use the shared constants here
 const shipping =
   subtotal >= SHIPPING_CONFIG.FREE_THRESHOLD ? 0 : SHIPPING_CONFIG.FLAT_RATE

 const total = subtotal + shipping

  // --- PROFESSIONAL handleCheckout Implementation ---
 const handleCheckout = async () => {
   if (!isAuthenticated || !hasAddress || loading) return

   setLoading(true)

   const activeAddress =
     user.addresses.find((a) => a.isDefault) || user.addresses[0]

   const orderPayload = {
     items: cart.map((item) => ({
       product: item.id,
       name: item.name,
       quantity: item.quantity,
       price: item.price,
       image: item.image, // Pass the image here!
       variantSku: item.variantSku || '',
     })),
     shippingAddress: activeAddress,
     paymentMethod,
   }

   try {
     const response = await fetch('/api/checkout', {
       method: 'POST',
       headers: { 'Content-Type': 'application/json' },
       body: JSON.stringify(orderPayload),
     })

     const data = await response.json()

     if (data.success) {
       clearCart()

       // --- PROFESSIONAL REDIRECT ---
       // If the URL is external (like Paystack), use .assign()
       // to avoid the mutation error.
       if (data.redirectUrl.startsWith('http')) {
         window.location.assign(data.redirectUrl)
       } else {
         router.push(data.redirectUrl)
       }
     } else {
       alert(data.error || 'Failed to initialize checkout.')
     }
   } catch (error) {
     console.error('Checkout Error:', error)
     alert('A network error occurred. Please try again.')
   } finally {
     setLoading(false)
   }
 }

  if (cart.length === 0) {
    return (
      <Container size="lg" py={80}>
        <Stack align="center" gap="xl">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
            <Trash2 size={40} className="text-gray-300" />
          </div>
          <Title order={2}>Your cart is empty</Title>
          <Button
            component={Link}
            href="/"
            size="sm"
            leftSection={<ArrowLeft size={18} />}
          >
            Continue Shopping
          </Button>
        </Stack>
      </Container>
    )
  }

  return (
    <Container size="lg" py="xl">
      <Title order={2} mb="xl" className="flex items-center gap-3">
        Shopping Cart <Badge>{cart.length}</Badge>
      </Title>

      <Grid gap="xl">
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Stack gap="md">
            {!isAuthenticated && (
              <Alert
                icon={<Lock size={16} />}
                title="Authentication Required"
                color="blue"
                radius="md"
              >
                Please{' '}
                <Link href="/auth" className="font-bold underline">
                  Sign In
                </Link>{' '}
                to complete your purchase safely.
              </Alert>
            )}

            {isAuthenticated && !hasAddress && (
              <Alert
                icon={<MapPin size={16} />}
                title="Shipping Address Missing"
                color="orange"
                radius="md"
              >
                You haven&apos;t set a shipping address yet.
                <Link href="/profile?tab=addresses" className="ml-2 font-bold underline">
                  Add Address
                </Link>
              </Alert>
            )}

            {cart.map((item) => (
              <Paper
                key={item.id}
                withBorder
                p="md"
                radius="md"
                className="hover:shadow-sm transition-shadow"
              >
                <Grid align="center">
                  <Grid.Col span={{ base: 4, sm: 3 }}>
                    <Link href={`/product/${item.slug}`}>
                      <Image
                        src={
                          typeof item.image === 'string'
                            ? item.image
                            : item.image.src
                        }
                        alt={item.name}
                        radius="md"
                        className="hover:opacity-80 transition-opacity cursor-pointer"
                        fallbackSrc="https://placehold.co/200x200?text=No+Image"
                      />
                    </Link>
                  </Grid.Col>

                  <Grid.Col span={{ base: 8, sm: 5 }}>
                    <Stack gap={4}>
                      <Text fw={700} size="lg" className="line-clamp-1">
                        {item.name}
                      </Text>
                      <Text c="dimmed" size="xs">
                        SKU: {item.id.slice(-6).toUpperCase()}
                      </Text>
                      <Text fw={800} c="blue" size="xl">
                        ₦{item.price.toLocaleString()}
                      </Text>
                    </Stack>
                  </Grid.Col>

                  <Grid.Col span={{ base: 12, sm: 4 }}>
                    <Group justify="flex-end">
                      <Group gap={5} className="bg-gray-100 p-1 rounded-lg">
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={14} />
                        </ActionIcon>
                        <Text
                          fw={700}
                          w={30}
                          ta="center"
                          className="bg-white! hover:bg-gray-200 transition-colors"
                        >
                          {item.quantity}
                        </Text>
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          onClick={() =>
                            updateQuantity(item.id, item.quantity + 1)
                          }
                          disabled={item.quantity >= (item.stock || 0)}
                        >
                          <Plus size={14} />
                        </ActionIcon>
                      </Group>
                      <ActionIcon
                        variant="light"
                        color="red"
                        size="lg"
                        onClick={() => removeFromCart(item.id)}
                      >
                        <Trash2 size={18} />
                      </ActionIcon>
                    </Group>
                  </Grid.Col>
                </Grid>
              </Paper>
            ))}

            <Group justify="space-between" mt="md">
              <Button
                variant="subtle"
                color="gray"
                leftSection={<ArrowLeft size={16} />}
                component={Link}
                href="/"
              >
                Continue Shopping
              </Button>
              <Button variant="subtle" color="red" onClick={clearCart}>
                Clear Cart
              </Button>
            </Group>
          </Stack>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="md" className="sticky top-24">
            <Paper withBorder p="xl" radius="md" className="bg-gray-50/50">
              <Text fw={800} size="lg" mb="md">
                Order Summary
              </Text>

              <Stack gap="xs">
                <Group justify="space-between">
                  <Text c="dimmed">Subtotal</Text>
                  <Text fw={600}>₦{subtotal.toLocaleString()}</Text>
                </Group>
                <Group justify="space-between">
                  <Text c="dimmed">Shipping</Text>
                  <Text fw={600} c={shipping === 0 ? 'green' : 'black'}>
                    {shipping === 0 ? 'FREE' : `₦${shipping}`}
                  </Text>
                </Group>

                <Divider my="sm" />

                <Text fw={700} size="sm" mb={5}>
                  Payment Method
                </Text>
                <Radio.Group value={paymentMethod} onChange={setPaymentMethod}>
                  <Stack gap="xs">
                    <Radio value="card" label="Credit/Debit Card (Paystack)" />
                    <Radio value="transfer" label="Manual Bank Transfer" />
                  </Stack>
                </Radio.Group>

                <Divider my="sm" />

                <Group justify="space-between">
                  <Text fw={800} size="xl">
                    Total
                  </Text>
                  <Text fw={900} size="xl" c="blue">
                    ₦{total.toLocaleString()}
                  </Text>
                </Group>
              </Stack>

              <Tooltip
                label={
                  !isAuthenticated
                    ? 'Sign in to pay'
                    : !hasAddress
                      ? 'Add address to pay'
                      : ''
                }
                disabled={isAuthenticated && hasAddress}
              >
                <Button
                  fullWidth
                  size="md"
                  mt="xl"
                  radius="md"
                  color="blue"
                  loading={loading}
                  onClick={handleCheckout}
                  disabled={!isAuthenticated || !hasAddress}
                >
                  {paymentMethod === 'card'
                    ? 'Pay Securely Now'
                    : 'Complete Order'}
                </Button>
              </Tooltip>

              {!isAuthenticated || !hasAddress ? (
                <Text size="xs" c="red" ta="center" mt="sm" fw={500}>
                  Please complete the requirements above to proceed.
                </Text>
              ) : null}
            </Paper>

            <Paper withBorder p="md" radius="md">
              <Stack gap="sm">
                <Group gap="sm" wrap="nowrap">
                  <Truck size={20} className="text-[#FF8A00]" />
                  <div>
                    <Text size="xs" fw={700}>
                      Fast Delivery
                    </Text>
                    <Text size="xs" c="dimmed">
                      Within Ogbomoso: 24hrs. Others: 2-5 days.
                    </Text>
                  </div>
                </Group>
                <Divider variant="dotted" />
                <Group gap="sm" wrap="nowrap">
                  <ShieldCheck size={20} className="text-green-600" />
                  <div>
                    <Text size="xs" fw={700}>
                      Secure Payment
                    </Text>
                    <Text size="xs" c="dimmed">
                      Verified SSL Transaction.
                    </Text>
                  </div>
                </Group>
              </Stack>
            </Paper>
          </Stack>
        </Grid.Col>
      </Grid>
    </Container>
  )
}
