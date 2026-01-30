/**
 * Script para limpiar todas las inspecciones de la base de datos
 *
 * Uso:
 *   node scripts/limpiar-db.js
 *
 * IMPORTANTE: Este script eliminará TODAS las inspecciones y datos relacionados.
 * No se puede deshacer.
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Cargar variables de entorno
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const SUPABASE_URL = process.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Error: No se encontraron las credenciales de Supabase')
  console.error('Verifica que VITE_SUPABASE_URL y VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY estén en tu archivo .env')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

async function limpiarBaseDeDatos() {
  console.log('🔧 Iniciando limpieza de la base de datos...\n')

  try {
    // 1. Obtener todas las inspecciones
    console.log('📊 Obteniendo lista de inspecciones...')
    const { data: inspecciones, error: errorInspecciones } = await supabase
      .from('inspecciones')
      .select('id, cilindro_id, created_at')

    if (errorInspecciones) throw errorInspecciones

    if (!inspecciones || inspecciones.length === 0) {
      console.log('✅ No hay inspecciones para eliminar. La base de datos está limpia.\n')
      return
    }

    console.log(`   Found ${inspecciones.length} inspecciones\n`)

    // Mostrar resumen
    console.log('📋 Resumen de inspecciones a eliminar:')
    inspecciones.slice(0, 5).forEach(insp => {
      const fecha = new Date(insp.created_at).toLocaleDateString('es-CL')
      console.log(`   - ${insp.id.slice(0, 8)}... (${fecha})`)
    })
    if (inspecciones.length > 5) {
      console.log(`   ... y ${inspecciones.length - 5} más`)
    }
    console.log('')

    // Recopilar IDs
    const inspeccionIds = inspecciones.map(i => i.id)
    const cilindroIds = [...new Set(inspecciones.map(i => i.cilindro_id).filter(Boolean))]

    // 2. Eliminar detalles de inspección
    console.log('🗑️  Eliminando detalles de inspección...')
    const { error: errorDetalles } = await supabase
      .from('inspeccion_detalles')
      .delete()
      .in('inspeccion_id', inspeccionIds)

    if (errorDetalles) {
      console.warn('   ⚠️  Advertencia:', errorDetalles.message)
    } else {
      console.log('   ✅ Detalles eliminados')
    }

    // 3. Eliminar inspecciones
    console.log('🗑️  Eliminando inspecciones...')
    const { error: errorDelete } = await supabase
      .from('inspecciones')
      .delete()
      .in('id', inspeccionIds)

    if (errorDelete) throw errorDelete
    console.log(`   ✅ ${inspecciones.length} inspecciones eliminadas`)

    // 4. Eliminar cilindros huérfanos
    if (cilindroIds.length > 0) {
      console.log('🗑️  Eliminando cilindros asociados...')
      const { error: errorCilindros } = await supabase
        .from('cilindros')
        .delete()
        .in('id', cilindroIds)

      if (errorCilindros) {
        console.warn('   ⚠️  Advertencia:', errorCilindros.message)
      } else {
        console.log(`   ✅ ${cilindroIds.length} cilindros eliminados`)
      }
    }

    console.log('\n✨ Limpieza completada exitosamente!')
    console.log(`\n📊 Resumen:`)
    console.log(`   - Inspecciones eliminadas: ${inspecciones.length}`)
    console.log(`   - Cilindros eliminados: ${cilindroIds.length}`)

  } catch (error) {
    console.error('\n❌ Error durante la limpieza:', error.message)
    console.error(error)
    process.exit(1)
  }
}

// Ejecutar
console.log('╔════════════════════════════════════════════════════════════╗')
console.log('║       LIMPIEZA DE BASE DE DATOS - APP VIGNOLA              ║')
console.log('╚════════════════════════════════════════════════════════════╝\n')

limpiarBaseDeDatos()
  .then(() => {
    console.log('\n✅ Proceso finalizado\n')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Error fatal:', error)
    process.exit(1)
  })
