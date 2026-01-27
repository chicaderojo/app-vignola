-- =============================================
-- Migración: Agregar campos de etapas y fotos adicionales
-- Fecha: 27 de enero de 2026
-- Descripción: Agrega soporte para seguimiento de etapas y fotos de componentes/pruebas
-- =============================================

-- 1. AGREGAR CAMPO etapas_completadas A TABLA inspecciones
ALTER TABLE inspecciones
ADD COLUMN IF NOT EXISTS etapas_completadas TEXT[] DEFAULT '{recepcion}';

-- Comentario para documentación
COMMENT ON COLUMN inspecciones.etapas_completadas IS
'Array de etapas completadas: ["recepcion"], ["recepcion", "peritaje"], ["recepcion", "peritaje", "pruebas"], o ["recepcion", "peritaje", "pruebas", "finalizado"]';

-- 2. AGREGAR CAMPO fotos_urls A TABLA inspeccion_detalles
ALTER TABLE inspeccion_detalles
ADD COLUMN IF NOT EXISTS fotos_urls TEXT[] DEFAULT '{}';

COMMENT ON COLUMN inspeccion_detalles.fotos_urls IS
'Array de URLs de fotos adicionales del componente (evidencia de daño, reparación, etc.)';

-- 3. AGREGAR CAMPO fotos_pruebas_url A TABLA inspecciones
ALTER TABLE inspecciones
ADD COLUMN IF NOT EXISTS fotos_pruebas_url TEXT[] DEFAULT '{}';

COMMENT ON COLUMN inspecciones.fotos_pruebas_url IS
'Array de URLs de fotos de pruebas hidráulicas (evidencia de presión, fugas, etc.)';

-- =============================================
-- MIGRACIÓN DE DATOS EXISTENTES (BACKWARD COMPATIBLE)
-- =============================================

-- Para inspecciones existentes sin etapas_completadas,
-- asumimos que están al menos en recepción si tienen fotos
UPDATE inspecciones
SET etapas_completadas = CASE
  WHEN foto_armado_url IS NOT NULL AND foto_despiece_url IS NOT NULL
  THEN ARRAY['recepcion']::TEXT[]
  ELSE ARRAY[]::TEXT[]
END
WHERE etapas_completadas IS NULL OR etapas_completadas = '{}';

-- Inspecciones con detalles asumen peritaje completado
UPDATE inspecciones i
SET etapas_completadas = array_append(
  COALESCE(i.etapas_completadas, ARRAY[]::TEXT[]),
  'peritaje'
)
WHERE EXISTS (
  SELECT 1 FROM inspeccion_detalles d
  WHERE d.inspeccion_id = i.id
)
AND NOT ('peritaje' = ANY(i.etapas_completadas));

-- Inspecciones completas asumen todas las etapas
UPDATE inspecciones
SET etapas_completadas = ARRAY['recepcion', 'peritaje', 'pruebas', 'finalizado']::TEXT[]
WHERE estado_inspeccion IN ('completa', 'sincronizada')
AND NOT ('finalizado' = ANY(etapas_completadas));

-- =============================================
-- ÍNDICES PARA OPTIMIZAR CONSULTAS
-- =============================================

-- Índice para búsquedas por etapas (usando GIN para arrays)
CREATE INDEX IF NOT EXISTS idx_inspecciones_etapas
ON inspecciones USING GIN (etapas_completadas);

-- Índice para búsquedas por fotos de componentes
CREATE INDEX IF NOT EXISTS idx_detalles_fotos
ON inspeccion_detalles USING GIN (fotos_urls);

-- Índice para búsquedas por fotos de pruebas
CREATE INDEX IF NOT EXISTS idx_inspecciones_fotos_pruebas
ON inspecciones USING GIN (fotos_pruebas_url);

-- =============================================
-- POLÍTICAS RLS (Row Level Security)
-- =============================================

-- Actualizar políticas para incluir nuevos campos
CREATE POLICY IF NOT EXISTS "Mecánicos pueden actualizar etapas"
  ON inspecciones FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Mecánicos pueden actualizar fotos de componentes"
  ON inspeccion_detalles FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =============================================
-- VERIFICACIÓN
-- =============================================

-- Mostrar resumen de cambios
DO $$
DECLARE
  total_inspecciones INT;
  inspecciones_con_etapas INT;
  total_detalles INT;
  detalles_con_fotos INT;
BEGIN
  SELECT COUNT(*) INTO total_inspecciones FROM inspecciones;
  SELECT COUNT(*) INTO inspecciones_con_etapas FROM inspecciones WHERE etapas_completadas IS NOT NULL AND array_length(etapas_completadas, 1) > 0;
  SELECT COUNT(*) INTO total_detalles FROM inspeccion_detalles;
  SELECT COUNT(*) INTO detalles_con_fotos FROM inspeccion_detalles WHERE fotos_urls IS NOT NULL AND array_length(fotos_urls, 1) > 0;

  RAISE NOTICE '============================================';
  RAISE NOTICE 'Migración completada exitosamente';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Total inspecciones: %', total_inspecciones;
  RAISE NOTICE 'Inspecciones con etapas: %', inspecciones_con_etapas;
  RAISE NOTICE 'Total detalles: %', total_detalles;
  RAISE NOTICE 'Detalles con fotos: %', detalles_con_fotos;
  RAISE NOTICE '============================================';
END $$;
