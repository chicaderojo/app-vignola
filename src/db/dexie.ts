import Dexie, { Table } from 'dexie'
import {
  SyncQueueItem,
  Inspeccion,
  Cilindro,
  Cliente
} from '../types'

/**
 * Base de datos local usando Dexie.js para estrategia Offline-First
 * Almacena:
 * 1. Cola de sincronización (con Blobs de fotos)
 * 2. Cache de cilindros y clientes (para búsqueda offline)
 * 3. Inspecciones en borrador local
 */
export class InspeccionDB extends Dexie {
  // Tabla principal: Cola de sincronización
  syncQueue!: Table<SyncQueueItem, number>

  // Tablas de cache para búsqueda offline
  cilindrosCache!: Table<Cilindro, string>
  clientesCache!: Table<Cliente, string>

  // Tabla de inspecciones en borrador local
  inspeccionesLocales!: Table<Inspeccion, string>

  constructor() {
    super('VignolaInspeccionDB')

    // Definir esquema de la base de datos
    this.version(1).stores({
      syncQueue: '++id, tipo, intentos, created_at',
      cilindrosCache: 'id_codigo, tipo, cliente_id, fabricante',
      clientesCache: 'id, nombre, planta',
      inspeccionesLocales: 'id, cilindro_id, usuario_id, created_at, estado_inspeccion'
    })
  }

  /**
   * Agregar una tarea a la cola de sincronización
   */
  async addToQueue(item: Omit<SyncQueueItem, 'id' | 'created_at' | 'intentos'>): Promise<number> {
    const queueItem: SyncQueueItem = {
      ...item,
      intentos: 0,
      created_at: new Date().toISOString()
    }

    return await this.syncQueue.add(queueItem)
  }

  /**
   * Obtener siguiente tarea pendiente de la cola
   */
  async getNextPendingItem(): Promise<SyncQueueItem | undefined> {
    return await this.syncQueue
      .where('intentos')
      .below(5) // Máximo 5 intentos
      .and(item => item.intentos < 5)
      .first()
  }

  /**
   * Marcar tarea como completada y eliminar de la cola
   */
  async markAsCompleted(id: number): Promise<void> {
    await this.syncQueue.delete(id)
  }

  /**
   * Incrementar contador de intentos y actualizar last_attempt
   */
  async incrementAttempts(id: number, error?: string): Promise<void> {
    const current = await this.syncQueue.get(id)
    if (current) {
      await this.syncQueue.update(id, {
        intentos: (current.intentos || 0) + 1,
        last_attempt: new Date().toISOString(),
        error
      })
    }
  }

  /**
   * Obtener cantidad de items pendientes en cola
   */
  async getPendingCount(): Promise<number> {
    return await this.syncQueue
      .where('intentos')
      .below(5)
      .count()
  }

  /**
   * Limpiar tareas fallidas después de muchos intentos
   */
  async cleanupFailedItems(): Promise<void> {
    const itemsToDelete = await this.syncQueue
      .where('intentos')
      .aboveOrEqual(5)
      .primaryKeys()

    await this.syncQueue.bulkDelete(itemsToDelete)
  }

  /**
   * Cache de cilindros para búsqueda offline
   */
  async cacheCilindros(cilindros: Cilindro[]): Promise<void> {
    await this.cilindrosCache.bulkPut(cilindros)
  }

  /**
   * Cache de clientes para búsqueda offline
   */
  async cacheClientes(clientes: Cliente[]): Promise<void> {
    await this.clientesCache.bulkPut(clientes)
  }

  /**
   * Buscar cilindro por ID o código SAP offline
   */
  async searchCilindro(query: string): Promise<Cilindro[]> {
    const lowerQuery = query.toLowerCase()

    return await this.cilindrosCache
      .filter(cilindro =>
        cilindro.id_codigo.toLowerCase().includes(lowerQuery)
      )
      .toArray()
  }

  /**
   * Obtener cilindros por cliente (offline)
   */
  async getCilindrosByCliente(clienteId: string): Promise<Cilindro[]> {
    return await this.cilindrosCache
      .where('cliente_id')
      .equals(clienteId)
      .toArray()
  }

  /**
   * Guardar inspección local (borrador)
   */
  async saveLocalInspeccion(inspeccion: Inspeccion): Promise<string> {
    await this.inspeccionesLocales.put(inspeccion)
    return inspeccion.id
  }

  /**
   * Obtener inspecciones locales pendientes de sincronización
   */
  async getLocalInspecciones(): Promise<Inspeccion[]> {
    return await this.inspeccionesLocales
      .where('estado_inspeccion')
      .equals('borrador')
      .toArray()
  }

  /**
   * Eliminar inspección local después de sincronizar
   */
  async deleteLocalInspeccion(id: string): Promise<void> {
    await this.inspeccionesLocales.delete(id)
  }
}

// Instancia única de la base de datos
export const db = new InspeccionDB()

// Abrir la base de datos
db.open().catch(err => {
  console.error('Error al abrir base de datos local:', err)
})

// Exportar tipo de la instancia
export type InspeccionDBType = InspeccionDB
