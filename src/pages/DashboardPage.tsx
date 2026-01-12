import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/api'
import { v4 as uuidv4 } from 'uuid'
import { useTheme } from '../hooks/useTheme'
import { supabaseService } from '../services/supabaseService'
import { Inspeccion } from '../types'

function DashboardPage() {
  const navigate = useNavigate()
  const user = authService.getCurrentUser()
  const { isDark, toggleTheme } = useTheme()

  const [syncStatus, setSyncStatus] = useState({ pendiente: false, numero_items: 0, online: true })
  const [activeNav, setActiveNav] = useState('inicio')
  const [inspecciones, setInspecciones] = useState<Inspeccion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalInspecciones: 0,
    inspeccionesPendientes: 0,
    inspeccionesCompletas: 0,
    cilindrosActivos: 0
  })

  // Cargar datos de Supabase al montar
  useEffect(() => {
    cargarDatos()
    verificarEstadoOnline()

    const handleOnline = () => {
      setSyncStatus(prev => ({ ...prev, online: true }))
      cargarDatos()
    }
    const handleOffline = () => setSyncStatus(prev => ({ ...prev, online: false }))

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const cargarDatos = async () => {
    if (!navigator.onLine) {
      console.log('Modo offline - no se cargan datos de Supabase')
      setError('Sin conexión a internet')
      return
    }

    try {
      setLoading(true)
      setError(null)
      console.log('Cargando datos de Supabase...')

      const [inspeccionesData, statsData] = await Promise.all([
        supabaseService.getInspecciones(),
        supabaseService.getDashboardStats()
      ])

      console.log('Datos recibidos:', { inspeccionesData, statsData })
      setInspecciones(inspeccionesData)
      setStats(statsData)
    } catch (error: any) {
      console.error('Error al cargar datos de Supabase:', error)
      setError(error?.message || 'Error al cargar datos')
    } finally {
      setLoading(false)
    }
  }

  // Calcular contadores dinámicos desde Supabase
  const contarInspecciones = () => stats.inspeccionesPendientes
  const contarMantencion = () => Math.floor(stats.totalInspecciones * 0.3) // Estimado
  const contarListas = () => stats.inspeccionesCompletas

  const verificarEstadoOnline = () => {
    setSyncStatus({
      pendiente: false,
      numero_items: 0,
      online: navigator.onLine
    })
  }

  const handleNuevaInspeccion = () => {
    const inspeccionId = uuidv4()
    navigate(`/inspeccion/${inspeccionId}/recepcion`)
  }

  const handleVerHistorial = () => {
    navigate('/historial')
  }

  const handleVerInspeccionesPendientes = () => {
    navigate('/inspecciones-pendientes')
  }

  const handleVerTrabajosListos = () => {
    navigate('/trabajos-listos')
  }

  const handleVerPruebas = () => {
    // Navegar a una inspección pendiente o crear una nueva para pruebas
    const inspeccionPendiente = inspecciones.find(
      insp => insp.estado_inspeccion === 'borrador' &&
               (insp as any).etapas_completadas?.includes('peritaje')
    )

    if (inspeccionPendiente) {
      navigate(`/inspeccion/${inspeccionPendiente.id}/pruebas`)
    } else {
      // Si no hay inspección en etapa de pruebas, crear una nueva
      const inspeccionId = uuidv4()
      navigate(`/inspeccion/${inspeccionId}/pruebas`)
    }
  }

  const handleCerrarSesion = () => {
    authService.logout()
    window.location.href = '/login'
  }

  return (
    <div className="relative flex h-auto min-h-screen w-full flex-col overflow-x-hidden max-w-md mx-auto bg-background-light dark:bg-background-dark pb-24">

      {/* Header */}
      <header className="sticky top-0 z-30 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center p-4 justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 ring-2 ring-primary/20"
                style={{
                  backgroundImage: "url('https://images.unsplash.com/photo-1565435391196-0c797872e1e1?w=100&h=100&fit=crop')",
                }}>
              </div>
              <div className={`absolute bottom-0 right-0 size-3 rounded-full border-2 border-background-dark ${
                syncStatus.online ? 'bg-green-500' : 'bg-yellow-500'
              }`}></div>
            </div>
            <div className="flex flex-col">
              <h2 className="text-sm font-semibold leading-tight text-slate-900 dark:text-white">
                {user?.nombre || 'Juan Pérez'}
              </h2>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {user?.rol === 'mecanico' ? 'Mecánico Senior' : 'Supervisor'}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2">
            {/* Sync Status */}
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
              syncStatus.online ? 'bg-green-500/10' : 'bg-yellow-500/10'
            }`}>
              <span className={`material-symbols-outlined text-[14px] ${
                syncStatus.online ? 'text-green-500' : 'text-yellow-500'
              }`}>
                {syncStatus.online ? 'cloud_done' : 'cloud_off'}
              </span>
              <span className={`text-[10px] font-medium uppercase tracking-wide ${
                syncStatus.online ? 'text-green-500' : 'text-yellow-500'
              }`}>
                {syncStatus.online ? 'Online' : 'Offline'}
              </span>
            </div>
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center rounded-full size-10 bg-transparent text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-surface-dark transition-colors"
              aria-label="Cambiar tema"
            >
              <span className="material-symbols-outlined">
                {isDark ? 'light_mode' : 'dark_mode'}
              </span>
            </button>
            <button className="flex items-center justify-center rounded-full size-10 bg-transparent text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-surface-dark transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
          </div>
        </div>
      </header>

      {/* Welcome Message */}
      <div className="px-4 pt-6 pb-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Turno de <span className="text-primary">Mañana</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Aquí tienes un resumen de tu actividad.
        </p>

        {/* Error message */}
        {error && (
          <div className="mt-3 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-red-500 text-[20px]">error</span>
              <div className="flex-1">
                <p className="text-red-600 dark:text-red-400 text-sm font-medium">Error de conexión</p>
                <p className="text-red-500/70 dark:text-red-400/70 text-xs">{error}</p>
              </div>
              <button
                onClick={cargarDatos}
                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {/* Debug info */}
        {!loading && !error && stats.totalInspecciones === 0 && (
          <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-yellow-500 text-[20px]">warning</span>
              <div className="flex-1">
                <p className="text-yellow-600 dark:text-yellow-400 text-sm font-medium">No se encontraron datos</p>
                <p className="text-yellow-500/70 dark:text-yellow-400/70 text-xs">
                  Verifica que las variables de entorno de Supabase estén configuradas correctamente
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* KPI Stats */}
      <div className="flex overflow-x-auto gap-3 px-4 py-4 w-full hide-scrollbar">
        {/* Inspección */}
        <button
          onClick={handleVerInspeccionesPendientes}
          className="flex min-w-[140px] flex-1 flex-col gap-3 rounded-xl p-4 bg-white dark:bg-surface-card border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-surface-dark active:scale-[0.98] transition-all cursor-pointer text-left"
        >
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Inspección</span>
            <span className="material-symbols-outlined text-orange-500 text-[20px]">schedule</span>
          </div>
          <p className="text-slate-900 dark:text-white text-3xl font-bold">{contarInspecciones()}</p>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-1 rounded-full overflow-hidden">
            <div className="bg-orange-500 h-full w-[45%]"></div>
          </div>
        </button>

        {/* Mantención */}
        <div className="flex min-w-[140px] flex-1 flex-col gap-3 rounded-xl p-4 bg-white dark:bg-surface-card border border-slate-200 dark:border-slate-700 shadow-sm ring-1 ring-primary/20">
          <div className="flex items-center justify-between">
            <span className="text-primary text-sm font-medium">Mantención</span>
            <span className="material-symbols-outlined text-primary text-[20px]">build</span>
          </div>
          <p className="text-slate-900 dark:text-white text-3xl font-bold">{contarMantencion()}</p>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-1 rounded-full overflow-hidden">
            <div className="bg-primary h-full w-[60%]"></div>
          </div>
        </div>

        {/* Listas */}
        <button
          onClick={handleVerTrabajosListos}
          className="flex min-w-[140px] flex-1 flex-col gap-3 rounded-xl p-4 bg-white dark:bg-surface-card border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-surface-dark active:scale-[0.98] transition-all cursor-pointer text-left"
        >
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Finalizados</span>
            <span className="material-symbols-outlined text-green-500 text-[20px]">check_circle</span>
          </div>
          <p className="text-slate-900 dark:text-white text-3xl font-bold">{contarListas()}</p>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-1 rounded-full overflow-hidden">
            <div className="bg-green-500 h-full w-[90%]"></div>
          </div>
        </button>
      </div>

      {/* Primary Action */}
      <div className="px-4 py-2">
        <button
          onClick={handleNuevaInspeccion}
          className="w-full flex items-center justify-between bg-primary hover:bg-primary/90 active:bg-primary/80 text-white rounded-xl p-4 shadow-lg shadow-primary/20 transition-all group"
        >
          <span className="font-bold text-lg">Nueva Inspección</span>
          <div className="bg-white/20 rounded-lg p-2 group-hover:bg-white/30 transition-colors">
            <span className="material-symbols-outlined text-[28px]">add</span>
          </div>
        </button>
      </div>

      {/* Quick Actions Grid */}
      <div className="px-4 pt-6">
        <h3 className="text-slate-900 dark:text-white text-lg font-bold mb-3">Acciones Rápidas</h3>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleVerHistorial}
            className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-surface-card border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-surface-dark transition-colors"
          >
            <div className="flex items-center justify-center size-10 rounded-full bg-blue-500/10 text-blue-500">
              <span className="material-symbols-outlined">history</span>
            </div>
            <span className="font-medium text-sm text-slate-700 dark:text-slate-200">Historial</span>
          </button>

          <button className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-surface-card border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-surface-dark transition-colors">
            <div className="flex items-center justify-center size-10 rounded-full bg-purple-500/10 text-purple-500">
              <span className="material-symbols-outlined">inventory_2</span>
            </div>
            <span className="font-medium text-sm text-slate-700 dark:text-slate-200">Inventario</span>
          </button>

          <button className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-surface-card border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-surface-dark transition-colors">
            <div className="flex items-center justify-center size-10 rounded-full bg-orange-500/10 text-orange-500">
              <span className="material-symbols-outlined">refresh</span>
            </div>
            <span className="font-medium text-sm text-slate-700 dark:text-slate-200">Reingresos</span>
          </button>

          <button
            onClick={handleVerPruebas}
            className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-surface-card border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-surface-dark transition-colors"
          >
            <div className="flex items-center justify-center size-10 rounded-full bg-teal-500/10 text-teal-500">
              <span className="material-symbols-outlined">speed</span>
            </div>
            <span className="font-medium text-sm text-slate-700 dark:text-slate-200">Pruebas</span>
          </button>
        </div>
      </div>

      {/* Recent Inspections List */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-slate-900 dark:text-white text-lg font-bold">Inspecciones Recientes</h3>
          <button onClick={handleVerHistorial} className="text-primary text-sm font-semibold">Ver todo</button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {inspecciones.slice(0, 5).map((inspeccion) => {
              const estadoColor = inspeccion.estado_inspeccion === 'borrador' ? 'primary' :
                                  inspeccion.estado_inspeccion === 'completa' ? 'orange' : 'green'
              const estadoLabel = inspeccion.estado_inspeccion === 'borrador' ? 'En Progreso' :
                                 inspeccion.estado_inspeccion === 'completa' ? 'Completa' : 'Sincronizada'
              const fecha = new Date(inspeccion.created_at).toLocaleDateString('es-CL', {
                day: 'numeric',
                month: 'short'
              })

              return (
                <div
                  key={inspeccion.id}
                  onClick={() => navigate(`/inspeccion/${inspeccion.id}/detalles`)}
                  className={`bg-white dark:bg-surface-card rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group cursor-pointer hover:border-primary/50 transition-colors ${
                    inspeccion.estado_inspeccion === 'sincronizada' ? 'opacity-60' : ''
                  }`}
                >
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                    estadoColor === 'primary' ? 'bg-primary' :
                    estadoColor === 'orange' ? 'bg-orange-500' : 'bg-green-500'
                  }`}></div>

                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-mono px-2 py-1 rounded">
                        #{(inspeccion.cilindro as any)?.id_codigo || inspeccion.cilindro_id}
                      </span>
                      <h4 className="text-slate-900 dark:text-white font-bold mt-2">
                        Cilindro {(inspeccion.cilindro as any)?.tipo || 'Oleohidráulico'}
                      </h4>
                      <p className="text-slate-500 dark:text-slate-400 text-sm">
                        {(inspeccion.cilindro as any)?.fabricante || 'Rexroth'} • {(inspeccion.cilindro as any)?.diametro_camisa || 'Ø80'}
                      </p>
                    </div>
                    <span className={`flex items-center gap-1 ${
                      estadoColor === 'primary' ? 'bg-primary/10 text-primary' :
                      estadoColor === 'orange' ? 'bg-orange-500/10 text-orange-500' :
                      'bg-green-500/10 text-green-500'
                    } px-2 py-1 rounded text-xs font-bold whitespace-nowrap`}>
                      {inspeccion.estado_inspeccion !== 'sincronizada' && (
                        <span className={`size-1.5 rounded-full ${
                          estadoColor === 'primary' ? 'bg-primary' :
                          estadoColor === 'orange' ? 'bg-orange-500' : 'bg-green-500'
                        } ${inspeccion.estado_inspeccion === 'borrador' ? 'animate-pulse' : ''}`}></span>
                      )}
                      {estadoLabel}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs">
                      <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                      <span>{fecha}</span>
                    </div>
                    {inspeccion.presion_prueba > 0 && (
                      <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs">
                        <span className="material-symbols-outlined text-[16px]">compress</span>
                        <span>{inspeccion.presion_prueba} bar</span>
                      </div>
                    )}
                    {(inspeccion.fuga_interna || inspeccion.fuga_externa) && (
                      <div className="flex items-center gap-1 text-red-500 text-xs">
                        <span className="material-symbols-outlined text-[16px]">warning</span>
                        <span>Fuga</span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}

            {inspecciones.length === 0 && (
              <div className="text-center py-8">
                <span className="material-symbols-outlined text-4xl text-slate-300 dark:text-slate-600">inbox</span>
                <p className="text-slate-500 dark:text-slate-400 mt-2">No hay inspecciones registradas</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-surface-card/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-700 pb-safe z-50 max-w-md mx-auto">
        <div className="flex justify-around items-center h-16 px-2">
          <button
            onClick={() => setActiveNav('inicio')}
            className={`flex flex-1 flex-col items-center justify-center gap-1 ${
              activeNav === 'inicio' ? 'text-primary' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            } transition-colors`}
          >
            <span className="material-symbols-outlined text-[24px]">dashboard</span>
            <span className="text-[10px] font-medium">Inicio</span>
          </button>

          <button
            onClick={() => setActiveNav('buscar')}
            className={`flex flex-1 flex-col items-center justify-center gap-1 ${
              activeNav === 'buscar' ? 'text-primary' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            } transition-colors`}
          >
            <span className="material-symbols-outlined text-[24px]">search</span>
            <span className="text-[10px] font-medium">Buscar</span>
          </button>

          <button
            onClick={() => {
              setActiveNav('tareas')
              handleVerInspeccionesPendientes()
            }}
            className={`flex flex-1 flex-col items-center justify-center gap-1 ${
              activeNav === 'tareas' ? 'text-primary' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            } transition-colors`}
          >
            <div className="relative">
              <span className="material-symbols-outlined text-[24px]">assignment</span>
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-red-500 text-[8px] text-white"></span>
            </div>
            <span className="text-[10px] font-medium">Tareas</span>
          </button>

          <button
            onClick={handleCerrarSesion}
            className={`flex flex-1 flex-col items-center justify-center gap-1 ${
              activeNav === 'ajustes' ? 'text-primary' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            } transition-colors`}
          >
            <span className="material-symbols-outlined text-[24px]">settings</span>
            <span className="text-[10px] font-medium">Ajustes</span>
          </button>
        </div>
      </nav>
    </div>
  )
}

export default DashboardPage
