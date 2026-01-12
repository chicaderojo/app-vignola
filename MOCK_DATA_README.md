# Cómo cargar los datos de prueba en Supabase

## Pasos para cargar los datos:

### 1. Abrir el SQL Editor en Supabase

1. Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Selecciona tu proyecto
3. En el menú lateral, haz clic en **"SQL Editor"**
4. Clic en **"New Query"**

### 2. Copiar y ejecutar el schema primero

Antes de cargar los datos de prueba, asegúrate de haber ejecutado el schema principal:

```sql
-- Primero ejecuta: supabase-schema.sql
```

Esto creará todas las tablas necesarias.

### 3. **IMPORTANTE: Corregir políticas RLS**

Antes de cargar los datos, necesitas ejecutar el script para corregir las políticas de seguridad (RLS) para que la app pueda acceder a los datos:

```sql
-- Ejecuta: fix-rls-policies.sql
```

Este script deshabilitará RLS para las tablas principales (usuarios, cilindros, clientes) permitiendo que tu app acceda a los datos sin problemas de autenticación.

### 4. Ejecutar el script de datos de prueba

1. Abre el archivo `mock-data-simple.sql` en tu editor
2. Copia **TODO** el contenido del archivo
3. Pégalo en el SQL Editor de Supabase
4. Haz clic en **"Run"** o presiona `Ctrl + Enter`

### 5. Verificar que los datos se cargaron correctamente

Ejecuta esta consulta en el SQL Editor:

```sql
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
```

Deberías ver:
- ✅ usuarios: 4
- ✅ clientes: 10
- ✅ cilindros: 20
- ✅ inspecciones: 7
- ✅ detalles: ~40

## Datos incluidos:

### 👤 Usuarios (4)
- **Juan Pérez** (juan@vignola.cl) - Mecánico
- **Carlos López** (carlos@vignola.cl) - Mecánico
- **María González** (maria@vignola.cl) - Jefe Maestranza
- **Roberto Silva** (roberto@vignola.cl) - Mecánico

**Contraseña para todos:** `password123`

### 🏢 Clientes (10)
Empresas mineras y forestales chilenas reales:
- Minera Escondida
- Arauco
- CMPC
- Masisa
- ENAP
- Codelco
- Anglo American
- BHP Billiton
- Collahuasi
- Pelambres

### 🔧 Cilindros (20)
Diversos tipos:
- **Oleohidráulico** (Rexroth, Parker, Vickers, Hydoring)
- **Buzo** (Parker, Rexroth, Hydoring)
- **Cuña Flap** (Hydoring, Vickers, Rexroth)

Con diferentes especificaciones:
- Diámetros: Ø60 a Ø125 mm
- Carreras: 120mm a 300mm
- Fabricantes: Rexroth, Parker, Hydoring, Vickers

### 📋 Inspecciones (7)
- **4 Completas/Sincronizadas**: Inspecciones finalizadas
- **2 Borrador**: En proceso de revisión
- **1 Completa con problemas**: Tiene fugas detectadas

### 📝 Detalles (~40 registros)
Componentes evaluados con diferentes estados:
- ✅ **Bueno**: Sin daño, puede reutilizarse
- 🔧 **Mantención**: Requiere pulido, bruñido, o rectificado
- 🔄 **Cambio**: Debe reemplazarse

## Prueba la aplicación:

1. **Inicia sesión** con cualquiera de los usuarios de prueba
2. **Ve al Dashboard** - Verás las estadísticas actualizadas
3. **Navega a "Inspecciones Pendientes"** - Verás las 2 inspecciones en borrador
4. **Revisa el "Historial"** - Verás todas las inspecciones completadas

## Si necesitas limpiar y volver a cargar:

```sql
-- Eliminar todos los datos de prueba
TRUNCATE TABLE inspeccion_detalles CASCADE;
TRUNCATE TABLE inspecciones CASCADE;
TRUNCATE TABLE cilindros CASCADE;
TRUNCATE TABLE clientes CASCADE;
TRUNCATE TABLE usuarios CASCADE;

-- Luego vuelve a ejecutar mock-data.sql
```

## Observaciones:

- Los cilindros están vinculados correctamente a sus clientes
- Las inspecciones tienen usuarios asignados
- Los detalles de inspección incluyen observaciones realistas
- Las fechas son relativas (hace 1 día, 3 días, 1 semana, etc.)
- Incluye casos reales: fugas, desgaste severo, componentes en buen estado

¡Ahora tu aplicación se verá viva y llena de datos realistas! 🎉
