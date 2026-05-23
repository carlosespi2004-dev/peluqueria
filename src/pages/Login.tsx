import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Scissors, Lock, Eye, EyeOff } from 'lucide-react'
import { login } from '../lib/utils'

export default function Login() {
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError]       = useState('')
  const [loading, setLoading]   = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    await new Promise(r => setTimeout(r, 400))

    if (login(password)) {
      navigate('/')
    } else {
      setError('Contraseña incorrecta. Inténtalo de nuevo.')
      setPassword('')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-surface-400 flex items-center justify-center p-4">
      {/* Background texture */}
      <div
        className="fixed inset-0 opacity-[0.03]"
        style={{ backgroundImage: 'repeating-linear-gradient(45deg, #B8860B 0, #B8860B 1px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }}
      />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gold-500/10 border border-gold-500/30 mb-4">
            <Scissors size={28} className="text-gold-400" />
          </div>
          <h1 className="font-display text-4xl text-ink-50 mb-1">BarberControl</h1>
          <p className="text-ink-300 text-sm font-body">Sistema de Gestión de Peluquería</p>
        </div>

        {/* Card */}
        <div className="card-gold p-6">
          <div className="gold-line mb-6" />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label">
                <Lock size={12} className="inline mr-1" /> Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  className="w-full pr-10"
                  autoFocus
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-300 hover:text-ink-100"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-red-400 text-xs bg-red-900/20 border border-red-900/40 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <button type="submit" className="btn-primary w-full py-2.5" disabled={loading}>
              {loading ? 'Verificando...' : 'Ingresar'}
            </button>
          </form>

          <div className="gold-line mt-6" />
        </div>

        <p className="text-center text-ink-400 text-xs mt-4 font-mono">
          © {new Date().getFullYear()} — Control de Peluquería
        </p>
      </div>
    </div>
  )
}
