import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabaseService } from '../services/supabaseService'
import { BottomNavigation } from '../components/layout/BottomNavigation'

type EstadoMantenimiento = 'todos' | 'en_proceso' | 'listos'

interface MantenimientoCard {
  id: string
  estado: 'en_proceso' | 'listo_pruebas' | 'completado'
  cilindroId: string
  cliente: string
  progreso: number
  etapa_actual: 'recepcion' | 'pruebas_presion' | 'peritaje' | 'completado'
}

interface ResumenSemanal {
  cilindrosListos: number
  promedioDias: number
}

function MonitoreoPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [filtro, setFiltro] = useState<EstadoMantenimiento>('todos')
  const [mantenimientos, setMantenimientos] = useState<MantenimientoCard[]>([])
  const [resumen, setResumen] = useState<ResumenSemanal>({ cilindrosListos: 0, promedioDias: 0 })

  useEffect(() => {
    cargarDatos()
  }, [])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      const data = await supabaseService.getMantenimientosActivos()
      setMantenimientos(data)
      setResumen(await supabaseService.getResumenSemanal())
    } catch (error) {
      console.error('Error cargando monitoreo:', error)
    } finally {
      setLoading(false)
    }
  }

  const getEstadoLabel = (estado: MantenimientoCard['estado']) => {
    switch (estado) {
      case 'listo_pruebas':
        return 'Listo para Pruebas'
      case 'en_proceso':
        return 'En Proceso'
      case 'completado':
        return 'Completado'
    }
  }

  const getEstadoColor = (estado: MantenimientoCard['estado']) => {
    switch (estado) {
      case 'listo_pruebas':
        return 'bg-success/10 text-success'
      case 'en_proceso':
        return 'bg-neutral-gray/10 text-neutral-gray'
      case 'completado':
        return 'bg-primary/10 text-primary'
    }
  }

  const getIconoEstado = (estado: MantenimientoCard['estado']) => {
    switch (estado) {
      case 'listo_pruebas':
        return 'settings_input_component'
      case 'en_proceso':
        return 'build'
      case 'completado':
        return 'check_circle'
    }
  }

  const mantenimientosFiltrados = mantenimientos.filter(m => {
    if (filtro === 'todos') return true
    if (filtro === 'en_proceso') return m.estado === 'en_proceso'
    if (filtro === 'listos') return m.estado === 'listo_pruebas' || m.estado === 'completado'
    return true
  })

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24 max-w-md mx-auto">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center p-4 justify-between">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary dark:text-white" style={{ fontSize: '28px' }}>
              engineering
            </span>
            <h1 className="text-xl font-bold tracking-tight text-primary dark:text-white">Vignola</h1>
          </div>
          <div className="flex gap-2">
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">search</span>
            </button>
            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <span className="material-symbols-outlined text-gray-600 dark:text-gray-300">notifications</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="flex-1 w-full max-w-md mx-auto pb-24">
        {/* Section Header */}
        <header className="px-4 pt-6 pb-2">
          <h2 className="text-2xl font-bold leading-tight tracking-tight dark:text-white">Monitoreo de Mantención</h2>
          <p className="text-neutral-gray dark:text-gray-400 text-sm mt-1">Inspección de cilindros hidráulicos activos</p>
        </header>

        {/* Status Filter Chips */}
        <div className="flex gap-3 px-4 py-4 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFiltro('todos')}
            className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full px-5 shadow-sm transition-all ${
              filtro === 'todos'
                ? 'bg-primary text-white'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            <p className="text-sm font-semibold">Todos</p>
          </button>
          <button
            onClick={() => setFiltro('en_proceso')}
            className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full px-5 transition-all ${
              filtro === 'en_proceso'
                ? 'bg-primary text-white'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            <p className="text-sm font-medium">En Proceso</p>
          </button>
          <button
            onClick={() => setFiltro('listos')}
            className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full px-5 transition-all ${
              filtro === 'listos'
                ? 'bg-primary text-white'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            <p className="text-sm font-medium">Listos</p>
          </button>
        </div>

        {/* Maintenance List Section */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="space-y-4 px-4">
            {mantenimientosFiltrados.map((mantenimiento) => (
              <div
                key={mantenimiento.id}
                className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800"
              >
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${getEstadoColor(mantenimiento.estado)}`}>
                        {getEstadoLabel(mantenimiento.estado)}
                      </span>
                      <h3 className="text-xl font-bold mt-2 text-primary dark:text-white">ID: {mantenimiento.cilindroId}</h3>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-primary/5 flex items-center justify-center">
                      <span className="material-symbols-outlined text-primary dark:text-white">{getIconoEstado(mantenimiento.estado)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-neutral-gray text-sm">business</span>
                    <p className="text-neutral-gray dark:text-gray-400 text-sm font-medium">Cliente: {mantenimiento.cliente}</p>
                  </div>

                  {/* Progress Bar Component */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-end">
                      <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Progreso Global</p>
                      <p className="text-lg font-bold text-primary dark:text-blue-400">{mantenimiento.progreso}%</p>
                    </div>
                    <div className="h-2.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-500"
                        style={{ width: `${mantenimiento.progreso}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="mt-5 flex gap-2">
                    <button
                      onClick={() => navigate(`/inspeccion/${mantenimiento.id}/detalles`)}
                      className="flex-1 h-10 bg-primary text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-primary/20"
                    >
                      <span className="material-symbols-outlined text-sm">visibility</span>
                      Ver Detalles
                    </button>
                    {mantenimiento.estado === 'en_proceso' && (
                      <button
                        onClick={() => navigate(`/inspeccion/${mantenimiento.id}/detalles`)}
                        className="w-10 h-10 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-700"
                      >
                        <span className="material-symbols-outlined">more_vert</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {mantenimientosFiltrados.length === 0 && (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600">inbox</span>
                <p className="text-gray-500 dark:text-gray-400 mt-4 font-medium">No hay mantenimientos en esta categoría</p>
              </div>
            )}
          </div>
        )}

        {/* Summary Widget */}
        <div className="mx-4 mt-8 p-6 bg-primary dark:bg-primary/20 rounded-2xl text-white">
          <h4 className="font-bold text-lg mb-4">Resumen Semanal</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 p-3 rounded-xl border border-white/10">
              <p className="text-white/60 text-xs uppercase font-bold mb-1">Cilindros Listos</p>
              <p className="text-2xl font-bold">{resumen.cilindrosListos}</p>
            </div>
            <div className="bg-white/10 p-3 rounded-xl border border-white/10">
              <p className="text-white/60 text-xs uppercase font-bold mb-1">Promedio Días</p>
              <p className="text-2xl font-bold">{resumen.promedioDias}</p>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation Bar */}
      <BottomNavigation />
    </div>
  )
}

export default MonitoreoPage
