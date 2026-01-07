import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { CameraIcon, ArrowLeftIcon } from '@heroicons/react/24/outline'
import { Cilindro, FotoUpload } from '../types'

function RecepcionPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const cilindro = location.state?.cilindro as Cilindro

  const [fotoArmado, setFotoArmado] = useState<FotoUpload | null>(null)
  const [fotoDespiece, setFotoDespiece] = useState<FotoUpload | null>(null)
  const [notas, setNotas] = useState('')

  useEffect(() => {
    if (!cilindro) {
      navigate('/')
    }
  }, [cilindro, navigate])

  const handleCapturarFoto = async (tipo: 'armado' | 'despiece') => {
    // Crear input file invisible
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.capture = 'environment' // Usar cámara en móviles

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        // Crear preview
        const reader = new FileReader()
        reader.onloadend = () => {
          const fotoUpload: FotoUpload = {
            file,
            tipo,
            preview: reader.result as string
          }

          if (tipo === 'armado') {
            setFotoArmado(fotoUpload)
          } else {
            setFotoDespiece(fotoUpload)
          }
        }
        reader.readAsDataURL(file)
      }
    }

    input.click()
  }

  const handleContinuar = () => {
    if (!fotoArmado || !fotoDespiece) {
      alert('Debes capturar ambas fotos obligatorias (Armado y Despiece) antes de continuar')
      return
    }

    // Pasar a la siguiente pantalla con los datos
    navigate(`/inspeccion/${location.pathname.split('/')[2]}/peritaje`, {
      state: {
        cilindro,
        fotos: {
          armado: fotoArmado,
          despiece: fotoDespiece
        },
        notas
      }
    })
  }

  const handleVolver = () => {
    navigate('/')
  }

  if (!cilindro) {
    return null
  }

  const puedeContinuar = fotoArmado !== null && fotoDespiece !== null

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
              <h1 className="text-2xl font-bold text-gray-900">Recepción del Cilindro</h1>
              <p className="text-sm text-gray-600">{cilindro.id_codigo}</p>
            </div>

            {/* Progreso */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Paso 1 de 3</span>
              <div className="flex gap-1">
                <div className="w-8 h-2 bg-primary-600 rounded-full"></div>
                <div className="w-8 h-2 bg-gray-300 rounded-full"></div>
                <div className="w-8 h-2 bg-gray-300 rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          {/* Información del cilindro */}
          <section className="card">
            <h2 className="card-header">Información del Cilindro</h2>
            <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <dt className="text-gray-600">Código:</dt>
                <dd className="font-medium">{cilindro.id_codigo}</dd>
              </div>
              <div>
                <dt className="text-gray-600">Tipo:</dt>
                <dd className="font-medium">{cilindro.tipo}</dd>
              </div>
              <div>
                <dt className="text-gray-600">Fabricante:</dt>
                <dd className="font-medium">{cilindro.fabricante || 'N/A'}</dd>
              </div>
              <div>
                <dt className="text-gray-600">Carrera:</dt>
                <dd className="font-medium">{cilindro.carrera || 'N/A'}</dd>
              </div>
            </dl>
          </section>

          {/* Alerta de fotos obligatorias */}
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Fotos obligatorias
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>Debes capturar obligatoriamente ambas fotos antes de continuar con el peritaje técnico.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Foto 1: Armado */}
          <section className={`card border-2 ${fotoArmado ? 'border-green-300' : 'border-red-300'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                1. Foto Recepción (Armado)
                {fotoArmado && <span className="ml-2 text-green-600">✓</span>}
              </h3>
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                Obligatoria
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Estado exterior, pintura y condiciones generales del cilindro armado.
            </p>

            {fotoArmado ? (
              <div className="space-y-3">
                <img
                  src={fotoArmado.preview}
                  alt="Foto de armado"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <button
                  onClick={() => handleCapturarFoto('armado')}
                  className="btn-secondary w-full"
                >
                  Recapturar Foto
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleCapturarFoto('armado')}
                className="w-full py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors flex flex-col items-center gap-2"
              >
                <CameraIcon className="w-12 h-12 text-gray-400" />
                <span className="text-sm font-medium text-gray-600">
                  Capturar Foto de Armado
                </span>
              </button>
            )}
          </section>

          {/* Foto 2: Despiece */}
          <section className={`card border-2 ${fotoDespiece ? 'border-green-300' : 'border-red-300'}`}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                2. Foto Recepción (Por partes)
                {fotoDespiece && <span className="ml-2 text-green-600">✓</span>}
              </h3>
              <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded">
                Obligatoria
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Despiece inicial y estado de sellos internos. Muestra todos los componentes por separado.
            </p>

            {fotoDespiece ? (
              <div className="space-y-3">
                <img
                  src={fotoDespiece.preview}
                  alt="Foto de despiece"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <button
                  onClick={() => handleCapturarFoto('despiece')}
                  className="btn-secondary w-full"
                >
                  Recapturar Foto
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleCapturarFoto('despiece')}
                className="w-full py-8 border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-500 hover:bg-primary-50 transition-colors flex flex-col items-center gap-2"
              >
                <CameraIcon className="w-12 h-12 text-gray-400" />
                <span className="text-sm font-medium text-gray-600">
                  Capturar Foto de Despiece
                </span>
              </button>
            )}
          </section>

          {/* Notas adicionales */}
          <section className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Notas Adicionales (Opcional)
            </h3>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              className="input-field min-h-24"
              placeholder="Agrega cualquier observación relevante sobre la recepción del cilindro..."
            />
          </section>

          {/* Botones de acción */}
          <div className="flex gap-4">
            <button
              onClick={handleVolver}
              className="btn-secondary flex-1"
            >
              Volver
            </button>
            <button
              onClick={handleContinuar}
              disabled={!puedeContinuar}
              className="btn-primary flex-1"
            >
              Continuar al Peritaje →
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default RecepcionPage
