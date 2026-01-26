-- =============================================
-- Migración: Habilitar RLS para producción
-- Fecha: 2025-01-26
-- Descripción: Habilita Row Level Security para producción
--              Requiere: Autenticación real con Supabase Auth
-- =============================================
-- PRECONDICIONES:
-- 1. Los usuarios deben estar autenticados con Supabase Auth
-- 2. No usar modo demo con tokens falsos
-- 3. Implementar signInWithSupabase() en LoginPage

-- Habilitar RLS en todas las tablas
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cilindros ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspecciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspeccion_detalles ENABLE ROW LEVEL SECURITY;

-- Verificación
SELECT
    tablename,
    rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('usuarios', 'clientes', 'cilindros', 'inspecciones', 'inspeccion_detalles');

-- =============================================
-- Notas:
-- =============================================
-- Las políticas RLS ya están definidas en migraciones anteriores:
-- - add_rls_policies_detalles
-- - add_rls_policies_complete
--
-- No necesitas redefinir las políticas, solo habilitar RLS
--
-- Para implementar autenticación real con Supabase:
-- 1. En LoginPage.tsx, usar:
--    const { data, error } = await supabase.auth.signInWithPassword({
--      email,
--      password
--    })
--
-- 2. Obtener el usuario con:
--    const { data: { user } } = await supabase.auth.getUser()
--
-- 3. El token JWT de Supabase se maneja automáticamente
-- =============================================
