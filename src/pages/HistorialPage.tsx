import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'

type InspeccionStatus = 'aprobado' | 'revision' | 'rechazado'

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

  // Mock data para inspecciones
  const [inspecciones] = useState<Inspeccion[]>([
    {
      id: '1',
      codigo: 'HYD-4592',
      cliente: 'Minera Escondida',
      estado: 'aprobado',
      fecha: 'Hoy',
      hora: '14:30 PM',
      fechaCompleta: new Date()
    },
    {
      id: '2',
      codigo: 'VIG-1023',
      cliente: 'Codelco Andina',
      estado: 'revision',
      fecha: 'Hoy',
      hora: '11:15 AM',
      fechaCompleta: new Date()
    },
    {
      id: '3',
      codigo: 'CAT-8841',
      cliente: 'BHP Spence',
      estado: 'rechazado',
      fecha: 'Ayer',
      hora: '13 Oct, 16:45 PM',
      fechaCompleta: new Date(Date.now() - 86400000)
    },
    {
      id: '4',
      codigo: 'KOM-2201',
      cliente: 'Komatsu Chile',
      estado: 'aprobado',
      fecha: 'Ayer',
      hora: '13 Oct, 09:20 AM',
      fechaCompleta: new Date(Date.now() - 86400000)
    }
  ])

  const [filtroActivo, setFiltroActivo] = useState<'todos' | 'aprobados' | 'revision' | 'rechazados'>('todos')
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
      case 'aprobado':
        return {
          icon: 'check_circle',
          bgColor: 'bg-green-100 dark:bg-green-900/20',
          textColor: 'text-green-600 dark:text-green-400',
          badgeBg: 'bg-green-50 dark:bg-green-900/30',
          badgeText: 'text-green-700 dark:text-green-400',
          badgeRing: 'ring-green-600/20',
          label: 'Aprobado'
        }
      case 'revision':
        return {
          icon: 'engineering',
          bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
          textColor: 'text-yellow-600 dark:text-yellow-400',
          badgeBg: 'bg-yellow-50 dark:bg-yellow-900/30',
          badgeText: 'text-yellow-700 dark:text-yellow-400',
          badgeRing: 'ring-yellow-600/20',
          label: 'En Revisión'
        }
      case 'rechazado':
        return {
          icon: 'cancel',
          bgColor: 'bg-red-100 dark:bg-red-900/20',
          textColor: 'text-red-600 dark:text-red-400',
          badgeBg: 'bg-red-50 dark:bg-red-900/30',
          badgeText: 'text-red-700 dark:text-red-400',
          badgeRing: 'ring-red-600/20',
          label: 'Rechazado'
        }
    }
  }

  // Filtrar inspecciones
  const inspeccionesFiltradas = inspecciones.filter(inspeccion => {
    const cumpleFiltro = filtroActivo === 'todos' ||
      (filtroActivo === 'aprobados' && inspeccion.estado === 'aprobado') ||
      (filtroActivo === 'revision' && inspeccion.estado === 'revision') ||
      (filtroActivo === 'rechazados' && inspeccion.estado === 'rechazado')

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
          onClick={() => setFiltroActivo('aprobados')}
          className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full px-4 transition-transform active:scale-95 ${
            filtroActivo === 'aprobados'
              ? 'bg-primary text-white shadow-md shadow-primary/20'
              : 'bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 text-slate-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
          }`}
        >
          <span className="text-sm font-medium">Aprobados</span>
        </button>

        <button
          onClick={() => setFiltroActivo('revision')}
          className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full px-4 transition-transform active:scale-95 ${
            filtroActivo === 'revision'
              ? 'bg-primary text-white shadow-md shadow-primary/20'
              : 'bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 text-slate-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
          }`}
        >
          <span className="text-sm font-medium">En Revisión</span>
        </button>

        <button
          onClick={() => setFiltroActivo('rechazados')}
          className={`flex h-9 shrink-0 items-center justify-center gap-x-2 rounded-full px-4 transition-transform active:scale-95 ${
            filtroActivo === 'rechazados'
              ? 'bg-primary text-white shadow-md shadow-primary/20'
              : 'bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 text-slate-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5'
          }`}
        >
          <span className="text-sm font-medium">Rechazados</span>
        </button>
      </div>

      {/* Main List Content */}
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
