import { NextResponse } from "next/server"

type ApiErrorType =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "VALIDATION_ERROR"
  | "RATE_LIMITED"
  | "SERVER_ERROR"
  | "BAD_REQUEST"

interface ApiErrorResponse {
  error: {
    type: ApiErrorType
    message: string
    code: number
    details?: Record<string, any>
  }
}

export function createApiError(
  type: ApiErrorType,
  message: string,
  details?: Record<string, any>,
): NextResponse<ApiErrorResponse> {
  const statusCodes: Record<ApiErrorType, number> = {
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    VALIDATION_ERROR: 422,
    RATE_LIMITED: 429,
    SERVER_ERROR: 500,
    BAD_REQUEST: 400,
  }

  return NextResponse.json(
    {
      error: {
        type,
        message,
        code: statusCodes[type],
        ...(details && { details }),
      },
    },
    { status: statusCodes[type] },
  )
}

export function createApiSuccess<T>(data: T, status = 200): NextResponse<T> {
  return NextResponse.json(data, { status })
}

// Helper to validate request body against a schema
export async function validateRequestBody<T>(
  request: Request,
  schema: any,
): Promise<{ valid: true; data: T } | { valid: false; errors: any }> {
  try {
    const body = await request.json()
    const result = await schema.safeParseAsync(body)

    if (!result.success) {
      return { valid: false, errors: result.error.format() }
    }

    return { valid: true, data: result.data }
  } catch (error) {
    return { valid: false, errors: { _errors: ["Invalid JSON body"] } }
  }
}
