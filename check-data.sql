-- =============================================
-- Verificar datos existentes
-- =============================================

-- 1. Verificar inspecciones
SELECT
  id,
  cilindro_id,
  estado_inspeccion,
  created_at
FROM inspecciones
ORDER BY created_at DESC;

-- 2. Verificar si los cilindro_id de las inspecciones existen
SELECT
  i.id as inspeccion_id,
  i.cilindro_id,
  c.id_codigo as cilindro_existe
FROM inspecciones i
LEFT JOIN cilindros c ON i.cilindro_id = c.id_codigo;

-- 3. Contar inspecciones por estado
SELECT
  estado_inspeccion,
  COUNT(*) as total
FROM inspecciones
GROUP BY estado_inspeccion;

-- 4. Ver usuarios
SELECT id, nombre, email FROM usuarios;
