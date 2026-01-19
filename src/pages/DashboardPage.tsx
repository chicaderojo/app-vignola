import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { authService } from '../services/api'
import { v4 as uuidv4 } from 'uuid'
import { useTheme } from '../hooks/useTheme'

// Mock data para tareas
const MOCK_TAREAS = [
  {
    id: 'HYD-1102',
    titulo: 'Cilindro Telescópico',
    cliente: 'AgroTech S.A.',
    estado: 'Inspección',
    estadoColor: 'primary',
    fecha: 'Hoy, 14:00',
    ubicacion: 'Taller B',
    progreso: 45
  },
  {
    id: 'HYD-4592',
    titulo: 'Cilindro Doble Efecto',
    cliente: 'Mining Corp',
    estado: 'Mantención',
    estadoColor: 'orange',
    fecha: 'Ayer, 09:30',
    ubicacion: 'Almacén',
    progreso: 30
  },
  {
    id: 'HYD-8821',
    titulo: 'Vástago Cromado',
    cliente: 'TransVial',
    estado: 'Listo',
    estadoColor: 'green',
    fecha: 'Ayer, 16:45',
    ubicacion: 'Taller A',
    progreso: 100
  },
  {
    id: 'HYD-9943',
    titulo: 'Sistema Hidráulico',
    cliente: 'Minera Escondida',
    estado: 'Parámetros',
    estadoColor: 'purple',
    fecha: 'Hoy, 10:15',
    ubicacion: 'Laboratorio',
    progreso: 75
  }
]

function DashboardPage() {
  const navigate = useNavigate()
  const user = authService.getCurrentUser()
  const { isDark, toggleTheme } = useTheme()

  const [syncStatus, setSyncStatus] = useState({ pendiente: false, numero_items: 0, online: true })
  const [activeNav, setActiveNav] = useState('inicio')

  // Verificar estado online al montar
  useEffect(() => {
    verificarEstadoOnline()

    const handleOnline = () => setSyncStatus(prev => ({ ...prev, online: true }))
    const handleOffline = () => setSyncStatus(prev => ({ ...prev, online: false }))

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

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

  const handleCerrarSesion = () => {
    authService.logout()
    window.location.href = '/login'
  }

  const handleVerTareas = () => {
    navigate('/tareas')
  }

  const handleInicio = () => {
    setActiveNav('inicio')
  }

  const handleBuscar = () => {
    navigate('/buscar')
  }

  const handleInventario = () => {
    navigate('/inventario')
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
      </div>

      {/* KPI Stats */}
      <div className="flex overflow-x-auto gap-3 px-4 py-4 w-full hide-scrollbar">
        {/* Pendientes */}
        <div className="flex min-w-[140px] flex-1 flex-col gap-3 rounded-xl p-4 bg-white dark:bg-surface-card border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Pendientes</span>
            <span className="material-symbols-outlined text-orange-500 text-[20px]">schedule</span>
          </div>
          <p className="text-slate-900 dark:text-white text-3xl font-bold">5</p>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-1 rounded-full overflow-hidden">
            <div className="bg-orange-500 h-full w-[45%]"></div>
          </div>
        </div>

        {/* En Progreso */}
        <div className="flex min-w-[140px] flex-1 flex-col gap-3 rounded-xl p-4 bg-white dark:bg-surface-card border border-slate-200 dark:border-slate-700 shadow-sm ring-1 ring-primary/20">
          <div className="flex items-center justify-between">
            <span className="text-primary text-sm font-medium">En Progreso</span>
            <span className="material-symbols-outlined text-primary text-[20px]">pending</span>
          </div>
          <p className="text-slate-900 dark:text-white text-3xl font-bold">2</p>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-1 rounded-full overflow-hidden">
            <div className="bg-primary h-full w-[60%]"></div>
          </div>
        </div>

        {/* Listas */}
        <div className="flex min-w-[140px] flex-1 flex-col gap-3 rounded-xl p-4 bg-white dark:bg-surface-card border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">Listas</span>
            <span className="material-symbols-outlined text-green-500 text-[20px]">check_circle</span>
          </div>
          <p className="text-slate-900 dark:text-white text-3xl font-bold">12</p>
          <div className="w-full bg-slate-100 dark:bg-slate-700 h-1 rounded-full overflow-hidden">
            <div className="bg-green-500 h-full w-[90%]"></div>
          </div>
        </div>
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

          <button
            onClick={handleInventario}
            className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-surface-card border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-surface-dark transition-colors"
          >
            <div className="flex items-center justify-center size-10 rounded-full bg-purple-500/10 text-purple-500">
              <span className="material-symbols-outlined">inventory_2</span>
            </div>
            <span className="font-medium text-sm text-slate-700 dark:text-slate-200">Inventario</span>
          </button>

          <button className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-surface-card border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-surface-dark transition-colors">
            <div className="flex items-center justify-center size-10 rounded-full bg-orange-500/10 text-orange-500">
              <span className="material-symbols-outlined">warning</span>
            </div>
            <span className="font-medium text-sm text-slate-700 dark:text-slate-200">Reportar</span>
          </button>

          <button className="flex items-center gap-3 p-3 rounded-lg bg-white dark:bg-surface-card border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-surface-dark transition-colors">
            <div className="flex items-center justify-center size-10 rounded-full bg-teal-500/10 text-teal-500">
              <span className="material-symbols-outlined">tune</span>
            </div>
            <span className="font-medium text-sm text-slate-700 dark:text-slate-200">Calibrar</span>
          </button>
        </div>
      </div>

      {/* Recent Inspections List */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-slate-900 dark:text-white text-lg font-bold">Mis Tareas</h3>
          <button className="text-primary text-sm font-semibold">Ver todo</button>
        </div>

        <div className="flex flex-col gap-3">
          {MOCK_TAREAS.map((tarea) => (
            <div
              key={tarea.id}
              className={`bg-white dark:bg-surface-card rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden group ${
                tarea.progreso === 100 ? 'opacity-60' : tarea.progreso < 50 ? 'opacity-80' : ''
              }`}
            >
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                tarea.estadoColor === 'primary' ? 'bg-primary' :
                tarea.estadoColor === 'orange' ? 'bg-orange-500' :
                tarea.estadoColor === 'purple' ? 'bg-purple-500' :
                'bg-green-500'
              }`}></div>

              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-mono px-2 py-1 rounded">
                    #{tarea.id}
                  </span>
                  <h4 className="text-slate-900 dark:text-white font-bold mt-2">{tarea.titulo}</h4>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">Cliente: {tarea.cliente}</p>
                </div>
                <span className={`flex items-center gap-1 ${
                  tarea.estadoColor === 'primary' ? 'bg-primary/10 text-primary' :
                  tarea.estadoColor === 'orange' ? 'bg-orange-500/10 text-orange-500' :
                  tarea.estadoColor === 'purple' ? 'bg-purple-500/10 text-purple-500' :
                  'bg-green-500/10 text-green-500'
                } px-2 py-1 rounded text-xs font-bold`}>
                  {tarea.progreso < 100 && (
                    <span className={`size-1.5 rounded-full ${
                      tarea.estadoColor === 'primary' ? 'bg-primary' :
                      tarea.estadoColor === 'orange' ? 'bg-orange-500' :
                      tarea.estadoColor === 'purple' ? 'bg-purple-500' :
                      'bg-green-500'
                    } ${tarea.estado === 'Inspección' ? 'animate-pulse' : ''}`}></span>
                  )}
                  {tarea.progreso === 100 && (
                    <span className="material-symbols-outlined text-[14px]">check</span>
                  )}
                  {tarea.estado}
                </span>
              </div>

              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs">
                  <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                  <span>{tarea.fecha}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs">
                  <span className="material-symbols-outlined text-[16px]">location_on</span>
                  <span>{tarea.ubicacion}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-surface-card/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-700 pb-safe z-50 max-w-md mx-auto">
        <div className="flex justify-around items-center h-16 px-2">
          <button
            onClick={handleVerTareas}
            className={`flex flex-1 flex-col items-center justify-center gap-1 ${
              activeNav === 'inicio' ? 'text-primary' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            } transition-colors`}
          >
            <span className="material-symbols-outlined text-[24px]">dashboard</span>
            <span className="text-[10px] font-medium">Inicio</span>
          </button>

          <button
            onClick={handleBuscar}
            className={`flex flex-1 flex-col items-center justify-center gap-1 ${
              activeNav === 'buscar' ? 'text-primary' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
            } transition-colors`}
          >
            <span className="material-symbols-outlined text-[24px]">search</span>
            <span className="text-[10px] font-medium">Buscar</span>
          </button>

          <button
            onClick={handleVerTareas}
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
