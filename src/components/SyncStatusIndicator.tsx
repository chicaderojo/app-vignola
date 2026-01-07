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
    <div className="fixed bottom-4 right-4 z-50">
      <div className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
        !syncStatus.online
          ? 'bg-yellow-100 border border-yellow-300'
          : syncStatus.pendiente
          ? 'bg-blue-100 border border-blue-300'
          : 'bg-green-100 border border-green-300'
      }`}>
        {/* Icono */}
        {!syncStatus.online ? (
          <ExclamationTriangleIcon className="w-5 h-5 text-yellow-700" />
        ) : syncStatus.pendiente ? (
          <CloudArrowUpIcon className="w-5 h-5 text-blue-700 animate-pulse" />
        ) : (
          <CheckCircleIcon className="w-5 h-5 text-green-700" />
        )}

        {/* Texto */}
        <div className="text-sm">
          {!syncStatus.online ? (
            <span className="font-medium text-yellow-800">Sin conexión</span>
          ) : syncStatus.pendiente ? (
            <span className="font-medium text-blue-800">
              Sincronizando {syncStatus.numero_items} item{syncStatus.numero_items !== 1 ? 's' : ''}...
            </span>
          ) : (
            <span className="font-medium text-green-800">Sincronizado</span>
          )}
        </div>

        {/* Botón forzar sync (solo si hay pendientes) */}
        {syncStatus.online && syncStatus.pendiente && (
          <button
            onClick={handleForceSync}
            className="ml-2 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
          >
            Forzar
          </button>
        )}
      </div>
    </div>
  )
}
