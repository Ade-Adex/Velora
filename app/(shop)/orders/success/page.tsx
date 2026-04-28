//  /app/%28shop%29/orders/success/page.tsx

// 'use client'

// import { Suspense } from 'react' // 1. Import Suspense
// import { useSearchParams } from 'next/navigation'
// import {
//   Container,
//   Paper,
//   Title,
//   Text,
//   Button,
//   Stack,
//   Alert,
//   List,
//   Flex,
//   Loader,
//   Center,
// } from '@mantine/core'
// import { CheckCircle, Building2 } from 'lucide-react'
// import Link from 'next/link'

// // 2. Move your existing logic into this sub-component
// function OrderSuccessContent() {
//   const searchParams = useSearchParams()
//   const method = searchParams.get('method')
//   const orderId = searchParams.get('id')

//   return (
//     <Paper withBorder p={40} radius="xl" shadow="md">
//       <Stack align="center" gap="lg">
//         <CheckCircle size={60} color="green" />
//         <Title order={1} ta="center" className="text-xl! font-bold">
//           Order Placed Successfully!
//         </Title>
//         <Text c="dimmed" ta="center">
//           Order ID:{' '}
//           <span className="font-bold text-gray-900">
//             {orderId?.slice(-8).toUpperCase() || 'N/A'}
//           </span>
//         </Text>

//         {method === 'transfer' && (
//           <Alert
//             icon={<Building2 size={20} />}
//             title="Bank Transfer Instructions"
//             color="blue"
//             radius="md"
//             w="100%"
//           >
//             <Text size="sm" mb="md">
//               Please transfer the total amount to the account below to confirm
//               your order:
//             </Text>
//             <Paper p="md" withBorder className="bg-blue-50/50">
//               <List spacing="xs" size="sm" center>
//                 <List.Item>
//                   <b>Bank:</b> Zenith Bank
//                 </List.Item>
//                 <List.Item>
//                   <b>Account Name:</b> Velora Digital Store
//                 </List.Item>
//                 <List.Item>
//                   <b>Account Number:</b> 1234567890
//                 </List.Item>
//               </List>
//             </Paper>
//             <Text size="xs" mt="md" c="dimmed" ta="center">
//               Note: Your order will be processed once we verify the transaction.
//               Please use your Order ID as the reference.
//             </Text>
//           </Alert>
//         )}

//         <Flex
//           mt="xl"
//           gap="md"
//           direction={{ base: 'column', sm: 'row' }}
//           w="100%"
//         >
//           <Button
//             variant="light"
//             component={Link}
//             href="/profile?tab=orders"
//             fullWidth
//             size="sm"
//           >
//             View My Orders
//           </Button>

//           <Button color="blue" component={Link} href="/" fullWidth size="sm">
//             Continue Shopping
//           </Button>
//         </Flex>
//       </Stack>
//     </Paper>
//   )
// }

// // 3. The main exported page provides the Suspense boundary
// export default function OrderSuccessPage() {
//   return (
//     <Container size="xs" py={60}>
//       <Suspense
//         fallback={
//           <Paper withBorder p={40} radius="xl" shadow="md">
//             <Center h={200}>
//               <Stack align="center" gap="xs">
//                 <Loader size="lg" color="blue" />
//                 <Text c="dimmed" size="sm">
//                   Confirming your order...
//                 </Text>
//               </Stack>
//             </Center>
//           </Paper>
//         }
//       >
//         <OrderSuccessContent />
//       </Suspense>
//     </Container>
//   )
// }



//  /app/%28shop%29/orders/success/page.tsx


'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Container,
  Paper,
  Title,
  Text,
  Button,
  Stack,
  Alert,
  List,
  Flex,
  Loader,
  Center,
  Badge,
  Divider,
  Group,
} from '@mantine/core'
import { CheckCircle, Building2, Truck, MapPin, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { getOrderByIdAction } from '@/app/services/order-service'
import { IOrder, Serialized } from '@/app/types'

function OrderSuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('id')
  const method = searchParams.get('method')

  const [order, setOrder] = useState<Serialized<IOrder> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (orderId) {
      getOrderByIdAction(orderId).then((data) => {
        setOrder(data)
        setLoading(false)
      })
    }
  }, [orderId])

  if (loading) {
    return (
      <Center h={300}>
        <Loader size="lg" color="blue" />
      </Center>
    )
  }

  if (!order) {
    return (
      <Alert color="red" title="Order Not Found">
        We couldn&apos;t retrieve the details for this order. Please check your
        profile.
      </Alert>
    )
  }

  return (
    <Paper withBorder p={{ base: 20, sm: 40 }} radius="xl" shadow="md">
      <Stack align="center" gap="lg">
        <CheckCircle size={60} color="#40C057" />
        <Stack gap={4} align="center">
          <Title order={1} ta="center" fz={{ base: 22, sm: 28 }} fw={900}>
            Order Confirmed!
          </Title>
          <Text c="dimmed" size="sm">
            Thank you for your purchase,{' '}
            {order.shippingAddress?.fullName.split(' ')[0]}.
          </Text>
        </Stack>

        <Divider w="100%" label="Order Summary" labelPosition="center" />

        {/* ORDER DETAILS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
          <Stack gap={4}>
            <Group gap={6} c="dimmed">
              <MapPin size={14} />
              <Text size="xs" fw={700} tt="uppercase">
                Shipping Address
              </Text>
            </Group>
            <Text size="sm" fw={600}>
              {order.shippingAddress?.addressLine1 ?? 'No address provided'}
            </Text>
            <Text size="sm" c="dimmed">
              {order.shippingAddress?.city}, {order.shippingAddress?.state}
            </Text>
          </Stack>

          <Stack gap={4}>
            <Group gap={6} c="dimmed">
              <Truck size={14} />
              <Text size="xs" fw={700} tt="uppercase">
                Delivery Status
              </Text>
            </Group>
            <Badge color="blue" variant="light" radius="sm">
              {order.orderStatus?.toUpperCase() || 'PENDING'}
            </Badge>
            <Text size="xs" c="dimmed">
              Tracking: {order.trackingNumber || 'Processing...'}
            </Text>
          </Stack>

          <Stack gap={4}>
            <Group gap={6} c="dimmed">
              <CreditCard size={14} />
              <Text size="xs" fw={700} tt="uppercase">
                Payment Method
              </Text>
            </Group>
            <Text size="sm" fw={600}>
              {method === 'card' ? 'Paystack (Card/Transfer)' : 'Bank Transfer'}
            </Text>
            <Badge
              color={order.paymentStatus === 'paid' ? 'green' : 'orange'}
              size="xs"
            >
              {order.paymentStatus?.toUpperCase()}
            </Badge>
          </Stack>

          <Stack gap={4}>
            <Group gap={6} c="dimmed">
              <CheckCircle size={14} />
              <Text size="xs" fw={700} tt="uppercase">
                Total Amount
              </Text>
            </Group>
            <Text size="lg" fw={900} c="blue.9">
              ${order.totals?.grandTotal.toLocaleString()}
            </Text>
          </Stack>
        </div>

        {method === 'transfer' && order.paymentStatus !== 'paid' && (
          <Alert
            icon={<Building2 size={20} />}
            title="Pending Transfer"
            color="blue"
            radius="md"
            w="100%"
          >
            <Text size="xs">
              Account: 1234567890 (Zenith Bank) <br />
              Ref: {order.orderNumber}
            </Text>
          </Alert>
        )}

        <Flex
          mt="xl"
          gap="md"
          direction={{ base: 'column', sm: 'row' }}
          w="100%"
        >
          <Button
            variant="light"
            component={Link}
            href="/profile?tab=orders"
            flex={1}
          >
            Track Order
          </Button>
          <Button color="blue" component={Link} href="/" flex={1}>
            Back to Home
          </Button>
        </Flex>
      </Stack>
    </Paper>
  )
}

export default function OrderSuccessPage() {
  return (
    <Container size="sm" py={60}>
      <Suspense fallback={<LoaderState />}>
        <OrderSuccessContent />
      </Suspense>
    </Container>
  )
}

function LoaderState() {
  return (
    <Paper withBorder p={40} radius="xl" shadow="md">
      <Center h={200}>
        <Stack align="center" gap="xs">
          <Loader size="lg" color="blue" />
          <Text c="dimmed" size="sm">
            Retrieving order data...
          </Text>
        </Stack>
      </Center>
    </Paper>
  )
}