-- =============================================
-- Migración: Agregar políticas RLS completas
-- Fecha: 2025-01-26
-- Descripción: Permite a los usuarios autenticados crear,
--              leer y actualizar en todas las tablas necesarias
-- =============================================

-- =============================================
-- POLÍTICAS PARA CILINDROS
-- =============================================

-- Política para leer cilindros
DROP POLICY IF EXISTS "Mecánicos pueden ver cilindros" ON cilindros;

CREATE POLICY "Mecánicos pueden ver cilindros"
  ON cilindros FOR SELECT
  TO authenticated
  USING (true);

-- Política para crear cilindros
DROP POLICY IF EXISTS "Mecánicos pueden crear cilindros" ON cilindros;

CREATE POLICY "Mecánicos pueden crear cilindros"
  ON cilindros FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política para actualizar cilindros
DROP POLICY IF EXISTS "Mecánicos pueden actualizar cilindros" ON cilindros;

CREATE POLICY "Mecánicos pueden actualizar cilindros"
  ON cilindros FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =============================================
-- POLÍTICAS PARA USUARIOS
-- =============================================

-- Política para leer usuarios
DROP POLICY IF EXISTS "Usuarios pueden ver perfiles" ON usuarios;

CREATE POLICY "Usuarios pueden ver perfiles"
  ON usuarios FOR SELECT
  TO authenticated
  USING (true);

-- Política para crear usuarios (para registro de nuevos usuarios)
DROP POLICY IF EXISTS "Usuarios pueden crear su perfil" ON usuarios;

CREATE POLICY "Usuarios pueden crear su perfil"
  ON usuarios FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política para actualizar usuarios (solo su propio perfil)
DROP POLICY IF EXISTS "Usuarios pueden actualizar su perfil" ON usuarios;

CREATE POLICY "Usuarios pueden actualizar su perfil"
  ON usuarios FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id::text)
  WITH CHECK (auth.uid()::text = id::text);

-- =============================================
-- POLÍTICAS PARA INSPECCIONES (complementar las existentes)
-- =============================================

-- Política para actualizar inspecciones
DROP POLICY IF EXISTS "Mecánicos pueden actualizar inspecciones" ON inspecciones;

CREATE POLICY "Mecánicos pueden actualizar inspecciones"
  ON inspecciones FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =============================================
-- POLÍTICAS PARA CLIENTES
-- =============================================

-- Política para leer clientes
DROP POLICY IF EXISTS "Mecánicos pueden ver clientes" ON clientes;

CREATE POLICY "Mecánicos pueden ver clientes"
  ON clientes FOR SELECT
  TO authenticated
  USING (true);

-- Política para crear clientes
DROP POLICY IF EXISTS "Mecánicos pueden crear clientes" ON clientes;

CREATE POLICY "Mecánicos pueden crear clientes"
  ON clientes FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Política para actualizar clientes
DROP POLICY IF EXISTS "Mecánicos pueden actualizar clientes" ON clientes;

CREATE POLICY "Mecánicos pueden actualizar clientes"
  ON clientes FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- =============================================
-- Notas:
-- - Estas políticas son permisivas para facilitar el desarrollo
-- - En producción, considera restringir el acceso a solo los registros
--   que el usuario tiene permiso para modificar
-- - Las políticas de usuarios son más estrictas para la actualización
-- =============================================
