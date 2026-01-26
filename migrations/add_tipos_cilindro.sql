-- =============================================
-- Migración: Agregar nuevos tipos de cilindro
-- Fecha: 2025-01-26
-- Descripción: Actualiza la restricción CHECK para permitir
--              nuevos tipos de cilindros en la tabla cilindros
-- =============================================

-- Paso 1: Eliminar la restricción CHECK existente
ALTER TABLE cilindros
DROP CONSTRAINT IF EXISTS cilindros_tipo_check;

-- Paso 2: Agregar la nueva restricción CHECK con los valores actualizados
ALTER TABLE cilindros
ADD CONSTRAINT cilindros_tipo_check
CHECK (tipo IN ('Buzo', 'Cuña Flap', 'Oleohidráulico', 'Cilindro Hidráulico', 'Cilindro Neumático', 'Vástago', 'Camisa', 'Bomba'));

-- Paso 3: Verificar que la restricción se agregó correctamente
SELECT
    conname AS constraint_name,
    pg_get_constraintdef(c.oid) AS constraint_definition
FROM pg_constraint c
JOIN pg_namespace n ON n.oid = c.connamespace
JOIN pg_class cl ON cl.oid = c.conrelid
WHERE conrelid = 'cilindros'::regclass
  AND contype = 'c'
  AND conname = 'cilindros_tipo_check';

-- =============================================
-- Notas:
-- - Esta migración es segura de ejecutar en producción
-- - No afecta a los datos existentes
-- - Solo expande los valores permitidos en el campo tipo
-- =============================================
