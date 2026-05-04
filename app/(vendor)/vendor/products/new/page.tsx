// // /app/(vendor)/vendor/products/new/page.tsx

// 'use client'

// import { useState, useEffect } from 'react'
// import {
//   TextInput,
//   NumberInput,
//   Textarea,
//   Button,
//   Paper,
//   Stack,
//   Title,
//   Grid,
//   Group,
//   Select,
//   TagsInput,
//   ActionIcon,
//   Text,
//   Divider,
//   Switch,
//   Card,
//   Badge,
//   Tooltip,
//   Alert,
// } from '@mantine/core'
// import { useForm } from '@mantine/form'
// import {
//   Plus,
//   Trash,
//   Check,
//   ArrowLeft,
//   Layers,
//   Image as ImageIcon,
//   Info,
//   Settings,
//   DollarSign,
//   Tag,
//   Search,
//   Clock,
//   ShieldAlert,
// } from 'lucide-react'
// import {
//   createProduct,
//   getCategoryOptions,
// } from '@/app/services/product-service'
// import { useSnackbar } from 'notistack'
// import { useRouter } from 'next/navigation'
// import Link from 'next/link'
// import { IVariant } from '@/app/types'

// // Local interface refined for the form
// interface ProductFormValues {
//   name: string
//   brand: string
//   description: string
//   shortDescription: string
//   basePrice: number
//   discountPrice: number
//   category: string
//   mainImage: string
//   gallery: string[]
//   stock: number
//   tags: string[]
//   isPublished: boolean
//   specifications: { label: string; value: string }[]
//   variants: {
//     sku: string
//     name: string
//     stock: number
//     price?: number
//     images: string[]
//     attributes: Record<string, string>
//   }[]
//   seo: {
//     title: string
//     description: string
//   }
// }

// export default function ProfessionalNewProductPage() {
//   const router = useRouter()
//   const { enqueueSnackbar } = useSnackbar()
//   const [loading, setLoading] = useState(false)
//   const [categoryOptions, setCategoryOptions] = useState<
//     { value: string; label: string }[]
//     >([])
//   const [userStatus, setUserStatus] = useState<{
//     isVerified: boolean
//     hasShopData: boolean
//     isAdmin: boolean
//     loading: boolean
//   }>({ isVerified: false, hasShopData: false, isAdmin: false, loading: true })

//   useEffect(() => {
//     const checkStatus = async () => {
//       const user = await getCurrentUser()
//       if (user) {
//         const profile = user.vendorProfile
//         setUserStatus({
//           isVerified: !!profile?.isVerified,
//           hasShopData: !!(
//             profile?.shopName && profile?.bankDetails?.accountNumber
//           ),
//           isAdmin: user.role === 'admin' || user.isSuperAdmin,
//           loading: false,
//         })
//       }
//     }
//     checkStatus()
//   }, [])

//   useEffect(() => {
//     const fetchOptions = async () => {
//       const options = await getCategoryOptions()
//       setCategoryOptions(options)
//     }
//     fetchOptions()
//   }, [])

//   const form = useForm<ProductFormValues>({
//     initialValues: {
//       name: '',
//       brand: '',
//       description: '',
//       shortDescription: '',
//       basePrice: 0,
//       discountPrice: 0,
//       category: '',
//       mainImage: '',
//       gallery: [],
//       stock: 0,
//       tags: [],
//       isPublished: true,
//       specifications: [],
//       variants: [],
//       seo: { title: '', description: '' },
//     },
//     validate: {
//       name: (v) => (v.length < 3 ? 'Name is too short' : null),
//       category: (v) => (!v ? 'Select a category' : null),
//       basePrice: (v) => (v <= 0 ? 'Price must be positive' : null),
//       mainImage: (v) => (!v ? 'Main image is required' : null),
//     },
//   })

//  const handleCreate = async (values: ProductFormValues) => {
//    setLoading(true)
//    try {
//      const res = await createProduct(values)

//      if (res.success) {
//        enqueueSnackbar('Product listed successfully!', { variant: 'success' })
//        router.push('/vendor/products')
//      } else {
//        // NEW: Handle administrative verification error
//       if (res.error === 'NOT_VERIFIED') {
//         enqueueSnackbar(res.message, {
//           variant: 'info',
//           action: () => <Clock size={18} style={{ marginRight: 8 }} />,
//         })
//       }
//       // Handle KYC error
//       else if (res.error === 'KYC_INCOMPLETE') {
//         enqueueSnackbar(res.message, {
//           variant: 'warning',
//           action: (key) => (
//             <Button
//               size="compact-xs"
//               color="white"
//               variant="outline"
//               onClick={() => router.push('/vendor/settings')}
//             >
//               Fix Now
//             </Button>
//           ),
//         })
//       } else {
//         enqueueSnackbar(res.error || 'Check form for errors', {
//           variant: 'error',
//         })
//       }
//      }
//    } catch (err) {
//      enqueueSnackbar('Internal Server Error', { variant: 'error' })
//    } finally {
//      setLoading(false)
//    }
//  }

  
//   return (
//     <Stack gap="xl" pb={100} className="max-w-7xl mx-auto px-4">
//       {/* Header Section */}
//       <Group justify="space-between" align="flex-start">
//         <Group>
//           <ActionIcon
//             component={Link}
//             href="/vendor/products"
//             variant="light"
//             radius="md"
//             size="xl"
//           >
//             <ArrowLeft size={20} />
//           </ActionIcon>
//           <div>
//             <Badge color="indigo" variant="filled" mb={4}>
//               VENDOR PORTAL
//             </Badge>
//             <Title order={2} fw={800}>
//               New Product Listing
//             </Title>
//             <Text size="sm" c="dimmed">
//               Complete the details below to list your item on the marketplace.
//             </Text>
//           </div>
//         </Group>
//         <Group>
//           <Button
//             variant="subtle"
//             color="gray"
//             component={Link}
//             href="/vendor/products"
//           >
//             Discard
//           </Button>
//           <Button
//             loading={loading}
//             // Disable if (Not Verified AND Not Admin)
//             disabled={
//               (!userStatus.isVerified && !userStatus.isAdmin) ||
//               userStatus.loading
//             }
//             onClick={() => form.onSubmit(handleCreate)()}
//             leftSection={
//               userStatus.isVerified || userStatus.isAdmin ? (
//                 <Check size={18} />
//               ) : (
//                 <Clock size={18} />
//               )
//             }
//             radius="md"
//             color="indigo.6"
//             size="md"
//           >
//             {userStatus.isVerified || userStatus.isAdmin
//               ? 'Submit Listing'
//               : 'Awaiting Verification'}
//           </Button>
//         </Group>
//       </Group>

//       {/* Dynamic Status Banner */}
//       {!userStatus.loading && !userStatus.isAdmin && (
//         <>
//           {/* Case 1: Missing Bank/Shop Info */}
//           {!userStatus.hasShopData && (
//             <Alert
//               icon={<Settings size={18} />}
//               title="Profile Incomplete"
//               color="amber"
//               mb="xl"
//             >
//               <Text size="sm">
//                 Your shop won&apos;t be able to list items until payout details
//                 are set.
//               </Text>
//               <Button
//                 variant="subtle"
//                 color="amber"
//                 size="compact-xs"
//                 mt="xs"
//                 component={Link}
//                 href="/vendor/settings"
//               >
//                 Complete Setup
//               </Button>
//             </Alert>
//           )}

//           {/* Case 2: Data exists but Admin hasn't verified yet */}
//           {userStatus.hasShopData && !userStatus.isVerified && (
//             <Alert
//               icon={<ShieldAlert size={18} />}
//               title="Verification Pending"
//               color="blue"
//               mb="xl"
//             >
//               <Text size="sm">
//                 Your profile is currently under review. Our team usually
//                 verifies accounts within 24-48 hours. You can draft your product
//                 now, but publishing is restricted.
//               </Text>
//             </Alert>
//           )}
//         </>
//       )}

//       <form>
//         <Grid gap="xl">
//           {/* Main Column */}
//           <Grid.Col span={{ base: 12, md: 8 }}>
//             <Stack gap="xl">
//               {/* 1. Basic Info */}
//               <Paper withBorder p="xl" radius="md">
//                 <Group mb="lg">
//                   <Info size={20} className="text-indigo-600" />
//                   <Title order={4}>General Details</Title>
//                 </Group>
//                 <Grid>
//                   <Grid.Col span={12}>
//                     <TextInput
//                       label="Product Title"
//                       placeholder="Official name of the product"
//                       {...form.getInputProps('name')}
//                       required
//                     />
//                   </Grid.Col>
//                   <Grid.Col span={{ base: 12, sm: 6 }}>
//                     <TextInput
//                       label="Brand / Manufacturer"
//                       placeholder="e.g. Samsung"
//                       {...form.getInputProps('brand')}
//                     />
//                   </Grid.Col>
//                   <Grid.Col span={{ base: 12, sm: 6 }}>
//                     <TextInput
//                       label="Short Catchphrase"
//                       placeholder="Appears in search results"
//                       {...form.getInputProps('shortDescription')}
//                     />
//                   </Grid.Col>
//                   <Grid.Col span={12}>
//                     <Textarea
//                       label="Full Description"
//                       minRows={5}
//                       placeholder="Tell customers why they should buy this..."
//                       {...form.getInputProps('description')}
//                       required
//                     />
//                   </Grid.Col>
//                 </Grid>
//               </Paper>

//               {/* 2. Media Section */}
//               <Paper withBorder p="xl" radius="md">
//                 <Group mb="lg">
//                   <ImageIcon size={20} className="text-indigo-600" />
//                   <Title order={4}>Product Media</Title>
//                 </Group>
//                 <TextInput
//                   label="Feature Image URL"
//                   description="The primary image seen by all customers"
//                   placeholder="https://..."
//                   {...form.getInputProps('mainImage')}
//                   required
//                   mb="md"
//                 />

//                 <Divider
//                   label="Additional Gallery Photos"
//                   labelPosition="center"
//                   my="xl"
//                 />

//                 <Stack gap="xs">
//                   {form.values.gallery.map((_, i) => (
//                     <Group key={i} align="flex-end">
//                       <TextInput
//                         placeholder="Image URL"
//                         flex={1}
//                         {...form.getInputProps(`gallery.${i}`)}
//                       />
//                       <ActionIcon
//                         color="red"
//                         variant="light"
//                         size="lg"
//                         onClick={() => form.removeListItem('gallery', i)}
//                       >
//                         <Trash size={16} />
//                       </ActionIcon>
//                     </Group>
//                   ))}
//                   <Button
//                     variant="light"
//                     size="xs"
//                     leftSection={<Plus size={14} />}
//                     onClick={() => form.insertListItem('gallery', '')}
//                     mt="sm"
//                   >
//                     Add Gallery Image
//                   </Button>
//                 </Stack>
//               </Paper>

//               {/* 3. Specifications */}
//               <Paper withBorder p="xl" radius="md">
//                 <Group mb="lg">
//                   <Settings size={20} className="text-indigo-600" />
//                   <Title order={4}>Technical Specifications</Title>
//                 </Group>
//                 <Stack gap="xs">
//                   {form.values.specifications.map((_, i) => (
//                     <Group key={i} grow>
//                       <TextInput
//                         placeholder="Label (e.g. Battery Life)"
//                         {...form.getInputProps(`specifications.${i}.label`)}
//                       />
//                       <TextInput
//                         placeholder="Value (e.g. 24 Hours)"
//                         {...form.getInputProps(`specifications.${i}.value`)}
//                       />
//                       <ActionIcon
//                         color="red"
//                         variant="subtle"
//                         onClick={() => form.removeListItem('specifications', i)}
//                         style={{ flex: 0 }}
//                       >
//                         <Trash size={16} />
//                       </ActionIcon>
//                     </Group>
//                   ))}
//                   <Button
//                     variant="outline"
//                     size="xs"
//                     onClick={() =>
//                       form.insertListItem('specifications', {
//                         label: '',
//                         value: '',
//                       })
//                     }
//                   >
//                     Add Specification Row
//                   </Button>
//                 </Stack>
//               </Paper>
//             </Stack>
//           </Grid.Col>

//           {/* Sidebar Column */}
//           <Grid.Col span={{ base: 12, md: 4 }}>
//             <Stack gap="xl">
//               {/* Pricing & Stock */}
//               <Paper withBorder p="xl" radius="md" shadow="sm">
//                 <Group mb="md">
//                   <DollarSign size={18} className="text-green-600" />
//                   <Title order={5}>Pricing & Stock</Title>
//                 </Group>
//                 <Stack gap="md">
//                   <NumberInput
//                     label="Retail Price"
//                     prefix="₦"
//                     thousandSeparator
//                     {...form.getInputProps('basePrice')}
//                   />
//                   <NumberInput
//                     label="Offer Price (Optional)"
//                     prefix="₦"
//                     thousandSeparator
//                     {...form.getInputProps('discountPrice')}
//                   />
//                   <NumberInput
//                     label="Warehouse Stock"
//                     description="Global count if no variants exist"
//                     {...form.getInputProps('stock')}
//                   />
//                   <Divider my="xs" />
//                   <Switch
//                     label="Active Listing"
//                     description="Display on store after approval"
//                     {...form.getInputProps('isPublished', { type: 'checkbox' })}
//                   />
//                 </Stack>
//               </Paper>

//               {/* Classification */}
//               <Paper withBorder p="xl" radius="md">
//                 <Group mb="md">
//                   <Tag size={18} className="text-indigo-600" />
//                   <Title order={5}>Organization</Title>
//                 </Group>
//                 <Stack gap="md">
//                   <Select
//                     label="Category"
//                     placeholder="Select one"
//                     data={categoryOptions}
//                     {...form.getInputProps('category')}
//                     required
//                     searchable
//                     clearable
//                   />
//                   <TagsInput
//                     label="Search Keywords"
//                     placeholder="Press enter to add"
//                     {...form.getInputProps('tags')}
//                   />
//                 </Stack>
//               </Paper>

//               {/* SEO Content */}
//               <Paper withBorder p="xl" radius="md">
//                 <Group mb="md">
//                   <Search size={18} className="text-blue-600" />
//                   <Title order={5}>Search Optimization</Title>
//                 </Group>
//                 <Stack gap="xs">
//                   <TextInput
//                     label="Meta Title"
//                     placeholder="Browser tab title"
//                     {...form.getInputProps('seo.title')}
//                   />
//                   <Textarea
//                     label="Meta Description"
//                     placeholder="Search engine snippet"
//                     {...form.getInputProps('seo.description')}
//                   />
//                 </Stack>
//               </Paper>
//             </Stack>
//           </Grid.Col>
//         </Grid>
//       </form>
//     </Stack>
//   )
// }





// /app/(vendor)/vendor/products/new/page.tsx
import ProductForm from '@/app/(vendor)/vendor/products/new/ProductForm'
import { getCategoryOptions } from '@/app/services/product-service'
import { getCurrentUser } from '@/app/services/auth-service'

export default async function NewProductPage() {
  // Fetch data directly on the server
  const [user, categoryOptions] = await Promise.all([
    getCurrentUser(),
    getCategoryOptions()
  ])

  const profile = user?.vendorProfile
  
  const userStatus = {
    isVerified: !!profile?.isVerified,
    hasShopData: !!(profile?.shopName && profile?.bankDetails?.accountNumber),
    isAdmin: user?.role === 'admin' || user?.isSuperAdmin === true,
  }

  return (
    <ProductForm 
      categoryOptions={categoryOptions} 
      userStatus={userStatus} 
    />
  )
}