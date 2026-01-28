import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabaseService } from '../services/supabaseService'

function PruebasPresionPage() {
  const navigate = useNavigate()
  const { id } = useParams()

  // Form state
  const [presionPrueba, setPresionPrueba] = useState('')
  const [fugaInterna, setFugaInterna] = useState(false)
  const [fugaExterna, setFugaExterna] = useState(false)
  const [fallasDetectadas, setFallasDetectadas] = useState('')
  const [observaciones, setObservaciones] = useState('')
  const [fotos, setFotos] = useState<string[]>([])
  const [loading, setLoading] = useState(false)

  const handleBack = () => {
    navigate(`/inspeccion/${id}/pregunta-pruebas`)
  }

  const handleComenzarPeritaje = async () => {
    if (!presionPrueba) {
      alert('Debes registrar la presión de prueba')
      return
    }

    if (!id) {
      alert('Error: ID de inspección no válido')
      return
    }

    try {
      setLoading(true)

      // Guardar datos de pruebas de presión de inspección
      await supabaseService.savePruebas(id, {
        presion_objetivo: parseFloat(presionPrueba),
        sostenimiento: 0, // No aplica para inspección
        presion_inicial: parseFloat(presionPrueba),
        presion_final: parseFloat(presionPrueba),
        fuga_vastago: fugaInterna,
        fuga_piston: fugaExterna,
        deformacion: false,
        observaciones: fallasDetectadas ? `${fallasDetectadas}\n\n${observaciones}` : observaciones,
        fotos_pruebas: fotos
      })

      // Actualizar etapas completadas
      await supabaseService.updateInspeccion(id, {
        etapas_completadas: ['recepcion', 'pruebas_presion'],
        presion_prueba: parseFloat(presionPrueba),
        fuga_interna: fugaInterna,
        fuga_externa: fugaExterna,
        notas_pruebas: observaciones
      })

      alert('✅ Pruebas de presión registradas. Comenzando peritaje...')
      navigate(`/inspeccion/${id}/peritaje`)
    } catch (error: any) {
      console.error('Error guardando pruebas de presión:', error)
      alert(`Error al guardar: ${error.message}`)
    } finally {
      setLoading(false)
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

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pb-24 max-w-md mx-auto">
      {/* Top App Bar */}
      <header className="sticky top-0 z-50 bg-background-light dark:bg-background-dark border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center p-4 justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="text-slate-500 dark:text-slate-400 hover:text-primary dark:hover:text-primary transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
            <div className="flex flex-col">
              <h2 className="text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-white">Pruebas de Presión</h2>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Pruebas de Presión en Inspección</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-6 space-y-6">
        {/* Info Section */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[20px] shrink-0">info</span>
            <p className="text-sm text-blue-900 dark:text-blue-200">
              Registra los resultados de las pruebas de presión hidráulica realizadas durante la inspección del cilindro.
            </p>
          </div>
        </div>

        {/* Presión de Prueba */}
        <section>
          <h3 className="text-base font-bold leading-tight tracking-tight text-slate-800 dark:text-white mb-3">Presión de Prueba</h3>
          <div className="bg-white dark:bg-surface-card rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <label className="flex flex-col gap-2">
              <p className="text-sm font-medium text-slate-600 dark:text-text-muted-dark">Presión (bar)</p>
              <input
                type="number"
                value={presionPrueba}
                onChange={(e) => setPresionPrueba(e.target.value)}
                className="w-full rounded-xl border border-gray-300 dark:border-border-dark bg-white dark:bg-surface-dark h-12 px-4 text-base font-normal placeholder:text-gray-400 dark:placeholder:text-text-muted-dark/50 focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm text-slate-900 dark:text-white"
                placeholder="Ej: 250"
              />
            </label>
          </div>
        </section>

        {/* Detección de Fugas */}
        <section>
          <h3 className="text-base font-bold leading-tight tracking-tight text-slate-800 dark:text-white mb-3">Detección de Fugas</h3>
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
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-all ${
                  fugaInterna ? 'translate-x-7' : 'translate-x-1'
                }`} style={{ transform: `translateX(${fugaInterna ? '1.75rem' : '0.25rem'})` }}></div>
              </div>
            </button>

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
                <div className={`w-5 h-5 bg-white rounded-full shadow-md transition-all ${
                  fugaExterna ? 'translate-x-7' : 'translate-x-1'
                }`} style={{ transform: `translateX(${fugaExterna ? '1.75rem' : '0.25rem'})` }}></div>
              </div>
            </button>
          </div>
        </section>

        {/* Observaciones */}
        <section>
          <h3 className="text-base font-bold leading-tight tracking-tight text-slate-800 dark:text-white mb-3">Observaciones</h3>
          <div className="bg-white dark:bg-surface-card rounded-xl border border-slate-200 dark:border-slate-700">
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full bg-transparent border-0 rounded-xl p-4 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-0 resize-none"
              placeholder="Agrega observaciones sobre las pruebas realizadas..."
              rows={3}
            />
          </div>
        </section>

        {/* Fallas Detectadas */}
        <section>
          <h3 className="text-base font-bold leading-tight tracking-tight text-slate-800 dark:text-white mb-3">Fallas Detectadas</h3>
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

        {/* Evidencia Fotográfica */}
        <section>
          <h3 className="text-base font-bold leading-tight tracking-tight text-slate-800 dark:text-white mb-3">Evidencia Fotográfica</h3>
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
              className="aspect-square rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center gap-2 text-slate-500 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all"
            >
              <span className="material-symbols-outlined text-[32px]">add_a_photo</span>
              <span className="text-xs font-medium">Agregar</span>
            </button>
          </div>
        </section>
      </main>

      {/* Fixed Footer Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-background-dark/95 backdrop-blur-md border-t border-gray-200 dark:border-border-dark z-20 max-w-md mx-auto">
        <button
          onClick={handleComenzarPeritaje}
          disabled={loading}
          className="w-full rounded-xl bg-primary h-14 text-white text-base font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.99] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Guardando...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined">science</span>
              <span>Comenzar Peritaje</span>
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default PruebasPresionPage
