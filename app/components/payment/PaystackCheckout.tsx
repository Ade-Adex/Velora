// /app/components/payment/PaystackCheckout.tsx

'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Container, Stack, Title, Text, Loader, Center } from '@mantine/core'
import { useUserStore } from '@/app/store/useUserStore'
import { getOrderByIdAction } from '@/app/services/order-service' // 1. Import your Action

// --- STRICT INTERFACES ---
// (Interfaces kept as they are)
interface OrderData {
  orderNumber: string
  totals: {
    grandTotal: number
  }
}

interface PaystackResponse {
  reference: string
  trans: string
  status: string
  message: string
  transaction: string
}

interface PaystackHandler {
  openIframe: () => void
}

interface PaystackPopOptions {
  key: string | undefined
  email: string
  amount: number
  currency: string
  ref: string
  callback: (response: PaystackResponse) => void
  onClose: () => void
}

declare global {
  interface Window {
    PaystackPop: {
      setup: (options: PaystackPopOptions) => PaystackHandler
    }
  }
}

function PaystackContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const orderId = searchParams.get('id')
  const user = useUserStore((state) => state.user)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!orderId || !user) return

    const initializePayment = async () => {
      try {
        // 2. Call the Server Action directly instead of fetch
        const orderData = await getOrderByIdAction(orderId)

        if (!orderData) throw new Error('Order not found')

        // 3. Cast the serialized data to your local Interface if needed
        const formattedOrder: OrderData = {
          orderNumber: orderData.orderNumber,
          totals: {
            grandTotal: orderData.totals.grandTotal,
          },
        }

        if (
          !document.querySelector(
            'script[src="https://js.paystack.co/v1/inline.js"]',
          )
        ) {
          const script = document.createElement('script')
          script.src = 'https://js.paystack.co/v1/inline.js'
          script.async = true
          document.body.appendChild(script)
          script.onload = () => setupPaystack(formattedOrder)
        } else {
          setupPaystack(formattedOrder)
        }
      } catch (err) {
        console.error('Payment Init Error:', err)
        router.push('/cart')
      }
    }

    const setupPaystack = (orderData: OrderData) => {
      if (!window.PaystackPop) return

      const handler = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY,
        email: user.email,
        amount: Math.round(orderData.totals.grandTotal * 100), // Note: Verify if you still need the *1600 multiplier here
        currency: 'NGN',
        ref: orderData.orderNumber,
        callback: (response: PaystackResponse) => {
          // You can eventually convert this verify route to a Server Action too!
          router.push(
            `/api/checkout/verify?reference=${response.reference}&orderId=${orderId}`,
          )
        },
        onClose: () => {
          alert('Window closed. Please complete payment to process your order.')
          router.push('/cart')
        },
      })

      handler.openIframe()
      setLoading(false)
    }

    initializePayment()
  }, [orderId, user, router])

  return (
    <Center>
      <Stack align="center">
        <Loader size="xl" variant="bars" color="blue.8" />
        <Title order={3}>
          {loading ? 'Securing Payment Gateway...' : 'Gateway Ready'}
        </Title>
        <Text c="dimmed" size="sm">
          Please do not refresh or close this window.
        </Text>
      </Stack>
    </Center>
  )
}

export default function PaystackCheckout() {
  return (
    <Container size="sm" py={100}>
      <Suspense
        fallback={
          <Center>
            <Stack align="center">
              <Loader size="xl" variant="bars" color="gray.4" />
              <Text c="dimmed">Loading payment engine...</Text>
            </Stack>
          </Center>
        }
      >
        <PaystackContent />
      </Suspense>
    </Container>
  )
}
