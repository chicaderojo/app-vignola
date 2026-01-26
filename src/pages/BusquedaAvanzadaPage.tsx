import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

type FiltroBusqueda = 'orden' | 'empresa' | 'producto'
type EstadoOrden = 'proceso' | 'completado' | 'revision'

interface BusquedaReciente {
  id: string
  termino: string
  tipo: 'orden' | 'empresa' | 'producto'
  fecha: Date
}

interface ResultadoBusqueda {
  id: string
  codigo: string
  cliente: string
  producto: string
  estado: EstadoOrden
}

function BusquedaAvanzadaPage() {
  const navigate = useNavigate()

  const [busqueda, setBusqueda] = useState('')
  const [filtroActivo, setFiltroActivo] = useState<FiltroBusqueda>('orden')
  const [busquedasRecientes, setBusquedasRecientes] = useState<BusquedaReciente[]>([
    {
      id: '1',
      termino: 'Cilindro Hidráulico XL',
      tipo: 'producto',
      fecha: new Date()
    },
    {
      id: '2',
      termino: 'Minera Escondida',
      tipo: 'empresa',
      fecha: new Date()
    }
  ])

  // Mock data para resultados
  const resultados: ResultadoBusqueda[] = [
    {
      id: '1',
      codigo: 'ORD-5521',
      cliente: 'Mining Corp SA',
      producto: 'Cilindro Doble Acción - Tipo A',
      estado: 'proceso'
    },
    {
      id: '2',
      codigo: 'ORD-5109',
      cliente: 'Constructora del Norte',
      producto: 'Unidad Hidráulica Compacta',
      estado: 'completado'
    },
    {
      id: '3',
      codigo: 'ORD-5540',
      cliente: 'Forestal Arauco',
      producto: 'Pistón de Grúa M-200',
      estado: 'revision'
    }
  ]

  const handleClearSearch = () => {
    setBusqueda('')
  }

  const handleEliminarBusqueda = (id: string) => {
    setBusquedasRecientes(busquedasRecientes.filter(b => b.id !== id))
  }

  const handleVerResultado = (resultadoId: string) => {
    navigate(`/inspeccion/${resultadoId}/detalles`)
  }

  const getEstadoInfo = (estado: EstadoOrden) => {
    switch (estado) {
      case 'proceso':
        return {
          label: 'En Proceso',
          color: 'text-yellow-500',
          bg: 'bg-yellow-500/10',
          strip: 'bg-yellow-500'
        }
      case 'completado':
        return {
          label: 'Completado',
          color: 'text-green-500',
          bg: 'bg-green-500/10',
          strip: 'bg-green-500'
        }
      case 'revision':
        return {
          label: 'Revisión',
          color: 'text-blue-500',
          bg: 'bg-blue-500/10',
          strip: 'bg-blue-500'
        }
    }
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24">
      {/* Header & Search Fixed Area */}
      <div className="sticky top-0 z-20 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800 pb-2">
        {/* Top Bar */}
        <div className="px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => navigate('/')}
            className="text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Búsqueda Avanzada</h1>
          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-surface-dark overflow-hidden relative border border-gray-300 dark:border-gray-700">
            <img
              className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop"
              alt="Usuario"
            />
          </div>
        </div>

        {/* Search Bar */}
        <div className="px-4 pb-2">
          <div className="flex gap-2">
            <div className="flex flex-1 items-center bg-white dark:bg-surface-dark rounded-lg border border-gray-200 dark:border-gray-700 focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all overflow-hidden h-12 shadow-sm">
              <div className="pl-3 pr-2 text-gray-400">
                <span className="material-symbols-outlined text-[20px]">search</span>
              </div>
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="flex-1 bg-transparent border-none text-base placeholder-gray-400 dark:placeholder:text-gray-500 focus:ring-0 p-0 text-slate-900 dark:text-white"
                placeholder="Buscar orden, cliente o producto..."
              />
              {busqueda && (
                <button
                  onClick={handleClearSearch}
                  aria-label="Clear search"
                  className="pr-3 text-gray-400 hover:text-primary transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              )}
            </div>
            <button
              aria-label="Filter settings"
              className="h-12 w-12 flex items-center justify-center rounded-lg bg-slate-200 dark:bg-surface-dark border border-gray-300 dark:border-gray-700 text-slate-600 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-700 active:bg-gray-400 dark:active:bg-gray-600 transition-colors shrink-0"
            >
              <span className="material-symbols-outlined">tune</span>
            </button>
          </div>
        </div>

        {/* Filter Chips */}
        <div className="px-4 pt-1 pb-2 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 min-w-max">
            <button
              onClick={() => setFiltroActivo('orden')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium shadow-md transition-transform active:scale-95 ${
                filtroActivo === 'orden'
                  ? 'bg-primary text-white shadow-primary/20'
                  : 'bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
              Código de Orden
            </button>

            <button
              onClick={() => setFiltroActivo('empresa')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-transform active:scale-95 ${
                filtroActivo === 'empresa'
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">domain</span>
              Empresa
            </button>

            <button
              onClick={() => setFiltroActivo('producto')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-transform active:scale-95 ${
                filtroActivo === 'producto'
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">extension</span>
              Producto
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex flex-col w-full h-full overflow-y-auto">
        {/* Section: Recent Searches */}
        <div className="pt-4 pb-2">
          <h3 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider px-4 mb-2">
            Búsquedas Recientes
          </h3>
          <div className="flex flex-col">
            {busquedasRecientes.map((busqueda) => (
              <div
                key={busqueda.id}
                className="group flex items-center gap-4 px-4 py-3 hover:bg-gray-100 dark:hover:bg-white/5 cursor-pointer transition-colors active:bg-gray-200 dark:active:bg-white/10"
              >
                <div className="flex items-center justify-center rounded-lg bg-gray-200 dark:bg-surface-dark text-gray-500 dark:text-gray-400 shrink-0 h-10 w-10">
                  <span className="material-symbols-outlined text-[20px]">history</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {busqueda.termino}
                  </p>
                  <p className="text-xs text-gray-500 truncate capitalize">{busqueda.tipo}</p>
                </div>
                <button
                  onClick={() => handleEliminarBusqueda(busqueda.id)}
                  className="p-2 text-gray-400 hover:text-red-400 transition-colors"
                >
                  <span className="material-symbols-outlined text-[20px]">close</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="h-px w-full bg-gray-200 dark:bg-gray-800 my-2"></div>

        {/* Section: Results */}
        <div className="pt-2">
          <div className="flex items-center justify-between px-4 mb-3">
            <h3 className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">
              Resultados Sugeridos
            </h3>
            <span className="text-xs text-primary font-medium">{resultados.length} encontrados</span>
          </div>

          <div className="flex flex-col gap-3 px-4">
            {resultados.map((resultado) => {
              const estadoInfo = getEstadoInfo(resultado.estado)

              return (
                <div
                  key={resultado.id}
                  onClick={() => handleVerResultado(resultado.id)}
                  className="bg-white dark:bg-surface-dark rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm active:scale-[0.98] transition-transform cursor-pointer relative overflow-hidden group"
                >
                  {/* Status Strip */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${estadoInfo.strip}`}></div>

                  <div className="flex justify-between items-start mb-2 pl-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-bold ${estadoInfo.color} ${estadoInfo.bg} px-2 py-0.5 rounded uppercase tracking-wide`}>
                          {estadoInfo.label}
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                        #{resultado.codigo}
                      </h4>
                    </div>
                    <span className="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors">
                      chevron_right
                    </span>
                  </div>

                  <div className="space-y-2 pl-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <span className="material-symbols-outlined text-[18px] text-gray-400">apartment</span>
                      <span className="truncate">{resultado.cliente}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <span className="material-symbols-outlined text-[18px] text-gray-400">extension</span>
                      <span className="truncate">{resultado.producto}</span>
                    </div>
                  </div>
                </div>
              )
            })}

            {/* Loading State / More */}
            <div className="flex justify-center py-4">
              <div className="animate-pulse flex space-x-2 items-center text-gray-500 text-sm">
                <div className="h-2 w-2 bg-gray-500 rounded-full"></div>
                <div className="h-2 w-2 bg-gray-500 rounded-full"></div>
                <div className="h-2 w-2 bg-gray-500 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default BusquedaAvanzadaPage
