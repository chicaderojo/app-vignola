import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabaseService } from '../services/supabaseService'

type FiltroType = 'todos' | 'en-proceso' | 'listos'

interface Mantencion {
  id: string
  codigo: string
  cliente: string
  estado: 'listo-pruebas' | 'en-proceso'
  progreso: number
  icono: string
}

function MantencionPage() {
  const navigate = useNavigate()

  const [filtroActivo, setFiltroActivo] = useState<FiltroType>('todos')
  const [mantenciones, setMantenciones] = useState<Mantencion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar inspecciones en estado de borrador (en mantención)
  useEffect(() => {
    cargarMantenciones()
  }, [])

  const cargarMantenciones = async () => {
    try {
      setLoading(true)
      setError(null)

      // Cargar inspecciones en borrador (en proceso de mantención)
      const datos = await supabaseService.getInspeccionesByEstado('borrador')

      // Transformar al formato de Mantencion
      const listaTransformada: Mantencion[] = datos.map((insp: any) => {
        const cilindro = insp.cilindro as any

        // Calcular progreso basado en etapas completadas
        const etapas = (insp as any).etapas_completadas || []
        let progreso = 0
        if (etapas.includes('recepcion')) progreso += 33
        if (etapas.includes('peritaje')) progreso += 33
        if (etapas.includes('pruebas')) progreso += 34

        // Determinar estado
        const estado = progreso >= 100 ? 'listo-pruebas' : 'en-proceso'

        // Determinar icono basado en progreso
        let icono = 'precision_manufacturing'
        if (progreso >= 66) icono = 'settings_input_component'
        else if (progreso >= 33) icono = 'build'

        return {
          id: insp.id,
          codigo: cilindro?.id_codigo || insp.cilindro_id || `VIN-${Math.floor(Math.random() * 9000) + 1000}`,
          cliente: cilindro?.cliente?.nombre || 'Cliente',
          estado,
          progreso: Math.min(progreso, 100),
          icono
        }
      })

      setMantenciones(listaTransformada)
    } catch (err: any) {
      console.error('Error cargando mantenciones:', err)
      setError(err.message || 'Error al cargar mantenciones')
    } finally {
      setLoading(false)
    }
  }

  const handleVerDetalles = (mantencionId: string) => {
    navigate(`/inspeccion/${mantencionId}/peritaje`)
  }

  const handleActualizarEstado = (mantencionId: string) => {
    navigate(`/inspeccion/${mantencionId}/peritaje`)
  }

  // Filtrar mantenciones según el filtro activo
  const mantencionesFiltradas = mantenciones.filter(m => {
    if (filtroActivo === 'todos') return true
    if (filtroActivo === 'en-proceso') return m.estado === 'en-proceso'
    if (filtroActivo === 'listos') return m.estado === 'listo-pruebas'
    return true
  })

  // Mock data for summary widget
  const resumenSemanal = {
    cilindrosListos: mantenciones.filter(m => m.estado === 'listo-pruebas').length,
    promedioDias: 4.2
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24">
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center p-4 justify-between max-w-md mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <span className="material-symbols-outlined text-primary dark:text-white">arrow_back</span>
            </button>
            <span className="material-symbols-outlined text-primary dark:text-white" style={{ fontSize: '28px' }}>engineering</span>
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
            onClick={() => setFiltroActivo('todos')}
            className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full px-5 shadow-sm transition-colors ${
              filtroActivo === 'todos'
                ? 'bg-primary text-white'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            <p className="text-sm font-semibold">Todos</p>
          </button>
          <button
            onClick={() => setFiltroActivo('en-proceso')}
            className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full px-5 transition-colors ${
              filtroActivo === 'en-proceso'
                ? 'bg-primary text-white'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            <p className="text-sm font-medium">En Proceso</p>
          </button>
          <button
            onClick={() => setFiltroActivo('listos')}
            className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full px-5 transition-colors ${
              filtroActivo === 'listos'
                ? 'bg-primary text-white'
                : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300'
            }`}
          >
            <p className="text-sm font-medium">Listos</p>
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-slate-500 dark:text-slate-400">Cargando mantenciones...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <span className="material-symbols-outlined text-6xl text-red-500 mb-4">error</span>
            <p className="text-red-600 dark:text-red-400 text-center mb-4">{error}</p>
            <button
              onClick={cargarMantenciones}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Maintenance List Section */}
        {!loading && !error && (
          <div className="space-y-4 px-4">
            {mantencionesFiltradas.length === 0 ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600">search_off</span>
                <p className="text-gray-500 dark:text-gray-400 mt-4">No hay mantenciones en esta categoría</p>
              </div>
            ) : (
              mantencionesFiltradas.map((mantencion) => (
                <div key={mantencion.id} className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm border border-gray-100 dark:border-gray-800">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                          mantencion.estado === 'listo-pruebas'
                            ? 'bg-success/10 text-success'
                            : 'bg-neutral-gray/10 text-neutral-gray'
                        }`}>
                          {mantencion.estado === 'listo-pruebas' ? 'Listo para Pruebas' : 'En Proceso'}
                        </span>
                        <h3 className="text-xl font-bold mt-2 text-primary dark:text-white">ID: {mantencion.codigo}</h3>
                      </div>
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        mantencion.estado === 'listo-pruebas' ? 'bg-primary/5' : 'bg-gray-100 dark:bg-gray-800'
                      }`}>
                        <span className={`material-symbols-outlined ${
                          mantencion.estado === 'listo-pruebas' ? 'text-primary dark:text-white' : 'text-gray-400'
                        }`}>{mantencion.icono}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <span className="material-symbols-outlined text-neutral-gray text-sm">business</span>
                      <p className="text-neutral-gray dark:text-gray-400 text-sm font-medium">Cliente: {mantencion.cliente}</p>
                    </div>

                    {/* Progress Bar Component */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-end">
                        <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Progreso Global</p>
                        <p className="text-lg font-bold text-primary dark:text-blue-400">{mantencion.progreso}%</p>
                      </div>
                      <div className="h-2.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            mantencion.progreso >= 100
                              ? 'bg-primary'
                              : mantencion.progreso >= 66
                              ? 'bg-primary/60'
                              : 'bg-primary/40'
                          }`}
                          style={{ width: `${mantencion.progreso}%` }}
                        ></div>
                      </div>
                    </div>

                    <div className="mt-5 flex gap-2">
                      {mantencion.estado === 'listo-pruebas' ? (
                        <>
                          <button
                            onClick={() => handleVerDetalles(mantencion.id)}
                            className="flex-1 h-10 bg-primary text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 shadow-md shadow-primary/20"
                          >
                            <span className="material-symbols-outlined text-sm">visibility</span>
                            Ver Detalles
                          </button>
                          <button className="w-10 h-10 bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-lg flex items-center justify-center border border-gray-200 dark:border-gray-700">
                            <span className="material-symbols-outlined">more_vert</span>
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleActualizarEstado(mantencion.id)}
                          className="flex-1 h-10 bg-primary/10 text-primary dark:bg-primary/20 dark:text-blue-300 rounded-lg font-bold text-sm flex items-center justify-center gap-2"
                        >
                          Actualizar Estado
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Summary Widget */}
        {!loading && !error && mantenciones.length > 0 && (
          <div className="mx-4 mt-8 p-6 bg-primary dark:bg-primary/20 rounded-2xl text-white">
            <h4 className="font-bold text-lg mb-4">Resumen Semanal</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                <p className="text-white/60 text-xs uppercase font-bold mb-1">Cilindros Listos</p>
                <p className="text-2xl font-bold">{resumenSemanal.cilindrosListos}</p>
              </div>
              <div className="bg-white/10 p-3 rounded-xl border border-white/10">
                <p className="text-white/60 text-xs uppercase font-bold mb-1">Promedio Dias</p>
                <p className="text-2xl font-bold">{resumenSemanal.promedioDias}</p>
              </div>
            </div>
          </div>
        )}
      </main>

      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}

export default MantencionPage
