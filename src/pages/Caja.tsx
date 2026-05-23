import { useEffect, useState } from 'react'
import { Lock, Unlock, Plus, Trash2, Clock, Users } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { fmt, hoy, getErrorMsg } from '../lib/utils'
import { format } from 'date-fns'
import type { Caja, Atencion, ServicioCatalogo } from '../types'

export default function CajaPage() {
  const [caja, setCaja]         = useState<Caja | null>(null)
  const [atenciones, setAt]     = useState<Atencion[]>([])
  const [catalogo, setCatalogo] = useState<ServicioCatalogo[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [showForm, setShowForm] = useState(false)

  // Form nueva atención
  const [servicioId, setServicioId]   = useState('')
  const [servNombre, setServNombre]   = useState('')
  const [servPrecio, setServPrecio]   = useState('')
  const [servNotas, setServNotas]     = useState('')
  const [submitting, setSubmitting]   = useState(false)

  const today = hoy()

  useEffect(() => { init() }, [])

  async function init() {
    setLoading(true)
    try {
      const [catRes, cajaRes, atRes] = await Promise.all([
        supabase.from('servicios_catalogo').select('*').eq('activo', true).order('nombre'),
        supabase.from('cajas').select('*').eq('fecha', today).maybeSingle(),
        supabase.from('atenciones').select('*').eq('fecha', today).order('created_at', { ascending: false }),
      ])
      setCatalogo(catRes.data || [])
      setCaja(cajaRes.data)
      setAt(atRes.data || [])
    } catch (e) {
      setError(getErrorMsg(e))
    } finally {
      setLoading(false)
    }
  }

  async function abrirCaja() {
    const { data, error: e } = await supabase.from('cajas').insert({
      fecha:          today,
      hora_apertura:  format(new Date(), 'HH:mm:ss'),
      monto_inicial:  0,
      estado:         'abierta',
    }).select().single()
    if (e) { setError(e.message); return }
    setCaja(data)
  }

  async function cerrarCaja() {
    if (!caja || !confirm('¿Cerrar la caja del día? Podrás reabrirla si fue un error.')) return
    const { data, error: e } = await supabase.from('cajas')
      .update({ estado: 'cerrada', hora_cierre: format(new Date(), 'HH:mm:ss') })
      .eq('id', caja.id).select().single()
    if (e) { setError(e.message); return }
    setCaja(data)
  }

  async function reabrirCaja() {
    if (!caja || caja.estado !== 'cerrada') return
    if (!confirm('¿Reabrir la caja cerrada? Esto permitirá seguir agregando servicios hoy.')) return
    const { data, error: e } = await supabase.from('cajas')
      .update({ estado: 'abierta', hora_cierre: null })
      .eq('id', caja.id).select().single()
    if (e) { setError(e.message); return }
    setCaja(data)
  }

  function handleServicioChange(id: string) {
    setServicioId(id)
    const srv = catalogo.find(c => c.id === id)
    if (srv) { setServNombre(srv.nombre); setServPrecio(String(srv.precio)) }
    else { setServNombre(''); setServPrecio('') }
  }

  async function registrarAtencion() {
    if (!servNombre.trim() || !servPrecio) return
    setSubmitting(true)
    const { data, error: e } = await supabase.from('atenciones').insert({
      fecha:           today,
      servicio_nombre: servNombre.trim(),
      precio:          Number(servPrecio),
      notas:           servNotas.trim() || null,
    }).select().single()
    if (e) { setError(e.message); setSubmitting(false); return }
    setAt(prev => [data, ...prev])
    setServicioId(''); setServNombre(''); setServPrecio(''); setServNotas('')
    setShowForm(false)
    setSubmitting(false)
  }

  async function eliminarAtencion(id: string) {
    if (!confirm('¿Eliminar este servicio?')) return
    await supabase.from('atenciones').delete().eq('id', id)
    setAt(prev => prev.filter(a => a.id !== id))
  }

  const totalHoy = atenciones.reduce((s, a) => s + a.precio, 0)

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-ink-300 font-mono text-sm animate-pulse">
      Cargando caja...
    </div>
  )

  return (
    <div className="space-y-5 w-full max-w-3xl mx-auto">
      <div>
        <h1 className="font-display text-3xl text-ink-50">Caja del Día</h1>
        <p className="text-ink-300 text-sm font-mono">{fmt.fecha(today)}</p>
      </div>

      {error && (
        <div className="text-red-400 text-sm bg-red-900/20 border border-red-900/40 rounded-lg px-4 py-2">
          {error}
        </div>
      )}

      {/* Estado de caja */}
      <div className="card-gold">
        {!caja ? (
          <div className="text-center py-6">
            <Lock size={32} className="text-ink-300 mx-auto mb-3" />
            <p className="text-ink-200 font-body mb-4">La caja no ha sido abierta hoy</p>
            <button onClick={abrirCaja} className="btn-primary">
              <Unlock size={14} className="inline mr-2" /> Abrir caja
            </button>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-900/40 border border-emerald-700/50 flex items-center justify-center">
                {caja.estado === 'abierta'
                  ? <Unlock size={18} className="text-emerald-400" />
                  : <Lock   size={18} className="text-red-400" />}
              </div>
              <div>
                <p className="font-body text-ink-50">
                  Caja{' '}
                  <span className={caja.estado === 'abierta' ? 'text-emerald-400' : 'text-red-400'}>
                    {caja.estado}
                  </span>
                </p>
                {caja.hora_apertura && (
                  <p className="text-xs text-ink-300 font-mono flex items-center gap-1">
                    <Clock size={11} /> Apertura: {caja.hora_apertura.slice(0, 5)}
                    {caja.hora_cierre ? ` — Cierre: ${caja.hora_cierre.slice(0, 5)}` : ''}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="stat-label">Total del día</p>
                <p className="font-mono text-xl text-gold-400">{fmt.guarani(totalHoy)}</p>
              </div>
              {caja.estado === 'abierta' ? (
                <button onClick={cerrarCaja} className="btn-danger">
                  <Lock size={14} className="inline mr-1" /> Cerrar
                </button>
              ) : (
                <button onClick={reabrirCaja} className="btn-primary">
                  <Unlock size={14} className="inline mr-1" /> Reabrir
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Resumen rápido */}
      {caja && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="card text-center">
            <Users size={16} className="text-gold-400 mx-auto mb-1" />
            <p className="font-mono text-xl text-gold-400">{atenciones.length}</p>
            <p className="stat-label">Clientes</p>
          </div>
          <div className="card text-center">
            <p className="font-mono text-xl text-gold-400">{fmt.guarani(totalHoy)}</p>
            <p className="stat-label">Ingresos</p>
          </div>
          <div className="card text-center">
            <p className="font-mono text-xl text-ink-200">
              {atenciones.length > 0 ? fmt.guarani(Math.round(totalHoy / atenciones.length)) : '—'}
            </p>
            <p className="stat-label">Promedio/cliente</p>
          </div>
        </div>
      )}

      {/* Lista de atenciones */}
      {caja && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-body text-ink-100">Servicios del día</h3>
            {caja.estado === 'abierta' && (
              <button onClick={() => setShowForm(v => !v)} className="btn-primary">
                <Plus size={14} className="inline mr-1" /> Agregar
              </button>
            )}
          </div>

          {/* Formulario rápido */}
          {showForm && caja.estado === 'abierta' && (
            <div className="bg-surface-100 border border-surface-50 rounded-lg p-4 mb-4 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Servicio (catálogo)</label>
                  <select value={servicioId} onChange={e => handleServicioChange(e.target.value)} className="w-full">
                    <option value="">— Seleccionar —</option>
                    {catalogo.map(c => (
                      <option key={c.id} value={c.id}>{c.nombre} — {fmt.guarani(c.precio)}</option>
                    ))}
                    <option value="custom">Personalizado</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Nombre del servicio</label>
                  <input
                    value={servNombre}
                    onChange={e => setServNombre(e.target.value)}
                    placeholder="Ej: Corte de cabello"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="input-label">Precio (Gs.)</label>
                  <input
                    type="number"
                    value={servPrecio}
                    onChange={e => setServPrecio(e.target.value)}
                    placeholder="0"
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="input-label">Notas (opcional)</label>
                  <input
                    value={servNotas}
                    onChange={e => setServNotas(e.target.value)}
                    placeholder="Observaciones..."
                    className="w-full"
                  />
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <button onClick={() => setShowForm(false)} className="btn-ghost">Cancelar</button>
                <button onClick={registrarAtencion} disabled={submitting || !servNombre || !servPrecio} className="btn-primary">
                  {submitting ? 'Guardando...' : 'Registrar servicio'}
                </button>
              </div>
            </div>
          )}

          {/* Lista */}
          {atenciones.length === 0 ? (
            <p className="text-center text-ink-300 text-sm py-8 font-mono">
              Sin servicios registrados hoy
            </p>
          ) : (
            <div className="space-y-2">
              {atenciones.map(a => (
                <div key={a.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-surface-100 border border-surface-50 group">
                  <div>
                    <p className="font-body text-ink-100 text-sm">{a.servicio_nombre}</p>
                    {a.notas && <p className="text-xs text-ink-300">{a.notas}</p>}
                    <p className="text-xs text-ink-400 font-mono">{fmt.hora(a.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-gold-400">{fmt.guarani(a.precio)}</span>
                    {caja.estado === 'abierta' && (
                      <button onClick={() => eliminarAtencion(a.id)}
                        className="opacity-0 group-hover:opacity-100 text-red-400/60 hover:text-red-400 transition-all">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
