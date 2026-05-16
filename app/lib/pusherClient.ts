// /app/lib/pusherClient.ts

import Pusher from 'pusher-js'

// Ensure the code safely skips constructor initialization if executed on the server side
export const pusherClient =
  typeof window !== 'undefined'
    ? new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
        cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
        // If using standard user authentication or custom endpoints, add them here
      })
    : (null as unknown as Pusher)