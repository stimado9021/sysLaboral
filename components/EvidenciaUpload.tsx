'use client'
// components/EvidenciaUpload.tsx
// Componente para subir y visualizar evidencias fotográficas y documentos
// Convierte archivos a base64 y los guarda vía API (no requiere storage externo)

import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { LucideFile, LucideImage, LucideVideo, LucidePaperclip, LucideX, LucideUploadCloud, LucideDownload } from 'lucide-react'

interface Evidencia {
  id: number
  nombre_archivo: string
  url: string
  tipo_mime: string
  tamaño_bytes: number
  tipo: 'foto' | 'documento' | 'video' | 'otro'
  descripcion: string | null
  subido_por_nombre: string | null
  created_at: string
}

interface Props {
  accidenteId: number
  readOnly?: boolean
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function tipoDeArchivo(mime: string): 'foto' | 'documento' | 'video' | 'otro' {
  if (mime.startsWith('image/')) return 'foto'
  if (mime.startsWith('video/')) return 'video'
  if (mime.includes('pdf') || mime.includes('word') || mime.includes('sheet') || mime.includes('text')) return 'documento'
  return 'otro'
}

const ICONOS = {
  foto: <LucideImage size={24} />,
  documento: <LucideFile size={24} />,
  video: <LucideVideo size={24} />,
  otro: <LucidePaperclip size={24} />,
}

export default function EvidenciaUpload({ accidenteId, readOnly = false }: Props) {
  const [preview, setPreview]         = useState<Evidencia | null>(null)
  const [arrastrando, setArrastrando] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const queryClient = useQueryClient()

  const { data: evidenciasResult, isLoading } = useQuery({
    queryKey: ['evidencias', accidenteId],
    queryFn: async () => {
      const res = await fetch(`/api/evidencias?accidente_id=${accidenteId}`)
      if (!res.ok) throw new Error('Error al cargar evidencias')
      return res.json()
    }
  })
  const evidencias = (evidenciasResult?.data || []) as Evidencia[]

  const uploadMutation = useMutation({
    mutationFn: async (archivo: File) => {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(archivo)
      })

      const res = await fetch('/api/evidencias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accidente_id: accidenteId,
          nombre_archivo: archivo.name,
          url: base64,
          tipo_mime: archivo.type,
          tamaño_bytes: archivo.size,
          tipo: tipoDeArchivo(archivo.type),
        }),
      })

      if (!res.ok) throw new Error(`Error al subir ${archivo.name}`)
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evidencias', accidenteId] })
      toast.success('Evidencia subida correctamente')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    }
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/evidencias?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Error al eliminar evidencia')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evidencias', accidenteId] })
      toast.success('Evidencia eliminada')
    },
    onError: () => {
      toast.error('No se pudo eliminar la evidencia')
    }
  })

  async function procesarArchivos(archivos: FileList | null) {
    if (!archivos || archivos.length === 0) return
    const fileArray = Array.from(archivos)
    
    for (const file of fileArray) {
      if (file.size > 10 * 1024 * 1024) {
        toast.warning(`"${file.name}" supera el límite de 10 MB`)
        continue
      }
      uploadMutation.mutate(file)
    }

    if (inputRef.current) inputRef.current.value = ''
  }

  const subiendo = uploadMutation.isPending

  // Drag & Drop handlers
  const onDragOver = (e: React.DragEvent) => { e.preventDefault(); setArrastrando(true) }
  const onDragLeave = () => setArrastrando(false)
  const onDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setArrastrando(false)
    procesarArchivos(e.dataTransfer.files)
  }

  return (
    <div>
      {/* Header de la sección */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '14px',
      }}>
        <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--red)', letterSpacing: '1px', textTransform: 'uppercase', opacity: 0.8 }}>
          // EVIDENCIAS Y DOCUMENTOS
        </div>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--muted)' }}>
          {evidencias.length} archivo{evidencias.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Zona de drop (solo si no es readOnly) */}
      {!readOnly && (
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          className={`card animate-fade-up ${arrastrando ? 'border-[var(--red)] bg-[rgba(230,57,70,0.05)]' : ''}`}
          style={{
            borderStyle: 'dashed',
            padding: '40px 20px',
            textAlign: 'center',
            cursor: 'pointer',
            transition: 'all 0.3s ease',
            marginBottom: '16px',
            borderColor: arrastrando ? 'var(--red)' : 'var(--border)',
          }}
        >
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
            style={{ display: 'none' }}
            onChange={e => procesarArchivos(e.target.files)}
            id="evidencia-file-input"
          />
          <div className="flex justify-center mb-4 text-[var(--muted)]">
            {subiendo ? (
              <div className="animate-spin text-[var(--red)]">⟳</div>
            ) : (
              <LucideUploadCloud size={40} className={arrastrando ? 'text-[var(--red)]' : ''} />
            )}
          </div>
          <div className="font-mono text-[12px] text-[var(--muted)] leading-relaxed">
            {subiendo
              ? 'Procesando archivos...'
              : <>
                  Arrastra archivos aquí o <span className="text-[var(--red)] font-bold">haz clic</span> para seleccionar<br />
                  <span className="text-[9px] opacity-60">
                    Fotos, videos, PDF, Word, Excel — máx. 10 MB por archivo
                  </span>
                </>
            }
          </div>
        </div>
      )}

      {/* Galería de evidencias */}
      {evidencias.length === 0 ? (
        <div style={{
          textAlign: 'center', padding: '20px',
          fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--border)',
        }}>
          Sin evidencias adjuntas
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '10px',
        }}>
          {evidencias.map(ev => (
            <div
              key={ev.id}
              style={{
                border: '1px solid var(--border)',
                background: 'var(--bg)',
                overflow: 'hidden',
                position: 'relative',
                cursor: 'pointer',
                transition: 'border-color 0.15s',
              }}
              onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--red)')}
              onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--border)')}
            >
              {/* Thumbnail */}
              <div
                onClick={() => setPreview(ev)}
                style={{
                  height: '110px',
                  background: 'var(--dim)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  position: 'relative',
                }}
              >
                {ev.tipo === 'foto' && ev.url.startsWith('data:image') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={ev.url}
                    alt={ev.nombre_archivo}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <span style={{ fontSize: '36px' }}>{ICONOS[ev.tipo] || '📎'}</span>
                )}
              </div>

              {/* Metadatos */}
              <div style={{ padding: '8px 10px' }}>
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: '9px',
                  color: 'var(--text)', whiteSpace: 'nowrap',
                  overflow: 'hidden', textOverflow: 'ellipsis',
                  marginBottom: '2px',
                }}>
                  {ev.nombre_archivo}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '8px', color: 'var(--muted)' }}>
                  {formatBytes(ev.tamaño_bytes)} · {new Date(ev.created_at).toLocaleDateString('es-CO')}
                </div>
              </div>

              {/* Botón eliminar */}
              {!readOnly && (
                <button
                  onClick={e => { e.stopPropagation(); if (confirm('¿Eliminar evidencia?')) deleteMutation.mutate(ev.id) }}
                  title="Eliminar evidencia"
                  className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-[var(--red)] opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/90"
                >
                  <LucideX size={14} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal de preview */}
      {preview && (
        <div
          onClick={() => setPreview(null)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000, padding: '20px',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--panel)', border: '1px solid var(--border)',
              maxWidth: '860px', width: '100%', maxHeight: '90vh',
              overflow: 'auto', position: 'relative',
            }}
          >
            {/* Header del modal */}
            <div style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 16px', borderBottom: '1px solid var(--border)',
              background: 'var(--dim)',
            }}>
              <div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text)', fontWeight: 700 }}>
                  {ICONOS[preview.tipo]} {preview.nombre_archivo}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: '9px', color: 'var(--muted)', marginTop: '2px' }}>
                  {formatBytes(preview.tamaño_bytes)} · {preview.tipo_mime}
                  {preview.subido_por_nombre && ` · Por: ${preview.subido_por_nombre}`}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <a
                  href={preview.url}
                  download={preview.nombre_archivo}
                  className="btn btn-secondary !py-1.5 !px-4 !text-[11px]"
                  onClick={e => e.stopPropagation()}
                >
                  <LucideDownload size={14} /> Descargar
                </a>
                <button
                  onClick={() => setPreview(null)}
                  className="btn btn-secondary !py-1.5 !px-4 !text-[11px]"
                >
                  <LucideX size={14} /> Cerrar
                </button>
              </div>
            </div>

            {/* Contenido del preview */}
            <div style={{ padding: '20px', textAlign: 'center' }}>
              {preview.tipo === 'foto' && preview.url.startsWith('data:image') ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={preview.url}
                  alt={preview.nombre_archivo}
                  style={{ maxWidth: '100%', maxHeight: '65vh', objectFit: 'contain' }}
                />
              ) : preview.tipo === 'video' && preview.url.startsWith('data:video') ? (
                <video controls style={{ maxWidth: '100%', maxHeight: '65vh' }}>
                  <source src={preview.url} type={preview.tipo_mime} />
                </video>
              ) : (
                <div style={{
                  padding: '40px', fontFamily: 'var(--font-mono)',
                  fontSize: '11px', color: 'var(--muted)',
                }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>{ICONOS[preview.tipo]}</div>
                  <div>Vista previa no disponible para este tipo de archivo.</div>
                  <a
                    href={preview.url}
                    download={preview.nombre_archivo}
                    style={{
                      color: 'var(--red)', textDecoration: 'none',
                      display: 'inline-block', marginTop: '12px',
                      border: '1px solid var(--red)40', padding: '8px 20px',
                    }}
                  >
                    ↓ Descargar para ver
                  </a>
                </div>
              )}
              {preview.descripcion && (
                <div style={{
                  fontFamily: 'var(--font-mono)', fontSize: '11px',
                  color: 'var(--muted)', marginTop: '12px',
                  padding: '8px 16px', background: 'var(--dim)',
                }}>
                  {preview.descripcion}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
