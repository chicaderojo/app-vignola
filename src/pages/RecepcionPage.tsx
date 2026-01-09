import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTheme } from '../hooks/useTheme'

function RecepcionPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const { isDark, toggleTheme } = useTheme()

  // Form state
  const [nombreCliente, setNombreCliente] = useState('')
  const [ordenTrabajo, setOrdenTrabajo] = useState('')
  const [contacto, setContacto] = useState('')
  const [tipoComponente, setTipoComponente] = useState('Cilindro Hidráulico')
  const [prioridad, setPrioridad] = useState<'Normal' | 'Urgente'>('Normal')
  const [diametro, setDiametro] = useState('')
  const [largo, setLargo] = useState('')
  const [fotoArmado, setFotoArmado] = useState<File | null>(null)
  const [fotoDespiece, setFotoDespiece] = useState<File | null>(null)
  const [previewArmado, setPreviewArmado] = useState<string | null>(null)
  const [previewDespiece, setPreviewDespiece] = useState<string | null>(null)

  const handleCerrar = () => {
    navigate('/')
  }

  const handleCapturarFoto = async (tipo: 'armado' | 'despiece') => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.capture = 'environment'

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onloadend = () => {
          const preview = reader.result as string

          if (tipo === 'armado') {
            setFotoArmado(file)
            setPreviewArmado(preview)
          } else {
            setFotoDespiece(file)
            setPreviewDespiece(preview)
          }
        }
        reader.readAsDataURL(file)
      }
    }

    input.click()
  }

  const handleGuardar = () => {
    if (!fotoArmado) {
      alert('Debes capturar la foto obligatoria de Armado antes de guardar')
      return
    }

    // Aquí iría la lógica para guardar los datos
    console.log({
      cliente: nombreCliente,
      ordenTrabajo,
      contacto,
      tipoComponente,
      prioridad,
      diametro,
      largo,
      fotos: { armado: fotoArmado, despiece: fotoDespiece }
    })

    // Navegar a la siguiente página
    navigate(`/inspeccion/${id}/peritaje`)
  }

  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden pb-24 max-w-md mx-auto bg-background-light dark:bg-background-dark">

      {/* Top App Bar */}
      <header className="sticky top-0 z-10 flex items-center justify-between bg-white dark:bg-background-dark p-4 shadow-sm dark:shadow-none border-b border-gray-200 dark:border-border-dark/50">
        <button
          onClick={handleCerrar}
          className="flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-surface-dark transition-colors cursor-pointer"
        >
          <span className="material-symbols-outlined text-slate-600 dark:text-white">close</span>
        </button>
        <h2 className="text-lg font-bold leading-tight tracking-tight flex-1 text-center pr-10 text-slate-900 dark:text-white">Nueva Recepción</h2>
        <div className="hidden w-10 items-center justify-end">
          {/* Placeholder for balance if needed */}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-4 py-2 space-y-6">
        {/* Section: Información del Cliente */}
        <section>
          <div className="flex items-center gap-2 py-4">
            <span className="material-symbols-outlined text-primary text-[20px]">person</span>
            <h3 className="text-base font-bold leading-tight tracking-tight text-slate-800 dark:text-white">Información del Cliente</h3>
          </div>
          <div className="flex flex-col gap-4">
            {/* Cliente Autocomplete */}
            <label className="flex flex-col flex-1 group">
              <p className="text-sm font-medium leading-normal pb-2 text-slate-600 dark:text-text-muted-dark">Nombre del Cliente</p>
              <div className="flex w-full items-center rounded-xl border border-gray-300 dark:border-border-dark bg-white dark:bg-surface-dark overflow-hidden focus-within:ring-2 focus-within:ring-primary focus-within:border-primary transition-all shadow-sm">
                <input
                  type="text"
                  value={nombreCliente}
                  onChange={(e) => setNombreCliente(e.target.value)}
                  className="w-full min-w-0 flex-1 border-none bg-transparent h-12 px-4 text-base font-normal placeholder:text-gray-400 dark:placeholder:text-text-muted-dark/50 focus:ring-0 text-slate-900 dark:text-white"
                  placeholder="Buscar cliente..."
                />
                <div className="flex items-center justify-center px-4 text-gray-400 dark:text-text-muted-dark">
                  <span className="material-symbols-outlined">search</span>
                </div>
              </div>
            </label>

            <div className="flex flex-row gap-4">
              {/* Orden de Trabajo */}
              <label className="flex flex-col flex-1 min-w-[140px]">
                <p className="text-sm font-medium leading-normal pb-2 text-slate-600 dark:text-text-muted-dark">Orden de Trabajo</p>
                <input
                  type="number"
                  value={ordenTrabajo}
                  onChange={(e) => setOrdenTrabajo(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 dark:border-border-dark bg-white dark:bg-surface-dark h-12 px-4 text-base font-normal placeholder:text-gray-400 dark:placeholder:text-text-muted-dark/50 focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm text-slate-900 dark:text-white"
                  placeholder="Ej: 45092"
                />
              </label>

              {/* Contacto */}
              <label className="flex flex-col flex-1 min-w-[140px]">
                <p className="text-sm font-medium leading-normal pb-2 text-slate-600 dark:text-text-muted-dark">Contacto</p>
                <input
                  type="text"
                  value={contacto}
                  onChange={(e) => setContacto(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 dark:border-border-dark bg-white dark:bg-surface-dark h-12 px-4 text-base font-normal placeholder:text-gray-400 dark:placeholder:text-text-muted-dark/50 focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm text-slate-900 dark:text-white"
                  placeholder="Nombre"
                />
              </label>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="h-px bg-gray-200 dark:bg-border-dark w-full"></div>

        {/* Section: Especificaciones del Cilindro */}
        <section>
          <div className="flex items-center gap-2 py-4">
            <span className="material-symbols-outlined text-primary text-[20px]">fluid</span>
            <h3 className="text-base font-bold leading-tight tracking-tight text-slate-800 dark:text-white">Especificaciones del Cilindro</h3>
          </div>
          <div className="flex flex-col gap-4">
            {/* Tipo y Prioridad Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Tipo Selector */}
              <label className="flex flex-col flex-1">
                <p className="text-sm font-medium leading-normal pb-2 text-slate-600 dark:text-text-muted-dark">Tipo de Componente</p>
                <div className="relative">
                  <select
                    value={tipoComponente}
                    onChange={(e) => setTipoComponente(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-gray-300 dark:border-border-dark bg-white dark:bg-surface-dark h-12 pl-4 pr-10 text-base font-normal focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm text-slate-900 dark:text-white"
                  >
                    <option>Cilindro Hidráulico</option>
                    <option>Cilindro Neumático</option>
                    <option>Vástago</option>
                    <option>Camisa</option>
                    <option>Bomba</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-gray-500 dark:text-text-muted-dark">
                    <span className="material-symbols-outlined">expand_more</span>
                  </div>
                </div>
              </label>

              {/* Prioridad Toggle */}
              <div className="flex flex-col flex-1">
                <p className="text-sm font-medium leading-normal pb-2 text-slate-600 dark:text-text-muted-dark">Prioridad</p>
                <div className="flex h-12 w-full items-center rounded-xl bg-gray-200 dark:bg-surface-dark/50 p-1 border border-gray-300 dark:border-border-dark">
                  <button
                    onClick={() => setPrioridad('Normal')}
                    className={`flex-1 h-full rounded-lg text-sm font-semibold transition-all ${
                      prioridad === 'Normal'
                        ? 'bg-white dark:bg-surface-dark text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-text-muted-dark hover:bg-gray-100 dark:hover:bg-white/5'
                    }`}
                  >
                    Normal
                  </button>
                  <button
                    onClick={() => setPrioridad('Urgente')}
                    className={`flex-1 h-full rounded-lg text-sm font-medium transition-all ${
                      prioridad === 'Urgente'
                        ? 'bg-white dark:bg-surface-dark text-slate-900 dark:text-white shadow-sm'
                        : 'text-slate-500 dark:text-text-muted-dark hover:bg-gray-100 dark:hover:bg-white/5'
                    }`}
                  >
                    Urgente
                  </button>
                </div>
              </div>
            </div>

            {/* Dimensiones */}
            <div className="flex gap-4">
              <label className="flex flex-col flex-1">
                <p className="text-sm font-medium leading-normal pb-2 text-slate-600 dark:text-text-muted-dark">Diámetro (mm)</p>
                <input
                  type="number"
                  value={diametro}
                  onChange={(e) => setDiametro(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 dark:border-border-dark bg-white dark:bg-surface-dark h-12 px-4 text-base font-normal placeholder:text-gray-400 dark:placeholder:text-text-muted-dark/50 focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm text-slate-900 dark:text-white"
                  placeholder="0"
                />
              </label>
              <label className="flex flex-col flex-1">
                <p className="text-sm font-medium leading-normal pb-2 text-slate-600 dark:text-text-muted-dark">Largo (mm)</p>
                <input
                  type="number"
                  value={largo}
                  onChange={(e) => setLargo(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 dark:border-border-dark bg-white dark:bg-surface-dark h-12 px-4 text-base font-normal placeholder:text-gray-400 dark:placeholder:text-text-muted-dark/50 focus:ring-2 focus:ring-primary focus:border-primary transition-all shadow-sm text-slate-900 dark:text-white"
                  placeholder="0"
                />
              </label>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="h-px bg-gray-200 dark:bg-border-dark w-full"></div>

        {/* Section: Evidencia Fotográfica */}
        <section>
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-[20px]">add_a_photo</span>
              <h3 className="text-base font-bold leading-tight tracking-tight text-slate-800 dark:text-white">Evidencia Fotográfica</h3>
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Foto 1 obligatoria</span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Foto Armado */}
            <button
              onClick={() => handleCapturarFoto('armado')}
              className="group relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-border-dark bg-gray-50 dark:bg-surface-dark/30 p-4 transition-all hover:border-primary dark:hover:border-primary hover:bg-primary/5 active:scale-[0.98] h-40"
            >
              {previewArmado ? (
                <>
                  <img
                    src={previewArmado}
                    alt="Foto de armado"
                    className="absolute inset-0 w-full h-full object-cover rounded-xl"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="flex size-12 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm">
                        <span className="material-symbols-outlined text-[24px]">photo_camera</span>
                      </div>
                      <p className="text-sm font-semibold text-white mt-2">Recapturar</p>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-green-500 text-white">
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex size-12 items-center justify-center rounded-full bg-gray-200 dark:bg-surface-dark text-gray-500 dark:text-text-muted-dark group-hover:bg-primary group-hover:text-white transition-colors shadow-sm">
                    <span className="material-symbols-outlined text-[24px]">photo_camera</span>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Armado</p>
                    <p className="text-xs text-slate-500 dark:text-text-muted-dark mt-1">Estado inicial</p>
                  </div>
                </>
              )}
            </button>

            {/* Foto Despiece */}
            <button
              onClick={() => handleCapturarFoto('despiece')}
              className="group relative flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-border-dark bg-gray-50 dark:bg-surface-dark/30 p-4 transition-all hover:border-primary dark:hover:border-primary hover:bg-primary/5 active:scale-[0.98] h-40"
            >
              {previewDespiece ? (
                <>
                  <img
                    src={previewDespiece}
                    alt="Foto de despiece"
                    className="absolute inset-0 w-full h-full object-cover rounded-xl"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="flex size-12 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm">
                        <span className="material-symbols-outlined text-[24px]">build</span>
                      </div>
                      <p className="text-sm font-semibold text-white mt-2">Recapturar</p>
                    </div>
                  </div>
                  <div className="absolute top-2 right-2 flex size-6 items-center justify-center rounded-full bg-green-500 text-white">
                    <span className="material-symbols-outlined text-[16px]">check</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex size-12 items-center justify-center rounded-full bg-gray-200 dark:bg-surface-dark text-gray-500 dark:text-text-muted-dark group-hover:bg-primary group-hover:text-white transition-colors shadow-sm">
                    <span className="material-symbols-outlined text-[24px]">build</span>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">Despiece</p>
                    <p className="text-xs text-slate-500 dark:text-text-muted-dark mt-1">Componentes</p>
                  </div>
                </>
              )}
            </button>
          </div>
          <p className="mt-4 text-xs text-center text-slate-400 dark:text-text-muted-dark/60">
            Las fotos se subirán automáticamente al guardar la orden.
          </p>
        </section>
      </main>

      {/* Fixed Footer Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 dark:bg-background-dark/95 backdrop-blur-md border-t border-gray-200 dark:border-border-dark z-20 max-w-md mx-auto">
        <div className="max-w-3xl mx-auto flex gap-3">
          <button
            onClick={handleGuardar}
            className="flex-1 rounded-xl bg-primary h-14 text-white text-base font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.99] transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">save</span>
            Guardar Recepción
          </button>
        </div>
      </div>

      {/* Background Pattern Effect */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] dark:opacity-[0.05] z-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
    </div>
  )
}

export default RecepcionPage
