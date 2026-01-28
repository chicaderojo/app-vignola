import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabaseService } from '../services/supabaseService'
import { COMPONENTES_BASE } from '../types'

type AccionMantencion = 'ninguna' | 'brunido' | 'rectificado' | 'soldadura' | 'cambio_total'

interface ComponenteMantencion {
  id: string
  nombre: string
  accion: AccionMantencion
  detallesTecnicos: string
  fotoAntes: string | null
  fotoDespues: string | null
  expandido: boolean
}

interface Verificaciones {
  limpieza: boolean
  lubricacion: boolean
  pruebaPresion: boolean
}

function RegistroMantencionPage() {
  const navigate = useNavigate()
  const { id } = useParams()

  const [, setLoading] = useState(false)
  const [loadingInicial, setLoadingInicial] = useState(true)
  const [esReingreso, setEsReingreso] = useState(false)

  // Componentes de mantención
  const [componentes, setComponentes] = useState<ComponenteMantencion[]>([])

  // Verificaciones rápidas
  const [verificaciones, setVerificaciones] = useState<Verificaciones>({
    limpieza: false,
    lubricacion: false,
    pruebaPresion: false
  })

  // Cargar datos de la inspección
  useEffect(() => {
    const cargarDatos = async () => {
      if (!id) return

      try {
        setLoadingInicial(true)
        const inspeccion = await supabaseService.getInspeccionById(id)

        if (inspeccion) {
          // Verificar si es reingreso (tiene _mantencion en notas_recepcion)
          let infoRecepcion: any = null
          if (inspeccion.notas_recepcion) {
            try {
              infoRecepcion = JSON.parse(inspeccion.notas_recepcion)
            } catch (e) {
              console.warn('No se pudo parsear notas_recepcion:', e)
            }
          }

          // Si tiene datos de mantención previa, cargarlos
          if (infoRecepcion?._mantencion) {
            setEsReingreso(true)

            const mantencionPrev = infoRecepcion._mantencion

            // Mapear componentes previos
            const componentesConDatos = COMPONENTES_BASE.map((nombre, index) => {
              const compPrev = mantencionPrev.componentes?.find((c: any) => c.nombre === nombre)
              return {
                id: `mant-${index}`,
                nombre,
                accion: compPrev?.accion || 'ninguna' as AccionMantencion,
                detallesTecnicos: compPrev?.detallesTecnicos || '',
                fotoAntes: compPrev?.fotoAntes || null,
                fotoDespues: compPrev?.fotoDespues || null,
                expandido: compPrev?.accion !== 'ninguna'
              }
            })

            setComponentes(componentesConDatos)
            setVerificaciones(mantencionPrev.verificaciones || {
              limpieza: false,
              lubricacion: false,
              pruebaPresion: false
            })
          } else {
            // Inicializar componentes vacíos (flujo normal)
            const componentesBase = COMPONENTES_BASE.map((nombre, index) => ({
              id: `mant-${index}`,
              nombre,
              accion: 'ninguna' as AccionMantencion,
              detallesTecnicos: '',
              fotoAntes: null,
              fotoDespues: null,
              expandido: false
            }))
            setComponentes(componentesBase)
          }
        }
      } catch (error) {
        console.error('Error cargando inspección:', error)
      } finally {
        setLoadingInicial(false)
      }
    }

    cargarDatos()
  }, [id])

  const handleBack = () => {
    navigate('/mantencion-pendiente')
  }

  const handleGuardarPorAhora = async () => {
    if (!id) {
      alert('Error: ID de inspección no válido')
      return
    }

    try {
      setLoading(true)

      // Guardar registro de mantención temporal
      await supabaseService.saveMantencion(id, {
        componentes,
        verificaciones,
        observaciones: ''
      })

      alert('✅ Registro guardado. Puedes continuar después.')
      navigate('/mantencion-pendiente')
    } catch (error: any) {
      console.error('Error guardando mantención:', error)
      alert(`Error al guardar: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handlePasarAPruebas = async () => {
    // Validar que al menos un componente tenga acción seleccionada
    const componentesConAccion = componentes.filter(c => c.accion !== 'ninguna')
    if (componentesConAccion.length === 0) {
      alert('⚠️ Debes seleccionar al menos una acción de mantención para algún componente.')
      return
    }

    if (!id) {
      alert('Error: ID de inspección no válido')
      return
    }

    try {
      setLoading(true)

      // Guardar registro de mantención antes de navegar
      await supabaseService.saveMantencion(id, {
        componentes,
        verificaciones,
        observaciones: ''
      })

      // Navegar a pruebas de mantención
      navigate(`/inspeccion/${id}/pruebas-mantencion`)
    } catch (error: any) {
      console.error('Error guardando mantención:', error)
      alert(`Error al guardar: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const toggleAcordeon = (index: number) => {
    const nuevosComponentes = [...componentes]
    nuevosComponentes[index].expandido = !nuevosComponentes[index].expandido
    setComponentes(nuevosComponentes)
  }

  const actualizarAccion = (index: number, accion: AccionMantencion) => {
    const nuevosComponentes = [...componentes]
    nuevosComponentes[index].accion = accion
    setComponentes(nuevosComponentes)
  }

  const actualizarDetalles = (index: number, texto: string) => {
    const nuevosComponentes = [...componentes]
    nuevosComponentes[index].detallesTecnicos = texto
    setComponentes(nuevosComponentes)
  }

  const handleAgregarFoto = (index: number, tipo: 'antes' | 'despues') => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.capture = 'environment'

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onloadend = () => {
          const nuevosComponentes = [...componentes]
          if (tipo === 'antes') {
            nuevosComponentes[index].fotoAntes = reader.result as string
          } else {
            nuevosComponentes[index].fotoDespues = reader.result as string
          }
          setComponentes(nuevosComponentes)
        }
        reader.readAsDataURL(file)
      }
    }

    input.click()
  }

  const toggleVerificacion = (key: keyof Verificaciones) => {
    setVerificaciones(prev => ({
      ...prev,
      [key]: !prev[key]
    }))
  }

  if (loadingInicial) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-slate-600 dark:text-slate-400">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-white transition-colors duration-200">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between p-4 pb-2">
          <div className="flex items-center gap-2">
            <button onClick={handleBack} className="text-primary p-1">
              <span className="material-symbols-outlined text-[28px]">arrow_back_ios</span>
            </button>
          </div>
          <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center">Registro de Mantención</h2>
          <div className="flex w-12 items-center justify-end">
            <button onClick={handleGuardarPorAhora} className="text-primary text-base font-bold">
              Guardar
            </button>
          </div>
        </div>
      </header>

      {/* Reingreso Indicator */}
      {esReingreso && (
        <div className="mx-4 mt-4 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-orange-600 dark:text-orange-400 text-[24px]">
              autorenew
            </span>
            <div>
              <p className="text-sm font-bold text-orange-900 dark:text-orange-200">
                Reingreso de Garantía
              </p>
              <p className="text-xs text-orange-700 dark:text-orange-300">
                Se han cargado los datos de mantención previa. Puedes editarlos o continuar.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-primary/20 z-[60]">
        <div className="h-full bg-success w-1/2 transition-all duration-500"></div>
      </div>

      <main className="flex flex-col pb-24 mt-4">
        {/* Job Info Header */}
        <section className="px-4 py-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
              Información del Trabajo
            </h3>
            <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded-full uppercase">
              En Progreso
            </span>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            <div className="p-4 grid grid-cols-[30%_1fr] gap-x-4 border-b border-gray-100 dark:border-gray-800">
              <p className="text-gray-500 dark:text-gray-400 text-sm">Cliente</p>
              <p className="text-sm font-medium">Vignola Corp</p>
            </div>
            <div className="p-4 grid grid-cols-[30%_1fr] gap-x-4">
              <p className="text-gray-500 dark:text-gray-400 text-sm">ID Cilindro</p>
              <p className="text-sm font-medium">{id?.slice(0, 8).toUpperCase()} (Telescópico)</p>
            </div>
          </div>
        </section>

        {/* Components Section Header */}
        <section className="px-4 pt-4">
          <h2 className="text-[22px] font-bold leading-tight">Acciones por Componente</h2>
          <p className="text-gray-500 text-sm mt-1">Registre las reparaciones técnicas efectuadas.</p>
        </section>

        {/* Repair Details Accordions */}
        <section className="flex flex-col p-4 gap-4">
          {componentes.map((componente, index) => (
            <details
              key={componente.id}
              open={componente.expandido}
              onToggle={(e) => {
                // Solo actualizar si se abrió el acordeón
                const target = e.target as HTMLDetailsElement
                if (target.open) {
                  toggleAcordeon(index)
                }
              }}
              className="flex flex-col rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 group"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-6 p-4">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">settings_input_component</span>
                  <p className="text-sm font-bold">{componente.nombre}</p>
                </div>
                <div className="text-gray-400 group-open:rotate-180 transition-transform">
                  <span className="material-symbols-outlined">expand_more</span>
                </div>
              </summary>

              {componente.expandido && (
                <div className="px-4 pb-4 space-y-4">
                  <div className="h-[1px] bg-gray-100 dark:bg-gray-800 w-full"></div>

                  {/* Action Selector */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                      Acción Realizada
                    </label>
                    <select
                      value={componente.accion}
                      onChange={(e) => actualizarAccion(index, e.target.value as AccionMantencion)}
                      className="w-full bg-background-light dark:bg-background-dark border-gray-200 dark:border-gray-700 rounded-lg text-sm focus:ring-primary focus:border-primary"
                    >
                      <option value="ninguna">Seleccione acción...</option>
                      <option value="brunido">Bruñido (Honing)</option>
                      <option value="rectificado">Rectificado</option>
                      <option value="soldadura">Soldadura</option>
                      <option value="cambio_total">Cambio Total</option>
                    </select>
                  </div>

                  {/* Technical Details */}
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">
                      Detalles Técnicos
                    </label>
                    <textarea
                      value={componente.detallesTecnicos}
                      onChange={(e) => actualizarDetalles(index, e.target.value)}
                      className="w-full bg-background-light dark:bg-background-dark border-gray-200 dark:border-gray-700 rounded-lg text-sm placeholder:text-gray-400 focus:ring-primary focus:border-primary"
                      placeholder="Ej: Medida final Ø250.05mm, rugosidad Ra 0.4..."
                      rows={3}
                    />
                  </div>

                  {/* Photo Upload Area */}
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => handleAgregarFoto(index, 'antes')}
                      className={`flex flex-col items-center justify-center border-2 rounded-lg p-3 transition-colors ${
                        componente.fotoAntes
                          ? 'border-solid border-green-500 bg-green-50 dark:bg-green-900/20'
                          : 'border-dashed border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      <span className="material-symbols-outlined text-gray-400 mb-1">add_a_photo</span>
                      <span className="text-[10px] font-bold text-gray-500 uppercase">
                        {componente.fotoAntes ? 'Foto Antes ✓' : 'Foto Antes'}
                      </span>
                    </button>

                    <button
                      onClick={() => handleAgregarFoto(index, 'despues')}
                      className={`flex flex-col items-center justify-center border-2 rounded-lg p-3 transition-colors ${
                        componente.fotoDespues
                          ? 'border-solid border-primary bg-primary/10'
                          : 'border-dashed border-primary/40 bg-primary/5 hover:bg-primary/10'
                      }`}
                    >
                      <span className="material-symbols-outlined text-primary mb-1">photo_camera</span>
                      <span className="text-[10px] font-bold text-primary uppercase">
                        {componente.fotoDespues ? 'Foto Después ✓' : 'Foto Después'}
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </details>
          ))}
        </section>

        {/* Maintenance Checklist / Quick Options */}
        <section className="px-4 mt-2">
          <h3 className="text-xs font-bold text-gray-500 uppercase mb-3">Verificaciones Rápidas</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => toggleVerificacion('limpieza')}
              className={`px-3 py-2 rounded-full text-xs font-medium flex items-center gap-2 transition-colors ${
                verificaciones.limpieza
                  ? 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-green-600'
                  : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600'
              }`}
            >
              <span className={`material-symbols-outlined text-sm ${verificaciones.limpieza ? 'text-green-500' : 'text-gray-300'}`}>
                {verificaciones.limpieza ? 'check_circle' : 'circle'}
              </span>
              Limpieza OK
            </button>

            <button
              onClick={() => toggleVerificacion('lubricacion')}
              className={`px-3 py-2 rounded-full text-xs font-medium flex items-center gap-2 transition-colors ${
                verificaciones.lubricacion
                  ? 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-green-600'
                  : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600'
              }`}
            >
              <span className={`material-symbols-outlined text-sm ${verificaciones.lubricacion ? 'text-green-500' : 'text-gray-300'}`}>
                {verificaciones.lubricacion ? 'check_circle' : 'circle'}
              </span>
              Lubricación
            </button>

            <button
              onClick={() => toggleVerificacion('pruebaPresion')}
              className={`px-3 py-2 rounded-full text-xs font-medium flex items-center gap-2 transition-colors ${
                verificaciones.pruebaPresion
                  ? 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-green-600'
                  : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600'
              }`}
            >
              <span className={`material-symbols-outlined text-sm ${verificaciones.pruebaPresion ? 'text-green-500' : 'text-gray-300'}`}>
                {verificaciones.pruebaPresion ? 'check_circle' : 'circle'}
              </span>
              Prueba Presión
            </button>
          </div>
        </section>
      </main>

      {/* Fixed Bottom Footer Action */}
      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800 z-20 max-w-md mx-auto">
        <div className="max-w-md mx-auto">
          <button
            onClick={handlePasarAPruebas}
            className="w-full bg-success text-white font-bold py-4 rounded-xl shadow-lg shadow-success/20 flex items-center justify-center gap-2 active:scale-95 transition-transform"
          >
            <span className="material-symbols-outlined">task_alt</span>
            Pasar a Pruebas de Presión
          </button>
        </div>
      </footer>
    </div>
  )
}

export default RegistroMantencionPage
