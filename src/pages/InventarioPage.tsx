import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

type EstadoFabricacion = 'pendiente' | 'torno' | 'listo'
type FiltroTab = 'todos' | 'pendiente' | 'torno' | 'listo'

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
}

function InventarioPage() {
  const navigate = useNavigate()

  const [filtroActivo, setFiltroActivo] = useState<FiltroTab>('todos')

  // Mock data para órdenes de fabricación
  const ordenes: OrdenFabricacion[] = [
    {
      id: '1',
      codigo: 'ID-9942-ESCONDIDA',
      nombre: 'Vástago de Cilindro',
      cliente: 'Minera Escondida Ltda.',
      material: 'AISI 4140 Bonificado',
      dimensiones: 'Ø 50mm x 1200mm',
      estado: 'pendiente',
      fechaLimite: '24 Oct 2023'
    },
    {
      id: '2',
      codigo: 'ID-9821-ANGLO',
      nombre: 'Émbolo Principal',
      cliente: 'Anglo American Sur',
      material: 'Bronce SAE 64',
      dimensiones: 'Ø 120mm | Espesor: 85mm',
      estado: 'torno',
      operario: 'J. Ramirez'
    },
    {
      id: '3',
      codigo: 'ID-9750-CODELCO',
      nombre: 'Tapa Guía Frontal',
      cliente: 'Codelco Chuquicamata',
      material: 'ASTM A-36',
      dimensiones: 'Ø 200mm x 300mm',
      estado: 'listo',
      ubicacion: 'Zona A - Rack 04'
    }
  ]

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
      case 'listo':
        return {
          label: 'Listo',
          color: 'text-green-500',
          bg: 'bg-green-500/10',
          border: 'border-green-500/30',
          dot: 'bg-green-500',
          iconBg: 'bg-industrial-gray'
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
            <p className="text-text-muted-dark text-[10px] uppercase tracking-widest font-semibold">Taller de Cilindros Vignola</p>
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
              <p className="text-sm font-bold tracking-wider">TODOS</p>
            </button>

            <button
              onClick={() => setFiltroActivo('pendiente')}
              className={`flex flex-col items-center justify-center border-b-2 pb-3 pt-2 shrink-0 transition-colors ${
                filtroActivo === 'pendiente'
                  ? 'border-primary text-white'
                  : 'border-transparent text-text-muted-dark'
              }`}
            >
              <p className="text-sm font-bold tracking-wider">PENDIENTE</p>
            </button>

            <button
              onClick={() => setFiltroActivo('torno')}
              className={`flex flex-col items-center justify-center border-b-2 pb-3 pt-2 shrink-0 transition-colors ${
                filtroActivo === 'torno'
                  ? 'border-primary text-white'
                  : 'border-transparent text-text-muted-dark'
              }`}
            >
              <p className="text-sm font-bold tracking-wider">EN TORNO</p>
            </button>

            <button
              onClick={() => setFiltroActivo('listo')}
              className={`flex flex-col items-center justify-center border-b-2 pb-3 pt-2 shrink-0 transition-colors ${
                filtroActivo === 'listo'
                  ? 'border-primary text-white'
                  : 'border-transparent text-text-muted-dark'
              }`}
            >
              <p className="text-sm font-bold tracking-wider">LISTO</p>
            </button>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-4">
        {/* Section Label */}
        <div className="flex items-center justify-between">
          <h4 className="text-text-muted-dark text-[11px] font-bold leading-normal tracking-[0.2em] uppercase">
            Órdenes de Fabricación Activas
          </h4>
          <span className="bg-primary/20 text-primary text-[10px] px-2 py-0.5 rounded font-bold">
            {ordenesFiltradas.length} TOTAL
          </span>
        </div>

        {/* Industrial Cards */}
        {ordenesFiltradas.map((orden) => {
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

        {ordenesFiltradas.length === 0 && (
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
