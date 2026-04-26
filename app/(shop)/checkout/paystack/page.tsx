'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Container, Stack, Title, Text, Loader, Center } from '@mantine/core'
import { useUserStore } from '@/app/store/useUserStore'

// --- STRICT INTERFACES ---

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
        const res = await fetch(`/api/orders/${orderId}`)
        if (!res.ok) throw new Error('Order not found')

        const orderData: OrderData = await res.json()

        if (
          !document.querySelector(
            'script[src="https://js.paystack.co/v1/inline.js"]',
          )
        ) {
          const script = document.createElement('script')
          script.src = 'https://js.paystack.co/v1/inline.js'
          script.async = true
          document.body.appendChild(script)
          script.onload = () => setupPaystack(orderData)
        } else {
          setupPaystack(orderData)
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
        amount: Math.round(orderData.totals.grandTotal * 100 * 1600),
        currency: 'NGN',
        ref: orderData.orderNumber,
        callback: (response: PaystackResponse) => {
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

// Final exported component with Suspense wrapper
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