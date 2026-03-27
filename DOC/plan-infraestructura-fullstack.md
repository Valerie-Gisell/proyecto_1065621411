# Plan de Infraestructura — Fullstack TypeScript con GitHub + Vercel

> **Arquitecto:** Plan de referencia v1.0  
> **Stack:** Next.js 14 · TypeScript · Vercel · JSON como base de datos  
> **Objetivo inicial:** Home "Hola Mundo" con efecto elegante para validar el stack

---

## Tabla de Contenidos

1. [Visión General](#1-visión-general)
2. [Arquitectura del Sistema](#2-arquitectura-del-sistema)
3. [Estructura del Repositorio](#3-estructura-del-repositorio)
4. [Capa de Datos (JSON como BD)](#4-capa-de-datos-json-como-bd)
5. [Stack Tecnológico](#5-stack-tecnológico)
6. [Configuración del Entorno](#6-configuración-del-entorno)
7. [Pipeline CI/CD — GitHub → Vercel](#7-pipeline-cicd--github--vercel)
8. [Implementación del Home "Hola Mundo"](#8-implementación-del-home-hola-mundo)
9. [Tipado y Contratos TypeScript](#9-tipado-y-contratos-typescript)
10. [Variables de Entorno](#10-variables-de-entorno)
11. [Checklist de Validación](#11-checklist-de-validación)
12. [Hoja de Ruta Futura](#12-hoja-de-ruta-futura)

---

## 1. Visión General

El sistema es una aplicación **fullstack** construida sobre **Next.js 14 (App Router)** con **TypeScript estricto**. No utiliza una base de datos relacional ni NoSQL tradicional; en su lugar, maneja la persistencia mediante **archivos `.json` dentro de la carpeta `/data`**, accedidos desde las **API Routes de Next.js** en el servidor.

El despliegue es continuo: cada push a la rama `main` en GitHub dispara automáticamente un nuevo deploy en **Vercel**, garantizando que producción siempre refleje el estado del repositorio.

```
Desarrollador → GitHub (push) → Vercel (build + deploy) → URL pública
                                       ↑
                              Next.js 14 + TypeScript
                              /data/*.json  (pseudo-BD)
```

---

## 2. Arquitectura del Sistema

```
┌──────────────────────────────────────────────────────────────┐
│                        CLIENTE (Browser)                      │
│   Next.js App Router · React Server Components · Tailwind    │
└────────────────────────────┬─────────────────────────────────┘
                             │ HTTP / RSC Streaming
┌────────────────────────────▼─────────────────────────────────┐
│                     SERVIDOR (Vercel Edge/Node)               │
│                                                               │
│   ┌─────────────────┐        ┌──────────────────────────┐    │
│   │  App Router      │        │  API Routes (/api/*)     │    │
│   │  /app/page.tsx   │        │  Lectura/escritura JSON  │    │
│   └─────────────────┘        └──────────┬───────────────┘    │
│                                         │                      │
│                              ┌──────────▼───────────────┐    │
│                              │   /data/*.json            │    │
│                              │   (Capa de persistencia)  │    │
│                              └──────────────────────────┘    │
└──────────────────────────────────────────────────────────────┘
```

> **Nota de arquitectura:** En Vercel, el sistema de archivos es de solo lectura en producción. Las **escrituras a `/data`** solo son viables en entorno de desarrollo local o usando Vercel Functions con almacenamiento externo en fases posteriores. Para el MVP y fases iniciales, `/data` actúa como **fuente de datos estática** que se versiona en el repositorio.

---

## 3. Estructura del Repositorio

```
mi-proyecto/
│
├── .github/
│   └── workflows/
│       └── ci.yml                  # (Opcional) lint + type-check antes del merge
│
├── app/                            # Next.js App Router
│   ├── layout.tsx                  # Layout raíz con metadatos globales
│   ├── page.tsx                    # Home — "Hola Mundo"
│   ├── globals.css                 # Estilos globales + variables CSS
│   └── api/
│       └── health/
│           └── route.ts            # Endpoint de salud del sistema
│
├── components/
│   ├── ui/
│   │   └── HelloWorld.tsx          # Componente principal del Home
│   └── layout/
│       └── PageWrapper.tsx         # Contenedor con centrado global
│
├── data/                           # 📁 Base de datos JSON
│   ├── config.json                 # Configuración general del sitio
│   └── content.json                # Contenido de la página Home
│
├── lib/
│   ├── db.ts                       # Utilidad para leer archivos JSON
│   └── types.ts                    # Tipos e interfaces globales TypeScript
│
├── public/
│   └── favicon.ico
│
├── .env.local                      # Variables de entorno locales (NO commitear)
├── .env.example                    # Plantilla de variables de entorno
├── .gitignore
├── next.config.ts                  # Configuración de Next.js
├── tailwind.config.ts              # Configuración de Tailwind CSS
├── tsconfig.json                   # Configuración TypeScript estricta
├── package.json
└── README.md
```

---

## 4. Capa de Datos (JSON como BD)

### 4.1 Filosofía

Los archivos en `/data` reemplazan a una base de datos tradicional. Cada archivo representa una **colección** o **entidad** del dominio. Se acceden **exclusivamente desde el servidor** (API Routes o Server Components) para evitar exponer datos sensibles al cliente.

### 4.2 Archivos iniciales

**`/data/config.json`** — Configuración del sitio
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

**`/data/content.json`** — Contenido de páginas
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

### 4.3 Utilidad de acceso `/lib/db.ts`

```typescript
import fs from "fs";
import path from "path";

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

> Esta función **solo puede usarse en el servidor** (Server Components, API Routes). Nunca importarla en componentes de cliente.

---

## 5. Stack Tecnológico

| Capa | Tecnología | Versión | Justificación |
|------|-----------|---------|--------------|
| Framework | Next.js | 14.x (App Router) | SSR, RSC, API Routes integradas |
| Lenguaje | TypeScript | 5.x (strict) | Tipado estático, autocompletado, contratos |
| Estilos | Tailwind CSS | 3.x | Utilidades CSS, diseño consistente |
| Animaciones | Framer Motion | 11.x | Efectos elegantes declarativos |
| Fuentes | next/font (Google) | — | Optimización automática de fuentes |
| Linting | ESLint + Prettier | — | Calidad y formato de código |
| CI/CD | Vercel + GitHub | — | Deploy automático por push |
| Datos | JSON files | — | Persistencia sin base de datos externa |

---

## 6. Configuración del Entorno

### 6.1 Requisitos previos

- Node.js `>= 20.x`
- npm `>= 10.x` o pnpm `>= 9.x`
- Cuenta en [GitHub](https://github.com)
- Cuenta en [Vercel](https://vercel.com) vinculada al repositorio GitHub

### 6.2 Inicialización del proyecto

```bash
# 1. Crear el proyecto con Next.js y TypeScript
npx create-next-app@latest mi-proyecto \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir false \
  --import-alias "@/*"

cd mi-proyecto

# 2. Instalar dependencias adicionales
npm install framer-motion
npm install -D prettier eslint-config-prettier

# 3. Crear la carpeta de datos
mkdir data
touch data/config.json data/content.json
```

### 6.3 `tsconfig.json` — Configuración estricta

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

### 6.4 `next.config.ts`

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;
```

---

## 7. Pipeline CI/CD — GitHub → Vercel

### 7.1 Flujo de despliegue

```
git push origin main
        │
        ▼
  GitHub recibe el push
        │
        ▼
  Vercel detecta el evento (webhook)
        │
        ▼
  Vercel ejecuta: npm run build
        │
        ├── TypeScript type-check
        ├── ESLint
        ├── Compilación Next.js
        └── Generación de assets estáticos
        │
        ▼
  Deploy a producción → URL pública
```

### 7.2 Vinculación GitHub → Vercel (pasos)

1. Ir a [vercel.com/new](https://vercel.com/new)
2. Seleccionar **"Import Git Repository"**
3. Autorizar acceso a GitHub y elegir el repositorio
4. Vercel detecta automáticamente que es un proyecto **Next.js**
5. Configurar variables de entorno (ver sección 10)
6. Hacer clic en **Deploy**
7. A partir de ahora, cada `push` a `main` genera un deploy automático
8. Cada Pull Request genera un **Preview URL** independiente

### 7.3 Ramas y entornos

| Rama | Entorno | URL |
|------|---------|-----|
| `main` | Producción | `mi-proyecto.vercel.app` |
| `develop` | Preview | `mi-proyecto-git-develop-*.vercel.app` |
| `feature/*` | Preview | URL única por PR |

### 7.4 GitHub Actions — Type Check (opcional pero recomendado)

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
```

**`package.json` — scripts requeridos:**

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

---

## 8. Implementación del Home "Hola Mundo"

### 8.1 Layout raíz — `app/layout.tsx`

```typescript
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

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

### 8.2 Página principal — `app/page.tsx`

```typescript
import { getContent } from "@/lib/db";
import HelloWorld from "@/components/ui/HelloWorld";
import type { SiteContent } from "@/lib/types";

export default function HomePage() {
  // Ejecutado en el servidor — accede directamente al JSON
  const content: SiteContent = getContent();

  return <HelloWorld content={content.home} />;
}
```

### 8.3 Componente animado — `components/ui/HelloWorld.tsx`

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
      {/* Glow de fondo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        className="relative z-10 text-center px-8 max-w-2xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div variants={itemVariants}>
          <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-sm font-medium mb-8">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            {content.badge}
          </span>
        </motion.div>

        {/* Título principal */}
        <motion.h1
          variants={itemVariants}
          className="text-7xl md:text-8xl font-bold tracking-tight text-white mb-6"
        >
          {content.headline}
        </motion.h1>

        {/* Subtítulo */}
        <motion.h2
          variants={itemVariants}
          className="text-2xl font-semibold text-indigo-300 mb-4"
        >
          {content.subheadline}
        </motion.h2>

        {/* Descripción */}
        <motion.p
          variants={itemVariants}
          className="text-slate-400 text-lg leading-relaxed"
        >
          {content.description}
        </motion.p>

        {/* Separador decorativo */}
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

### 8.4 Estilos globales — `app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --font-inter: "Inter", sans-serif;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  scroll-behavior: smooth;
}

body {
  font-family: var(--font-inter);
  background-color: #020617; /* slate-950 */
  color: #f8fafc;
}
```

---

## 9. Tipado y Contratos TypeScript

**`/lib/types.ts`** — Todos los tipos del sistema en un solo lugar

```typescript
// ─── Configuración del sitio ───────────────────────────────
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

// ─── Contenido de páginas ──────────────────────────────────
export interface HomeContent {
  headline: string;
  subheadline: string;
  description: string;
  badge: string;
}

export interface SiteContent {
  home: HomeContent;
}

// ─── API Responses ─────────────────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

// ─── Health Check ──────────────────────────────────────────
export interface HealthStatus {
  status: "ok" | "degraded" | "down";
  version: string;
  environment: string;
}
```

---

## 10. Variables de Entorno

**`.env.example`** (commitear al repo)

```env
# Entorno de ejecución
NODE_ENV=development

# URL base de la aplicación
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Versión de la app (se puede inyectar desde CI)
NEXT_PUBLIC_APP_VERSION=1.0.0
```

**`.env.local`** (NO commitear — solo local)

```env
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_VERSION=1.0.0-local
```

### Configuración en Vercel

En el dashboard de Vercel → Settings → Environment Variables:

| Variable | Valor | Entorno |
|----------|-------|---------|
| `NEXT_PUBLIC_APP_URL` | `https://mi-proyecto.vercel.app` | Production |
| `NEXT_PUBLIC_APP_VERSION` | `1.0.0` | Production |
| `NODE_ENV` | `production` | Production |

> Las variables con prefijo `NEXT_PUBLIC_` son expuestas al cliente. Las variables sin prefijo solo están disponibles en el servidor.

---

## 11. Checklist de Validación

### Entorno local

- [ ] `npm run dev` levanta sin errores en `http://localhost:3000`
- [ ] La página Home muestra "Hola Mundo" centrado con animación
- [ ] `npm run type-check` pasa sin errores TypeScript
- [ ] `npm run lint` pasa sin advertencias
- [ ] `npm run build` compila exitosamente
- [ ] Los archivos `/data/*.json` son leídos correctamente por el servidor
- [ ] El componente cliente (`"use client"`) recibe props tipadas del servidor

### Vercel / Producción

- [ ] El repositorio está vinculado a Vercel
- [ ] El primer deploy manual fue exitoso
- [ ] Las variables de entorno están configuradas en Vercel
- [ ] Un `git push` a `main` dispara un deploy automático
- [ ] La URL pública muestra la página correctamente
- [ ] Los metadatos (`<title>`, descripción) son correctos en producción
- [ ] No hay errores en los logs de Vercel

### TypeScript

- [ ] `strict: true` habilitado en `tsconfig.json`
- [ ] Todos los componentes tienen tipos explícitos en sus props
- [ ] No existen usos de `any` en el código fuente
- [ ] Las funciones de acceso a JSON tienen tipos de retorno definidos

---

## 12. Hoja de Ruta Futura

Una vez validado el MVP "Hola Mundo", el sistema puede evolucionar en estas fases:

### Fase 2 — Estructura de navegación
- Implementar `app/layout.tsx` con Header y Footer
- Agregar rutas `/about`, `/contact`
- Extender `/data/content.json` con contenido por sección

### Fase 3 — API Routes tipadas
- Crear endpoints `GET /api/content` que sirvan los JSON
- Implementar middleware de validación con **Zod**
- Documentar la API con tipos exportables

### Fase 4 — CMS basado en JSON
- Interfaz de administración para editar los JSON en desarrollo
- Versionado de contenido mediante commits de Git
- Scripts de validación de esquema JSON al hacer push

### Fase 5 — Migración opcional a base de datos real
- Cuando se requiera escritura en producción, migrar a **Vercel Postgres** o **PlanetScale**
- La capa de abstracción en `/lib/db.ts` facilita el cambio sin modificar los componentes

---

## Referencia rápida de comandos

```bash
# Desarrollo
npm run dev              # Servidor local en :3000

# Calidad de código
npm run type-check       # Validar tipos TypeScript
npm run lint             # ESLint
npm run format           # Prettier

# Producción
npm run build            # Build de producción
npm run start            # Correr build localmente

# Git → Deploy
git add .
git commit -m "feat: hola mundo inicial"
git push origin main     # → Vercel despliega automáticamente
```

---

*Plan generado como referencia arquitectónica. Versión 1.0 — MVP Hola Mundo.*
