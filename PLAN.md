Este es el **Plan Maestro de Ingeniería** actualizado y definitivo para ser entregado a Claude. Está diseñado para una arquitectura de **Monorepo en Vercel**, utilizando **Serverless Functions** para la lógica de negocio y seguridad, eliminando la dependencia de Supabase Auth en favor de una solución propia con **JWT** y **TypeScript**.

---

## 1. Arquitectura del Sistema (Monorepo Vercel)

El proyecto se estructurará para que el frontend y las funciones de backend compartan el mismo ciclo de vida y tipos de datos.

### A. Estructura de Directorios

```text
/industrial-inspeccion-app
├── /api                 # Backend (Vercel Serverless Functions)
│   ├── auth/login.ts    # JWT + bcrypt logic
│   ├── auth/verify.ts   # Middleware de validación
│   └── reports/pdf.ts   # Generación de reportes
├── /src                 # Frontend (React + Vite + PWA)
│   ├── /components      # UI tipada (Shadcn/Tailwind)
│   ├── /hooks           # useOfflineSync, useAuth
│   ├── /services        # api-client.ts, dexie-db.ts
│   └── types.ts         # Interfaces de TS compartidas
├── /public              # Service Workers y Manifest
└── vercel.json          # Configuración de Serverless e Inmuebles

```

---

## 2. Modelado de Datos y Tipado Estricto (TypeScript)

### A. Esquema SQL (Supabase)

Claude debe ejecutar este esquema para soportar el peritaje dinámico y el historial de inspecciones :

```sql
-- Gestión de Acceso Custom
CREATE TABLE usuarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  rol TEXT DEFAULT 'mecanico' -- mecanico, jefe_maestranza
);

-- Cabecera de Inspección
CREATE TABLE inspecciones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  [cite_start]cilindro_id TEXT NOT NULL, -- ej: CE05CIL0672 [cite: 111]
  usuario_id UUID REFERENCES usuarios(id),
  sap_cliente TEXT,
  [cite_start]foto_armado_url TEXT NOT NULL, -- Obligatoria [cite: 89, 106]
  [cite_start]foto_despiece_url TEXT NOT NULL, -- Obligatoria [cite: 90, 106]
  [cite_start]presion_prueba INT, -- ej: 150-180 bar [cite: 94, 120, 150]
  fuga_interna BOOLEAN DEFAULT FALSE,
  fuga_externa BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Componentes Dinámicos (Peritaje)
CREATE TABLE inspeccion_detalles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  inspeccion_id UUID REFERENCES inspecciones(id) ON DELETE CASCADE,
  [cite_start]componente TEXT NOT NULL, -- Vástago, Camisa, o ingreso manual [cite: 92, 105]
  estado TEXT CHECK (estado IN ('Bueno', 'Cambio', 'Mantención')),
  [cite_start]detalle_tecnico TEXT, -- ej: Rayas profundas [cite: 23, 25, 51]
  [cite_start]accion_propuesta TEXT -- ej: Bruñido, Pulido, Fabricación [cite: 19, 46, 62]
);

```

---

## 3. Estrategia Offline-First (Dexie.js)

Para garantizar la operación en talleres con baja conectividad, la aplicación usará **IndexedDB** como capa de persistencia inmediata.

### Configuración de la Cola de Sincronización

Claude debe implementar un servicio que maneje:

1. 
**Persistencia local:** Las fotos de recepción (Armado y Despiece) se guardan como **Blobs** en IndexedDB para evitar pérdida de datos .


2. **Cola de tareas:** Cuando el operador finaliza la inspección, los datos se encolan.
3. 
**Background Sync:** Un efecto en React o Service Worker verifica `navigator.onLine` y vacía la cola enviando los datos a las Vercel Functions .



---

## 4. Flujo de Pantallas y UX Técnica

### Fase 1: Recepción Mandatoria

* La aplicación bloquea el acceso al peritaje técnico hasta que se carguen las **2 fotos obligatorias** (Estado Armado y Estado Despiece) .


* Se capturan los datos iniciales del cilindro: Fabricante (Parker, Rexroth, Hydoring), Diámetro camisa, Diámetro vástago y Largo carrera.



### Fase 2: Peritaje Dinámico (Dynamic Checklist)

* 
**Lista Base:** Se cargan automáticamente: Vástago, Camisa, Pistón, Sellos, Tapas, Rótulas y Pernos .


* 
**Componente Manual:** Un botón `+` permite añadir componentes específicos como "Tirantes", "Glands" o "Tuberías de acero inoxidable".


* 
**Diagnóstico:** Selector de estados con botones rápidos para diagnósticos típicos (ej: "Piquetes" para vástagos, "Oxidación" para camisas).



### Fase 3: Pruebas Hidráulicas

* Registro numérico de la presión (bar) y toggle de validación de estanqueidad externa (uniones) e interna (entre cámaras) .



---

## 5. El Prompt Maestro para Claude

Copia y pega este prompt para iniciar el desarrollo del proyecto:

> **Claude, actúa como Ingeniero Senior Fullstack. Vamos a construir una PWA de Inspección Industrial.**
> **Stack Técnico:**
> * **Frontend:** React 18 (Vite), TypeScript, Tailwind CSS.
> * **Backend:** Vercel Serverless Functions (Node.js + TS).
> * **Auth:** Sistema Custom JWT. Tabla 'usuarios' en Supabase (no usar Supabase Auth).
> * **Offline:** Dexie.js (IndexedDB) para una cola de sincronización de datos y Blobs (fotos).
> * **PDF:** React-pdf para reportes en el cliente.
> 
> 
> **Instrucciones Iniciales:**
> 1. Define el archivo `src/types/index.ts` con interfaces para `Cilindro`, `Inspeccion` (incluyendo las 2 fotos de recepción obligatorias) y `ComponentePeritaje` (lista base + manual).
> 2. Crea la configuración de **Dexie.js** para manejar una tabla `sync_queue` que almacene inspecciones offline.
> 3. Genera el código para el endpoint serverless `/api/auth/login.ts` que valide contra la tabla `usuarios` usando `bcryptjs` y firme un **JWT**.
> 4. Diseña la **Pantalla de Peritaje**: Una lista dinámica que permita al mecánico evaluar componentes base y agregar componentes personalizados con un botón.
> 
> 
> **Prioridad:** El sistema debe ser robusto ante la pérdida de internet. Asegura que las fotos se guarden localmente antes de intentar la subida.
