export interface ServicioCatalogo {
  id: string
  nombre: string
  precio: number
  activo: boolean
  created_at: string
}

export interface Atencion {
  id: string
  fecha: string
  servicio_nombre: string
  precio: number
  notas?: string
  created_at: string
}

export type CategoriaGasto = 'productos' | 'alquiler' | 'luz' | 'agua' | 'salarios' | 'otros'

export interface Gasto {
  id: string
  fecha: string
  categoria: CategoriaGasto
  descripcion: string
  monto: number
  created_at: string
}

export interface Caja {
  id: string
  fecha: string
  hora_apertura?: string
  hora_cierre?: string
  monto_inicial: number
  estado: 'abierta' | 'cerrada'
  notas?: string
  created_at: string
}

export interface ResumenDia {
  fecha: string
  ingresos: number
  gastos: number
  ganancia: number
  clientes: number
}

export interface DatoPeriodo {
  label: string
  ingresos: number
  gastos: number
}
