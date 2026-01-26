-- =============================================
-- Migración: Deshabilitar RLS para modo desarrollo
-- Fecha: 2025-01-26
-- Descripción: Deshabilita Row Level Security temporalmente
--              mientras se implementa la autenticación real
--              con Supabase Auth
-- =============================================
-- NOTA: En producción, RLS debe estar HABILITADO
-- Esta migración es solo para desarrollo/testing

ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE clientes DISABLE ROW LEVEL SECURITY;
ALTER TABLE cilindros DISABLE ROW LEVEL SECURITY;
ALTER TABLE inspecciones DISABLE ROW LEVEL SECURITY;
ALTER TABLE inspeccion_detalles DISABLE ROW LEVEL SECURITY;

-- Verificación
SELECT
    tablename,
    rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('usuarios', 'clientes', 'cilindros', 'inspecciones', 'inspeccion_detalles');

-- =============================================
-- Notas importantes:
-- =============================================
-- 1. Cuando implementes Supabase Auth real, deberás:
--    - Ejecutar: ALTER TABLE <tabla> ENABLE ROW LEVEL SECURITY;
--    - Las políticas ya están definidas en migraciones anteriores
--
-- 2. Para habilitar RLS en producción, ejecuta:
--    - migrations/enable_rls_production.sql
--
-- 3. Modo demo actual usa tokens falsos que Supabase no reconoce
-- =============================================
