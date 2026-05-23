import { useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Check } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { fmt, getErrorMsg } from '../lib/utils'
import type { ServicioCatalogo } from '../types'

export default function ServiciosPage() {
  const [items, setItems]       = useState<ServicioCatalogo[]>([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [showNew, setShowNew]   = useState(false)
  const [editId, setEditId]     = useState<string | null>(null)

  const [nombre, setNombre] = useState('')
  const [precio, setPrecio] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { cargar() }, [])

  async function cargar() {
    setLoading(true)
    const { data, error: e } = await supabase
      .from('servicios_catalogo').select('*').order('nombre')
    if (e) { setError(e.message) } else { setItems(data || []) }
    setLoading(false)
  }

  async function guardar() {
    if (!nombre.trim() || !precio) return
    setSaving(true)
    try {
      if (editId) {
        const { data, error: e } = await supabase.from('servicios_catalogo')
          .update({ nombre: nombre.trim(), precio: Number(precio) })
          .eq('id', editId).select().single()
        if (e) throw e
        setItems(prev => prev.map(i => i.id === editId ? data : i))
      } else {
        const { data, error: e } = await supabase.from('servicios_catalogo')
          .insert({ nombre: nombre.trim(), precio: Number(precio) }).select().single()
        if (e) throw e
        setItems(prev => [...prev, data].sort((a, b) => a.nombre.localeCompare(b.nombre)))
      }
      cancelar()
    } catch (e) {
      setError(getErrorMsg(e))
    } finally {
      setSaving(false)
    }
  }

  async function toggleActivo(item: ServicioCatalogo) {
    const { data, error: e } = await supabase.from('servicios_catalogo')
      .update({ activo: !item.activo }).eq('id', item.id).select().single()
    if (!e) setItems(prev => prev.map(i => i.id === item.id ? data : i))
  }

  async function eliminar(id: string) {
    if (!confirm('¿Eliminar este servicio del catálogo?')) return
    await supabase.from('servicios_catalogo').delete().eq('id', id)
    setItems(prev => prev.filter(i => i.id !== id))
  }

  function editar(item: ServicioCatalogo) {
    setEditId(item.id)
    setNombre(item.nombre)
    setPrecio(String(item.precio))
    setShowNew(true)
  }

  function cancelar() {
    setShowNew(false)
    setEditId(null)
    setNombre('')
    setPrecio('')
  }

  return (
    <div className="space-y-5 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl text-ink-50">Catálogo de Servicios</h1>
          <p className="text-ink-300 text-sm font-mono">{items.length} servicios registrados</p>
        </div>
        <button onClick={() => { cancelar(); setShowNew(v => !v) }} className="btn-primary">
          <Plus size={14} className="inline mr-1" /> Nuevo
        </button>
      </div>

      {error && (
        <div className="text-red-400 text-sm bg-red-900/20 border border-red-900/40 rounded-lg px-4 py-2">
          {error}
        </div>
      )}

      {/* Formulario */}
      {showNew && (
        <div className="card-gold space-y-3">
          <h3 className="font-body text-gold-400 text-sm">
            {editId ? 'Editar servicio' : 'Nuevo servicio'}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="input-label">Nombre del servicio</label>
              <input value={nombre} onChange={e => setNombre(e.target.value)}
                placeholder="Ej: Corte + Barba" className="w-full" autoFocus />
            </div>
            <div>
              <label className="input-label">Precio (Gs.)</label>
              <input type="number" value={precio} onChange={e => setPrecio(e.target.value)}
                placeholder="0" className="w-full" />
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={cancelar} className="btn-ghost">Cancelar</button>
            <button onClick={guardar} disabled={saving || !nombre || !precio} className="btn-primary">
              <Check size={14} className="inline mr-1" />
              {saving ? 'Guardando...' : editId ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </div>
      )}

      {/* Tabla de servicios */}
      {loading ? (
        <div className="text-center py-12 text-ink-300 font-mono text-sm animate-pulse">
          Cargando...
        </div>
      ) : (
        <div className="card overflow-hidden p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-surface-50">
                <th className="px-4 py-3 text-left text-xs text-ink-300 uppercase tracking-widest font-body">Servicio</th>
                <th className="px-4 py-3 text-right text-xs text-ink-300 uppercase tracking-widest font-body">Precio</th>
                <th className="px-4 py-3 text-center text-xs text-ink-300 uppercase tracking-widest font-body">Estado</th>
                <th className="px-4 py-3 w-24" />
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-50">
              {items.map(item => (
                <tr key={item.id} className="group hover:bg-surface-100 transition-colors">
                  <td className="px-4 py-3 font-body text-ink-100">{item.nombre}</td>
                  <td className="px-4 py-3 text-right font-mono text-gold-400">{fmt.guarani(item.precio)}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => toggleActivo(item)}>
                      <span className={item.activo ? 'badge-green' : 'badge-gray'}>
                        {item.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => editar(item)} className="p-1.5 text-ink-300 hover:text-gold-400 transition-colors">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => eliminar(item.id)} className="p-1.5 text-ink-300 hover:text-red-400 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && (
            <p className="text-center text-ink-300 text-sm py-10 font-mono">
              No hay servicios en el catálogo. Agrega el primero.
            </p>
          )}
        </div>
      )}
    </div>
  )
}
