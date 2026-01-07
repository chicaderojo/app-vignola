import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PlusIcon, MagnifyingGlassIcon, UserIcon } from '@heroicons/react/24/outline'
import { authService } from '../services/api'
import { Cliente, Cilindro } from '../types'
import { v4 as uuidv4 } from 'uuid'

function DashboardPage() {
  const navigate = useNavigate()
  const user = authService.getCurrentUser()

  const [clientes, setClientes] = useState<Cliente[]>([])
  const [clienteSeleccionado, setClienteSeleccionado] = useState<string>('')
  const [busqueda, setBusqueda] = useState('')
  const [cilindroEncontrado, setCilindroEncontrado] = useState<Cilindro | null>(null)
  const [loading, setLoading] = useState(false)
  const [syncStatus, setSyncStatus] = useState({ pendiente: false, numero_items: 0, online: true })

  // Cargar clientes al montar
  useEffect(() => {
    cargarClientes()
    verificarEstadoOnline()
  }, [])

  // Escuchar cambios de conexión
  useEffect(() => {
    const handleOnline = () => setSyncStatus(prev => ({ ...prev, online: true }))
    const handleOffline = () => setSyncStatus(prev => ({ ...prev, online: false }))

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const cargarClientes = async () => {
    // TODO: Cargar desde API o cache local
    setClientes([
      { id: '1', nombre: 'Arauco', planta: 'Constitución' },
      { id: '2', nombre: 'GLV', planta: 'San Fernando' },
      { id: '3', nombre: 'CMPC', planta: 'Laja' }
    ])
  }

  const verificarEstadoOnline = () => {
    setSyncStatus({
      pendiente: false,
      numero_items: 0,
      online: navigator.onLine
    })
  }

  const handleNuevaInspeccion = () => {
    if (!cilindroEncontrado) {
      alert('Primero debes buscar o seleccionar un cilindro')
      return
    }

    const inspeccionId = uuidv4()
    navigate(`/inspeccion/${inspeccionId}/recepcion`, {
      state: { cilindro: cilindroEncontrado }
    })
  }

  const handleBuscarCilindro = async () => {
    if (!busqueda.trim()) return

    setLoading(true)

    // TODO: Buscar en API o cache local por ID o SAP
    // Simulación
    setTimeout(() => {
      setCilindroEncontrado({
        id_codigo: busqueda.toUpperCase(),
        tipo: 'Oleohidráulico',
        fabricante: 'Rexroth',
        diametro_camisa: 'Ø63',
        diametro_vastago: 'Ø36',
        carrera: '100mm',
        cliente_id: clienteSeleccionado || undefined
      })
      setLoading(false)
    }, 500)
  }

  const handleCrearNuevoCliente = () => {
    // TODO: Implementar modal para crear cliente
    alert('Funcionalidad de crear cliente pendiente')
  }

  const handleCrearNuevoEquipo = () => {
    // TODO: Implementar modal para crear nuevo equipo
    alert('Funcionalidad de crear equipo pendiente')
  }

  const handleCerrarSesion = () => {
    authService.logout()
    window.location.href = '/login'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Vignola</h1>
              <p className="text-sm text-gray-600">Inspección Hidráulica</p>
            </div>

            <div className="flex items-center gap-4">
              {/* Estado de sincronización */}
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
                syncStatus.online
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}>
                <span className="w-2 h-2 rounded-full bg-current"></span>
                {syncStatus.online ? 'En línea' : 'Sin conexión'}
              </div>

              {/* Usuario */}
              <div className="flex items-center gap-2">
                <UserIcon className="w-5 h-5 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  {user?.nombre || 'Mecánico'}
                </span>
              </div>

              <button
                onClick={handleCerrarSesion}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Filtros de clientes */}
          <section className="card">
            <h2 className="card-header">Seleccionar Cliente</h2>

            <div className="flex flex-wrap gap-3 mb-4">
              {clientes.map((cliente) => (
                <button
                  key={cliente.id}
                  onClick={() => setClienteSeleccionado(cliente.id)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    clienteSeleccionado === cliente.id
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cliente.nombre}
                </button>
              ))}
            </div>

            <button
              onClick={handleCrearNuevoCliente}
              className="btn-secondary"
            >
              + Nuevo Cliente
            </button>
          </section>

          {/* Buscador de cilindros */}
          <section className="card">
            <h2 className="card-header">Buscar Cilindro</h2>

            <div className="flex gap-3">
              <input
                type="text"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleBuscarCilindro()}
                className="input-field flex-1"
                placeholder="ID del cilindro (ej: CE05CIL0513) o SAP del cliente"
                disabled={loading}
              />

              <button
                onClick={handleBuscarCilindro}
                disabled={loading || !busqueda.trim()}
                className="btn-primary flex items-center gap-2"
              >
                <MagnifyingGlassIcon className="w-5 h-5" />
                {loading ? 'Buscando...' : 'Buscar'}
              </button>

              <button
                onClick={handleCrearNuevoEquipo}
                className="btn-secondary"
              >
                + Nuevo Equipo
              </button>
            </div>
          </section>

          {/* Resultado de búsqueda */}
          {cilindroEncontrado && (
            <section className="card border-l-4 border-l-primary-600">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Cilindro Encontrado
                  </h3>
                  <dl className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <dt className="text-gray-600">Código:</dt>
                      <dd className="font-medium">{cilindroEncontrado.id_codigo}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-600">Tipo:</dt>
                      <dd className="font-medium">{cilindroEncontrado.tipo}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-600">Fabricante:</dt>
                      <dd className="font-medium">{cilindroEncontrado.fabricante || 'N/A'}</dd>
                    </div>
                    <div>
                      <dt className="text-gray-600">Carrera:</dt>
                      <dd className="font-medium">{cilindroEncontrado.carrera || 'N/A'}</dd>
                    </div>
                  </dl>
                </div>

                <button
                  onClick={handleNuevaInspeccion}
                  className="btn-primary flex items-center gap-2"
                >
                  <PlusIcon className="w-5 h-5" />
                  Nueva Inspección
                </button>
              </div>
            </section>
          )}

          {/* Inspecciones recientes */}
          <section className="card">
            <h2 className="card-header">Inspecciones Recientes</h2>
            <p className="text-gray-600 text-sm">
              No hay inspecciones recientes. Inicia una nueva inspección para verla aquí.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}

export default DashboardPage
