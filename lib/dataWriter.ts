/**
 * @file lib/dataWriter.ts
 * @description Funciones para escribir/actualizar datos en archivos JSON.
 * Solo ejecutable en el servidor en desarrollo.
 * En Vercel producción, el filesystem es read-only.
 * @server-only
 */

import fs from "fs";
import path from "path";
import type { ZodSchema } from "zod";

const DATA_DIR = path.join(process.cwd(), "data");

/**
 * Escribe datos en un archivo JSON.
 * Uso en desarrollo local únicamente.
 *
 * @template T - El tipo de datos a escribir
 * @param filename - Nombre del archivo sin extensión
 * @param data - Los datos a escribir
 * @throws Error si la escritura falla o en producción
 *
 * @example
 * ```typescript
 * const newConfig: SiteConfig = { ... };
 * writeData("config", newConfig);
 * ```
 */
export function writeData<T>(filename: string, data: T): void {
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Writing to JSON files is not allowed in production. Use an external database or API."
    );
  }

  try {
    const filePath = path.join(DATA_DIR, `${filename}.json`);
    const directory = path.dirname(filePath);

    // Crear directorio si no existe
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    // Escribir con formato (indent de 2 espacios)
    fs.writeFileSync(
      filePath,
      JSON.stringify(data, null, 2),
      "utf-8"
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to write data to ${filename}: ${message}`);
  }
}

/**
 * Escribe datos en un archivo JSON tras validar contra un esquema Zod.
 *
 * @template T - El tipo inferido del esquema
 * @param filename - Nombre del archivo sin extensión
 * @param data - Los datos a escribir
 * @param schema - Esquema Zod para validación previa
 * @throws ZodError si validation falla
 * @throws Error si falla la escritura
 *
 * @example
 * ```typescript
 * const newConfig: SiteConfigType = { ... };
 * writeValidatedData("config", newConfig, SiteConfigSchema);
 * ```
 */
export function writeValidatedData<T>(
  filename: string,
  data: T,
  schema: ZodSchema
): void {
  try {
    schema.parse(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Validation failed before writing ${filename}: ${message}`);
  }

  writeData(filename, data);
}

/**
 * Actualiza parcialmente un archivo JSON mergeando con datos existentes.
 *
 * @template T - El tipo de datos
 * @param filename - Nombre del archivo sin extensión
 * @param updates - Objeto con propiedades a actualizar
 * @throws Error si falla lectura o escritura
 *
 * @example
 * ```typescript
 * updateData("config", {
 *   site: { version: "1.1.0" }
 * });
 * ```
 */
export function updateData<T extends Record<string, unknown>>(
  filename: string,
  updates: Partial<T>
): void {
  try {
    const filePath = path.join(DATA_DIR, `${filename}.json`);
    const raw = fs.readFileSync(filePath, "utf-8");
    const current = JSON.parse(raw) as T;

    const merged = {
      ...current,
      ...updates,
    };

    writeData(filename, merged);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to update ${filename}: ${message}`);
  }
}

/**
 * Elimina un archivo JSON (solo en desarrollo).
 *
 * @param filename - Nombre del archivo sin extensión
 * @throws Error si falla o en producción
 *
 * @example
 * ```typescript
 * deleteData("temp-cache");
 * ```
 */
export function deleteData(filename: string): void {
  if (process.env.NODE_ENV === "production") {
    throw new Error("Deleting files is not allowed in production.");
  }

  try {
    const filePath = path.join(DATA_DIR, `${filename}.json`);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    throw new Error(`Failed to delete ${filename}: ${message}`);
  }
}
