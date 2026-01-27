import { createClient } from '@supabase/supabase-js'
import {
  Inspeccion,
  Cilindro,
  Cliente,
  InspeccionDetalle
} from '../types'

/**
 * Configuración de Supabase
 */
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error(
    'Faltan las credenciales de Supabase. ' +
    'Verifica que VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY estén en tu archivo .env'
  )
}

/**
 * Cliente de Supabase
 */
export const supabase = createClient(SUPABASE_URL || '', SUPABASE_ANON_KEY || '')

/**
 * Servicio de Supabase para obtener datos de la base de datos
 */
export const supabaseService = {
  /**
   * Obtener todas las inspecciones
   */
  async getInspecciones(): Promise<Inspeccion[]> {
    const { data, error } = await supabase
      .from('inspecciones')
      .select(`
        *,
        cilindro:cilindros(id_codigo, tipo, fabricante, diametro_camisa, diametro_vastago, carrera, cliente_id),
        usuario:usuarios(id, nombre, email)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error en getInspecciones:', error)
      throw error
    }
    return data || []
  },

  /**
   * Obtener inspecciones por estado
   */
  async getInspeccionesByEstado(estado: string): Promise<Inspeccion[]> {
    const { data, error } = await supabase
      .from('inspecciones')
      .select(`
        *,
        cilindro:cilindros(id_codigo, tipo, fabricante, diametro_camisa, diametro_vastago, carrera),
        usuario:usuarios(id, nombre, email)
      `)
      .eq('estado_inspeccion', estado)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error en getInspeccionesByEstado:', error)
      throw error
    }
    return data || []
  },

  /**
   * Obtener una inspección por ID
   */
  async getInspeccionById(id: string): Promise<Inspeccion | null> {
    const { data, error } = await supabase
      .from('inspecciones')
      .select(`
        *,
        cilindro:cilindros(id_codigo, tipo, fabricante, diametro_camisa, diametro_vastago, carrera),
        usuario:usuarios(id, nombre, email)
      `)
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  /**
   * Obtener detalles de una inspección
   */
  async getInspeccionDetalles(inspeccionId: string): Promise<InspeccionDetalle[]> {
    const { data, error } = await supabase
      .from('inspeccion_detalles')
      .select('*')
      .eq('inspeccion_id', inspeccionId)
      .order('orden', { ascending: true })

    if (error) throw error
    return data || []
  },

  /**
   * Obtener inspección completa con detalles
   */
  async getInspeccionCompleta(id: string): Promise<{ inspeccion: Inspeccion; detalles: InspeccionDetalle[] } | null> {
    const [inspeccion, detalles] = await Promise.all([
      this.getInspeccionById(id),
      this.getInspeccionDetalles(id)
    ])

    if (!inspeccion) return null

    return { inspeccion, detalles }
  },

  /**
   * Obtener todos los cilindros
   */
  async getCilindros(): Promise<Cilindro[]> {
    const { data, error } = await supabase
      .from('cilindros')
      .select(`
        *,
        cliente:clientes(id, nombre, planta)
      `)
      .order('id_codigo', { ascending: true })

    if (error) throw error
    return data || []
  },

  /**
   * Buscar cilindros por query
   */
  async searchCilindros(query: string): Promise<Cilindro[]> {
    const { data, error } = await supabase
      .from('cilindros')
      .select(`
        *,
        cliente:clientes(id, nombre, planta)
      `)
      .or(`id_codigo.ilike.%${query}%,sap_cliente.ilike.%${query}%,serie.ilike.%${query}%`)
      .order('id_codigo', { ascending: true })

    if (error) throw error
    return data || []
  },

  /**
   * Obtener cilindro por ID
   */
  async getCilindroById(id: string): Promise<Cilindro | null> {
    const { data, error } = await supabase
      .from('cilindros')
      .select(`
        *,
        cliente:clientes(id, nombre, planta)
      `)
      .eq('id_codigo', id)
      .single()

    if (error) throw error
    return data
  },

  /**
   * Obtener todos los clientes
   */
  async getClientes(): Promise<Cliente[]> {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .order('nombre', { ascending: true })

    if (error) throw error
    return data || []
  },

  /**
   * Obtener cliente por ID
   */
  async getClienteById(id: string): Promise<Cliente | null> {
    const { data, error } = await supabase
      .from('clientes')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  /**
   * Obtener cilindros de un cliente
   */
  async getCilindrosByCliente(clienteId: string): Promise<Cilindro[]> {
    const { data, error } = await supabase
      .from('cilindros')
      .select('*')
      .eq('cliente_id', clienteId)
      .order('id_codigo', { ascending: true })

    if (error) throw error
    return data || []
  },

  /**
   * Crear un nuevo cilindro
   */
  async createCilindro(cilindro: Partial<Cilindro>): Promise<Cilindro> {
    const { data, error } = await supabase
      .from('cilindros')
      .insert([cilindro])
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Crear una nueva inspección
   */
  async createInspeccion(inspeccion: Partial<Inspeccion>): Promise<Inspeccion> {
    // Inicializar etapas_completadas si no se proporciona
    const inspeccionConEtapas = {
      ...inspeccion,
      etapas_completadas: inspeccion.etapas_completadas || ['recepcion']
    }

    const { data, error } = await supabase
      .from('inspecciones')
      .insert([inspeccionConEtapas])
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Actualizar una inspección
   */
  async updateInspeccion(id: string, updates: Partial<Inspeccion>): Promise<Inspeccion> {
    const { data, error } = await supabase
      .from('inspecciones')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Guardar resultados de pruebas hidrostáticas
   */
  async savePruebas(
    inspeccionId: string,
    datosPrueba: {
      presion_objetivo: number
      sostenimiento: number
      presion_inicial: number
      presion_final: number
      fuga_vastago: boolean
      fuga_piston: boolean
      deformacion: boolean
      observaciones: string
      fotos_pruebas?: string[]
    }
  ): Promise<void> {
    await this.updateInspeccion(inspeccionId, {
      presion_prueba: datosPrueba.presion_objetivo,
      fuga_interna: datosPrueba.fuga_piston,
      fuga_externa: datosPrueba.fuga_vastago || datosPrueba.deformacion,
      fotos_pruebas_url: datosPrueba.fotos_pruebas || [],
      estado_inspeccion: 'completa',
      etapas_completadas: ['recepcion', 'peritaje', 'pruebas', 'finalizado']
    })
  },

  /**
   * Crear detalles de inspección
   */
  async createInspeccionDetalles(detalles: Omit<InspeccionDetalle, 'id' | 'created_at'>[]): Promise<InspeccionDetalle[]> {
    const { data, error } = await supabase
      .from('inspeccion_detalles')
      .insert(detalles)
      .select()

    if (error) throw error
    return data || []
  },

  /**
   * Guardar detalles de peritaje (elimina los anteriores y crea nuevos)
   */
  async savePeritaje(
    inspeccionId: string,
    componentes: Array<{
      id?: string
      nombre: string
      estado: 'bueno' | 'mantencion' | 'cambio' | 'pending'
      observaciones?: string
      fotos?: string[]
    }>
  ): Promise<void> {
    // Eliminar detalles anteriores
    await this.deleteInspeccionDetalles(inspeccionId)

    // Crear nuevos detalles con fotos
    const detalles = componentes
      .filter(c => c.estado !== 'pending')
      .map((c, index) => ({
        inspeccion_id: inspeccionId,
        componente: c.nombre,
        estado: (c.estado === 'bueno' ? 'Bueno' : c.estado === 'mantencion' ? 'Mantención' : 'Cambio') as 'Bueno' | 'Mantención' | 'Cambio',
        detalle_tecnico: c.observaciones || undefined,
        accion_propuesta: undefined,
        fotos_urls: c.fotos || [],
        orden: index
      }))

    if (detalles.length > 0) {
      await this.createInspeccionDetalles(detalles)
    }

    // Actualizar etapas_completadas
    await this.updateInspeccion(inspeccionId, {
      etapas_completadas: ['recepcion', 'peritaje']
    })
  },

  /**
   * Actualizar detalles de inspección
   */
  async updateInspeccionDetalle(id: string, updates: Partial<InspeccionDetalle>): Promise<InspeccionDetalle> {
    const { data, error } = await supabase
      .from('inspeccion_detalles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Subir foto a Supabase Storage
   */
  async uploadFoto(file: File, inspeccionId: string, tipo: 'armado' | 'despiece' | 'evidencia'): Promise<string> {
    const fileExt = file.name.split('.').pop()
    const fileName = `${inspeccionId}/${tipo}_${Date.now()}.${fileExt}`
    const filePath = `${fileName}`

    const { error } = await supabase.storage
      .from('inspecciones-fotos')
      .upload(filePath, file)

    if (error) {
      console.error('Error subiendo foto:', error)
      throw error
    }

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('inspecciones-fotos')
      .getPublicUrl(filePath)

    return publicUrl
  },

  /**
   * Subir foto de componente a Supabase Storage
   * Similar a uploadFoto pero para fotos adicionales de componentes
   */
  async uploadFotoComponente(
    file: File,
    inspeccionId: string,
    detalleId: string,
    index: number
  ): Promise<string> {
    const fileExt = file.name.split('.').pop()
    const fileName = `${inspeccionId}/componentes/${detalleId}_foto_${index}.${fileExt}`
    const filePath = fileName

    const { error } = await supabase.storage
      .from('inspecciones-fotos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Error subiendo foto de componente:', error)
      throw error
    }

    const { data: { publicUrl } } = supabase.storage
      .from('inspecciones-fotos')
      .getPublicUrl(filePath)

    return publicUrl
  },

  /**
   * Subir foto de prueba hidráulica
   */
  async uploadFotoPrueba(
    file: File,
    inspeccionId: string,
    index: number
  ): Promise<string> {
    const fileExt = file.name.split('.').pop()
    const fileName = `${inspeccionId}/pruebas/prueba_${index}.${fileExt}`
    const filePath = fileName

    const { error } = await supabase.storage
      .from('inspecciones-fotos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Error subiendo foto de prueba:', error)
      throw error
    }

    const { data: { publicUrl } } = supabase.storage
      .from('inspecciones-fotos')
      .getPublicUrl(filePath)

    return publicUrl
  },

  /**
   * Eliminar detalles de una inspección
   */
  async deleteInspeccionDetalles(inspeccionId: string): Promise<void> {
    const { error } = await supabase
      .from('inspeccion_detalles')
      .delete()
      .eq('inspeccion_id', inspeccionId)

    if (error) throw error
  },

  /**
   * Crear o actualizar usuario
   */
  async createOrUpdateUsuario(usuario: {
    id: string
    nombre: string
    email: string
    rol: string
  }): Promise<void> {
    // Primero verificamos si existe un usuario con el mismo email
    const { data: existingUser, error: queryError } = await supabase
      .from('usuarios')
      .select('id')
      .eq('email', usuario.email)
      .maybeSingle()

    if (queryError && queryError.code !== 'PGRST116') {
      console.error('Error buscando usuario:', queryError)
      throw queryError
    }

    if (existingUser) {
      // Usuario existe con este email, actualizar sus datos
      const { error } = await supabase
        .from('usuarios')
        .update({
          nombre: usuario.nombre,
          rol: usuario.rol
          // NO actualizamos el email para evitar duplicados
        })
        .eq('email', usuario.email)

      if (error) {
        console.error('Error actualizando usuario existente:', error)
        throw error
      }
      console.log('Usuario actualizado exitosamente:', usuario.email)
    } else {
      // No existe usuario con este email, crear nuevo
      const { error } = await supabase
        .from('usuarios')
        .insert({
          id: usuario.id,
          nombre: usuario.nombre,
          email: usuario.email,
          rol: usuario.rol,
          password_hash: 'demo-hash-' + Date.now() // Hash temporal para modo demo
        })

      if (error) {
        console.error('Error creando nuevo usuario:', error)
        throw error
      }
      console.log('Nuevo usuario creado exitosamente:', usuario.email)
    }
  },

  /**
   * Obtener usuario por email
   */
  async getUsuarioByEmail(email: string): Promise<any | null> {
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', email)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No se encontró el usuario
        return null
      }
      console.error('Error obteniendo usuario por email:', error)
      throw error
    }

    return data
  },

  /**
   * Obtener estadísticas del dashboard
   */
  async getDashboardStats(): Promise<{
    totalInspecciones: number
    inspeccionesPendientes: number
    inspeccionesCompletas: number
    cilindrosActivos: number
  }> {
    console.log('Obteniendo estadísticas de Supabase...')

    const [totalResult, pendientesResult, completasResult, cilindrosResult] = await Promise.all([
      supabase.from('inspecciones').select('*', { count: 'exact', head: true }),
      supabase.from('inspecciones').select('*', { count: 'exact', head: true }).eq('estado_inspeccion', 'borrador'),
      supabase.from('inspecciones').select('*', { count: 'exact', head: true }).in('estado_inspeccion', ['completa', 'sincronizada']),
      supabase.from('cilindros').select('*', { count: 'exact', head: true })
    ])

    // Log detallado de resultados
    console.log('Resultados crudos:', JSON.stringify({
      total: totalResult,
      pendientes: pendientesResult,
      completas: completasResult,
      cilindros: cilindrosResult
    }, null, 2))

    // Log de errores si existen
    if (totalResult.error) console.error('Error totalInspecciones:', totalResult.error)
    if (pendientesResult.error) console.error('Error inspeccionesPendientes:', pendientesResult.error)
    if (completasResult.error) console.error('Error inspeccionesCompletas:', completasResult.error)
    if (cilindrosResult.error) console.error('Error cilindrosActivos:', cilindrosResult.error)

    console.log('Conteos:', {
      total: totalResult.count,
      pendientes: pendientesResult.count,
      completas: completasResult.count,
      cilindros: cilindrosResult.count
    })

    return {
      totalInspecciones: totalResult.count || 0,
      inspeccionesPendientes: pendientesResult.count || 0,
      inspeccionesCompletas: completasResult.count || 0,
      cilindrosActivos: cilindrosResult.count || 0
    }
  },

  /**
   * Obtener todas las órdenes de fabricación
   */
  async getOrdenesFabricacion(): Promise<any[]> {
    const { data, error } = await supabase
      .from('ordenes_fabricacion')
      .select(`
        *,
        cliente:clientes(id, nombre, planta)
      `)
      .eq('activo', true)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  /**
   * Crear una nueva orden de fabricación
   */
  async createOrdenFabricacion(orden: any): Promise<any> {
    const { data, error } = await supabase
      .from('ordenes_fabricacion')
      .insert([orden])
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Actualizar una orden de fabricación
   */
  async updateOrdenFabricacion(id: string, updates: any): Promise<any> {
    const { data, error } = await supabase
      .from('ordenes_fabricacion')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  /**
   * Guardar preferencias de usuario
   */
  async saveUsuarioPreferences(
    usuarioId: string,
    preferences: {
      notificaciones: boolean
      frecuenciaSync: string
      darkMode: boolean
    }
  ): Promise<void> {
    // Nota: Requiere agregar columna 'preferences' JSONB a tabla usuarios
    await supabase
      .from('usuarios')
      .update({ preferences })
      .eq('id', usuarioId)
  },

  /**
   * Obtener historial de búsquedas de un usuario
   */
  async getBusquedasRecientes(usuarioId?: string, limit: number = 5): Promise<any[]> {
    const { data, error } = await supabase
      .from('historial_busquedas')
      .select('*')
      .eq('usuario_id', usuarioId || '00000000-0000-0000-0000-000000000000')
      .order('fecha', { ascending: false })
      .limit(limit)

    if (error) {
      // Si la tabla no existe, retornar array vacío
      if (error.code === '42P01') return []
      throw error
    }
    return data || []
  },

  /**
   * Guardar búsqueda en historial
   */
  async saveBusqueda(termino: string, tipo: string, usuarioId?: string): Promise<void> {
    // Nota: Requiere crear tabla 'historial_busquedas'
    await supabase
      .from('historial_busquedas')
      .insert([{
        usuario_id: usuarioId || '00000000-0000-0000-0000-000000000000',
        termino,
        tipo,
        fecha: new Date().toISOString()
      }])
      .select()
  }
}

export default supabaseService
