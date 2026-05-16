// /app/lib/pusherClient.ts
'use client'

import PusherClient from 'pusher-js'

// Safely describe the shape Turbopack might use under the hood
interface TurbopackPusher {
  default?: typeof PusherClient
}

const PusherCtor =
  (PusherClient as unknown as TurbopackPusher).default || PusherClient

export const pusherClient = new PusherCtor(
  process.env.NEXT_PUBLIC_PUSHER_KEY!,
  {
    cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    forceTLS: true,
  },
)
