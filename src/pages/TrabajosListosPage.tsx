import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabaseService } from '../services/supabaseService'
import { generatePeritajePDF } from '../services/pdfService'

type TabType = 'finalizados' | 'mantencion' | 'inspeccion'

interface TrabajoListo {
  id: string
  codigo: string
  cliente: string
  tipoTrabajo: string
  fechaTermino: string
  horaTermino: string
  fotoUrl: string
}

function TrabajosListosPage() {
  const navigate = useNavigate()

  const [tabActiva, setTabActiva] = useState<TabType>('finalizados')
  const [trabajos, setTrabajos] = useState<TrabajoListo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [fechaFiltro, setFechaFiltro] = useState('')

  // Cargar trabajos desde Supabase
  useEffect(() => {
    cargarTrabajos()
    setFechaFiltro(new Date().toLocaleDateString('es-CL', {
      day: 'numeric',
      month: 'long'
    }))
  }, [])

  const cargarTrabajos = async () => {
    try {
      setLoading(true)
      setError(null)

      // Cargar inspecciones completas y sincronizadas
      const datos = await supabaseService.getInspecciones()

      // Filtrar solo completas y sincronizadas
      const completas = datos.filter((insp: any) =>
        insp.estado_inspeccion === 'completa' || insp.estado_inspeccion === 'sincronizada'
      )

      // Transformar al formato de TrabajoListo
      const listaTransformada: TrabajoListo[] = completas.map((insp: any) => {
        const cilindro = insp.cilindro as any
        const fecha = new Date(insp.created_at)

        // Determinar tipo de trabajo basado en detalles
        let tipoTrabajo = 'Inspección Pericial'
        if (insp.presion_prueba > 0) {
          tipoTrabajo = 'Pruebas Hidrostáticas'
        } else if (insp.notas_recepcion) {
          tipoTrabajo = 'Mantenimiento Correctivo'
        }

        return {
          id: insp.id,
          codigo: cilindro?.id_codigo || insp.cilindro_id,
          cliente: cilindro?.cliente?.nombre || 'Cliente',
          tipoTrabajo,
          fechaTermino: fecha.toLocaleDateString('es-CL', { day: '2-digit', month: 'short' }),
          horaTermino: fecha.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
          fotoUrl: insp.foto_armado_url || 'https://images.unsplash.com/photo-1565437039782-5c26a670f0cf?w=400&h=300&fit=crop'
        }
      })

      setTrabajos(listaTransformada)
    } catch (err: any) {
      console.error('Error cargando trabajos:', err)
      setError(err.message || 'Error al cargar trabajos')
    } finally {
      setLoading(false)
    }
  }

  const handleVerResumen = (trabajoId: string) => {
    navigate(`/inspeccion/${trabajoId}/detalles`)
  }

  const handleGenerarPDF = async (trabajoId: string) => {
    try {
      // Obtener datos completos de la inspección
      const inspeccionData = await supabaseService.getInspeccionCompleta(trabajoId)

      if (!inspeccionData) {
        alert('Error: No se pudieron cargar los datos de la inspección')
        return
      }

      // Mapear detalles de BD al formato de componentes UI
      const componentesUI = inspeccionData.detalles.map(det => {
        let estado: 'pending' | 'bueno' | 'mantencion' | 'cambio' = 'pending'
        if (det.estado === 'Bueno') estado = 'bueno'
        else if (det.estado === 'Mantención') estado = 'mantencion'
        else if (det.estado === 'Cambio') estado = 'cambio'

        return {
          id: det.id,
          nombre: det.componente,
          estado,
          observaciones: det.observaciones || det.detalle_tecnico || '',
          fotos: [],
          expandido: estado !== 'pending' && estado !== 'bueno'
        }
      })

      // Generar PDF
      await generatePeritajePDF(inspeccionData, componentesUI)

      alert('✅ PDF generado exitosamente')
    } catch (error: any) {
      console.error('Error generando PDF:', error)
      alert(`Error al generar PDF: ${error.message}`)
    }
  }

  const handleReingreso = async (trabajoId: string) => {
    if (confirm('¿Deseas crear un reingreso para esta inspección? Se creará una nueva inspección basada en los datos de esta.')) {
      try {
        // Crear nueva inspección basada en la existente
        const inspeccionOriginal = await supabaseService.getInspeccionById(trabajoId)
        if (inspeccionOriginal) {
          const nuevaInspeccion = {
            cilindro_id: inspeccionOriginal.cilindro_id,
            usuario_id: inspeccionOriginal.usuario_id,
            sap_cliente: inspeccionOriginal.sap_cliente,
            foto_armado_url: '',
            foto_despiece_url: '',
            presion_prueba: 0,
            fuga_interna: false,
            fuga_externa: false,
            estado_inspeccion: 'borrador' as const,
            created_at: new Date().toISOString()
          }

          const nueva = await supabaseService.createInspeccion(nuevaInspeccion)
          navigate(`/inspeccion/${nueva.id}/recepcion`)
        }
      } catch (error: any) {
        console.error('Error creando reingreso:', error)
        alert('Error al crear reingreso')
      }
    }
  }

  // Filtrar trabajos por tab
  const trabajosFiltrados = trabajos.filter(trabajo => {
    if (tabActiva === 'finalizados') return true
    if (tabActiva === 'mantencion') return trabajo.tipoTrabajo === 'Mantenimiento Correctivo'
    if (tabActiva === 'inspeccion') return trabajo.tipoTrabajo === 'Inspección Pericial'
    return true
  })

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24">
      {/* TopAppBar */}
      <header className="sticky top-0 z-50 flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => navigate('/')}
          className="text-slate-900 dark:text-white flex size-12 shrink-0 items-center justify-start rounded-lg active:bg-gray-200 dark:active:bg-white/10 transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back_ios</span>
        </button>
        <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight flex-1 text-center">
          Trabajos Listos
        </h2>
        <div className="flex w-12 items-center justify-end">
          <button className="flex size-12 items-center justify-center rounded-lg bg-transparent text-slate-900 dark:text-white">
            <span className="material-symbols-outlined">search</span>
          </button>
        </div>
      </header>

      {/* Tabs Section */}
      <nav className="pb-3 sticky top-[72px] z-40 bg-background-light dark:bg-background-dark">
        <div className="flex border-b border-gray-200 dark:border-gray-700 px-4 gap-8 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setTabActiva('finalizados')}
            className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 whitespace-nowrap transition-colors ${
              tabActiva === 'finalizados'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 dark:text-slate-400'
            }`}
          >
            <p className="text-sm font-bold leading-normal tracking-tight">Finalizados</p>
          </button>
          <button
            onClick={() => setTabActiva('mantencion')}
            className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 whitespace-nowrap transition-colors ${
              tabActiva === 'mantencion'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 dark:text-slate-400'
            }`}
          >
            <p className="text-sm font-bold leading-normal tracking-tight">Mantención</p>
          </button>
          <button
            onClick={() => setTabActiva('inspeccion')}
            className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 whitespace-nowrap transition-colors ${
              tabActiva === 'inspeccion'
                ? 'border-primary text-primary'
                : 'border-transparent text-slate-500 dark:text-slate-400'
            }`}
          >
            <p className="text-sm font-bold leading-normal tracking-tight">Inspección</p>
          </button>
        </div>
      </nav>

      <main className="flex-1 overflow-y-auto pb-20">
        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
            <p className="text-slate-500 dark:text-slate-400">Cargando trabajos...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <span className="material-symbols-outlined text-6xl text-red-500 mb-4">error</span>
            <p className="text-red-600 dark:text-red-400 text-center mb-4">{error}</p>
            <button
              onClick={cargarTrabajos}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Reintentar
            </button>
          </div>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {/* Summary Actions Filter */}
            <div className="px-4 pt-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                  Hoy, {fechaFiltro}
                </span>
                <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded">
                  {trabajosFiltrados.length} Trabajos
                </span>
              </div>
            </div>

            {/* Cards */}
            {trabajosFiltrados.length === 0 ? (
              <div className="text-center py-12">
                <span className="material-symbols-outlined text-6xl text-gray-300 dark:text-gray-600">search_off</span>
                <p className="text-gray-500 dark:text-gray-400 mt-4">No se encontraron trabajos</p>
              </div>
            ) : (
              trabajosFiltrados.map((trabajo) => (
                <div key={trabajo.id} className="p-4 pt-0">
                  <div className="flex flex-col items-stretch justify-start rounded-xl shadow-sm bg-white dark:bg-surface-card border border-gray-200 dark:border-gray-800 overflow-hidden">
                    {/* Image */}
                    <div className="relative w-full h-32 bg-center bg-no-repeat bg-cover"
                         style={{ backgroundImage: `url("${trabajo.fotoUrl}")` }}>
                      <div className="absolute top-2 right-2 bg-success text-white text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 shadow-md">
                        <span className="material-symbols-outlined !text-[12px]">check_circle</span>
                        FINALIZADO
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex w-full grow flex-col items-stretch justify-center gap-1 p-4">
                      <p className="text-primary text-xs font-bold uppercase tracking-wider">{trabajo.tipoTrabajo}</p>
                      <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-tight">
                        Cilindro {trabajo.codigo}
                      </h3>

                      <div className="mt-2 space-y-1">
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <span className="material-symbols-outlined !text-[18px]">factory</span>
                          <p className="text-sm font-normal">{trabajo.cliente}</p>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
                          <span className="material-symbols-outlined !text-[18px]">calendar_today</span>
                          <p className="text-sm font-normal">Terminado: {trabajo.fechaTermino} | {trabajo.horaTermino}</p>
                        </div>
                      </div>

                      {/* Actions Bar */}
                      <div className="flex flex-col gap-2 mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleVerResumen(trabajo.id)}
                            className="flex-1 flex cursor-pointer items-center justify-center gap-2 rounded-lg h-10 px-4 bg-gray-100 dark:bg-surface-dark text-slate-900 dark:text-white text-sm font-bold hover:bg-gray-200 dark:hover:bg-white/10 transition-colors"
                          >
                            <span className="material-symbols-outlined !text-[18px]">visibility</span>
                            <span>Ver Resumen</span>
                          </button>
                          <button
                            onClick={() => handleGenerarPDF(trabajo.id)}
                            className="flex-1 flex cursor-pointer items-center justify-center gap-2 rounded-lg h-10 px-4 bg-primary text-white text-sm font-bold hover:bg-primary/90 transition-colors"
                          >
                            <span className="material-symbols-outlined !text-[18px]">picture_as_pdf</span>
                            <span>Reporte PDF</span>
                          </button>
                        </div>
                        <button
                          onClick={() => handleReingreso(trabajo.id)}
                          className="w-full flex cursor-pointer items-center justify-center gap-2 rounded-lg h-10 px-4 bg-gray-100 dark:bg-surface-dark text-slate-900 dark:text-white text-sm font-bold hover:bg-gray-200 dark:hover:bg-white/10 transition-colors border border-gray-200 dark:border-gray-700"
                        >
                          <span className="material-symbols-outlined !text-[18px]">restart_alt</span>
                          <span>Reingreso</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}

            {/* End of list spacer */}
            <div className="h-10"></div>
          </>
        )}
      </main>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button className="size-14 rounded-full bg-primary text-white shadow-xl flex items-center justify-center active:scale-95 transition-transform">
          <span className="material-symbols-outlined !text-3xl">share</span>
        </button>
      </div>
    </div>
  )
}

export default TrabajosListosPage
