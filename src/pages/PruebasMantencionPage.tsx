import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabaseService } from '../services/supabaseService'
import { generatePDFCompleto } from '../services/pdfService'

function PruebasMantencionPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [esReingreso, setEsReingreso] = useState(false)

  // Verificar si es reingreso al montar
  useEffect(() => {
    const verificarReingreso = async () => {
      if (!id) return

      try {
        const inspeccion = await supabaseService.getInspeccionById(id)
        if (inspeccion?.notas_recepcion) {
          const parsed = JSON.parse(inspeccion.notas_recepcion)
          if (parsed._mantencion) {
            setEsReingreso(true)
          }
        }
      } catch (error) {
        console.error('Error verificando reingreso:', error)
      }
    }

    verificarReingreso()
  }, [id])

  // Form state
  const [presionPrueba, setPresionPrueba] = useState('')
  const [tiempoPrueba, setTiempoPrueba] = useState('') // minutos
  const [fugaInterna, setFugaInterna] = useState(false)
  const [fugaExterna, setFugaExterna] = useState(false)
  const [fallasDetectadas, setFallasDetectadas] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [fotos, setFotos] = useState<string[]>([])
  const [fotosFugaInterna, setFotosFugaInterna] = useState<string[]>([])
  const [fotosFugaExterna, setFotosFugaExterna] = useState<string[]>([])
  const [loadingPDF, setLoadingPDF] = useState(false)

  const handleBack = () => {
    navigate(`/inspeccion/${id}/registro-mantencion`)
  }

  const handleGenerarInformePDF = async () => {
    if (!presionPrueba) {
      alert('Debes registrar la presión de prueba')
      return
    }

    if (!tiempoPrueba) {
      alert('Debes registrar el tiempo de prueba')
      return
    }

    if (!id) {
      alert('Error: ID de inspección no válido')
      return
    }

    try {
      setLoadingPDF(true)

      // 1. Guardar pruebas de mantención
      await supabaseService.savePruebasMantencion(id, {
        presion: parseFloat(presionPrueba),
        tiempo: parseFloat(tiempoPrueba),
        fuga_interna: fugaInterna,
        fuga_externa: fugaExterna,
        fallas: fallasDetectadas,
        observaciones,
        fotos,
        fotos_fuga_interna: fotosFugaInterna,
        fotos_fuga_externa: fotosFugaExterna
      })

      // 2. Marcar inspección como COMPLETA (100%)
      await supabaseService.updateInspeccion(id, {
        etapas_completadas: ['recepcion', 'peritaje', 'mantencion']
      })

      // 3. Obtener datos completos para PDF
      const inspeccionData = await supabaseService.getInspeccionCompleta(id)

      if (!inspeccionData) {
        alert('Error: No se pudieron cargar los datos de la inspección')
        return
      }

      // 4. Obtener datos de mantención
      const mantencionData = await supabaseService.getMantencion(id)

      // 5. Generar PDF COMPLETO con inspección + mantención
      await generatePDFCompleto(
        inspeccionData,
        mantencionData || undefined,
        {
          presion: parseFloat(presionPrueba),
          tiempo: parseFloat(tiempoPrueba),
          fuga_interna: fugaInterna,
          fuga_externa: fugaExterna,
          fallas: fallasDetectadas,
          observaciones,
          fotos
        },
        true, // Incluir imágenes
        esReingreso // PASAR indicador de reingreso
      )

      // 6. Mostrar éxito y navegar
      alert('✅ Pruebas de mantención registradas. Inspección completada al 100%. PDF generado exitosamente.')

      // 7. Navegar al Dashboard
      navigate('/')
    } catch (error: any) {
      console.error('Error en pruebas de mantención:', error)
      alert(`Error: ${error.message}`)
    } finally {
      setLoadingPDF(false)
    }
  }

  const handleAgregarFoto = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.capture = 'environment'

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onloadend = () => {
          setFotos([...fotos, reader.result as string])
        }
        reader.readAsDataURL(file)
      }
    }

    input.click()
  }

  const handleEliminarFoto = (index: number) => {
    const nuevasFotos = fotos.filter((_, i) => i !== index)
    setFotos(nuevasFotos)
  }

  const handleAgregarFotoFuga = (tipo: 'interna' | 'externa') => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.capture = 'environment'

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onloadend = () => {
          if (tipo === 'interna') {
            setFotosFugaInterna([...fotosFugaInterna, reader.result as string])
          } else {
            setFotosFugaExterna([...fotosFugaExterna, reader.result as string])
          }
        }
        reader.readAsDataURL(file)
      }
    }

    input.click()
  }

  const handleEliminarFotoFuga = (index: number, tipo: 'interna' | 'externa') => {
    if (tipo === 'interna') {
      const nuevasFotos = fotosFugaInterna.filter((_, i) => i !== index)
      setFotosFugaInterna(nuevasFotos)
    } else {
      const nuevasFotos = fotosFugaExterna.filter((_, i) => i !== index)
      setFotosFugaExterna(nuevasFotos)
    }
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24 max-w-md mx-auto">
      {/* Top App Bar */}
      <header className="sticky top-0 z-50 bg-background-light dark:bg-background-dark border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center p-4 justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="text-slate-500 dark:text-slate-400 hover:text-success dark:hover:text-success transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div className="flex flex-col">
              <h2 className="text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-white">Pruebas de Mantención</h2>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Pruebas Finales</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 space-y-6">
        {/* Info Section */}
        <div className="bg-success/10 dark:bg-success/20 rounded-xl p-4 border border-success/20 dark:border-success/30">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-success text-[20px]">info</span>
            <p className="text-sm text-success-900 dark:text-success-200">
              Registra los resultados de las pruebas finales de mantención. Al completar, se generará el informe técnico completo con toda la información de la inspección y mantención.
            </p>
          </div>
        </div>

        {/* Presión y Tiempo */}
        <section>
          <h3 className="text-base font-bold leading-tight tracking-tight text-slate-800 dark:text-white mb-3">
            Presión y Tiempo de Prueba
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white dark:bg-surface-card rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <label className="flex flex-col gap-2">
                <p className="text-sm font-medium text-slate-600 dark:text-text-muted-dark">
                  Presión (bar)
                </p>
                <input
                  type="number"
                  value={presionPrueba}
                  onChange={(e) => setPresionPrueba(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 dark:border-border-dark bg-white dark:bg-surface-dark h-12 px-4 text-base font-normal placeholder:text-gray-400 dark:placeholder:text-text-muted-dark/50 focus:ring-2 focus:ring-success focus:border-success transition-all shadow-sm text-slate-900 dark:text-white"
                  placeholder="Ej: 250"
                />
              </label>
            </div>

            <div className="bg-white dark:bg-surface-card rounded-xl p-4 border border-slate-200 dark:border-slate-700">
              <label className="flex flex-col gap-2">
                <p className="text-sm font-medium text-slate-600 dark:text-text-muted-dark">
                  Tiempo (min)
                </p>
                <input
                  type="number"
                  value={tiempoPrueba}
                  onChange={(e) => setTiempoPrueba(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 dark:border-border-dark bg-white dark:bg-surface-dark h-12 px-4 text-base font-normal placeholder:text-gray-400 dark:placeholder:text-text-muted-dark/50 focus:ring-2 focus:ring-success focus:border-success transition-all shadow-sm text-slate-900 dark:text-white"
                  placeholder="Ej: 15"
                />
              </label>
            </div>
          </div>
        </section>

        {/* Detección de Fugas */}
        <section>
          <h3 className="text-base font-bold leading-tight tracking-tight text-slate-800 dark:text-white mb-3">
            Detección de Fugas
          </h3>
          <div className="space-y-3">
            {/* Fuga Interna */}
            <button
              onClick={() => setFugaInterna(!fugaInterna)}
              className={`w-full bg-white dark:bg-surface-card rounded-xl p-4 border flex items-center justify-between transition-all ${
                fugaInterna
                  ? 'border-red-500 dark:border-red-500 bg-red-50 dark:bg-red-900/20'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined text-[24px] ${fugaInterna ? 'text-red-500' : 'text-slate-400'}`}>
                  {fugaInterna ? 'warning' : 'check_circle'}
                </span>
                <div className="text-left">
                  <p className="font-semibold text-slate-900 dark:text-white">Fuga Interna</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Pistón o válvula interna</p>
                </div>
              </div>
              <div className={`w-12 h-7 rounded-full transition-all ${
                fugaInterna ? 'bg-red-500' : 'bg-slate-300 dark:bg-slate-600'
              }`}>
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-all`} style={{ transform: `translateX(${fugaInterna ? '1.75rem' : '0.25rem'})` }}></div>
              </div>
            </button>

            {/* Sección de fotos para fuga interna */}
            {fugaInterna && (
              <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-4 border border-red-200 dark:border-red-800">
                <h4 className="text-sm font-semibold text-red-900 dark:text-red-200 mb-3">
                  Evidencia Fotográfica - Fuga Interna
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {fotosFugaInterna.map((foto, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-red-300 dark:border-red-700 group">
                      <img src={foto} alt={`Fuga interna ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => handleEliminarFotoFuga(index, 'interna')}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => handleAgregarFotoFuga('interna')}
                    className="aspect-square rounded-lg border-2 border-dashed border-red-300 dark:border-red-700 flex flex-col items-center justify-center gap-1 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 transition-all"
                  >
                    <span className="material-symbols-outlined text-[24px]">add_a_photo</span>
                    <span className="text-[10px] font-medium">Agregar Foto</span>
                  </button>
                </div>
              </div>
            )}

            {/* Fuga Externa */}
            <button
              onClick={() => setFugaExterna(!fugaExterna)}
              className={`w-full bg-white dark:bg-surface-card rounded-xl p-4 border flex items-center justify-between transition-all ${
                fugaExterna
                  ? 'border-orange-500 dark:border-orange-500 bg-orange-50 dark:bg-orange-900/20'
                  : 'border-slate-200 dark:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined text-[24px] ${fugaExterna ? 'text-orange-500' : 'text-slate-400'}`}>
                  {fugaExterna ? 'warning' : 'check_circle'}
                </span>
                <div className="text-left">
                  <p className="font-semibold text-slate-900 dark:text-white">Fuga Externa</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Vástago o sellos</p>
                </div>
              </div>
              <div className={`w-12 h-7 rounded-full transition-all ${
                fugaExterna ? 'bg-orange-500' : 'bg-slate-300 dark:bg-slate-600'
              }`}>
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-all`} style={{ transform: `translateX(${fugaExterna ? '1.75rem' : '0.25rem'})` }}></div>
              </div>
            </button>

            {/* Sección de fotos para fuga externa */}
            {fugaExterna && (
              <div className="bg-orange-50 dark:bg-orange-900/10 rounded-xl p-4 border border-orange-200 dark:border-orange-800">
                <h4 className="text-sm font-semibold text-orange-900 dark:text-orange-200 mb-3">
                  Evidencia Fotográfica - Fuga Externa
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {fotosFugaExterna.map((foto, index) => (
                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-orange-300 dark:border-orange-700 group">
                      <img src={foto} alt={`Fuga externa ${index + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => handleEliminarFotoFuga(index, 'externa')}
                        className="absolute top-1 right-1 w-6 h-6 bg-orange-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <span className="material-symbols-outlined text-[14px]">close</span>
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => handleAgregarFotoFuga('externa')}
                    className="aspect-square rounded-lg border-2 border-dashed border-orange-300 dark:border-orange-700 flex flex-col items-center justify-center gap-1 text-orange-500 hover:bg-orange-100 dark:hover:bg-orange-900/20 transition-all"
                  >
                    <span className="material-symbols-outlined text-[24px]">add_a_photo</span>
                    <span className="text-[10px] font-medium">Agregar Foto</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Fallas Detectadas */}
        <section>
          <h3 className="text-base font-bold leading-tight tracking-tight text-slate-800 dark:text-white mb-3">
            Fallas Detectadas
          </h3>
          <div className="bg-white dark:bg-surface-card rounded-xl border border-slate-200 dark:border-slate-700">
            <textarea
              value={fallasDetectadas}
              onChange={(e) => setFallasDetectadas(e.target.value)}
              className="w-full bg-transparent border-0 rounded-xl p-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-0 resize-none"
              placeholder="Describe cualquier falla o anomalía detectada durante las pruebas..."
              rows={3}
            />
          </div>
        </section>

        {/* Observaciones */}
        <section>
          <h3 className="text-base font-bold leading-tight tracking-tight text-slate-800 dark:text-white mb-3">
            Observaciones Generales
          </h3>
          <div className="bg-white dark:bg-surface-card rounded-xl border border-slate-200 dark:border-slate-700">
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full bg-transparent border-0 rounded-xl p-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-0 resize-none"
              placeholder="Agrega observaciones adicionales sobre las pruebas realizadas..."
              rows={3}
            />
          </div>
        </section>

        {/* Evidencia Fotográfica */}
        <section>
          <h3 className="text-base font-bold leading-tight tracking-tight text-slate-800 dark:text-white mb-3">
            Evidencia Fotográfica
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {fotos.map((foto, index) => (
              <div key={index} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 group">
                <img src={foto} alt={`Foto ${index + 1}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => handleEliminarFoto(index)}
                  className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
            ))}
            <button
              onClick={handleAgregarFoto}
              className="aspect-square rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center gap-2 text-slate-500 hover:border-success hover:text-success hover:bg-success/5 transition-all"
            >
              <span className="material-symbols-outlined text-[32px]">add_a_photo</span>
              <span className="text-xs font-medium">Agregar Foto</span>
            </button>
          </div>
        </section>

        {/* Botón Generar Informe PDF */}
        <section className="mt-6">
          <button
            onClick={handleGenerarInformePDF}
            disabled={loadingPDF}
            className="w-full rounded-xl bg-success h-14 text-white text-base font-bold shadow-lg shadow-success/20 hover:bg-success/90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingPDF ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Generando Informe...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">picture_as_pdf</span>
                <span>Generar Informe Técnico PDF</span>
              </>
            )}
          </button>
        </section>
      </main>
    </div>
  )
}

export default PruebasMantencionPage
