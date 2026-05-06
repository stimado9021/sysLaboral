// app/acciones/layout.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AccionesShell from '@/components/AccionesShell'

export default async function AccionesLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return <AccionesShell>{children}</AccionesShell>
}
