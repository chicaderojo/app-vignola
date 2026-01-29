import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabaseService } from '../services/supabaseService'
import { BottomNavigation } from '../components/layout/BottomNavigation'

type FiltroBusqueda = 'cliente' | 'fecha' | 'orden'
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

interface Inspeccion {
  id: string
  sap_cliente: string | null
  nombre_cliente: string | null
  cilindro_id: string
  estado_inspeccion: string
  created_at: string
}

function BusquedaAvanzadaPage() {
  const navigate = useNavigate()

  const [busqueda, setBusqueda] = useState('')
  const [filtroActivo, setFiltroActivo] = useState<FiltroBusqueda>('orden')
  const [busquedasRecientes, setBusquedasRecientes] = useState<BusquedaReciente[]>([])
  const [resultados, setResultados] = useState<Inspeccion[]>([])
  const [loadingResultados, setLoadingResultados] = useState(false)

  // Cargar búsquedas recientes desde BD
  useEffect(() => {
    const cargarBusquedasRecientes = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        const data = await supabaseService.getBusquedasRecientes(user.id, 5)

        const busquedasMapeadas: BusquedaReciente[] = data.map((b: any) => ({
          id: b.id,
          termino: b.termino,
          tipo: b.tipo === 'general' ? 'orden' : b.tipo as 'orden' | 'empresa' | 'producto',
          fecha: new Date(b.fecha)
        }))

        setBusquedasRecientes(busquedasMapeadas)
      } catch (error) {
        console.error('Error cargando búsquedas recientes:', error)
        // En caso de error, dejar array vacío
        setBusquedasRecientes([])
      }
    }

    cargarBusquedasRecientes()
  }, [])

  // Buscar inspecciones en tiempo real
  useEffect(() => {
    const buscarInspecciones = async () => {
      if (!busqueda.trim()) {
        setResultados([])
        return
      }

      setLoadingResultados(true)
      try {
        const resultadosBD = await supabaseService.buscarInspecciones(
          busqueda,
          filtroActivo
        )
        setResultados(resultadosBD)
      } catch (error) {
        console.error('Error buscando:', error)
        setResultados([])
      } finally {
        setLoadingResultados(false)
      }
    }

    const delayDebounce = setTimeout(() => {
      buscarInspecciones()
    }, 500)

    return () => clearTimeout(delayDebounce)
  }, [busqueda, filtroActivo])

  const handleClearSearch = () => {
    setBusqueda('')
  }

  const handleEliminarBusqueda = (id: string) => {
    setBusquedasRecientes(busquedasRecientes.filter(b => b.id !== id))
  }

  const handleVerResultado = (resultadoId: string) => {
    navigate(`/inspeccion/${resultadoId}/detalles`)
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
              onClick={() => setFiltroActivo('cliente')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium shadow-md transition-transform active:scale-95 ${
                filtroActivo === 'cliente'
                  ? 'bg-primary text-white shadow-primary/20'
                  : 'bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">apartment</span>
              Cliente
            </button>

            <button
              onClick={() => setFiltroActivo('fecha')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-transform active:scale-95 ${
                filtroActivo === 'fecha'
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">calendar_today</span>
              Fecha
            </button>

            <button
              onClick={() => setFiltroActivo('orden')}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-transform active:scale-95 ${
                filtroActivo === 'orden'
                  ? 'bg-primary text-white shadow-md shadow-primary/20'
                  : 'bg-white dark:bg-surface-dark border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">receipt_long</span>
              Orden de Trabajo
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
              Resultados de Búsqueda
            </h3>
            {busqueda && !loadingResultados && (
              <span className="text-xs text-primary font-medium">{resultados.length} encontrados</span>
            )}
          </div>

          {/* Loading State */}
          {loadingResultados && (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          )}

          {/* Empty State */}
          {!loadingResultados && busqueda && resultados.length === 0 && (
            <div className="px-4 py-8 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No se encontraron resultados para "{busqueda}"
              </p>
            </div>
          )}

          {/* Resultados */}
          {!loadingResultados && resultados.length > 0 && (
            <div className="flex flex-col gap-3 px-4">
              {resultados.map((inspeccion) => (
                <div
                  key={inspeccion.id}
                  onClick={() => handleVerResultado(inspeccion.id)}
                  className="bg-white dark:bg-surface-dark rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm active:scale-[0.98] transition-transform cursor-pointer relative overflow-hidden group"
                >
                  {/* Status Strip según estado_inspeccion */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                    inspeccion.estado_inspeccion === 'completado' ? 'bg-green-500' :
                    inspeccion.estado_inspeccion === 'en_progreso' ? 'bg-yellow-500' :
                    'bg-blue-500'
                  }`}></div>

                  <div className="flex justify-between items-start mb-2 pl-2">
                    <div>
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white">
                        #{inspeccion.sap_cliente || inspeccion.id.slice(0, 8)}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {new Date(inspeccion.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="material-symbols-outlined text-gray-400 group-hover:text-primary transition-colors">
                      chevron_right
                    </span>
                  </div>

                  <div className="space-y-2 pl-2">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <span className="material-symbols-outlined text-[18px] text-gray-400">apartment</span>
                      <span className="truncate">{inspeccion.nombre_cliente || 'Cliente'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                      <span className="material-symbols-outlined text-[18px] text-gray-400">extension</span>
                      <span className="truncate">{inspeccion.cilindro_id}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNavigation />
    </div>
  )
}

export default BusquedaAvanzadaPage
