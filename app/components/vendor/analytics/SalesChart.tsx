'use client'

import { Box, Text, Stack, Tooltip } from '@mantine/core'

export function SimpleSalesChart({
  data,
}: {
  data: { date: string; amount: number }[]
}) {
  const maxAmount = Math.max(...data.map((d) => d.amount), 1)
  
  // Define 4 "levels" for the background grid
  const levels = [1, 0.75, 0.5, 0.25]

  return (
    <Box h={300} className="relative mt-8">
      {/* Background Levels (Grid Lines) */}
      <Box className="absolute inset-0 flex flex-col justify-between pointer-events-none mb-8">
        {levels.map((lvl) => (
          <Box key={lvl} className="w-full border-t border-gray-100 flex justify-between items-start">
            <Text size="10px" c="dimmed" className="mt-[-8px]">
              ₦{(maxAmount * lvl).toLocaleString()}
            </Text>
          </Box>
        ))}
        <Box className="w-full border-t-2 border-gray-200" /> {/* Base line */}
      </Box>

      {/* Bars Container */}
      <Box 
        h={250} 
        className="relative z-10 flex items-end justify-between gap-3 px-8"
      >
        {data.map((day, index) => {
          const heightPercentage = (day.amount / maxAmount) * 100

          return (
            <Stack key={index} align="center" gap="xs" className="flex-1 h-full justify-end">
              <Tooltip
                label={`₦${day.amount.toLocaleString()}`}
                withArrow
                position="top"
              >
                <Box
                  className="w-full rounded-t-md transition-all duration-500 ease-out hover:brightness-90 cursor-pointer"
                  style={{
                    height: `${heightPercentage}%`,
                    // Use a direct Hex or RGB if the CSS variable is failing
                    backgroundColor: day.amount > 0 ? '#228be6' : 'transparent',
                    minHeight: day.amount > 0 ? '4px' : '0px',
                    boxShadow: day.amount > 0 ? '0px -2px 10px rgba(34, 139, 230, 0.2)' : 'none'
                  }}
                />
              </Tooltip>
              
              {/* Date Label */}
              <Box className="h-6 flex items-center">
                <Text size="xs" c="dimmed" fw={700} className="whitespace-nowrap">
                  {day.date}
                </Text>
              </Box>
            </Stack>
          )
        })}
      </Box>
    </Box>
  )
}