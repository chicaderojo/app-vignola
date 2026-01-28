/**
 * Tipos principales de la aplicación de inspección hidráulica
 * Basado en el esquema de base de datos PostgreSQL
 */

// ==================== USUARIOS Y AUTENTICACIÓN ====================

export type RolUsuario = 'mecanico' | 'jefe_maestranza'

export interface Usuario {
  id: string
  nombre: string
  email: string
  rol: RolUsuario
  created_at?: string
}

export interface AuthResponse {
  user: Usuario
  token: string
}

export interface LoginCredentials {
  email: string
  password: string
}

// ==================== CLIENTES Y EQUIPOS ====================

export interface Cliente {
  id: string
  nombre: string
  planta?: string
  logo_url?: string
  created_at?: string
}

export interface Cilindro {
  id_codigo: string // ej: CE05CIL0513
  tipo: TipoCilindro
  fabricante?: string // ej: Rexroth, Parker, Hydoring
  diametro_camisa?: string // ej: Ø63
  diametro_vastago?: string // ej: Ø36
  carrera?: string // ej: 100mm
  cliente_id?: string
  cliente?: Cliente
  created_at?: string
}

export type TipoCilindro = 'Buzo' | 'Cuña Flap' | 'Oleohidráulico' | 'Cilindro Hidráulico' | 'Cilindro Neumático' | 'Vástago' | 'Camisa' | 'Bomba'

// ==================== INSPECCIONES ====================

export interface Inspeccion {
  id: string
  cilindro_id: string
  cilindro?: Cilindro
  usuario_id: string
  usuario?: Usuario
  sap_cliente: string
  nombre_cliente?: string // Nombre del cliente ingresado manualmente
  contacto_cliente?: string // Contacto del cliente
  planta?: string // Planta ubicación
  foto_armado_url: string
  foto_despiece_url: string
  presion_prueba: number // ej: 180 (bar)
  fuga_interna: boolean
  fuga_externa: boolean
  notas_recepcion?: string
  notas_pruebas?: string
  estado_inspeccion: EstadoInspeccion
  etapas_completadas?: string[] // Etapas completadas: ['recepcion'], ['recepcion', 'peritaje'], etc.
  fotos_pruebas_url?: string[] // URLs de fotos de pruebas hidráulicas
  created_at: string
  detalles?: InspeccionDetalle[]
}

export type EstadoInspeccion = 'borrador' | 'completa' | 'sincronizada'

export interface InspeccionDetalle {
  id: string
  inspeccion_id: string
  componente: string
  estado: EstadoComponente
  detalle_tecnico?: string
  accion_propuesta?: string
  observaciones?: string
  fotos_urls?: string[] // URLs de fotos adicionales del componente
  orden?: number
  created_at?: string
}

export type EstadoComponente = 'Bueno' | 'Cambio' | 'Mantención'

// ==================== COMPONENTES BASE PRE-CARGADOS ====================

export const COMPONENTES_BASE = [
  'Vástago',
  'Camisa',
  'Pistón',
  'Sellos',
  'Tapas',
  'Rótulas',
  'Pernos'
] as const

export type ComponenteBase = typeof COMPONENTES_BASE[number]

// ==================== DETALLES TÉCNICOS COMUNES ====================

export const DETALLES_TECNICOS = [
  'Rayas',
  'Piquetes',
  'Desgaste',
  'Oxidación',
  'Corrosión',
  'Grips',
  'Deformación'
] as const

export type DetalleTecnico = typeof DETALLES_TECNICOS[number]

// ==================== ACCIONES PROPUESTAS ====================

export const ACCIONES_PROPUESTAS = [
  'Fabricar',
  'Bruñir',
  'Pulir',
  'Cromar',
  'Rectificar',
  'Cambiar',
  'Limpiar',
  'Pintar'
] as const

export type AccionPropuesta = typeof ACCIONES_PROPUESTAS[number]

// ==================== COLA DE SINCRONIZACIÓN (INDEXEDDB) ====================

export type SyncQueueTipo = 'CREAR_INSPECCION' | 'SUBIR_FOTO' | 'ACTUALIZAR_INSPECCION'

export interface SyncQueueItem {
  id?: number // Auto-incremental en Dexie
  tipo: SyncQueueTipo
  payload: Inspeccion | { file: Blob; filename: string; inspeccion_id: string }
  intentos: number
  created_at: string
  last_attempt?: string
  error?: string
}

// ==================== FORMULARIOS Y ESTADOS DE UI ====================

export interface InspeccionFormData {
  // Datos del cilindro
  cilindro_id: string
  sap_cliente: string

  // Fotos obligatorias
  foto_armado: File | Blob | null
  foto_despiece: File | Blob | null

  // Pruebas hidráulicas
  presion_prueba: number
  fuga_interna: boolean
  fuga_externa: boolean

  // Detalles de componentes
  detalles: InspeccionDetalle[]
}

export interface FiltroBusqueda {
  cliente_id?: string
  buscar?: string // ID del cilindro o SAP
}

// ==================== RESPUESTAS DE API ====================

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

export interface InspeccionesResponse {
  inspecciones: Inspeccion[]
  total: number
  pagina: number
  por_pagina: number
}

// ==================== REPORTES PDF ====================

export interface ReporteData {
  inspeccion: Inspeccion
  fecha_emision: string
  inspector_nombre: string
  conclusiones: string[]
  recomendaciones: string[]
}

// ==================== ESTADO DE SINCRONIZACIÓN ====================

export interface SyncStatus {
  pendiente: boolean
  numero_items: number
  ultimo_sync?: string
  online: boolean
}

// ==================== UTILIDADES ====================

export type FotoRecepcion = 'armado' | 'despiece'

export interface FotoUpload {
  file: File | Blob
  tipo: FotoRecepcion
  preview: string
}

export interface ComponentePeritaje {
  nombre: string
  estado: EstadoComponente
  detalle_tecnico: string
  accion_propuesta: string
  es_base: boolean
  observaciones?: string
}

// ==================== MONITOREO DE MANTENCION ====================

export interface Mantenimiento {
  id: string
  inspeccion_id: string
  estado: 'en_proceso' | 'listo_pruebas' | 'completado'
  progreso: number // 0-100, peritaje completado = 50%
  cilindro: Cilindro
  cliente: string
  prioridad: 'Normal' | 'Urgente'
  etapa_actual: 'recepcion' | 'pruebas_presion' | 'peritaje' | 'completado'
}

export interface ResumenSemanal {
  cilindrosListos: number
  promedioDias: number
  enProceso: number
}

// ==================== PDF REPORTES ====================

export interface PeritajePDFData {
  inspeccion: Inspeccion
  detalles: InspeccionDetalle[]
  componentes: Array<{
    nombre: string
    estado: 'pending' | 'bueno' | 'mantencion' | 'cambio'
    observaciones: string
    fotos: string[]
  }>
  fechaEmision: string
  horaEmision: string
  inspectorNombre?: string
}

export interface ReportePDFData extends ReporteData {
  includePruebas?: boolean
  pruebasHidraulicas?: {
    presion_objetivo: number
    presion_inicial: number
    presion_final: number
    fuga_vastago: boolean
    fuga_piston: boolean
    deformacion: boolean
    observaciones: string
  }
}
