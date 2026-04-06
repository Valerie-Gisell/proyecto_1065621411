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
