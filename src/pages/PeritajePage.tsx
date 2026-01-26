import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { supabaseService } from '../services/supabaseService'

type ComponenteStatus = 'pending' | 'bueno' | 'mantencion' | 'cambio'

interface Componente {
  id: string
  nombre: string
  estado: ComponenteStatus
  observaciones: string
  fotos: string[]
  expandido: boolean
}

function PeritajePage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [loading, setLoading] = useState(false)

  // Mock data para componentes
  const [componentes, setComponentes] = useState<Componente[]>([
    {
      id: '1',
      nombre: 'Vástago (Rod)',
      estado: 'mantencion',
      observaciones: 'Desgaste severo en cromo duro, presenta ralladuras longitudinales profundas en zona de trabajo.',
      fotos: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200&h=200&fit=crop'],
      expandido: true
    },
    {
      id: '2',
      nombre: 'Camisa (Barrel)',
      estado: 'bueno',
      observaciones: '',
      fotos: [],
      expandido: false
    },
    {
      id: '3',
      nombre: 'Sellos (Seals)',
      estado: 'cambio',
      observaciones: 'Kit de sellos completo dañado por uso intensivo.',
      fotos: [],
      expandido: false
    },
    {
      id: '4',
      nombre: 'Pistón (Piston)',
      estado: 'pending',
      observaciones: '',
      fotos: [],
      expandido: false
    },
    {
      id: '5',
      nombre: 'Puerto de Aceite',
      estado: 'pending',
      observaciones: '',
      fotos: [],
      expandido: false
    }
  ])

  const handleBack = () => {
    navigate(`/inspeccion/${id}/recepcion`)
  }

  const handleGuardar = async () => {
    if (!id) {
      alert('Error: ID de inspección no válido')
      return
    }

    try {
      setLoading(true)
      await supabaseService.savePeritaje(id, componentes)
      alert('Peritaje guardado exitosamente')
    } catch (error: any) {
      console.error('Error guardando peritaje:', error)
      alert(`Error al guardar: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleFinalizar = async () => {
    const componentesPendientes = componentes.filter(c => c.estado === 'pending')
    if (componentesPendientes.length > 0) {
      alert(`Falta evaluar ${componentesPendientes.length} componente(s)`)
      return
    }

    if (!id) {
      alert('Error: ID de inspección no válido')
      return
    }

    try {
      setLoading(true)
      await supabaseService.savePeritaje(id, componentes)
      navigate(`/inspeccion/${id}/pruebas`)
    } catch (error: any) {
      console.error('Error finalizando peritaje:', error)
      alert(`Error al guardar: ${error.message}`)
      setLoading(false)
    }
  }

  const actualizarEstado = (index: number, nuevoEstado: ComponenteStatus) => {
    const nuevosComponentes = [...componentes]
    nuevosComponentes[index].estado = nuevoEstado

    // Si se selecciona un estado diferente de pending, expandir el componente
    if (nuevoEstado !== 'pending') {
      nuevosComponentes[index].expandido = true
    }

    setComponentes(nuevosComponentes)
  }

  const toggleExpandido = (index: number) => {
    const nuevosComponentes = [...componentes]
    nuevosComponentes[index].expandido = !nuevosComponentes[index].expandido
    setComponentes(nuevosComponentes)
  }

  const actualizarObservaciones = (index: number, texto: string) => {
    const nuevosComponentes = [...componentes]
    nuevosComponentes[index].observaciones = texto
    setComponentes(nuevosComponentes)
  }

  const handleAgregarFoto = (index: number) => {
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
          nuevosComponentes[index].fotos.push(reader.result as string)
          setComponentes(nuevosComponentes)
        }
        reader.readAsDataURL(file)
      }
    }

    input.click()
  }

  const getEstadoColor = (estado: ComponenteStatus) => {
    switch (estado) {
      case 'bueno': return 'status-good'
      case 'mantencion': return 'status-maintain'
      case 'cambio': return 'status-replace'
      default: return ''
    }
  }

  const componentesCompletados = componentes.filter(c => c.estado !== 'pending').length
  const progreso = (componentesCompletados / componentes.length) * 100

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark pb-20">
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
              <h2 className="text-lg font-bold leading-tight tracking-tight text-slate-900 dark:text-white">Peritaje OT #9942</h2>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Vignola Industrial</span>
            </div>
          </div>
          <button
            onClick={handleGuardar}
            disabled={loading}
            className="bg-primary/10 hover:bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </header>

      {/* Job Context Meta */}
      <div className="bg-white dark:bg-surface-dark px-4 py-3 shadow-sm border-b border-slate-200 dark:border-slate-700/50">
        <div className="flex items-start gap-3">
          <div className="mt-1 bg-blue-500/10 p-2 rounded-lg shrink-0">
            <span className="material-symbols-outlined text-primary text-[20px]">fluid</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Cilindro Telescópico</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Cliente: Minera Escondida • Planta Coloso</p>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="flex flex-col gap-2 px-4 py-5">
        <div className="flex gap-6 justify-between items-end">
          <p className="text-slate-700 dark:text-slate-200 text-sm font-bold">Progreso de Inspección</p>
          <p className="text-primary text-xs font-bold bg-primary/10 px-2 py-0.5 rounded">
            {componentesCompletados}/{componentes.length} items
          </p>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
            style={{ width: `${progreso}%` }}
          ></div>
        </div>
      </div>

      {/* Section Header */}
      <div className="px-4 pb-2 pt-2 flex items-center justify-between">
        <h3 className="text-slate-900 dark:text-white text-lg font-bold">Componentes</h3>
        <button className="text-xs font-medium text-primary flex items-center gap-1">
          <span className="material-symbols-outlined text-[16px]">filter_list</span>
          Filtrar
        </button>
      </div>

      {/* Component List */}
      <div className="flex flex-col gap-4 px-4 pb-4">
        {componentes.map((componente, index) => (
          <div
            key={componente.id}
            className={`bg-white dark:bg-surface-dark rounded-xl shadow-sm border overflow-hidden relative group ${
              componente.estado === 'pending'
                ? 'border-slate-200 dark:border-slate-700/50 opacity-60'
                : componente.estado !== 'bueno' && componente.expandido
                ? `border-${getEstadoColor(componente.estado)}/50`
                : 'border-transparent'
            }`}
          >
            {/* Barra lateral de color */}
            {componente.estado !== 'pending' && componente.expandido && componente.estado !== 'bueno' && (
              <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-${getEstadoColor(componente.estado)}`}></div>
            )}

            <div className="p-4">
              <div className="flex justify-between items-start mb-4 pl-2">
                <div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white">
                    {index + 1}. {componente.nombre}
                  </h4>
                  {componente.estado !== 'pending' && (
                    <p className={`text-xs text-${getEstadoColor(componente.estado)} font-medium mt-0.5`}>
                      {componente.estado === 'bueno' ? 'En buen estado' :
                       componente.estado === 'mantencion' ? 'Requiere Atención' :
                       'Requiere Cambio'}
                    </p>
                  )}
                </div>
                {componente.estado === 'mantencion' && componente.expandido && (
                  <span className="material-symbols-outlined text-status-maintain">warning</span>
                )}
              </div>

              {/* Status Selectors */}
              <div className={`grid grid-cols-3 gap-2 mb-${componente.expandido && componente.estado !== 'bueno' ? '4' : '0'} pl-2`}>
                <button
                  onClick={() => actualizarEstado(index, 'bueno')}
                  className={`h-12 flex flex-col items-center justify-center rounded transition-all ${
                    componente.estado === 'bueno'
                      ? 'bg-status-good text-white shadow-lg ring-2 ring-status-good/30'
                      : 'border border-slate-200 dark:border-slate-700 bg-transparent text-slate-400 hover:border-status-good hover:text-status-good'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px] mb-0.5">check_circle</span>
                  <span className="text-[10px] font-bold uppercase">Bueno</span>
                </button>

                <button
                  onClick={() => actualizarEstado(index, 'mantencion')}
                  className={`h-12 flex flex-col items-center justify-center rounded transition-all ${
                    componente.estado === 'mantencion'
                      ? 'bg-status-maintain text-white shadow-lg ring-2 ring-status-maintain/30'
                      : 'border border-slate-200 dark:border-slate-700 bg-transparent text-slate-400 hover:border-status-maintain hover:text-status-maintain'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px] mb-0.5">build</span>
                  <span className="text-[10px] font-bold uppercase">Mantención</span>
                </button>

                <button
                  onClick={() => actualizarEstado(index, 'cambio')}
                  className={`h-12 flex flex-col items-center justify-center rounded transition-all ${
                    componente.estado === 'cambio'
                      ? 'bg-status-replace text-white shadow-lg ring-2 ring-status-replace/30'
                      : 'border border-slate-200 dark:border-slate-700 bg-transparent text-slate-400 hover:border-status-replace hover:text-status-replace'
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px] mb-0.5">cancel</span>
                  <span className="text-[10px] font-bold uppercase">Cambio</span>
                </button>
              </div>

              {/* Expanded Section */}
              {componente.expandido && componente.estado !== 'pending' && componente.estado !== 'bueno' && (
                <div className="pl-2 space-y-3">
                  <div>
                    <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5 block">
                      Observaciones Técnicas
                    </label>
                    <textarea
                      value={componente.observaciones}
                      onChange={(e) => actualizarObservaciones(index, e.target.value)}
                      className="w-full bg-background-light dark:bg-background-dark border border-slate-200 dark:border-slate-700 rounded-lg p-3 text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:ring-1 focus:ring-status-maintain focus:border-status-maintain outline-none resize-none"
                      placeholder="Describa el estado del componente..."
                      rows={3}
                    />
                  </div>

                  {/* Evidence Section */}
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {componente.fotos.map((foto, fotoIndex) => (
                      <div
                        key={fotoIndex}
                        className="relative size-16 shrink-0 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 group/img"
                      >
                        <img
                          alt={`Evidencia ${fotoIndex + 1}`}
                          className="object-cover w-full h-full opacity-80"
                          src={foto}
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                          <span className="material-symbols-outlined text-white text-sm">visibility</span>
                        </div>
                      </div>
                    ))}

                    {/* Add Photo Button */}
                    <button
                      onClick={() => handleAgregarFoto(index)}
                      className="size-16 shrink-0 rounded-lg border border-dashed border-slate-400 dark:border-slate-600 flex flex-col items-center justify-center text-slate-500 hover:text-primary hover:border-primary hover:bg-primary/5 transition-all"
                    >
                      <span className="material-symbols-outlined text-[20px]">add_a_photo</span>
                      <span className="text-[9px] font-medium mt-1">Foto</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Collapsed View (for completed items) */}
              {componente.expandido === false && componente.estado !== 'pending' && (
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="truncate max-w-[200px]">
                    {componente.observaciones || 'Sin observaciones'}
                  </span>
                  <button
                    onClick={() => toggleExpandido(index)}
                    className="text-primary hover:text-white hover:underline flex items-center gap-1"
                  >
                    Editar <span className="material-symbols-outlined text-[14px]">edit</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Manual Add Section */}
      <div className="px-4 py-2">
        <button className="w-full py-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl flex items-center justify-center gap-2 text-slate-500 dark:text-slate-400 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all group">
          <div className="bg-slate-200 dark:bg-slate-800 group-hover:bg-primary group-hover:text-white rounded-full p-1 transition-colors">
            <span className="material-symbols-outlined text-[20px]">add</span>
          </div>
          <span className="font-semibold text-sm">Agregar Componente Manual</span>
        </button>
      </div>

      {/* Floating Action Button Area / Sticky Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background-dark via-background-dark to-transparent pt-8 max-w-md mx-auto">
        <button
          onClick={handleFinalizar}
          disabled={loading}
          className="w-full bg-primary hover:bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-900/50 flex items-center justify-center gap-2 transition-transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Procesando...
            </>
          ) : (
            <>
              <span className="material-symbols-outlined">assignment_turned_in</span>
              Finalizar Peritaje
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export default PeritajePage
