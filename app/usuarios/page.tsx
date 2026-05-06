'use client'
// app/usuarios/page.tsx
import { useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

interface Usuario {
  id: number
  nombre: string
  email: string
  rol: string
  activo: boolean
  created_at: string
}

const ROLES = [
  { value: 'admin',      label: 'Administrador', color: 'var(--red)',    desc: 'Acceso total al sistema' },
  { value: 'hsse',       label: 'HSSE / SST',    color: 'var(--orange)', desc: 'Crear y gestionar reportes' },
  { value: 'supervisor', label: 'Supervisor',    color: 'var(--yellow)', desc: 'Reportar accidentes de su área' },
  { value: 'gerente',    label: 'Gerente',       color: 'var(--blue)',   desc: 'Solo lectura + dashboard' },
  { value: 'auditor',    label: 'Auditor',       color: 'var(--purple)', desc: 'Solo lectura + exportar' },
]

const ROL_COLOR: Record<string, string> = Object.fromEntries(ROLES.map(r => [r.value, r.color]))
const VACIO = { nombre: '', email: '', password: '', rol: 'hsse' }

const QUERY_KEY = ['usuarios']

function fetchUsuarios() {
  return fetch('/api/usuarios').then(res => res.json())
}

export default function UsuariosPage() {
  const queryClient = useQueryClient()
  const { data: usuarios = [] as Usuario[], isLoading } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: fetchUsuarios,
    select: (res: { data: Usuario[] }) => res.data,
  })

  const [modal, setModal] = useState(false)
  const [editando, setEditando] = useState<Usuario | null>(null)
  const [form, setForm] = useState(VACIO)
  const [mensaje, setMensaje] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const crearMut = useMutation({
    mutationFn: (data: typeof form) => fetch('/api/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
      setModal(false)
      setMensaje({ type: 'success', text: 'Usuario creado correctamente' })
      setTimeout(() => setMensaje(null), 3000)
    },
    onError: (err) => {
      setMensaje({ type: 'error', text: err instanceof Error ? err.message : 'Error al crear' })
    },
  })

  const editarMut = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<typeof form> }) => fetch(`/api/usuarios/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }).then(res => res.json()),
    onMutate: async ({ id, data }) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY })
      const prev = queryClient.getQueryData<Usuario[]>(QUERY_KEY)
      
      queryClient.setQueryData<Usuario[]>(QUERY_KEY, (old) =>
        old?.map(u => u.id === id ? { ...u, ...data } : u)
      )
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(QUERY_KEY, ctx?.prev)
      setMensaje({ type: 'error', text: 'Error al actualizar' })
    },
    onSuccess: () => {
      setModal(false)
      setMensaje({ type: 'success', text: 'Usuario actualizado correctamente' })
      setTimeout(() => setMensaje(null), 3000)
    },
  })

  const toggleMut = useMutation({
    mutationFn: (u: Usuario) => fetch(`/api/usuarios/${u.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ activo: !u.activo }),
    }).then(res => res.json()),
    onMutate: async (u) => {
      await queryClient.cancelQueries({ queryKey: QUERY_KEY })
      const prev = queryClient.getQueryData<Usuario[]>(QUERY_KEY)
      
      queryClient.setQueryData<Usuario[]>(QUERY_KEY, (old) =>
        old?.map(x => x.id === u.id ? { ...x, activo: !x.activo } : x)
      )
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      queryClient.setQueryData(QUERY_KEY, ctx?.prev)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY })
    },
  })

  const abrirNuevo = () => {
    setEditando(null)
    setForm(VACIO)
    setMensaje(null)
    setModal(true)
  }

  const abrirEditar = (u: Usuario) => {
    setEditando(u)
    setForm({ nombre: u.nombre, email: u.email, password: '', rol: u.rol })
    setMensaje(null)
    setModal(true)
  }

  const guardar = () => {
    if (editando) {
      const body: Partial<typeof form> = { nombre: form.nombre, rol: form.rol }
      if (form.password) body.password = form.password
      editarMut.mutate({ id: editando.id, data: body })
    } else {
      crearMut.mutate(form)
    }
  }

  const toggleActivo = (u: Usuario) => {
    toggleMut.mutate(u)
  }

  const isPending = crearMut.isPending || editarMut.isPending || toggleMut.isPending

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '28px' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--red)', letterSpacing: '2px', marginBottom: '6px' }}>
            // ADMIN · USUARIOS
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '4px' }}>Gestión de Usuarios</h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--muted)' }}>
            {usuarios.filter(u => u.activo).length} usuarios activos
          </p>
        </div>
        <button onClick={abrirNuevo} className="btn btn-primary">+ Nuevo Usuario</button>
      </div>

      {mensaje && (
        <div style={{
          background: mensaje.type === 'success' ? 'rgba(42,157,143,0.12)' : 'rgba(230,57,70,0.1)',
          border: `1px solid var(--${mensaje.type === 'success' ? 'green' : 'red'})`,
          color: mensaje.type === 'success' ? 'var(--green)' : 'var(--red)',
          fontFamily: 'var(--font-mono)', fontSize: '11px',
          padding: '10px 16px', marginBottom: '16px',
        }}>
          {mensaje.type === 'success' ? '✓' : '⚠'} {mensaje.text}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '3px', marginBottom: '20px' }}>
        {ROLES.map(r => (
          <div key={r.value} className="panel-dark" style={{
            background: 'var(--panel)', border: '1px solid var(--border)',
            borderTop: `2px solid ${r.color}`, padding: '10px 12px',
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: r.color, fontWeight: 700, marginBottom: '3px' }}>
              {r.label}
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--muted)', lineHeight: 1.4 }}>{r.desc}</div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: r.color, marginTop: '6px' }}>
              {usuarios.filter(u => u.rol === r.value && u.activo).length}
            </div>
          </div>
        ))}
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '60px', fontFamily: 'var(--font-mono)', color: 'var(--muted)' }}>⟳ Cargando...</div>
      ) : (
        <div className="panel-dark" style={{ border: '1px solid var(--border)', background: 'var(--panel)' }}>
           <div style={{
             display: 'grid', gridTemplateColumns: '1fr 220px 120px 80px 120px',
             padding: '12px 16px', background: 'var(--bg-secondary)',
             fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-secondary)',
             letterSpacing: '1px', textTransform: 'uppercase',
             borderBottom: '1px solid var(--border)'
           }}>
            <span>Usuario</span><span>Email</span><span>Rol</span><span>Estado</span><span>Acciones</span>
          </div>

          {usuarios.map((u, idx) => (
            <div key={u.id} style={{
              display: 'grid', gridTemplateColumns: '1fr 220px 120px 80px 120px',
              padding: '12px 16px', borderTop: idx === 0 ? 'none' : '1px solid var(--border)',
              alignItems: 'center', opacity: u.activo ? 1 : 0.5,
            }}>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600 }}>{u.nombre}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--muted)', marginTop: '2px' }}>
                  Creado: {new Date(u.created_at).toLocaleDateString('es-CO')}
                </div>
              </div>

               <span style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--text-secondary)' }}>{u.email}</span>

               <span style={{
                 fontFamily: 'var(--font-mono)', fontSize: '11px',
                 color: ROL_COLOR[u.rol] || 'var(--text-secondary)',
                 border: `1px solid ${ROL_COLOR[u.rol]}40`,
                 padding: '5px 10px', borderRadius: '6px', textTransform: 'uppercase', letterSpacing: '0.5px',
                 display: 'inline-block',
               }}>
                 {u.rol}
               </span>

               <span style={{
                 fontFamily: 'var(--font-mono)', fontSize: '11px',
                 color: u.activo ? 'var(--success)' : 'var(--text-secondary)',
               }}>
                 {u.activo ? '● Activo' : '○ Inactivo'}
               </span>

               <div style={{ display: 'flex', gap: '6px' }}>
                 <button
                   onClick={() => abrirEditar(u)}
                   disabled={isPending}
                   style={{
                     padding: '5px 10px', background: 'transparent',
                     border: '1px solid var(--border)', color: 'var(--muted)',
                     fontFamily: 'var(--font-mono)', fontSize: '9px', cursor: 'pointer',
                   }}
                 >
                   Editar
                 </button>
                 <button
                   onClick={() => toggleActivo(u)}
                   disabled={isPending}
                   style={{
                     padding: '5px 10px', background: 'transparent',
                     border: `1px solid ${u.activo ? 'var(--red)' : 'var(--green)'}40`,
                     color: u.activo ? 'var(--red)' : 'var(--green)',
                     fontFamily: 'var(--font-mono)', fontSize: '9px', cursor: 'pointer',
                   }}
                 >
                   {u.activo ? 'Desactivar' : 'Activar'}
                 </button>
               </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 200, padding: '20px',
        }}>
          <div className="panel-dark" style={{
            background: 'var(--panel)', border: '1px solid var(--border)',
            borderTop: '2px solid var(--red)',
            width: '100%', maxWidth: '480px',
            padding: '28px',
          }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--red)', letterSpacing: '2px', marginBottom: '16px' }}>
              // {editando ? 'EDITAR USUARIO' : 'NUEVO USUARIO'}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label className="form-label">Nombre completo *</label>
                <input className="input-base" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Apellidos y nombres" />
              </div>

              {!editando && (
                <div>
                  <label className="form-label">Email *</label>
                  <input className="input-base" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="usuario@empresa.com" />
                </div>
              )}

              <div>
                <label className="form-label">{editando ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}</label>
                <input className="input-base" type="password" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} placeholder="Mínimo 8 caracteres" />
              </div>

              <div>
                <label className="form-label">Rol *</label>
                <select className="input-base" value={form.rol} onChange={e => setForm({ ...form, rol: e.target.value })}>
                  {ROLES.map(r => (
                    <option key={r.value} value={r.value}>{r.label} — {r.desc}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
                <button onClick={() => setModal(false)} className="btn btn-secondary">Cancelar</button>
                <button onClick={guardar} disabled={isPending} className="btn btn-primary" style={{ minWidth: '120px', justifyContent: 'center' }}>
                  {isPending ? '⟳ Guardando...' : editando ? 'Guardar cambios' : 'Crear usuario'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}