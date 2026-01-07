-- =============================================
-- Vignola - Esquema de Base de Datos
-- PostgreSQL para Supabase
-- =============================================

-- Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. TABLA DE USUARIOS (Auth Custom)
-- =============================================
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  rol TEXT NOT NULL DEFAULT 'mecanico' CHECK (rol IN ('mecanico', 'jefe_maestranza')),
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para usuarios
CREATE INDEX idx_usuarios_email ON usuarios(email);
CREATE INDEX idx_usuarios_rol ON usuarios(rol);

-- =============================================
-- 2. TABLA DE CLIENTES
-- =============================================
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  planta TEXT,
  logo_url TEXT,
  sap_codigo TEXT,
  direccion TEXT,
  telefono TEXT,
  email_contacto TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para clientes
CREATE INDEX idx_clientes_nombre ON clientes(nombre);
CREATE INDEX idx_clientes_activo ON clientes(activo);

-- =============================================
-- 3. TABLA DE CILINDROS
-- =============================================
CREATE TABLE cilindros (
  id_codigo TEXT PRIMARY KEY, -- ej: CE05CIL0513
  tipo TEXT NOT NULL CHECK (tipo IN ('Buzo', 'Cuña Flap', 'Oleohidráulico')),
  fabricante TEXT, -- Rexroth, Parker, Hydoring
  diametro_camisa TEXT, -- ej: Ø63
  diametro_vastago TEXT, -- ej: Ø36
  carrera TEXT, -- ej: 100mm
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  sap_cliente TEXT,
  serie TEXT,
  modelo TEXT,
  notas TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para cilindros
CREATE INDEX idx_cilindros_tipo ON cilindros(tipo);
CREATE INDEX idx_cilindros_cliente ON cilindros(cliente_id);
CREATE INDEX idx_cilindros_fabricante ON cilindros(fabricante);

-- =============================================
-- 4. TABLA DE INSPECCIONES
-- =============================================
CREATE TABLE inspecciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cilindro_id TEXT NOT NULL REFERENCES cilindros(id_codigo) ON DELETE CASCADE,
  usuario_id UUID NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
  sap_cliente TEXT NOT NULL,
  foto_armado_url TEXT NOT NULL,
  foto_despiece_url TEXT NOT NULL,
  presion_prueba INTEGER NOT NULL, -- ej: 180 (bar)
  fuga_interna BOOLEAN DEFAULT false,
  fuga_externa BOOLEAN DEFAULT false,
  ciclo_completo BOOLEAN DEFAULT false,
  notas_recepcion TEXT,
  notas_pruebas TEXT,
  estado_inspeccion TEXT DEFAULT 'borrador' CHECK (estado_inspeccion IN ('borrador', 'completa', 'sincronizada')),
  pdf_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para inspecciones
CREATE INDEX idx_inspecciones_cilindro ON inspecciones(cilindro_id);
CREATE INDEX idx_inspecciones_usuario ON inspecciones(usuario_id);
CREATE INDEX idx_inspecciones_estado ON inspecciones(estado_inspeccion);
CREATE INDEX idx_inspecciones_fecha ON inspecciones(created_at DESC);

-- =============================================
-- 5. TABLA DE DETALLES DE INSPECCIÓN
-- =============================================
CREATE TABLE inspeccion_detalles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inspeccion_id UUID NOT NULL REFERENCES inspecciones(id) ON DELETE CASCADE,
  componente TEXT NOT NULL,
  estado TEXT NOT NULL CHECK (estado IN ('Bueno', 'Cambio', 'Mantención')),
  detalle_tecnico TEXT, -- ej: Rayas, piquetes, desgaste
  accion_propuesta TEXT, -- ej: Fabricar, Bruñir, Pulir
  observaciones TEXT,
  es_base BOOLEAN DEFAULT false, -- Si es componente pre-cargado o manual
  orden INTEGER DEFAULT 0, -- Orden en el reporte
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para detalles
CREATE INDEX idx_detalles_inspeccion ON inspeccion_detalles(inspeccion_id);
CREATE INDEX idx_detalles_componente ON inspeccion_detalles(componente);
CREATE INDEX idx_detalles_estado ON inspeccion_detalles(estado);

-- =============================================
-- 6. FUNCIONES Y TRIGGERS PARA updated_at
-- =============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para usuarios
CREATE TRIGGER update_usuarios_updated_at
  BEFORE UPDATE ON usuarios
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para clientes
CREATE TRIGGER update_clientes_updated_at
  BEFORE UPDATE ON clientes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para cilindros
CREATE TRIGGER update_cilindros_updated_at
  BEFORE UPDATE ON cilindros
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para inspecciones
CREATE TRIGGER update_inspecciones_updated_at
  BEFORE UPDATE ON inspecciones
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- 7. DATOS INICIALES (SEMILLA)
-- =============================================

-- Insertar usuario de prueba
-- Password: password123 (hash de bcrypt)
INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES
('Administrador', 'admin@vignola.cl', '$2a$10$K8ZjWZwZzZzZzZzZzZzZzOZvZzZzZzZzZzZzZzZzZzZzZz', 'jefe_maestranza'),
('Juan Méndez', 'juan@vignola.cl', '$2a$10$K8ZjWZwZzZzZzZzZzZzZzOZvZzZzZzZzZzZzZzZzZzZzZz', 'mecanico');

-- Insertar clientes de ejemplo
INSERT INTO clientes (nombre, planta, sap_codigo) VALUES
('Arauco', 'Constitución', 'ARAU001'),
('GLV', 'San Fernando', 'GLV001'),
('CMPC', 'Laja', 'CMPC001');

-- Insertar cilindros de ejemplo
INSERT INTO cilindros (id_codigo, tipo, fabricante, diametro_camisa, diametro_vastago, carrera, cliente_id, sap_cliente) VALUES
('CE05CIL0513', 'Oleohidráulico', 'Rexroth', 'Ø63', 'Ø36', '100mm',
 (SELECT id FROM clientes WHERE nombre = 'Arauco' LIMIT 1), 'SAP12345'),
('CE05CIL0514', 'Buzo', 'Parker', 'Ø80', 'Ø45', '150mm',
 (SELECT id FROM clientes WHERE nombre = 'GLV' LIMIT 1), 'SAP67890');

-- =============================================
-- 8. ROW LEVEL SECURITY (RLS) - OPCIONAL
-- =============================================

-- Habilitar RLS
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE cilindros ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspecciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspeccion_detalles ENABLE ROW LEVEL SECURITY;

-- Políticas (ajustar según necesidad)
CREATE POLICY "Usuarios pueden ver su propio perfil"
  ON usuarios FOR SELECT
  USING (auth.uid()::text = id::text);

CREATE POLICY "Mecánicos pueden ver todas las inspecciones"
  ON inspecciones FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Mecánicos pueden crear inspecciones"
  ON inspecciones FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- =============================================
-- 9. VISTAS ÚTILES
-- =============================================

-- Vista de inspecciones con detalles completos
CREATE VIEW vista_inspecciones_completas AS
SELECT
  i.id,
  i.cilindro_id,
  c.tipo AS cilindro_tipo,
  c.fabricante AS cilindro_fabricante,
  cl.nombre AS cliente_nombre,
  u.nombre AS usuario_nombre,
  i.sap_cliente,
  i.presion_prueba,
  i.fuga_interna,
  i.fuga_externa,
  i.estado_inspeccion,
  i.created_at,
  COUNT(d.id) AS total_componentes,
  COUNT(DISTINCT CASE WHEN d.estado = 'Bueno' THEN d.id END) AS componentes_buenos,
  COUNT(DISTINCT CASE WHEN d.estado = 'Cambio' THEN d.id END) AS componentes_cambio,
  COUNT(DISTINCT CASE WHEN d.estado = 'Mantención' THEN d.id END) AS componentes_mantencion
FROM inspecciones i
LEFT JOIN cilindros c ON i.cilindro_id = c.id_codigo
LEFT JOIN clientes cl ON c.cliente_id = cl.id
LEFT JOIN usuarios u ON i.usuario_id = u.id
LEFT JOIN inspeccion_detalles d ON i.id = d.inspeccion_id
GROUP BY i.id, c.tipo, c.fabricante, cl.nombre, u.nombre;

-- =============================================
-- FIN DEL SCRIPT
-- =============================================

-- Notas:
-- 1. Los passwords deben ser generados con bcrypt en el backend
-- 2. Las URLs de fotos deben ser almacenadas usando Supabase Storage
-- 3. Ajustar las políticas RLS según el nivel de seguridad requerido
-- 4. Considerar agregar un índice de búsqueda全文 (full-text search) para búsquedas avanzadas
