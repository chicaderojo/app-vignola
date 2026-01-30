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
   * Buscar inspecciones por término y filtro
   */
  async buscarInspecciones(
    termino: string,
    filtro: 'cliente' | 'fecha' | 'orden'
  ): Promise<Inspeccion[]> {
    let query = supabase
      .from('inspecciones')
      .select('*')
      .order('created_at', { ascending: false })

    switch (filtro) {
      case 'cliente':
        query = query.ilike('nombre_cliente', `%${termino}%`)
        break
      case 'fecha':
        // Buscar por fecha (formato YYYY-MM-DD o DD-MM-YYYY)
        query = query.ilike('created_at', `%${termino}%`)
        break
      case 'orden':
        query = query.or(`sap_cliente.ilike.%${termino}%,id.ilike.%${termino}%`)
        break
    }

    const { data, error } = await query.limit(20)

    if (error) throw error
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
      .maybeSingle() // Usar maybeSingle() en lugar de single() para devolver null si no existe

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
   * Ahora sube las fotos de pruebas si se proporcionan
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
    // Subir fotos de pruebas si se proporcionan
    let urlsFotosPruebas: string[] = []

    if (datosPrueba.fotos_pruebas && datosPrueba.fotos_pruebas.length > 0) {
      for (let i = 0; i < datosPrueba.fotos_pruebas.length; i++) {
        const fotoUrl = datosPrueba.fotos_pruebas[i]

        // Si es Data URL, convertirla y subirla
        if (fotoUrl.startsWith('data:')) {
          try {
            const blob = await fetch(fotoUrl).then(r => r.blob())
            const file = new File([blob], `prueba_${i}.jpg`, { type: 'image/jpeg' })
            const urlPublica = await this.uploadFotoPrueba(file, inspeccionId, i)
            urlsFotosPruebas.push(urlPublica)
          } catch (error) {
            console.error(`Error subiendo foto ${i} de pruebas:`, error)
            // Mantener Data URL como fallback
            urlsFotosPruebas.push(fotoUrl)
          }
        } else {
          // Ya es una URL pública
          urlsFotosPruebas.push(fotoUrl)
        }
      }
    }

    await this.updateInspeccion(inspeccionId, {
      presion_prueba: datosPrueba.presion_objetivo,
      fuga_interna: datosPrueba.fuga_piston,
      fuga_externa: datosPrueba.fuga_vastago || datosPrueba.deformacion,
      fotos_pruebas_url: urlsFotosPruebas,
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
   * Ahora sube las fotos de componentes si se proporcionan
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

    // Primero crear los detalles sin fotos para obtener los IDs
    const detallesSinFotos = componentes
      .filter(c => c.estado !== 'pending')
      .map((c, index) => ({
        inspeccion_id: inspeccionId,
        componente: c.nombre,
        estado: (c.estado === 'bueno' ? 'Bueno' : c.estado === 'mantencion' ? 'Mantención' : 'Cambio') as 'Bueno' | 'Mantención' | 'Cambio',
        detalle_tecnico: c.observaciones || undefined,
        accion_propuesta: undefined,
        fotos_urls: [] as string[], // Temporalmente vacío
        orden: index
      }))

    if (detallesSinFotos.length > 0) {
      const detallesCreados = await this.createInspeccionDetalles(detallesSinFotos)

      // Ahora subir las fotos para cada componente usando su ID
      for (let i = 0; i < componentes.length; i++) {
        const componente = componentes[i]
        if (componente.estado === 'pending') continue

        const detalleCreado = detallesCreados[i]
        if (!detalleCreado) continue

        // Si tiene fotos, subirlas
        if (componente.fotos && componente.fotos.length > 0) {
          const urlsSubidas: string[] = []

          for (let j = 0; j < componente.fotos.length; j++) {
            const fotoUrl = componente.fotos[j]

            // Si es Data URL, convertirla y subirla
            if (fotoUrl.startsWith('data:')) {
              try {
                const blob = await fetch(fotoUrl).then(r => r.blob())
                const file = new File(
                  [blob],
                  `componente_${componente.nombre}_${j}.jpg`,
                  { type: 'image/jpeg' }
                )
                const urlPublica = await this.uploadFotoComponente(
                  file,
                  inspeccionId,
                  detalleCreado.id,
                  j
                )
                urlsSubidas.push(urlPublica)
              } catch (error) {
                console.error(
                  `Error subiendo foto ${j} de ${componente.nombre}:`,
                  error
                )
                // Mantener Data URL como fallback
                urlsSubidas.push(fotoUrl)
              }
            } else {
              // Ya es una URL pública
              urlsSubidas.push(fotoUrl)
            }
          }

          // Actualizar el detalle con las URLs de las fotos
          if (urlsSubidas.length > 0) {
            await this.updateInspeccionDetalle(detalleCreado.id, {
              fotos_urls: urlsSubidas
            })
          }
        }
      }
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
    inspeccionesEnMantencion: number
    inspeccionesCompletas: number
    cilindrosActivos: number
  }> {
    console.log('Obteniendo estadísticas de Supabase...')

    // Obtener todas las inspecciones con sus datos
    const { data: allInspecciones, error: inspeccionesError } = await supabase
      .from('inspecciones')
      .select('*, cilindro:cilindros(id_codigo, tipo, fabricante)')
      .order('created_at', { ascending: false })

    // Obtener conteo de cilindros
    const cilindrosResult = await supabase.from('cilindros').select('*', { count: 'exact', head: true })

    if (inspeccionesError) {
      console.error('Error obteniendo inspecciones:', inspeccionesError)
    }

    const inspecciones = allInspecciones || []

    // Filtrar por etapas completadas
    const enInspeccion = inspecciones.filter((insp: any) => {
      const etapas = insp.etapas_completadas || []
      return insp.estado_inspeccion === 'borrador' &&
             (!etapas.includes('peritaje') || (etapas.includes('peritaje') && !etapas.includes('mantencion')))
    })

    const enMantencion = inspecciones.filter((insp: any) => {
      const etapas = insp.etapas_completadas || []
      return insp.estado_inspeccion === 'completa' &&
             etapas.includes('peritaje') &&
             !etapas.includes('mantencion')
    })

    const finalizados = inspecciones.filter((insp: any) => {
      const etapas = insp.etapas_completadas || []
      return insp.estado_inspeccion === 'completa' &&
             etapas.includes('peritaje') &&
             etapas.includes('mantencion')
    })

    console.log('Conteos por etapa:', {
      total: inspecciones.length,
      enInspeccion: enInspeccion.length,
      enMantencion: enMantencion.length,
      finalizados: finalizados.length,
      cilindros: cilindrosResult.count
    })

    return {
      totalInspecciones: inspecciones.length,
      inspeccionesPendientes: enInspeccion.length,
      inspeccionesEnMantencion: enMantencion.length,
      inspeccionesCompletas: finalizados.length,
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
  },

  /**
   * Obtener todos los mantenimientos activos para el Monitoreo
   * Incluye inspecciones en estado 'borrador' o 'completa'
   * Calcula progreso basado en etapas_completadas
   */
  async getMantenimientosActivos(): Promise<any[]> {
    const { data, error } = await supabase
      .from('inspecciones')
      .select(`
        *,
        cilindro:cilindros(id_codigo, tipo, fabricante, diametro_camisa, diametro_vastago, carrera)
      `)
      .in('estado_inspeccion', ['borrador', 'completa'])
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error en getMantenimientosActivos:', error)
      throw error
    }

    // Mapear resultados y calcular progreso
    return (data || []).map((inspeccion: any) => {
      const etapas = inspeccion.etapas_completadas || []
      let progreso = 0
      let estado: 'en_proceso' | 'listo_pruebas' | 'listo_mantencion' | 'completado' = 'en_proceso'
      let etapa_actual: 'recepcion' | 'pruebas_presion' | 'peritaje' | 'mantencion' | 'completado' = 'recepcion'

      // Calcular progreso basado en etapas completadas
      if (etapas.includes('recepcion')) {
        progreso = 10
        etapa_actual = 'pruebas_presion'
      }
      if (etapas.includes('pruebas_presion')) {
        progreso = 30
        etapa_actual = 'peritaje'
        estado = 'listo_pruebas'
      }
      if (etapas.includes('peritaje')) {
        progreso = 50
        etapa_actual = 'mantencion'

        // Si tiene peritaje pero NO mantención, está listo para mantención
        if (!etapas.includes('mantencion')) {
          estado = 'listo_mantencion'
        }
      }
      if (etapas.includes('mantencion')) {
        progreso = 100
        etapa_actual = 'completado'
        estado = 'completado'
      }

      // Si está completa en BD pero sin mantencion, mantener listo para mantencion
      if (inspeccion.estado_inspeccion === 'completa' && !etapas.includes('mantencion')) {
        estado = 'listo_mantencion'
        progreso = 50
      }

      return {
        id: inspeccion.id,
        inspeccion_id: inspeccion.id,
        estado,
        progreso,
        etapa_actual,
        cilindroId: inspeccion.cilindro?.id_codigo || inspeccion.cilindro_id,
        cliente: inspeccion.nombre_cliente || 'Cliente no especificado',
        prioridad: 'Normal', // Podría venir de notas_recepcion
        cilindro: inspeccion.cilindro,
        created_at: inspeccion.created_at
      }
    })
  },

  /**
   * Obtiene los datos para mostrar en el resumen semanal
   */
  async getResumenSemanal(): Promise<{ cilindrosListos: number; promedioDias: number; enProceso: number }> {
    try {
      // Obtener inspecciones completadas de la última semana
      const semanaAtras = new Date()
      semanaAtras.setDate(semanaAtras.getDate() - 7)

      const { data: completadas, error: errorCompletadas } = await supabase
        .from('inspecciones')
        .select('created_at, estado_inspeccion')
        .eq('estado_inspeccion', 'completa')
        .gte('created_at', semanaAtras.toISOString())

      if (errorCompletadas) throw errorCompletadas

      // Calcular cilindros listos (completados)
      const cilindrosListos = completadas?.length || 0

      // Calcular promedio de días (simplificado - podría mejorarse con fecha_real_finalizacion)
      const promedioDias = cilindrosListos > 0 ? 4.2 : 0 // Usar 4.2 como valor por defecto

      // Obtener mantenimientos en proceso
      const { data: enProcesoData, error: errorProceso } = await supabase
        .from('inspecciones')
        .select('id')
        .eq('estado_inspeccion', 'borrador')

      if (errorProceso) throw errorProceso

      const enProceso = enProcesoData?.length || 0

      return {
        cilindrosListos,
        promedioDias: Math.round(promedioDias * 10) / 10,
        enProceso
      }
    } catch (error) {
      console.error('Error en getResumenSemanal:', error)
      // Retornar valores por defecto en caso de error
      return {
        cilindrosListos: 0,
        promedioDias: 0,
        enProceso: 0
      }
    }
  },

  /**
   * Obtiene inspecciones pendientes de mantención (al 50%)
   * Filtro: estado='completa' + tiene 'peritaje' en etapas + NO tiene 'mantencion'
   */
  async getMantenimientosPendientes(): Promise<Inspeccion[]> {
    const { data, error } = await supabase
      .from('inspecciones')
      .select(`
        *,
        cilindro:cilindros(id_codigo, tipo, fabricante, diametro_camisa, diametro_vastago, carrera),
        usuario:usuarios(id, nombre, email)
      `)
      .eq('estado_inspeccion', 'completa')
      .order('created_at', { ascending: false })

    if (error) throw error

    // Filtrar manualmente las que tienen peritaje pero no mantencion
    const filtradas = (data || []).filter((insp: any) => {
      const etapas = insp.etapas_completadas || []
      return etapas.includes('peritaje') && !etapas.includes('mantencion')
    })

    return filtradas
  },

  /**
   * Guarda registro de mantención con componentes
   * NOTA: Usa notas_recepcion con estructura anidada para no interferir con datos existentes
   */
  async saveMantencion(
    inspeccionId: string,
    registro: {
      componentes: any[]
      verificaciones?: { limpieza: boolean; lubricacion: boolean; pruebaPresion: boolean }
      observaciones: string
    }
  ): Promise<void> {
    // Primero verificar si ya existen datos en notas_recepcion
    const { data: existingData } = await supabase
      .from('inspecciones')
      .select('notas_recepcion')
      .eq('id', inspeccionId)
      .single()

    let datosCombinados: any = {}

    // Si ya hay datos, mantenerlos
    if (existingData?.notas_recepcion) {
      try {
        datosCombinados = JSON.parse(existingData.notas_recepcion)
      } catch (e) {
        console.warn('No se pudo parsear notas_recepcion existente:', e)
      }
    }

    // Agregar o actualizar el registro de mantención en una sección separada
    datosCombinados._mantencion = registro

    // Guardar datos combinados
    const { error } = await supabase
      .from('inspecciones')
      .update({
        notas_recepcion: JSON.stringify(datosCombinados)
      })
      .eq('id', inspeccionId)

    if (error) throw error
  },

  /**
   * Obtiene datos de mantención de una inspección
   */
  async getMantencion(
    inspeccionId: string
  ): Promise<{
    componentes: any[]
    verificaciones: { limpieza: boolean; lubricacion: boolean; pruebaPresion: boolean }
    observaciones?: string
  } | null> {
    const { data, error } = await supabase
      .from('inspecciones')
      .select('notas_recepcion')
      .eq('id', inspeccionId)
      .single()

    if (error) throw error

    if (!data?.notas_recepcion) return null

    try {
      const parsed = JSON.parse(data.notas_recepcion)
      // Retornar el registro de mantención si existe (usando _mantencion para no interferir)
      return parsed._mantencion || null
    } catch (e) {
      console.warn('No se pudo parsear notas_recepcion:', e)
      return null
    }
  },

  /**
   * Guarda pruebas de mantención y marca como completa al 100%
   * NOTA: Usa notas_recepcion con estructura anidada
   */
  async savePruebasMantencion(
    inspeccionId: string,
    pruebas: {
      presion: number
      tiempo: number
      fuga_interna: boolean
      fuga_externa: boolean
      fallas: string
      observaciones: string
      fotos: string[]
      fotos_fuga_interna?: string[]
      fotos_fuga_externa?: string[]
    }
  ): Promise<void> {
    // Primero verificar si ya existen datos en notas_recepcion
    const { data: existingData } = await supabase
      .from('inspecciones')
      .select('notas_recepcion')
      .eq('id', inspeccionId)
      .single()

    let datosCombinados: any = {}

    // Si ya hay datos, mantenerlos
    if (existingData?.notas_recepcion) {
      try {
        datosCombinados = JSON.parse(existingData.notas_recepcion)
      } catch (e) {
        console.warn('No se pudo parsear notas_recepcion existente:', e)
      }
    }

    // Agregar las pruebas de mantención en una sección separada
    datosCombinados._pruebas_mantencion = pruebas

    // Guardar datos combinados
    const { error } = await supabase
      .from('inspecciones')
      .update({
        notas_recepcion: JSON.stringify(datosCombinados),
        etapas_completadas: ['recepcion', 'peritaje', 'mantencion']
      })
      .eq('id', inspeccionId)

    if (error) throw error
  }
}

export default supabaseService
