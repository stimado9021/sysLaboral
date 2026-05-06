// app/configuracion/layout.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ConfiguracionShell from '@/components/ConfiguracionShell'

export default async function ConfiguracionLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  const rol = (session.user as { role?: string })?.role
  if (rol !== 'admin') redirect('/dashboard')

  return <ConfiguracionShell>{children}</ConfiguracionShell>
}
