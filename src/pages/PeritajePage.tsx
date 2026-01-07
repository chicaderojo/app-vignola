import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeftIcon, PlusIcon, XMarkIcon } from '@heroicons/react/24/outline'
import { ComponentePeritaje, EstadoComponente, COMPONENTES_BASE, DETALLES_TECNICOS, ACCIONES_PROPUESTAS } from '../types'

function PeritajePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { cilindro, fotos, notas } = location.state || {}

  const [componentes, setComponentes] = useState<ComponentePeritaje[]>([])
  const [nuevoComponente, setNuevoComponente] = useState('')
  const [mostrarAgregarComponente, setMostrarAgregarComponente] = useState(false)

  useEffect(() => {
    if (!cilindro) {
      navigate('/')
    } else {
      // Inicializar componentes base
      const componentesIniciales: ComponentePeritaje[] = COMPONENTES_BASE.map(nombre => ({
        nombre,
        estado: 'Bueno' as EstadoComponente,
        detalle_tecnico: '',
        accion_propuesta: '',
        es_base: true
      }))
      setComponentes(componentesIniciales)
    }
  }, [cilindro, navigate])

  const actualizarComponente = (index: number, campo: keyof ComponentePeritaje, valor: string) => {
    const nuevosComponentes = [...componentes]
    nuevosComponentes[index] = {
      ...nuevosComponentes[index],
      [campo]: valor
    }
    setComponentes(nuevosComponentes)
  }

  const agregarComponenteManual = () => {
    if (!nuevoComponente.trim()) return

    const nuevoComponentePeritaje: ComponentePeritaje = {
      nombre: nuevoComponente.trim(),
      estado: 'Bueno' as EstadoComponente,
      detalle_tecnico: '',
      accion_propuesta: '',
      es_base: false
    }

    setComponentes([...componentes, nuevoComponentePeritaje])
    setNuevoComponente('')
    setMostrarAgregarComponente(false)
  }

  const eliminarComponenteManual = (index: number) => {
    if (componentes[index].es_base) return // No eliminar componentes base

    const nuevosComponentes = componentes.filter((_, i) => i !== index)
    setComponentes(nuevosComponentes)
  }

  const handleContinuar = () => {
    // Validar que todos los componentes tengan estado
    const componentesSinEstado = componentes.filter(c => !c.estado)
    if (componentesSinEstado.length > 0) {
      alert('Todos los componentes deben tener un estado asignado')
      return
    }

    // Pasar a la siguiente pantalla con los datos
    navigate(`/inspeccion/${location.pathname.split('/')[2]}/pruebas`, {
      state: {
        cilindro,
        fotos,
        notas,
        componentes
      }
    })
  }

  const handleVolver = () => {
    navigate(`/inspeccion/${location.pathname.split('/')[2]}/recepcion`, {
      state: { cilindro }
    })
  }

  if (!cilindro) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={handleVolver}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeftIcon className="w-5 h-5 text-gray-600" />
            </button>

            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900">Peritaje Técnico</h1>
              <p className="text-sm text-gray-600">{cilindro.id_codigo}</p>
            </div>

            {/* Progreso */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Paso 2 de 3</span>
              <div className="flex gap-1">
                <div className="w-8 h-2 bg-green-600 rounded-full"></div>
                <div className="w-8 h-2 bg-primary-600 rounded-full"></div>
                <div className="w-8 h-2 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Instrucciones */}
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-lg">
            <div className="flex">
              <svg className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Instrucciones de peritaje
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>Evalúa cada componente del cilindro. Selecciona el estado (Bueno/Cambio/Mantención) y agrega detalles técnicos o acciones propuestas según corresponda.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Botón agregar componente manual */}
          <div className="flex justify-end">
            <button
              onClick={() => setMostrarAgregarComponente(!mostrarAgregarComponente)}
              className="btn-secondary flex items-center gap-2"
            >
              <PlusIcon className="w-5 h-5" />
              Agregar Componente Manual
            </button>
          </div>

          {/* Formulario para agregar componente manual */}
          {mostrarAgregarComponente && (
            <div className="card border-2 border-primary-300">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Nuevo Componente
              </h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={nuevoComponente}
                  onChange={(e) => setNuevoComponente(e.target.value)}
                  className="input-field flex-1"
                  placeholder="Nombre del componente (ej: Glands, Tirantes, Tuberías)"
                  onKeyPress={(e) => e.key === 'Enter' && agregarComponenteManual()}
                />
                <button
                  onClick={agregarComponenteManual}
                  className="btn-primary"
                >
                  Agregar
                </button>
                <button
                  onClick={() => {
                    setMostrarAgregarComponente(false)
                    setNuevoComponente('')
                  }}
                  className="btn-secondary"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Lista de componentes */}
          <div className="space-y-4">
            {componentes.map((componente, index) => (
              <section key={index} className="card">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-base md:text-lg font-semibold text-gray-900">
                    {componente.nombre}
                    {componente.es_base && (
                      <span className="ml-2 text-xs font-normal text-gray-500">(Base)</span>
                    )}
                  </h3>

                  {!componente.es_base && (
                    <button
                      onClick={() => eliminarComponenteManual(index)}
                      className="p-1 hover:bg-red-100 rounded transition-colors"
                      title="Eliminar componente"
                    >
                      <XMarkIcon className="w-4 h-4 md:w-5 md:h-5 text-red-600" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Estado */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Estado *
                    </label>
                    <select
                      value={componente.estado}
                      onChange={(e) => actualizarComponente(index, 'estado', e.target.value)}
                      className="input-field"
                    >
                      <option value="Bueno">Bueno</option>
                      <option value="Mantención">Mantención</option>
                      <option value="Cambio">Cambio</option>
                    </select>
                  </div>

                  {/* Detalle técnico */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Detalle Técnico
                    </label>
                    <select
                      value={componente.detalle_tecnico}
                      onChange={(e) => actualizarComponente(index, 'detalle_tecnico', e.target.value)}
                      className="input-field"
                    >
                      <option value="">Seleccionar...</option>
                      {DETALLES_TECNICOS.map(detalle => (
                        <option key={detalle} value={detalle}>{detalle}</option>
                      ))}
                    </select>
                  </div>

                  {/* Acción propuesta */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Acción Propuesta
                    </label>
                    <select
                      value={componente.accion_propuesta}
                      onChange={(e) => actualizarComponente(index, 'accion_propuesta', e.target.value)}
                      className="input-field"
                    >
                      <option value="">Seleccionar...</option>
                      {ACCIONES_PROPUESTAS.map(accion => (
                        <option key={accion} value={accion}>{accion}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Detalles visuales según estado */}
                <div className="mt-3 p-2 rounded-lg border-2 ${
                  componente.estado === 'Bueno' ? 'estado-bueno' :
                  componente.estado === 'Cambio' ? 'estado-cambio' :
                  'estado-mantencion'
                }">
                  <p className="text-xs font-medium">
                    {componente.estado === 'Bueno' && '✓ Componente en buen estado'}
                    {componente.estado === 'Cambio' && '⚠️ Requiere cambio'}
                    {componente.estado === 'Mantención' && '🔧 Requiere mantención'}
                  </p>
                </div>

                {/* Campo para detalles adicionales */}
                <div className="mt-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Observaciones
                  </label>
                  <textarea
                    value={componente.observaciones || ''}
                    onChange={(e) => actualizarComponente(index, 'observaciones', e.target.value)}
                    className="input-field min-h-16 text-sm"
                    placeholder="Observaciones adicionales..."
                  />
                </div>
              </section>
            ))}
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-2">
            <button
              onClick={handleVolver}
              className="btn-secondary flex-1"
            >
              ← Volver
            </button>
            <button
              onClick={handleContinuar}
              className="btn-primary flex-1"
            >
              Continuar →
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default PeritajePage
