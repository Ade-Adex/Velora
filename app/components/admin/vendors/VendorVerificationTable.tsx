// // app/components/admin/vendors/VendorVerificationTable.tsx
// 'use client'

// import { useState } from 'react'
// import {
//   Table,
//   Button,
//   Badge,
//   Group,
//   Avatar,
//   Text,
//   Paper,
//   ActionIcon,
//   Tooltip,
// } from '@mantine/core'
// import { Check, X, Store, Mail, Calendar } from 'lucide-react'
// import { Serialized, IUser } from '@/app/types'
// import { toggleVendorVerification } from '@/app/services/adminService'
// import { useSnackbar } from 'notistack'

// interface Props {
//   initialVendors: Serialized<IUser>[]
// }

// export default function VendorVerificationTable({ initialVendors }: Props) {
//   const [vendors, setVendors] = useState(initialVendors)
//   const [loadingId, setLoadingId] = useState<string | null>(null)
//   const { enqueueSnackbar } = useSnackbar()

//   const handleVerify = async (userId: string) => {
//     setLoadingId(userId)
//     const res = await toggleVendorVerification(userId, true)

//     if (res.success) {
//       enqueueSnackbar(res.message, { variant: 'success' })
//       // Remove from the "Pending" list locally
//       setVendors((prev) => prev.filter((v) => v._id !== userId))
//     } else {
//       enqueueSnackbar(res.error || 'Failed to verify', { variant: 'error' })
//     }
//     setLoadingId(null)
//   }

//   const rows = vendors.map((vendor) => (
//     <Table.Tr key={vendor._id}>
//       <Table.Td>
//         <Group gap="sm">
//           <Avatar src={vendor.image} radius="xl" size="md">
//             {vendor.fullName.charAt(0)}
//           </Avatar>
//           <div>
//             <Text size="sm" fw={500}>
//               {vendor.fullName}
//             </Text>
//             <Group gap={4}>
//               <Mail size={12} className="text-gray-400" />
//               <Text size="xs" c="dimmed">
//                 {vendor.email}
//               </Text>
//             </Group>
//           </div>
//         </Group>
//       </Table.Td>

//       <Table.Td>
//         <Group gap="xs">
//           <Store size={16} className="text-red-500" />
//           <Text size="sm" fw={600}>
//             {vendor.vendorProfile?.shopName || 'N/A'}
//           </Text>
//         </Group>
//       </Table.Td>

//       <Table.Td>
//         <Text size="xs" c="dimmed">
//           {new Date(vendor.createdAt).toLocaleDateString()}
//         </Text>
//       </Table.Td>

//       <Table.Td>
//         <Badge variant="light" color="orange">
//           Pending Review
//         </Badge>
//       </Table.Td>

//       <Table.Td>
//         <Group gap="xs" justify="flex-end">
//           <Button
//             size="compact-xs"
//             color="green"
//             leftSection={<Check size={14} />}
//             loading={loadingId === vendor._id}
//             onClick={() => handleVerify(vendor._id)}
//           >
//             Approve
//           </Button>
//         </Group>
//       </Table.Td>
//     </Table.Tr>
//   ))

//   return (
//     <Paper withBorder radius="md" p="0" className="overflow-hidden">
//       <Table verticalSpacing="md" highlightOnHover>
//         <Table.Thead bg="gray.0">
//           <Table.Tr>
//             <Table.Th>Seller</Table.Th>
//             <Table.Th>Shop Name</Table.Th>
//             <Table.Th>Applied On</Table.Th>
//             <Table.Th>Status</Table.Th>
//             <Table.Th />
//           </Table.Tr>
//         </Table.Thead>
//         <Table.Tbody>
//           {rows.length > 0 ? (
//             rows
//           ) : (
//             <Table.Tr>
//               <Table.Td colSpan={5} align="center" py="xl">
//                 <Text c="dimmed">No pending verification requests found.</Text>
//               </Table.Td>
//             </Table.Tr>
//           )}
//         </Table.Tbody>
//       </Table>
//     </Paper>
//   )
// }




'use client'

import { useState } from 'react'
import {
  Table,
  Button,
  Badge,
  Group,
  Avatar,
  Text,
  Paper,
  ActionIcon,
  Tooltip,
  Stack,
  Box,
  Collapse,
  Grid,
  Title,
  Divider,
} from '@mantine/core'
import { useDisclosure } from '@mantine/hooks'
// Lucide for UI icons
import { 
  Check, X, Mail, Phone, Globe, 
  Building2, CreditCard, ChevronDown, ChevronUp 
} from 'lucide-react'
// React Icons for Brand Socials
import { FaFacebook, FaInstagram, FaTwitter } from 'react-icons/fa' 
import { Serialized, IUser } from '@/app/types'
import { toggleVendorVerification } from '@/app/services/adminService'
import { useSnackbar } from 'notistack'

interface Props {
  initialVendors: Serialized<IUser>[]
}

/**
 * Sub-component for individual Vendor Rows to manage independent Collapse states
 */
function VendorRow({ vendor, onAction, loadingId }: { 
  vendor: Serialized<IUser>, 
  onAction: (id: string, v: boolean) => void,
  loadingId: string | null 
}) {
  const [opened, { toggle }] = useDisclosure(false)
  const profile = vendor.vendorProfile

  return (
    <>
      <Table.Tr>
        <Table.Td>
          <Group gap="sm">
            <Avatar
              src={profile?.logo || vendor.image}
              radius="md"
              size="md"
              color="indigo"
            >
              {profile?.shopName?.charAt(0) || vendor.fullName.charAt(0)}
            </Avatar>
            <Box>
              <Text size="sm" fw={600} style={{ color: 'var(--foreground)' }}>
                {profile?.shopName || 'No Shop Name'}
              </Text>
              <Text size="xs" c="dimmed">
                {vendor.fullName}
              </Text>
            </Box>
          </Group>
        </Table.Td>

        <Table.Td>
          <Group gap="xs">
            <Mail size={14} style={{ opacity: 0.6 }} />
            <Text size="sm">{profile?.supportEmail || vendor.email}</Text>
          </Group>
        </Table.Td>

        <Table.Td>
          <Text size="xs" fw={500}>
            {new Date(vendor.createdAt).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </Text>
        </Table.Td>

        <Table.Td>
          <Button
            variant="subtle"
            size="compact-xs"
            onClick={toggle}
            rightSection={
              opened ? <ChevronUp size={14} /> : <ChevronDown size={14} />
            }
          >
            Review Profile
          </Button>
        </Table.Td>

        <Table.Td>
          <Group gap="xs" justify="flex-end">
            <Tooltip label="Reject Application">
              <ActionIcon
                variant="light"
                color="red"
                onClick={() => onAction(vendor._id, false)}
                loading={loadingId === vendor._id}
              >
                <X size={18} />
              </ActionIcon>
            </Tooltip>
            <Button
              size="sm"
              color="green"
              leftSection={<Check size={16} />}
              loading={loadingId === vendor._id}
              onClick={() => onAction(vendor._id, true)}
              radius="md"
            >
              Approve
            </Button>
          </Group>
        </Table.Td>
      </Table.Tr>

      {/* Expanded Details Section */}
      <Table.Tr>
        <Table.Td colSpan={5} p={0}>
          <Collapse expanded={opened}>
            <Box
              p="xl"
              bg="var(--mantine-color-gray-0)"
              style={{ borderBottom: '1px solid var(--mantine-color-gray-3)' }}
            >
              <Grid gap="xl">
                {/* 1. Business Info */}
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <Text fw={700} size="xs" mb="xs" c="dimmed" tt="uppercase">
                    Business Info
                  </Text>
                  <Stack gap={8}>
                    <Text size="sm">
                      <span style={{ fontWeight: 600 }}>About:</span>{' '}
                      {profile?.description || 'No description provided.'}
                    </Text>
                    {profile?.website && (
                      <Group gap="xs">
                        <Globe size={14} />
                        <Text
                          size="sm"
                          component="a"
                          href={profile.website}
                          target="_blank"
                          c="blue"
                          style={{ textDecoration: 'underline' }}
                        >
                          Official Website
                        </Text>
                      </Group>
                    )}
                    <Group gap="sm" mt="xs">
                      {profile?.socialLinks?.facebook && (
                        <ActionIcon
                          component="a"
                          href={profile.socialLinks.facebook}
                          target="_blank"
                          variant="default"
                          color="blue"
                        >
                          <FaFacebook size={16} />
                        </ActionIcon>
                      )}
                      {profile?.socialLinks?.instagram && (
                        <ActionIcon
                          component="a"
                          href={profile.socialLinks.instagram}
                          target="_blank"
                          variant="default"
                          color="pink"
                        >
                          <FaInstagram size={16} />
                        </ActionIcon>
                      )}
                      {profile?.socialLinks?.twitter && (
                        <ActionIcon
                          component="a"
                          href={profile.socialLinks.twitter}
                          target="_blank"
                          variant="default"
                          color="cyan"
                        >
                          <FaTwitter size={16} />
                        </ActionIcon>
                      )}
                    </Group>
                  </Stack>
                </Grid.Col>

                {/* 2. Bank Details */}
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <Text fw={700} size="xs" mb="xs" c="dimmed" tt="uppercase">
                    Payout Information
                  </Text>
                  <Paper
                    withBorder
                    p="md"
                    radius="sm"
                    style={{ borderStyle: 'dashed', backgroundColor: 'white' }}
                  >
                    <Stack gap={6}>
                      <Group gap="xs">
                        <Building2
                          size={16}
                          color="var(--mantine-color-indigo-6)"
                        />
                        <Text size="sm" fw={700}>
                          {profile?.bankDetails?.bankName || 'N/A'}
                        </Text>
                      </Group>
                      <Group gap="xs">
                        <CreditCard size={16} color="gray" />
                        <Text size="sm" style={{ letterSpacing: '1px' }}>
                          {profile?.bankDetails?.accountNumber || 'N/A'}
                        </Text>
                      </Group>
                      <Divider
                        variant="dotted"
                        label="Account Name"
                        labelPosition="left"
                      />
                      <Text size="xs" fw={500}>
                        {profile?.bankDetails?.accountName || 'Unknown'}
                      </Text>
                    </Stack>
                  </Paper>
                </Grid.Col>

                {/* 3. Contact Channels */}
                <Grid.Col span={{ base: 12, md: 4 }}>
                  <Text fw={700} size="xs" mb="xs" c="dimmed" tt="uppercase">
                    Support Channels
                  </Text>
                  <Stack gap={8}>
                    <Group gap="xs">
                      <Phone size={14} style={{ opacity: 0.7 }} />
                      <Text size="sm">
                        {profile?.supportPhone || 'No phone provided'}
                      </Text>
                    </Group>
                    <Group gap="xs">
                      <Mail size={14} style={{ opacity: 0.7 }} />
                      <Text size="sm">
                        {profile?.supportEmail || 'No email provided'}
                      </Text>
                    </Group>
                  </Stack>
                </Grid.Col>
              </Grid>
            </Box>
          </Collapse>
        </Table.Td>
      </Table.Tr>
    </>
  )
}

export default function VendorVerificationTable({ initialVendors }: Props) {
  const [vendors, setVendors] = useState(initialVendors)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const { enqueueSnackbar } = useSnackbar()

  const handleAction = async (userId: string, verify: boolean) => {
    setLoadingId(userId)
    try {
      const res = await toggleVendorVerification(userId, verify)
      if (res.success) {
        enqueueSnackbar(res.message, { variant: 'success' })
        setVendors((prev) => prev.filter((v) => v._id !== userId))
      } else {
        enqueueSnackbar(res.error || 'Operation failed', { variant: 'error' })
      }
    } catch (err) {
      enqueueSnackbar('Internal server error', { variant: 'error' })
    } finally {
      setLoadingId(null)
    }
  }

  return (
    <Paper 
      withBorder 
      radius="md" 
      bg="var(--background)" 
      className="overflow-hidden shadow-sm"
    >
      <Box p="md" style={{ borderBottom: '1px solid var(--mantine-color-default-border)' }}>
        <Group justify="space-between">
          <Title order={4}>Vendor Verification Queue</Title>
          <Badge color="orange" variant="filled" size="lg" radius="sm">
            {vendors.length} Pending Requests
          </Badge>
        </Group>
      </Box>

      <Table.ScrollContainer minWidth={800}>
        <Table verticalSpacing="md" horizontalSpacing="md" highlightOnHover>
          <Table.Thead bg="var(--mantine-color-gray-1)">
            <Table.Tr>
              <Table.Th>Shop / Owner</Table.Th>
              <Table.Th>Support Email</Table.Th>
              <Table.Th>Applied On</Table.Th>
              <Table.Th>KYC Review</Table.Th>
              <Table.Th />
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {vendors.length > 0 ? (
              vendors.map((v) => (
                <VendorRow 
                  key={v._id} 
                  vendor={v} 
                  onAction={handleAction} 
                  loadingId={loadingId} 
                />
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={5}>
                  <Stack align="center" py={60} gap="xs">
                    <Box bg="green.0" p="md" style={{ borderRadius: '50%' }}>
                      <Check size={32} color="green" />
                    </Box>
                    <Text fw={700} size="lg">Queue Clear!</Text>
                    <Text size="sm" c="dimmed">All vendor applications have been processed.</Text>
                  </Stack>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </Table.ScrollContainer>
    </Paper>
  )
}