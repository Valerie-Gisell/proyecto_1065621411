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
