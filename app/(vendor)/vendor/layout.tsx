// /app/(vendor)/vendor/layout.tsx

import { getCurrentUser } from '@/app/services/auth-service';
import { redirect } from 'next/navigation';
import VendorShell from '@/app/components/vendor/VendorShell';
import { IUser, Serialized } from '@/app/types';

export default async function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = (await getCurrentUser()) as IUser | null;

  // Strict role check: Only vendors (and admins for oversight) allowed
  if (!user || !['vendor', 'admin'].includes(user.role)) {
    redirect('/auth/login');
  }

  // Serialize Mongoose data for Client Components
  const serializedUser = JSON.parse(JSON.stringify(user)) as Serialized<IUser>;

  return <VendorShell user={serializedUser}>{children}</VendorShell>;
}
