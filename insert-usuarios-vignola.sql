-- =============================================
-- Vignola - Creación de Perfiles de Usuario
-- =============================================
-- Script para insertar los usuarios específicos de Vignola

-- Insertar usuario 1: respinoza@vignola.cl
INSERT INTO usuarios (id, nombre, email, password_hash, rol)
VALUES (
  'user-respinoza-vignola-cl',
  'Respinoza',
  'respinoza@vignola.cl',
  'raul123-hash-' || extract(epoch from now()),
  'mecanico'
)
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  email = EXCLUDED.email,
  rol = EXCLUDED.rol;

-- Insertar usuario 2: mruiz@vignola.cl
INSERT INTO usuarios (id, nombre, email, password_hash, rol)
VALUES (
  'user-mruiz-vignola-cl',
  'Mruiz',
  'mruiz@vignola.cl',
  'mauricio123-hash-' || extract(epoch from now()),
  'mecanico'
)
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  email = EXCLUDED.email,
  rol = EXCLUDED.rol;

-- Insertar usuario 3: mecanico@vignola.cl
INSERT INTO usuarios (id, nombre, email, password_hash, rol)
VALUES (
  'user-mecanico-vignola-cl',
  'Mecanico',
  'mecanico@vignola.cl',
  'mecanico123-hash-' || extract(epoch from now()),
  'mecanico'
)
ON CONFLICT (id) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  email = EXCLUDED.email,
  rol = EXCLUDED.rol;

-- =============================================
-- Verificación de usuarios creados
-- =============================================

SELECT
  id,
  nombre,
  email,
  rol,
  created_at
FROM usuarios
WHERE email IN (
  'respinoza@vignola.cl',
  'mruiz@vignola.cl',
  'mecanico@vignola.cl'
)
ORDER BY email;

-- =============================================
-- FIN DEL SCRIPT
-- =============================================
