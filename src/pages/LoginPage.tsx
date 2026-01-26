import { useState, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabaseService } from '../services/supabaseService'

function LoginPage() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('demo@vignola.cl')
  const [password, setPassword] = useState('demo123')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      // MODO DEMO: Autenticación local sin backend
      if (email && password) {
        // Generar UUID válido para la base de datos
        const userId = crypto.randomUUID()

        // Extraer nombre del email (parte antes del @)
        const nombre = email.split('@')[0]
          .split('.')
          .map(parte => parte.charAt(0).toUpperCase() + parte.slice(1))
          .join(' ')

        // Crear usuario de prueba
        const demoUser = {
          id: userId,
          nombre: nombre || 'Usuario',
          email: email,
          rol: 'mecanico' as const
        }

        // Intentar guardar en base de datos (opcional - no bloquea el inicio de sesión)
        try {
          if (navigator.onLine) {
            await supabaseService.createOrUpdateUsuario(demoUser)
            console.log('Usuario guardado en base de datos:', demoUser)
          } else {
            console.log('Modo offline - usuario no guardado en BD')
          }
        } catch (dbError: any) {
          console.warn('No se pudo guardar en BD (continuando en modo offline):', dbError.message)
          // NO bloqueamos el inicio de sesión - continuamos en modo offline
        }

        // Guardar token falso y usuario en localStorage
        localStorage.setItem('auth_token', 'demo-token-' + Date.now())
        localStorage.setItem('user', JSON.stringify(demoUser))

        navigate('/')
      } else {
        setError('Por favor ingresa email y contraseña')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="font-display bg-background-light dark:bg-background-dark min-h-screen flex flex-col items-center justify-center p-4 selection:bg-primary/30 selection:text-primary transition-colors duration-200 relative">

      {/* Main Container */}
      <div className="w-full max-w-[400px] flex flex-col gap-8 relative z-10">

        {/* Header / Logo Section */}
        <div className="flex flex-col items-center gap-6">
          {/* Logo */}
          <div className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10">
            <div
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1565435391196-0c797872e1e1?w=400&h=400&fit=crop')",
              }}
            >
              <div className="absolute inset-0 bg-primary/40 mix-blend-overlay"></div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Vignola</h1>
            <h2 className="text-slate-500 dark:text-slate-400 font-medium text-lg">Inspección de Cilindros</h2>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Username Field */}
          <div className="space-y-2 group">
            <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">
              Usuario
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-4 text-slate-400 group-focus-within:text-primary transition-colors">
                <span className="material-symbols-outlined text-[20px]">person</span>
              </div>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-14 pl-12 pr-4 rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm text-base"
                placeholder="Ingrese su usuario"
                disabled={loading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2 group">
            <div className="flex justify-between items-center ml-1">
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Contraseña
              </label>
              <button
                type="button"
                onClick={() => alert('Función de recuperación de contraseña\n\nPara restablecer tu contraseña, contacta al administrador del sistema.')}
                className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                ¿Olvidó su contraseña?
              </button>
            </div>
            <div className="relative flex items-center">
              <div className="absolute left-4 text-slate-400 group-focus-within:text-primary transition-colors">
                <span className="material-symbols-outlined text-[20px]">lock</span>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-14 pl-12 pr-12 rounded-xl bg-white dark:bg-surface-dark border border-slate-200 dark:border-border-dark text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all shadow-sm text-base"
                placeholder="••••••••"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-0 h-full px-4 text-slate-400 hover:text-white transition-colors flex items-center"
              >
                <span className="material-symbols-outlined text-[20px]">
                  {showPassword ? 'visibility_off' : 'visibility'}
                </span>
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
            </div>
          )}

          {/* Demo Notice */}
          <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
            <p className="text-xs text-green-800 dark:text-green-300 font-medium text-center">
              ✅ Modo Offline: Funciona sin conexión a internet
            </p>
            <p className="text-[10px] text-green-700 dark:text-green-400 text-center mt-1">
              Usa cualquier usuario y contraseña para ingresar
            </p>
          </div>

          {/* Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-primary hover:bg-blue-600 active:bg-blue-700 text-white text-base font-bold rounded-xl shadow-lg shadow-primary/25 transition-all flex items-center justify-center gap-2 transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{loading ? 'Iniciando...' : 'Iniciar Sesión'}</span>
              <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
          </div>
        </form>

        {/* Footer / Status */}
        <div className="mt-auto flex flex-col items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100/50 dark:bg-green-900/30 border border-green-300 dark:border-green-700">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            <span className="text-xs font-medium text-green-700 dark:text-green-400">Sistema Disponible (Online/Offline)</span>
          </div>
          <p className="text-xs text-slate-400 dark:text-slate-600">Vignola PWA Industrial v1.0.4</p>
        </div>
      </div>

      {/* Decorative Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        {/* Subtle Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{
            backgroundImage: "radial-gradient(#94a3b8 1px, transparent 1px)",
            backgroundSize: "24px 24px"
          }}
        ></div>

        {/* Bottom Gradient Glow */}
        <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] bg-primary/20 blur-[100px] rounded-full mix-blend-screen pointer-events-none"></div>
      </div>
    </div>
  )
}

export default LoginPage
