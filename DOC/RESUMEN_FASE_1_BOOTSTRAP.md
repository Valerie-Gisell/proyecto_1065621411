# Resumen de Fase 1 — Bootstrap, Login, Registro y dataService base

## Objetivo
Implementar el arranque inicial de GoCash con:
- Diseño del sistema visual y tipográfico.
- Autenticación pública con JWT y cookie HttpOnly.
- Registro público de usuarios.
- `dataService.ts` como única capa de acceso a datos.
- Modo seed local para funcionar sin Supabase configurado.
- Auditoría mínima en `lib/blobAudit.ts`.

## Cambios principales realizados

### 1. Sistema de diseño
- Actualizado `app/layout.tsx` para cargar las fuentes `Poppins` y `Roboto Mono`.
- Expandido `globals.css` con paleta de verdes, corales, dorados y variables CSS para el tema de interfaz.
- Agregada una experiencia visual con cards de vidrio, botones pill y fondo oscuro radial.

### 2. Autenticación y sesión
- Agregados endpoints API:
  - `app/api/auth/login/route.ts`
  - `app/api/auth/register/route.ts`
  - `app/api/auth/me/route.ts`
  - `app/api/auth/logout/route.ts`
- Implementada generación de JWT en `lib/auth.ts`.
- Session cookie `gocash_token` configurada como HttpOnly y `secure` en producción.

### 3. Capa de datos unificada
- Añadido `lib/dataService.ts` como punto central de datos.
- Proporciona:
  - `getSystemMode()`
  - `getUserByEmail()`
  - `getUserById()`
  - `createUser()`
  - `listUsers()`
  - `authenticateUser()`
  - `getDashboardData()`
- El servicio trabaja en modo `seed` cuando no hay Supabase configurado.

### 4. Modo seed local
- Añadido `data/seed.json` con un superadmin inicial (`admin@gocash.local`, contraseña `Admin123!`).
- Añadido `data/users.json` para persistir nuevos registros locales.
- `lib/seedReader.ts` abstrae la lectura del seed.

### 5. Auditoría básica
- Añadido `lib/blobAudit.ts` para registrar actividades de login, registro y bootstrap.
- Implementa persistencia local en `data/audit.json`.

### 6. Interfaces de usuario
- Creado hero de bienvenida en `app/page.tsx`.
- Páginas de autenticación:
  - `/login`
  - `/register`
- Página de dashboard inicial en `/dashboard`.

## Estado de la fase
- Fase 1 completada en su implementación inicial.
- La aplicación ahora arranca con un flujo de autenticación funcional en modo seed.
- El siguiente paso es extender el dashboard y añadir categorías, transacciones y análisis.

## Credenciales de acceso de prueba
- Usuario: `admin@gocash.local`
- Contraseña: `Admin123!`
