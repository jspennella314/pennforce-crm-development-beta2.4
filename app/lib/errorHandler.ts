// Centralized error handling utilities

export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details);
    this.name = 'ValidationError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
    this.name = 'NotFoundError';
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED');
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Forbidden') {
    super(message, 403, 'FORBIDDEN');
    this.name = 'ForbiddenError';
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT');
    this.name = 'ConflictError';
  }
}

// Error types for specific scenarios
export const ErrorCodes = {
  // Authentication & Authorization
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',

  // Validation
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',
  INVALID_VALUE: 'INVALID_VALUE',

  // Database
  RECORD_NOT_FOUND: 'RECORD_NOT_FOUND',
  DUPLICATE_ENTRY: 'DUPLICATE_ENTRY',
  FOREIGN_KEY_VIOLATION: 'FOREIGN_KEY_VIOLATION',

  // Business Logic
  OPERATION_NOT_ALLOWED: 'OPERATION_NOT_ALLOWED',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  INVALID_STATE: 'INVALID_STATE',

  // Server
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
} as const;

// Parse Prisma errors
export function parsePrismaError(error: any): AppError {
  // Unique constraint violation
  if (error.code === 'P2002') {
    const fields = error.meta?.target || ['field'];
    return new ConflictError(
      `A record with this ${fields.join(', ')} already exists`
    );
  }

  // Record not found
  if (error.code === 'P2025') {
    return new NotFoundError('Record');
  }

  // Foreign key constraint violation
  if (error.code === 'P2003') {
    return new AppError(
      'Referenced record does not exist',
      400,
      ErrorCodes.FOREIGN_KEY_VIOLATION
    );
  }

  // Required field missing
  if (error.code === 'P2011') {
    const field = error.meta?.column || 'field';
    return new ValidationError(`${field} is required`);
  }

  // Default to generic error
  return new AppError(
    error.message || 'Database operation failed',
    500,
    ErrorCodes.INTERNAL_ERROR
  );
}

// Format error for API response
export interface ErrorResponse {
  error: string;
  code?: string;
  details?: any;
  statusCode: number;
}

export function formatErrorResponse(error: any): ErrorResponse {
  // Handle AppError instances
  if (error instanceof AppError) {
    return {
      error: error.message,
      code: error.code,
      details: error.details,
      statusCode: error.statusCode,
    };
  }

  // Handle Prisma errors
  if (error.code && error.code.startsWith('P')) {
    const appError = parsePrismaError(error);
    return formatErrorResponse(appError);
  }

  // Handle generic errors
  const isDev = process.env.NODE_ENV === 'development';
  return {
    error: isDev ? error.message : 'An unexpected error occurred',
    code: ErrorCodes.INTERNAL_ERROR,
    details: isDev ? { stack: error.stack } : undefined,
    statusCode: 500,
  };
}

// Log error with context
export function logError(error: any, context?: any): void {
  const timestamp = new Date().toISOString();
  const errorInfo = {
    timestamp,
    message: error.message,
    code: error.code,
    stack: error.stack,
    context,
  };

  if (process.env.NODE_ENV === 'development') {
    console.error('Error occurred:', errorInfo);
  } else {
    // In production, you'd send to a logging service
    console.error(JSON.stringify(errorInfo));
  }
}

// Async error wrapper for API routes
export function asyncHandler(
  handler: (req: any, context?: any) => Promise<Response>
) {
  return async (req: any, context?: any): Promise<Response> => {
    try {
      return await handler(req, context);
    } catch (error: any) {
      logError(error, { path: req.url, method: req.method });
      const errorResponse = formatErrorResponse(error);
      return Response.json(
        { error: errorResponse.error, code: errorResponse.code },
        { status: errorResponse.statusCode }
      );
    }
  };
}

// Client-side error handler
export function handleClientError(error: any): string {
  if (error.response) {
    // HTTP error response
    const data = error.response.data;
    return data?.error || data?.message || 'An error occurred';
  }

  if (error.request) {
    // Request made but no response
    return 'No response from server. Please check your connection.';
  }

  // Something else happened
  return error.message || 'An unexpected error occurred';
}

// Retry with exponential backoff
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: any;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, i);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
}
