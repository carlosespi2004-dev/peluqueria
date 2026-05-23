import { useEffect, useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { fmt, hoy, CATEGORIAS_GASTO, getErrorMsg, rangos } from '../lib/utils'
import type { Gasto, CategoriaGasto } from '../types'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'

const CATEGORIAS = Object.entries(CATEGORIAS_GASTO) as Array<[CategoriaGasto, { label: string; color: string }]>

export default function GastosPage() {
  const [gastos, setGastos]   = useState<Gasto[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [showForm, setShowForm] = useState(false)

  const [fecha, setFecha]       = useState(hoy())
  const [categoria, setCat]     = useState<CategoriaGasto>('otros')
  const [descripcion, setDesc]  = useState('')
  const [monto, setMonto]       = useState('')
  const [saving, setSaving]     = useState(false)

  const mes = rangos.mes()

  useEffect(() => { cargar() }, [])

  async function cargar() {
    setLoading(true)
    const { data, error: e } = await supabase
      .from('gastos').select('*')
      .gte('fecha', mes.inicio).lte('fecha', mes.fin)
      .order('fecha', { ascending: false })
    if (e) { setError(e.message) } else { setGastos(data || []) }
    setLoading(false)
  }

  async function guardar() {
    if (!descripcion.trim() || !monto) return
    setSaving(true)
    try {
      const { data, error: e } = await supabase.from('gastos').insert({
        fecha, categoria, descripcion: descripcion.trim(), monto: Number(monto),
      }).select().single()
      if (e) throw e
      setGastos(prev => [data, ...prev].sort((a, b) => b.fecha.localeCompare(a.fecha)))
      setDesc(''); setMonto(''); setCat('otros'); setFecha(hoy())
      setShowForm(false)
    } catch (e) {
      setError(getErrorMsg(e))
    } finally {
      setSaving(false)
    }
  }

  async function eliminar(id: string) {
    if (!confirm('¿Eliminar este gasto?')) return
    await supabase.from('gastos').delete().eq('id', id)
    setGastos(prev => prev.filter(g => g.id !== id))
  }

  const totalMes = gastos.reduce((s, g) => s + g.monto, 0)

  // Datos para el gráfico por categoría
  const porCategoria = CATEGORIAS
    .map(([cat, meta]) => ({
      name:  meta.label,
      value: gastos.filter(g => g.categoria === cat).reduce((s, g) => s + g.monto, 0),
      color: meta.color,
    }))
    .filter(d => d.value > 0)

  return (
    <div className="space-y-5 w-full max-w-4xl mx-auto">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink-50">Gastos</h1>
          <p className="text-ink-300 text-sm font-mono">Mes actual — {fmt.guarani(totalMes)} total</p>
        </div>
        <button onClick={() => setShowForm(v => !v)} className="btn-primary">
          <Plus size={14} className="inline mr-1" /> Nuevo gasto
        </button>
      </div>

      {error && (
        <div className="text-red-400 text-sm bg-red-900/20 border border-red-900/40 rounded-lg px-4 py-2">
          {error}
        </div>
      )}

      {/* Formulario */}
      {showForm && (
        <div className="card-gold space-y-3">
          <h3 className="font-body text-gold-400 text-sm">Registrar gasto</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="input-label">Fecha</label>
              <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} className="w-full" />
            </div>
            <div>
              <label className="input-label">Categoría</label>
              <select value={categoria} onChange={e => setCat(e.target.value as CategoriaGasto)} className="w-full">
                {CATEGORIAS.map(([cat, meta]) => (
                  <option key={cat} value={cat}>{meta.label}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="input-label">Descripción</label>
              <input value={descripcion} onChange={e => setDesc(e.target.value)}
                placeholder="Ej: Compra de productos para el cabello" className="w-full" />
            </div>
            <div>
              <label className="input-label">Monto (Gs.)</label>
              <input type="number" value={monto} onChange={e => setMonto(e.target.value)}
                placeholder="0" className="w-full" />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowForm(false)} className="btn-ghost">Cancelar</button>
            <button onClick={guardar} disabled={saving || !descripcion || !monto} className="btn-primary">
              {saving ? 'Guardando...' : 'Registrar'}
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Resumen por categoría */}
        <div className="card space-y-3">
          <h3 className="font-body text-ink-100 text-sm">Por categoría</h3>
          {CATEGORIAS.map(([cat, meta]) => {
            const total = gastos.filter(g => g.categoria === cat).reduce((s, g) => s + g.monto, 0)
            if (!total) return null
            return (
              <div key={cat}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-body text-ink-200">{meta.label}</span>
                  <span className="font-mono" style={{ color: meta.color }}>{fmt.guarani(total)}</span>
                </div>
                <div className="h-1 bg-surface-100 rounded-full">
                  <div className="h-full rounded-full" style={{ width: `${(total/totalMes)*100}%`, backgroundColor: meta.color }} />
                </div>
              </div>
            )
          })}
          {totalMes === 0 && <p className="text-ink-300 text-xs text-center py-4">Sin gastos este mes</p>}
        </div>

        {/* Gráfico */}
        {porCategoria.length > 0 && (
          <div className="card lg:col-span-2">
            <h3 className="font-body text-ink-100 text-sm mb-2">Distribución</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={porCategoria} cx="50%" cy="50%" innerRadius={55} outerRadius={85}
                  paddingAngle={3} dataKey="value">
                  {porCategoria.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v: unknown) => fmt.guarani(Number(v))}
                  contentStyle={{ background: '#161616', border: '1px solid #2A2A2A', borderRadius: 8, fontFamily: 'DM Mono', fontSize: 12 }}
                  labelStyle={{ color: '#A09080' }}
                />
                <Legend wrapperStyle={{ fontFamily: 'Syne', fontSize: 12, color: '#A09080' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Lista de gastos */}
      <div className="card overflow-hidden p-0">
        <div className="px-4 py-3 border-b border-surface-50 flex items-center justify-between">
          <h3 className="font-body text-ink-100 text-sm">Gastos del mes</h3>
          <span className="badge-red">{fmt.guarani(totalMes)}</span>
        </div>
        {loading ? (
          <p className="text-center py-10 text-ink-300 font-mono text-sm animate-pulse">Cargando...</p>
        ) : gastos.length === 0 ? (
          <p className="text-center py-10 text-ink-300 font-mono text-sm">Sin gastos registrados este mes</p>
        ) : (
          <div className="divide-y divide-surface-50">
            {gastos.map(g => {
              const meta = CATEGORIAS_GASTO[g.categoria]
              return (
                <div key={g.id} className="flex items-center justify-between px-4 py-3 hover:bg-surface-100 group transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: meta.color }} />
                    <div>
                      <p className="font-body text-ink-100 text-sm">{g.descripcion}</p>
                      <p className="text-xs text-ink-300 font-mono">{meta.label} · {fmt.fechaCorta(g.fecha)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-red-400">{fmt.guarani(g.monto)}</span>
                    <button onClick={() => eliminar(g.id)}
                      className="opacity-0 group-hover:opacity-100 text-red-400/60 hover:text-red-400 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
