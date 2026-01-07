import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeftIcon, CheckCircleIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline'
import { Cilindro, FotoUpload, ComponentePeritaje } from '../types'

function PruebasPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { cilindro, fotos, notas, componentes } = location.state || {}

  const [presionPrueba, setPresionPrueba] = useState('180')
  const [fugaExterna, setFugaExterna] = useState(false)
  const [fugaInterna, setFugaInterna] = useState(false)
  const [cicloCompleto, setCicloCompleto] = useState(false)
  const [notasPruebas, setNotasPruebas] = useState('')
  const [generandoPDF, setGenerandoPDF] = useState(false)

  useEffect(() => {
    if (!cilindro || !componentes) {
      navigate('/')
    }
  }, [cilindro, componentes, navigate])

  const handleGuardar = async () => {
    // Validaciones
    if (!presionPrueba || !cicloCompleto) {
      alert('Debes ingresar la presión de prueba y confirmar que se completó el ciclo')
      return
    }

    // Preparar datos de la inspección completa
    const inspeccionCompleta = {
      cilindro,
      fotos,
      notas,
      componentes,
      pruebas: {
        presion_prueba: parseInt(presionPrueba),
        fuga_interna: fugaInterna,
        fuga_externa: fugaExterna,
        ciclo_completo: cicloCompleto,
        notas: notasPruebas
      }
    }

    // TODO: Guardar en la cola de sincronización
    console.log('Inspección completa:', inspeccionCompleta)

    // Mostrar confirmación
    alert('Inspección guardada exitosamente')

    // Volver al dashboard
    navigate('/')
  }

  const handleGenerarPDF = async () => {
    setGenerandoPDF(true)

    try {
      // TODO: Implementar generación de PDF con react-pdf
      await new Promise(resolve => setTimeout(resolve, 2000))
      alert('PDF generado exitosamente')
    } catch (error) {
      console.error('Error generando PDF:', error)
      alert('Error al generar PDF')
    } finally {
      setGenerandoPDF(false)
    }
  }

  const handleVolver = () => {
    navigate(`/inspeccion/${location.pathname.split('/')[2]}/peritaje`, {
      state: {
        cilindro,
        fotos,
        notas,
        componentes
      }
    })
  }

  if (!cilindro || !componentes) {
    return null
  }

  const componentesConProblemas = componentes.filter(c => c.estado !== 'Bueno')

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
              <h1 className="text-2xl font-bold text-gray-900">Pruebas Hidráulicas</h1>
              <p className="text-sm text-gray-600">{cilindro.id_codigo}</p>
            </div>

            {/* Progreso */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Paso 3 de 3</span>
              <div className="flex gap-1">
                <div className="w-8 h-2 bg-green-600 rounded-full"></div>
                <div className="w-8 h-2 bg-green-600 rounded-full"></div>
                <div className="w-8 h-2 bg-primary-600 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Resumen del peritaje */}
          <section className="card bg-blue-50">
            <h2 className="card-header flex items-center gap-2">
              <CheckCircleIcon className="w-6 h-6 text-blue-600" />
              Resumen del Peritaje
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg">
                <dt className="text-sm text-gray-600">Total Componentes</dt>
                <dd className="text-2xl font-bold text-gray-900">{componentes.length}</dd>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <dt className="text-sm text-gray-600">Buen Estado</dt>
                <dd className="text-2xl font-bold text-green-600">
                  {componentes.filter(c => c.estado === 'Bueno').length}
                </dd>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <dt className="text-sm text-gray-600">Requieren Atención</dt>
                <dd className="text-2xl font-bold text-red-600">
                  {componentesConProblemas.length}
                </dd>
              </div>
            </div>

            {componentesConProblemas.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Componentes que requieren atención:</h4>
                <ul className="text-sm space-y-1">
                  {componentesConProblemas.map((comp, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${
                        comp.estado === 'Cambio' ? 'bg-red-600' : 'bg-yellow-600'
                      }`}></span>
                      <span className="font-medium">{comp.nombre}</span>
                      <span className="text-gray-600">- {comp.estado}</span>
                      {comp.accion_propuesta && (
                        <span className="text-gray-600">→ {comp.accion_propuesta}</span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* Pruebas hidráulicas */}
          <section className="card">
            <h2 className="card-header">Pruebas Hidráulicas</h2>

            <div className="space-y-6">
              {/* Presión de prueba */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Presión de Prueba (bar) *
                </label>
                <input
                  type="number"
                  value={presionPrueba}
                  onChange={(e) => setPresionPrueba(e.target.value)}
                  className="input-field"
                  placeholder="ej: 180"
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Presión máxima de trabajo del cilindro
                </p>
              </div>

              {/* Ciclo de prueba */}
              <div>
                <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cicloCompleto}
                    onChange={(e) => setCicloCompleto(e.target.checked)}
                    className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      Ciclo de prueba completado (5 minutos)
                    </span>
                    <p className="text-xs text-gray-600">
                      Confirmar que se realizó el ciclo completo de prueba
                    </p>
                  </div>
                </label>
              </div>

              {/* Verificación de fugas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Fuga externa */}
                <label className={`flex items-center gap-3 p-4 rounded-lg cursor-pointer border-2 transition-colors ${
                  fugaExterna ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="checkbox"
                    checked={fugaExterna}
                    onChange={(e) => setFugaExterna(e.target.checked)}
                    className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      Fuga Externa Detectada
                    </span>
                    <p className="text-xs text-gray-600">
                      Uniones camisa-tapas, conexiones
                    </p>
                  </div>
                </label>

                {/* Fuga interna */}
                <label className={`flex items-center gap-3 p-4 rounded-lg cursor-pointer border-2 transition-colors ${
                  fugaInterna ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="checkbox"
                    checked={fugaInterna}
                    onChange={(e) => setFugaInterna(e.target.checked)}
                    className="w-5 h-5 text-red-600 rounded focus:ring-red-500"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      Fuga Interna Detectada
                    </span>
                    <p className="text-xs text-gray-600">
                      Entre cámaras del cilindro
                    </p>
                  </div>
                </label>
              </div>

              {/* Notas de pruebas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas de Prueba (Opcional)
                </label>
                <textarea
                  value={notasPruebas}
                  onChange={(e) => setNotasPruebas(e.target.value)}
                  className="input-field min-h-24"
                  placeholder="Observaciones durante las pruebas hidráulicas..."
                />
              </div>
            </div>
          </section>

          {/* Advertencias según resultados */}
          {(fugaExterna || fugaInterna) && (
            <div className="bg-red-50 border-l-4 border-red-600 p-4 rounded-lg">
              <div className="flex">
                <svg className="h-5 w-5 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Atención: Fugas detectadas
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>Se detectaron fugas durante las pruebas. Esto requiere atención inmediata antes de volver a poner el cilindro en servicio.</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Fotos de recepción (resumen) */}
          <section className="card">
            <h2 className="card-header">Fotos de Recepción</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600 mb-2">Foto Armado</p>
                {fotos?.armado && (
                  <img
                    src={fotos.armado.preview}
                    alt="Armado"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-2">Foto Despiece</p>
                {fotos?.despiece && (
                  <img
                    src={fotos.despiece.preview}
                    alt="Despiece"
                    className="w-full h-48 object-cover rounded-lg"
                  />
                )}
              </div>
            </div>
          </section>

          {/* Botones de acción */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={handleVolver}
              className="btn-secondary"
            >
              ← Volver
            </button>

            <button
              onClick={handleGenerarPDF}
              disabled={generandoPDF}
              className="btn-secondary flex items-center justify-center gap-2"
            >
              <DocumentArrowDownIcon className="w-5 h-5" />
              {generandoPDF ? 'Generando...' : 'Generar PDF'}
            </button>

            <button
              onClick={handleGuardar}
              className="btn-primary"
            >
              Guardar Inspección
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default PruebasPage
