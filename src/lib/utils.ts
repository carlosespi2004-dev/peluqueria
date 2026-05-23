import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from 'date-fns'
import { es } from 'date-fns/locale'
import type { CategoriaGasto } from '../types'

export const fmt = {
  guarani: (n: number) =>
    new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG', maximumFractionDigits: 0 }).format(n),
  fecha: (d: string | Date) => format(new Date(d), "dd 'de' MMMM yyyy", { locale: es }),
  fechaCorta: (d: string | Date) => format(new Date(d), 'dd/MM/yyyy'),
  hora: (d: string | Date) => format(new Date(d), 'HH:mm'),
  mes: (d: string | Date) => format(new Date(d), 'MMMM yyyy', { locale: es }),
}

export const hoy = () => format(new Date(), 'yyyy-MM-dd')

export const rangos = {
  semana: () => ({
    inicio: format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'),
    fin:    format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd'),
  }),
  mes: () => ({
    inicio: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    fin:    format(endOfMonth(new Date()), 'yyyy-MM-dd'),
  }),
  anio: () => ({
    inicio: format(startOfYear(new Date()), 'yyyy-MM-dd'),
    fin:    format(endOfYear(new Date()), 'yyyy-MM-dd'),
  }),
}

export const CATEGORIAS_GASTO: Record<CategoriaGasto, { label: string; color: string }> = {
  productos:  { label: 'Productos',  color: '#7C3AED' },
  agua:       { label: 'Agua',       color: '#3B82F6' },
  salarios:   { label: 'Salarios',   color: '#10B981' },
  otros:      { label: 'Otros',      color: '#6B7280' },
}

export function getErrorMsg(err: unknown): string {
  if (err instanceof Error) return err.message
  return 'Ocurrió un error inesperado'
}

import { supabase } from './supabase'

export const AUTH_KEY = 'pelu_auth'

export function isAuthenticated(): boolean {
  return localStorage.getItem(AUTH_KEY) === 'true'
}

export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) return { success: false, message: getErrorMsg(error) }
  if (!data.session) return { success: false, message: 'No se pudo iniciar sesión. Intenta de nuevo.' }

  localStorage.setItem(AUTH_KEY, 'true')
  return { success: true }
}

export async function logout(): Promise<void> {
  await supabase.auth.signOut()
  localStorage.removeItem(AUTH_KEY)
}
