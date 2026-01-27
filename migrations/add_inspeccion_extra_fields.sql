-- Agregar campos adicionales a la tabla inspecciones
-- Estos campos se capturan en el formulario de Recepción

ALTER TABLE inspecciones
ADD COLUMN IF NOT EXISTS nombre_cliente TEXT,
ADD COLUMN IF NOT EXISTS contacto_cliente TEXT,
ADD COLUMN IF NOT EXISTS planta TEXT;

-- Comentarios para documentación
COMMENT ON COLUMN inspecciones.nombre_cliente IS 'Nombre del cliente ingresado manualmente en recepción';
COMMENT ON COLUMN inspecciones.contacto_cliente IS 'Nombre de contacto del cliente';
COMMENT ON COLUMN inspecciones.planta IS 'Planta o ubicación del cliente';
