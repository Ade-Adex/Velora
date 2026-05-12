'use client'

import { Box, Text, Group, Stack, Tooltip, Paper } from '@mantine/core'

export function SimpleSalesChart({
  data,
}: {
  data: { date: string; amount: number }[]
}) {
  // Find the max value to scale the bars correctly
  const maxAmount = Math.max(...data.map((d) => d.amount), 1)

  return (
    <Box h={250} className="flex items-end justify-between gap-2 px-2">
      {data.map((day, index) => {
        const heightPercentage = (day.amount / maxAmount) * 100

        return (
          <Stack key={index} align="center" gap="xs" className="flex-1">
            <Tooltip
              label={`₦${day.amount.toLocaleString()}`}
              withArrow
              position="top"
            >
              <Box
                className="w-full rounded-t-sm transition-all duration-300 hover:opacity-80"
                style={{
                  height: `${heightPercentage}%`,
                  backgroundColor: 'var(--mantine-color-blue-6)',
                  minHeight: day.amount > 0 ? '4px' : '0px',
                }}
              />
            </Tooltip>
            <Text size="xs" c="dimmed" fw={600}>
              {day.date}
            </Text>
          </Stack>
        )
      })}
    </Box>
  )
}
