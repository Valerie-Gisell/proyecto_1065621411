/**
 * @file lib/db.ts
 * @deprecated Use dataReader.ts instead for validated data access
 * @description Funciones legacy de lectura de datos JSON.
 */

import fs from "fs";
import path from "path";
import type { SiteConfig, SiteContent } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");

/**
 * Lee un archivo JSON del directorio /data (legacy).
 * @deprecated Use readData() from dataReader.ts instead
 */
export function readJSON<T>(filename: string): T {
  const filePath = path.join(DATA_DIR, `${filename}.json`);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

/**
 * Obtiene la configuración del sitio (legacy).
 * @deprecated Use getConfig() from dataReader.ts instead
 */
export function getConfig(): SiteConfig {
  return readJSON<SiteConfig>("config");
}

/**
 * Obtiene el contenido del sitio (legacy).
 * @deprecated Use getHomePage() from dataReader.ts instead
 */
export function getContent(): SiteContent {
  return readJSON<SiteContent>("content");
}
