import fs from "fs";
import path from "path";

export type AuditAction =
  | "login"
  | "logout"
  | "register"
  | "create_category"
  | "update_category"
  | "delete_category"
  | "create_transaction"
  | "update_transaction"
  | "delete_transaction"
  | "create_user"
  | "toggle_user"
  | "bootstrap";

export type AuditEntry = {
  id: string;
  timestamp: string;
  user_id?: string;
  user_email?: string;
  user_role?: "usuario" | "superadmin";
  action: AuditAction;
  entity: "category" | "user" | "system";
  entity_id?: string;
  summary: string;
  metadata?: Record<string, unknown>;
};

const AUDIT_PATH = path.join(process.cwd(), "data", "audit.json");

export function readAuditEntries(): AuditEntry[] {
  if (!fs.existsSync(AUDIT_PATH)) {
    return [];
  }

  const raw = fs.readFileSync(AUDIT_PATH, "utf-8");
  return JSON.parse(raw) as AuditEntry[];
}

export function appendAuditEntry(entry: AuditEntry): void {
  const current = readAuditEntries();
  const next = [...current, entry];
  fs.writeFileSync(AUDIT_PATH, JSON.stringify(next, null, 2), "utf-8");
}
