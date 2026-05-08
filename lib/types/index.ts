/**
 * @file lib/types/index.ts
 * @description Interfaces y tipos TypeScript para toda la aplicación.
 * Tipado estricto con literales, uniones y genéricos para garantizar contratos de datos.
 */

// ============================================================================
// Site Configuration
// ============================================================================

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

// ============================================================================
// Home Content & CTA
// ============================================================================

export interface CallToAction {
  text: string;
  href: string;
}

export interface HomeContentData {
  headline: string;
  subheadline: string;
  description: string;
  badge: string;
  cta?: CallToAction;
}

export interface HomeContent {
  headline: string;
  subheadline: string;
  description: string;
  badge: string;
  name?: string;
  document?: string;
}

// ============================================================================
// Page Structure
// ============================================================================

export type PageSection = "hero" | "content" | "footer" | "sidebar";
export type PageStatus = "draft" | "published" | "archived";

export interface PageMetadata {
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface HomePage {
  id: string;
  title: string;
  section: PageSection;
  status: PageStatus;
  content: HomeContentData;
  metadata: PageMetadata;
}

// ============================================================================
// Site Content
// ============================================================================

export interface SiteContent {
  home: HomeContent;
}

// ============================================================================
// API Responses
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  timestamp: string;
  code?: string;
}

// ============================================================================
// Auth & GoCash Domain Types
// ============================================================================

export type UserRole = "usuario" | "superadmin";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  currency: string;
  is_active: boolean;
  must_change_password: boolean;
  created_at: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  currency?: string;
  role?: UserRole;
}

export interface UpdateUserRequest {
  name?: string;
  currency?: string;
  is_active?: boolean;
  must_change_password?: boolean;
  password?: string;
}

export interface DashboardData {
  welcome: string;
  categoriesCount: number;
  seedMode: boolean;
  userCount?: number;
}

export type CategoryType = "ingreso" | "gasto" | "ambos";

export interface Category {
  id: string;
  user_id: string | null;
  name: string;
  emoji: string;
  color: string;
  type: CategoryType;
  is_active: boolean;
  created_at: string;
}

export interface CreateCategoryRequest {
  name: string;
  emoji: string;
  color: string;
  type: CategoryType;
}

export interface UpdateCategoryRequest {
  name?: string;
  emoji?: string;
  color?: string;
  type?: CategoryType;
  is_active?: boolean;
}

export interface TransactionFilters {
  type?: "ingreso" | "gasto";
  category_id?: string;
  emotion?: "feliz" | "tranquilo" | "triste" | "estresado" | "emocionado";
  from?: string;
  to?: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  category_id?: string | null;
  type: "ingreso" | "gasto";
  amount: number;
  description?: string;
  transaction_date: string;
  emotion?: "feliz" | "tranquilo" | "triste" | "estresado" | "emocionado" | null;
  created_at: string;
  updated_at: string;
}

export interface CreateTransactionRequest {
  category_id?: string | null;
  type: "ingreso" | "gasto";
  amount: number;
  description?: string;
  transaction_date: string;
  emotion?: "feliz" | "tranquilo" | "triste" | "estresado" | "emocionado" | null;
}

export interface UpdateTransactionRequest {
  category_id?: string | null;
  type?: "ingreso" | "gasto";
  amount?: number;
  description?: string;
  transaction_date?: string;
  emotion?: "feliz" | "tranquilo" | "triste" | "estresado" | "emocionado" | null;
}

export type GoalStatus = "pendiente" | "en_progreso" | "completada";

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  emoji: string;
  target_amount: number;
  current_amount: number;
  deadline?: string;
  description?: string;
  status: GoalStatus;
  created_at: string;
  updated_at: string;
}

export interface GoalContribution {
  id: string;
  goal_id: string;
  user_id: string;
  amount: number;
  created_at: string;
}

export interface CreateGoalRequest {
  name: string;
  emoji: string;
  target_amount: number;
  deadline?: string;
  description?: string;
}

export interface UpdateGoalRequest {
  name?: string;
  emoji?: string;
  target_amount?: number;
  deadline?: string | null;
  description?: string;
  status?: GoalStatus;
}

export interface ContributeGoalRequest {
  amount: number;
}

export interface GoalWithProgress extends Goal {
  progress: number;
  remaining: number;
  completed: boolean;
}

export interface MonthlyBalance {
  income: number;
  expenses: number;
  net: number;
}

export interface CategoryBreakdown {
  category_id: string | null;
  category_name: string;
  total: number;
  percentage: number;
  color: string;
  emoji: string;
}

export interface DailyBalance {
  date: string;
  balance: number;
}

export interface EmotionAnalysis {
  emotion: string;
  total_amount: number;
  percentage: number;
}

// ============================================================================
// Health & Status
// ============================================================================

export type SystemStatus = "ok" | "degraded" | "down";

export interface HealthStatus {
  status: SystemStatus;
  version: string;
  environment: string;
}

// ============================================================================
// Data Resource Types
// ============================================================================

export type DataResource = "config" | "home" | "content" | "pages";

export interface DataReadOptions {
  validate?: boolean;
}
