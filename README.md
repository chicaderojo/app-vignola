# Vignola - Sistema de Inspección Hidráulica

PWA (Progressive Web App) para inspección industrial de cilindros hidráulicos con estrategia Offline-First.

## Características

- 🏭 **Inspección Industrial**: Flujo completo de recepción, peritaje técnico y pruebas hidráulicas
- 📷 **Fotos Obligatorias**: Captura de fotos de armado y despiece antes del peritaje
- 🔧 **Peritaje Dinámico**: Lista base de componentes + capacidad de agregar componentes manuales
- 📊 **Reportes PDF**: Generación automática de reportes técnicos
- 📱 **Offline-First**: Funciona sin conexión usando IndexedDB y sincronización automática
- 🔐 **Autenticación JWT**: Sistema de login custom con roles
- 🎨 **UI Industrial**: Diseño optimizado para uso en taller

## Stack Tecnológico

- **Frontend**: React 18 + TypeScript + Vite
- **Estilos**: Tailwind CSS
- **Base de Datos Local**: Dexie.js (IndexedDB)
- **Base de Datos Remota**: Supabase (PostgreSQL)
- **Router**: React Router v6
- **PDF**: @react-pdf/renderer
- **PWA**: vite-plugin-pwa
- **HTTP**: Axios

## Instalación

```bash
# Instalar dependencias
npm install

# Copiar archivo de entorno
cp .env.example .env

# Configurar variables de entorno
# Editar .env con tu URL de API
```

## Scripts

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Preview del build
npm run preview

# Linter
npm run lint
```

## Estructura del Proyecto

```
src/
├── components/       # Componentes reutilizables
├── db/              # Configuración de Dexie.js (IndexedDB)
├── hooks/           # Custom React hooks
├── pages/           # Páginas de la aplicación
│   ├── LoginPage.tsx
│   ├── DashboardPage.tsx
│   ├── RecepcionPage.tsx
│   ├── PeritajePage.tsx
│   └── PruebasPage.tsx
├── services/        # Servicios (API, Sync, Auth)
├── types/           # Definiciones de TypeScript
└── utils/           # Utilidades
```

## Flujo de Inspección

1. **Dashboard**: Buscar cilindro por ID o SAP, filtrar por cliente
2. **Recepción**: Capturar 2 fotos obligatorias (Armado y Despiece)
3. **Peritaje**: Evaluar componentes (Bueno/Cambio/Mantención) + componentes manuales
4. **Pruebas**: Registrar presión, fugas y completar ciclo de prueba
5. **Reporte**: Generar PDF con conclusiones automáticas

## Arquitectura Offline-First

La aplicación usa una cola de sincronización en IndexedDB:

1. El usuario crea una inspección
2. Si hay conexión, se envía a la API inmediatamente
3. Si NO hay conexión, se guarda en IndexedDB
4. Un Service Worker detecta cuando vuelve la conexión
5. Los datos pendientes se sincronizan automáticamente

## Base de Datos

### Tablas Principales

- **usuarios**: Mecánicos y jefes de maestranza
- **clientes**: Empresas (Arauco, GLV, etc.)
- **cilindros**: Equipos a inspeccionar
- **inspecciones**: Registros de inspecciones
- **inspeccion_detalles**: Peritaje de componentes

Ver [PLAN.md](./PLAN.md) para el esquema completo.

## Configuración de Supabase

1. Crear proyecto en https://supabase.com
2. Ejecutar el SQL del PLAN.md en el SQL Editor
3. Configurar Row Level Security (RLS)
4. Copiar URL y anon key al .env

## Despliegue

### Frontend (Vercel)

```bash
npm run build
# Deploy la carpeta dist/ a Vercel
```

### Backend (Vercel Functions)

Crear funciones en `/api` para:
- `/api/auth/login`
- `/api/inspecciones`
- `/api/inspecciones/upload-foto`

## Desarrollo

### Agregar nueva página

1. Crear archivo en `src/pages/`
2. Agregar ruta en `App.tsx`
3. Seguir el patrón de las páginas existentes

### Agregar nuevo componente base al peritaje

Editar `src/types/index.ts`:

```typescript
export const COMPONENTES_BASE = [
  'Vástago',
  'Camisa',
  'Pistón',
  'Sellos',
  'Tapas',
  'Rótulas',
  'Pernos',
  'TuComponente' // <- Agregar aquí
] as const
```

## Estado del Proyecto

✅ Tipos TypeScript
✅ Dexie.js configurado
✅ Servicio de sincronización
✅ Página de Login
✅ Dashboard (Pantalla 1)
✅ Recepción (Pantalla 2)
✅ Peritaje (Pantalla 3)
✅ Pruebas (Pantalla 4)
✅ Configuración PWA
⚠️ Backend API (Pendiente)
⚠️ Generador de PDF (Pendiente)

## Próximos Pasos

- [ ] Implementar API en Vercel Functions
- [ ] Conectar con Supabase
- [ ] Implementar generación de PDF
- [ ] Agregar pruebas unitarias
- [ ] Optimizar para móviles
- [ ] Agregar dark mode

## Licencia

Confidencial - Vignola
