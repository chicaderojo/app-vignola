import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabaseService } from '../services/supabaseService'
import { generateInformeTecnicoPDF } from '../services/pdfService'

type ComponenteEstado = 'ok' | 'warning' | 'error'

interface Componente {
  id: string
  nombre: string
  estado: ComponenteEstado
  descripcion: string
}

interface DetallesInspeccion {
  id: string
  codigo: string
  ordenTrabajo: string
  estado: 'completado' | 'en_proceso' | 'rechazado'
  fechaFinalizacion: string
  cliente: string
  contacto: string
  ubicacion: string
  tipoCilindro: string
  diametro: string
  vastago: string
  carrera: string
  fotos: string[]
  componentes: Componente[]
  pruebas: {
    presionPrueba: string
    fugaInterna: boolean
    fugaExterna: boolean
  }
}

function DetallesInspeccionPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [inspeccion, setInspeccion] = useState<DetallesInspeccion | null>(null)
  const [inspeccionCompleta, setInspeccionCompleta] = useState<any>(null) // Datos completos para generar informe
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar datos desde Supabase
  useEffect(() => {
    if (!id) {
      setError('ID de inspección no proporcionado')
      setLoading(false)
      return
    }

    cargarInspeccion()
  }, [id])

  const cargarInspeccion = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('Cargando detalles de inspección:', id)

      // Cargar inspección completa con detalles
      const resultado = await supabaseService.getInspeccionCompleta(id!)

      if (!resultado) {
        setError('Inspección no encontrada')
        setLoading(false)
        return
      }

      const { inspeccion: insp, detalles } = resultado
      const cilindro = insp.cilindro as any

      // Parsear información de recepción si existe
      let infoRecepcion: any = null
      if (insp.notas_recepcion) {
        try {
          infoRecepcion = JSON.parse(insp.notas_recepcion)
        } catch (e) {
          console.warn('No se pudo parsear notas_recepcion:', e)
        }
      }

      // Transformar al formato de DetallesInspeccion
      const detallesTransformados: DetallesInspeccion = {
        id: insp.id,
        codigo: cilindro?.id_codigo || insp.cilindro_id,
        ordenTrabajo: insp.sap_cliente || 'N/A',
        estado: insp.estado_inspeccion === 'completa' || insp.estado_inspeccion === 'sincronizada'
          ? 'completado'
          : insp.estado_inspeccion === 'borrador' ? 'en_proceso' : 'rechazado',
        fechaFinalizacion: new Date(insp.created_at).toLocaleDateString('es-CL', {
          day: '2-digit',
          month: 'short',
          year: 'numeric'
        }),
        cliente: infoRecepcion?.cliente || cilindro?.cliente?.nombre || 'Cliente',
        contacto: infoRecepcion?.contacto || 'N/A',
        ubicacion: infoRecepcion?.planta || 'Taller Central',
        tipoCilindro: cilindro?.tipo || 'No especificado',
        diametro: cilindro?.diametro_camisa ? `${cilindro.diametro_camisa} mm` : 'N/A',
        vastago: cilindro?.diametro_vastago ? `${cilindro.diametro_vastago} mm` : 'N/A',
        carrera: cilindro?.carrera ? `${cilindro.carrera} mm` : 'N/A',
        fotos: [
          insp.foto_armado_url || '',
          insp.foto_despiece_url || ''
        ].filter(Boolean),
        componentes: detalles.map(det => {
          // Mapear estado de componente
          let componenteEstado: ComponenteEstado = 'ok'
          if (det.estado === 'Cambio') componenteEstado = 'error'
          else if (det.estado === 'Mantención') componenteEstado = 'warning'

          return {
            id: det.id,
            nombre: det.componente || 'Componente',
            estado: componenteEstado,
            descripcion: det.detalle_tecnico || det.accion_propuesta || 'Sin observaciones'
          }
        }),
        pruebas: {
          presionPrueba: insp.presion_prueba ? `${insp.presion_prueba} Bar` : 'N/A',
          fugaInterna: insp.fuga_interna || false,
          fugaExterna: insp.fuga_externa || false
        }
      }

      console.log('Detalles cargados:', detallesTransformados)
      setInspeccion(detallesTransformados)
      setInspeccionCompleta(resultado) // Guardar datos completos para informe
    } catch (err: any) {
      console.error('Error cargando detalles:', err)
      setError(err.message || 'Error al cargar detalles de la inspección')
    } finally {
      setLoading(false)
    }
  }

  const handleBack = () => {
    navigate('/historial')
  }

  const handleGenerarInforme = async () => {
    if (!inspeccionCompleta) {
      alert('No hay datos suficientes para generar el informe')
      return
    }

    try {
      // Generar PDF con imágenes
      await generateInformeTecnicoPDF(inspeccionCompleta, true)
      alert('✅ Informe PDF generado exitosamente con imágenes')
    } catch (error) {
      console.error('Error generando informe:', error)
      alert('Error al generar el PDF. Por favor intenta nuevamente.')
    }
  }

  const getComponenteEstadoInfo = (estado: ComponenteEstado) => {
    switch (estado) {
      case 'ok':
        return {
          icon: 'check_circle',
          bgColor: 'bg-green-100 dark:bg-green-500/10',
          textColor: 'text-green-700 dark:text-green-400',
          label: 'OK'
        }
      case 'warning':
        return {
          icon: 'warning',
          bgColor: 'bg-amber-100 dark:bg-amber-500/10',
          textColor: 'text-amber-700 dark:text-amber-400',
          label: 'Atención'
        }
      case 'error':
        return {
          icon: 'error',
          bgColor: 'bg-red-100 dark:bg-red-500/10',
          textColor: 'text-red-700 dark:text-red-400',
          label: 'Cambio'
        }
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden pb-24 max-w-md mx-auto bg-background-light dark:bg-background-dark">
        <header className="sticky top-0 z-50 flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between border-b dark:border-border-dark/30 border-slate-200">
          <button
            onClick={handleBack}
            className="text-slate-900 dark:text-white flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </button>
          <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
            Detalles de Inspección
          </h2>
        </header>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-slate-500 dark:text-slate-400">Cargando detalles...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !inspeccion) {
    return (
      <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden pb-24 max-w-md mx-auto bg-background-light dark:bg-background-dark">
        <header className="sticky top-0 z-50 flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between border-b dark:border-border-dark/30 border-slate-200">
          <button
            onClick={handleBack}
            className="text-slate-900 dark:text-white flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-2xl">arrow_back</span>
          </button>
          <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
            Detalles de Inspección
          </h2>
        </header>
        <div className="flex flex-col items-center justify-center py-12 px-4">
          <span className="material-symbols-outlined text-6xl text-red-500 mb-4">error</span>
          <p className="text-red-600 dark:text-red-400 text-center mb-4">{error || 'Inspección no encontrada'}</p>
          <button
            onClick={handleBack}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Volver
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden pb-24 max-w-md mx-auto bg-background-light dark:bg-background-dark">
      {/* TopAppBar */}
      <header className="sticky top-0 z-50 flex items-center bg-background-light dark:bg-background-dark p-4 pb-2 justify-between border-b dark:border-border-dark/30 border-slate-200">
        <button
          onClick={handleBack}
          className="text-slate-900 dark:text-white flex size-12 shrink-0 items-center justify-center rounded-full hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
        >
          <span className="material-symbols-outlined text-2xl">arrow_back</span>
        </button>
        <h2 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em] flex-1 text-center pr-12">
          Detalles de Inspección
        </h2>
      </header>

      {/* Status & Main Info */}
      <div className="px-4 py-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold dark:text-white text-slate-900">{inspeccion.codigo}</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">OT: {inspeccion.ordenTrabajo}</p>
            </div>
            <div className="flex h-7 items-center justify-center gap-x-2 rounded-full bg-green-500/20 dark:bg-green-500/20 border border-green-500/30 pl-3 pr-3">
              <span className="size-2 rounded-full bg-green-600 dark:bg-green-500"></span>
              <p className="text-green-700 dark:text-green-400 text-xs font-medium uppercase tracking-wide">Completado</p>
            </div>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">Inspección finalizada el {inspeccion.fechaFinalizacion}</p>
        </div>
      </div>

      <div className="h-1 bg-slate-200 dark:bg-surface-dark/50 w-full"></div>

      {/* Section: Información General */}
      <section>
        <div className="flex items-center justify-between px-4 pt-6 pb-2">
          <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">Información General</h3>
          <span className="material-symbols-outlined text-primary">info</span>
        </div>
        <div className="p-4 grid grid-cols-2 gap-x-4">
          <div className="flex flex-col gap-1 border-b border-dashed border-slate-200 dark:border-border-dark py-3">
            <p className="text-slate-500 dark:text-text-muted-dark text-xs font-medium uppercase tracking-wider">Orden de Trabajo</p>
            <p className="text-slate-900 dark:text-white text-sm font-medium">{inspeccion.ordenTrabajo}</p>
          </div>
          <div className="flex flex-col gap-1 border-b border-dashed border-slate-200 dark:border-border-dark py-3">
            <p className="text-slate-500 dark:text-text-muted-dark text-xs font-medium uppercase tracking-wider">Cliente</p>
            <p className="text-slate-900 dark:text-white text-sm font-medium">{inspeccion.cliente}</p>
          </div>
          <div className="flex flex-col gap-1 border-b border-dashed border-slate-200 dark:border-border-dark py-3">
            <p className="text-slate-500 dark:text-text-muted-dark text-xs font-medium uppercase tracking-wider">Planta</p>
            <p className="text-slate-900 dark:text-white text-sm font-medium">{inspeccion.ubicacion}</p>
          </div>
          <div className="flex flex-col gap-1 border-b border-dashed border-slate-200 dark:border-border-dark py-3">
            <p className="text-slate-500 dark:text-text-muted-dark text-xs font-medium uppercase tracking-wider">Contacto</p>
            <p className="text-slate-900 dark:text-white text-sm font-medium">{inspeccion.contacto}</p>
          </div>
          <div className="flex flex-col gap-1 border-b border-dashed border-slate-200 dark:border-border-dark py-3">
            <p className="text-slate-500 dark:text-text-muted-dark text-xs font-medium uppercase tracking-wider">Tipo Cilindro</p>
            <p className="text-slate-900 dark:text-white text-sm font-medium">{inspeccion.tipoCilindro}</p>
          </div>
          <div className="flex flex-col gap-1 border-b border-dashed border-slate-200 dark:border-border-dark py-3">
            <p className="text-slate-500 dark:text-text-muted-dark text-xs font-medium uppercase tracking-wider">Diámetro</p>
            <p className="text-slate-900 dark:text-white text-sm font-medium">{inspeccion.diametro}</p>
          </div>
          <div className="flex flex-col gap-1 border-b border-dashed border-slate-200 dark:border-border-dark py-3">
            <p className="text-slate-500 dark:text-text-muted-dark text-xs font-medium uppercase tracking-wider">Vástago</p>
            <p className="text-slate-900 dark:text-white text-sm font-medium">{inspeccion.vastago}</p>
          </div>
          <div className="flex flex-col gap-1 border-b border-dashed border-slate-200 dark:border-border-dark py-3">
            <p className="text-slate-500 dark:text-text-muted-dark text-xs font-medium uppercase tracking-wider">Carrera</p>
            <p className="text-slate-900 dark:text-white text-sm font-medium">{inspeccion.carrera}</p>
          </div>
        </div>
      </section>

      {/* Section: Evidencia Fotográfica */}
      <section className="mt-2">
        <div className="flex items-center justify-between px-4 pt-4 pb-4">
          <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">Evidencia de Recepción</h3>
          <span className="material-symbols-outlined text-primary">photo_camera</span>
        </div>
        <div className="grid grid-cols-2 gap-4 px-4 pb-4">
          {/* Photo Card 1 */}
          <div className="group relative flex flex-col gap-2">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-slate-200 dark:bg-surface-dark border dark:border-border-dark">
              <img
                alt="Vista general del cilindro"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                src={inspeccion.fotos[0]}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-text-muted-dark">Vista General</p>
          </div>

          {/* Photo Card 2 */}
          <div className="group relative flex flex-col gap-2">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg bg-slate-200 dark:bg-surface-dark border dark:border-border-dark">
              <img
                alt="Placa de identificación"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                src={inspeccion.fotos[1]}
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
            </div>
            <p className="text-xs font-medium text-slate-500 dark:text-text-muted-dark">Placa Identificación</p>
          </div>
        </div>
      </section>

      {/* Section: Peritaje Dinámico */}
      <section className="mt-2 bg-slate-50 dark:bg-surface-dark/30 pb-6 pt-2">
        <div className="flex items-center justify-between px-4 pt-4 pb-4">
          <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">Peritaje de Componentes</h3>
          <span className="material-symbols-outlined text-primary">analytics</span>
        </div>
        <div className="px-4 flex flex-col gap-3">
          {inspeccion.componentes.map((componente) => {
            const estadoInfo = getComponenteEstadoInfo(componente.estado)

            return (
              <div
                key={componente.id}
                className="flex items-center justify-between rounded-lg bg-white dark:bg-surface-dark p-4 shadow-sm border border-slate-200 dark:border-border-dark"
              >
                <div className="flex items-center gap-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                    <span className="material-symbols-outlined">circle</span>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{componente.nombre}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{componente.descripcion}</p>
                  </div>
                </div>
                <div className={`flex items-center gap-1.5 rounded ${estadoInfo.bgColor} px-2 py-1`}>
                  <span className={`material-symbols-outlined text-[16px] ${estadoInfo.textColor}`}>{estadoInfo.icon}</span>
                  <span className={`text-xs font-medium ${estadoInfo.textColor}`}>{estadoInfo.label}</span>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Section: Pruebas Hidráulicas */}
      <section className="mt-2 mb-8">
        <div className="flex items-center justify-between px-4 pt-6 pb-2">
          <h3 className="text-slate-900 dark:text-white text-lg font-bold leading-tight tracking-[-0.015em]">Pruebas Hidráulicas</h3>
          <span className="material-symbols-outlined text-primary">water_drop</span>
        </div>
        <div className="mx-4 overflow-hidden rounded-lg border border-slate-200 dark:border-border-dark bg-white dark:bg-surface-dark">
          <table className="w-full text-left text-sm">
            <tbody className="divide-y divide-slate-200 dark:divide-border-dark">
              <tr>
                <td className="p-4 text-slate-500 dark:text-text-muted-dark font-medium">Presión de Prueba</td>
                <td className="p-4 text-right text-slate-900 dark:text-white font-bold">{inspeccion.pruebas.presionPrueba}</td>
              </tr>
              <tr>
                <td className="p-4 text-slate-500 dark:text-text-muted-dark font-medium">Fuga Interna</td>
                <td className="p-4 text-right">
                  {!inspeccion.pruebas.fugaInterna ? (
                    <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                      <span className="material-symbols-outlined text-lg">check</span>
                      No Detectada
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 font-medium">
                      <span className="material-symbols-outlined text-lg">close</span>
                      Detectada
                    </span>
                  )}
                </td>
              </tr>
              <tr>
                <td className="p-4 text-slate-500 dark:text-text-muted-dark font-medium">Fuga Externa</td>
                <td className="p-4 text-right">
                  {!inspeccion.pruebas.fugaExterna ? (
                    <span className="inline-flex items-center gap-1 text-green-600 dark:text-green-400 font-medium">
                      <span className="material-symbols-outlined text-lg">check</span>
                      No Detectada
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-red-600 dark:text-red-400 font-medium">
                      <span className="material-symbols-outlined text-lg">close</span>
                      Detectada
                    </span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Action Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background-light dark:bg-background-dark border-t border-slate-200 dark:border-border-dark z-[60] max-w-md mx-auto">
        <button
          onClick={handleGenerarInforme}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary py-3 px-4 text-white font-bold text-sm hover:bg-primary/90 transition-colors shadow-lg shadow-primary/20"
        >
          <span className="material-symbols-outlined">description</span>
          Generar Informe Técnico
        </button>
      </div>
    </div>
  )
}

export default DetallesInspeccionPage
