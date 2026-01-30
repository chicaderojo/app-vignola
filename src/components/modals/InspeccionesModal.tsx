import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../../db/dexie'
import { supabaseService } from '../../services/supabaseService'
import { Inspeccion } from '../../types'

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
  estado_inspeccion?: string
}

interface InspeccionesModalProps {
  isOpen: boolean
  onClose: () => void
}

export function InspeccionesModal({ isOpen, onClose }: InspeccionesModalProps) {
  const navigate = useNavigate()

  const [filtroActivo, setFiltroActivo] = useState<'todos' | 'peritaje' | 'pruebas' | 'urgentes'>('todos')
  const [busqueda, setBusqueda] = useState('')
  const [online, setOnline] = useState(navigator.onLine)
  const [loading, setLoading] = useState(true)

  const inspeccionesLocales = useLiveQuery(
    () => db.inspeccionesLocales.toArray(),
    []
  )

  const [inspecciones, setInspecciones] = useState<InspeccionPendiente[]>([])
  const [inspeccionesSupabase, setInspeccionesSupabase] = useState<Inspeccion[]>([])

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

  useEffect(() => {
    if (online && isOpen) {
      cargarDatosDesdeSupabase()
    } else {
      setLoading(false)
    }
  }, [isOpen])

  useEffect(() => {
    const listaCombinada: InspeccionPendiente[] = []

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

    if (inspeccionesLocales) {
      inspeccionesLocales.forEach((insp: any) => {
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
      const datos = await supabaseService.getInspeccionesByEstado('borrador')
      setInspeccionesSupabase(datos)
    } catch (err: any) {
      console.error('Error cargando inspecciones desde Supabase:', err)
    } finally {
      setLoading(false)
    }
  }

  const calcularProgreso = (etapas: string[]): number => {
    const totalEtapas = 4
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

  const handleContinuarInspeccion = async (inspeccionId: string) => {
    onClose() // Cerrar el modal primero

    try {
      let etapas: string[] = []

      try {
        const inspeccionSupabase = await supabaseService.getInspeccionById(inspeccionId)
        if (inspeccionSupabase) {
          etapas = (inspeccionSupabase as any).etapas_completadas || []
        } else {
          const inspeccionLocal = await db.inspeccionesLocales.get(inspeccionId) as any
          if (inspeccionLocal) {
            etapas = inspeccionLocal.etapas_completadas || []
          }
        }
      } catch (e) {
        const inspeccionLocal = await db.inspeccionesLocales.get(inspeccionId) as any
        if (inspeccionLocal) {
          etapas = inspeccionLocal.etapas_completadas || []
        }
      }

      let ruta = `/inspeccion/${inspeccionId}/recepcion`

      if (!etapas.includes('recepcion')) {
        ruta = `/inspeccion/${inspeccionId}/recepcion`
      } else if (!etapas.includes('peritaje')) {
        ruta = `/inspeccion/${inspeccionId}/peritaje`
      } else if (!etapas.includes('pruebas')) {
        ruta = `/inspeccion/${inspeccionId}/pruebas`
      } else {
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
      <div className="bg-white dark:bg-surface-dark w-full max-w-md max-h-[85vh] rounded-t-3xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-surface-dark border-b border-slate-200 dark:border-slate-800 px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">Inspecciones Pendientes</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>

          {/* Search */}
          <div className="flex items-stretch rounded-lg h-10 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 mb-3">
            <div className="text-slate-400 dark:text-slate-500 flex items-center justify-center pl-3">
              <span className="material-symbols-outlined text-[20px]">search</span>
            </div>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="flex-1 border-none bg-transparent focus:outline-0 focus:ring-0 text-slate-900 dark:text-white placeholder:text-slate-400 px-2 text-sm"
              placeholder="Buscar por OT, cliente..."
            />
          </div>

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto hide-scrollbar">
            <button
              onClick={() => setFiltroActivo('todos')}
              className={`flex h-7 shrink-0 items-center justify-center gap-1 rounded-full text-xs font-medium transition-transform active:scale-95 ${
                filtroActivo === 'todos'
                  ? 'bg-primary text-white px-3'
                  : 'bg-slate-100 dark:bg-slate-800 px-3 text-slate-700 dark:text-white'
              }`}
            >
              Todos ({inspecciones.length})
            </button>

            <button
              onClick={() => setFiltroActivo('peritaje')}
              className={`flex h-7 shrink-0 items-center justify-center gap-1 rounded-full text-xs font-medium transition-transform active:scale-95 ${
                filtroActivo === 'peritaje'
                  ? 'bg-primary text-white px-3'
                  : 'bg-slate-100 dark:bg-slate-800 px-3 text-slate-700 dark:text-white'
              }`}
            >
              Peritaje
              <span className={`text-[10px] px-1 rounded-full ${
                filtroActivo === 'peritaje' ? 'bg-white/20' : 'bg-primary/20'
              }`}>{countPeritaje}</span>
            </button>

            <button
              onClick={() => setFiltroActivo('pruebas')}
              className={`flex h-7 shrink-0 items-center justify-center gap-1 rounded-full text-xs font-medium transition-transform active:scale-95 ${
                filtroActivo === 'pruebas'
                  ? 'bg-primary text-white px-3'
                  : 'bg-slate-100 dark:bg-slate-800 px-3 text-slate-700 dark:text-white'
              }`}
            >
              Pruebas
              <span className={`text-[10px] px-1 rounded-full ${
                filtroActivo === 'pruebas' ? 'bg-white/20' : 'bg-primary/20'
              }`}>{countPruebas}</span>
            </button>

            <button
              onClick={() => setFiltroActivo('urgentes')}
              className={`flex h-7 shrink-0 items-center justify-center gap-1 rounded-full text-xs font-medium transition-transform active:scale-95 ${
                filtroActivo === 'urgentes'
                  ? 'bg-red-500 text-white px-3'
                  : 'bg-slate-100 dark:bg-slate-800 px-3 text-slate-700 dark:text-white'
              }`}
            >
              Urgentes
              <span className={`text-[10px] px-1 rounded-full ${
                filtroActivo === 'urgentes' ? 'bg-white/20' : 'bg-red-500/20'
              }`}>{countUrgentes}</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-3"></div>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Cargando...</p>
            </div>
          ) : inspeccionesFiltradas.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600">search_off</span>
              <p className="text-slate-500 dark:text-slate-400 mt-3 text-sm">
                No se encontraron inspecciones
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {inspeccionesFiltradas.map((inspeccion) => (
                <div
                  key={inspeccion.id}
                  onClick={() => handleContinuarInspeccion(inspeccion.id)}
                  className={`relative overflow-hidden rounded-xl border transition-colors cursor-pointer ${
                    inspeccion.prioridad === 'urgent'
                      ? 'border-red-500/30 bg-red-50 dark:bg-red-900/20'
                      : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-card'
                  }`}
                >
                  {inspeccion.prioridad === 'urgent' && (
                    <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                  )}

                  <div className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="text-slate-900 dark:text-white font-bold text-lg">{inspeccion.codigo}</h4>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                          {inspeccion.cliente} • {inspeccion.equipo}
                        </p>
                      </div>
                      {inspeccion.prioridad === 'urgent' && (
                        <span className="text-red-500 text-[10px] font-bold uppercase flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">priority_high</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-xs">{getEstadoLabel(inspeccion.estado)}</span>
                      <span className="text-primary text-xs font-medium">Continuar →</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white dark:bg-surface-dark border-t border-slate-200 dark:border-slate-700 px-4 py-3">
          <button
            onClick={() => {
              onClose()
              navigate('/inspecciones-pendientes')
            }}
            className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-colors"
          >
            Ver Todas las Inspecciones
          </button>
        </div>
      </div>
    </div>
  )
}
