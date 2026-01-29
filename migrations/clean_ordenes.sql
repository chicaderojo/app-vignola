-- =============================================
-- Vignola - Limpieza de Órdenes
-- Script para eliminar todas las inspecciones
-- =============================================
-- Este script elimina todas las órdenes de inspección
-- (finalizadas y en progreso) para liberar espacio.
--
-- Debido a ON DELETE CASCADE, esto eliminará automáticamente:
-- - inspeccion_detalles (detalles técnicos de peritaje/mantención)
-- - Todas las referencias asociadas
--
-- NO se eliminan:
-- - clientes (se mantienen intactos)
-- - cilindros (se mantienen intactos)
-- - usuarios (se mantienen intactos)
-- - Estructura de tablas, restricciones, RLS policies
-- =============================================

-- Eliminar todas las inspecciones
DELETE FROM inspecciones;

-- Verificar eliminación (opcional)
-- Descomenta para verificar que se eliminaron correctamente
-- SELECT COUNT(*) as total_inspecciones FROM inspecciones;
-- Resultado esperado: 0

-- SELECT COUNT(*) as total_detalles FROM inspeccion_detalles;
-- Resultado esperado: 0
