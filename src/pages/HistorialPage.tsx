import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'
import { supabaseService } from '../services/supabaseService'

type InspeccionStatus = 'borrador' | 'en_recepcion' | 'en_progreso' | 'en_mantencion' | 'finalizado'

interface Inspeccion {
  id: string
  codigo: string
  cliente: string
  estado: InspeccionStatus
  fecha: string
  hora: string
  fechaCompleta: Date
}

function HistorialPage() {
  const navigate = useNavigate()

  const [inspecciones, setInspecciones] = useState<Inspeccion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar inspecciones completas desde Supabase
  useEffect(() => {
    cargarInspecciones()
  }, [])

  const cargarInspecciones = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('Cargando historial desde Supabase...')

      // Cargar todas las inspecciones
      const datos = await supabaseService.getInspecciones()

      console.log('Inspecciones cargadas:', datos)

      // Transformar al formato de Historial
      const listaTransformada: Inspeccion[] = datos.map((insp: any) => {
        const cilindro = insp.cilindro as any
        const fecha = new Date(insp.created_at)
        const hoy = new Date()
        const ayer = new Date(hoy)
        ayer.setDate(ayer.getDate() - 1)

        let fechaTexto = 'Hoy'
        if (fecha < ayer) {
          fechaTexto = fecha.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' })
        } else if (fecha < hoy) {
          fechaTexto = 'Ayer'
        }

        // Determinar estado basado en etapas_completadas
        const etapas = (insp as any).etapas_completadas || []
        const estadoInspec = insp.estado_inspeccion

        let estado: InspeccionStatus = 'borrador'

        // Si está sincronizada, siempre es finalizado
        if (estadoInspec === 'sincronizada') {
          estado = 'finalizado'
        }
        // Si está en borrador, es borrador
        else if (estadoInspec === 'borrador') {
          estado = 'borrador'
        }
        // Si no tiene etapas, es borrador
        else if (!etapas || etapas.length === 0) {
          estado = 'borrador'
        }
        // Si tiene las 3 etapas, es finalizado
        else if (etapas.includes('recepcion') &&
                 etapas.includes('peritaje') &&
                 etapas.includes('mantencion')) {
          estado = 'finalizado'
        }
        // Si tiene recepcion y peritaje, está en mantención
        else if (etapas.includes('peritaje')) {
          estado = 'en_mantencion'
        }
        // Si tiene recepcion, está en progreso
        else if (etapas.includes('recepcion')) {
          estado = 'en_progreso'
        }
        else {
          estado = 'borrador'
        }

        return {
          id: insp.id,
          codigo: cilindro?.id_codigo || insp.cilindro_id,
          cliente: cilindro?.cliente?.nombre || 'Cliente',
          estado,
          fecha: fechaTexto,
          hora: fecha.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
          fechaCompleta: fecha
        }
      })

      setInspecciones(listaTransformada)
    } catch (err: any) {
      console.error('Error cargando historial:', err)
      setError(err.message || 'Error al cargar historial')
    } finally {
      setLoading(false)
    }
  }

  const [filtroActivo, setFiltroActivo] = useState<'todos' | 'borrador' | 'en_recepcion' | 'en_mantencion' | 'finalizado'>('todos')
  const [busqueda, setBusqueda] = useState('')

  const handleNuevaInspeccion = () => {
    const inspeccionId = uuidv4()
    navigate(`/inspeccion/${inspeccionId}/recepcion`)
  }

  const handleVerDetalles = (inspeccionId: string) => {
    navigate(`/inspeccion/${inspeccionId}/detalles`)
  }

  const getEstadoInfo = (estado: InspeccionStatus) => {
    switch (estado) {
      case 'borrador':
        return {
          icon: 'edit_note',
          bgColor: 'bg-gray-100 dark:bg-gray-800',
          textColor: 'text-gray-600 dark:text-gray-400',
          badgeBg: 'bg-gray-50 dark:bg-gray-900/30',
          badgeText: 'text-gray-700 dark:text-gray-400',
          badgeRing: 'ring-gray-600/20',
          label: 'Borrador'
        }
      case 'en_recepcion':
        return {
          icon: 'inbox',
          bgColor: 'bg-blue-100 dark:bg-blue-900/20',
          textColor: 'text-blue-600 dark:text-blue-400',
          badgeBg: 'bg-blue-50 dark:bg-blue-900/30',
          badgeText: 'text-blue-700 dark:text-blue-400',
          badgeRing: 'ring-blue-600/20',
          label: 'Inspección'
        }
      case 'en_progreso':
        return {
          icon: 'engineering',
          bgColor: 'bg-purple-100 dark:bg-purple-900/20',
          textColor: 'text-purple-600 dark:text-purple-400',
          badgeBg: 'bg-purple-50 dark:bg-purple-900/30',
          badgeText: 'text-purple-700 dark:text-purple-400',
          badgeRing: 'ring-purple-600/20',
          label: 'En Progreso'
        }
      case 'en_mantencion':
        return {
          icon: 'build',
          bgColor: 'bg-orange-100 dark:bg-orange-900/20',
          textColor: 'text-orange-600 dark:text-orange-400',
          badgeBg: 'bg-orange-50 dark:bg-orange-900/30',
          badgeText: 'text-orange-700 dark:text-orange-400',
          badgeRing: 'ring-orange-600/20',
          label: 'En Mantención'
        }
      case 'finalizado':
        return {
          icon: 'check_circle',
          bgColor: 'bg-green-100 dark:bg-green-900/20',
          textColor: 'text-green-600 dark:text-green-400',
          badgeBg: 'bg-green-50 dark:bg-green-900/30',
          badgeText: 'text-green-700 dark:text-green-400',
          badgeRing: 'ring-green-600/20',
          label: 'Finalizado'
        }
    }
  }

  // Filtrar inspecciones
  const inspeccionesFiltradas = inspecciones.filter(inspeccion => {
    const cumpleFiltro = filtroActivo === 'todos' || inspeccion.estado === filtroActivo

    const cumpleBusqueda = !busqueda ||
      inspeccion.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
      inspeccion.cliente.toLowerCase().includes(busqueda.toLowerCase()) ||
      inspeccion.fecha.toLowerCase().includes(busqueda.toLowerCase())

    return cumpleFiltro && cumpleBusqueda
  })

  // Agrupar por fecha
  const inspeccionesPorFecha = inspeccionesFiltradas.reduce((acc, inspeccion) => {
    if (!acc[inspeccion.fecha]) {
      acc[inspeccion.fecha] = []
    }
    acc[inspeccion.fecha].push(inspeccion)
    return acc
  }, {} as Record<string, Inspeccion[]>)

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24">
      {/* Top App Bar */}
      <header className="sticky top-0 z-20 bg-background-light dark:bg-background-dark border-b border-gray-200 dark:border-gray-800 shadow-sm transition-colors duration-200">
        <div className="flex items-center p-4 justify-between h-16">
          <button
            onClick={() => navigate('/')}
            className="text-slate-500 dark:text-gray-400 hover:text-primary dark:hover:text-white transition-colors flex size-10 shrink-0 items-center justify-center rounded-full active:bg-gray-200 dark:active:bg-surface-dark"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10 text-slate-900 dark:text-white">Historial</h2>
          <button className="flex size-10 shrink-0 items-center justify-center rounded-full text-primary dark:text-primary bg-primary/10 hover:bg-primary/20 transition-colors">
            <span className="material-symbols-outlined filled">filter_list</span>
          </button>
        </div>
      </header>

      {/* Search Bar Section */}
      <div className="px-4 py-3 sticky top-16 z-10 bg-background-light dark:bg-background-dark transition-colors duration-200">
        <label className="flex flex-col h-12 w-full">
          <div className="flex w-full flex-1 items-center rounded-xl bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 focus-within:border-primary dark:focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all overflow-hidden shadow-sm">
            <div className="text-gray-400 dark:text-slate-500 flex items-center justify-center pl-4 pr-2">
              <span className="material-symbols-outlined">search</span>
            </div>
            <input
              type="text"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="flex w-full min-w-0 flex-1 bg-transparent text-slate-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:outline-0 border-none h-full px-2 text-base font-normal"
              placeholder="Buscar ID, Cliente o Fecha..."
            />
          </div>
        </label>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 px-4 py-1 overflow-x-auto no-scrollbar w-full mb-2">
        <button
          onClick={() => setFiltroActivo('todos')}
          className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full px-4 shadow-md transition-transform active:scale-95 ${
            filtroActivo === 'todos'
              ? 'bg-primary text-white shadow-primary/20'
              : 'bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 text-slate-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
          }`}
        >
          <span className="text-sm font-medium">Todos</span>
        </button>

        <button
          onClick={() => setFiltroActivo('borrador')}
          className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full px-4 transition-transform active:scale-95 ${
            filtroActivo === 'borrador'
              ? 'bg-gray-500 text-white shadow-md shadow-gray-500/20'
              : 'bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 text-slate-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
          }`}
        >
          <span className="text-sm font-medium">Borrador</span>
        </button>

        <button
          onClick={() => setFiltroActivo('en_recepcion')}
          className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full px-4 transition-transform active:scale-95 ${
            filtroActivo === 'en_recepcion'
              ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20'
              : 'bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 text-slate-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
          }`}
        >
          <span className="text-sm font-medium">Inspección</span>
        </button>

        <button
          onClick={() => setFiltroActivo('en_mantencion')}
          className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full px-4 transition-transform active:scale-95 ${
            filtroActivo === 'en_mantencion'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
              : 'bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 text-slate-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
          }`}
        >
          <span className="text-sm font-medium">Mantención</span>
        </button>

        <button
          onClick={() => setFiltroActivo('finalizado')}
          className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full px-4 transition-transform active:scale-95 ${
            filtroActivo === 'finalizado'
              ? 'bg-green-500 text-white shadow-md shadow-green-500/20'
              : 'bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 text-slate-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
          }`}
        >
          <span className="text-sm font-medium">Finalizados</span>
        </button>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-slate-500 dark:text-slate-400">Cargando historial...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <span className="material-symbols-outlined text-6xl text-red-500 mb-4">error</span>
          <p className="text-red-600 dark:text-red-400 text-center mb-4">{error}</p>
          <button
            onClick={cargarInspecciones}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Main List Content */}
      {!loading && !error && (
      <div className="flex flex-col gap-4 px-4 py-2">
        {Object.entries(inspeccionesPorFecha).map(([fecha, inspeccionesDeFecha]) => (
          <div key={fecha}>
            {/* Date Header */}
            <div className="flex items-center gap-4 mt-2">
              <div className="h-px bg-gray-300 dark:bg-gray-700 flex-1"></div>
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{fecha}</span>
              <div className="h-px bg-gray-300 dark:bg-gray-700 flex-1"></div>
            </div>

            {/* List Items */}
            {inspeccionesDeFecha.map((inspeccion) => {
              const estadoInfo = getEstadoInfo(inspeccion.estado)

              return (
                <div
                  key={inspeccion.id}
                  onClick={() => handleVerDetalles(inspeccion.id)}
                  className="group relative flex flex-col gap-3 rounded-xl bg-white dark:bg-surface-dark p-4 shadow-sm border border-gray-100 dark:border-gray-800 active:scale-[0.99] transition-all duration-200 mt-3"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex gap-4 items-center">
                      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${estadoInfo.bgColor} ${estadoInfo.textColor}`}>
                        <span className="material-symbols-outlined filled">{estadoInfo.icon}</span>
                      </div>
                      <div className="flex flex-col">
                        <p className="text-base font-bold leading-tight text-slate-900 dark:text-white">Cilindro #{inspeccion.codigo}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{inspeccion.cliente}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <span className={`inline-flex items-center rounded-md ${estadoInfo.badgeBg} px-2 py-1 text-xs font-medium ${estadoInfo.badgeText} ring-1 ring-inset ${estadoInfo.badgeRing}`}>
                        {estadoInfo.label}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-700 pt-3 mt-1">
                    <div className="flex items-center gap-2 text-gray-400 dark:text-gray-500 text-xs">
                      <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                      <span>{inspeccion.hora}</span>
                    </div>
                    <div className="flex items-center gap-1 text-primary text-sm font-medium group-hover:underline">
                      Ver detalles
                      <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        ))}

        {inspeccionesFiltradas.length === 0 && (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600">search_off</span>
            <p className="text-gray-500 dark:text-gray-400 mt-4">No se encontraron inspecciones</p>
          </div>
        )}
      </div>
      )}

      {/* Floating Action Button */}
      <div className="fixed bottom-24 right-4 z-40">
        <button
          onClick={handleNuevaInspeccion}
          className="flex items-center justify-center w-14 h-14 rounded-full bg-primary text-white shadow-lg shadow-primary/40 hover:scale-105 active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-3xl">add</span>
        </button>
      </div>
    </div>
  )
}

export default HistorialPage
