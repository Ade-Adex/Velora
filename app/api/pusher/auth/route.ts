// /app/api/pusher/auth/route.ts
import { NextResponse } from 'next/server'
import { pusherServer } from '@/app/lib/pusherServer'
import { getCurrentUser } from '@/app/services/auth-service'

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()

    // 1. Block unauthenticated traffic entirely
    if (!user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Pusher sends data as application/x-www-form-urlencoded by default
    const formData = await req.formData()
    const socketId = formData.get('socket_id') as string
    const channelName = formData.get('channel_name') as string

    // 2. Validate specific private channel structural permissions
    if (channelName.startsWith('private-admin-') && user.role !== 'admin') {
      return new NextResponse('Forbidden to Non-Admins', { status: 403 })
    }

    if (channelName.startsWith('private-user-')) {
      const vendorIdFromChannel = channelName.replace('private-user-', '')
      // Ensure vendors can only listen to their own real-time stream
      if (user.id !== vendorIdFromChannel && user.role !== 'admin') {
        return new NextResponse('Forbidden Private Channel Channel access', {
          status: 403,
        })
      }
    }

    // 3. Generate authorization string using pusherServer
    const authResponse = pusherServer.authorizeChannel(socketId, channelName)

    return NextResponse.json(authResponse)
  } catch (error) {
    console.error('Pusher authentication route failure:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
