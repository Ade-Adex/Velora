// /app/components/admin/AdminStats.tsx

'use client'
import React from 'react'
import { Paper, Text, Group, SimpleGrid, ThemeIcon, Stack, rem } from '@mantine/core'
import { 
  Wallet, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  Banknote, 
  BarChart3, 
  HelpCircle,
  LucideIcon 
} from 'lucide-react'

// Map of string keys to components for the Vendor Page
const IconMap: Record<string, LucideIcon> = {
  wallet: Wallet,
  package: Package,
  cart: ShoppingCart,
  trend: TrendingUp,
  users: Users,
  bank: Banknote,
  chart: BarChart3,
}

export interface StatItem {
  title: string
  value: string | number
  diff: number
  /** 
   * Accepts a Lucide component OR a string key from IconMap 
   * React.ElementType is the standard type for components 
   */
  icon: React.ElementType | keyof typeof IconMap
  color: string
}

interface AdminStatsProps {
  data: StatItem[]
}

export function AdminStats({ data }: AdminStatsProps) {
  return (
    <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} spacing="md">
      {data.map((stat) => {
        // Type Guard to resolve the icon correctly
        let ResolvedIcon: React.ElementType;
        
        if (typeof stat.icon === 'string') {
          ResolvedIcon = IconMap[stat.icon] || HelpCircle;
        } else {
          ResolvedIcon = stat.icon;
        }

        return (
          <Paper withBorder p="md" radius="lg" key={stat.title} shadow="sm">
            <Group justify="space-between">
              <Stack gap={0}>
                <Text
                  size="xs"
                  c="dimmed"
                  fw={700}
                  tt="uppercase"
                  lts={rem(1)}
                >
                  {stat.title}
                </Text>
                <Text fw={900} size="xl">
                  {stat.value}
                </Text>
              </Stack>
              <ThemeIcon
                color={stat.color}
                variant="light"
                size={48}
                radius="md"
              >
                <ResolvedIcon size={24} strokeWidth={2.5} />
              </ThemeIcon>
            </Group>

            <Group gap="xs" mt="md">
              <Text 
                c={stat.diff >= 0 ? 'teal.7' : 'red.7'} 
                size="sm" 
                fw={800}
              >
                {stat.diff >= 0 ? '+' : ''}{stat.diff}%
              </Text>
              <Text size="xs" c="dimmed" fw={500}>
                vs last month
              </Text>
            </Group>
          </Paper>
        )
      })}
    </SimpleGrid>
  )
}
