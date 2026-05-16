// /app/components/vendor/VendorShell.tsx
'use client'

import { useState, useEffect } from 'react'
import { AppShell, Burger, Group, Text, ActionIcon, Box, Indicator, Drawer, ScrollArea, Stack, Button, Divider, Paper } from '@mantine/core'
import { useDisclosure, useMediaQuery } from '@mantine/hooks'
import VendorSidebar from './VendorSidebar'
import UserMenu from '@/app/components/layout/Navbar/UserMenu'
import { IUser, Serialized } from '@/app/types'
import { PanelLeftClose, PanelLeft, Bell, Inbox, Check } from 'lucide-react'
import { useUserStore } from '@/app/store/useUserStore'
import { pusherClient } from '@/app/lib/pusherClient'
import { getVendorNotifications, markVendorNotificationsRead } from '@/app/services/notificationService'

interface NotificationItem {
  id: string
  title: string
  message: string
  read: boolean
  createdAt: string
}

export default function VendorShell({
  children,
  user,
}: {
  children: React.ReactNode
  user: Serialized<IUser>
}) {
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] =
    useDisclosure()
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true)
  const [drawerOpened, { open: openDrawer, close: closeDrawer }] =
    useDisclosure(false)
  const isMobile = useMediaQuery('(max-width: 48em)')

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

  // Fetch initial notifications using Server Action
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?._id) return
      try {
        const data = await getVendorNotifications(user._id)
        setNotifications(data)
      } catch (err) {
        console.error('Failed to load notifications:', err)
      }
    }

    fetchNotifications()
  }, [user?._id])

  // Listen to User-Specific Realtime Notifications via Pusher
  // useEffect(() => {
  //   if (!user?._id) return

  //   const channelName = `private-user-${user._id}`
  //   const channel = pusherClient.subscribe(channelName)

  //   const handleNewNotification = (newNotif: NotificationItem) => {
  //     setNotifications((prev) => [newNotif, ...prev])
  //   }

  //   channel.bind('new-notification', handleNewNotification)

  //   return () => {
  //     channel.unbind('new-notification', handleNewNotification)
  //     pusherClient.unsubscribe(channelName)
  //   }
  // }, [user?._id])


  useEffect(() => {
    if (!user?._id) return

    // Convert object IDs safely to pure matching strings
    const stringUserId = user._id.toString()
    const channelName = `private-user-${stringUserId}`
    const channel = pusherClient.subscribe(channelName)

    const handleNewNotification = (newNotif: NotificationItem) => {
      // Prevent duplicate entries from multiple socket bindings
      setNotifications((prev) => {
        if (prev.some((n) => n.id === newNotif.id)) return prev
        return [newNotif, ...prev]
      })
    }

    channel.bind('new-notification', handleNewNotification)

    return () => {
      channel.unbind('new-notification', handleNewNotification)
      pusherClient.unsubscribe(channelName)
    }
  }, [user?._id])

  // Mark all visible notifications as read using Server Action
  const markAllAsRead = async () => {
    if (!user?._id) return
    try {
      const success = await markVendorNotificationsRead(user._id)
      if (success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      }
    } catch (err) {
      console.error('Could not mark items as read:', err)
    }
  }

  return (
    <>
      <AppShell
        header={{ height: 70 }}
        navbar={{
          width: desktopOpened ? 280 : 80,
          breakpoint: 'md',
          collapsed: { mobile: !mobileOpened },
        }}
        padding={isMobile ? 'lg' : 'xl'}
        transitionDuration={300}
        styles={{ main: { backgroundColor: '#F8FAFC' } }}
      >
        <AppShell.Header
          withBorder={false}
          bg="white"
          className="shadow-sm border-b border-slate-100"
        >
          <Group h="100%" px={isMobile ? 'lg' : 'xl'} justify="space-between">
            <Group gap="lg">
              <Burger
                opened={mobileOpened}
                onClick={toggleMobile}
                hiddenFrom="md"
                size="sm"
              />
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={toggleDesktop}
                visibleFrom="md"
                size="lg"
              >
                {desktopOpened ? (
                  <PanelLeftClose size={20} />
                ) : (
                  <PanelLeft size={20} />
                )}
              </ActionIcon>
              <Text fw={900} size="xl" c="indigo.7" lts="-1px">
                VELORA{' '}
                <Text component="span" fw={300} c="gray.5">
                  VNDR
                </Text>
              </Text>
            </Group>

            <Group gap="md">
              <Indicator
                color="red"
                size={16}
                offset={4}
                label={unreadCount > 9 ? '9+' : unreadCount}
                disabled={unreadCount === 0}
                withBorder
                processing
              >
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  radius="xl"
                  size="lg"
                  onClick={openDrawer}
                >
                  <Bell size={20} />
                </ActionIcon>
              </Indicator>

              <UserMenu
                user={user}
                onLogout={handleLogout}
                variant="dashboard"
              />
            </Group>
          </Group>
        </AppShell.Header>

        <AppShell.Navbar withBorder={false} p={0} className="z-50 shadow-xl">
          <VendorSidebar onClose={closeMobile} isCollapsed={!desktopOpened} />
        </AppShell.Navbar>

        <AppShell.Main>
          <Box className="max-w-7xl mx-auto">{children}</Box>
        </AppShell.Main>
      </AppShell>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        title={
          <Text fw={900} size="lg" c="slate.8">
            Alert Notifications
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
              color="indigo"
              size="xs"
              leftSection={<Check size={14} />}
              onClick={markAllAsRead}
              fullWidth
            >
              Mark all as read
            </Button>
          )}

          <Divider color="gray.1" />

          {notifications.length > 0 ? (
            <Stack gap="xs">
              {notifications.map((notif) => (
                <Paper
                  key={notif.id}
                  p="sm"
                  withBorder
                  radius="md"
                  bg={notif.read ? 'white' : 'blue.0'}
                  style={{
                    borderColor: notif.read
                      ? undefined
                      : 'var(--mantine-color-blue-2)',
                    transition: 'background-color 0.2s ease',
                  }}
                >
                  <Group
                    justify="space-between"
                    wrap="nowrap"
                    align="flex-start"
                  >
                    <Stack gap={2} style={{ flex: 1 }}>
                      <Text
                        size="sm"
                        fw={notif.read ? 700 : 800}
                        c={notif.read ? 'gray.8' : 'indigo.9'}
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
                        bg="blue.6"
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
          ) : (
            <Box style={{ flex: 1 }}>
              <Stack align="center" justify="center" py={100} gap="xs">
                <Inbox size={44} strokeWidth={1} color="gray" />
                <Text size="sm" c="dimmed" fw={500}>
                  Your inbox is completely clear!
                </Text>
              </Stack>
            </Box>
          )}
        </Stack>
      </Drawer>
    </>
  )
}