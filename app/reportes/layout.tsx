// app/reportes/layout.tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { redirect } from 'next/navigation'
import ReportesShell from '@/components/ReportesShell'

export default async function ReportesLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  return <ReportesShell>{children}</ReportesShell>
}
