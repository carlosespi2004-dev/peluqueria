import { useEffect, useState } from 'react'
import { Search, ChevronDown, ChevronUp, TrendingUp, TrendingDown } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { fmt, CATEGORIAS_GASTO, rangos } from '../lib/utils'
import type { Atencion, Gasto } from '../types'

type Movimiento =
  | (Atencion & { tipo: 'ingreso' })
  | (Gasto    & { tipo: 'gasto'   })

export default function HistorialPage() {
  const [movimientos, setMov] = useState<Movimiento[]>([])
  const [loading, setLoading] = useState(true)

  const mes = rangos.mes()
  const [desde, setDesde] = useState(mes.inicio)
  const [hasta, setHasta] = useState(mes.fin)
  const [filtro, setFiltro] = useState<'todos' | 'ingresos' | 'gastos'>('todos')
  const [busqueda, setBusqueda] = useState('')
  const [orden, setOrden] = useState<'asc' | 'desc'>('desc')

  useEffect(() => { cargar() }, [desde, hasta])

  async function cargar() {
    setLoading(true)
    const [atRes, gRes] = await Promise.all([
      supabase.from('atenciones').select('*').gte('fecha', desde).lte('fecha', hasta),
      supabase.from('gastos').select('*').gte('fecha', desde).lte('fecha', hasta),
    ])
    const ingresos: Movimiento[] = (atRes.data || []).map(a => ({ ...a, tipo: 'ingreso' as const }))
    const gastos:   Movimiento[] = (gRes.data  || []).map(g => ({ ...g, tipo: 'gasto'   as const }))
    const todos = [...ingresos, ...gastos].sort((a, b) =>
      orden === 'desc'
        ? new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        : new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
    setMov(todos)
    setLoading(false)
  }

  const filtrados = movimientos.filter(m => {
    if (filtro === 'ingresos' && m.tipo !== 'ingreso') return false
    if (filtro === 'gastos'   && m.tipo !== 'gasto')   return false
    if (busqueda) {
      const q = busqueda.toLowerCase()
      if (m.tipo === 'ingreso') return m.servicio_nombre.toLowerCase().includes(q)
      return m.descripcion.toLowerCase().includes(q) || m.categoria.toLowerCase().includes(q)
    }
    return true
  })

  const totalIngresos = movimientos.filter(m => m.tipo === 'ingreso').reduce((s, m) => s + (m as Atencion).precio, 0)
  const totalGastos   = movimientos.filter(m => m.tipo === 'gasto').reduce((s, m) => s + (m as Gasto).monto, 0)
  const ganancia      = totalIngresos - totalGastos

  return (
    <div className="space-y-5 w-full max-w-4xl mx-auto">
      <div>
        <h1 className="font-display text-3xl text-ink-50">Historial</h1>
        <p className="text-ink-300 text-sm font-mono">{filtrados.length} movimientos encontrados</p>
      </div>

      {/* Filtros */}
      <div className="card space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="input-label">Desde</label>
            <input type="date" value={desde} onChange={e => setDesde(e.target.value)} className="w-full" />
          </div>
          <div>
            <label className="input-label">Hasta</label>
            <input type="date" value={hasta} onChange={e => setHasta(e.target.value)} className="w-full" />
          </div>
          <div>
            <label className="input-label">Tipo</label>
            <select value={filtro} onChange={e => setFiltro(e.target.value as typeof filtro)} className="w-full">
              <option value="todos">Todos</option>
              <option value="ingresos">Ingresos</option>
              <option value="gastos">Gastos</option>
            </select>
          </div>
          <div>
            <label className="input-label">Buscar</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300" />
              <input value={busqueda} onChange={e => setBusqueda(e.target.value)}
                placeholder="Servicio o descripción..." className="w-full pl-9" />
            </div>
          </div>
        </div>

        {/* Rangos rápidos */}
        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Hoy',     fn: () => { setDesde(new Date().toISOString().split('T')[0]); setHasta(new Date().toISOString().split('T')[0]) } },
            { label: 'Semana',  fn: () => { const s = rangos.semana(); setDesde(s.inicio); setHasta(s.fin) } },
            { label: 'Mes',     fn: () => { const s = rangos.mes();    setDesde(s.inicio); setHasta(s.fin) } },
            { label: 'Año',     fn: () => { const s = rangos.anio();   setDesde(s.inicio); setHasta(s.fin) } },
          ].map(({ label, fn }) => (
            <button key={label} onClick={fn} className="btn-ghost text-xs py-1 px-3">
              {label}
            </button>
          ))}
          <button
            onClick={() => setOrden(v => v === 'desc' ? 'asc' : 'desc')}
            className="btn-ghost text-xs py-1 px-3 flex items-center gap-1"
          >
            {orden === 'desc' ? <ChevronDown size={12} /> : <ChevronUp size={12} />}
            {orden === 'desc' ? 'Más reciente' : 'Más antiguo'}
          </button>
        </div>
      </div>

      {/* Resumen del período */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="card text-center">
          <p className="font-mono text-emerald-400 text-lg">{fmt.guarani(totalIngresos)}</p>
          <p className="stat-label">Ingresos</p>
        </div>
        <div className="card text-center">
          <p className="font-mono text-red-400 text-lg">{fmt.guarani(totalGastos)}</p>
          <p className="stat-label">Gastos</p>
        </div>
        <div className="card text-center">
          <p className={`font-mono text-lg ${ganancia >= 0 ? 'text-gold-400' : 'text-red-400'}`}>
            {fmt.guarani(ganancia)}
          </p>
          <p className="stat-label">Ganancia neta</p>
        </div>
      </div>

      {/* Lista */}
      <div className="card overflow-hidden p-0">
        {loading ? (
          <p className="text-center py-12 text-ink-300 font-mono text-sm animate-pulse">Cargando...</p>
        ) : filtrados.length === 0 ? (
          <p className="text-center py-12 text-ink-300 font-mono text-sm">Sin movimientos en el período seleccionado</p>
        ) : (
          <div className="divide-y divide-surface-50">
            {filtrados.map(m => {
              const esIngreso = m.tipo === 'ingreso'
              const at = m as Atencion
              const g  = m as Gasto
              return (
                <div key={m.id} className="flex items-center gap-3 px-4 py-3 hover:bg-surface-100 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                    ${esIngreso ? 'bg-emerald-900/40 border border-emerald-700/50' : 'bg-red-900/40 border border-red-700/50'}`}>
                    {esIngreso
                      ? <TrendingUp  size={14} className="text-emerald-400" />
                      : <TrendingDown size={14} className="text-red-400"     />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-ink-100 text-sm truncate">
                      {esIngreso ? at.servicio_nombre : g.descripcion}
                    </p>
                    <p className="text-xs text-ink-300 font-mono">
                      {fmt.fechaCorta(m.fecha)}
                      {!esIngreso && ` · ${CATEGORIAS_GASTO[g.categoria]?.label}`}
                    </p>
                  </div>
                  <span className={`font-mono text-sm flex-shrink-0 ${esIngreso ? 'text-emerald-400' : 'text-red-400'}`}>
                    {esIngreso ? '+' : '-'}{fmt.guarani(esIngreso ? at.precio : g.monto)}
                  </span>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
