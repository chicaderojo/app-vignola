import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabaseService } from '../services/supabaseService'

type EstadoFabricacion = 'pendiente' | 'torno' | 'fresado' | 'rectificado' | 'cromado' | 'listo' | 'entregado'
type FiltroTab = 'todos' | 'pendiente' | 'listo'

interface OrdenFabricacion {
  id: string
  codigo: string
  nombre: string
  cliente: string
  material: string
  dimensiones: string
  estado: EstadoFabricacion
  fechaLimite?: string
  operario?: string
  ubicacion?: string
  origen?: 'fabricacion' | 'peritaje' // Para distinguir origen
}

function InventarioPage() {
  const navigate = useNavigate()

  const [filtroActivo, setFiltroActivo] = useState<FiltroTab>('todos')
  const [loading, setLoading] = useState(true)
  const [ordenes, setOrdenes] = useState<OrdenFabricacion[]>([])

  // Cargar órdenes de fabricación y componentes del peritaje desde la BD
  useEffect(() => {
    const cargarDatosFabricacion = async () => {
      try {
        setLoading(true)

        // Cargar ambas fuentes de datos en paralelo
        const [ordenesData, componentesData] = await Promise.all([
          supabaseService.getOrdenesFabricacion(),
          supabaseService.getComponentesParaFabricacion()
        ])

        // Mapear datos de órdenes de fabricación
        const ordenesMapeadas: OrdenFabricacion[] = ordenesData.map((orden: any) => ({
          id: orden.id,
          codigo: orden.codigo,
          nombre: orden.nombre,
          cliente: orden.cliente?.nombre || 'Sin cliente',
          material: orden.material || 'No especificado',
          dimensiones: orden.dimensiones || '-',
          estado: (orden.estado === 'entregado' ? 'listo' : orden.estado) as EstadoFabricacion,
          fechaLimite: orden.fecha_limite ? new Date(orden.fecha_limite).toLocaleDateString('es-CL', { day: '2-digit', month: 'short' }) : undefined,
          operario: orden.operario,
          ubicacion: orden.ubicacion,
          origen: 'fabricacion' as const
        }))

        // Mapear componentes del peritaje que requieren fabricación
        const componentesMapeados: OrdenFabricacion[] = componentesData.map((comp: any) => ({
          id: comp.id,
          codigo: comp.inspeccion?.cilindro?.id_codigo || comp.inspeccion?.sap_cliente || 'N/A',
          nombre: comp.componente,
          cliente: comp.inspeccion?.cilindro?.cliente?.nombre || 'Cliente',
          material: 'N/A',
          dimensiones: '-',
          estado: 'pendiente' as EstadoFabricacion,
          origen: 'peritaje' as const
        }))

        // Combinar ambas listas
        setOrdenes([...ordenesMapeadas, ...componentesMapeados])
      } catch (error) {
        console.error('Error cargando datos de fabricación:', error)
        // En caso de error, dejar array vacío
        setOrdenes([])
      } finally {
        setLoading(false)
      }
    }

    cargarDatosFabricacion()
  }, [])

  const handleBack = () => {
    navigate('/')
  }

  const handleVerOrden = (ordenId: string) => {
    console.log('Ver detalles de orden:', ordenId)
    // Aquí navegaríamos a una página de detalles de la orden
  }

  const getEstadoInfo = (estado: EstadoFabricacion) => {
    switch (estado) {
      case 'pendiente':
        return {
          label: 'Pendiente',
          color: 'text-yellow-500',
          bg: 'bg-yellow-500/10',
          border: 'border-yellow-500/30',
          dot: 'bg-yellow-500',
          iconBg: 'bg-primary'
        }
      case 'torno':
        return {
          label: 'En Torno',
          color: 'text-primary',
          bg: 'bg-primary/10',
          border: 'border-primary/30',
          dot: 'bg-primary',
          iconBg: 'bg-primary'
        }
      case 'fresado':
        return {
          label: 'Fresado',
          color: 'text-blue-500',
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/30',
          dot: 'bg-blue-500',
          iconBg: 'bg-blue-500'
        }
      case 'rectificado':
        return {
          label: 'Rectificado',
          color: 'text-purple-500',
          bg: 'bg-purple-500/10',
          border: 'border-purple-500/30',
          dot: 'bg-purple-500',
          iconBg: 'bg-purple-500'
        }
      case 'cromado':
        return {
          label: 'Cromado',
          color: 'text-orange-500',
          bg: 'bg-orange-500/10',
          border: 'border-orange-500/30',
          dot: 'bg-orange-500',
          iconBg: 'bg-orange-500'
        }
      case 'listo':
      case 'entregado':
        return {
          label: 'Listo',
          color: 'text-green-500',
          bg: 'bg-green-500/10',
          border: 'border-green-500/30',
          dot: 'bg-green-500',
          iconBg: 'bg-industrial-gray'
        }
      default:
        return {
          label: 'Desconocido',
          color: 'text-gray-500',
          bg: 'bg-gray-500/10',
          border: 'border-gray-500/30',
          dot: 'bg-gray-500',
          iconBg: 'bg-gray-500'
        }
    }
  }

  const getIcon = (nombre: string) => {
    if (nombre.includes('Vástago')) return 'settings_input_component'
    if (nombre.includes('Émbolo')) return 'motion_photos_on'
    return 'lens_blur'
  }

  // Filtrar órdenes según el tab activo
  const ordenesFiltradas = ordenes.filter(orden => {
    if (filtroActivo === 'todos') return true
    if (filtroActivo === 'pendiente') {
      // Incluir órdenes con estado 'pendiente' y componentes del peritaje
      return orden.estado === 'pendiente' || orden.origen === 'peritaje'
    }
    return orden.estado === filtroActivo
  })

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24">
      {/* Sticky Header */}
      <header className="sticky top-0 z-50 bg-background-dark/95 backdrop-blur-md border-b border-border-dark">
        <div className="flex items-center p-4 justify-between">
          <button
            onClick={handleBack}
            className="text-white flex size-10 shrink-0 items-center justify-center"
          >
            <span className="material-symbols-outlined">arrow_back_ios</span>
          </button>
          <div className="flex-1 px-2">
            <h2 className="text-white text-lg font-bold leading-tight tracking-tight uppercase">Inventario de Fabricación</h2>
            <p className="text-text-muted-dark text-[10px] uppercase tracking-widest font-semibold">Vignola, Maestranza Concepción</p>
          </div>
          <div className="flex size-10 items-center justify-end">
            <button className="flex items-center justify-center rounded bg-slate-700 dark:bg-surface-dark p-2">
              <span className="material-symbols-outlined text-white">search</span>
            </button>
          </div>
        </div>

        {/* Tabs / Status Filter */}
        <div className="px-4">
          <div className="flex gap-4 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setFiltroActivo('todos')}
              className={`flex flex-col items-center justify-center border-b-2 pb-3 pt-2 shrink-0 transition-colors ${
                filtroActivo === 'todos'
                  ? 'border-primary text-white'
                  : 'border-transparent text-text-muted-dark'
              }`}
            >
              <p className="text-sm font-bold tracking-wider">Todos</p>
            </button>

            <button
              onClick={() => setFiltroActivo('pendiente')}
              className={`flex flex-col items-center justify-center border-b-2 pb-3 pt-2 shrink-0 transition-colors ${
                filtroActivo === 'pendiente'
                  ? 'border-primary text-white'
                  : 'border-transparent text-text-muted-dark'
              }`}
            >
              <p className="text-sm font-bold tracking-wider">Pendientes</p>
            </button>

            <button
              onClick={() => setFiltroActivo('listo')}
              className={`flex flex-col items-center justify-center border-b-2 pb-3 pt-2 shrink-0 transition-colors ${
                filtroActivo === 'listo'
                  ? 'border-primary text-white'
                  : 'border-transparent text-text-muted-dark'
              }`}
            >
              <p className="text-sm font-bold tracking-wider">Listos</p>
            </button>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {/* Loading Indicator */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="mt-4 text-slate-400">Cargando órdenes...</p>
          </div>
        )}

        {/* Section Label */}
        {!loading && (
          <div className="flex items-center justify-between">
            <h4 className="text-text-muted-dark text-[11px] font-bold leading-normal tracking-[0.2em] uppercase">
              Órdenes de Fabricación Activas
            </h4>
            <span className="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded font-bold">
              {ordenesFiltradas.length} TOTAL
            </span>
          </div>
        )}

        {/* Industrial Cards */}
        {!loading && ordenesFiltradas.map((orden) => {
          const estadoInfo = getEstadoInfo(orden.estado)

          return (
            <div
              key={orden.id}
              onClick={() => handleVerOrden(orden.id)}
              className={`bg-surface-dark border border-border-dark overflow-hidden cursor-pointer active:scale-[0.99] transition-transform ${
                orden.estado === 'listo' ? 'opacity-75' : ''
              }`}
            >
              {/* Header */}
              <div className="p-4 flex justify-between items-start border-b border-border-dark bg-slate-800">
                <div className="flex gap-4 items-center">
                  <div className={`${estadoInfo.iconBg} flex items-center justify-center rounded size-10 shrink-0`}>
                    <span className="material-symbols-outlined text-white text-2xl">{getIcon(orden.nombre)}</span>
                  </div>
                  <div>
                    <h3 className="text-white text-base font-bold leading-none">{orden.nombre}</h3>
                    <p className="text-primary text-xs font-mono font-bold mt-1">{orden.codigo}</p>
                  </div>
                </div>
                <span className={`flex items-center gap-1.5 ${estadoInfo.bg} ${estadoInfo.color} ${estadoInfo.border} px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider`}>
                  <span className={`size-1.5 rounded-full ${estadoInfo.dot}`}></span>
                  {estadoInfo.label}
                </span>
              </div>

              {/* Grid Industrial */}
              <div className="grid grid-cols-2 gap-px bg-border-dark">
                <div className="bg-surface-dark p-3">
                  <p className="text-text-muted-dark text-[10px] uppercase font-bold tracking-tighter mb-1">Cliente</p>
                  <p className="text-white text-xs font-medium truncate">{orden.cliente}</p>
                </div>
                <div className="bg-surface-dark p-3">
                  <p className="text-text-muted-dark text-[10px] uppercase font-bold tracking-tighter mb-1">Material</p>
                  <p className="text-white text-xs font-medium">{orden.material}</p>
                </div>
                <div className="bg-surface-dark p-3">
                  <p className="text-text-muted-dark text-[10px] uppercase font-bold tracking-tighter mb-1">Dimensiones</p>
                  <p className="text-white text-xs font-medium">{orden.dimensiones}</p>
                </div>
                <div className="bg-surface-dark p-3">
                  {orden.estado === 'torno' ? (
                    <>
                      <p className="text-text-muted-dark text-[10px] uppercase font-bold tracking-tighter mb-1">Operario</p>
                      <p className="text-white text-xs font-medium">{orden.operario}</p>
                    </>
                  ) : orden.estado === 'pendiente' ? (
                    <>
                      <p className="text-text-muted-dark text-[10px] uppercase font-bold tracking-tighter mb-1">Fecha Límite</p>
                      <p className="text-white text-xs font-medium">{orden.fechaLimite}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-text-muted-dark text-[10px] uppercase font-bold tracking-tighter mb-1">Ubicación</p>
                      <p className="text-white text-xs font-medium">{orden.ubicacion}</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          )
        })}

        {!loading && ordenesFiltradas.length === 0 && (
          <div className="text-center py-12">
            <span className="material-symbols-outlined text-6xl text-gray-600">inventory_2</span>
            <p className="text-gray-500 mt-4">No hay órdenes en esta categoría</p>
          </div>
        )}
      </main>

      {/* Spacer for fixed nav */}
      <div className="h-20"></div>
    </div>
  )
}

export default InventarioPage
