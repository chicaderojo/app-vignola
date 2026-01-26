-- =============================================
-- Migración: Agregar políticas RLS para inspeccion_detalles
-- Fecha: 2025-01-26
-- Descripción: Permite a los usuarios autenticados crear,
--              leer y eliminar detalles de inspecciones
-- =============================================

-- Política para leer detalles de inspección
DROP POLICY IF EXISTS "Mecánicos pueden ver detalles de inspección" ON inspeccion_detalles;

CREATE POLICY "Mecánicos pueden ver detalles de inspección"
  ON inspeccion_detalles FOR SELECT
  TO authenticated
  USING (true);

-- Política para insertar detalles de inspección
DROP POLICY IF EXISTS "Mecánicos pueden crear detalles de inspección" ON inspeccion_detalles;

CREATE POLICY "Mecánicos pueden crear detalles de inspección"
  ON inspeccion_detalles FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política para actualizar detalles de inspección
DROP POLICY IF EXISTS "Mecánicos pueden actualizar detalles de inspección" ON inspeccion_detalles;

CREATE POLICY "Mecánicos pueden actualizar detalles de inspección"
  ON inspeccion_detalles FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Política para eliminar detalles de inspección
DROP POLICY IF EXISTS "Mecánicos pueden eliminar detalles de inspección" ON inspeccion_detalles;

CREATE POLICY "Mecánicos pueden eliminar detalles de inspección"
  ON inspeccion_detalles FOR DELETE
  TO authenticated
  USING (true);

-- =============================================
-- Notas:
-- - Esta migración asume que los usuarios están autenticados
-- - En producción, podrías querer políticas más restrictivas
--   que solo permitan acceder a detalles de inspecciones propias
-- =============================================
