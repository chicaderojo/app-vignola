import { useEffect, useState } from 'react'
import { CloudArrowUpIcon, CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'
import { syncService } from '../services/syncService'
import { SyncStatus } from '../types'

export default function SyncStatusIndicator() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    pendiente: false,
    numero_items: 0,
    online: true
  })

  useEffect(() => {
    const updateStatus = async () => {
      const status = await syncService.getSyncStatus()
      setSyncStatus(status)
    }

    // Actualizar estado inicial
    updateStatus()

    // Actualizar cada 5 segundos
    const interval = setInterval(updateStatus, 5000)

    // Escuchar eventos de conexión
    const handleOnline = () => updateStatus()
    const handleOffline = () => updateStatus()

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      clearInterval(interval)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const handleForceSync = async () => {
    try {
      await syncService.forceSyncNow()
      const status = await syncService.getSyncStatus()
      setSyncStatus(status)
    } catch (error) {
      console.error('Error forzando sincronización:', error)
    }
  }

  return (
    <div className="fixed bottom-2 right-2 md:bottom-4 md:right-4 z-50">
      <div className={`flex items-center gap-1.5 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 rounded-lg shadow-lg ${
        !syncStatus.online
          ? 'bg-yellow-100 border border-yellow-300'
          : syncStatus.pendiente
          ? 'bg-blue-100 border border-blue-300'
          : 'bg-green-100 border border-green-300'
      }`}>
        {/* Icono */}
        {!syncStatus.online ? (
          <ExclamationTriangleIcon className="w-4 h-4 md:w-5 md:h-5 text-yellow-700" />
        ) : syncStatus.pendiente ? (
          <CloudArrowUpIcon className="w-4 h-4 md:w-5 md:h-5 text-blue-700 animate-pulse" />
        ) : (
          <CheckCircleIcon className="w-4 h-4 md:w-5 md:h-5 text-green-700" />
        )}

        {/* Texto - ocultar en mobile muy pequeño */}
        <div className="text-xs md:text-sm">
          {!syncStatus.online ? (
            <span className="font-medium text-yellow-800">Offline</span>
          ) : syncStatus.pendiente ? (
            <span className="font-medium text-blue-800 hidden md:inline">
              Sincronizando {syncStatus.numero_items}...
            </span>
          ) : (
            <span className="font-medium text-green-800 hidden md:inline">Sincronizado</span>
          )}
        </div>

        {/* Botón forzar sync (solo si hay pendientes) */}
        {syncStatus.online && syncStatus.pendiente && (
          <button
            onClick={handleForceSync}
            className="ml-1 md:ml-2 px-1.5 md:px-2 py-0.5 md:py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
          >
            <span className="hidden md:inline">Forzar</span>
            <span className="md:hidden">⟳</span>
          </button>
        )}
      </div>
    </div>
  )
}
