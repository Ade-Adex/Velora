'use client'

import { useSearchParams } from 'next/navigation'
import { Container, Paper, Title, Text, Button, Stack, Alert, List, Group, Flex } from '@mantine/core'
import { CheckCircle, Copy, Building2, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function OrderSuccessPage() {
  const searchParams = useSearchParams()
  const method = searchParams.get('method')
  const orderId = searchParams.get('id')

  return (
    <Container size="xs" py={60}>
      <Paper withBorder p={40} radius="xl" shadow="md">
        <Stack align="center" gap="lg">
          <CheckCircle size={60} color="green" />
          <Title order={1} ta="center" className="text-xl! font-bold">
            Order Placed Successfully!
          </Title>
          <Text c="dimmed" ta="center">
            Order ID:{' '}
            <span className="font-bold text-gray-900">
              {orderId?.slice(-8).toUpperCase()}
            </span>
          </Text>

          {method === 'transfer' && (
            <Alert
              icon={<Building2 size={20} />}
              title="Bank Transfer Instructions"
              color="blue"
              radius="md"
              w="100%"
            >
              <Text size="sm" mb="md">
                Please transfer the total amount to the account below to confirm
                your order:
              </Text>
              <Paper p="md" withBorder className="bg-blue-50/50">
                <List spacing="xs" size="sm" center>
                  <List.Item>
                    <b>Bank:</b> Zenith Bank
                  </List.Item>
                  <List.Item>
                    <b>Account Name:</b> Velora Digital Store
                  </List.Item>
                  <List.Item>
                    <b>Account Number:</b> 1234567890
                  </List.Item>
                </List>
              </Paper>
              <Text size="xs" mt="md" c="dimmed" ta="center">
                Note: Your order will be processed once we verify the
                transaction. Please use your Order ID as the reference.
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
              fullWidth
              size="sm"
            >
              View My Orders
            </Button>

            <Button color="blue" component={Link} href="/" fullWidth size="sm">
              Continue Shopping
            </Button>
          </Flex>
        </Stack>
      </Paper>
    </Container>
  )
}