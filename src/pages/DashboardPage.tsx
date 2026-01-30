import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/api'
import { v4 as uuidv4 } from 'uuid'
import { useTheme } from '../hooks/useTheme'
import { supabaseService } from '../services/supabaseService'
import { Inspeccion } from '../types'
import { BottomNavigation } from '../components/layout/BottomNavigation'
import { InspeccionesModal } from '../components/modals/InspeccionesModal'
import { MantencionesModal } from '../components/modals/MantencionesModal'

function DashboardPage() {
  const navigate = useNavigate()
  const user = authService.getCurrentUser()
  const { isDark, toggleTheme } = useTheme()

  const [syncStatus, setSyncStatus] = useState({ pendiente: false, numero_items: 0, online: true })
  const [inspecciones, setInspecciones] = useState<Inspeccion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    totalInspecciones: 0,
    inspeccionesPendientes: 0,
    inspeccionesEnMantencion: 0,
    inspeccionesCompletas: 0,
    cilindrosActivos: 0
  })
  const [showInspeccionesModal, setShowInspeccionesModal] = useState(false)
  const [showMantencionesModal, setShowMantencionesModal] = useState(false)

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
  const contarMantencion = () => stats.inspeccionesEnMantencion || 0
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
    setShowInspeccionesModal(true)
  }

  const handleVerTrabajosListos = () => {
    navigate('/trabajos-listos')
  }

  const handleVerReingresos = () => {
    navigate('/trabajos-listos')
  }

  const handleVerMantencion = () => {
    setShowMantencionesModal(true)
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

  const handleInventario = () => {
    navigate('/inventario')
  }

  // Función para obtener el título del usuario según su rol
  const getTituloUsuario = (rol: string | undefined): string => {
    switch (rol) {
      case 'jefe_maestranza':
        return 'Jefe de Taller'
      case 'jefe_sucursal':
        return 'Jefe de Sucursal'
      case 'administrador':
        return 'Administrador'
      case 'mecanico':
      default:
        return 'Mecánico Senior'
    }
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
                  backgroundImage: user?.profilePhoto
                    ? `url('${user.profilePhoto}')`
                    : "url('https://images.unsplash.com/photo-1565435391196-0c797872e1e1?w=100&h=100&fit=crop')",
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
                {getTituloUsuario(user?.rol)}
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
            <div className="bg-blue-500 h-full w-[45%]"></div>
          </div>
        </button>

        {/* Mantención */}
        <button
          onClick={handleVerMantencion}
          className="flex min-w-[140px] flex-1 flex-col gap-3 rounded-xl p-4 bg-white dark:bg-surface-card border border-slate-200 dark:border-slate-700 shadow-sm hover:bg-slate-50 dark:hover:bg-surface-dark active:scale-[0.98] transition-all cursor-pointer text-left ring-1 ring-primary/20"
        >
          <div className="flex items-center justify-between">
            <span className="text-primary text-sm font-medium">Mantención</span>
            <span className="material-symbols-outlined text-primary text-[20px]">build</span>
          </div>
          <p className="text-slate-900 dark:text-white text-3xl font-bold">{contarMantencion()}</p>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-1 rounded-full overflow-hidden">
            <div className="bg-primary h-full w-[60%]"></div>
          </div>
        </button>

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

      {/* Primary Actions */}
      <div className="px-4 py-2 space-y-2">
        <button
          onClick={handleNuevaInspeccion}
          className="w-full flex items-center justify-between bg-primary hover:bg-primary/90 active:bg-primary/80 text-white rounded-xl p-4 shadow-lg shadow-primary/20 transition-all group"
        >
          <span className="font-bold text-lg">Nueva Inspección</span>
          <div className="bg-white/20 rounded-lg p-2 group-hover:bg-white/30 transition-colors">
            <span className="material-symbols-outlined text-[28px]">add</span>
          </div>
        </button>

        <button
          onClick={() => navigate('/mantencion-pendiente')}
          className="w-full flex items-center justify-between bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 active:from-emerald-700 active:to-green-800 text-white rounded-xl p-4 shadow-lg shadow-emerald-500/30 transition-all group"
        >
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[28px]">build</span>
            <span className="font-bold text-lg block">Nueva Mantención</span>
          </div>
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

          <button
            onClick={handleInventario}
            className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-surface-card border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-surface-dark transition-colors"
          >
            <div className="flex items-center justify-center size-10 rounded-full bg-purple-500/10 text-purple-500">
              <span className="material-symbols-outlined">inventory_2</span>
            </div>
            <span className="font-medium text-sm text-slate-700 dark:text-slate-200">Inventario</span>
          </button>

          <button
            onClick={handleVerReingresos}
            className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-surface-card border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-surface-dark transition-colors"
          >
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

      {/* Bottom Navigation */}
      <BottomNavigation notificationCount={stats.inspeccionesPendientes} />

      {/* Modals */}
      <InspeccionesModal
        isOpen={showInspeccionesModal}
        onClose={() => setShowInspeccionesModal(false)}
      />
      <MantencionesModal
        isOpen={showMantencionesModal}
        onClose={() => setShowMantencionesModal(false)}
      />
    </div>
  )
}

export default DashboardPage
