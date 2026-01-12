-- =============================================
-- Vignola - Corregir políticas RLS para permitir acceso
-- =============================================
-- Este script deshabilita RLS o crea políticas para permitir acceso desde la app

-- OPCIÓN 1: Deshabilitar RLS temporalmente (para desarrollo)
-- Descomenta las siguientes líneas si quieres deshabilitar RLS:

ALTER TABLE cilindros DISABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios DISABLE ROW LEVEL SECURITY;
ALTER TABLE clientes DISABLE ROW LEVEL SECURITY;

-- inspecciones y detalles mantienen RLS pero con políticas permisivas

-- OPCIÓN 2: Mantener RLS habilitado pero crear políticas permisivas
-- Comenta las líneas anteriores y descomenta las siguientes:

/*
-- Políticas para CILINDROS
CREATE POLICY "Permitir leer todos los cilindros"
  ON cilindros FOR SELECT
  TO anon, authenticated
  USING (true);

-- Políticas para USUARIOS
CREATE POLICY "Permitir leer todos los usuarios"
  ON usuarios FOR SELECT
  TO anon, authenticated
  USING (true);

-- Políticas para CLIENTES
CREATE POLICY "Permitir leer todos los clientes"
  ON clientes FOR SELECT
  TO anon, authenticated
  USING (true);

-- Asegurar que las políticas de inspecciones permitan acceso anónimo
DROP POLICY IF EXISTS "Mecánicos pueden ver todas las inspecciones" ON inspecciones;

CREATE POLICY "Permitir leer todas las inspecciones"
  ON inspecciones FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Permitir crear inspecciones"
  ON inspecciones FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Permitir actualizar inspecciones"
  ON inspecciones FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Políticas para DETALLES de inspección
CREATE POLICY "Permitir leer todos los detalles"
  ON inspeccion_detalles FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Permitir crear detalles"
  ON inspeccion_detalles FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Permitir actualizar detalles"
  ON inspeccion_detalles FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir eliminar detalles"
  ON inspeccion_detalles FOR DELETE
  TO anon, authenticated
  USING (true);
*/

-- =============================================
-- Verificar políticas actuales
-- =============================================

-- Ver qué tablas tienen RLS habilitado
SELECT
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('usuarios', 'clientes', 'cilindros', 'inspecciones', 'inspeccion_detalles')
ORDER BY tablename;

-- Ver políticas existentes
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =============================================
-- FIN DEL SCRIPT
-- =============================================
