// app/usuarios/layout.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import UsuariosShell from '@/components/UsuariosShell'

export default async function UsuariosLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')
  const rol = (session.user as { role?: string })?.role
  if (rol !== 'admin') redirect('/dashboard')

  return <UsuariosShell>{children}</UsuariosShell>
}
