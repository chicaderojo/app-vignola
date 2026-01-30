-- =============================================
-- Migración: Agregar campo requiere_fabricacion
-- =============================================
-- Esta migración agrega soporte para marcar componentes que requieren fabricación
-- Fecha: 2025-01-30
-- =============================================

-- Agregar columna requiere_fabricacion a inspeccion_detalles
ALTER TABLE inspeccion_detalles
ADD COLUMN IF NOT EXISTS requiere_fabricacion BOOLEAN DEFAULT FALSE;

-- Agregar columna orden_fabricacion_id para vincular con órdenes de fabricación (opcional)
ALTER TABLE inspeccion_detalles
ADD COLUMN IF NOT EXISTS orden_fabricacion_id UUID REFERENCES ordenes_fabricacion(id) ON DELETE SET NULL;

-- Crear índice para optimizar búsquedas de componentes que requieren fabricación
CREATE INDEX IF NOT EXISTS idx_detalles_requiere_fabricacion
ON inspeccion_detalles(requiere_fabricacion)
WHERE requiere_fabricacion = true;

-- Comentario para documentación
COMMENT ON COLUMN inspeccion_detalles.requiere_fabricacion IS 'Indica si el componente requiere fabricación';
COMMENT ON COLUMN inspeccion_detalles.orden_fabricacion_id IS 'Vínculo opcional con la orden de fabricación creada';
