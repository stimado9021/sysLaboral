// app/trabajadores/layout.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import TrabajadoresShell from '@/components/TrabajadoresShell'

export default async function TrabajadoresLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return <TrabajadoresShell>{children}</TrabajadoresShell>
}
