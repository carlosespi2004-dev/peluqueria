import { useState } from 'react'
import { FileText, FileSpreadsheet } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { fmt, rangos, CATEGORIAS_GASTO } from '../lib/utils'
import type { Atencion, Gasto } from '../types'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { format, eachMonthOfInterval, startOfMonth, endOfMonth, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'

export default function ReportesPage() {
  const mes = rangos.mes()
  const [desde, setDesde]   = useState(mes.inicio)
  const [hasta, setHasta]   = useState(mes.fin)
  const [loading, setLoading] = useState(false)
  const [datos, setDatos]   = useState<{ atenciones: Atencion[]; gastos: Gasto[] } | null>(null)
  const [mensual, setMensual] = useState<Array<{ mes: string; ingresos: number; gastos: number }>>([])

  async function cargarDatos() {
    setLoading(true)
    const [atRes, gRes] = await Promise.all([
      supabase.from('atenciones').select('*').gte('fecha', desde).lte('fecha', hasta).order('fecha'),
      supabase.from('gastos').select('*').gte('fecha', desde).lte('fecha', hasta).order('fecha'),
    ])
    const atenciones: Atencion[] = atRes.data || []
    const gastos: Gasto[]        = gRes.data  || []
    setDatos({ atenciones, gastos })

    // Agrupar por mes para gráfico comparativo
    const meses = eachMonthOfInterval({ start: parseISO(desde), end: parseISO(hasta) })
    setMensual(meses.map(m => {
      const ini = format(startOfMonth(m), 'yyyy-MM-dd')
      const fin = format(endOfMonth(m),   'yyyy-MM-dd')
      const ing = atenciones.filter(a => a.fecha >= ini && a.fecha <= fin).reduce((s, a) => s + a.precio, 0)
      const gas = gastos.filter(g => g.fecha >= ini && g.fecha <= fin).reduce((s, g) => s + g.monto, 0)
      return { mes: format(m, 'MMM yy', { locale: es }), ingresos: ing, gastos: gas }
    }))

    setLoading(false)
  }

  async function exportarExcel() {
    if (!datos) return
    const XLSX = await import('xlsx')

    const atData = datos.atenciones.map(a => ({
      Fecha:    a.fecha,
      Tipo:     'Ingreso',
      Concepto: a.servicio_nombre,
      Monto:    a.precio,
      Notas:    a.notas || '',
    }))
    const gData = datos.gastos.map(g => ({
      Fecha:    g.fecha,
      Tipo:     'Gasto',
      Concepto: g.descripcion,
      Monto:    -g.monto,
      Notas:    CATEGORIAS_GASTO[g.categoria]?.label || g.categoria,
    }))
    const todos = [...atData, ...gData].sort((a, b) => a.Fecha.localeCompare(b.Fecha))

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(todos), 'Movimientos')
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(atData), 'Ingresos')
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(gData.map(g => ({ ...g, Monto: -g.Monto }))), 'Gastos')

    XLSX.writeFile(wb, `reporte-peluqueria-${desde}-${hasta}.xlsx`)
  }

  async function exportarPDF() {
    if (!datos) return
    const { default: jsPDF } = await import('jspdf')
    const { default: autoTable } = await import('jspdf-autotable')

    const doc = new jsPDF()
    const totalIngresos = datos.atenciones.reduce((s, a) => s + a.precio, 0)
    const totalGastos   = datos.gastos.reduce((s, g) => s + g.monto, 0)
    const ganancia      = totalIngresos - totalGastos

    doc.setFontSize(18)
    doc.setTextColor(184, 134, 11)
    doc.text('Reporte de Peluquería', 14, 20)

    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)
    doc.text(`Período: ${fmt.fechaCorta(desde)} — ${fmt.fechaCorta(hasta)}`, 14, 30)
    doc.text(`Generado: ${fmt.fecha(new Date())}`, 14, 36)

    doc.setFontSize(11)
    doc.setTextColor(0, 0, 0)
    doc.text(`Total ingresos: ${fmt.guarani(totalIngresos)}`, 14, 48)
    doc.text(`Total gastos: ${fmt.guarani(totalGastos)}`, 14, 55)
    doc.text(`Ganancia neta: ${fmt.guarani(ganancia)}`, 14, 62)
    doc.text(`Clientes atendidos: ${datos.atenciones.length}`, 14, 69)

    autoTable(doc, {
      startY: 78,
      head: [['Fecha', 'Servicio', 'Monto']],
      body: datos.atenciones.map(a => [a.fecha, a.servicio_nombre, fmt.guarani(a.precio)]),
      headStyles: { fillColor: [184, 134, 11], textColor: [10, 10, 10] },
      styles: { fontSize: 9 },
      columnStyles: { 2: { halign: 'right' } },
    })

    const finalY = (doc as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? 100
    autoTable(doc, {
      startY: finalY + 10,
      head: [['Fecha', 'Categoría', 'Descripción', 'Monto']],
      body: datos.gastos.map(g => [g.fecha, CATEGORIAS_GASTO[g.categoria]?.label, g.descripcion, fmt.guarani(g.monto)]),
      headStyles: { fillColor: [127, 29, 29], textColor: [255, 255, 255] },
      styles: { fontSize: 9 },
      columnStyles: { 3: { halign: 'right' } },
    })

    doc.save(`reporte-peluqueria-${desde}-${hasta}.pdf`)
  }

  const totalIngresos = datos?.atenciones.reduce((s, a) => s + a.precio, 0) ?? 0
  const totalGastos   = datos?.gastos.reduce((s, g) => s + g.monto, 0) ?? 0
  const ganancia      = totalIngresos - totalGastos

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h1 className="font-display text-3xl text-ink-50">Reportes</h1>
        <p className="text-ink-300 text-sm font-mono">Generá reportes en PDF y Excel</p>
      </div>

      {/* Selector de rango */}
      <div className="card space-y-3">
        <h3 className="font-body text-ink-100 text-sm">Seleccionar período</h3>
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <label className="input-label">Desde</label>
            <input type="date" value={desde} onChange={e => setDesde(e.target.value)} />
          </div>
          <div>
            <label className="input-label">Hasta</label>
            <input type="date" value={hasta} onChange={e => setHasta(e.target.value)} />
          </div>
          <button onClick={cargarDatos} disabled={loading} className="btn-primary">
            {loading ? 'Cargando...' : 'Generar reporte'}
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { label: 'Esta semana', fn: () => { const s = rangos.semana(); setDesde(s.inicio); setHasta(s.fin) } },
            { label: 'Este mes',    fn: () => { const s = rangos.mes();    setDesde(s.inicio); setHasta(s.fin) } },
            { label: 'Este año',    fn: () => { const s = rangos.anio();   setDesde(s.inicio); setHasta(s.fin) } },
          ].map(({ label, fn }) => (
            <button key={label} onClick={() => { fn(); }} className="btn-ghost text-xs py-1 px-3">
              {label}
            </button>
          ))}
        </div>
      </div>

      {datos && (
        <>
          {/* Resumen */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="card text-center">
              <p className="font-mono text-emerald-400 text-lg">{fmt.guarani(totalIngresos)}</p>
              <p className="stat-label">Ingresos</p>
            </div>
            <div className="card text-center">
              <p className="font-mono text-red-400 text-lg">{fmt.guarani(totalGastos)}</p>
              <p className="stat-label">Gastos</p>
            </div>
            <div className="card text-center">
              <p className={`font-mono text-lg ${ganancia >= 0 ? 'text-gold-400' : 'text-red-400'}`}>{fmt.guarani(ganancia)}</p>
              <p className="stat-label">Ganancia neta</p>
            </div>
            <div className="card text-center">
              <p className="font-mono text-ink-100 text-lg">{datos.atenciones.length}</p>
              <p className="stat-label">Clientes</p>
            </div>
          </div>

          {/* Gráfico comparativo mensual */}
          {mensual.length > 1 && (
            <div className="card">
              <h3 className="font-body text-ink-100 text-sm mb-4">Comparativo mensual</h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={mensual} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2A2A2A" />
                  <XAxis dataKey="mes" tick={{ fill: '#A09080', fontSize: 11, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#A09080', fontSize: 10, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false}
                    tickFormatter={v => `${(v/1000).toFixed(0)}k`} />
                  <Tooltip
                    formatter={(v: unknown) => fmt.guarani(Number(v))}
                    contentStyle={{ background: '#161616', border: '1px solid #2A2A2A', borderRadius: 8, fontFamily: 'DM Mono', fontSize: 12 }}
                  />
                  <Bar dataKey="ingresos" name="Ingresos" fill="#B8860B" radius={[4,4,0,0]} />
                  <Bar dataKey="gastos"   name="Gastos"   fill="#7f1d1d" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Botones de exportación */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button onClick={exportarPDF} className="btn-primary flex items-center justify-center gap-2 flex-1 py-3">
              <FileText size={16} /> Exportar PDF
            </button>
            <button onClick={exportarExcel} className="btn-ghost flex items-center justify-center gap-2 flex-1 py-3">
              <FileSpreadsheet size={16} /> Exportar Excel
            </button>
          </div>

          {/* Vista previa */}
          <div className="card overflow-hidden p-0">
            <div className="px-4 py-3 border-b border-surface-50">
              <h3 className="font-body text-ink-100 text-sm">Vista previa — Ingresos ({datos.atenciones.length})</h3>
            </div>
            <div className="divide-y divide-surface-50 max-h-64 overflow-y-auto">
              {datos.atenciones.slice(0, 50).map(a => (
                <div key={a.id} className="flex justify-between px-4 py-2.5 text-sm">
                  <div>
                    <span className="text-ink-100 font-body">{a.servicio_nombre}</span>
                    <span className="text-ink-300 font-mono ml-3 text-xs">{a.fecha}</span>
                  </div>
                  <span className="font-mono text-emerald-400">{fmt.guarani(a.precio)}</span>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
