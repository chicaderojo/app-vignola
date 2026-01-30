import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabaseService } from '../../services/supabaseService'
import { Inspeccion } from '../../types'

interface OrdenMantencion {
  id: string
  codigo: string
  cliente: string
  equipo: string
  prioridad: 'Normal' | 'Urgente'
  estado: 'en_proceso' | 'listo_pruebas' | 'listo_mantencion' | 'completado'
  fecha: string
  progreso: number
}

interface MantencionesModalProps {
  isOpen: boolean
  onClose: () => void
}

export function MantencionesModal({ isOpen, onClose }: MantencionesModalProps) {
  const navigate = useNavigate()

  const [filtroActivo, setFiltroActivo] = useState<'todos' | 'en_proceso' | 'listas' | 'urgentes'>('todos')
  const [busqueda, setBusqueda] = useState('')
  const [loading, setLoading] = useState(true)
  const [ordenes, setOrdenes] = useState<OrdenMantencion[]>([])

  useEffect(() => {
    if (isOpen) {
      cargarOrdenesMantencion()
    }
  }, [isOpen])

  const cargarOrdenesMantencion = async () => {
    try {
      setLoading(true)

      // Cargar todas las inspecciones en estado borrador (podrían estar en mantención)
      const inspecciones = await supabaseService.getInspeccionesByEstado('borrador')

      // Filtrar las que están en proceso de mantención o listas
      const ordenesMantencion: OrdenMantencion[] = inspecciones
        .filter((insp: any) => {
          const etapas = insp.etapas_completadas || []
          // Está en mantención si tiene peritaje completado pero no está finalizada
          return etapas.includes('peritaje') && !etapas.includes('finalizado')
        })
        .map((insp: any) => {
          const cilindro = insp.cilindro as any
          const etapas = insp.etapas_completadas || []

          let estado: OrdenMantencion['estado'] = 'en_proceso'
          if (etapas.includes('pruebas')) {
            estado = 'listo_mantencion'
          }

          return {
            id: insp.id,
            codigo: cilindro?.id_codigo || insp.cilindro_id,
            cliente: cilindro?.cliente?.nombre || 'Cliente',
            equipo: `${cilindro?.tipo || 'Cilindro'} - ${cilindro?.fabricante || 'Fabricante'}`,
            prioridad: 'Normal',
            estado,
            fecha: new Date(insp.created_at).toLocaleDateString('es-CL'),
            progreso: etapas.length > 0 ? Math.round((etapas.length / 4) * 100) : 25
          }
        })

      setOrdenes(ordenesMantencion)
    } catch (error) {
      console.error('Error cargando órdenes de mantención:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleContinuarMantencion = (inspeccionId: string) => {
    onClose()

    // Navegar al registro de mantención
    navigate(`/inspeccion/${inspeccionId}/registro-mantencion`)
  }

  const getEstadoLabel = (estado: OrdenMantencion['estado']) => {
    switch (estado) {
      case 'en_proceso': return 'En Proceso'
      case 'listo_pruebas': return 'Lista para Pruebas'
      case 'listo_mantencion': return 'Lista para Mantención'
      case 'completado': return 'Completada'
      default: return 'Pendiente'
    }
  }

  const getEstadoColor = (estado: OrdenMantencion['estado']) => {
    switch (estado) {
      case 'en_proceso': return 'text-yellow-600 dark:text-yellow-400'
      case 'listo_pruebas': return 'text-blue-600 dark:text-blue-400'
      case 'listo_mantencion': return 'text-primary'
      case 'completado': return 'text-green-600 dark:text-green-400'
      default: return 'text-slate-600 dark:text-slate-400'
    }
  }

  const ordenesFiltradas = ordenes.filter(orden => {
    const cumpleFiltro =
      filtroActivo === 'todos' ||
      (filtroActivo === 'en_proceso' && orden.estado === 'en_proceso') ||
      (filtroActivo === 'listas' && (orden.estado === 'listo_pruebas' || orden.estado === 'listo_mantencion')) ||
      (filtroActivo === 'urgentes' && orden.prioridad === 'Urgente')

    const cumpleBusqueda = !busqueda ||
      orden.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
      orden.cliente.toLowerCase().includes(busqueda.toLowerCase())

    return cumpleFiltro && cumpleBusqueda
  })

  const countEnProceso = ordenes.filter(o => o.estado === 'en_proceso').length
  const countListas = ordenes.filter(o => o.estado === 'listo_pruebas' || o.estado === 'listo_mantencion').length
  const countUrgentes = ordenes.filter(o => o.prioridad === 'Urgente').length

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50">
      <div className="bg-white dark:bg-surface-dark w-full max-w-md max-h-[85vh] rounded-t-3xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-surface-dark border-b border-slate-200 dark:border-slate-800 px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold">Órdenes de Mantención</h2>
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
              Todos ({ordenes.length})
            </button>

            <button
              onClick={() => setFiltroActivo('en_proceso')}
              className={`flex h-7 shrink-0 items-center justify-center gap-1 rounded-full text-xs font-medium transition-transform active:scale-95 ${
                filtroActivo === 'en_proceso'
                  ? 'bg-yellow-500 text-white px-3'
                  : 'bg-slate-100 dark:bg-slate-800 px-3 text-slate-700 dark:text-white'
              }`}
            >
              En Proceso
              <span className={`text-[10px] px-1 rounded-full ${
                filtroActivo === 'en_proceso' ? 'bg-white/20' : 'bg-yellow-500/20'
              }`}>{countEnProceso}</span>
            </button>

            <button
              onClick={() => setFiltroActivo('listas')}
              className={`flex h-7 shrink-0 items-center justify-center gap-1 rounded-full text-xs font-medium transition-transform active:scale-95 ${
                filtroActivo === 'listas'
                  ? 'bg-blue-500 text-white px-3'
                  : 'bg-slate-100 dark:bg-slate-800 px-3 text-slate-700 dark:text-white'
              }`}
            >
              Listas
              <span className={`text-[10px] px-1 rounded-full ${
                filtroActivo === 'listas' ? 'bg-white/20' : 'bg-blue-500/20'
              }`}>{countListas}</span>
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
          ) : ordenesFiltradas.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-5xl text-slate-300 dark:text-slate-600">build</span>
              <p className="text-slate-500 dark:text-slate-400 mt-3 text-sm">
                No hay órdenes de mantención
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {ordenesFiltradas.map((orden) => (
                <div
                  key={orden.id}
                  onClick={() => handleContinuarMantencion(orden.id)}
                  className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-card transition-colors cursor-pointer hover:bg-slate-50 dark:hover:bg-surface-dark"
                >
                  <div className="p-3">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="text-slate-900 dark:text-white font-bold text-lg">{orden.codigo}</h4>
                        <p className="text-slate-500 dark:text-slate-400 text-sm">
                          {orden.cliente} • {orden.equipo}
                        </p>
                      </div>
                      <span className={`text-xs font-medium ${getEstadoColor(orden.estado)}`}>
                        {getEstadoLabel(orden.estado)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-xs">Recibido: {orden.fecha}</span>
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
              navigate('/mantencion-pendiente')
            }}
            className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl transition-colors"
          >
            Ver Todas las Órdenes
          </button>
        </div>
      </div>
    </div>
  )
}
