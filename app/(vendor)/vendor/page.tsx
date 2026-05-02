// /app/(vendor)/vendor/page.tsx

import { Stack, Title, Grid, Paper, Text, Group, Button, Badge, ActionIcon } from '@mantine/core';
import { Wallet, Package, ShoppingCart, TrendingUp, Plus, ArrowUpRight, MoreHorizontal } from 'lucide-react';
import { AdminStats } from '@/app/components/admin/AdminStats';
import { getCurrentUser } from '@/app/services/auth-service';
import connectDB from '@/app/lib/mongodb';
import { Product } from '@/app/models/Product';
import { Order } from '@/app/models/Order';
import { IUser, IOrder, IProduct, StatItem } from '@/app/types';
import Link from 'next/link';


export default async function VendorDashboardPage() {
  await connectDB();
  const user = (await getCurrentUser()) as IUser | null;
  if (!user) return null;

  // Fetch only this vendor's data
  const [vendorProducts, allOrders] = await Promise.all([
    Product.find({ vendor: user._id }).lean() as unknown as IProduct[],
    Order.find({ 'items.vendor': user._id }).sort({ createdAt: -1 }).limit(10).lean() as unknown as IOrder[],
  ]);

  // Calculate Merchant-Specific Revenue
  const totalRevenue = allOrders.reduce((acc, order) => {
    const myItems = order.items.filter(item => item.vendor.toString() === user._id.toString());
    return acc + myItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, 0);

  const stats: StatItem[] = [
  { 
    title: 'Total Revenue', 
    value: `₦${totalRevenue.toLocaleString()}`, 
    diff: 12.5, 
    icon: 'wallet', // String Key from IconMap
    color: 'indigo' 
  },
  { 
    title: 'My Inventory', 
    value: vendorProducts.length, 
    diff: 2.1, 
    icon: 'package', // String Key from IconMap
    color: 'cyan' 
  },
  { 
    title: 'Active Sales', 
    value: allOrders.length, 
    diff: 4.3, 
    icon: 'cart', // String Key from IconMap (maps to ShoppingCart)
    color: 'orange' 
  },
  { 
    title: 'Store Rating', 
    value: '4.8/5', 
    diff: 0.5, 
    icon: 'trend', // String Key from IconMap (maps to TrendingUp)
    color: 'green' 
  },
];


  return (
    <Stack gap="xl">
      <Group justify="space-between" align="flex-end">
        <div>
          <Badge variant="filled" color="indigo.9" size="sm" mb="xs" radius="sm">Merchant Workspace</Badge>
          <Title order={2} fw={900} lts="-1px">Store Overview</Title>
          <Text c="dimmed" size="sm" fw={500}>Welcome back, {user.vendorProfile?.shopName || user.fullName}.</Text>
        </div>
        <Link href="/vendor/products/new" style={{ textDecoration: 'none' }}>
          <Button 
            leftSection={<Plus size={18} />} 
            variant="filled" 
            color="indigo.6" 
            radius="md" 
            size="md"
            fw={800}
          >
            Add Product
          </Button>
        </Link>
      </Group>

      <AdminStats data={stats} />

      <Grid gap="md">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Paper withBorder radius="lg" shadow="sm">
            <Group p="md" justify="space-between" className="border-b border-gray-100">
              <Text fw={800} size="xs" tt="uppercase" c="dimmed" lts="1px">Recent Sales Activity</Text>
              <Link href="/vendor/orders" style={{ textDecoration: 'none' }}>
        <Button variant="subtle" size="xs">View Ledger</Button>
      </Link>
            </Group>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50">
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase">Ref</th>
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase">Customer</th>
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase">My Share</th>
                    <th className="p-4 text-xs font-bold text-gray-400 uppercase text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {allOrders.map((order) => {
                    const myTotal = order.items
                      .filter(i => i.vendor.toString() === user._id.toString())
                      .reduce((s, i) => s + i.price * i.quantity, 0);

                    return (
                      <tr key={order._id.toString()} className="border-t border-gray-100 hover:bg-indigo-50/20 transition-colors">
                        <td className="p-4"><Text size="sm" fw={800}>#{order.orderNumber}</Text></td>
                        <td className="p-4">
                          <Text size="sm" fw={600}>Customer Order</Text>
                          <Text size="xs" c="dimmed">{new Date(order.createdAt).toLocaleDateString()}</Text>
                        </td>
                        <td className="p-4"><Text size="sm" fw={900} c="indigo.7">₦{myTotal.toLocaleString()}</Text></td>
                        <td className="p-4 text-right">
                          <ActionIcon variant="subtle" color="gray"><MoreHorizontal size={16} /></ActionIcon>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Stack gap="md">
            <Paper withBorder p="xl" radius="lg" bg="indigo.9" c="white" shadow="md" pos="relative" style={{ overflow: 'hidden' }}>
              <ArrowUpRight size={120} className="absolute -bottom-4 -right-4 opacity-10" />
              <Title order={4} mb="xs">Merchant Growth</Title>
              <Text size="sm" opacity={0.8} mb="xl" fw={500}>
                Your shop is performing better than 70% of local merchants. Focus on "Electronics" to boost Q3 revenue.
              </Text>
              <Button variant="white" color="indigo.9" fullWidth fw={800} radius="md">View Analytics</Button>
            </Paper>

            <Paper withBorder p="lg" radius="lg" shadow="sm">
              <Text fw={800} size="xs" tt="uppercase" c="dimmed" mb="md" lts="0.5px">Store Health</Text>
              <Group justify="space-between" mb="xs">
                <Text size="sm" fw={600}>Verification Status</Text>
                <Badge color="green" variant="light">Verified</Badge>
              </Group>
              <Group justify="space-between">
                <Text size="sm" fw={600}>Payout Schedule</Text>
                <Text size="sm" c="dimmed">Bi-weekly</Text>
              </Group>
            </Paper>
          </Stack>
        </Grid.Col>
      </Grid>
    </Stack>
  );
          }
