# Usuarios de Prueba - Vignola

Este documento contiene las credenciales para los usuarios de prueba creados en la base de datos.

## Usuarios Creados

### Usuario 1: Raúl Espinoza
- **Email:** `respinoza@vignola.cl`
- **Contraseña:** `raul123`
- **Rol:** Mecánico
- **ID:** `user-respinoza-vignola-cl`
- **Nombre generado:** Respinoza

### Usuario 2: Mauricio Ruiz
- **Email:** `mruiz@vignola.cl`
- **Contraseña:** `mauricio123`
- **Rol:** Mecánico
- **ID:** `user-mruiz-vignola-cl`
- **Nombre generado:** Mruiz

### Usuario 3: Mecánico General
- **Email:** `mecanico@vignola.cl`
- **Contraseña:** `mecanico123`
- **Rol:** Mecánico
- **ID:** `user-mecanico-vignola-cl`
- **Nombre generado:** Mecanico

## Instrucciones de Uso

### Opción 1: Ejecutar el script SQL directamente en Supabase

1. Ve a tu panel de Supabase
2. Navega a **SQL Editor**
3. Abre el archivo `insert-usuarios-vignola.sql`
4. Ejecuta el script
5. Verifica que los usuarios aparezcan en la tabla `usuarios`

### Opción 2: Iniciar sesión desde la aplicación (automático)

La aplicación creará automáticamente los usuarios la primera vez que inicien sesión:

1. Ejecuta la aplicación: `npm run dev`
2. Ve a `http://localhost:5173/login`
3. Ingresa las credenciales de alguno de los usuarios
4. La aplicación guardará automáticamente el perfil en la base de datos

## Notas Importantes

- **Modo Demo:** La aplicación está en modo demo, por lo que cualquier contraseña es aceptada
- **ID Único:** Los IDs se generan automáticamente basados en el email
- **Nombre Automático:** Los nombres se extraen de la parte del email antes del @
- **Upsert:** El script SQL usa `ON CONFLICT` para actualizar si el usuario ya existe
- **Políticas RLS:** Asegúrate de haber ejecutado primero `fix-rls-public-policies.sql` para permitir acceso público

## Verificación en Base de Datos

Para verificar que los usuarios fueron creados correctamente:

```sql
SELECT id, nombre, email, rol, created_at
FROM usuarios
ORDER BY created_at DESC;
```

## Prueba de Login

Desde la aplicación, puedes probar cada usuario:

1. **Usuario 1:**
   - Email: `respinoza@vignola.cl`
   - Password: `raul123`

2. **Usuario 2:**
   - Email: `mruiz@vignola.cl`
   - Password: `mauricio123`

3. **Usuario 3:**
   - Email: `mecanico@vignola.cl`
   - Password: `mecanico123`

Al iniciar sesión, verás en la consola del navegador:
```
Usuario guardado en base de datos: { id: 'user-...', nombre: '...', email: '...', rol: 'mecanico' }
```

---

**Fecha de creación:** Enero 2026
**Versión:** 1.0
