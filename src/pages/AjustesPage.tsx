import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/api'
import { useTheme } from '../hooks/useTheme'

function AjustesPage() {
  const navigate = useNavigate()
  const user = authService.getCurrentUser()
  const { isDark, toggleTheme } = useTheme()

  const [notificaciones, setNotificaciones] = useState(true)
  const [frecuenciaSync, setFrecuenciaSync] = useState<'15m' | '1h' | 'manual'>('15m')
  const [loading, setLoading] = useState(false)

  const handleVolver = () => {
    navigate(-1)
  }

  const handleGuardarCambios = async () => {
    setLoading(true)
    // Simular guardado
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Actualizar usuario en localStorage si es necesario
    const updatedUser = {
      ...user,
      preferences: {
        notificaciones,
        frecuenciaSync,
        darkMode: isDark
      }
    }
    localStorage.setItem('user', JSON.stringify(updatedUser))

    setLoading(false)
    alert('Cambios guardados exitosamente')
  }

  const handleCerrarSesion = () => {
    if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      authService.logout()
      window.location.href = '/login'
    }
  }

  // Función para obtener el título del usuario
  const getTituloUsuario = (nombre: string | undefined): string => {
    if (!nombre) return 'Inspector de Cilindros'

    const nombreLower = nombre.toLowerCase()

    if (nombreLower.includes('respinoza')) {
      return 'Jefe Taller'
    } else if (nombreLower.includes('mruiz')) {
      return 'Jefe Sucursal'
    } else {
      return 'Inspector de Cilindros'
    }
  }

  // Generar ID aleatorio para el usuario
  const userId = user?.id?.slice(0, 4).toUpperCase() || '4402'

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto bg-background-light dark:bg-background-dark pb-24">

      {/* TopAppBar */}
      <header className="flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 sticky top-0 z-10">
        <button
          onClick={handleVolver}
          className="text-slate-900 dark:text-white flex size-12 shrink-0 items-center justify-start cursor-pointer"
        >
          <span className="material-symbols-outlined">arrow_back_ios</span>
        </button>
        <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-12">
          Ajustes y Perfil
        </h2>
      </header>

      <main className="flex-1 pb-24">
        {/* ProfileHeader */}
        <section className="flex p-4 pt-2">
          <div className="flex w-full flex-col gap-4 items-center">
            <div className="flex gap-4 flex-col items-center relative">
              <div className="relative">
                <div
                  className="bg-center bg-no-repeat aspect-square bg-cover rounded-full min-h-32 w-32 border-4 border-white dark:border-gray-800 shadow-lg"
                  style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1565435391196-0c797872e1e1?w=200&h=200&fit=crop')",
                  }}
                  alt="Foto de perfil"
                >
                </div>
                <button
                  className="absolute bottom-1 right-1 bg-primary text-white p-2 rounded-full shadow-md flex items-center justify-center border-2 border-white dark:border-gray-800 hover:bg-primary/90 transition-colors"
                  onClick={() => alert('Función de cambiar foto próximamente')}
                >
                  <span className="material-symbols-outlined !text-[20px]">edit</span>
                </button>
              </div>
              <div className="flex flex-col items-center justify-center">
                <p className="text-slate-900 dark:text-white text-[22px] font-bold leading-tight tracking-tight text-center">
                  {user?.nombre || 'Juan Pérez'}
                </p>
                <p className="text-slate-500 dark:text-gray-400 text-base font-medium leading-normal text-center">
                  {getTituloUsuario(user?.nombre)} • ID {userId}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Preferencias Generales */}
        <section className="mt-4 px-4">
          <h3 className="text-slate-900 dark:text-white text-sm font-bold uppercase tracking-wider px-1 pb-3">
            Preferencias de Aplicación
          </h3>
          <div className="bg-white dark:bg-surface-card rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
            {/* ListItem: Notificaciones */}
            <div className="flex items-center gap-4 px-4 min-h-16 justify-between border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-4">
                <div className="text-primary flex items-center justify-center rounded-lg bg-primary/10 shrink-0 size-10">
                  <span className="material-symbols-outlined">notifications</span>
                </div>
                <p className="text-slate-900 dark:text-white text-base font-medium">Notificaciones</p>
              </div>
              <div className="shrink-0">
                <label className="relative flex h-[31px] w-[51px] cursor-pointer items-center rounded-full border-none bg-slate-200 dark:bg-slate-700 p-0.5 transition-all duration-200">
                  <input
                    type="checkbox"
                    checked={notificaciones}
                    onChange={(e) => setNotificaciones(e.target.checked)}
                    className="invisible absolute"
                  />
                  <div className={`h-full w-[27px] rounded-full bg-white shadow-sm transition-all duration-200 ${notificaciones ? 'translate-x-5' : 'translate-x-0'}`}></div>
                  <div className={`absolute inset-0 rounded-full transition-all duration-200 ${notificaciones ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                </label>
              </div>
            </div>

            {/* ListItem: Modo Oscuro */}
            <div className="flex items-center gap-4 px-4 min-h-16 justify-between border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-4">
                <div className="text-primary flex items-center justify-center rounded-lg bg-primary/10 shrink-0 size-10">
                  <span className="material-symbols-outlined">dark_mode</span>
                </div>
                <p className="text-slate-900 dark:text-white text-base font-medium">Modo Oscuro</p>
              </div>
              <div className="shrink-0">
                <label className="relative flex h-[31px] w-[51px] cursor-pointer items-center rounded-full border-none bg-slate-200 dark:bg-slate-700 p-0.5 transition-all duration-200">
                  <input
                    type="checkbox"
                    checked={isDark}
                    onChange={toggleTheme}
                    className="invisible absolute"
                  />
                  <div className={`h-full w-[27px] rounded-full bg-white shadow-sm transition-all duration-200 ${isDark ? 'translate-x-5' : 'translate-x-0'}`}></div>
                  <div className={`absolute inset-0 rounded-full transition-all duration-200 ${isDark ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                </label>
              </div>
            </div>

            {/* ListItem: Idioma */}
            <div className="flex items-center gap-4 px-4 min-h-16 justify-between">
              <div className="flex items-center gap-4">
                <div className="text-primary flex items-center justify-center rounded-lg bg-primary/10 shrink-0 size-10">
                  <span className="material-symbols-outlined">language</span>
                </div>
                <p className="text-slate-900 dark:text-white text-base font-medium">Idioma</p>
              </div>
              <div className="flex items-center gap-2 text-slate-500 dark:text-gray-400">
                <span className="text-sm">Español</span>
                <span className="material-symbols-outlined !text-[20px]">chevron_right</span>
              </div>
            </div>
          </div>
        </section>

        {/* Section: Sincronización Industrial */}
        <section className="mt-8 px-4">
          <h3 className="text-slate-900 dark:text-white text-sm font-bold uppercase tracking-wider px-1 pb-3">
            Sincronización de Datos
          </h3>
          <div className="bg-white dark:bg-surface-card rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700">
            {/* ListItem: Frecuencia de Sincronización */}
            <div className="flex flex-col gap-2 p-4">
              <div className="flex items-center gap-4 mb-2">
                <div className="text-primary flex items-center justify-center rounded-lg bg-primary/10 shrink-0 size-10">
                  <span className="material-symbols-outlined">sync</span>
                </div>
                <div className="flex flex-col">
                  <p className="text-slate-900 dark:text-white text-base font-medium">Frecuencia Offline</p>
                  <p className="text-slate-500 dark:text-gray-400 text-xs">Intervalo de subida de reportes</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2">
                <button
                  onClick={() => setFrecuenciaSync('15m')}
                  className={`text-xs font-bold py-3 rounded-lg transition-colors ${
                    frecuenciaSync === '15m'
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:border-primary border border-transparent'
                  }`}
                >
                  Cada 15m
                </button>
                <button
                  onClick={() => setFrecuenciaSync('1h')}
                  className={`text-xs font-bold py-3 rounded-lg transition-colors ${
                    frecuenciaSync === '1h'
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:border-primary border border-transparent'
                  }`}
                >
                  Cada hora
                </button>
                <button
                  onClick={() => setFrecuenciaSync('manual')}
                  className={`text-xs font-bold py-3 rounded-lg transition-colors ${
                    frecuenciaSync === 'manual'
                      ? 'bg-primary text-white'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white hover:border-primary border border-transparent'
                  }`}
                >
                  Manual
                </button>
              </div>
            </div>

            {/* Sync Status Info */}
            <div className="bg-blue-50 dark:bg-primary/5 p-4 flex items-start gap-3">
              <span className="material-symbols-outlined text-primary !text-[20px] mt-0.5">info</span>
              <p className="text-slate-500 dark:text-gray-400 text-xs leading-relaxed">
                La sincronización automática garantiza que las inspecciones en terreno se respalden incluso con conexión limitada.
              </p>
            </div>
          </div>
        </section>

        {/* Logout Section */}
        <section className="mt-8 px-4 flex flex-col gap-4">
          <button
            onClick={handleCerrarSesion}
            className="flex items-center justify-center gap-2 w-full py-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 font-bold rounded-xl border border-red-100 dark:border-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
          >
            <span className="material-symbols-outlined">logout</span>
            Cerrar Sesión
          </button>
        </section>
      </main>

      {/* Fixed Action Bar */}
      <footer className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/80 dark:bg-surface-card/80 backdrop-blur-md p-4 border-t border-slate-200 dark:border-slate-700">
        <button
          onClick={handleGuardarCambios}
          disabled={loading}
          className="flex w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl h-14 px-4 bg-primary text-white text-base font-bold leading-normal tracking-wide shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Guardando...</span>
            </div>
          ) : (
            <span className="truncate">Guardar Cambios</span>
          )}
        </button>
      </footer>
    </div>
  )
}

export default AjustesPage
