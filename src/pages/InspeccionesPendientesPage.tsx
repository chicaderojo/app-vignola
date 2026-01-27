import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/dexie'
import { supabaseService } from '../services/supabaseService'
import { Inspeccion } from '../types'
import { v4 as uuidv4 } from 'uuid'
import { BottomNavigation } from '../components/layout/BottomNavigation'

type Priority = 'normal' | 'urgent'
type Status = 'borrador' | 'recepcion' | 'peritaje' | 'taller' | 'pruebas' | 'completado'

interface InspeccionPendiente {
  id: string
  codigo: string
  cliente: string
  equipo: string
  prioridad: Priority
  estado: Status
  fecha: string
  progreso: number
  etapas_completadas: string[]
  estado_inspeccion?: string // Para identificar inspecciones de Supabase
}

function InspeccionesPendientesPage() {
  const navigate = useNavigate()

  const [filtroActivo, setFiltroActivo] = useState<'todos' | 'peritaje' | 'pruebas' | 'urgentes'>('todos')
  const [busqueda, setBusqueda] = useState('')
  const [online, setOnline] = useState(navigator.onLine)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Obtener inspecciones locales con Dexie React Hooks
  const inspeccionesLocales = useLiveQuery(
    () => db.inspeccionesLocales.toArray(),
    []
  )

  // Estado para inspecciones combinadas (locales + Supabase)
  const [inspecciones, setInspecciones] = useState<InspeccionPendiente[]>([])
  const [inspeccionesSupabase, setInspeccionesSupabase] = useState<Inspeccion[]>([])

  // Verificar estado de conexión
  useEffect(() => {
    const handleOnline = () => {
      setOnline(true)
      cargarDatosDesdeSupabase()
    }
    const handleOffline = () => setOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Cargar inspecciones desde Supabase al montar
  useEffect(() => {
    if (online) {
      cargarDatosDesdeSupabase()
    } else {
      setLoading(false)
    }
  }, [])

  // Combinar inspecciones locales y de Supabase
  useEffect(() => {
    const listaCombinada: InspeccionPendiente[] = []

    // 1. Agregar inspecciones de Supabase (solo borradores y completas)
    inspeccionesSupabase.forEach((insp: any) => {
      const cilindro = insp.cilindro as any
      const etapas = (insp as any).etapas_completadas || []
      const progreso = etapas.length > 0 ? Math.round((etapas.length / 4) * 100) : 25

      listaCombinada.push({
        id: insp.id,
        codigo: cilindro?.id_codigo || insp.cilindro_id,
        cliente: cilindro?.cliente?.nombre || 'Cliente',
        equipo: `${cilindro?.tipo || 'Cilindro'} - ${cilindro?.fabricante || 'Fabricante'}`,
        prioridad: 'normal',
        estado: insp.estado_inspeccion === 'borrador' ? 'borrador' : 'completado',
        fecha: new Date(insp.created_at).toLocaleDateString('es-CL'),
        progreso,
        etapas_completadas: etapas,
        estado_inspeccion: insp.estado_inspeccion
      })
    })

    // 2. Agregar inspecciones locales (IndexedDB)
    if (inspeccionesLocales) {
      inspeccionesLocales.forEach((insp: any) => {
        // Evitar duplicados si ya existe en Supabase
        if (!listaCombinada.find(item => item.id === insp.id)) {
          const etapas = insp.etapas_completadas || []
          const progreso = calcularProgreso(etapas)

          listaCombinada.push({
            id: insp.id,
            codigo: insp.codigo || `CH-${insp.id.slice(-4)}`,
            cliente: insp.cliente || 'Cliente local',
            equipo: insp.equipo || 'Equipo no especificado',
            prioridad: insp.prioridad || 'normal',
            estado: determinarEstado(etapas),
            fecha: new Date(insp.fecha_creacion).toLocaleDateString('es-CL'),
            progreso,
            etapas_completadas: etapas
          })
        }
      })
    }

    setInspecciones(listaCombinada)
  }, [inspeccionesSupabase, inspeccionesLocales])

  const cargarDatosDesdeSupabase = async () => {
    if (!online) return

    try {
      setLoading(true)
      setError(null)
      console.log('Cargando inspecciones pendientes desde Supabase...')

      // Cargar inspecciones en estado borrador
      const datos = await supabaseService.getInspeccionesByEstado('borrador')

      console.log('Inspecciones pendientes de Supabase:', datos)
      setInspeccionesSupabase(datos)
    } catch (err: any) {
      console.error('Error cargando inspecciones desde Supabase:', err)
      setError(err.message || 'Error al cargar inspecciones')
    } finally {
      setLoading(false)
    }
  }

  const calcularProgreso = (etapas: string[]): number => {
    const totalEtapas = 4 // recepcion, peritaje, pruebas, finalizado
    const completadas = etapas.length
    return Math.round((completadas / totalEtapas) * 100)
  }

  const determinarEstado = (etapas: string[]): Status => {
    if (etapas.includes('finalizado')) return 'completado'
    if (etapas.includes('pruebas')) return 'pruebas'
    if (etapas.includes('peritaje')) return 'taller'
    if (etapas.includes('recepcion')) return 'peritaje'
    return 'recepcion'
  }

  const handleNuevaInspeccion = () => {
    const inspeccionId = uuidv4()
    navigate(`/inspeccion/${inspeccionId}/recepcion`)
  }

  const handleContinuarInspeccion = async (inspeccionId: string, origen: 'local' | 'supabase' | 'auto' = 'auto') => {
    try {
      let etapas: string[] = []

      if (origen === 'auto') {
        // Detectar origen automáticamente: intentar Supabase primero
        try {
          const inspeccionSupabase = await supabaseService.getInspeccionById(inspeccionId)
          if (inspeccionSupabase) {
            etapas = (inspeccionSupabase as any).etapas_completadas || []
          } else {
            // Si no está en Supabase, buscar en IndexedDB
            const inspeccionLocal = await db.inspeccionesLocales.get(inspeccionId) as any
            if (inspeccionLocal) {
              etapas = inspeccionLocal.etapas_completadas || []
            }
          }
        } catch (e) {
          // Error al buscar en Supabase, intentar IndexedDB
          const inspeccionLocal = await db.inspeccionesLocales.get(inspeccionId) as any
          if (inspeccionLocal) {
            etapas = inspeccionLocal.etapas_completadas || []
          }
        }
      } else if (origen === 'supabase') {
        const inspeccion = await supabaseService.getInspeccionById(inspeccionId)
        if (!inspeccion) {
          alert('Inspección no encontrada en Supabase')
          return
        }
        etapas = (inspeccion as any).etapas_completadas || []
      } else {
        // local
        const inspeccion = await db.inspeccionesLocales.get(inspeccionId) as any
        if (!inspeccion) {
          alert('Inspección no encontrada localmente')
          return
        }
        etapas = inspeccion.etapas_completadas || []
      }

      let ruta = `/inspeccion/${inspeccionId}/recepcion`

      // Determinar a qué etapa navegar
      if (!etapas.includes('recepcion')) {
        ruta = `/inspeccion/${inspeccionId}/recepcion`
      } else if (!etapas.includes('peritaje')) {
        ruta = `/inspeccion/${inspeccionId}/peritaje`
      } else if (!etapas.includes('pruebas')) {
        ruta = `/inspeccion/${inspeccionId}/pruebas`
      } else {
        // Si todas las etapas están completas, ver detalles
        ruta = `/inspeccion/${inspeccionId}/detalles`
      }

      navigate(ruta)
    } catch (error) {
      console.error('Error al continuar inspección:', error)
      alert('Error al cargar inspección. Intenta nuevamente.')
    }
  }

  const getEstadoLabel = (estado: Status) => {
    switch (estado) {
      case 'recepcion': return 'Pendiente Inicio'
      case 'peritaje': return 'Pendiente Peritaje'
      case 'taller': return 'En Taller'
      case 'pruebas': return 'Esperando Banco de Pruebas'
      case 'completado': return 'Completado'
      default: return 'Borrador'
    }
  }

  const getProgresoColor = (estado: Status) => {
    switch (estado) {
      case 'recepcion': return 'bg-primary/50'
      case 'peritaje': return 'bg-primary'
      case 'taller': return 'bg-yellow-500'
      case 'pruebas': return 'bg-primary'
      case 'completado': return 'bg-green-500'
      default: return 'bg-slate-400'
    }
  }

  // Filtrar inspecciones
  const inspeccionesFiltradas = inspecciones.filter(inspeccion => {
    const cumpleFiltro =
      filtroActivo === 'todos' ||
      (filtroActivo === 'peritaje' && (inspeccion.estado === 'peritaje' || inspeccion.estado === 'recepcion')) ||
      (filtroActivo === 'pruebas' && inspeccion.estado === 'pruebas') ||
      (filtroActivo === 'urgentes' && inspeccion.prioridad === 'urgent')

    const cumpleBusqueda = !busqueda ||
      inspeccion.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
      inspeccion.cliente.toLowerCase().includes(busqueda.toLowerCase())

    return cumpleFiltro && cumpleBusqueda
  })

  const countPeritaje = inspecciones.filter(i =>
    i.estado === 'peritaje' || i.estado === 'recepcion'
  ).length
  const countPruebas = inspecciones.filter(i => i.estado === 'pruebas').length
  const countUrgentes = inspecciones.filter(i => i.prioridad === 'urgent').length

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center p-4 justify-between max-w-5xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/')}
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <span className="material-symbols-outlined text-2xl">arrow_back_ios</span>
            </button>
            <h2 className="text-lg font-bold leading-tight tracking-tight">Inspecciones Pendientes</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
              online
                ? 'bg-green-500/10 text-green-500'
                : 'bg-yellow-500/10 text-yellow-500'
            }`}>
              <span className={`size-2 rounded-full ${online ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`}></span>
              {online ? 'Online' : 'Offline'}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto pb-24">
        {/* Search Bar Section */}
        <div className="px-4 py-4">
          <label className="flex flex-col w-full">
            <div className="flex w-full items-stretch rounded-xl h-12 bg-white dark:bg-surface-dark border border-slate-200 dark:border-slate-800 shadow-sm transition-focus focus-within:ring-2 focus-within:ring-primary/50">
              <div className="text-slate-400 dark:text-text-muted-dark flex items-center justify-center pl-4">
                <span className="material-symbols-outlined">search</span>
              </div>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full border-none bg-transparent focus:outline-0 focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-text-muted-dark px-3 text-base font-normal"
                placeholder="Buscar por ID de cilindro o cliente..."
              />
              <button className="px-4 text-primary">
                <span className="material-symbols-outlined">filter_list</span>
              </button>
            </div>
          </label>
        </div>

        {/* Filter Chips */}
        <div className="flex gap-2 px-4 pb-4 overflow-x-auto hide-scrollbar">
          <button
            onClick={() => setFiltroActivo('todos')}
            className={`flex h-9 shrink-0 items-center justify-center gap-2 rounded-full transition-transform active:scale-95 ${
              filtroActivo === 'todos'
                ? 'bg-primary text-white px-5'
                : 'bg-white dark:bg-surface-card border border-slate-200 dark:border-slate-700 px-5 text-slate-700 dark:text-white'
            }`}
          >
            <span className="text-sm font-semibold">Todos ({inspecciones.length})</span>
          </button>

          <button
            onClick={() => setFiltroActivo('peritaje')}
            className={`flex h-9 shrink-0 items-center justify-center gap-2 rounded-full transition-transform active:scale-95 ${
              filtroActivo === 'peritaje'
                ? 'bg-primary text-white px-5'
                : 'bg-white dark:bg-surface-card border border-slate-200 dark:border-slate-700 px-5 text-slate-700 dark:text-white'
            }`}
          >
            <span className="text-sm font-medium">Peritaje</span>
            <span className={`${
              filtroActivo === 'peritaje' ? 'bg-white/20' : 'bg-primary/20'
            } text-primary text-[10px] px-1.5 rounded-full`}>{countPeritaje}</span>
          </button>

          <button
            onClick={() => setFiltroActivo('pruebas')}
            className={`flex h-9 shrink-0 items-center justify-center gap-2 rounded-full transition-transform active:scale-95 ${
              filtroActivo === 'pruebas'
                ? 'bg-primary text-white px-5'
                : 'bg-white dark:bg-surface-card border border-slate-200 dark:border-slate-700 px-5 text-slate-700 dark:text-white'
            }`}
          >
            <span className="text-sm font-medium">Hidráulica</span>
            <span className={`${
              filtroActivo === 'pruebas' ? 'bg-white/20' : 'bg-primary/20'
            } text-primary text-[10px] px-1.5 rounded-full`}>{countPruebas}</span>
          </button>

          <button
            onClick={() => setFiltroActivo('urgentes')}
            className={`flex h-9 shrink-0 items-center justify-center gap-2 rounded-full transition-transform active:scale-95 ${
              filtroActivo === 'urgentes'
                ? 'bg-primary text-white px-5'
                : 'bg-white dark:bg-surface-card border border-slate-200 dark:border-slate-700 px-5 text-slate-700 dark:text-white'
            }`}
          >
            <span className="text-sm font-medium text-red-500">Urgentes</span>
            <span className={`${
              filtroActivo === 'urgentes' ? 'bg-white/20' : 'bg-red-500/20'
            } text-red-500 text-[10px] px-1.5 rounded-full`}>{countUrgentes}</span>
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mx-4 mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-red-500 text-[20px]">error</span>
              <div className="flex-1">
                <p className="text-red-600 dark:text-red-400 text-sm font-medium">Error de conexión</p>
                <p className="text-red-500/70 dark:text-red-400/70 text-xs">{error}</p>
              </div>
              <button
                onClick={cargarDatosDesdeSupabase}
                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-xs font-medium rounded transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-slate-500 dark:text-slate-400">Cargando inspecciones...</p>
          </div>
        )}

        {/* Section Header */}
        {!loading && (
          <div className="flex items-center justify-between px-4 pt-2 pb-2">
            <h3 className="text-slate-900 dark:text-white text-base font-bold uppercase tracking-widest">Lista de Trabajo</h3>
            <span className="text-slate-500 text-xs font-medium uppercase">
              {!online ? 'Modo Offline' : `Última act: ${new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' })}`}
            </span>
          </div>
        )}

        {/* Inspection Cards List */}
        {!loading && (
          <div className="flex flex-col gap-4 p-4">
            {inspeccionesFiltradas.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600">search_off</span>
              <p className="text-gray-500 dark:text-gray-400 mt-4">
                {!online ? 'Sin conexión. Mostrando solo datos locales.' : 'No se encontraron inspecciones pendientes'}
              </p>
              {busqueda && (
                <button
                  onClick={() => setBusqueda('')}
                  className="mt-4 text-primary font-medium"
                >
                  Limpiar búsqueda
                </button>
              )}
            </div>
          ) : (
            inspeccionesFiltradas.map((inspeccion) => (
              <div
                key={inspeccion.id}
                className={`relative overflow-hidden group ${
                  inspeccion.prioridad === 'urgent'
                    ? 'flex flex-col rounded-xl border border-red-500/30 bg-white dark:bg-surface-dark shadow-lg dark:shadow-none overflow-hidden'
                    : 'flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-surface-dark shadow-sm overflow-hidden'
                }`}
              >
                {/* Priority indicator */}
                {inspeccion.prioridad === 'urgent' && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                )}

                <div className="p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      {inspeccion.prioridad === 'urgent' && (
                        <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">priority_high</span>
                          Prioridad Alta
                        </p>
                      )}
                      {inspeccion.estado === 'pruebas' && (
                        <p className="text-primary text-[10px] font-bold uppercase tracking-wider mb-1">
                          Prueba Hidráulica
                        </p>
                      )}
                      {inspeccion.estado === 'recepcion' && (
                        <p className="text-slate-400 dark:text-text-muted-dark text-[10px] font-bold uppercase tracking-wider mb-1">
                          Recién Ingresado
                        </p>
                      )}
                      {inspeccion.estado === 'peritaje' && (
                        <p className="text-primary text-[10px] font-bold uppercase tracking-wider mb-1">
                          En Evaluación
                        </p>
                      )}
                      <h4 className="text-slate-900 dark:text-white text-xl font-black tracking-tight">{inspeccion.codigo}</h4>
                      <p className="text-slate-500 dark:text-text-muted-dark text-sm font-medium">
                        {inspeccion.cliente} • {inspeccion.equipo}
                      </p>
                    </div>
                    {inspeccion.prioridad !== 'urgent' && inspeccion.estado !== 'recepcion' && (
                      <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg">
                        <span className="material-symbols-outlined text-slate-400">precision_manufacturing</span>
                      </div>
                    )}
                  </div>

                  {/* Progress Bar */}
                  <div className="flex flex-col gap-2 py-2">
                    {inspeccion.estado === 'peritaje' && (
                      <>
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-text-muted-dark">
                          <span>Recepción</span>
                          <span>Peritaje</span>
                          <span className="opacity-40">Taller</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full flex">
                          <div className="bg-green-500 h-full w-1/3 rounded-l-full border-r border-slate-900/10"></div>
                          <div className="bg-primary h-full w-1/4 animate-pulse"></div>
                        </div>
                      </>
                    )}

                    {inspeccion.estado === 'pruebas' && (
                      <>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full flex">
                          <div className="bg-green-500 h-full w-2/3 rounded-l-full"></div>
                        </div>
                      </>
                    )}

                    {inspeccion.estado === 'recepcion' && (
                      <>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full">
                          <div className={`${getProgresoColor(inspeccion.estado)} h-full w-1/5 rounded-full`}></div>
                        </div>
                      </>
                    )}

                    {inspeccion.estado !== 'recepcion' && inspeccion.estado !== 'peritaje' && inspeccion.estado !== 'pruebas' && (
                      <>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full">
                          <div className={`${getProgresoColor(inspeccion.estado)} h-full rounded-full`} style={{ width: `${inspeccion.progreso}%` }}></div>
                        </div>
                      </>
                    )}

                    <p className="text-slate-400 dark:text-text-muted-dark text-xs">
                      Recibido: {inspeccion.fecha} •{' '}
                      <span className={inspeccion.estado === 'peritaje' ? 'text-primary font-semibold' : 'text-slate-300 dark:text-slate-400'}>
                        {getEstadoLabel(inspeccion.estado)}
                      </span>
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className={`gap-2 mt-2 flex`}>
                    <button
                      onClick={() => handleContinuarInspeccion(
                        inspeccion.id,
                        inspeccion.estado_inspeccion ? 'supabase' : 'local'
                      )}
                      className={`flex items-center justify-center gap-2 rounded-lg font-bold py-3 text-sm transition-transform active:scale-95 ${
                        inspeccion.estado === 'recepcion'
                          ? 'w-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white'
                          : 'flex-1 bg-primary text-white'
                      }`}
                    >
                      {inspeccion.estado === 'recepcion' ? (
                        <>INICIAR PERITAJE</>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-sm">play_arrow</span>
                          CONTINUAR
                        </>
                      )}
                    </button>

                    {inspeccion.estado !== 'recepcion' && (
                      <button className="w-12 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400">
                        <span className="material-symbols-outlined">more_vert</span>
                      </button>
                    )}

                    {inspeccion.estado === 'pruebas' && (
                      <button className="w-12 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400">
                        <span className="material-symbols-outlined text-sm">history</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        )}

        {/* Float Action Button (Quick New Inspection) */}
        <div className="fixed bottom-6 right-6 z-40">
          <button
            onClick={handleNuevaInspeccion}
            className="size-14 rounded-full bg-primary text-white shadow-2xl flex items-center justify-center active:scale-90 transition-transform"
          >
            <span className="material-symbols-outlined text-3xl">add</span>
          </button>
        </div>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation notificationCount={inspecciones.length} />
    </div>
  )
}

export default InspeccionesPendientesPage
