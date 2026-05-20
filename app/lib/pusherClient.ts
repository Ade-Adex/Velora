// /app/lib/pusherClient.ts

import Pusher from 'pusher-js'

export const pusherClient =
  typeof window !== 'undefined'
    ? new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        // Add this line to handle private channel handshakes:
        authEndpoint: '/api/pusher/auth',
      })
    : (null as unknown as Pusher)     