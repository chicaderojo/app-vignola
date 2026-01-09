import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

function PruebasPage() {
  const navigate = useNavigate()
  const { id } = useParams()

  // Form state
  const [presionObjetivo, setPresionObjetivo] = useState('250')
  const [sostenimiento, setSostenimiento] = useState('15')
  const [presionInicial, setPresionInicial] = useState('')
  const [presionFinal, setPresionFinal] = useState('')
  const [fugaVastago, setFugaVastago] = useState(false)
  const [fugaPiston, setFugaPiston] = useState(false)
  const [deformacion, setDeformacion] = useState(false)
  const [observaciones, setObservaciones] = useState('')
  const [fotos, setFotos] = useState<string[]>([])

  const handleCancelar = () => {
    navigate(`/inspeccion/${id}/peritaje`)
  }

  const handleGuardar = () => {
    console.log('Guardando prueba:', {
      presionObjetivo,
      sostenimiento,
      presionInicial,
      presionFinal,
      inspeccionVisual: {
        fugaVastago,
        fugaPiston,
        deformacion
      },
      observaciones,
      fotos
    })
    alert('Prueba guardada exitosamente')
  }

  const handleFinalizar = () => {
    if (!presionInicial || !presionFinal) {
      alert('Debes registrar las presiones inicial y final')
      return
    }

    console.log('Finalizando prueba:', {
      presionObjetivo,
      sostenimiento,
      presionInicial,
      presionFinal,
      inspeccionVisual: {
        fugaVastago,
        fugaPiston,
        deformacion
      },
      observaciones,
      fotos
    })

    alert('Prueba finalizada exitosamente')
    navigate('/')
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

  const caidaPresion = presionInicial && presionFinal
    ? (parseFloat(presionInicial) - parseFloat(presionFinal)).toFixed(1)
    : '0.0'

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-hidden pb-24 max-w-md mx-auto bg-background-light dark:bg-background-dark">
      {/* Top App Bar */}
      <header className="sticky top-0 z-50 flex items-center justify-between bg-background-light dark:bg-background-dark px-4 py-3 border-b border-gray-200 dark:border-border-dark/50 backdrop-blur-md bg-opacity-95 dark:bg-opacity-95">
        <button
          onClick={handleCancelar}
          className="text-base font-medium text-slate-500 dark:text-text-secondary hover:text-slate-800 dark:hover:text-white transition-colors"
        >
          Cancelar
        </button>
        <h1 className="text-lg font-bold leading-tight tracking-tight text-center flex-1 mx-2 truncate text-slate-900 dark:text-white">
          Registro de Prueba
        </h1>
        <button
          onClick={handleGuardar}
          className="text-base font-bold text-primary hover:text-blue-400 transition-colors"
        >
          Guardar
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col gap-6 p-4">
        {/* Cylinder Info Card */}
        <section aria-label="Información del Cilindro">
          <div className="flex items-stretch justify-between gap-4 rounded-xl bg-white dark:bg-surface-dark p-4 shadow-sm border border-gray-100 dark:border-border-dark/50">
            <div className="flex flex-col justify-center gap-1 flex-[2]">
              <div className="inline-flex items-center gap-2 mb-1">
                <span className="bg-blue-100 dark:bg-primary/20 text-primary text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wide">En Proceso</span>
              </div>
              <h2 className="text-lg font-bold leading-tight text-slate-900 dark:text-white">Cilindro #CIL-2044</h2>
              <p className="text-slate-500 dark:text-text-secondary text-sm font-medium">Modelo: CAT-320D - Excavadora</p>
            </div>
            <div
              className="w-24 bg-center bg-no-repeat bg-cover rounded-lg shrink-0 border border-gray-200 dark:border-border-dark"
              style={{
                backgroundImage: "url('https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop')",
              }}
            ></div>
          </div>
        </section>

        {/* Test Parameters Section */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary">tune</span>
            <h3 className="text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-white">Parámetros de Prueba</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-600 dark:text-text-secondary">Presión Objetivo</span>
              <div className="relative">
                <input
                  type="number"
                  inputMode="numeric"
                  value={presionObjetivo}
                  onChange={(e) => setPresionObjetivo(e.target.value)}
                  className="w-full rounded-xl bg-white dark:bg-surface-dark border border-gray-300 dark:border-border-dark p-3 pr-10 text-base font-medium focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none text-slate-900 dark:text-white"
                  placeholder="0"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 dark:text-gray-500 pointer-events-none">BAR</span>
              </div>
            </label>

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-600 dark:text-text-secondary">Sostenimiento</span>
              <div className="relative">
                <input
                  type="number"
                  inputMode="numeric"
                  value={sostenimiento}
                  onChange={(e) => setSostenimiento(e.target.value)}
                  className="w-full rounded-xl bg-white dark:bg-surface-dark border border-gray-300 dark:border-border-dark p-3 pr-10 text-base font-medium focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all outline-none text-slate-900 dark:text-white"
                  placeholder="0"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 dark:text-gray-500 pointer-events-none">MIN</span>
              </div>
            </label>
          </div>
        </section>

        {/* Measurements Section */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary">speed</span>
            <h3 className="text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-white">Resultados de Medición</h3>
          </div>
          <div className="rounded-xl bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-600 dark:text-text-secondary">Presión Inicial</span>
                <div className="relative">
                  <input
                    type="number"
                    inputMode="numeric"
                    value={presionInicial}
                    onChange={(e) => setPresionInicial(e.target.value)}
                    className="w-full rounded-lg bg-slate-50 dark:bg-background-dark border border-gray-200 dark:border-border-dark/50 p-3 pr-10 text-base font-medium focus:ring-1 focus:ring-primary focus:border-primary outline-none text-slate-900 dark:text-white"
                    placeholder="0"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 dark:text-gray-500 pointer-events-none">BAR</span>
                </div>
              </label>

              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-slate-600 dark:text-text-secondary">Presión Final</span>
                <div className="relative">
                  <input
                    type="number"
                    inputMode="numeric"
                    value={presionFinal}
                    onChange={(e) => setPresionFinal(e.target.value)}
                    className="w-full rounded-lg bg-slate-50 dark:bg-background-dark border border-gray-200 dark:border-border-dark/50 p-3 pr-10 text-base font-medium focus:ring-1 focus:ring-primary focus:border-primary outline-none text-slate-900 dark:text-white"
                    placeholder="0"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 dark:text-gray-500 pointer-events-none">BAR</span>
                </div>
              </label>
            </div>

            {/* Calculated Field */}
            <div className="flex items-center justify-between rounded-lg bg-blue-50 dark:bg-primary/10 p-3 border border-blue-100 dark:border-primary/20">
              <span className="text-sm font-medium text-slate-700 dark:text-white">Caída de Presión</span>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold text-primary">{caidaPresion}</span>
                <span className="text-xs font-bold text-primary/70">BAR</span>
              </div>
            </div>
          </div>
        </section>

        {/* Visual Inspection Section */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary">visibility</span>
            <h3 className="text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-white">Inspección Visual</h3>
          </div>
          <div className="divide-y divide-gray-200 dark:divide-border-dark rounded-xl bg-white dark:bg-surface-dark border border-gray-200 dark:border-border-dark overflow-hidden">
            {/* Item 1 */}
            <div className="flex items-center justify-between p-4">
              <span className="text-base font-medium text-slate-900 dark:text-white">Fuga en Vástago</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={fugaVastago}
                  onChange={(e) => setFugaVastago(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
              </label>
            </div>

            {/* Item 2 */}
            <div className="flex items-center justify-between p-4">
              <span className="text-base font-medium text-slate-900 dark:text-white">Fuga en Pistón</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={fugaPiston}
                  onChange={(e) => setFugaPiston(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
              </label>
            </div>

            {/* Item 3 */}
            <div className="flex items-center justify-between p-4">
              <span className="text-base font-medium text-slate-900 dark:text-white">Deformación</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={deformacion}
                  onChange={(e) => setDeformacion(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-primary/40 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
              </label>
            </div>
          </div>
        </section>

        {/* Observations Section */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <span className="material-symbols-outlined text-primary">description</span>
            <h3 className="text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-white">Observaciones & Evidencia</h3>
          </div>
          <div className="flex flex-col gap-4">
            <textarea
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full min-h-[120px] rounded-xl bg-white dark:bg-surface-dark border border-gray-300 dark:border-border-dark p-4 text-base text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-text-secondary focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none resize-none"
              placeholder="Escriba aquí cualquier anomalía detectada durante la prueba..."
            />

            {/* Evidence Carousel */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {/* Add Button */}
              <button
                onClick={handleAgregarFoto}
                className="flex flex-col items-center justify-center min-w-[100px] h-[100px] rounded-xl border-2 border-dashed border-gray-300 dark:border-border-dark bg-white dark:bg-surface-dark text-slate-500 dark:text-text-secondary active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined !text-3xl mb-1">add_a_photo</span>
                <span className="text-xs font-medium">Adjuntar</span>
              </button>

              {/* Photo Previews */}
              {fotos.map((foto, index) => (
                <div
                  key={index}
                  className="relative min-w-[100px] h-[100px] rounded-xl overflow-hidden group"
                >
                  <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('${foto}')` }}
                  ></div>
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span
                      onClick={() => handleEliminarFoto(index)}
                      className="material-symbols-outlined text-white cursor-pointer"
                    >
                      delete
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Sticky Footer Action */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-background-light dark:bg-background-dark/80 backdrop-blur-lg border-t border-gray-200 dark:border-border-dark z-40 max-w-md mx-auto">
        <button
          onClick={handleFinalizar}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary hover:bg-blue-600 text-white font-bold h-14 text-lg shadow-lg shadow-blue-500/30 active:scale-[0.98] transition-all"
        >
          <span className="material-symbols-outlined">check_circle</span>
          Finalizar Prueba
        </button>
      </div>
    </div>
  )
}

export default PruebasPage
