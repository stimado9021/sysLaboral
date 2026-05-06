// app/accidente/layout.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import AccidenteShell from '@/components/AccidenteShell'

export default async function AccidenteLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return <AccidenteShell>{children}</AccidenteShell>
}
