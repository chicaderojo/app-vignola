import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'

type Priority = 'normal' | 'urgent'
type Status = 'recepcion' | 'peritaje' | 'taller' | 'pruebas' | 'completado'

interface InspeccionPendiente {
  id: string
  codigo: string
  cliente: string
  equipo: string
  prioridad: Priority
  estado: Status
  fecha: string
  progreso: number
}

function InspeccionesPendientesPage() {
  const navigate = useNavigate()

  const [filtroActivo, setFiltroActivo] = useState<'todos' | 'peritaje' | 'pruebas' | 'urgentes'>('todos')
  const [busqueda, setBusqueda] = useState('')

  // Mock data para inspecciones pendientes
  const [inspecciones] = useState<InspeccionPendiente[]>([
    {
      id: '1',
      codigo: 'CH-9942-B',
      cliente: 'Minera Escondida',
      equipo: 'CAT 797F',
      prioridad: 'urgent',
      estado: 'peritaje',
      fecha: '12 Oct 2023',
      progreso: 58
    },
    {
      id: '2',
      codigo: 'CH-8821-X',
      cliente: 'BHP Billiton',
      equipo: 'Komatsu 930E',
      prioridad: 'normal',
      estado: 'pruebas',
      fecha: '15 Oct 2023',
      progreso: 66
    },
    {
      id: '3',
      codigo: 'CH-7750-A',
      cliente: 'Anglo American',
      equipo: 'Los Bronces',
      prioridad: 'normal',
      estado: 'recepcion',
      fecha: 'Hoy, 08:30 AM',
      progreso: 20
    },
    {
      id: '4',
      codigo: 'CH-6523-C',
      cliente: 'Codelco',
      equipo: 'Liebherr T282',
      prioridad: 'urgent',
      estado: 'peritaje',
      fecha: 'Ayer',
      progreso: 45
    }
  ])

  const handleNuevaInspeccion = () => {
    const inspeccionId = uuidv4()
    navigate(`/inspeccion/${inspeccionId}/recepcion`)
  }

  const handleContinuarInspeccion = (inspeccionId: string) => {
    const inspeccion = inspecciones.find(i => i.id === inspeccionId)
    if (!inspeccion) return

    // Navegar a la etapa correspondiente
    switch (inspeccion.estado) {
      case 'recepcion':
        navigate(`/inspeccion/${inspeccionId}/recepcion`)
        break
      case 'peritaje':
        navigate(`/inspeccion/${inspeccionId}/peritaje`)
        break
      case 'pruebas':
        navigate(`/inspeccion/${inspeccionId}/pruebas`)
        break
      default:
        navigate(`/inspeccion/${inspeccionId}/recepcion`)
    }
  }

  const getEstadoLabel = (estado: Status) => {
    switch (estado) {
      case 'recepcion': return 'Pendiente Inicio'
      case 'peritaje': return 'Pendiente Peritaje'
      case 'taller': return 'En Taller'
      case 'pruebas': return 'Esperando Banco de Pruebas'
      case 'completado': return 'Completado'
    }
  }

  const getProgresoColor = (estado: Status) => {
    switch (estado) {
      case 'recepcion': return 'bg-primary/50'
      case 'peritaje': return 'bg-primary'
      case 'taller': return 'bg-yellow-500'
      case 'pruebas': return 'bg-primary'
      case 'completado': return 'bg-green-500'
    }
  }

  // Filtrar inspecciones
  const inspeccionesFiltradas = inspecciones.filter(inspeccion => {
    const cumpleFiltro = filtroActivo === 'todos' ||
      (filtroActivo === 'peritaje' && inspeccion.estado === 'peritaje') ||
      (filtroActivo === 'pruebas' && inspeccion.estado === 'pruebas') ||
      (filtroActivo === 'urgentes' && inspeccion.prioridad === 'urgent')

    const cumpleBusqueda = !busqueda ||
      inspeccion.codigo.toLowerCase().includes(busqueda.toLowerCase()) ||
      inspeccion.cliente.toLowerCase().includes(busqueda.toLowerCase())

    return cumpleFiltro && cumpleBusqueda
  })

  const countPeritaje = inspecciones.filter(i => i.estado === 'peritaje').length
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
            <div className="flex items-center gap-1 bg-green-500/10 text-green-500 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
              <span className="size-2 bg-green-500 rounded-full animate-pulse"></span>
              Online
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

                  <p className="text-slate-400 dark:text-text-muted-dark text-xs">
                    Recibido: {inspeccion.fecha} •{' '}
                    <span className={inspeccion.estado === 'peritaje' ? 'text-primary font-semibold' : 'text-slate-300 dark:text-slate-400'}>
                      {getEstadoLabel(inspeccion.estado)}
                    </span>
                  </p>
                </div>

                {/* Action Buttons */}
                <div className={`gap-2 mt-2 ${inspeccion.estado === 'recepcion' ? 'flex' : 'flex'}`}>
                  <button
                    onClick={() => handleContinuarInspeccion(inspeccion.id)}
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
                    <>
                      <button className="w-12 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400">
                        <span className="material-symbols-outlined">more_vert</span>
                      </button>
                    </>
                  )}

                  {inspeccion.estado === 'pruebas' && (
                    <button className="w-12 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-700 text-slate-400">
                      <span className="material-symbols-outlined text-sm">history</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}

          {inspeccionesFiltradas.length === 0 && (
            <div className="text-center py-12">
              <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600">search_off</span>
              <p className="text-gray-500 dark:text-gray-400 mt-4">No se encontraron inspecciones pendientes</p>
            </div>
          )}
        </div>

        {/* Float Action Button (Quick New Inspection) */}
        <div className="fixed bottom-6 right-6">
          <button
            onClick={handleNuevaInspeccion}
            className="size-14 rounded-full bg-primary text-white shadow-2xl flex items-center justify-center active:scale-90 transition-transform"
          >
            <span className="material-symbols-outlined text-3xl">add</span>
          </button>
        </div>
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-background-dark border-t border-slate-200 dark:border-slate-800 px-6 py-2 flex justify-between items-center z-50 max-w-5xl mx-auto">
        <button
          onClick={() => navigate('/')}
          className="flex flex-col items-center gap-1 text-slate-400"
        >
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-[10px] font-bold">DASHBOARD</span>
        </button>

        <button className="flex flex-col items-center gap-1 text-primary">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>list_alt</span>
          <span className="text-[10px] font-bold">INSPECCIONES</span>
        </button>

        <button
          onClick={handleNuevaInspeccion}
          className="flex flex-col items-center gap-1 text-slate-400"
        >
          <span className="material-symbols-outlined">qr_code_scanner</span>
          <span className="text-[10px] font-bold">SCANNER</span>
        </button>

        <button className="flex flex-col items-center gap-1 text-slate-400">
          <span className="material-symbols-outlined">settings</span>
          <span className="text-[10px] font-bold">AJUSTES</span>
        </button>
      </nav>
    </div>
  )
}

export default InspeccionesPendientesPage
