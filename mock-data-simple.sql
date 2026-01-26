-- =============================================
-- Vignola - Datos de Prueba (Mock Data)
-- Script para poblar la base de datos con datos realistas
-- VERSIÓN SIN ON CONFLICT
-- =============================================

-- =============================================
-- 1. USUARIOS DE PRUEBA
-- =============================================
-- Password para todos: password123 (bcrypt hash)
-- NOTA: Este INSERT usa ON CONFLICT porque la columna email tiene restricción UNIQUE
-- Si ya existen usuarios, no los creará nuevamente
INSERT INTO usuarios (nombre, email, password_hash, rol) VALUES
('Juan Pérez', 'juan@vignola.cl', '$2a$10$K8ZjWZwZzZzZzZzZzZzZzOZvZzZzZzZzZzZzZzZzZz', 'mecanico'),
('Carlos López', 'carlos@vignola.cl', '$2a$10$K8ZjWZwZzZzZzZzZzZzZzOZvZzZzZzZzZzZzZzZzZzZz', 'mecanico'),
('María González', 'maria@vignola.cl', '$2a$10$K8ZjWZwZzZzZzZzZzZzZzOZvZzZzZzZzZzZzZzZzZz', 'jefe_maestranza'),
('Roberto Silva', 'roberto@vignola.cl', '$2a$10$K8ZjWZwZzZzZzZzZzZzOZvZzZzZzZzZzZzZzZzZz', 'mecanico')
ON CONFLICT (email) DO NOTHING;

-- =============================================
-- 2. CLIENTES REALES Y DIVERSOS
-- =============================================
INSERT INTO clientes (nombre, planta, sap_codigo, direccion, telefono, email_contacto) VALUES
('Minera Escondida', 'Antofagasta', 'MINESC001', 'Región de Antofagasta', '+56 55 1234 567', 'contacto@escondida.com'),
('Arauco', 'Constitución', 'ARAU001', 'Constitución VII Región', '+56 41 2345 678', 'compras@arauco.cl'),
('CMPC', 'Laja', 'CMPC001', 'Laja VIII Región', '+56 42 3456 789', 'proveedores@cmpc.cl'),
('Masisa', 'Los Ángeles', 'MASISA001', 'Los Ángeles VIII Región', '+56 43 4567 890', 'contacto@masisa.cl'),
('ENAP', 'Concón', 'ENAP001', 'Concón V Región', '+56 32 5678 901', 'licitaciones@enap.cl'),
('Codelco', 'Calama', 'CODELCO001', 'Calama Región de Antofagasta', '+56 55 6789 012', 'abastecimiento@codelco.cl'),
('Anglo American', 'Copiapó', 'ANGLO001', 'Copiapó III Región', '+56 52 7890 123', 'mineria@angloamerican.com'),
('BHP Billiton', 'Antofagasta', 'BHP001', 'Antofagasta II Región', '+56 55 8901 234', 'proveedores@bhp.com'),
('Collahuasi', 'Iquique', 'COLLA001', 'Iquique I Región', '+56 57 9012 345', 'compras@collahuasi.cl'),
('Pelambres', 'Salamanca', 'PELAMB001', 'Salamanca IV Región', '+56 34 1234 567', 'contacto@pelambres.com');

-- =============================================
-- 3. CILINDROS DIVERSOS (Con diferentes fabricantes y tipos)
-- =============================================
INSERT INTO cilindros (id_codigo, tipo, fabricante, diametro_camisa, diametro_vastago, carrera, cliente_id, sap_cliente, serie, modelo) VALUES
-- Minera Escondida
('HYD-1102', 'Oleohidráulico', 'Rexroth', 'Ø80', 'Ø45', '200mm', (SELECT id FROM clientes WHERE sap_codigo = 'MINESC001' LIMIT 1), 'SAPH-1102', 'CDH2', 'CG160'),
('HYD-4592', 'Buzo', 'Parker', 'Ø100', 'Ø56', '250mm', (SELECT id FROM clientes WHERE sap_codigo = 'MINESC001' LIMIT 1), 'SAPH-4592', 'HMI', '2H'),
('HYD-8821', 'Cuña Flap', 'Hydoring', 'Ø63', 'Ø36', '150mm', (SELECT id FROM clientes WHERE sap_codigo = 'MINESC001' LIMIT 1), 'SAPH-8821', 'C200', 'Standard'),
-- Arauco
('HYD-2341', 'Oleohidráulico', 'Rexroth', 'Ø90', 'Ø50', '180mm', (SELECT id FROM clientes WHERE sap_codigo = 'ARAU001' LIMIT 1), 'SAPAR-2341', 'CDH3', 'CG250'),
('HYD-6723', 'Buzo', 'Parker', 'Ø125', 'Ø70', '300mm', (SELECT id FROM clientes WHERE sap_codigo = 'ARAU001' LIMIT 1), 'SAPAR-6723', 'HMI', '3H'),
('HYD-9154', 'Cuña Flap', 'Vickers', 'Ø70', 'Ø40', '120mm', (SELECT id FROM clientes WHERE sap_codigo = 'ARAU001' LIMIT 1), 'SAPAR-9154', 'CFG', 'Custom'),
-- CMPC
('HYD-3827', 'Oleohidráulico', 'Rexroth', 'Ø100', 'Ø56', '220mm', (SELECT id FROM clientes WHERE sap_codigo = 'CMPC001' LIMIT 1), 'SAPCM-3827', 'CDH2', 'CG180'),
('HYD-5491', 'Buzo', 'Hydoring', 'Ø80', 'Ø45', '200mm', (SELECT id FROM clientes WHERE sap_codigo = 'CMPC001' LIMIT 1), 'SAPCM-5491', 'HMI', '2H'),
-- Codelco
('HYD-1284', 'Oleohidráulico', 'Parker', 'Ø110', 'Ø63', '280mm', (SELECT id FROM clientes WHERE sap_codigo = 'CODELCO001' LIMIT 1), 'SAPCD-1284', 'CDH3', 'CG300'),
('HYD-7653', 'Buzo', 'Rexroth', 'Ø90', 'Ø50', '190mm', (SELECT id FROM clientes WHERE sap_codigo = 'CODELCO001' LIMIT 1), 'SAPCD-7653', 'HMI', '2H'),
-- ENAP
('HYD-3342', 'Cuña Flap', 'Vickers', 'Ø60', 'Ø35', '140mm', (SELECT id FROM clientes WHERE sap_codigo = 'ENAP001' LIMIT 1), 'SAPEN-3342', 'CFG', 'Custom'),
('HYD-8976', 'Oleohidráulico', 'Rexroth', 'Ø75', 'Ø42', '170mm', (SELECT id FROM clientes WHERE sap_codigo = 'ENAP001' LIMIT 1), 'SAPEN-8976', 'CDH2', 'CG160'),
-- BHP Billiton
('HYD-1982', 'Oleohidráulico', 'Hydoring', 'Ø95', 'Ø53', '230mm', (SELECT id FROM clientes WHERE sap_codigo = 'BHP001' LIMIT 1), 'SAPBHP-1982', 'CDH3', 'CG220'),
('HYD-4215', 'Buzo', 'Parker', 'Ø85', 'Ø48', '195mm', (SELECT id FROM clientes WHERE sap_codigo = 'BHP001' LIMIT 1), 'SAPBHP-4215', 'HMI', '2H'),
-- Anglo American
('HYD-5678', 'Cuña Flap', 'Rexroth', 'Ø70', 'Ø40', '160mm', (SELECT id FROM clientes WHERE sap_codigo = 'ANGLO001' LIMIT 1), 'SAPANG-5678', 'C150', 'Standard'),
('HYD-2193', 'Oleohidráulico', 'Vickers', 'Ø105', 'Ø60', '260mm', (SELECT id FROM clientes WHERE sap_codigo = 'ANGLO001' LIMIT 1), 'SAPANG-2193', 'CDH4', 'CG280');

-- =============================================
-- 4. INSPECCIONES CON DIFERENTES ESTADOS
-- =============================================

-- Inspección COMPLETA (Minera Escondida)
INSERT INTO inspecciones (id, cilindro_id, usuario_id, sap_cliente, foto_armado_url, foto_despiece_url, presion_prueba, fuga_interna, fuga_externa, ciclo_completo, notas_recepcion, notas_pruebas, estado_inspeccion, created_at) VALUES
(uuid_generate_v4(), 'HYD-1102', (SELECT id FROM usuarios WHERE email = 'juan@vignola.cl' LIMIT 1), 'SAPH-1102',
'https://via.placeholder.com/800x600/4A5568/FFFFFF?text=HYD-1102-Armado',
'https://via.placeholder.com/800x600/4A5568/FFFFFF?text=HYD-1102-Despiece',
250, false, false, true,
'Cilindro telescópico con desgaste moderado en vástago',
'Prueba completada sin fugas. Ciclo completo OK.',
'sincronizada',
NOW() - INTERVAL '5 days');

-- Inspección EN PROCESO (Arauco - Peritaje)
INSERT INTO inspecciones (id, cilindro_id, usuario_id, sap_cliente, foto_armado_url, foto_despiece_url, presion_prueba, fuga_interna, fuga_externa, ciclo_completo, notas_recepcion, estado_inspeccion, created_at) VALUES
(uuid_generate_v4(), 'HYD-2341', (SELECT id FROM usuarios WHERE email = 'carlos@vignola.cl' LIMIT 1), 'SAPAR-2341',
'https://via.placeholder.com/800x600/4A5568/FFFFFF?text=HYD-2341-Armado',
'https://via.placeholder.com/800x600/4A5568/FFFFFF?text=HYD-2341-Despiece',
0, NULL, NULL, false,
'Cilindro recibido con sellos dañados. Requiere revisión completa.',
'borrador',
NOW() - INTERVAL '2 days');

-- Inspección COMPLETA (CMPC)
INSERT INTO inspecciones (id, cilindro_id, usuario_id, sap_cliente, foto_armado_url, foto_despiece_url, presion_prueba, fuga_interna, fuga_externa, ciclo_completo, notas_recepcion, notas_pruebas, estado_inspeccion, created_at) VALUES
(uuid_generate_v4(), 'HYD-3827', (SELECT id FROM usuarios WHERE email = 'juan@vignola.cl' LIMIT 1), 'SAPCM-3827',
'https://via.placeholder.com/800x600/4A5568/FFFFFF?text=HYD-3827-Armado',
'https://via.placeholder.com/800x600/4A5568/FFFFFF?text=HYD-3827-Despiece',
280, false, false, true,
'Recepción normal. Estado general bueno.',
'Prueba hidráulica completada sin anomalías.',
'sincronizada',
NOW() - INTERVAL '1 week');

-- Inspección CON FUGAS (Codelco)
INSERT INTO inspecciones (id, cilindro_id, usuario_id, sap_cliente, foto_armado_url, foto_despiece_url, presion_prueba, fuga_interna, fuga_externa, ciclo_completo, notas_recepcion, notas_pruebas, estado_inspeccion, created_at) VALUES
(uuid_generate_v4(), 'HYD-1284', (SELECT id FROM usuarios WHERE email = 'maria@vignola.cl' LIMIT 1), 'SAPCD-1284',
'https://via.placeholder.com/800x600/4A5568/FFFFFF?text=HYD-1284-Armado',
'https://via.placeholder.com/800x600/4A5568/FFFFFF?text=HYD-1284-Despiece',
220, true, false, true,
'Vástago con rayas profundas. Posible cambio necesario.',
'Fuga interna detectada en prueba a 220 bar.',
'completa',
NOW() - INTERVAL '3 days');

-- Inspección BORRADOR (ENAP)
INSERT INTO inspecciones (id, cilindro_id, usuario_id, sap_cliente, foto_armado_url, foto_despiece_url, presion_prueba, fuga_interna, fuga_externa, ciclo_completo, notas_recepcion, estado_inspeccion, created_at) VALUES
(uuid_generate_v4(), 'HYD-3342', (SELECT id FROM usuarios WHERE email = 'roberto@vignola.cl' LIMIT 1), 'SAPEN-3342',
'https://via.placeholder.com/800x600/4A5568/FFFFFF?text=HYD-3342-Armado',
'https://via.placeholder.com/800x600/4A5568/FFFFFF?text=HYD-3342-Despiece',
0, NULL, NULL, false,
'Cuña flap con desgaste severo en área de trabajo.',
'borrador',
NOW() - INTERVAL '1 day');

-- Inspección COMPLETA (BHP Billiton)
INSERT INTO inspecciones (id, cilindro_id, usuario_id, sap_cliente, foto_armado_url, foto_despiece_url, presion_prueba, fuga_interna, fuga_externa, ciclo_completo, notas_recepcion, notas_pruebas, estado_inspeccion, created_at) VALUES
(uuid_generate_v4(), 'HYD-1982', (SELECT id FROM usuarios WHERE email = 'carlos@vignola.cl' LIMIT 1), 'SAPBHP-1982',
'https://via.placeholder.com/800x600/4A5568/FFFFFF?text=HYD-1982-Armado',
'https://via.placeholder.com/800x600/4A5568/FFFFFF?text=HYD-1982-Despiece',
260, false, false, true,
'Cilindro en buenas condiciones generales.',
'Prueba satisfactoria. Recomendado para servicio.',
'sincronizada',
NOW() - INTERVAL '4 days');

-- Inspección COMPLETA CON FUGA EXTERNA (Anglo American)
INSERT INTO inspecciones (id, cilindro_id, usuario_id, sap_cliente, foto_armado_url, foto_despiece_url, presion_prueba, fuga_interna, fuga_externa, ciclo_completo, notas_recepcion, notas_pruebas, estado_inspeccion, created_at) VALUES
(uuid_generate_v4(), 'HYD-5678', (SELECT id FROM usuarios WHERE email = 'juan@vignola.cl' LIMIT 1), 'SAPANG-5678',
'https://via.placeholder.com/800x600/4A5568/FFFFFF?text=HYD-5678-Armado',
'https://via.placeholder.com/800x600/4A5568/FFFFFF?text=HYD-5678-Despiece',
180, false, true, true,
'Sellos externos con signos de deterioro.',
'Fuga externa detectada en tuerca de vástago. Requiere cambio de sello.',
'completa',
NOW() - INTERVAL '6 days');

-- =============================================
-- 5. DETALLES DE INSPECCIÓN (Para cada inspección)
-- =============================================

-- Obtener IDs de inspecciones creadas
DO $$
DECLARE
  insp_completa_1 UUID;
  insp_borrador_1 UUID;
  insp_completa_2 UUID;
  insp_fuga UUID;
  insp_borrador_2 UUID;
  insp_completa_3 UUID;
  insp_fuga_ext UUID;
BEGIN
  -- Buscar inspecciones por cilindro_id
  SELECT id INTO insp_completa_1 FROM inspecciones WHERE cilindro_id = 'HYD-1102' LIMIT 1;
  SELECT id INTO insp_borrador_1 FROM inspecciones WHERE cilindro_id = 'HYD-2341' LIMIT 1;
  SELECT id INTO insp_completa_2 FROM inspecciones WHERE cilindro_id = 'HYD-3827' LIMIT 1;
  SELECT id INTO insp_fuga FROM inspecciones WHERE cilindro_id = 'HYD-1284' LIMIT 1;
  SELECT id INTO insp_borrador_2 FROM inspecciones WHERE cilindro_id = 'HYD-3342' LIMIT 1;
  SELECT id INTO insp_completa_3 FROM inspecciones WHERE cilindro_id = 'HYD-1982' LIMIT 1;
  SELECT id INTO insp_fuga_ext FROM inspecciones WHERE cilindro_id = 'HYD-5678' LIMIT 1;

  -- Detalles para inspección completa HYD-1102
  INSERT INTO inspeccion_detalles (inspeccion_id, componente, estado, detalle_tecnico, accion_propuesta, observaciones, es_base, orden) VALUES
  (insp_completa_1, 'Vástago', 'Bueno', 'Sin desgaste significativo', 'Limpiar', 'Estado óptimo, sin rayas ni corrosión', true, 1),
  (insp_completa_1, 'Camisa', 'Mantención', 'Leve desgaste en área de trabajo', 'Pulir', 'Pérdida de cromo en 30% del área', true, 2),
  (insp_completa_1, 'Pistón', 'Bueno', 'Sin daño', 'Limpiar', 'En buenas condiciones', true, 3),
  (insp_completa_1, 'Sellos', 'Cambio', 'Endurecidos y dañados', 'Cambiar', 'Todos los sellos deben reemplazarse', true, 4),
  (insp_completa_1, 'Tapas', 'Bueno', 'Sin deformaciones', 'Limpiar', 'Estructura sana', true, 5),
  (insp_completa_1, 'Rótulas', 'Bueno', 'Movimiento suave', 'Lubricar', 'Sin holguras anormales', true, 6),
  (insp_completa_1, 'Pernos', 'Bueno', 'Rosca en buen estado', 'Reutilizar', 'Sin daños en rosca', true, 7);

  -- Detalles para inspección en borrador HYD-2341
  INSERT INTO inspeccion_detalles (inspeccion_id, componente, estado, detalle_tecnico, accion_propuesta, observaciones, es_base, orden) VALUES
  (insp_borrador_1, 'Vástago', 'Mantención', 'Rayas longitudinales moderadas', 'Bruñir', 'Desgaste en zona de trabajo superior', true, 1),
  (insp_borrador_1, 'Camisa', 'Bueno', 'Sin daño aparente', 'Limpiar', 'A awaiting inspection completa', true, 2),
  (insp_borrador_1, 'Pistón', 'Bueno', '', '', '', true, 3),
  (insp_borrador_1, 'Sellos', 'Cambio', 'Dañados', 'Cambiar', '', true, 4);

  -- Detalles para inspección completa HYD-3827
  INSERT INTO inspeccion_detalles (inspeccion_id, componente, estado, detalle_tecnico, accion_propuesta, observaciones, es_base, orden) VALUES
  (insp_completa_2, 'Vástago', 'Bueno', 'Excelente estado', 'Limpiar', 'Cromo duro en óptimas condiciones', true, 1),
  (insp_completa_2, 'Camisa', 'Bueno', 'Sin rayas', 'Limpiar', 'Interior pulido', true, 2),
  (insp_completa_2, 'Pistón', 'Bueno', '', 'Limpiar', '', true, 3),
  (insp_completa_2, 'Sellos', 'Cambio', 'Usados', 'Cambiar', 'Mantenimiento preventivo', true, 4),
  (insp_completa_2, 'Tapas', 'Bueno', '', 'Limpiar', '', true, 5);

  -- Detalles para inspección con fuga HYD-1284
  INSERT INTO inspeccion_detalles (inspeccion_id, componente, estado, detalle_tecnico, accion_propuesta, observaciones, es_base, orden) VALUES
  (insp_fuga, 'Vástago', 'Cambio', 'Rayas profundas y piquetes', 'Fabricar', 'Daño severo en cromo', true, 1),
  (insp_fuga, 'Camisa', 'Mantención', 'Marcas de desgaste', 'Pulir', 'Ajuste requerido', true, 2),
  (insp_fuga, 'Pistón', 'Mantención', 'Grips leves', 'Rectificar', 'Recuperable', true, 3),
  (insp_fuga, 'Sellos', 'Cambio', 'Dañados', 'Cambiar', 'Fuga interna detectada', true, 4),
  (insp_fuga, 'Tapas', 'Bueno', '', 'Limpiar', '', true, 5),
  (insp_fuga, 'Rótulas', 'Mantención', 'Con holgura', 'Ajustar', 'Requiere revisión', true, 6);

  -- Detalles para inspección en borrador HYD-3342
  INSERT INTO inspeccion_detalles (inspeccion_id, componente, estado, detalle_tecnico, accion_propuesta, observaciones, es_base, orden) VALUES
  (insp_borrador_2, 'Vástago', 'Cambio', 'Desgaste severo completo', 'Fabricar', 'Vida útil agotada', true, 1),
  (insp_borrador_2, 'Camisa', 'Cambio', 'Ovalización', 'Cambiar', 'Fuera de tolerancia', true, 2),
  (insp_borrador_2, 'Pistón', 'Mantención', 'Depósitos', 'Pulir', 'Recuperable', true, 3),
  (insp_borrador_2, 'Sellos', 'Cambio', '', 'Cambiar', '', true, 4),
  (insp_borrador_2, 'Tapas', 'Mantención', 'Golpes leves', 'Pintar', '', true, 5);

  -- Detalles para inspección completa HYD-1982
  INSERT INTO inspeccion_detalles (inspeccion_id, componente, estado, detalle_tecnico, accion_propuesta, observaciones, es_base, orden) VALUES
  (insp_completa_3, 'Vástago', 'Bueno', 'Sin marca', 'Limpiar', 'Como nuevo', true, 1),
  (insp_completa_3, 'Camisa', 'Bueno', 'Interior limpio', 'Limpiar', 'Sin anomalías', true, 2),
  (insp_completa_3, 'Pistón', 'Bueno', '', 'Limpiar', '', true, 3),
  (insp_completa_3, 'Sellos', 'Cambio', 'Reemplazo preventivo', 'Cambiar', '', true, 4),
  (insp_completa_3, 'Tapas', 'Bueno', '', 'Limpiar', '', true, 5),
  (insp_completa_3, 'Rótulas', 'Bueno', '', 'Lubricar', '', true, 6),
  (insp_completa_3, 'Pernos', 'Bueno', '', 'Reutilizar', '', true, 7);

  -- Detalles para inspección con fuga externa HYD-5678
  INSERT INTO inspeccion_detalles (inspeccion_id, componente, estado, detalle_tecnico, accion_propuesta, observaciones, es_base, orden) VALUES
  (insp_fuga_ext, 'Vástago', 'Mantención', 'Marcas de sello', 'Pulir', 'Sello exterior dañó vástago', true, 1),
  (insp_fuga_ext, 'Camisa', 'Bueno', 'Sin daño', 'Limpiar', '', true, 2),
  (insp_fuga_ext, 'Pistón', 'Bueno', '', 'Limpiar', '', true, 3),
  (insp_fuga_ext, 'Sellos', 'Cambio', 'Sello posterior dañado', 'Cambiar', 'Causa de fuga externa', true, 4),
  (insp_fuga_ext, 'Tapas', 'Bueno', '', 'Limpiar', '', true, 5),
  (insp_fuga_ext, 'Rótulas', 'Bueno', '', 'Lubricar', '', true, 6);

END $$;

-- =============================================
-- 6. VERIFICACIÓN DE DATOS CREADOS
-- =============================================

-- Ver resumen de datos cargados
SELECT 'usuarios' as tabla, COUNT(*) as total FROM usuarios
UNION ALL
SELECT 'clientes', COUNT(*) FROM clientes
UNION ALL
SELECT 'cilindros', COUNT(*) FROM cilindros
UNION ALL
SELECT 'inspecciones', COUNT(*) FROM inspecciones
UNION ALL
SELECT 'detalles', COUNT(*) FROM inspeccion_detalles;

-- =============================================
-- FIN DEL SCRIPT
-- =============================================
