import { db } from '../db/dexie'
import { SyncQueueItem } from '../types'
import { api } from './api'

/**
 * Servicio de sincronización Offline-First
 * Maneja la cola de sincronización con IndexedDB
 */
class SyncService {
  private isSyncing: boolean = false
  private syncInterval: number | null = null

  /**
   * Iniciar el proceso de sincronización
   */
  async startSync(): Promise<void> {
    if (this.isSyncing) {
      console.log('Sincronización ya en progreso')
      return
    }

    this.isSyncing = true
    console.log('Iniciando sincronización...')

    try {
      let item = await db.getNextPendingItem()

      while (item) {
        try {
          await this.processItem(item)
          if (item.id) {
            await db.markAsCompleted(item.id)
            console.log(`Item ${item.id} sincronizado exitosamente`)
          }

          // Obtener siguiente item
          item = await db.getNextPendingItem()
        } catch (error) {
          console.error(`Error procesando item ${item?.id}:`, error)

          if (!item) break

          // Incrementar intentos y guardar error
          await db.incrementAttempts(
            item.id!,
            error instanceof Error ? error.message : 'Error desconocido'
          )

          // Si hay demasiados fallos, pasar al siguiente item
          if (item.intentos >= 4) {
            console.warn(`Item ${item.id} alcanzó máximo de intentos`)
            item = await db.getNextPendingItem()
          } else {
            // Esperar un poco antes de reintentar
            await this.delay(2000 * (item.intentos + 1))
            item = await db.getNextPendingItem()
          }
        }
      }

      console.log('Sincronización completada')
    } finally {
      this.isSyncing = false
    }
  }

  /**
   * Procesar un item de la cola
   */
  private async processItem(item: SyncQueueItem): Promise<void> {
    switch (item.tipo) {
      case 'CREAR_INSPECCION':
        await this.syncInspeccion(item.payload as any)
        break

      case 'SUBIR_FOTO':
        await this.syncFoto(item.payload as any)
        break

      case 'ACTUALIZAR_INSPECCION':
        await this.syncUpdateInspeccion(item.payload as any)
        break

      default:
        throw new Error(`Tipo de item desconocido: ${(item as any).tipo}`)
    }
  }

  /**
   * Sincronizar inspección
   */
  private async syncInspeccion(payload: any): Promise<void> {
    const { inspeccion } = payload
    await api.post('/inspecciones', inspeccion)
  }

  /**
   * Sincronizar foto
   */
  private async syncFoto(payload: any): Promise<void> {
    const { file, inspeccion_id, tipo } = payload

    const formData = new FormData()
    formData.append('file', file)
    formData.append('inspeccion_id', inspeccion_id)
    formData.append('tipo', tipo)

    await api.post('/inspecciones/upload-foto', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    })
  }

  /**
   * Sincronizar actualización de inspección
   */
  private async syncUpdateInspeccion(payload: any): Promise<void> {
    const { inspeccion_id, datos } = payload
    await api.patch(`/inspecciones/${inspeccion_id}`, datos)
  }

  /**
   * Iniciar sincronización automática al detectar conexión
   */
  startAutoSync(): void {
    // Sincronizar cuando el navegador detecta conexión
    window.addEventListener('online', () => {
      console.log('Conexión detectada, iniciando sincronización...')
      this.startSync()
    })

    // Sincronizar periódicamente cada 30 segundos
    this.syncInterval = window.setInterval(() => {
      if (navigator.onLine) {
        this.startSync()
      }
    }, 30000)

    // Sincronizar al inicio
    if (navigator.onLine) {
      this.startSync()
    }
  }

  /**
   * Detener sincronización automática
   */
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  /**
   * Obtener estado de sincronización
   */
  async getSyncStatus() {
    const pendingCount = await db.getPendingCount()
    return {
      pendiente: pendingCount > 0,
      numero_items: pendingCount,
      online: navigator.onLine
    }
  }

  /**
   * Forzar sincronización manual
   */
  async forceSyncNow(): Promise<void> {
    await this.startSync()
  }

  /**
   * Limpiar items fallidos
   */
  async cleanupFailed(): Promise<void> {
    await db.cleanupFailedItems()
  }

  /**
   * Utilidad: delay
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}

// Exportar instancia única
export const syncService = new SyncService()
