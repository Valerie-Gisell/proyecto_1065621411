/**
 * @file lib/dataReader.ts
 * @description Funciones para lectura de datos desde archivos JSON con validación opcional.
 * Solo ejecutable en el servidor (Server Components, API Routes).
 * @server-only
 */

import fs from "fs";
import path from "path";
import type { ZodSchema } from "zod";
import type { SiteConfig, HomePage, DataReadOptions } from "./types";
import {
  HomePageDataSchema,
  SiteConfigSchema,
  type HomePageDataType,
  type SiteConfigType,
} from "@/data/schema/home.schema";

const DATA_DIR = path.join(process.cwd(), "data");

/**
 * Lee un archivo JSON del directorio /data y lo devuelve como tipo genérico.
 *
 * @template T - El tipo de datos esperado
 * @param filename - Nombre del archivo sin extensión (ej: "config")
 * @returns Los datos parseados como tipo T
 * @throws Error si el archivo no existe o no es JSON válido
 *
 * @example
 * ```typescript
 * const config = readData<SiteConfig>("config");
 * ```
 */
export function readData<T>(filename: string): T {
  const filePath = path.join(DATA_DIR, `${filename}.json`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Data file not found: ${filename}.json`);
  }

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to read data file ${filename}: ${message}`);
  }
}

/**
 * Lee un archivo JSON y lo valida contra un esquema Zod.
 *
 * @template T - El tipo inferido del esquema Zod
 * @param filename - Nombre del archivo sin extensión
 * @param schema - Esquema Zod para validación
 * @returns Los datos validados como tipo T
 * @throws ZodError si la validación falla
 * @throws Error si el archivo no existe
 *
 * @example
 * ```typescript
 * const homeData = readValidatedData<HomePageDataType>(
 *   "pages/home",
 *   HomePageDataSchema
 * );
 * ```
 */
export function readValidatedData<T>(
  filename: string,
  schema: ZodSchema
): T {
  const raw = readData<unknown>(filename);

  try {
    return schema.parse(raw) as T;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(
      `Validation failed for ${filename}: ${message}`
    );
  }
}

/**
 * Lee la configuración del sitio desde config.json con validación.
 *
 * @returns Configuración del sitio validada
 * @throws Error si validation falla
 *
 * @example
 * ```typescript
 * const config = getConfig();
 * console.log(config.site.name);
 * ```
 */
export function getConfig(): SiteConfigType {
  return readValidatedData<SiteConfigType>(
    "config",
    SiteConfigSchema
  );
}

/**
 * Lee la página Home desde pages/home.json con validación.
 *
 * @returns Datos de la página Home validados
 * @throws Error si validation falla
 *
 * @example
 * ```typescript
 * const homePage = getHomePage();
 * console.log(homePage.content.headline);
 * ```
 */
export function getHomePage(): HomePageDataType {
  return readValidatedData<HomePageDataType>(
    "pages/home",
    HomePageDataSchema
  );
}

/**
 * Lee cualquier archivo de datos con validación opcional.
 * Versión genérica que permite pasar un esquema personalizado.
 *
 * @template T - El tipo de datos esperado
 * @param filename - Nombre del archivo sin extensión
 * @param schema - Esquema opcional para validación
 * @returns Los datos (validados si schema se proporcionó)
 * @throws Error si la lectura o validación falla
 *
 * @example
 * ```typescript
 * // Sin validación
 * const data = readDataOptional<JsonData>("custom");
 *
 * // Con validación
 * const validated = readDataOptional<HomePageDataType>(
 *   "pages/home",
 *   HomePageDataSchema
 * );
 * ```
 */
export function readDataOptional<T>(
  filename: string,
  schema?: ZodSchema
): T {
  const raw = readData<unknown>(filename);

  if (!schema) {
    return raw as T;
  }

  try {
    return schema.parse(raw) as T;
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Validation failed for ${filename}: ${message}`);
  }
}
