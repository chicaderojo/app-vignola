import { useNavigate, useParams } from 'react-router-dom'

function PreguntaPruebasPage() {
  const navigate = useNavigate()
  const { id } = useParams()

  const handleSi = () => {
    navigate(`/inspeccion/${id}/pruebas-presion`)
  }

  const handleNo = () => {
    navigate(`/inspeccion/${id}/peritaje`)
  }

  const handleBack = () => {
    navigate(`/inspeccion/${id}/recepcion`)
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
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Vignola Industrial</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-8">
        {/* Title and Description */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10 mb-6">
            <span className="material-symbols-outlined text-primary text-[48px]">science</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">
            ¿Desea realizar pruebas de presión?
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-base leading-relaxed max-w-md mx-auto">
            Seleccione si desea realizar pruebas de presión hidráulica antes de comenzar el peritaje del cilindro.
          </p>
        </div>

        {/* Options Cards */}
        <div className="space-y-4">
          {/* Option: SÍ */}
          <button
            onClick={handleSi}
            className="w-full bg-white dark:bg-surface-card rounded-2xl p-6 border-2 border-slate-200 dark:border-slate-700 hover:border-primary dark:hover:border-primary hover:shadow-lg transition-all group active:scale-[0.98]"
          >
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-success/10 group-hover:bg-success/20 transition-colors shrink-0">
                <span className="material-symbols-outlined text-success text-[32px]">check</span>
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">SÍ, realizar pruebas</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Realizar pruebas de presión hidráulica de inspección antes del peritaje para detectar fugas y evaluar el estado del cilindro.
                </p>
                <div className="flex items-center gap-2 mt-4 text-primary font-semibold text-sm">
                  <span>Iniciar pruebas de presión</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </div>
              </div>
            </div>
          </button>

          {/* Option: NO */}
          <button
            onClick={handleNo}
            className="w-full bg-white dark:bg-surface-card rounded-2xl p-6 border-2 border-slate-200 dark:border-slate-700 hover:border-primary dark:hover:border-primary hover:shadow-lg transition-all group active:scale-[0.98]"
          >
            <div className="flex items-start gap-4">
              <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-orange-500/10 group-hover:bg-orange-500/20 transition-colors shrink-0">
                <span className="material-symbols-outlined text-orange-500 text-[32px]">close</span>
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">NO, ir al peritaje</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                  Omitir pruebas de presión y pasar directamente a la evaluación y peritaje de componentes del cilindro.
                </p>
                <div className="flex items-center gap-2 mt-4 text-primary font-semibold text-sm">
                  <span>Comenzar peritaje</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
          <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-[20px] shrink-0">info</span>
            <div>
              <p className="text-sm text-blue-900 dark:text-blue-200 font-medium mb-1">Información importante</p>
              <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
                Las pruebas de presión permiten detectar fugas internas y externas. Si decide no realizarlas ahora, podrán hacerse más adelante si es necesario.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default PreguntaPruebasPage
