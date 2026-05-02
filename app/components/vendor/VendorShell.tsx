// /app/components/vendor/VendorShell.tsx


'use client';
import { AppShell, Burger, Group, Text, Avatar, Menu, UnstyledButton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import VendorSidebar from './VendorSidebar';
import { IUser, Serialized } from '@/app/types';
import { ChevronDown, LogOut, User as UserIcon } from 'lucide-react';

export default function VendorShell({ children, user }: { children: React.ReactNode; user: Serialized<IUser> }) {
  const [opened, { toggle, close }] = useDisclosure();

  return (
    <AppShell
      header={{ height: 70 }}
      navbar={{ width: 280, breakpoint: 'md', collapsed: { mobile: !opened } }}
      padding="xl"
      styles={{ main: { backgroundColor: '#F8FAFC' } }}
    >
      <AppShell.Header withBorder={false} bg="white" className="shadow-sm">
        <Group h="100%" px="xl" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="md" size="sm" />
            <Text fw={900} size="xl" className="md:hidden italic">VELORA</Text>
          </Group>

          <Group gap="xl">
            <Menu shadow="md" width={200} position="bottom-end">
              <Menu.Target>
                <UnstyledButton>
                  <Group gap="xs">
                    <Avatar src={user.image} radius="xl" color="indigo" />
                    <div className="hidden sm:block">
                      <Text size="sm" fw={800}>{user.fullName}</Text>
                      <Text size="xs" c="dimmed">{user.vendorProfile?.shopName || 'Store Manager'}</Text>
                    </div>
                    <ChevronDown size={14} />
                  </Group>
                </UnstyledButton>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Merchant Account</Menu.Label>
                <Menu.Item leftSection={<UserIcon size={14} />}>Profile Settings</Menu.Item>
                <Menu.Divider />
                <Menu.Item color="red" leftSection={<LogOut size={14} />}>Log Out</Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar withBorder={false}>
        <VendorSidebar onClose={close} />
      </AppShell.Navbar>

      <AppShell.Main>
        <Box className="max-w-7xl mx-auto">{children}</Box>
      </AppShell.Main>
    </AppShell>
  );
                                                                }
