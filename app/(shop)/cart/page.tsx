// /app/cart/page.tsx

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
  NumberInput,
  Title,
  Tooltip,
} from '@mantine/core'
import {
  Trash2,
  Minus,
  Plus,
  ArrowLeft,
  ShieldCheck,
  Truck,
} from 'lucide-react'
import { useCartStore } from '@/app/store/useCartStore'
import { ReactNode } from 'react'

interface BadgeProps {
  children: ReactNode
  variant?: string
  color?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, clearCart } = useCartStore()

  // Calculations
  const subtotal = cart.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0,
  )
  const shipping = subtotal > 500 ? 0 : 15 // Free shipping over $500
  const total = subtotal + shipping

  if (cart.length === 0) {
    return (
      <Container size="lg" py={80}>
        <Stack align="center" gap="xl">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
            <Trash2 size={40} className="text-gray-300" />
          </div>
          <div className="text-center">
            <Title order={2}>Your cart is empty</Title>
            <Text c="dimmed" mt="sm">
              Looks like you haven&apos;t added anything to your cart yet.
            </Text>
          </div>
          <Button
            component={Link}
            href="/"
            size="lg"
            color="blue"
            radius="md"
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
        Shopping Cart{' '}
        <Badge size="lg" variant="light" color="blue">
          {cart.length}
        </Badge>
      </Title>

      <Grid gap="xl">
        {/* Cart Items List */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Stack gap="md">
            {cart.map((item) => (
              <Paper key={item._id} withBorder p="md" radius="md">
                <Grid align="center">
                  <Grid.Col span={{ base: 4, sm: 3 }}>
                    <Image
                      src={item.image}
                      alt={item.name}
                      radius="md"
                      fallbackSrc="https://placehold.co/200x200?text=No+Image"
                    />
                  </Grid.Col>

                  <Grid.Col span={{ base: 8, sm: 5 }}>
                    <Stack gap={4}>
                      <Text fw={700} size="lg" className="line-clamp-1">
                        {item.name}
                      </Text>
                      <Text c="dimmed" size="xs">
                        SKU: {item._id ? item._id.slice(-6).toUpperCase() : 'N/A'}
                      </Text>
                      <Text fw={800} color="blue" size="xl" mt="xs">
                        ${item.price.toLocaleString()}
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
                            updateQuantity(item._id ?? '', item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                        >
                          <Minus size={14} />
                        </ActionIcon>

                        <Text fw={700} w={30} ta="center">
                          {item.quantity}
                        </Text>

                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          onClick={() =>
                            updateQuantity(item._id ?? '', item.quantity + 1)
                          }
                        >
                          <Plus size={14} />
                        </ActionIcon>
                      </Group>

                      <Tooltip label="Remove item">
                        <ActionIcon
                          variant="light"
                          color="red"
                          size="lg"
                          onClick={() => removeFromCart(item._id ?? '')}
                        >
                          <Trash2 size={18} />
                        </ActionIcon>
                      </Tooltip>
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

        {/* Order Summary Sidebar */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="md" className="sticky top-24">
            <Paper withBorder p="xl" radius="md" className="bg-gray-50/50">
              <Text fw={800} size="lg" mb="md">
                Order Summary
              </Text>

              <Stack gap="xs">
                <Group justify="space-between">
                  <Text c="dimmed">Subtotal</Text>
                  <Text fw={600}>${subtotal.toLocaleString()}</Text>
                </Group>

                <Group justify="space-between">
                  <Text c="dimmed">Shipping</Text>
                  <Text fw={600} color={shipping === 0 ? 'green' : 'black'}>
                    {shipping === 0 ? 'FREE' : `$${shipping}`}
                  </Text>
                </Group>

                <Divider my="sm" />

                <Group justify="space-between">
                  <Text fw={800} size="xl">
                    Total
                  </Text>
                  <Text fw={900} size="xl" color="blue">
                    ${total.toLocaleString()}
                  </Text>
                </Group>
              </Stack>

              <Button
                fullWidth
                size="lg"
                mt="xl"
                radius="md"
                color="blue"
                className="shadow-lg shadow-blue-100"
              >
                Proceed to Checkout
              </Button>
            </Paper>

            {/* Trust Badges */}
            <Paper withBorder p="md" radius="md">
              <Stack gap="sm">
                <Group gap="sm" wrap="nowrap">
                  <Truck size={20} className="text-[#FF8A00]" />
                  <div>
                    <Text size="xs" fw={700}>
                      Fast Delivery
                    </Text>
                    <Text size="xs" c="dimmed">
                      Get your items in 2-5 business days.
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
                      Encrypted transactions for your safety.
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

// Helper Badge component if not imported
function Badge({ children }: BadgeProps) {
  return (
    <span
      className={`px-2 py-0.5 rounded text-sm font-bold bg-blue-100 text-blue-700`}
    >
      {children}
    </span>
  )
}