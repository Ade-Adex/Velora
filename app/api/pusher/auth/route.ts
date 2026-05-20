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

    const formData = await req.formData()
    const socketId = formData.get('socket_id') as string
    const channelName = formData.get('channel_name') as string

    // 2. Validate admin channel permissions
    if (channelName.startsWith('private-admin-') && user.role !== 'admin') {
      return new NextResponse('Forbidden to Non-Admins', { status: 403 })
    }

    // 3. Validate user-specific notification channels
    if (channelName.startsWith('private-user-')) {
      const targetUserId = channelName.replace('private-user-', '')
      if (user.id !== targetUserId && user.role !== 'admin') {
        return new NextResponse('Forbidden Account Channel access', {
          status: 403,
        })
      }
    }

    // 4. Validate vendor-specific dashboard data channels
    if (channelName.startsWith('private-vendor-')) {
      const targetVendorId = channelName.replace('private-vendor-', '')
      if (user.id !== targetVendorId && user.role !== 'admin') {
        return new NextResponse('Forbidden Vendor Table access', {
          status: 403,
        })
      }
    }

    // 5. Generate authorization string using pusherServer
    const authResponse = pusherServer.authorizeChannel(socketId, channelName)
    return NextResponse.json(authResponse)
  } catch (error) {
    console.error('Pusher authentication route failure:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
