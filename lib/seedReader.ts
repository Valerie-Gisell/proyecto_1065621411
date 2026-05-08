import fs from "fs";
import path from "path";

export interface SeedUser {
  id: string;
  name: string;
  email: string;
  password?: string;
  passwordHash?: string;
  role: "usuario" | "superadmin";
  currency?: string;
  is_active?: boolean;
  must_change_password?: boolean;
  created_at?: string;
}

export interface SeedCategory {
  id: string;
  user_id: string | null;
  name: string;
  emoji: string;
  color: string;
  type: "ingreso" | "gasto" | "ambos";
  is_active: boolean;
  created_at: string;
}

export interface SeedData {
  system: {
    mode: "seed";
    welcome: string;
  };
  users: SeedUser[];
  categories: SeedCategory[];
}

const SEED_PATH = path.join(process.cwd(), "data", "seed.json");

export function readSeedData(): SeedData {
  if (!fs.existsSync(SEED_PATH)) {
    throw new Error(`Seed data not found at ${SEED_PATH}`);
  }

  const raw = fs.readFileSync(SEED_PATH, "utf-8");
  return JSON.parse(raw) as SeedData;
}

export function getSeedUsers(): SeedUser[] {
  return readSeedData().users;
}

export function getSeedCategories(): SeedCategory[] {
  return readSeedData().categories;
}
