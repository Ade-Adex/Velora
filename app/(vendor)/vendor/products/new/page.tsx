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