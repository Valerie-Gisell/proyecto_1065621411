# GoCash — Plan Maestro del Sistema
> Gestión Financiera Personal con Modo Emocional | Versión 1.0
> Proyecto Fullstack Individual | Mayo 2026
> Stack: Next.js + TypeScript + Supabase Postgres + Vercel Blob + Vercel
> Estudiante: Valerie Zequeira | Doc: 1065621411

---

## Índice General

1. [Definición del sistema y alcance v1](#1-definición-del-sistema-y-alcance-v1)
2. [Actores del sistema](#2-actores-del-sistema)
3. [Roles y permisos](#3-roles-y-permisos)
4. [Casos de uso](#4-casos-de-uso)
5. [Requerimientos funcionales](#5-requerimientos-funcionales)
6. [Reglas de negocio](#6-reglas-de-negocio)
7. [Stack tecnológico](#7-stack-tecnológico)
8. [Arquitectura de persistencia](#8-arquitectura-de-persistencia)
9. [Bootstrap y migrations](#9-bootstrap-y-migrations)
10. [Capa de datos unificada (dataService)](#10-capa-de-datos-unificada)
11. [Modelo de datos — Supabase Postgres](#11-modelo-de-datos--supabase-postgres)
12. [Auditoría en Vercel Blob](#12-auditoría-en-vercel-blob)
13. [Arquitectura de rutas](#13-arquitectura-de-rutas)
14. [Requerimientos no funcionales](#14-requerimientos-no-funcionales)
15. [Flujos de usuario y de trabajo](#15-flujos-de-usuario-y-de-trabajo)
16. [Diseño de interfaz](#16-diseño-de-interfaz)
17. [Plan de fases de implementación](#17-plan-de-fases-de-implementación)
18. [Estrategia de seguridad](#18-estrategia-de-seguridad)
19. [Restricciones y trabajo futuro](#19-restricciones-y-trabajo-futuro)
20. [Glosario](#20-glosario)

---

## 1. Definición del sistema y alcance v1

**GoCash** es una aplicación web Mobile-First de gestión financiera personal. Permite registrar ingresos y gastos categorizados, establecer metas de ahorro con seguimiento de progreso, visualizar el estado financiero en un dashboard y conectar las decisiones de gasto con el estado emocional del usuario mediante el **Modo Emocional**.

El tagline del producto es *"Tu dinero, tu ritmo."*

### 1.1 Lo que incluye la v1

| Módulo | Descripción |
|---|---|
| **Autenticación** | Registro público con correo y contraseña. Login. Perfil editable. |
| **Transacciones** | Registro de ingresos y gastos con categoría, monto, fecha, descripción y etiqueta emocional opcional. |
| **Modo Emocional** | Al registrar cualquier transacción, el usuario puede etiquetar su emoción (5 estados: 😊 😌 😔 😤 🤩). El sistema muestra insights de correlación emoción-gasto. |
| **Categorías** | Categorías globales creadas por el admin. El usuario puede crear categorías personales adicionales. |
| **Metas Financieras** | Crear metas con nombre, monto objetivo, fecha límite y progreso. El usuario puede "abonar" a una meta. |
| **Dashboard** | Balance total, ingresos vs gastos del mes, últimas transacciones, progreso de metas, tasa de ahorro. |
| **Reportes** | Gastos por categoría (gráfica de torta), evolución del balance (gráfica de línea), historial filtrable. |
| **Super Admin** | Gestión de usuarios, categorías globales, auditoría. |

### 1.2 Lo que queda para versiones futuras

- **GoCash IA**: asistente conversacional que requiere integración con una API de lenguaje (OpenAI u otro).
- **Modo Hogar**: finanzas compartidas entre dos usuarios vinculados, con metas conjuntas y contribuciones proporcionales.
- **Gamificación**: GC Points, insignias, ranking de usuarios más disciplinados.
- **Open Banking**: conexión con APIs bancarias para importar movimientos automáticamente.
- **Notificaciones push**: alertas de presupuesto, recordatorios de metas, ciclo semanal inteligente.
- **App nativa**: React Native o Flutter para iOS y Android.
- **Modo oscuro**: implementación del tema oscuro completo.
- **Exportación PDF**: reportes descargables.
- **Modo educativo para menores** (Rol Tutelado).

---

## 2. Actores del sistema

| Actor | Tipo | Descripción |
|---|---|---|
| **Usuario** | Externo | Actor principal. Se registra y gestiona sus propias finanzas. |
| **Super Admin** | Interno | Gestiona categorías globales, usuarios y accede a la auditoría. |
| **Sistema** | No humano | Calcula balance, tasa de ahorro, progreso de metas. Registra auditoría. |

---

## 3. Roles y permisos

### Matriz de permisos

| Recurso / Acción | Usuario | Super Admin |
|---|:-:|:-:|
| Login / cambiar contraseña propia | ✅ | ✅ |
| Registrarse | ✅ | N/A |
| Acceder a `/admin/db-setup` | ❌ | ✅ |
| **TRANSACCIONES** | | |
| Registrar / editar / eliminar sus propias transacciones | ✅ | ❌ |
| Ver sus propias transacciones | ✅ | ❌ |
| Ver transacciones de otros usuarios | ❌ | ❌ |
| **CATEGORÍAS** | | |
| Usar categorías globales | ✅ | ✅ |
| Crear categorías personales | ✅ | ❌ |
| Crear / editar / eliminar categorías globales | ❌ | ✅ |
| **METAS** | | |
| Crear / editar / eliminar sus propias metas | ✅ | ❌ |
| Abonar a una meta | ✅ | ❌ |
| **DASHBOARD Y REPORTES** | | |
| Ver su propio dashboard y reportes | ✅ | ❌ |
| **ADMINISTRACIÓN** | | |
| Ver y gestionar usuarios | ❌ | ✅ |
| Ver auditoría | ❌ | ✅ |

> **Privacidad total:** el Super Admin nunca puede ver las transacciones ni las metas de un usuario específico. Solo accede a métricas agregadas (usuarios activos, transacciones totales del sistema).

---

## 4. Casos de uso

### Módulo de Autenticación

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-A1 | Registrarse | Usuario | Nombre, correo, contraseña. Moneda por defecto (COP). Cuenta activa inmediatamente. |
| CU-A2 | Iniciar sesión | Todos | Correo y contraseña. JWT con cookie HttpOnly. |
| CU-A3 | Cambiar contraseña | Todos | Verifica la contraseña actual. |
| CU-A4 | Editar perfil | Usuario | Actualiza nombre y moneda de preferencia. |

### Módulo de Transacciones

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-01 | Registrar ingreso | Usuario | Monto, categoría, fecha, descripción, emoción opcional. El balance aumenta. |
| CU-02 | Registrar gasto | Usuario | Monto, categoría, fecha, descripción, emoción opcional. El balance disminuye. |
| CU-03 | Editar transacción | Usuario | Modifica cualquier campo de una transacción propia. |
| CU-04 | Eliminar transacción | Usuario | Elimina la transacción. El balance se recalcula. |
| CU-05 | Ver historial | Usuario | Lista con filtros por tipo, categoría, fecha y emoción. Búsqueda por descripción. |

### Módulo de Modo Emocional

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-06 | Etiquetar emoción | Usuario | Al guardar una transacción, el sistema pregunta "¿Cómo te sentías?". 5 opciones: 😊 Feliz, 😌 Tranquilo, 😔 Triste, 😤 Estresado, 🤩 Emocionado. Opcional — se puede saltar. |
| CU-07 | Ver análisis emocional | Usuario | Resumen de cuánto gasta el usuario en cada estado emocional. Porcentaje de gastos impulsivos (registrados con emoción negativa). |

### Módulo de Metas

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-08 | Crear meta | Usuario | Nombre, emoji, monto objetivo, fecha límite, descripción. El monto inicial es 0. |
| CU-09 | Abonar a meta | Usuario | Registra un aporte manual a la meta. El sistema muestra el nuevo porcentaje de progreso. |
| CU-10 | Ver progreso de meta | Usuario | Barra de progreso, monto acumulado vs objetivo, días restantes. |
| CU-11 | Completar / cerrar meta | Sistema / Usuario | Cuando el monto acumulado >= objetivo, la meta se marca como completada. |

### Dashboard y Reportes

| ID | Caso de uso | Actor | Descripción |
|---|---|---|---|
| CU-12 | Ver dashboard | Usuario | Balance total, ingresos y gastos del mes, últimas transacciones, resumen de metas, tasa de ahorro. |
| CU-13 | Ver reporte por categoría | Usuario | Gráfica de torta de gastos del mes por categoría. |
| CU-14 | Ver evolución del balance | Usuario | Gráfica de línea del balance diario del mes en curso. |
| CU-15 | Filtrar historial | Usuario | Filtros por tipo, categoría, rango de fechas y emoción. |

---

## 5. Requerimientos funcionales

| ID | Requerimiento |
|---|---|
| RF-B1 | El sistema debe poder ejecutarse sin Supabase configurado, sirviendo el seed de `data/` para login inicial del admin. |
| RF-B2 | El sistema debe ofrecer `/admin/db-setup` para diagnóstico, migrations y seed. |
| RF-01 | El sistema permite registro con nombre, correo y contraseña. Cuenta activa inmediatamente. |
| RF-02 | El sistema permite registrar ingresos y gastos con: monto, tipo, categoría, fecha, descripción y emoción opcional. |
| RF-03 | El balance se calcula dinámicamente: `Σ ingresos - Σ gastos`. |
| RF-04 | El modo emocional solicita al usuario su emoción después de registrar cada transacción. Es opcional — el usuario puede omitirlo. |
| RF-05 | El sistema muestra un análisis de correlación emoción-gasto: cuánto gasta el usuario en cada estado emocional. |
| RF-06 | El sistema permite crear y gestionar categorías personales, además de usar las globales del sistema. |
| RF-07 | El sistema permite crear metas financieras con nombre, monto objetivo, fecha límite y emoji. |
| RF-08 | El sistema permite abonar manualmente a una meta y muestra el progreso en porcentaje. |
| RF-09 | El dashboard muestra: balance del mes, tasa de ahorro, últimas 5 transacciones y metas activas. |
| RF-10 | El sistema genera una gráfica de torta de gastos por categoría del mes. |
| RF-11 | El sistema genera una gráfica de línea con la evolución del balance diario del mes. |
| RF-12 | El historial de transacciones es filtrable por tipo, categoría, fechas y emoción. |

---

## 6. Reglas de negocio

| ID | Regla | Implementación técnica |
|---|---|---|
| RN-01 | El balance nunca se almacena como columna — se calcula: `SUM(amount WHERE type='ingreso') - SUM(amount WHERE type='gasto')`. | Función en `dataService.getBalance(userId)`. |
| RN-02 | Una transacción no puede tener monto menor o igual a cero. | Zod: `z.number().positive()`. CHECK en Postgres: `amount > 0`. |
| RN-03 | La fecha de una transacción puede ser pasada, presente o futura (el usuario puede cargar transacciones atrasadas). | Sin restricción de fecha en el servidor. |
| RN-04 | La emoción es siempre opcional. Una transacción sin emoción es completamente válida. | Campo `emotion NULLABLE` en la tabla. |
| RN-05 | El usuario solo puede ver, editar y eliminar sus propias transacciones y metas. | Todas las queries filtran por `user_id = JWT.userId`. |
| RN-06 | Una meta completada (acumulado >= objetivo) no puede recibir más aportes. | Verificar `goal.current_amount < goal.target_amount` antes de abonar. |
| RN-07 | Las categorías globales las crea el Super Admin. El usuario puede crear categorías personales. Las personales tienen `user_id != null`; las globales tienen `user_id IS NULL`. | Campo `user_id NULLABLE` en `categories`. Las queries del usuario retornan las globales + las suyas. |
| RN-08 | La tasa de ahorro mensual = `(ingresos_mes - gastos_mes) / ingresos_mes × 100`. Si no hay ingresos en el mes, la tasa de ahorro es null. | Calcular en el servidor en `getDashboardData()`. |
| RN-09 | Eliminar una transacción la borra permanentemente. No hay papelera. El usuario confirma con un modal. | Hard delete con confirmación en el frontend. |
| RN-10 | El Super Admin nunca puede ver el contenido de las transacciones individuales de los usuarios. | Los endpoints de admin solo retornan métricas agregadas. |

---

## 7. Stack tecnológico

| Capa | Tecnología | Versión | Propósito |
|---|---|---|---|
| Framework | Next.js (App Router) | 16.x | Rutas, server components, API routes |
| Lenguaje | TypeScript | 5.x | Tipado estático |
| UI | React | 19.x | Componentes del cliente |
| Estilos | Tailwind CSS | 4.x | Utilidades y Mobile-First responsive |
| Animaciones | Framer Motion | 12.x | Transiciones |
| Validación | Zod | 4.x | Validación servidor y cliente |
| Autenticación | JWT (jose) + bcryptjs | — | Sesiones con cookie HttpOnly |
| Base de datos | Supabase Postgres | — | Datos estructurados |
| Cliente DB (migrations) | `pg` (node-postgres) | 8.x | SQL crudo desde bootstrap |
| Cliente DB (queries) | `@supabase/supabase-js` | 2.x | Queries del día a día |
| Gráficas | Recharts | 2.x | Torta de categorías + línea de balance |
| Auditoría | `@vercel/blob` | — | Logs append-only del admin |
| Tipografía | Poppins + Inter + Roboto Mono | — | Sistema tipográfico del spec (Google Fonts) |
| Iconos | Lucide React | — | Iconografía stroke rounded |
| Deploy | Vercel | — | Hosting serverless |

### Variables de entorno requeridas

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DATABASE_URL=
BLOB_READ_WRITE_TOKEN=
JWT_SECRET=
ADMIN_BOOTSTRAP_SECRET=
```

---

## 8. Arquitectura de persistencia

### 8.1 Destinos de persistencia

| Destino | Qué guarda | Por qué |
|---|---|---|
| **Supabase Postgres** | Usuarios, categorías, transacciones, metas, aportes a metas. | Todo el dominio financiero requiere SQL: cálculo de balance, sumas por categoría, análisis emocional, progreso de metas. |
| **Vercel Blob** | Auditoría de operaciones del admin (`audit/<YYYYMM>.json`). | Logs append-only. |
| **`data/` en el repo** | Seed: super admin + categorías globales predeterminadas. | Read-only. Solo para arrancar antes del bootstrap. |

### 8.2 Reglas de oro

1. **`dataService.ts` es el ÚNICO punto de acceso a datos.**
2. **El balance nunca se guarda como columna** — siempre se calcula con SUM sobre las transacciones del usuario (RN-01).
3. **Las transacciones y metas son completamente privadas** — toda query filtra por `user_id` del JWT (RN-05).
4. **El Super Admin nunca accede a datos individuales** de transacciones o metas (RN-10).
5. **CERO caché** en `/api/:path*`. Headers `no-store`.
6. **`get()` del SDK de Blob, nunca `fetch(url)`** para auditoría.
7. **Token de Blob accedido con función lazy** (`getBlobToken()`).

---

## 9. Bootstrap y migrations

### 9.1 Estructura de `data/` (solo semilla)

```
data/
  config.json     ← { "version": "1.0", "system_name": "GoCash" }
  seed.json       ← {
                      "users": [{
                        email: "admin@gocash.app",
                        password_hash: "<bcrypt admin123>",
                        name: "Super Admin",
                        role: "superadmin"
                      }],
                      "categories": [
                        { "name": "Alimentación", "emoji": "🍽️", "type": "gasto", "color": "#FF6B6B" },
                        { "name": "Transporte",   "emoji": "🚗", "type": "gasto", "color": "#FFD166" },
                        { "name": "Entretenimiento","emoji":"🎬","type": "gasto", "color": "#00C896" },
                        { "name": "Salud",         "emoji": "💊", "type": "gasto", "color": "#4ECDC4" },
                        { "name": "Educación",     "emoji": "📚", "type": "gasto", "color": "#6C5CE7" },
                        { "name": "Hogar",         "emoji": "🏠", "type": "gasto", "color": "#A29BFE" },
                        { "name": "Ropa",          "emoji": "👗", "type": "gasto", "color": "#FD79A8" },
                        { "name": "Otros gastos",  "emoji": "💸", "type": "gasto", "color": "#636E72" },
                        { "name": "Salario",       "emoji": "💼", "type": "ingreso", "color": "#00C896" },
                        { "name": "Freelance",     "emoji": "💻", "type": "ingreso", "color": "#00B894" },
                        { "name": "Otros ingresos","emoji": "💰", "type": "ingreso", "color": "#55EFC4" }
                      ]
                    }
  README.md
```

### 9.2 Estructura de `supabase/migrations/`

```
supabase/migrations/
  0001_init_users.sql          ← Fase 1: users + _migrations
  0002_init_categories.sql     ← Fase 3: categories
  0003_init_transactions.sql   ← Fase 4: transactions
  0004_init_goals.sql          ← Fase 5: goals + goal_contributions
```

---

## 10. Capa de datos unificada

`lib/dataService.ts` es el **único punto de acceso a datos** desde el resto de la aplicación.

### 10.1 API pública del `dataService`

```typescript
// Sistema
export async function getSystemMode(): Promise<'seed' | 'live'>

// Auth y usuarios
export async function getUserByEmail(email: string): Promise<User | null>
export async function getUserById(id: string): Promise<User | null>
export async function createUser(data: CreateUserRequest): Promise<User>
export async function updateUser(id: string, data: UpdateUserRequest): Promise<User>
export async function listUsers(): Promise<SafeUser[]>

// Categorías
export async function getCategories(userId: string): Promise<Category[]>
// Retorna globales (user_id IS NULL) + personales del usuario (user_id = userId)
export async function createCategory(userId: string, data: CreateCategoryRequest): Promise<Category>
export async function updateCategory(id: string, userId: string, data: UpdateCategoryRequest): Promise<Category>
export async function deleteCategory(id: string, userId: string): Promise<void>
// Solo puede eliminarse si no tiene transacciones asociadas

// Transacciones
export async function getTransactions(userId: string, filters?: TransactionFilters): Promise<Transaction[]>
export async function getTransactionById(id: string, userId: string): Promise<Transaction | null>
export async function createTransaction(userId: string, data: CreateTransactionRequest): Promise<Transaction>
export async function updateTransaction(id: string, userId: string, data: UpdateTransactionRequest): Promise<Transaction>
export async function deleteTransaction(id: string, userId: string): Promise<void>

// Balance y estadísticas (siempre calculados, nunca almacenados)
export async function getMonthlyBalance(userId: string, year: number, month: number): Promise<MonthlyBalance>
export async function getCategoryBreakdown(userId: string, year: number, month: number): Promise<CategoryBreakdown[]>
export async function getDailyBalanceEvolution(userId: string, year: number, month: number): Promise<DailyBalance[]>
export async function getEmotionAnalysis(userId: string): Promise<EmotionAnalysis>

// Metas
export async function getGoals(userId: string): Promise<GoalWithProgress[]>
export async function getGoalById(id: string, userId: string): Promise<GoalWithProgress | null>
export async function createGoal(userId: string, data: CreateGoalRequest): Promise<Goal>
export async function updateGoal(id: string, userId: string, data: UpdateGoalRequest): Promise<Goal>
export async function deleteGoal(id: string, userId: string): Promise<void>
export async function contributeToGoal(goalId: string, userId: string, amount: number): Promise<GoalContribution>

// Dashboard
export async function getDashboardData(userId: string): Promise<DashboardData>

// Auditoría
export async function recordAudit(entry: AuditEntry): Promise<void>
export async function readAuditMonth(yyyymm: string): Promise<AuditEntry[]>
```

### 10.2 Lógica del análisis emocional

```typescript
// Devuelve, para cada emoción, cuánto gastó el usuario con esa emoción
// y qué porcentaje del total de gastos representa.
// Solo analiza gastos (type='gasto'), no ingresos.
export async function getEmotionAnalysis(userId: string): Promise<EmotionAnalysis> {
  const data = await supabase
    .from('transactions')
    .select('emotion, amount')
    .eq('user_id', userId)
    .eq('type', 'gasto')
    .not('emotion', 'is', null);

  const grouped = data.data?.reduce((acc, t) => {
    acc[t.emotion] = (acc[t.emotion] ?? 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const total = Object.values(grouped ?? {}).reduce((s, v) => s + v, 0);

  return Object.entries(grouped ?? {}).map(([emotion, amount]) => ({
    emotion,
    total_amount: amount,
    percentage: total > 0 ? (amount / total * 100).toFixed(1) : '0',
  }));
}
```

---

## 11. Modelo de datos — Supabase Postgres

### Migration `0001_init_users.sql`

```sql
CREATE TABLE IF NOT EXISTS users (
  id                   UUID         DEFAULT gen_random_uuid() PRIMARY KEY,
  name                 VARCHAR(100) NOT NULL,
  email                VARCHAR(255) UNIQUE NOT NULL,
  password_hash        TEXT         NOT NULL,
  role                 VARCHAR(15)  NOT NULL DEFAULT 'usuario'
                       CHECK (role IN ('usuario', 'superadmin')),
  currency             VARCHAR(5)   NOT NULL DEFAULT 'COP',
  is_active            BOOLEAN      DEFAULT true,
  must_change_password BOOLEAN      DEFAULT false,
  last_login_at        TIMESTAMPTZ,
  created_at           TIMESTAMPTZ  DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

CREATE TABLE IF NOT EXISTS _migrations (
  id         SERIAL       PRIMARY KEY,
  filename   VARCHAR(255) UNIQUE NOT NULL,
  applied_at TIMESTAMPTZ  DEFAULT NOW()
);
```

### Migration `0002_init_categories.sql`

```sql
CREATE TABLE IF NOT EXISTS categories (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID        REFERENCES users(id) ON DELETE CASCADE,
           -- NULL = global (admin); NOT NULL = personal del usuario
  name       VARCHAR(80) NOT NULL,
  emoji      VARCHAR(10) DEFAULT '💸',
  color      VARCHAR(7)  DEFAULT '#636E72',
  type       VARCHAR(10) NOT NULL DEFAULT 'gasto'
             CHECK (type IN ('ingreso', 'gasto', 'ambos')),
  is_active  BOOLEAN     DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Una categoría personal no puede duplicar el nombre global para el mismo usuario
CREATE UNIQUE INDEX IF NOT EXISTS idx_cat_user_name
  ON categories(COALESCE(user_id::text, 'global'), LOWER(name));

CREATE INDEX IF NOT EXISTS idx_categories_user ON categories(user_id);
```

### Migration `0003_init_transactions.sql`

```sql
CREATE TABLE IF NOT EXISTS transactions (
  id            UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  category_id   UUID          REFERENCES categories(id) ON DELETE SET NULL,
  type          VARCHAR(10)   NOT NULL CHECK (type IN ('ingreso', 'gasto')),
  amount        DECIMAL(12,2) NOT NULL CHECK (amount > 0),   -- RN-02
  description   VARCHAR(200),
  transaction_date DATE       NOT NULL,
  emotion       VARCHAR(15)   CHECK (emotion IN
                ('feliz', 'tranquilo', 'triste', 'estresado', 'emocionado')),
                -- NULL = sin emoción registrada (RN-04)
  created_at    TIMESTAMPTZ   DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tx_user_date    ON transactions(user_id, transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_tx_user_type    ON transactions(user_id, type);
CREATE INDEX IF NOT EXISTS idx_tx_user_emotion ON transactions(user_id, emotion)
  WHERE emotion IS NOT NULL;
```

### Migration `0004_init_goals.sql`

```sql
CREATE TABLE IF NOT EXISTS goals (
  id              UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name            VARCHAR(150)  NOT NULL,
  emoji           VARCHAR(10)   DEFAULT '🎯',
  target_amount   DECIMAL(12,2) NOT NULL CHECK (target_amount > 0),
  current_amount  DECIMAL(12,2) NOT NULL DEFAULT 0 CHECK (current_amount >= 0),
  deadline        DATE,
  description     TEXT,
  status          VARCHAR(15)   NOT NULL DEFAULT 'activa'
                  CHECK (status IN ('activa', 'completada', 'cancelada')),
  created_at      TIMESTAMPTZ   DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   DEFAULT NOW()
);

-- Historial de aportes a metas (para trazabilidad)
CREATE TABLE IF NOT EXISTS goal_contributions (
  id          UUID          DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id     UUID          NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  amount      DECIMAL(12,2) NOT NULL CHECK (amount > 0),
  note        TEXT,
  created_at  TIMESTAMPTZ   DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_goals_user       ON goals(user_id, status);
CREATE INDEX IF NOT EXISTS idx_contributions_goal ON goal_contributions(goal_id);
```

---

## 12. Auditoría en Vercel Blob

```typescript
type AuditEntry = {
  id: string;
  timestamp: string;
  user_id?: string;       // null para operaciones del sistema
  user_email?: string;
  user_role?: 'usuario' | 'superadmin';
  action:
    | 'login' | 'logout' | 'register'
    | 'create_category' | 'update_category' | 'delete_category'  // (admin solo para globales)
    | 'create_user' | 'toggle_user'
    | 'bootstrap';
  entity: 'category' | 'user' | 'system';
  entity_id?: string;
  summary: string;
  metadata?: Record<string, unknown>;
};
```

> Las transacciones y metas del usuario no se auditan con identidad — son datos privados que no deben quedar en logs con nombre.

---

## 13. Arquitectura de rutas

### Estructura de carpetas

```
app/
  layout.tsx
  page.tsx                         ← Redirige a /dashboard o /login
  login/page.tsx
  register/page.tsx
  dashboard/page.tsx               ← Balance, gráficas, últimas transacciones, metas
  transactions/
    page.tsx                       ← Historial con filtros
    new/page.tsx                   ← Registrar transacción (+ emoción)
    [id]/edit/page.tsx             ← Editar transacción
  goals/
    page.tsx                       ← Listado de metas con progreso
    new/page.tsx                   ← Nueva meta
    [id]/page.tsx                  ← Detalle de meta con historial de aportes
  categories/page.tsx              ← Categorías personales del usuario
  reports/page.tsx                 ← Gráficas de análisis mensual
  emotions/page.tsx                ← Análisis emocional de gastos
  profile/page.tsx                 ← Editar perfil + cambiar contraseña
  admin/
    db-setup/page.tsx
    users/page.tsx
    categories/page.tsx            ← Gestión de categorías globales
    audit/page.tsx

  api/
    system/bootstrap | diagnose | mode
    auth/login | logout | register | me | change-password
    categories/route.ts            ← GET (globales + personales) | POST personal
    categories/[id]/route.ts       ← PUT | DELETE personal
    admin/categories/route.ts      ← POST global (superadmin)
    admin/categories/[id]/route.ts ← PUT | DELETE global (superadmin)
    transactions/
      route.ts                     ← GET historial | POST crear
      [id]/route.ts                ← GET | PUT | DELETE
    balance/route.ts               ← GET balance mensual
    categories/breakdown/route.ts  ← GET torta de categorías
    balance/evolution/route.ts     ← GET evolución diaria
    emotions/analysis/route.ts     ← GET análisis emocional
    goals/
      route.ts                     ← GET | POST
      [id]/route.ts                ← GET | PUT | DELETE
      [id]/contribute/route.ts     ← POST aporte a meta
    dashboard/route.ts
    users/route.ts | [id]/route.ts
    audit/route.ts

components/
  ui/
  layout/                          ← AppLayout, BottomNav (mobile),
                                     SeedModeBanner
  dashboard/                       ← BalanceCard, QuickActions, GoalsSummary,
                                     RecentTransactions, SavingsRate
  transactions/                    ← TransactionForm, EmotionPicker,
                                     TransactionRow, FilterPanel
  goals/                           ← GoalCard, GoalProgressBar,
                                     ContributeModal, GoalForm
  reports/                         ← CategoryPieChart, BalanceLineChart,
                                     EmotionAnalysisCard
  admin/                           ← DiagnosticPanel, BootstrapPanel, AuditViewer

lib/
  dataService.ts | supabase.ts | blobAudit.ts | pgMigrate.ts | seedReader.ts
  auth.ts | withAuth.ts | withRole.ts | types.ts | schemas.ts | dateUtils.ts
```

---

## 14. Requerimientos no funcionales

| ID | Requerimiento |
|---|---|
| RNF-01 | La app es Mobile-First: diseñada primero para 375px y luego para pantallas más grandes. |
| RNF-02 | El dashboard debe cargar en menos de 2 segundos. |
| RNF-03 | El balance se recalcula en el servidor en cada carga — nunca se usa un valor cacheado. |
| RNF-04 | Las contraseñas se hashean con bcrypt. |
| RNF-05 | Las sesiones se gestionan con JWT en cookie HttpOnly. |
| RNF-06 | Los montos se muestran en formato COP por defecto (`$1.234.567`) usando `Intl.NumberFormat`. |
| RNF-07 | Las gráficas de Recharts deben ser legibles en pantallas de 375px. |

---

## 15. Flujos de usuario y de trabajo

### Flujo de bootstrap

Login super admin del seed → banner modo seed → `/admin/db-setup` → ejecutar bootstrap → modo live. El bootstrap inserta las 11 categorías globales predeterminadas.

### Flujo de registro de transacción con emoción

| Paso | Pantalla | Acción |
|---|---|---|
| 1 | Dashboard | El usuario toca "+" (botón central) o el botón rápido "- Gasto". |
| 2 | /transactions/new | Selecciona tipo (gasto/ingreso), categoría, monto, fecha y descripción. |
| 3 | /transactions/new | Hace clic en "Guardar". |
| 4 | Sistema | Guarda la transacción con `emotion=null`. |
| 5 | Modal EmotionPicker | El sistema muestra el modal: "¿Cómo te sentías al hacer este gasto?". 5 opciones con emojis. Botón "Saltar". |
| 6a | Usuario elige emoción | La transacción se actualiza con la emoción elegida. Toast verde. |
| 6b | Usuario salta | La transacción queda sin emoción. Toast verde. |
| 7 | Dashboard | El balance se actualiza automáticamente. |

---

## 16. Diseño de interfaz

### Sistema tipográfico (del spec original)

| Uso | Fuente | Peso |
|---|---|---|
| Títulos de pantalla | **Poppins** | Bold 700 |
| Subtítulos | **Poppins** | SemiBold 600 |
| Cuerpo de texto | **Inter** | Regular 400 |
| Montos y cifras | **Roboto Mono** | Medium 500 |
| Etiquetas pequeñas | **Inter** | Regular 400, 12px |

Todas las fuentes se cargan con `next/font/google`.

### Identidad visual del Login / Registro

| Elemento | Especificación |
|---|---|
| **Layout** | Pantalla completa, formulario centrado. Fondo blanco hueso `#F7F9FC`. |
| **Logo** | SVG de billete estilizado con flecha verde hacia arriba, en verde esmeralda `#00C896`, 52px. |
| **Nombre** | "GoCash" en Poppins Bold 32px, azul marino `#1A2E4A`. |
| **Tagline** | *"Tu dinero, tu ritmo."* Inter Regular 14px, gris suave `#8E8E93`. |
| **Tarjeta del formulario** | Fondo blanco, `border-radius: 16px` (del spec), sombra suave `0 4px 24px rgba(0,0,0,0.08)`. |
| **Campos** | Borde gris suave, focus en verde esmeralda `#00C896`. |
| **Botón principal** | bg `#00C896`, texto blanco, `border-radius: 100px` (pill shape del spec), hover más oscuro. |
| **Links** | "¿Ya tienes cuenta?" / "¿No tienes cuenta?" en verde esmeralda. |
| **Animación** | Framer Motion: `opacity: 0→1`, `y: 12→0`, 0.45s. |

### Paleta de colores (del spec original)

| Elemento | Hex |
|---|---|
| **Verde Esmeralda** (primario) | `#00C896` |
| **Azul Marino Oscuro** (secundario) | `#1A2E4A` |
| **Amarillo Dorado** (acento) | `#FFD166` |
| **Rojo Coral** (peligro/alerta) | `#FF6B6B` |
| **Blanco Hueso** (fondo claro) | `#F7F9FC` |
| **Gris Carbón** (texto principal) | `#1C1C1E` |
| **Gris Suave** (texto secundario) | `#8E8E93` |
| Balance positivo | `#00C896` |
| Balance negativo | `#FF6B6B` |
| Meta completada | `#00C896` + badge dorado |
| Tasa de ahorro | `#00C896` si > 0, `#FF6B6B` si < 0 |
| Banner modo seed | Fondo `#FEF3C7`, texto `#92400E`, borde `#F59E0B` |

### Componentes clave

| Componente | Descripción |
|---|---|
| `BalanceCard` | Tarjeta grande con degradado verde esmeralda → azul marino. Balance total en Roboto Mono grande. Ingresos y gastos del mes debajo. Tasa de ahorro como badge. |
| `QuickActions` | Tres botones pill: "+ Ingreso" (verde), "- Gasto" (coral), "🎯 Meta" (dorado). Siempre visibles en el dashboard. |
| `EmotionPicker` | Modal bottom-sheet (se desliza desde abajo en mobile). 5 opciones en fila: 😊 Feliz, 😌 Tranquilo, 😔 Triste, 😤 Estresado, 🤩 Emocionado. Botón "Saltar" en gris. |
| `TransactionRow` | Fila de transacción: emoji de categoría, descripción, fecha, monto con color (verde para ingreso, coral para gasto), y badge pequeño de emoción si tiene. |
| `GoalCard` | Tarjeta con emoji de la meta, nombre, barra de progreso verde, monto acumulado / objetivo, días restantes (o "Sin fecha límite"). |
| `GoalProgressBar` | Barra de progreso con fill verde esmeralda. Si supera el 100%: se pone dorada y muestra "¡Completada! 🎉". |
| `CategoryPieChart` | Recharts PieChart con los colores de cada categoría. Leyenda debajo. Solo muestra gastos del mes. |
| `BalanceLineChart` | Recharts LineChart con una línea verde del saldo diario acumulado del mes. Si el saldo baja de cero, la línea se vuelve coral. |
| `EmotionAnalysisCard` | Para cada emoción con datos: emoji, nombre, total gastado y porcentaje. Barra horizontal proporcional. La emoción con más gasto aparece destacada. |
| `SavingsRate` | Badge circular: porcentaje de ahorro del mes. Verde si > 15%, amarillo si entre 0–15%, coral si < 0. |

### Diseño responsivo

| Dispositivo | Comportamiento |
|---|---|
| Celular (<768px) | Bottom navigation (5 tabs). Botón "+" central flotante. Cards apiladas en columna. Gráficas con scroll horizontal si es necesario. |
| Tablet (768–1023px) | Sidebar colapsable. Dashboard en 2 columnas. |
| Computador (≥1024px) | Sidebar fijo. Dashboard en 3 columnas. Gráficas lado a lado. |

### Navegación principal (del spec)

```
BARRA DE NAVEGACIÓN INFERIOR
┌────────────────────────────────────────────────────┐
│  🏠 Inicio  │  💸 Gastos  │  ➕  │  🎯 Metas  │  👤 Perfil  │
└────────────────────────────────────────────────────┘
```

El "+" del centro es el botón de acción flotante para registrar transacción rápida.

---

## 17. Plan de fases de implementación

### Fase 1 — Bootstrap, Login, Registro y `dataService` base
> Rol: Ingeniero Fullstack Senior — Arquitecto del sistema y seguridad

| # | Tarea |
|---|---|
| 1.1 | Instalar: `bcryptjs jose @supabase/supabase-js @vercel/blob pg recharts @types/bcryptjs @types/pg` |
| 1.2 | Crear proyecto en Supabase. Blob Store privado. Variables de entorno. |
| 1.3 | Crear `data/seed.json` con super admin y las 11 categorías globales. |
| 1.4 | Crear `supabase/migrations/0001_init_users.sql`. |
| 1.5 | Crear `lib/supabase.ts`, `lib/blobAudit.ts` (getBlobToken lazy, withFileLock, get() del SDK), `lib/pgMigrate.ts`, `lib/seedReader.ts`. |
| 1.6 | Crear `lib/dataService.ts` con `getSystemMode`, auth de usuarios y `recordAudit`. |
| 1.7 | Crear `lib/auth.ts`, `lib/withAuth.ts`, `lib/withRole.ts`. JWT incluye `role`. |
| 1.8 | Crear `next.config.ts` con headers `no-store`. |
| 1.9 | Configurar `next/font/google` con Poppins, Inter y Roboto Mono. Configurar variables CSS de la paleta GoCash en `globals.css`. |
| 1.10 | API Routes: bootstrap, diagnose, mode, login, logout, register, me, change-password. |
| 1.11 | Crear `app/login/page.tsx` y `app/register/page.tsx` con la identidad visual exacta del spec: logo GoCash, paleta verde esmeralda, botones pill, tipografía Poppins. |
| 1.12 | `npm run typecheck` sin errores. Probar: registro → login → cookie HttpOnly → modo seed. |

---

### Fase 2 — Dashboard shell, Layout Mobile-First y bootstrap
> Rol: Diseñador Frontend Obsesivo + Ingeniero de Sistemas

| # | Tarea |
|---|---|
| 2.1 | Crear componentes UI base siguiendo el sistema de diseño de GoCash: botones pill (border-radius 100px), tarjetas con border-radius 16px, sombras suaves. |
| 2.2 | Crear `AppLayout.tsx` Mobile-First: bottom navigation con 5 tabs (Inicio, Gastos, [+], Metas, Perfil). El "+" central es el botón de acción principal. En desktop: sidebar. |
| 2.3 | Crear los componentes `BalanceCard`, `QuickActions`, y `SeedModeBanner`. |
| 2.4 | Crear `/admin/db-setup/page.tsx`. |
| 2.5 | Crear `GET /api/dashboard` en modo seed: retorna estructura vacía con la info del usuario. |
| 2.6 | Crear `app/dashboard/page.tsx` con el layout completo pero con placeholders donde irán las gráficas y los datos reales. La `BalanceCard` muestra $0 como estado inicial. |
| 2.7 | Crear `middleware.ts`: protege rutas privadas, `/admin/*` solo para superadmin. |
| 2.8 | Probar: registro → dashboard con layout correcto en 375px y 1280px → bootstrap. |

---

### Fase 3 — Categorías
> Rol: Ingeniero Fullstack — Catálogo flexible con categorías globales y personales

| # | Tarea |
|---|---|
| 3.1 | Crear `supabase/migrations/0002_init_categories.sql`. Aplicar desde `/admin/db-setup`. El bootstrap inserta las 11 categorías globales del seed. |
| 3.2 | Agregar tipos `Category`, `CreateCategoryRequest` y schemas Zod (RN-07). |
| 3.3 | Extender `dataService`: `getCategories(userId)` (globales + personales), `createCategory` (personal del usuario — user_id != null), `updateCategory`, `deleteCategory` (solo si sin transacciones). Para el admin: `createGlobalCategory`, `updateGlobalCategory`, `deleteGlobalCategory`. |
| 3.4 | API Routes: `GET/POST /api/categories` (usuario), `PUT/DELETE /api/categories/[id]`, `GET/POST/PUT/DELETE /api/admin/categories` (superadmin). |
| 3.5 | Crear `app/categories/page.tsx`: lista de categorías personales + acceso visual a las globales. Formulario de nueva categoría con selector de emoji y color. |
| 3.6 | Crear `app/admin/categories/page.tsx` (superadmin): gestión de categorías globales. |

---

### Fase 4 — Transacciones y Modo Emocional
> Rol: Ingeniero Fullstack + Diseñador Frontend — Flujo central y diferenciador

| # | Tarea |
|---|---|
| 4.1 | Crear `supabase/migrations/0003_init_transactions.sql`. Aplicar desde `/admin/db-setup`. |
| 4.2 | Agregar tipos `Transaction`, `CreateTransactionRequest`, `TransactionFilters` y schemas Zod (RN-02, RN-03). |
| 4.3 | Extender `dataService`: `getTransactions` (con filtros), `createTransaction`, `updateTransaction`, `deleteTransaction`, `getMonthlyBalance`, `getCategoryBreakdown`, `getDailyBalanceEvolution`, `getEmotionAnalysis`. Todas filtran por `user_id` del JWT (RN-05). |
| 4.4 | API Routes: `GET/POST /api/transactions`, `GET/PUT/DELETE /api/transactions/[id]`, `GET /api/balance`, `GET /api/categories/breakdown`, `GET /api/balance/evolution`, `GET /api/emotions/analysis`. |
| 4.5 | Crear `app/transactions/new/page.tsx`: `TransactionForm` con campos tipo, categoría, monto (teclado numérico en mobile), fecha y descripción. Botón "Guardar". |
| 4.6 | Después de guardar: mostrar el `EmotionPicker` como modal bottom-sheet (se desliza desde abajo). Al elegir una emoción, hace PATCH a `/api/transactions/[id]` con la emoción. Al saltar, la transacción queda sin emoción. Toast verde de confirmación. |
| 4.7 | Crear `app/transactions/page.tsx`: historial con filtros. `FilterPanel` con tipo, categoría, rango de fechas y emoción. |
| 4.8 | Crear `app/transactions/[id]/edit/page.tsx`: formulario de edición con el mismo layout del de creación. |
| 4.9 | Integrar el balance mensual real en `BalanceCard`. |
| 4.10 | Verificar RN-01: el balance no se almacena — se calcula. Hacer varias transacciones y verificar que el balance se recalcula correctamente en cada carga. |
| 4.11 | Verificar RN-05: intentar GET /api/transactions de otro usuario con un JWT distinto → 403 o array vacío. |

---

### Fase 5 — Metas Financieras
> Rol: Ingeniero Fullstack + Diseñador Frontend — Metas con progreso y aportes

| # | Tarea |
|---|---|
| 5.1 | Crear `supabase/migrations/0004_init_goals.sql`. Aplicar desde `/admin/db-setup`. |
| 5.2 | Agregar tipos `Goal`, `GoalWithProgress`, `GoalContribution`, `CreateGoalRequest` y schemas Zod. |
| 5.3 | Extender `dataService`: `getGoals`, `getGoalById`, `createGoal`, `updateGoal`, `deleteGoal`, `contributeToGoal` (verifica RN-06 — meta no completada; incrementa `current_amount`; actualiza `status='completada'` si `current_amount >= target_amount`). |
| 5.4 | API Routes: `GET/POST /api/goals`, `GET/PUT/DELETE /api/goals/[id]`, `POST /api/goals/[id]/contribute`. |
| 5.5 | Crear `app/goals/page.tsx`: cuadrícula de `GoalCard` con barra de progreso. Botón "Nueva Meta". |
| 5.6 | Crear `app/goals/new/page.tsx`: formulario con selector de emoji, nombre, monto objetivo, fecha límite (opcional) y descripción. |
| 5.7 | Crear `app/goals/[id]/page.tsx`: detalle con historial de aportes (tabla de `goal_contributions`), barra de progreso grande y botón "Abonar". El botón abre el `ContributeModal` con un input de monto. |
| 5.8 | Cuando `current_amount >= target_amount`: la GoalCard muestra la barra en dorado con "¡Completada! 🎉" y el botón de aporte desaparece (RN-06). |
| 5.9 | Integrar el resumen de metas activas en el dashboard. |

---

### Fase 6 — Reportes y Análisis Emocional
> Rol: Ingeniero Fullstack + Diseñador Frontend — Visualizaciones con Recharts

| # | Tarea |
|---|---|
| 6.1 | Instalar `recharts` (si no está ya instalado desde Fase 1). |
| 6.2 | Crear `app/reports/page.tsx`: selector de mes, `CategoryPieChart` (gastos por categoría), `BalanceLineChart` (evolución diaria del balance). |
| 6.3 | `CategoryPieChart`: Recharts PieChart. Cada slice tiene el color de su categoría. Leyenda con nombre, emoji y monto. Si no hay gastos el mes: empty state. |
| 6.4 | `BalanceLineChart`: Recharts LineChart con el balance acumulado día a día. El stroke cambia de verde a coral si el balance baja de cero (se puede lograr con un gradiente SVG). |
| 6.5 | Crear `app/emotions/page.tsx`: `EmotionAnalysisCard` por cada emoción con datos. Mensaje motivador si el usuario tiene muchos gastos con emociones negativas: "Has registrado varios gastos cuando te sentías estresado/a. ¿Quieres explorar esos patrones?" |
| 6.6 | Integrar las gráficas compactas en el dashboard (versión reducida de la torta y un resumen del análisis emocional). |
| 6.7 | Verificar que las gráficas se ven correctamente en 375px — ajustar tamaño y leyenda si es necesario. |

---

### Fase 7 — Administración y Pulido Final
> Rol: Diseñador Frontend Obsesivo + Ingeniero Fullstack

| # | Tarea |
|---|---|
| 7.1 | API Routes con `withRole(['superadmin'])`: `GET/POST /api/users`, `GET/PUT /api/users/[id]`. POST genera contraseña temporal, `must_change_password=true`, retorna en claro una sola vez. |
| 7.2 | Crear `app/admin/users/page.tsx` y `app/admin/audit/page.tsx`. |
| 7.3 | Crear `app/profile/page.tsx`: nombre, email (solo lectura), moneda preferida y cambio de contraseña. |
| 7.4 | Empty states con el tono emocional de GoCash: |
|     | · Dashboard sin transacciones: "¡Bienvenida, [nombre]! 👋 Empieza registrando tu primer ingreso o gasto." |
|     | · Historial vacío para los filtros: "No encontramos transacciones con esos filtros." |
|     | · Sin metas: "Todavía no tienes metas. ¿Qué sueñas lograr con tu dinero? 🎯" |
|     | · Análisis emocional sin datos: "Empieza a etiquetar tus emociones al registrar gastos para ver tu análisis." |
| 7.5 | Manejo de errores global: 401 (sesión expirada), 403 (sin permisos), 400 (validación), 500. |
| 7.6 | Completar el `getDashboardData`: balance del mes, tasa de ahorro (RN-08), últimas 5 transacciones, metas activas con progreso, resumen emocional. |
| 7.7 | Verificar privacidad (RN-05 y RN-10): el superadmin no puede ver transacciones ni metas individuales. Testear directamente los endpoints. |
| 7.8 | Verificar las gráficas en producción con datos reales. |
| 7.9 | `npm run typecheck`, `npm run lint`, `npm run build` — cero errores. |
| 7.10 | Deploy en Vercel con todas las variables de entorno. |
| 7.11 | Probar en producción: registro → bootstrap → categorías globales visibles → registrar ingresos y gastos → etiquetar emociones → crear meta → abonar → ver reportes → ver análisis emocional. |

---

## 18. Estrategia de seguridad

### Flujo de login

```
1. Validar body con Zod
2. getUserByEmail(email)  ← seed o Postgres
3. Verificar is_active y bcrypt.compare()
4. Si must_change_password: flag en JWT → redirect /profile
5. JWT({ userId, role, email }, 24h) → cookie HttpOnly, Secure, SameSite=Strict
6. Retornar SafeUser
```

### Privacidad de los datos financieros

Todas las queries de transacciones, metas y categorías personales filtran por `user_id = JWT.userId`. El endpoint de dashboard devuelve solo los datos del usuario autenticado. No existe ningún endpoint que devuelva transacciones de otro usuario.

---

## 19. Restricciones y trabajo futuro

### Restricciones de la v1

| ID | Restricción | Descripción |
|---|---|---|
| RS-01 | Web app, no nativa | No hay app móvil nativa en v1. La web es Mobile-First y funciona bien en el browser del celular. |
| RS-02 | Sin GoCash IA | El asistente conversacional requiere integración con una API de lenguaje (v3 de la hoja de ruta). |
| RS-03 | Sin Modo Hogar | Las finanzas compartidas entre dos usuarios quedan para v2. |
| RS-04 | Sin gamificación | GC Points e insignias quedan para v2. |
| RS-05 | Sin modo oscuro | El modo oscuro queda para v3 (diseño completo de tema oscuro). |
| RS-06 | Sin notificaciones push | Los mensajes del ciclo semanal quedan para v2. |
| RS-07 | Sin Open Banking | La sincronización automática con bancos queda para v3. |
| RS-08 | Sin recuperación de contraseña por correo | Solo cambio de contraseña autenticado. Sin Resend en v1. |
| RS-09 | Bootstrap obligatorio | Hasta aplicar migrations + seed, solo permite login del super admin. |

---

## 20. Glosario

| Término | Definición |
|---|---|
| **Balance** | Diferencia entre ingresos totales y gastos totales del usuario. Nunca se almacena — siempre se calcula. |
| **Tasa de ahorro** | `(Ingresos_mes - Gastos_mes) / Ingresos_mes × 100`. |
| **Modo Emocional** | Funcionalidad que permite al usuario registrar su estado emocional al momento de realizar una transacción. |
| **Emoción** | Uno de los 5 estados emocionales que el usuario puede etiquetar: feliz, tranquilo, triste, estresado, emocionado. |
| **Meta financiera** | Objetivo de ahorro con nombre, monto objetivo y progreso rastreado por aportes manuales. |
| **Aporte a meta** | Registro en `goal_contributions` que incrementa el `current_amount` de una meta. |
| **Categoría global** | Categoría creada por el super admin. Disponible para todos los usuarios. `user_id IS NULL`. |
| **Categoría personal** | Categoría creada por un usuario específico. Solo visible para ese usuario. `user_id NOT NULL`. |
| **GC Points** | Sistema de puntos de gamificación. Reservado para v2. |
| **Bootstrap** | Proceso inicial donde el admin aplica migrations y carga el seed. |
| **dataService** | Único punto de acceso a datos. |
| **JWT** | JSON Web Token — credencial firmada en cookie HttpOnly. |
| **Vercel Blob** | Servicio para archivos. Aquí guarda la auditoría de operaciones. |

---

> Última actualización: Mayo 2026
> Valerie Zequeira | Doc: 1065621411
> Curso: Lógica y Programación — SIST0200
