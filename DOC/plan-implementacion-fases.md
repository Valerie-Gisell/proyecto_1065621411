# Plan de Implementación por Fases
## Sistema Fullstack TypeScript · GitHub + Vercel

> **Documento:** Guía de ejecución técnica  
> **Basado en:** Plan de Infraestructura Fullstack v1.0  
> **Metodología:** Entrega incremental — cada fase produce un sistema funcional y desplegado

---

## Tabla de Contenidos

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Mapa de Fases](#2-mapa-de-fases)
3. [Fase 0 — Preparación del Entorno](#3-fase-0--preparación-del-entorno)
4. [Fase 1 — MVP: Hola Mundo](#4-fase-1--mvp-hola-mundo)
5. [Fase 2 — Estructura de Navegación](#5-fase-2--estructura-de-navegación)
6. [Fase 3 — API Routes Tipadas](#6-fase-3--api-routes-tipadas)
7. [Fase 4 — CMS Basado en JSON](#7-fase-4--cms-basado-en-json)
8. [Fase 5 — Migración Opcional a BD Real](#8-fase-5--migración-opcional-a-bd-real)
9. [Criterios de Calidad Transversales](#9-criterios-de-calidad-transversales)
10. [Gestión de Ramas Git por Fase](#10-gestión-de-ramas-git-por-fase)
11. [Estimación de Tiempos](#11-estimación-de-tiempos)
12. [Glosario](#12-glosario)

---

## 1. Resumen Ejecutivo

El plan divide la construcción del sistema en **6 fases secuenciales** (Fase 0 a Fase 5). Cada fase tiene un **objetivo concreto**, una **lista de tareas ordenadas**, los **archivos que se crean o modifican**, y los **criterios de aceptación** que deben cumplirse antes de avanzar a la siguiente.

El principio rector es: **nunca avanzar a la siguiente fase si la anterior no está desplegada y validada en Vercel.**

```
Fase 0 ──► Fase 1 ──► Fase 2 ──► Fase 3 ──► Fase 4 ──► Fase 5
 Setup      MVP       Naveg.      APIs       CMS-JSON    BD Real
           ✅ en      ✅ en       ✅ en       ✅ en      (opcional)
           Vercel    Vercel      Vercel      Vercel
```

---

## 2. Mapa de Fases

| Fase | Nombre | Entregable principal | Prioridad |
|------|--------|---------------------|-----------|
| 0 | Preparación del Entorno | Repo + Vercel vinculados, primer deploy vacío | Crítica |
| 1 | MVP Hola Mundo | Home animado en producción, TypeScript validado | Crítica |
| 2 | Estructura de Navegación | Header, Footer, rutas básicas | Alta |
| 3 | API Routes Tipadas | Endpoints REST con validación Zod | Alta |
| 4 | CMS Basado en JSON | Interfaz admin para editar contenido | Media |
| 5 | Migración a BD Real | Vercel Postgres o PlanetScale | Opcional |

---

## 3. Fase 0 — Preparación del Entorno

### Objetivo
Tener el repositorio GitHub y la cuenta Vercel completamente vinculados, con el proyecto base creado y un primer deploy exitoso (aunque sea una página en blanco).

### Prerequisitos
- [ ] Node.js `>= 20.x` instalado localmente (`node -v`)
- [ ] npm `>= 10.x` instalado (`npm -v`)
- [ ] Git configurado con nombre y correo (`git config --list`)
- [ ] Cuenta GitHub activa con acceso SSH o HTTPS configurado
- [ ] Cuenta Vercel activa vinculada al mismo correo de GitHub

### Tareas

#### 0.1 Crear el repositorio en GitHub
```bash
# En GitHub.com → New Repository
# Nombre: mi-proyecto (o el nombre elegido)
# Visibilidad: Private o Public
# Inicializar con README: NO (lo hará Next.js)
```

#### 0.2 Inicializar el proyecto Next.js
```bash
npx create-next-app@latest mi-proyecto \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir false \
  --import-alias "@/*"

cd mi-proyecto
```

#### 0.3 Configurar TypeScript estricto
Reemplazar el contenido de `tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

#### 0.4 Crear la estructura de carpetas base
```bash
mkdir -p data components/ui components/layout lib .github/workflows
touch data/config.json data/content.json
touch lib/db.ts lib/types.ts
touch .env.example .env.local
```

#### 0.5 Configurar `.gitignore`
Verificar que `.env.local` esté en `.gitignore` (Next.js lo incluye por defecto):
```
.env.local
.env.*.local
.next/
node_modules/
```

#### 0.6 Primer commit y push
```bash
git init
git remote add origin https://github.com/tu-usuario/mi-proyecto.git
git add .
git commit -m "chore: inicializar proyecto Next.js 14 con TypeScript"
git branch -M main
git push -u origin main
```

#### 0.7 Vincular con Vercel
1. Ir a [vercel.com/new](https://vercel.com/new)
2. Seleccionar **Import Git Repository**
3. Elegir el repositorio `mi-proyecto`
4. Vercel detecta Next.js automáticamente — no cambiar nada
5. Agregar variables de entorno:
   - `NEXT_PUBLIC_APP_URL` → `https://mi-proyecto.vercel.app`
   - `NEXT_PUBLIC_APP_VERSION` → `0.1.0`
6. Hacer clic en **Deploy**

#### 0.8 Configurar `next.config.ts`
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;
```

### Archivos creados en esta fase
```
mi-proyecto/
├── .github/workflows/       (carpeta vacía, lista para Fase 1)
├── app/                     (generado por create-next-app)
├── data/
│   ├── config.json          (vacío por ahora)
│   └── content.json         (vacío por ahora)
├── lib/
│   ├── db.ts                (vacío por ahora)
│   └── types.ts             (vacío por ahora)
├── components/
│   ├── ui/                  (carpeta vacía)
│   └── layout/              (carpeta vacía)
├── .env.example
├── .env.local
├── tsconfig.json            ✏️ modificado
└── next.config.ts           ✏️ modificado
```

### Criterios de aceptación
- [ ] `npm run dev` levanta en `http://localhost:3000` sin errores
- [ ] `npm run build` compila exitosamente
- [ ] El repositorio existe en GitHub con al menos un commit
- [ ] Vercel muestra el proyecto como **Active** con URL pública funcional
- [ ] Un push de prueba a `main` genera un nuevo deploy automático en Vercel

---

## 4. Fase 1 — MVP: Hola Mundo

### Objetivo
Implementar y desplegar el Home con el texto "Hola Mundo" centrado, el efecto de animación elegante, y validar que todo el pipeline TypeScript funciona de extremo a extremo.

### Prerequisitos
- [ ] Fase 0 completada y validada
- [ ] Vercel desplegando automáticamente desde `main`

### Tareas

#### 1.1 Poblar los archivos JSON de datos

**`data/config.json`**
```json
{
  "site": {
    "name": "Mi Proyecto",
    "version": "1.0.0",
    "locale": "es-CO",
    "timezone": "America/Bogota"
  },
  "theme": {
    "primaryColor": "#6366f1",
    "fontFamily": "Inter"
  }
}
```

**`data/content.json`**
```json
{
  "home": {
    "headline": "Hola Mundo",
    "subheadline": "Sistema Fullstack TypeScript",
    "description": "Infraestructura validada con Next.js 14, TypeScript estricto y despliegue continuo en Vercel.",
    "badge": "v1.0.0 · En línea"
  }
}
```

#### 1.2 Definir los tipos TypeScript

**`lib/types.ts`**
```typescript
export interface SiteTheme {
  primaryColor: string;
  fontFamily: string;
}

export interface SiteInfo {
  name: string;
  version: string;
  locale: string;
  timezone: string;
}

export interface SiteConfig {
  site: SiteInfo;
  theme: SiteTheme;
}

export interface HomeContent {
  headline: string;
  subheadline: string;
  description: string;
  badge: string;
}

export interface SiteContent {
  home: HomeContent;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface HealthStatus {
  status: "ok" | "degraded" | "down";
  version: string;
  environment: string;
}
```

#### 1.3 Crear la utilidad de acceso a datos

**`lib/db.ts`**
```typescript
import fs from "fs";
import path from "path";
import type { SiteConfig, SiteContent } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");

export function readJSON<T>(filename: string): T {
  const filePath = path.join(DATA_DIR, `${filename}.json`);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

export function getConfig(): SiteConfig {
  return readJSON<SiteConfig>("config");
}

export function getContent(): SiteContent {
  return readJSON<SiteContent>("content");
}
```

#### 1.4 Instalar Framer Motion
```bash
npm install framer-motion
```

#### 1.5 Crear el componente HelloWorld

**`components/ui/HelloWorld.tsx`**
```typescript
"use client";

import { motion } from "framer-motion";
import type { HomeContent } from "@/lib/types";

interface Props {
  content: HomeContent;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.2, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.25, 0.46, 0.45, 0.94] },
  },
};

export default function HelloWorld({ content }: Props) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-900">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        className="relative z-10 text-center px-8 max-w-2xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.div variants={itemVariants}>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {content.badge}
          </span>
        </motion.div>

        <motion.h1
          variants={itemVariants}
          className="text-7xl md:text-8xl font-bold tracking-tight text-white mb-6"
        >
          {content.headline}
        </motion.h1>

        <motion.h2
          variants={itemVariants}
          className="text-2xl font-semibold text-indigo-300 mb-4"
        >
          {content.subheadline}
        </motion.h2>

        <motion.p
          variants={itemVariants}
          className="text-slate-400 text-lg leading-relaxed"
        >
          {content.description}
        </motion.p>

        <motion.div
          variants={itemVariants}
          className="mt-12 flex items-center justify-center gap-3"
        >
          <span className="h-px w-16 bg-gradient-to-r from-transparent to-indigo-500" />
          <span className="text-indigo-500 text-xs font-mono tracking-widest uppercase">
            TypeScript · Next.js 14
          </span>
          <span className="h-px w-16 bg-gradient-to-l from-transparent to-indigo-500" />
        </motion.div>
      </motion.div>
    </main>
  );
}
```

#### 1.6 Actualizar la página principal

**`app/page.tsx`**
```typescript
import { getContent } from "@/lib/db";
import HelloWorld from "@/components/ui/HelloWorld";
import type { SiteContent } from "@/lib/types";

export default function HomePage() {
  const content: SiteContent = getContent();
  return <HelloWorld content={content.home} />;
}
```

#### 1.7 Actualizar el layout raíz

**`app/layout.tsx`**
```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "Mi Proyecto — Fullstack TypeScript",
  description: "Sistema fullstack con Next.js 14 y TypeScript",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={inter.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
```

#### 1.8 Crear el endpoint de salud

**`app/api/health/route.ts`**
```typescript
import { NextResponse } from "next/server";
import type { ApiResponse, HealthStatus } from "@/lib/types";

export function GET(): NextResponse<ApiResponse<HealthStatus>> {
  return NextResponse.json({
    success: true,
    data: {
      status: "ok",
      version: process.env.NEXT_PUBLIC_APP_VERSION ?? "unknown",
      environment: process.env.NODE_ENV,
    },
    timestamp: new Date().toISOString(),
  });
}
```

#### 1.9 Agregar GitHub Actions para CI

**`.github/workflows/ci.yml`**
```yaml
name: CI — TypeScript & Lint

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci
      - run: npm run type-check
      - run: npm run lint
      - run: npm run build
```

#### 1.10 Agregar scripts al `package.json`
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "format": "prettier --write ."
  }
}
```

#### 1.11 Commit y deploy
```bash
git add .
git commit -m "feat(fase-1): home Hola Mundo con animación y TypeScript validado"
git push origin main
```

### Archivos creados / modificados en esta fase
```
✅ data/config.json          poblado
✅ data/content.json         poblado
✅ lib/types.ts              implementado
✅ lib/db.ts                 implementado
✅ components/ui/HelloWorld.tsx   creado
✅ app/page.tsx              actualizado
✅ app/layout.tsx            actualizado
✅ app/globals.css           actualizado
✅ app/api/health/route.ts   creado
✅ .github/workflows/ci.yml  creado
✅ package.json              scripts actualizados
```

### Criterios de aceptación
- [ ] Home muestra "Hola Mundo" centrado con animación de aparición
- [ ] El efecto blur + fade + slide funciona en todos los elementos
- [ ] `GET /api/health` responde `{ success: true, data: { status: "ok" } }`
- [ ] `npm run type-check` pasa sin errores
- [ ] `npm run lint` pasa sin advertencias
- [ ] GitHub Actions ejecuta y pasa en el push a `main`
- [ ] Vercel despliega correctamente con URL pública funcional
- [ ] El sitio se ve correctamente en mobile y desktop

---

## 5. Fase 2 — Estructura de Navegación

### Objetivo
Implementar Header, Footer y las rutas base del sitio (`/`, `/about`, `/contact`). El contenido de cada página se sirve desde los archivos JSON en `/data`.

### Prerequisitos
- [ ] Fase 1 completada y desplegada en Vercel

### Tareas

#### 2.1 Extender los tipos
Agregar a `lib/types.ts`:
```typescript
export interface NavItem {
  label: string;
  href: string;
}

export interface AboutContent {
  title: string;
  body: string;
}

export interface ContactContent {
  title: string;
  email: string;
  message: string;
}

export interface SiteContent {
  home: HomeContent;
  about: AboutContent;       // nuevo
  contact: ContactContent;   // nuevo
  nav: NavItem[];            // nuevo
}
```

#### 2.2 Extender `data/content.json`
```json
{
  "home": { ... },
  "nav": [
    { "label": "Inicio", "href": "/" },
    { "label": "Acerca de", "href": "/about" },
    { "label": "Contacto", "href": "/contact" }
  ],
  "about": {
    "title": "Acerca del Proyecto",
    "body": "Sistema fullstack construido con Next.js 14, TypeScript y despliegue continuo en Vercel."
  },
  "contact": {
    "title": "Contacto",
    "email": "hola@mi-proyecto.com",
    "message": "¿Tienes alguna pregunta? Escríbenos."
  }
}
```

#### 2.3 Crear el componente Header
**`components/layout/Header.tsx`**
- Logo / nombre del sitio
- Links de navegación tipados desde `NavItem[]`
- Estado activo del link actual con `usePathname()`

#### 2.4 Crear el componente Footer
**`components/layout/Footer.tsx`**
- Nombre del sitio, versión y año
- Datos desde `SiteConfig`

#### 2.5 Crear el PageWrapper
**`components/layout/PageWrapper.tsx`**
- Envuelve `<Header>` + `{children}` + `<Footer>`
- Centrado y espaciado consistente

#### 2.6 Actualizar el layout raíz
**`app/layout.tsx`**
- Importar y usar `PageWrapper`
- Pasar `config` y `nav` como props desde `getConfig()` / `getContent()`

#### 2.7 Crear las nuevas páginas
```
app/
├── about/
│   └── page.tsx         → Lee content.about desde JSON
└── contact/
    └── page.tsx         → Lee content.contact desde JSON
```

#### 2.8 Commit y deploy
```bash
git add .
git commit -m "feat(fase-2): navegación, header, footer y rutas /about /contact"
git push origin main
```

### Criterios de aceptación
- [ ] Header visible en todas las páginas con links funcionales
- [ ] Footer visible en todas las páginas
- [ ] Rutas `/about` y `/contact` renderizan contenido desde JSON
- [ ] El link activo en el Header se resalta correctamente
- [ ] Sin errores de TypeScript ni ESLint
- [ ] Deploy en Vercel exitoso

---

## 6. Fase 3 — API Routes Tipadas

### Objetivo
Exponer los datos de `/data` mediante endpoints REST bien tipados y validados con **Zod**, listos para ser consumidos por el frontend u otros clientes.

### Prerequisitos
- [ ] Fase 2 completada y desplegada en Vercel

### Tareas

#### 3.1 Instalar Zod
```bash
npm install zod
```

#### 3.2 Crear esquemas de validación
**`lib/schemas.ts`**
```typescript
import { z } from "zod";

export const HomeContentSchema = z.object({
  headline: z.string().min(1),
  subheadline: z.string().min(1),
  description: z.string().min(1),
  badge: z.string().min(1),
});

export const SiteConfigSchema = z.object({
  site: z.object({
    name: z.string(),
    version: z.string(),
    locale: z.string(),
    timezone: z.string(),
  }),
  theme: z.object({
    primaryColor: z.string(),
    fontFamily: z.string(),
  }),
});
```

#### 3.3 Actualizar `lib/db.ts` con validación
```typescript
export function readJSONValidated<T>(filename: string, schema: ZodSchema<T>): T {
  const raw = readJSON<unknown>(filename);
  return schema.parse(raw); // lanza ZodError si el JSON es inválido
}
```

#### 3.4 Crear los endpoints REST

```
app/api/
├── health/route.ts         ✅ ya existe
├── content/
│   ├── route.ts            GET /api/content → todo el JSON
│   └── home/
│       └── route.ts        GET /api/content/home → solo home
├── config/
│   └── route.ts            GET /api/config → config del sitio
```

Estructura de respuesta estandarizada para todos los endpoints:
```typescript
// Éxito
{ success: true, data: T, timestamp: string }

// Error
{ success: false, error: string, timestamp: string }
```

#### 3.5 Agregar middleware de manejo de errores
**`lib/api-utils.ts`**
```typescript
import { NextResponse } from "next/server";
import type { ApiResponse } from "./types";

export function successResponse<T>(data: T): NextResponse<ApiResponse<T>> {
  return NextResponse.json({
    success: true,
    data,
    timestamp: new Date().toISOString(),
  });
}

export function errorResponse(
  message: string,
  status = 500
): NextResponse<ApiResponse<never>> {
  return NextResponse.json(
    { success: false, error: message, timestamp: new Date().toISOString() },
    { status }
  );
}
```

#### 3.6 Commit y deploy
```bash
git add .
git commit -m "feat(fase-3): api routes tipadas con Zod, endpoints /api/content y /api/config"
git push origin main
```

### Criterios de aceptación
- [ ] `GET /api/health` → `200 OK`
- [ ] `GET /api/content` → JSON con todo el contenido
- [ ] `GET /api/content/home` → JSON solo con la sección home
- [ ] `GET /api/config` → JSON con la configuración del sitio
- [ ] Un JSON malformado en `/data` produce un error legible (no un 500 genérico)
- [ ] Todos los endpoints tienen tipos de retorno explícitos en TypeScript
- [ ] Sin errores de TypeScript ni ESLint

---

## 7. Fase 4 — CMS Basado en JSON

### Objetivo
Crear una interfaz de administración local (protegida) que permita editar el contenido de los archivos JSON desde el navegador durante el desarrollo, sin necesidad de editar los archivos manualmente.

### Prerequisitos
- [ ] Fase 3 completada y desplegada en Vercel
- [ ] Comprensión clara de que las **escrituras solo funcionan en desarrollo local** (Vercel es read-only en producción)

### Tareas

#### 4.1 Proteger la ruta de admin
**`middleware.ts`** en la raíz:
```typescript
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (process.env.NODE_ENV === "production") {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }
  return NextResponse.next();
}
```

#### 4.2 Crear el endpoint de escritura
**`app/api/admin/content/route.ts`**
```typescript
// Solo disponible en desarrollo
// PUT /api/admin/content → sobreescribe data/content.json
import { writeFileSync } from "fs";
import path from "path";

export async function PUT(request: Request) {
  if (process.env.NODE_ENV === "production") {
    return Response.json({ error: "No disponible en producción" }, { status: 403 });
  }
  const body = await request.json();
  const filePath = path.join(process.cwd(), "data", "content.json");
  writeFileSync(filePath, JSON.stringify(body, null, 2), "utf-8");
  return Response.json({ success: true });
}
```

#### 4.3 Crear la interfaz de administración
```
app/admin/
├── layout.tsx      → Layout minimalista con aviso "Solo desarrollo"
├── page.tsx        → Dashboard con links a las secciones
└── content/
    └── page.tsx    → Formularios para editar content.json
```

#### 4.4 Agregar script de validación de esquema JSON
**`scripts/validate-data.ts`**
```typescript
// Ejecutar con: npx ts-node scripts/validate-data.ts
// Valida que todos los .json en /data cumplen sus esquemas Zod
```

Agregar a `package.json`:
```json
"validate:data": "npx ts-node scripts/validate-data.ts"
```

#### 4.5 Agregar hook pre-commit
**`.github/hooks/pre-commit`** o con `husky`:
```bash
npm install -D husky
npx husky init
echo "npm run validate:data && npm run type-check" > .husky/pre-commit
```

#### 4.6 Commit y deploy
```bash
git add .
git commit -m "feat(fase-4): CMS local para edición de JSON, protección de ruta /admin en producción"
git push origin main
```

### Criterios de aceptación
- [ ] `/admin` redirige a `/` en producción (Vercel)
- [ ] `/admin` es accesible en `localhost:3000/admin`
- [ ] Los formularios en `/admin/content` cargan el JSON actual
- [ ] Al guardar desde el admin, el JSON se actualiza en disco
- [ ] `npm run validate:data` detecta JSONs malformados
- [ ] El hook pre-commit bloquea commits con datos inválidos

---

## 8. Fase 5 — Migración Opcional a BD Real

### Objetivo
Cuando el sistema requiera escrituras en producción o datos que no deban vivir en el repositorio, migrar la capa de datos a **Vercel Postgres** (o PlanetScale / Turso) sin modificar los componentes ni las páginas.

### Prerequisitos
- [ ] Fase 4 completada
- [ ] Necesidad real identificada de escrituras en producción
- [ ] Esta fase es **completamente opcional** si el sistema funciona bien con JSON

### Estrategia de migración sin romper el sistema

La clave es que `lib/db.ts` actúa como la **única puerta de acceso a los datos**. Los componentes y páginas nunca importan directamente de `/data`, solo de `lib/db.ts`. Esto significa que la migración solo requiere modificar ese archivo.

```typescript
// ANTES (Fase 1-4): Lee del sistema de archivos
export function getContent(): SiteContent {
  return readJSON<SiteContent>("content");
}

// DESPUÉS (Fase 5): Lee de la base de datos
export async function getContent(): Promise<SiteContent> {
  const rows = await db.query("SELECT * FROM content WHERE key = 'home'");
  return mapRowsToContent(rows);
}
```

### Tareas

#### 5.1 Elegir el motor de base de datos

| Opción | Cuándo usarla |
|--------|---------------|
| Vercel Postgres | Proyecto 100% en Vercel, sencillo de configurar |
| PlanetScale | Si se necesita escalar, con branching de esquemas |
| Turso (SQLite en el edge) | Latencia ultra-baja, ideal para datos de lectura |
| Upstash Redis | Si el caso de uso es caché o datos de sesión |

#### 5.2 Instalar el cliente de BD (ejemplo con Vercel Postgres)
```bash
npm install @vercel/postgres
```

#### 5.3 Crear el esquema SQL inicial
**`scripts/schema.sql`**
```sql
CREATE TABLE IF NOT EXISTS content (
  id SERIAL PRIMARY KEY,
  section VARCHAR(50) NOT NULL UNIQUE,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS config (
  id SERIAL PRIMARY KEY,
  key VARCHAR(50) NOT NULL UNIQUE,
  value JSONB NOT NULL
);
```

#### 5.4 Script de migración de JSON a BD
**`scripts/migrate-json-to-db.ts`**
```typescript
// Lee todos los JSON de /data y los inserta en la BD
// Se ejecuta una sola vez: npx ts-node scripts/migrate-json-to-db.ts
```

#### 5.5 Actualizar `lib/db.ts` para leer de la BD
Mantener la firma de las funciones idéntica para no romper los consumidores:
```typescript
export async function getContent(): Promise<SiteContent> { ... }
export async function getConfig(): Promise<SiteConfig> { ... }
```

#### 5.6 Actualizar los consumidores a async/await
Todos los Server Components y API Routes que llamen a `getContent()` o `getConfig()` necesitarán `await`:
```typescript
// app/page.tsx
export default async function HomePage() {
  const content = await getContent(); // ahora es async
  return <HelloWorld content={content.home} />;
}
```

#### 5.7 Commit y deploy
```bash
git add .
git commit -m "feat(fase-5): migración de capa de datos de JSON a Vercel Postgres"
git push origin main
```

### Criterios de aceptación
- [ ] Todos los datos se leen correctamente desde la BD en producción
- [ ] Las páginas y componentes no cambiaron (solo `lib/db.ts`)
- [ ] Sin errores de TypeScript después de los cambios
- [ ] Los JSON en `/data` se mantienen como respaldo y fuente de verdad inicial
- [ ] El endpoint `/api/health` refleja el estado de la conexión a BD

---

## 9. Criterios de Calidad Transversales

Estos criterios aplican en **todas las fases**, no solo al final:

### TypeScript
- `strict: true` habilitado siempre, sin excepciones
- Prohibido el uso de `any` — usar `unknown` cuando el tipo no se conoce
- Todas las funciones con parámetros y retornos tipados explícitamente
- Los tipos viven en `lib/types.ts`, no dispersos por el código

### Git
- Un commit por tarea significativa, mensajes en formato `tipo(alcance): descripción`
- Tipos de commit válidos: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`
- Nunca commitear: `.env.local`, `.next/`, `node_modules/`
- Cada fase completa se etiqueta: `git tag v0.1.0` (Fase 0), `v1.0.0` (Fase 1), etc.

### Vercel
- Cada push a `main` debe resultar en un deploy exitoso
- Los deploys fallidos se investigan antes de continuar
- Las variables de entorno se actualizan en Vercel **antes** de hacer push del código que las necesita

### Código
- Los componentes de servidor nunca tienen `"use client"`
- Los componentes de cliente nunca importan de `lib/db.ts`
- Los JSON de `/data` nunca se importan directamente en componentes — siempre a través de `lib/db.ts`

---

## 10. Gestión de Ramas Git por Fase

```
main
 │
 ├── feat/fase-0-setup          → merge a main al completar Fase 0
 ├── feat/fase-1-hola-mundo     → merge a main al completar Fase 1
 ├── feat/fase-2-navegacion     → merge a main al completar Fase 2
 ├── feat/fase-3-api-routes     → merge a main al completar Fase 3
 ├── feat/fase-4-cms-json       → merge a main al completar Fase 4
 └── feat/fase-5-bd-real        → merge a main al completar Fase 5
```

**Flujo de trabajo por fase:**
```bash
# Iniciar nueva fase
git checkout main
git pull origin main
git checkout -b feat/fase-X-nombre

# Trabajar...
git add .
git commit -m "feat(fase-X): descripción"

# Al terminar y validar localmente
git push origin feat/fase-X-nombre
# → Vercel crea una Preview URL para validar
# → Si todo está bien, merge a main (PR o directo)
git checkout main
git merge feat/fase-X-nombre
git push origin main
# → Vercel despliega a producción
git tag vX.0.0
git push origin vX.0.0
```

---

## 11. Estimación de Tiempos

| Fase | Nombre | Estimado (desarrollador solo) |
|------|--------|-------------------------------|
| 0 | Preparación del Entorno | 1 – 2 horas |
| 1 | MVP Hola Mundo | 2 – 4 horas |
| 2 | Estructura de Navegación | 3 – 5 horas |
| 3 | API Routes Tipadas | 4 – 6 horas |
| 4 | CMS Basado en JSON | 6 – 10 horas |
| 5 | Migración a BD Real | 8 – 16 horas |
| **Total** | | **24 – 43 horas** |

> Los tiempos incluyen implementación, pruebas locales y validación del deploy en Vercel. No incluyen diseño visual avanzado ni requisitos de negocio adicionales.

---

## 12. Glosario

| Término | Definición |
|---------|-----------|
| **App Router** | Sistema de enrutamiento de Next.js 14 basado en la carpeta `/app` |
| **RSC** | React Server Component — se ejecuta en el servidor, sin JavaScript en el cliente |
| **API Route** | Endpoint HTTP creado con archivos `route.ts` dentro de `/app/api/` |
| **JSON como BD** | Archivos `.json` en `/data` que actúan como colecciones de datos versionadas en Git |
| **Vercel** | Plataforma de despliegue con integración nativa para Next.js y GitHub |
| **Zod** | Librería de validación de esquemas TypeScript-first |
| **strict mode** | Configuración de TypeScript que activa todas las verificaciones de tipos más estrictas |
| **Preview URL** | URL temporal generada por Vercel para cada rama o Pull Request |
| **CI/CD** | Integración y despliegue continuo — el código se valida y despliega automáticamente |
| **read-only filesystem** | Limitación de Vercel en producción que impide escribir archivos en el servidor |

---

*Plan de Implementación por Fases v1.0 — Basado en Plan de Infraestructura Fullstack TypeScript*
