// /app/components/admin/AdminStats.tsx
import { Paper, Text, Group, SimpleGrid, ThemeIcon, Stack } from '@mantine/core'
import { Banknote, Package, Users, BarChart3 } from 'lucide-react'

interface StatItem {
  title: string
  value: string | number
  diff: number
  icon: typeof Package
  color: string
}

export function AdminStats({ data }: { data: StatItem[] }) {
  return (
    <SimpleGrid cols={{ base: 1, xs: 2, md: 4 }} spacing="md">
      {data.map((stat) => {
        const Icon = stat.icon
        return (
          <Paper withBorder p="md" radius="md" key={stat.title} shadow="xs">
            <Group justify="space-between">
              <Stack gap={0}>
                <Text
                  size="xs"
                  c="dimmed"
                  fw={700}
                  className="uppercase tracking-wider"
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
                <Icon size={24} />
              </ThemeIcon>
            </Group>

            <Group gap="xs" mt="md">
              <Text c={stat.diff > 0 ? 'teal' : 'red'} size="sm" fw={700}>
                {stat.diff > 0 ? '+' : ''}
                {stat.diff}%
              </Text>
              <Text size="xs" c="dimmed">
                vs last month
              </Text>
            </Group>
          </Paper>
        )
      })}
    </SimpleGrid>
  )
}
