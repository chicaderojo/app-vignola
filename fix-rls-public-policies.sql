-- =============================================
-- Vignola - Políticas RLS para acceso público (desarrollo)
-- =============================================
-- Este script crea políticas que permiten acceso desde la app usando anon key

-- 1. Eliminar políticas existentes que restringen acceso
DROP POLICY IF EXISTS "Usuarios pueden ver su propio perfil" ON usuarios;
DROP POLICY IF EXISTS "Mecánicos pueden ver todas las inspecciones" ON inspecciones;
DROP POLICY IF EXISTS "Mecánicos pueden crear inspecciones" ON inspecciones;

-- 2. Crear políticas públicas para CILINDROS
CREATE POLICY "Permitir leer todos los cilindros"
  ON cilindros FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Permitir crear cilindros"
  ON cilindros FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Permitir actualizar cilindros"
  ON cilindros FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 3. Crear políticas públicas para USUARIOS
CREATE POLICY "Permitir leer todos los usuarios"
  ON usuarios FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Permitir crear usuarios"
  ON usuarios FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Permitir actualizar usuarios"
  ON usuarios FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 4. Crear políticas públicas para CLIENTES
CREATE POLICY "Permitir leer todos los clientes"
  ON clientes FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Permitir crear clientes"
  ON clientes FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Permitir actualizar clientes"
  ON clientes FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 5. Crear políticas públicas para INSPECCIONES
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

CREATE POLICY "Permitir eliminar inspecciones"
  ON inspecciones FOR DELETE
  TO anon, authenticated
  USING (true);

-- 6. Crear políticas públicas para DETALLES de inspección
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

-- =============================================
-- Verificación
-- =============================================

-- Ver políticas creadas
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- =============================================
-- FIN DEL SCRIPT
-- =============================================
