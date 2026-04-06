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
