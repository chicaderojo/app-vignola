import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'

type Prioridad = 'normal' | 'urgente'
type Etapa = 'recepcion' | 'peritaje' | 'taller'
type Estado = 'pendiente_inicio' | 'pendiente_peritaje' | 'esperando_banco' | 'en_progreso'

interface InspeccionPendiente {
  id: string
  codigo: string
  cliente: string
  equipo: string
  prioridad: Prioridad
  etapa: Etapa
  estado: Estado
  fechaRecibido: string
  progreso: number
}

function InspeccionesPendientesPage() {
  const navigate = useNavigate()

  // Mock data para inspecciones pendientes
  const [inspecciones, setInspecciones] = useState<InspeccionPendiente[]>([
    {
      id: '1',
      codigo: 'CH-9942-B',
      cliente: 'Minera Escondida',
      equipo: 'CAT 797F',
      prioridad: 'urgente',
      etapa: 'peritaje',
      estado: 'pendiente_peritaje',
      fechaRecibido: '12 Oct 2023',
      progreso: 58
    },
    {
      id: '2',
      codigo: 'CH-8821-X',
      cliente: 'BHP Billiton',
      equipo: 'Komatsu 930E',
      prioridad: 'normal',
      etapa: 'taller',
      estado: 'esperando_banco',
      fechaRecibido: '15 Oct 2023',
      progreso: 66
    },
    {
      id: '3',
      codigo: 'CH-7750-A',
      cliente: 'Anglo American',
      equipo: 'Los Bronces',
      prioridad: 'normal',
      etapa: 'recepcion',
      estado: 'pendiente_inicio',
      fechaRecibido: 'Hoy, 08:30 AM',
      progreso: 20
    }
  ])

  const [filtroActivo, setFiltroActivo] = useState<'todos' | 'inspeccion' | 'mantencion' | 'finalizados'>('todos')
  const [busqueda, setBusqueda] = useState('')

  const handleContinuar = (inspeccionId: string) => {
    navigate(`/inspeccion/${inspeccionId}/recepcion`)
  }

  const handleMantencion = (inspeccionId: string) => {
    navigate(`/mantenimiento/${inspeccionId}`)
  }

  const handleIniciarPeritaje = (inspeccionId: string) => {
    navigate(`/inspeccion/${inspeccionId}/peritaje`)
  }

  const handleNuevaInspeccion = () => {
    const inspeccionId = uuidv4()
    navigate(`/inspeccion/${inspeccionId}/recepcion`)
  }

  const getEtapaInfo = (etapa: Etapa) => {
    switch (etapa) {
      case 'recepcion':
        return 'Recepción'
      case 'peritaje':
        return 'Peritaje'
      case 'taller':
        return 'Hidráulica'
    }
  }

  const getEstadoLabel = (estado: Estado) => {
    switch (estado) {
      case 'pendiente_inicio':
        return 'Pendiente Inicio'
      case 'pendiente_peritaje':
        return 'Pendiente Peritaje'
      case 'esperando_banco':
        return 'Esperando Banco de Pruebas'
      case 'en_proceso':
        return 'En Proceso'
    }
  }

  // Filtrar inspecciones
  const inspeccionesFiltradas = inspecciones.filter(inspeccion => {
    const cumpleFiltro = filtroActivo === 'todos' ||
      (filtroActivo === 'inspeccion' && (inspeccion.etapa === 'recepcion' || inspeccion.etapa === 'peritaje')) ||
      (filtroActivo === 'mantencion' && inspeccion.etapa === 'taller') ||
      (filtroActivo === 'finalizados' && inspeccion.progreso === 100)

    const cumpleBusqueda = !busqueda ||
      inspeccion.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
      inspeccion.cliente.toLowerCase().includes(busqueda.toLowerCase())

    return cumpleFiltro && cumpleBusqueda
  })

  const getContadorFiltro = (filtro: typeof filtroActivo) => {
    switch (filtro) {
      case 'todos':
        return inspecciones.length
      case 'inspeccion':
        return inspecciones.filter(i => i.etapa === 'recepcion' || i.etapa === 'peritaje').length
      case 'mantencion':
        return inspecciones.filter(i => i.etapa === 'taller').length
      case 'finalizados':
        return inspecciones.filter(i => i.progreso === 100).length
    }
  }

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
            <h2 className="text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-white">Inspecciones Pendientes</h2>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-green-500/10 text-green-500 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
              <span className="size-2 bg-green-500 rounded-full animate-pulse"></span>
              Online
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto">
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
        <div className="flex gap-2 px-4 pb-4 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setFiltroActivo('todos')}
            className={`flex h-9 shrink-0 items-center justify-center gap-2 rounded-full px-5 transition-transform active:scale-95 ${
              filtroActivo === 'todos'
                ? 'bg-primary text-white'
                : 'bg-white dark:bg-surface-card border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white'
            }`}
          >
            <span className="text-sm font-semibold">Todos ({getContadorFiltro('todos')})</span>
          </button>

          <button
            onClick={() => setFiltroActivo('inspeccion')}
            className={`flex h-9 shrink-0 items-center justify-center gap-2 rounded-full px-5 transition-transform active:scale-95 ${
              filtroActivo === 'inspeccion'
                ? 'bg-primary text-white'
                : 'bg-white dark:bg-surface-card border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white'
            }`}
          >
            <span className="text-sm font-medium">Inspección</span>
            <span className="bg-primary/20 text-primary text-[10px] px-1.5 rounded-full">{getContadorFiltro('inspeccion')}</span>
          </button>

          <button
            onClick={() => setFiltroActivo('mantencion')}
            className={`flex h-9 shrink-0 items-center justify-center gap-2 rounded-full px-5 transition-transform active:scale-95 ${
              filtroActivo === 'mantencion'
                ? 'bg-primary text-white'
                : 'bg-white dark:bg-surface-card border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white'
            }`}
          >
            <span className="text-sm font-medium">Mantención</span>
            <span className="bg-primary/20 text-primary text-[10px] px-1.5 rounded-full">{getContadorFiltro('mantencion')}</span>
          </button>

          <button
            onClick={() => setFiltroActivo('finalizados')}
            className={`flex h-9 shrink-0 items-center justify-center gap-2 rounded-full px-5 transition-transform active:scale-95 ${
              filtroActivo === 'finalizados'
                ? 'bg-primary text-white'
                : 'bg-white dark:bg-surface-card border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-white'
            }`}
          >
            <span className="text-sm font-medium">Finalizados</span>
            <span className="bg-primary/20 text-primary text-[10px] px-1.5 rounded-full">{getContadorFiltro('finalizados')}</span>
          </button>
        </div>

        {/* Section Header */}
        <div className="flex items-center justify-between px-4 pt-2 pb-2">
          <h3 className="text-slate-900 dark:text-white text-base font-bold uppercase tracking-widest">Lista de Trabajo</h3>
          <span className="text-slate-500 text-xs font-medium uppercase">Última act: 10:45 AM</span>
        </div>

        {/* Inspection Cards List */}
        <div className="flex flex-col gap-4 p-4">
          {inspeccionesFiltradas.map((inspeccion) => (
            <div
              key={inspeccion.id}
              className={`relative overflow-hidden group ${
                inspeccion.prioridad === 'urgente' ? '' : ''
              }`}
            >
              <div
                className={`flex flex-col rounded-xl border bg-white dark:bg-surface-dark shadow-sm overflow-hidden ${
                  inspeccion.prioridad === 'urgente'
                    ? 'border-red-500/30 shadow-lg'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {inspeccion.prioridad === 'urgente' && (
                  <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                )}

                <div className="p-4 flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      {inspeccion.prioridad === 'urgente' && (
                        <p className="text-red-500 text-[10px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">priority_high</span>
                          Prioridad Alta
                        </p>
                      )}
                      {inspeccion.etapa === 'taller' && (
                        <p className="text-primary text-[10px] font-bold uppercase tracking-wider mb-1">
                          Prueba Hidráulica
                        </p>
                      )}
                      {inspeccion.etapa === 'recepcion' && (
                        <p className="text-slate-400 dark:text-text-muted-dark text-[10px] font-bold uppercase tracking-wider mb-1">
                          Recién Ingresado
                        </p>
                      )}
                      <h4 className="text-slate-900 dark:text-white text-xl font-black tracking-tight">
                        {inspeccion.codigo}
                      </h4>
                      <p className="text-slate-500 dark:text-text-muted-dark text-sm font-medium">
                        {inspeccion.cliente} • {inspeccion.equipo}
                      </p>
                    </div>
                    {inspeccion.prioridad !== 'urgente' && inspeccion.etapa === 'recepcion' && (
                      <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg">
                        <span className="material-symbols-outlined text-slate-400">precision_manufacturing</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 py-2">
                    {inspeccion.etapa !== 'recepcion' && (
                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-text-muted-dark">
                        <span>Recepción</span>
                        <span>{getEtapaInfo(inspeccion.etapa)}</span>
                        {inspeccion.etapa === 'recepcion' && <span className="opacity-40">Taller</span>}
                      </div>
                    )}

                    <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full flex">
                      <div className="bg-green-500 h-full rounded-l-full" style={{ width: `${inspeccion.progreso}%` }}></div>
                      {inspeccion.etapa === 'peritaje' && (
                        <div className="bg-primary h-full w-1/4 animate-pulse"></div>
                      )}
                    </div>

                    <p className="text-slate-400 dark:text-text-muted-dark text-xs">
                      Recibido: {inspeccion.fechaRecibido} •{' '}
                      <span className={inspeccion.etapa === 'peritaje' ? 'text-primary font-semibold' : 'text-slate-300 dark:text-slate-400'}>
                        {getEstadoLabel(inspeccion.estado)}
                      </span>
                    </p>
                  </div>

                  <div className="flex gap-2 mt-2">
                    {inspeccion.etapa === 'recepcion' ? (
                      <button
                        onClick={() => handleIniciarPeritaje(inspeccion.id)}
                        className="w-full flex items-center justify-center gap-2 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-white font-bold py-3 text-sm active:scale-95"
                      >
                        INICIAR PERITAJE
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => inspeccion.etapa === 'taller' ? handleMantencion(inspeccion.id) : handleContinuar(inspeccion.id)}
                          className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-primary text-white font-bold py-3 text-sm transition-transform active:scale-95"
                        >
                          {inspeccion.etapa === 'taller' ? <span className="material-symbols-outlined text-sm">build</span> : <span className="material-symbols-outlined text-sm">play_arrow</span>}
                          {inspeccion.etapa === 'taller' ? 'MANTENCIÓN' : 'CONTINUAR'}
                        </button>
                        <button className="w-12 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400">
                          <span className="material-symbols-outlined">more_vert</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {inspeccionesFiltradas.length === 0 && (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600">inbox</span>
              <p className="text-gray-500 dark:text-gray-400 mt-4">No hay inspecciones pendientes</p>
            </div>
          )}
        </div>
      </main>

      {/* Float Action Button (Quick New Inspection) */}
      <div className="fixed bottom-6 right-6">
        <button
          onClick={handleNuevaInspeccion}
          className="size-14 rounded-full bg-primary text-white shadow-2xl flex items-center justify-center active:scale-90 transition-transform"
        >
          <span className="material-symbols-outlined text-3xl">add</span>
        </button>
      </div>
    </div>
  )
}

export default InspeccionesPendientesPage
