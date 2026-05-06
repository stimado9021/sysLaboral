'use client'
// app/login/page.tsx
import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const res = await signIn('credentials', {
      email, password,
      redirect: false,
    })

    if (res?.ok) {
      router.push('/dashboard')
    } else {
      setError('Credenciales incorrectas. Verifica tu email y contraseña.')
      setLoading(false)
    }
  }

  return (
    <div className="bg-grid" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
    }}>
      <div className="animate-fade-up" style={{ width: '100%', maxWidth: '400px' }}>

        {/* Logo / Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px', height: '56px',
            background: 'var(--red)',
            fontSize: '26px',
            marginBottom: '16px',
          }}>⚠</div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '4px' }}>
            {process.env.NEXT_PUBLIC_APP_NAME || 'Sistema SST'}
          </h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)', letterSpacing: '1px' }}>
            SEGURIDAD Y SALUD EN EL TRABAJO
          </p>
        </div>

        {/* Formulario */}
        <div className="card" style={{ borderTop: '2px solid var(--red)' }}>
          <div className="card-title" style={{ marginBottom: '20px' }}>// Iniciar sesión</div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label className="form-label">Email</label>
              <input
                className="input-base"
                type="email"
                placeholder="usuario@empresa.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label className="form-label">Contraseña</label>
              <input
                className="input-base"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            {error && (
              <div style={{
                background: 'rgba(230,57,70,0.1)',
                border: '1px solid var(--red)',
                color: 'var(--red)',
                fontFamily: 'var(--font-mono)',
                fontSize: '11px',
                padding: '10px 14px',
                marginBottom: '16px',
              }}>
                ⚠ {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
              disabled={loading}
            >
              {loading ? '⟳ Verificando...' : '→ Ingresar al sistema'}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p style={{
          textAlign: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: '9px',
          color: 'var(--muted)',
          marginTop: '20px',
          letterSpacing: '0.5px',
        }}>
          {process.env.NEXT_PUBLIC_EMPRESA || 'Sistema SST'} · Acceso restringido
        </p>

      </div>
    </div>
  )
}
