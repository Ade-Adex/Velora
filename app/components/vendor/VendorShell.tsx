// // /app/components/vendor/VendorShell.tsx

// 'use client'
// import {
//   AppShell,
//   Burger,
//   Group,
//   Text,
//   Avatar,
//   Menu,
//   UnstyledButton,
//   Box,
//   ActionIcon,
//   Badge, // Proper Mantine Badge
// } from '@mantine/core'
// import { useDisclosure } from '@mantine/hooks'
// import VendorSidebar from './VendorSidebar'
// import { IUser, Serialized } from '@/app/types'
// import {
//   ChevronDown,
//   LogOut,
//   User as UserIcon,
//   Settings,
//   PanelLeftClose,
//   PanelLeft,
//   Store,
//   Bell,
//   // Removed Badge from here to avoid conflict
// } from 'lucide-react'
// import Link from 'next/link'
// import { signOut } from 'next-auth/react' // Add this for signout functionality

// export default function VendorShell({
//   children,
//   user,
// }: {
//   children: React.ReactNode
//   user: Serialized<IUser>
// }) {
//   const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] =
//     useDisclosure()
//   const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true)

//   return (
//     <AppShell
//       header={{ height: 70 }}
//       navbar={{
//         width: desktopOpened ? 280 : 80,
//         breakpoint: 'md',
//         collapsed: { mobile: !mobileOpened },
//       }}
//       padding="xl"
//       transitionDuration={300}
//       styles={{
//         main: {
//           backgroundColor: '#F8FAFC',
//         },
//       }}
//     >
//       <AppShell.Header
//         withBorder={false}
//         bg="white"
//         className="shadow-sm border-b border-slate-100"
//       >
//         <Group h="100%" px="xl" justify="space-between">
//           <Group gap="lg">
//             <Burger
//               opened={mobileOpened}
//               onClick={toggleMobile}
//               hiddenFrom="md"
//               size="sm"
//             />

//             <ActionIcon
//               variant="subtle"
//               color="gray"
//               onClick={toggleDesktop}
//               visibleFrom="md"
//               size="lg"
//             >
//               {desktopOpened ? (
//                 <PanelLeftClose size={20} />
//               ) : (
//                 <PanelLeft size={20} />
//               )}
//             </ActionIcon>

//             <Text fw={900} size="xl" c="indigo.7" lts="-1px">
//               VELORA{' '}
//               <Text component="span" fw={300} c="gray.5">
//                 VNDR
//               </Text>
//             </Text>
//           </Group>

//           <Group gap="md">
//             <ActionIcon variant="subtle" color="gray" radius="xl" size="lg">
//               <Bell size={20} />
//             </ActionIcon>

//             <Menu
//               shadow="xl"
//               width={260}
//               position="bottom-end"
//               transitionProps={{ transition: 'pop-top-right' }}
//               withArrow
//             >
//               <Menu.Target>
//                 <UnstyledButton className="hover:bg-slate-50 p-1 pr-3 rounded-full transition-colors">
//                   <Group gap="xs">
//                     <Avatar
//                       src={user.image}
//                       radius="xl"
//                       color="indigo"
//                       size="md"
//                       className="border-2 border-indigo-50"
//                     />
//                     <ChevronDown size={14} className="text-slate-400" />
//                   </Group>
//                 </UnstyledButton>
//               </Menu.Target>

//               <Menu.Dropdown p="xs">
//                 <Box p="xs">
//                   <Group gap="sm" mb="xs">
//                     <Avatar src={user.image} radius="md" size="lg" />
//                     <Box style={{ flex: 1 }}>
//                       <Text size="sm" fw={800} truncate>
//                         {user.fullName}
//                       </Text>
//                       <Text size="xs" c="dimmed" truncate>
//                         {user.email}
//                       </Text>
//                     </Box>
//                   </Group>
//                   <Badge variant="light" color="indigo" fullWidth>
//                     {user.vendorProfile?.shopName || 'Store Manager'}
//                   </Badge>
//                 </Box>

//                 <Menu.Divider />

//                 <Menu.Label>Management</Menu.Label>
//                 <Menu.Item
//                   leftSection={<UserIcon size={16} />}
//                   component={Link}
//                   href="/vendor/profile"
//                 >
//                   Personal Profile
//                 </Menu.Item>
//                 <Menu.Item
//                   leftSection={<Store size={16} />}
//                   component={Link}
//                   href="/vendor/settings"
//                 >
//                   Shop Settings
//                 </Menu.Item>
//                 <Menu.Item
//                   leftSection={<Settings size={16} />}
//                   component={Link}
//                   href="/settings"
//                 >
//                   Global Settings
//                 </Menu.Item>

//                 <Menu.Divider />
//                 <Menu.Item
//                   color="red"
//                   leftSection={<LogOut size={16} />}
//                   onClick={() => signOut({ callbackUrl: '/login' })}
//                 >
//                   Sign Out
//                 </Menu.Item>
//               </Menu.Dropdown>
//             </Menu>
//           </Group>
//         </Group>
//       </AppShell.Header>

//       <AppShell.Navbar withBorder={false} p={0} className="z-50 shadow-xl">
//         <VendorSidebar onClose={closeMobile} isCollapsed={!desktopOpened} />
//       </AppShell.Navbar>

//       <AppShell.Main>
//         <Box className="max-w-7xl mx-auto">{children}</Box>
//       </AppShell.Main>
//     </AppShell>
//   )
// }



// /app/components/vendor/VendorShell.tsx
'use client'
import { AppShell, Burger, Group, Text, ActionIcon, Box } from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
import VendorSidebar from './VendorSidebar'
import UserMenu from '@/app/components/layout/Navbar/UserMenu'
import { IUser, Serialized } from '@/app/types'
import { PanelLeftClose, PanelLeft, Bell } from 'lucide-react'
import { signOut } from 'next-auth/react'

export default function VendorShell({
  children,
  user,
}: {
  children: React.ReactNode
  user: Serialized<IUser>
}) {
  const [mobileOpened, { toggle: toggleMobile, close: closeMobile }] = useDisclosure()
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true)

  const handleLogout = () => signOut({ callbackUrl: '/auth/login' })

  return (
    <AppShell
      header={{ height: 70 }}
      navbar={{
        width: desktopOpened ? 280 : 80,
        breakpoint: 'md',
        collapsed: { mobile: !mobileOpened },
      }}
      padding="xl"
      transitionDuration={300}
      styles={{ main: { backgroundColor: '#F8FAFC' } }}
    >
      <AppShell.Header withBorder={false} bg="white" className="shadow-sm border-b border-slate-100">
        <Group h="100%" px="xl" justify="space-between">
          <Group gap="lg">
            <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="md" size="sm" />
            <ActionIcon variant="subtle" color="gray" onClick={toggleDesktop} visibleFrom="md" size="lg">
              {desktopOpened ? <PanelLeftClose size={20} /> : <PanelLeft size={20} />}
            </ActionIcon>
            <Text fw={900} size="xl" c="indigo.7" lts="-1px">
              VELORA <Text component="span" fw={300} c="gray.5">VNDR</Text>
            </Text>
          </Group>

          <Group gap="md">
            <ActionIcon variant="subtle" color="gray" radius="xl" size="lg">
              <Bell size={20} />
            </ActionIcon>
            {/* Using the Shared Component */}
            <UserMenu 
              user={user as unknown as IUser} 
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
  )
}