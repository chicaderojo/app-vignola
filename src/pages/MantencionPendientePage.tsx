import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabaseService } from '../services/supabaseService'
import { BottomNavigation } from '../components/layout/BottomNavigation'

interface OrdenPendiente {
  id: string
  cilindroId: string
  cliente: string
  tipoCilindro: string
  progreso: number
  estado: 'pendiente_mantencion'
}

function MantencionPendientePage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [ordenes, setOrdenes] = useState<OrdenPendiente[]>([])

  useEffect(() => {
    cargarOrdenes()
  }, [])

  const cargarOrdenes = async () => {
    try {
      setLoading(true)
      const data = await supabaseService.getMantenimientosPendientes()

      // Mapear a formato de orden pendiente
      const ordenesPendientes = data.map((inspeccion: any) => ({
        id: inspeccion.id,
        cilindroId: (inspeccion.cilindro as any)?.id_codigo || inspeccion.cilindro_id,
        cliente: inspeccion.nombre_cliente || 'Cliente no especificado',
        tipoCilindro: (inspeccion.cilindro as any)?.tipo || 'Oleohidráulico',
        progreso: 50,
        estado: 'pendiente_mantencion' as const
      }))

      setOrdenes(ordenesPendientes)
    } catch (error) {
      console.error('Error cargando órdenes pendientes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleContinuarMantencion = (ordenId: string) => {
    navigate(`/inspeccion/${ordenId}/registro-mantencion`)
  }

  const handleBack = () => {
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24 max-w-md mx-auto">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center p-4 justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div className="flex flex-col">
              <h2 className="text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-white">Nueva Mantención</h2>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Órdenes al 50%</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6">
        {/* Info Section */}
        <div className="bg-success/10 dark:bg-success/20 rounded-xl p-4 border border-success/20 dark:border-success/30 mb-6">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-success text-[24px]">info</span>
            <div>
              <p className="text-sm text-success-900 dark:text-success-200 font-medium mb-1">Órdenes listas para mantención</p>
              <p className="text-xs text-success-700 dark:text-success-300">
                Se muestran las órdenes con peritaje completado (50%) que requieren mantención para alcanzar el 100%.
              </p>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-success"></div>
          </div>
        ) : (
          <div className="space-y-4">
            {ordenes.map((orden) => (
              <div
                key={orden.id}
                className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-sm border border-gray-200 dark:border-gray-800"
              >
                <div className="p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-warning/10 text-warning uppercase tracking-wider mb-2">
                        Pendiente de Mantención
                      </span>
                      <h3 className="text-xl font-bold text-primary dark:text-white">ID: {orden.cilindroId}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-success">50%</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Progreso</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-gray-400 text-sm">business</span>
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{orden.cliente}</p>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <span className="material-symbols-outlined text-gray-400 text-sm">settings</span>
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">{orden.tipoCilindro}</p>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-2 mb-4">
                    <div className="h-2.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-success rounded-full transition-all duration-500"
                        style={{ width: '50%' }}
                      ></div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleContinuarMantencion(orden.id)}
                    className="w-full bg-success hover:bg-success/90 text-white rounded-lg font-bold py-3 px-4 shadow-md shadow-success/20 flex items-center justify-center gap-2 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[20px]">build</span>
                    <span>Continuar Mantención</span>
                  </button>
                </div>
              </div>
            ))}

            {ordenes.length === 0 && (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600">inventory_2</span>
                <p className="text-gray-500 dark:text-gray-400 mt-4 font-medium">No hay órdenes pendientes de mantención</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                  Las órdenes con peritaje completado aparecerán aquí
                </p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  )
}

export default MantencionPendientePage
