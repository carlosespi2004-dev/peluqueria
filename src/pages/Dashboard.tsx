import { useEffect, useState } from 'react'
import {
  TrendingUp, TrendingDown, Users, DollarSign,
  Calendar, BarChart2, Award,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  LineChart, Line, CartesianGrid,
} from 'recharts'
import { supabase } from '../lib/supabase'
import { fmt, hoy, rangos } from '../lib/utils'
import { format, subDays, eachDayOfInterval } from 'date-fns'
import { es } from 'date-fns/locale'
import type { Atencion, Gasto } from '../types'

interface Stats {
  hoyIngresos:   number
  semanaIngresos: number
  mesIngresos:   number
  anioIngresos:  number
  hoyGastos:     number
  mesGastos:     number
  hoyClientes:   number
  gananciaMes:   number
}

const EMPTY_STATS: Stats = {
  hoyIngresos: 0, semanaIngresos: 0, mesIngresos: 0, anioIngresos: 0,
  hoyGastos: 0, mesGastos: 0, hoyClientes: 0, gananciaMes: 0,
}

interface DatoSemana { dia: string; ingresos: number; gastos: number }

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-surface-200 border border-surface-50 rounded-lg p-3 text-xs font-mono shadow-xl">
      <p className="text-ink-300 mb-2">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>{p.name}: {fmt.guarani(p.value)}</p>
      ))}
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats]         = useState<Stats>(EMPTY_STATS)
  const [semana, setSemana]       = useState<DatoSemana[]>([])
  const [topDias, setTopDias]     = useState<Array<{ fecha: string; total: number }>>([])
  const [loading, setLoading]     = useState(true)

  useEffect(() => { cargarDatos() }, [])

  async function cargarDatos() {
    setLoading(true)
    try {
      const today = hoy()
      const sem   = rangos.semana()
      const mes   = rangos.mes()
      const anio  = rangos.anio()

      const [hoyAt, semAt, mesAt, anioAt, hoyG, mesG] = await Promise.all([
        supabase.from('atenciones').select('precio').eq('fecha', today),
        supabase.from('atenciones').select('precio').gte('fecha', sem.inicio).lte('fecha', sem.fin),
        supabase.from('atenciones').select('precio').gte('fecha', mes.inicio).lte('fecha', mes.fin),
        supabase.from('atenciones').select('precio').gte('fecha', anio.inicio).lte('fecha', anio.fin),
        supabase.from('gastos').select('monto').eq('fecha', today),
        supabase.from('gastos').select('monto').gte('fecha', mes.inicio).lte('fecha', mes.fin),
      ])

      const sum = (rows: Array<{ precio?: number; monto?: number }>, key: 'precio' | 'monto') =>
        (rows || []).reduce((acc, r) => acc + (r[key] ?? 0), 0)

      const hoyI   = sum(hoyAt.data  || [], 'precio')
      const semI   = sum(semAt.data  || [], 'precio')
      const mesI   = sum(mesAt.data  || [], 'precio')
      const anioI  = sum(anioAt.data || [], 'precio')
      const hoyGt  = sum(hoyG.data   || [], 'monto')
      const mesGt  = sum(mesG.data   || [], 'monto')

      setStats({
        hoyIngresos: hoyI, semanaIngresos: semI, mesIngresos: mesI, anioIngresos: anioI,
        hoyGastos: hoyGt, mesGastos: mesGt, hoyClientes: (hoyAt.data || []).length,
        gananciaMes: mesI - mesGt,
      })

      // Últimos 7 días
      const dias = eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() })
      const [atAll, gAll] = await Promise.all([
        supabase.from('atenciones').select('fecha,precio')
          .gte('fecha', format(dias[0], 'yyyy-MM-dd')),
        supabase.from('gastos').select('fecha,monto')
          .gte('fecha', format(dias[0], 'yyyy-MM-dd')),
      ])

      const aMap: Record<string, number> = {}
      const gMap: Record<string, number> = {}
      ;(atAll.data as Atencion[] || []).forEach(a => { aMap[a.fecha] = (aMap[a.fecha] || 0) + a.precio })
      ;(gAll.data as Gasto[]    || []).forEach(g => { gMap[g.fecha] = (gMap[g.fecha] || 0) + g.monto })

      setSemana(dias.map(d => ({
        dia:      format(d, 'EEE', { locale: es }),
        ingresos: aMap[format(d, 'yyyy-MM-dd')] || 0,
        gastos:   gMap[format(d, 'yyyy-MM-dd')] || 0,
      })))

      // Top días del mes
      const topAt = await supabase.from('atenciones').select('fecha,precio')
        .gte('fecha', mes.inicio).lte('fecha', mes.fin)
      const topMap: Record<string, number> = {}
      ;(topAt.data as Atencion[] || []).forEach(a => { topMap[a.fecha] = (topMap[a.fecha] || 0) + a.precio })
      const top = Object.entries(topMap)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([fecha, total]) => ({ fecha, total }))
      setTopDias(top)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-ink-300 font-mono text-sm animate-pulse">Cargando datos...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl text-ink-50">Panel Principal</h1>
        <p className="text-ink-300 text-sm font-mono mt-0.5">
          {fmt.fecha(new Date())}
        </p>
      </div>

      {/* Stats primarias */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={<DollarSign size={16} />} label="Ingresos Hoy"
          value={fmt.guarani(stats.hoyIngresos)} color="gold" />
        <StatCard icon={<Calendar size={16} />} label="Ingresos Semana"
          value={fmt.guarani(stats.semanaIngresos)} color="blue" />
        <StatCard icon={<BarChart2 size={16} />} label="Ingresos Mes"
          value={fmt.guarani(stats.mesIngresos)} color="purple" />
        <StatCard icon={<TrendingUp size={16} />} label="Ingresos Año"
          value={fmt.guarani(stats.anioIngresos)} color="green" />
      </div>

      {/* Stats secundarias */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard icon={<Users size={16} />} label="Clientes Hoy"
          value={`${stats.hoyClientes}`} color="gold" suffix="personas" />
        <StatCard icon={<TrendingDown size={16} />} label="Gastos Hoy"
          value={fmt.guarani(stats.hoyGastos)} color="red" />
        <StatCard icon={<TrendingDown size={16} />} label="Gastos Mes"
          value={fmt.guarani(stats.mesGastos)} color="red" />
        <StatCard
          icon={<Award size={16} />}
          label="Ganancia Neta Mes"
          value={fmt.guarani(stats.gananciaMes)}
          color={stats.gananciaMes >= 0 ? 'green' : 'red'}
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Últimos 7 días */}
        <div className="card">
          <h3 className="text-sm font-body text-ink-200 mb-4">Últimos 7 días</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={semana} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
              <XAxis dataKey="dia" tick={{ fill: '#A09080', fontSize: 11, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#A09080', fontSize: 10, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false}
                tickFormatter={v => v >= 1000 ? `${(v/1000).toFixed(0)}k` : `${v}`} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="ingresos" name="Ingresos" fill="#B8860B" radius={[4,4,0,0]} />
              <Bar dataKey="gastos"   name="Gastos"   fill="#7f1d1d" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top días del mes */}
        <div className="card">
          <h3 className="text-sm font-body text-ink-200 mb-4">
            <Award size={14} className="inline mr-1 text-gold-400" />
            Mejores días del mes
          </h3>
          {topDias.length === 0 ? (
            <p className="text-ink-300 text-sm text-center py-8">Sin datos este mes</p>
          ) : (
            <div className="space-y-3">
              {topDias.map((d, i) => (
                <div key={d.fecha} className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-500 flex-shrink-0
                    ${i === 0 ? 'bg-gold-500 text-surface-400' : 'bg-surface-100 text-ink-300'}`}>
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-body text-ink-100">{fmt.fecha(d.fecha)}</span>
                      <span className="font-mono text-gold-400">{fmt.guarani(d.total)}</span>
                    </div>
                    <div className="h-1 bg-surface-100 rounded-full mt-1">
                      <div
                        className="h-full bg-gold-500/60 rounded-full"
                        style={{ width: `${(d.total / topDias[0].total) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tendencia mensual */}
      {semana.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-body text-ink-200 mb-4">Tendencia de ingresos (7 días)</h3>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={semana}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
              <XAxis dataKey="dia" tick={{ fill: '#A09080', fontSize: 11, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#A09080', fontSize: 10, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false}
                tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="ingresos" name="Ingresos" stroke="#B8860B" strokeWidth={2}
                dot={{ fill: '#B8860B', r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

function StatCard({ icon, label, value, color, suffix }: {
  icon: React.ReactNode; label: string; value: string; color: string; suffix?: string
}) {
  const colors: Record<string, string> = {
    gold:   'text-gold-400',
    blue:   'text-blue-400',
    purple: 'text-purple-400',
    green:  'text-emerald-400',
    red:    'text-red-400',
  }
  const borders: Record<string, string> = {
    gold:   'border-gold-500/20',
    blue:   'border-blue-500/20',
    purple: 'border-purple-500/20',
    green:  'border-emerald-500/20',
    red:    'border-red-500/20',
  }
  return (
    <div className={`card border ${borders[color] || 'border-surface-50'}`}>
      <div className={`flex items-center gap-2 mb-2 ${colors[color]}`}>
        {icon}
        <span className="stat-label">{label}</span>
      </div>
      <p className={`font-mono text-lg font-500 ${colors[color]}`}>{value}</p>
      {suffix && <p className="text-xs text-ink-300 font-mono">{suffix}</p>}
    </div>
  )
}
