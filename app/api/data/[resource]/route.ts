/**
 * @file app/api/data/[resource]/route.ts
 * @description Endpoint dinámico para lectura de datos JSON.
 * Implementa whitelist de seguridad para evitar acceso a archivos arbitrarios.
 * Valida datos contra esquemas Zod antes de devolver.
 * @api GET /api/data/[resource]
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { readValidatedData, readData } from "@/lib/dataReader";
import type { ApiResponse, ApiErrorResponse } from "@/lib/types";
import {
  HomePageDataSchema,
  SiteConfigSchema,
  type HomePageDataType,
  type SiteConfigType,
} from "@/data/schema/home.schema";

/**
 * Whitelist de recursos permitidos.
 * Solo estos recursos pueden ser solicitados via la API.
 * Cualquier otro recurso devuelve 404.
 */
const ALLOWED_RESOURCES = {
  config: {
    path: "config",
    schema: SiteConfigSchema,
    description: "Site configuration",
  },
  home: {
    path: "pages/home",
    schema: HomePageDataSchema,
    description: "Home page data",
  },
} as const;

type ResourceKey = keyof typeof ALLOWED_RESOURCES;

/**
 * Verifica si un recurso está en la whitelist.
 */
function isAllowedResource(resource: string): resource is ResourceKey {
  return resource in ALLOWED_RESOURCES;
}

/**
 * Obtiene la ruta del archivo para un recurso permitido.
 */
function getResourcePath(resource: ResourceKey): string {
  return ALLOWED_RESOURCES[resource].path;
}

/**
 * Obtiene el esquema Zod para validación.
 */
function getResourceSchema(resource: ResourceKey) {
  return ALLOWED_RESOURCES[resource].schema;
}

/**
 * Error handler genérico para respuestas de error.
 */
function errorResponse(
  message: string,
  status: number = 500,
  code?: string
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
      code,
    },
    { status }
  );
}

/**
 * GET /api/data/[resource]
 *
 * Devuelve datos de un recurso específico validados contra su esquema.
 *
 * @param request - Objeto NextRequest
 * @param params - Parámetros de ruta { resource: string }
 * @returns JSON con datos validados o error
 *
 * @example
 * ```bash
 * curl http://localhost:3000/api/data/config
 * curl http://localhost:3000/api/data/home
 * ```
 *
 * Response (éxito 200):
 * ```json
 * {
 *   "success": true,
 *   "data": { ... },
 *   "timestamp": "2026-04-10T14:30:00Z"
 * }
 * ```
 *
 * Response (recurso no permitido 403):
 * ```json
 * {
 *   "success": false,
 *   "error": "Resource not in whitelist",
 *   "code": "FORBIDDEN_RESOURCE",
 *   "timestamp": "2026-04-10T14:30:00Z"
 * }
 * ```
 *
 * Response (no encontrado 404):
 * ```json
 * {
 *   "success": false,
 *   "error": "Resource not found",
 *   "code": "NOT_FOUND",
 *   "timestamp": "2026-04-10T14:30:00Z"
 * }
 * ```
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ resource: string }> }
): Promise<NextResponse<ApiResponse | ApiErrorResponse>> {
  try {
    const { resource } = await params;

    // Validar que el recurso está en la whitelist
    if (!isAllowedResource(resource)) {
      return errorResponse(
        "Resource not in whitelist",
        403,
        "FORBIDDEN_RESOURCE"
      );
    }

    const filePath = getResourcePath(resource);
    const schema = getResourceSchema(resource);

    // Intentar leer y validar los datos
    let data;
    try {
      data = readValidatedData(filePath, schema);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);

      // Diferenciar entre archivo no encontrado y error de validación
      if (message.includes("not found")) {
        return errorResponse(`${resource} not found`, 404, "NOT_FOUND");
      }

      // Error de validación
      return errorResponse(
        `Invalid data schema for ${resource}: ${message}`,
        400,
        "VALIDATION_ERROR"
      );
    }

    // Respuesta exitosa
    return NextResponse.json(
      {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Internal server error";
    return errorResponse(message, 500, "INTERNAL_ERROR");
  }
}

/**
 * POST /api/data/[resource] — No implementado
 * En futuras fases, se puede agregar para escritura con autenticación.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ resource: string }> }
): Promise<NextResponse<ApiErrorResponse>> {
  return errorResponse(
    "POST method not yet implemented",
    501,
    "NOT_IMPLEMENTED"
  );
}

/**
 * Manejo de métodos no permitidos
 */
export async function OPTIONS(
  request: NextRequest,
  { params }: { params: Promise<{ resource: string }> }
): Promise<NextResponse> {
  return new NextResponse(null, {
    status: 200,
    headers: {
      Allow: "GET, OPTIONS",
    },
  });
}
