import { useState } from 'react'

type ComponenteStatus = 'pending' | 'bueno' | 'mantencion' | 'cambio'

interface AgregarComponenteModalProps {
  isOpen: boolean
  onClose: () => void
  onAgregar: (componente: {
    nombre: string
    estado: ComponenteStatus
    observaciones: string
    fotos: string[]
  }) => void
}

export function AgregarComponenteModal({ isOpen, onClose, onAgregar }: AgregarComponenteModalProps) {
  const [nombre, setNombre] = useState('')

  if (!isOpen) return null

  const handleGuardar = () => {
    if (!nombre.trim()) {
      alert('Por favor, ingresa el nombre del componente')
      return
    }

    onAgregar({
      nombre: nombre.trim(),
      estado: 'pending',
      observaciones: '',
      fotos: []
    })

    // Reset form
    setNombre('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white dark:bg-surface-dark w-full max-w-md rounded-2xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Agregar Componente Manual
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
            >
              <span className="material-symbols-outlined text-slate-500">close</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Nombre del componente */}
          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
              Nombre del Componente *
            </label>
            <input
              type="text"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-surface-dark text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
              placeholder="Ej: Tubo hidráulico, Conector, Vástago, etc."
              autoFocus
            />
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              El componente se agregará como "Pendiente de Revisión" y podrás evaluarlo, agregar observaciones y fotos en la pantalla principal.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleGuardar}
              className="flex-1 py-3 px-4 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold transition-colors"
            >
              Agregar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
