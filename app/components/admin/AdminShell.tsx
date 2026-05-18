// // /app/components/admin/AdminShell.tsx

// 'use client'

// import { useState, useEffect } from 'react'
// import { AppShell, Burger, Group, Text, ActionIcon, Indicator, Drawer, ScrollArea, Stack, Button, Divider, Paper, Box } from '@mantine/core'
// import { useDisclosure } from '@mantine/hooks'
// import AdminSidebar from './AdminSidebar'
// import UserMenu from '../layout/Navbar/UserMenu'
// import { useUserStore } from '@/app/store/useUserStore'
// import { IUser, Serialized } from '@/app/types'
// import { Bell, Inbox, Check } from 'lucide-react'
// import { pusherClient } from '@/app/lib/pusherClient'
// import { getAdminNotifications, markAdminNotificationsRead } from '@/app/services/notificationService'

// interface NotificationItem {
//   id: string
//   title: string
//   message: string
//   read: boolean
//   createdAt: string
// }

// export default function AdminShell({
//   children,
//   user,
// }: {
//   children: React.ReactNode
//   user: Serialized<IUser>
// }) {
//   const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] =
//     useDisclosure()
//   const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true)
//   const [drawerOpened, { open: openDrawer, close: closeDrawer }] =
//     useDisclosure(false)

//   // Notification States
//   const [notifications, setNotifications] = useState<NotificationItem[]>([])
//   const unreadCount = notifications.filter((n) => !n.read).length

//   const logout = useUserStore((state) => state.logout)

//   const handleLogout = async () => {
//     try {
//       await fetch('/api/auth/logout', { method: 'POST' })
//       logout()
//       window.location.href = '/'
//     } catch (error) {
//       console.error('Logout failed', error)
//     }
//   }

//   // Fetch initial system/admin notifications on mount
//   // Fetch initial system/admin notifications using Server Action
//   useEffect(() => {
//     const fetchNotifications = async () => {
//       try {
//         const data = await getAdminNotifications()
//         setNotifications(data)
//       } catch (err) {
//         console.error('Failed to load admin notifications:', err)
//       }
//     }

//     fetchNotifications()
//   }, [])

//   // Listen to the Admin Realtime System Channel via Pusher
//   useEffect(() => {
//     if (!user?._id) return

//     const channelName = 'private-admin-system-channel'
//     const channel = pusherClient.subscribe(channelName)

//     const handleNewNotification = (newNotif: NotificationItem) => {
//       setNotifications((prev) => [newNotif, ...prev])
//     }

//     channel.bind('admin-notification', handleNewNotification)

//     return () => {
//       channel.unbind('admin-notification', handleNewNotification)
//       pusherClient.unsubscribe(channelName)
//     }
//   }, [user?._id])

//   // Mark all admin notifications as read using Server Action
//   const markAllAsRead = async () => {
//     try {
//       const success = await markAdminNotificationsRead()
//       if (success) {
//         setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
//       }
//     } catch (err) {
//       console.error('Could not update admin notifications status:', err)
//     }
//   }

//   return (
//     <>
//       <AppShell
//         header={{ height: 60 }}
//         navbar={{
//           width: desktopOpened ? 280 : 80,
//           breakpoint: 'md',
//           collapsed: {
//             mobile: !mobileOpened,
//           },
//         }}
//         padding="md"
//         transitionDuration={300}
//         transitionTimingFunction="ease"
//         styles={{
//           main: { background: '#f8f9fa' },
//         }}
//       >
//         <AppShell.Header
//           withBorder={false}
//           bg="black"
//           c="white"
//           className="shadow-md"
//         >
//           <Group h="100%" px="md" justify="space-between">
//             <Group>
//               <Burger
//                 opened={desktopOpened}
//                 onClick={toggleDesktop}
//                 visibleFrom="md"
//                 size="sm"
//                 color="white"
//               />
//               <Burger
//                 opened={mobileOpened}
//                 onClick={toggleMobile}
//                 hiddenFrom="md"
//                 size="sm"
//                 color="white"
//               />
//               <Text fw={900} lts="-1px" size="xl">
//                 VELORA<span className="text-red-500">.</span>
//               </Text>
//             </Group>

//             <Group gap="lg">
//               <Indicator
//                 color="red"
//                 size={16}
//                 offset={2}
//                 label={unreadCount > 9 ? '9+' : unreadCount}
//                 disabled={unreadCount === 0}
//                 withBorder
//                 processing
//               >
//                 <ActionIcon
//                   variant="subtle"
//                   color="white"
//                   radius="xl"
//                   size="lg"
//                   onClick={openDrawer}
//                 >
//                   <Bell size={20} />
//                 </ActionIcon>
//               </Indicator>

//               <UserMenu
//                 user={user}
//                 onLogout={handleLogout}
//                 variant="dashboard"
//               />
//             </Group>
//           </Group>
//         </AppShell.Header>

//         <AppShell.Navbar
//           p="0"
//           bg="black"
//           withBorder={false}
//           className="transition-all overflow-hidden"
//         >
//           <AdminSidebar onClose={closeMobile} isExpanded={desktopOpened} />
//         </AppShell.Navbar>

//         <AppShell.Main>
//           <div className="max-w-7xl mx-auto py-4">{children}</div>
//         </AppShell.Main>
//       </AppShell>

//       <Drawer
//         opened={drawerOpened}
//         onClose={closeDrawer}
//         title={
//           <Text fw={900} size="lg" c="slate.8">
//             System Alerts & Logs
//           </Text>
//         }
//         position="right"
//         size="md"
//         overlayProps={{ backgroundOpacity: 0.3, blur: 4 }}
//       >
//         <Stack gap="md" h="100%">
//           {unreadCount > 0 && (
//             <Button
//               variant="light"
//               color="dark"
//               size="xs"
//               leftSection={<Check size={14} />}
//               onClick={markAllAsRead}
//               fullWidth
//             >
//               Clear alerts count
//             </Button>
//           )}

//           <Divider color="gray.1" />

//           {notifications.length > 0 ? (
//             <ScrollArea h="calc(100vh - 140px)" offsetScrollbars>
//               <Stack gap="xs">
//                 {notifications.map((notif) => (
//                   <Paper
//                     key={notif.id}
//                     p="sm"
//                     withBorder
//                     radius="md"
//                     bg={notif.read ? 'white' : 'red.0'}
//                     style={{
//                       borderColor: notif.read
//                         ? undefined
//                         : 'var(--mantine-color-red-2)',
//                       transition: 'background-color 0.2s ease',
//                     }}
//                   >
//                     <Group
//                       justify="space-between"
//                       wrap="nowrap"
//                       align="flex-start"
//                     >
//                       <Stack gap={2} style={{ flex: 1 }}>
//                         <Text
//                           size="sm"
//                           fw={notif.read ? 700 : 800}
//                           c={notif.read ? 'gray.8' : 'red.9'}
//                         >
//                           {notif.title}
//                         </Text>
//                         <Text size="xs" c="gray.6">
//                           {notif.message}
//                         </Text>
//                       </Stack>
//                       {!notif.read && (
//                         <Box
//                           w={8}
//                           h={8}
//                           bg="red.6"
//                           style={{
//                             borderRadius: '50%',
//                             flexShrink: 0,
//                             marginTop: 6,
//                           }}
//                         />
//                       )}
//                     </Group>
//                     <Text size="10px" c="dimmed" mt={6} ta="right">
//                       {new Date(notif.createdAt).toLocaleDateString(undefined, {
//                         hour: '2-digit',
//                         minute: '2-digit',
//                       })}
//                     </Text>
//                   </Paper>
//                 ))}
//               </Stack>
//             </ScrollArea>
//           ) : (
//             <Box style={{ flex: 1 }}>
//               <Stack align="center" justify="center" py={100} gap="xs">
//                 <Inbox size={44} strokeWidth={1} color="gray" />
//                 <Text size="sm" c="dimmed" fw={500}>
//                   No system alerts to report.
//                 </Text>
//               </Stack>
//             </Box>
//           )}
//         </Stack>
//       </Drawer>
//     </>
//   )
// }

'use client'

import { useState, useEffect } from 'react'
import { AppShell, Burger, Group, Text, ActionIcon, Indicator, Drawer, ScrollArea, Stack, Button, Divider, Paper, Box } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import AdminSidebar from './AdminSidebar'
import UserMenu from '../layout/Navbar/UserMenu'
import { useUserStore } from '@/app/store/useUserStore'
import { IUser, Serialized } from '@/app/types'
import { Bell, Inbox, Check } from 'lucide-react'
import { pusherClient } from '@/app/lib/pusherClient'
import { getAdminNotifications, markAdminNotificationsRead } from '@/app/services/notificationService'

interface NotificationItem {
  id: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

export default function AdminShell({
  children,
  user,
}: {
  children: React.ReactNode
  user: Serialized<IUser>
}) {
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure()
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true)
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] = useDisclosure(false)

  // Notification States
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const unreadCount = notifications.filter((n) => !n.read).length

  const logout = useUserStore((state) => state.logout)

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      logout()
      window.location.href = '/'
    } catch (error) {
      console.error('Logout failed', error)
    }
  }

  // Fetch initial system/admin notifications on mount
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await getAdminNotifications()
        setNotifications(data)
      } catch (err) {
        console.error('Failed to load admin notifications:', err)
      }
    }

    fetchNotifications()
  }, [])

  // Listen to the Admin Realtime System Channel via Pusher
  useEffect(() => {
    if (!user?._id) return

    const channelName = 'private-admin-system-channel'
    const channel = pusherClient.subscribe(channelName)

    const handleNewNotification = (newNotif: NotificationItem) => {
      setNotifications((prev) => {
        // Critical addition: prevent memory stack leakage/duplicates in UI lists
        if (prev.some((n) => n.id === newNotif.id)) return prev
        return [newNotif, ...prev]
      })
    }

    channel.bind('admin-notification', handleNewNotification)

    return () => {
      channel.unbind('admin-notification', handleNewNotification)
      pusherClient.unsubscribe(channelName)
    }
  }, [user?._id])

  // Mark all admin notifications as read using Server Action
  const markAllAsRead = async () => {
    try {
      const success = await markAdminNotificationsRead()
      if (success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      }
    } catch (err) {
      console.error('Could not update admin notifications status:', err)
    }
  }

  return (
    <>
      <AppShell
        header={{ height: 60 }}
        navbar={{
          width: desktopOpened ? 280 : 80,
          breakpoint: 'md',
          collapsed: { mobile: !mobileOpened },
        }}
        padding="md"
        transitionDuration={300}
        transitionTimingFunction="ease"
        styles={{ main: { background: '#f8f9fa' } }}
      >
        <AppShell.Header withBorder={false} bg="black" c="white" className="shadow-md">
          <Group h="100%" px="md" justify="space-between">
            <Group>
              <Burger opened={desktopOpened} onClick={toggleDesktop} visibleFrom="md" size="sm" color="white" />
              <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="md" size="sm" color="white" />
              <Text fw={900} lts="-1px" size="xl">
                VELORA<span className="text-red-500">.</span>
              </Text>
            </Group>

            <Group gap="lg">
              <Indicator
                color="red"
                size={16}
                offset={2}
                label={unreadCount > 9 ? '9+' : unreadCount}
                disabled={unreadCount === 0}
                withBorder
                processing
              >
                <ActionIcon variant="subtle" color="white" radius="xl" size="lg" onClick={openDrawer}>
                  <Bell size={20} />
                </ActionIcon>
              </Indicator>

              <UserMenu user={user} onLogout={handleLogout} variant="dashboard" />
            </Group>
          </Group>
        </AppShell.Header>

        <AppShell.Navbar p="0" bg="black" withBorder={false} className="transition-all overflow-hidden">
          <AdminSidebar onClose={closeMobile} isExpanded={desktopOpened} />
        </AppShell.Navbar>

        <AppShell.Main>
          <div className="max-w-7xl mx-auto py-4">{children}</div>
        </AppShell.Main>
      </AppShell>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        title={
          <Text fw={900} size="lg" c="slate.8">
            System Alerts & Logs
          </Text>
        }
        position="right"
        size="md"
        overlayProps={{ backgroundOpacity: 0.3, blur: 4 }}
      >
        <Stack gap="md" h="100%">
          {unreadCount > 0 && (
            <Button
              variant="light"
              color="dark"
              size="xs"
              leftSection={<Check size={14} />}
              onClick={markAllAsRead}
              fullWidth
            >
              Clear alerts count
            </Button>
          )}

          <Divider color="gray.1" />

          {notifications.length > 0 ? (
            <ScrollArea h="calc(100vh - 140px)" offsetScrollbars>
              <Stack gap="xs" pr="xs">
                {notifications.map((notif) => (
                  <Paper
                    key={notif.id}
                    p="sm"
                    withBorder
                    radius="md"
                    bg={notif.read ? 'white' : 'red.0'}
                    style={{
                      borderColor: notif.read ? undefined : 'var(--mantine-color-red-2)',
                      transition: 'background-color 0.2s ease',
                    }}
                  >
                    <Group justify="space-between" wrap="nowrap" align="flex-start">
                      <Stack gap={2} style={{ flex: 1 }}>
                        <Text
                          size="sm"
                          fw={notif.read ? 700 : 800}
                          c={notif.read ? 'gray.8' : 'red.9'}
                        >
                          {notif.title}
                        </Text>
                        <Text size="xs" c="gray.6">
                          {notif.message}
                        </Text>
                      </Stack>
                      {!notif.read && (
                        <Box
                          w={8}
                          h={8}
                          bg="red.6"
                          style={{
                            borderRadius: '50%',
                            flexShrink: 0,
                            marginTop: 6,
                          }}
                        />
                      )}
                    </Group>
                    <Text size="10px" c="dimmed" mt={6} ta="right">
                      {new Date(notif.createdAt).toLocaleDateString(undefined, {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </Paper>
                ))}
              </Stack>
            </ScrollArea>
          ) : (
            <Box style={{ flex: 1 }}>
              <Stack align="center" justify="center" py={100} gap="xs">
                <Inbox size={44} strokeWidth={1} color="gray" />
                <Text size="sm" c="dimmed" fw={500}>
                  No system alerts to report.
                </Text>
              </Stack>
            </Box>
          )}
        </Stack>
      </Drawer>
    </>
  )
}