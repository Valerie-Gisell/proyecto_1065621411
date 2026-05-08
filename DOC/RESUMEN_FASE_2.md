# Resumen de Fase 2 — Dashboard shell, Layout Mobile-First y bootstrap

## Objetivo
Construir el shell visual y la navegación inicial de GoCash con:
- Layout mobile-first y navegación bottom/tab para mobile.
- Sidebar de navegación para desktop.
- Componentes UI base: `BalanceCard`, `QuickActions`, `SeedModeBanner`.
- Ruta de administración `app/admin/db-setup/page.tsx` como shell de configuración.
- Endpoint `GET /api/dashboard` para retornar el estado inicial del dashboard.
- Middleware de protección de rutas privadas y control de acceso de `/admin`.

## Cambios principales realizados

### 1. Shell de navegación
- Añadido `components/ui/AppLayout.tsx` con:
  - sidebar desktop
  - bottom nav mobile
  - botón central de acción principal
- Creada la navegación falsa de shell para `dashboard`, `transactions`, `goals` y `profile`.

### 2. Componentes de fase 2
- `components/ui/BalanceCard.tsx` → tarjeta de balance inicial.
- `components/ui/QuickActions.tsx` → acciones rápidas en el dashboard.
- `components/ui/SeedModeBanner.tsx` → banner de modo seed y estado inicial.
- `components/ui/LogoutButton.tsx` → cierre de sesión desde el dashboard.

### 3. Dashboard shell
- `app/dashboard/page.tsx` actualizado para usar los nuevos componentes.
- `app/dashboard/layout.tsx` envuelve el contenido con `AppLayout`.
- Se mantiene la autenticación JWT y el modo seed en el dashboard.

### 4. API y protección de rutas
- `app/api/dashboard/route.ts` retorna la estructura inicial del dashboard en modo seed.
- `middleware.ts` protege rutas privadas y restringe `/admin` a `superadmin`.
- `lib/withAuth.ts` y `lib/withRole.ts` permiten reutilizar lógica de autenticación.

### 5. Administración
- Creada `app/admin/db-setup/page.tsx` como shell administrativo de la fase 2.

## Estado de la fase
- Fase 2 completada en términos de shell, layout móvil, navegación inicial y rutas protegidas.
- El tablero muestra placeholders claros para los datos que llegarán en fases siguientes.

## Notas adicionales
- La experiencia mobile ahora tiene un menú bottom con botón central de acción.
- Las rutas de transacciones, metas y perfil existen como shell para evitar errores de navegación.
