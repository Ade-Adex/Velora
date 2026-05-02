import { Stack, Title, Grid, Paper, Text, Group, Button } from '@mantine/core'
import { Wallet, Package, ShoppingCart, TrendingUp, Plus } from 'lucide-react'
import { AdminStats } from '@/app/components/admin/AdminStats' // Reusing your existing component

interface VendorStatItem {
  title: string
  value: string | number
  icon: React.ElementType
  color: string
}

export default async function VendorDashboard() {
  // In production, these values would come from:
  // Product.countDocuments({ vendor: currentUser._id })
  // Order.find({ "items.vendor": currentUser._id })
  
  const stats: VendorStatItem[] = [
    { title: 'Store Credit', value: '₦142,500', icon: Wallet, color: 'blue' },
    { title: 'Active Products', value: 24, icon: Package, color: 'teal' },
    { title: 'Pending Orders', value: 7, icon: ShoppingCart, color: 'orange' },
    { title: 'Monthly Growth', value: '+12%', icon: TrendingUp, color: 'grape' },
  ]

  return (
    <Stack gap="xl">
      <Group justify="space-between" align="flex-end">
        <header>
          <Title order={2} fw={900} lts="-1px">
            Merchant Central
          </Title>
          <Text c="dimmed" size="sm">
            Manage your inventory and track your business growth.
          </Text>
        </header>
        <Button 
          leftSection={<Plus size={18} />} 
          variant="filled" 
          color="blue.7" 
          radius="md"
          fw={700}
        >
          List New Product
        </Button>
      </Group>

      {/* Reusing your AdminStats UI for consistency but with Vendor data */}
      <AdminStats data={stats} />

      <Grid gutter="md">
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Paper withBorder radius="lg" shadow="sm">
             <Group p="md" justify="space-between" className="border-b border-gray-100">
                <Text fw={800} size="sm" className="uppercase tracking-tight">
                  Recent Sales Requests
                </Text>
              </Group>
            <div className="p-20 text-center">
              <Text c="dimmed" size="sm" fw={500}>
                Your recent orders will appear here once customers purchase your items.
              </Text>
            </div>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="md">
            <Paper withBorder p="lg" radius="lg" bg="blue.9" c="white" shadow="md">
              <Title order={4} mb="xs">Performance Tips</Title>
              <Text size="sm" opacity={0.8} mb="md" fw={500}>
                Products with detailed specifications and clear gallery images see a 40% higher conversion rate.
              </Text>
              <Button variant="white" color="blue.9" fullWidth radius="md" size="xs" fw={800}>
                View Seller Guide
              </Button>
            </Paper>

            <Paper withBorder p="md" radius="lg" shadow="sm">
              <Text fw={800} size="xs" mb="sm" tt="uppercase" c="dimmed">Account Verification</Text>
              <Text size="sm" fw={600} c="green.7">✓ Verified Merchant Status</Text>
            </Paper>
          </Stack>
        </Grid.Col>
      </Grid>
    </Stack>
  )
            }
