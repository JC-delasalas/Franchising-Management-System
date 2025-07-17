// Custom error classes for better error handling and user experience

export class AuthenticationError extends Error {
  public readonly code: string;
  public readonly userMessage: string;
  public readonly shouldSignOut: boolean;

  constructor(
    message: string, 
    code: string = 'AUTH_ERROR', 
    userMessage?: string,
    shouldSignOut: boolean = false
  ) {
    super(message);
    this.name = 'AuthenticationError';
    this.code = code;
    this.userMessage = userMessage || this.getDefaultUserMessage(code);
    this.shouldSignOut = shouldSignOut;
  }

  private getDefaultUserMessage(code: string): string {
    switch (code) {
      case 'INVALID_CREDENTIALS':
        return 'Invalid email or password. Please check your credentials and try again.';
      case 'EMAIL_NOT_CONFIRMED':
        return 'Please check your email and click the confirmation link before signing in.';
      case 'PROFILE_NOT_FOUND':
        return 'Your account profile could not be found. Please contact support.';
      case 'PROFILE_CREATION_FAILED':
        return 'Unable to set up your account profile. Please try again or contact support.';
      case 'INSUFFICIENT_PERMISSIONS':
        return 'You do not have permission to access this resource.';
      case 'SESSION_EXPIRED':
        return 'Your session has expired. Please sign in again.';
      case 'TOO_MANY_REQUESTS':
        return 'Too many attempts. Please wait a few minutes before trying again.';
      case 'ACCOUNT_DISABLED':
        return 'Your account has been disabled. Please contact support.';
      default:
        return 'An authentication error occurred. Please try again.';
    }
  }
}

export class APIError extends Error {
  public readonly code: string;
  public readonly statusCode?: number;
  public readonly userMessage: string;
  public readonly retryable: boolean;
  public readonly endpoint?: string;
  public readonly method?: string;

  constructor(
    message: string,
    code: string = 'API_ERROR',
    statusCode?: number,
    userMessage?: string,
    retryable: boolean = false,
    endpoint?: string,
    method?: string
  ) {
    super(message);
    this.name = 'APIError';
    this.code = code;
    this.statusCode = statusCode;
    this.userMessage = userMessage || this.getDefaultUserMessage(code, statusCode);
    this.retryable = retryable;
    this.endpoint = endpoint;
    this.method = method;
  }

  private getDefaultUserMessage(code: string, statusCode?: number): string {
    if (statusCode) {
      switch (statusCode) {
        case 400:
          return 'Invalid request. Please check your input and try again.';
        case 401:
          return 'You are not authorized to perform this action.';
        case 403:
          return 'You do not have permission to access this resource.';
        case 404:
          return 'The requested resource was not found.';
        case 409:
          return 'This action conflicts with existing data. Please refresh and try again.';
        case 422:
          return 'The data provided is invalid. Please check your input.';
        case 429:
          return 'Too many requests. Please wait a moment and try again.';
        case 500:
          return 'A server error occurred. Please try again later.';
        case 502:
          return 'Service temporarily unavailable. Please try again in a few minutes.';
        case 503:
          return 'Service is currently under maintenance. Please try again later.';
        case 504:
          return 'Request timed out. Please try again.';
        default:
          return 'An error occurred while processing your request.';
      }
    }

    switch (code) {
      case 'NETWORK_ERROR':
        return 'Network connection error. Please check your internet connection.';
      case 'TIMEOUT_ERROR':
        return 'Request timed out. Please try again.';
      case 'VALIDATION_ERROR':
        return 'Please check your input and try again.';
      case 'PERMISSION_DENIED':
        return 'You do not have permission to perform this action.';
      case 'RESOURCE_NOT_FOUND':
        return 'The requested item could not be found.';
      case 'DUPLICATE_RESOURCE':
        return 'This item already exists. Please use a different name or identifier.';
      case 'RATE_LIMITED':
        return 'Too many requests. Please wait before trying again.';
      case 'SERVICE_UNAVAILABLE':
        return 'Service is temporarily unavailable. Please try again later.';
      case 'DATABASE_ERROR':
        return 'A database error occurred. Please try again or contact support.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }
}

export class ValidationError extends Error {
  public readonly field: string;
  public readonly userMessage: string;

  constructor(message: string, field: string, userMessage?: string) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.userMessage = userMessage || `Invalid ${field}. Please check your input.`;
  }
}

// Error handling utilities
export const handleAuthError = (error: any): AuthenticationError => {
  if (error instanceof AuthenticationError) {
    return error;
  }

  // Convert Supabase auth errors to our custom errors
  if (error?.message) {
    switch (error.message) {
      case 'Invalid login credentials':
        return new AuthenticationError(error.message, 'INVALID_CREDENTIALS');
      case 'Email not confirmed':
        return new AuthenticationError(error.message, 'EMAIL_NOT_CONFIRMED');
      case 'Too many requests':
        return new AuthenticationError(error.message, 'TOO_MANY_REQUESTS');
      case 'User not found':
        return new AuthenticationError(error.message, 'PROFILE_NOT_FOUND', undefined, true);
      default:
        if (error.message.includes('profile')) {
          return new AuthenticationError(error.message, 'PROFILE_CREATION_FAILED', undefined, true);
        }
        return new AuthenticationError(error.message, 'AUTH_ERROR');
    }
  }

  return new AuthenticationError('An unexpected authentication error occurred', 'AUTH_ERROR');
};

export const handleAPIError = (error: any, endpoint?: string, method?: string): APIError => {
  if (error instanceof APIError) {
    return error;
  }

  // Handle Supabase-specific errors
  if (error?.code) {
    switch (error.code) {
      case 'PGRST116':
        return new APIError(error.message, 'RESOURCE_NOT_FOUND', 404, undefined, false, endpoint, method);
      case 'PGRST301':
        return new APIError(error.message, 'PERMISSION_DENIED', 403, undefined, false, endpoint, method);
      case '23505':
        return new APIError(error.message, 'DUPLICATE_RESOURCE', 409, undefined, false, endpoint, method);
      case '23503':
        return new APIError(error.message, 'VALIDATION_ERROR', 422, undefined, false, endpoint, method);
      case 'NETWORK_ERROR':
        return new APIError(error.message, 'NETWORK_ERROR', undefined, undefined, true, endpoint, method);
      case 'TIMEOUT_ERROR':
        return new APIError(error.message, 'TIMEOUT_ERROR', 504, undefined, true, endpoint, method);
      default:
        return new APIError(error.message || 'Database Error', 'DATABASE_ERROR', 500, undefined, false, endpoint, method);
    }
  }

  // Handle HTTP status codes
  if (error?.status || error?.statusCode) {
    const statusCode = error.status || error.statusCode;
    const isRetryable = [408, 429, 500, 502, 503, 504].includes(statusCode);

    let code = 'HTTP_ERROR';
    switch (statusCode) {
      case 400: code = 'VALIDATION_ERROR'; break;
      case 401: code = 'AUTHENTICATION_ERROR'; break;
      case 403: code = 'PERMISSION_DENIED'; break;
      case 404: code = 'RESOURCE_NOT_FOUND'; break;
      case 409: code = 'DUPLICATE_RESOURCE'; break;
      case 422: code = 'VALIDATION_ERROR'; break;
      case 429: code = 'RATE_LIMITED'; break;
      case 500: case 502: case 503: case 504: code = 'SERVICE_UNAVAILABLE'; break;
    }

    return new APIError(error.message || 'HTTP Error', code, statusCode, undefined, isRetryable, endpoint, method);
  }

  // Handle network and timeout errors
  if (error?.name === 'NetworkError' || error?.message?.includes('network')) {
    return new APIError(error.message, 'NETWORK_ERROR', undefined, undefined, true, endpoint, method);
  }

  if (error?.name === 'TimeoutError' || error?.message?.includes('timeout')) {
    return new APIError(error.message, 'TIMEOUT_ERROR', 504, undefined, true, endpoint, method);
  }

  // Default fallback
  return new APIError(error?.message || 'An unexpected API error occurred', 'API_ERROR', undefined, undefined, false, endpoint, method);
};

// Error logging utility
export const logError = (error: Error, context?: Record<string, any>) => {
  const errorLog = {
    name: error.name,
    message: error.message,
    stack: error.stack,
    timestamp: new Date().toISOString(),
    context: context || {},
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'server',
    url: typeof window !== 'undefined' ? window.location.href : 'unknown'
  };

  console.error('Error logged:', errorLog);

  // In production, send to error reporting service
  if (process.env.NODE_ENV === 'production') {
    // Example: Send to Sentry, LogRocket, etc.
    // errorReportingService.captureException(error, errorLog);
  }
};

// Retry logic utilities
export interface RetryOptions {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffFactor: number;
  jitter: boolean;
}

export const defaultRetryOptions: RetryOptions = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffFactor: 2,
  jitter: true
};

export const calculateRetryDelay = (attempt: number, options: RetryOptions = defaultRetryOptions): number => {
  const exponentialDelay = Math.min(
    options.baseDelay * Math.pow(options.backoffFactor, attempt - 1),
    options.maxDelay
  );

  if (options.jitter) {
    // Add random jitter to prevent thundering herd
    const jitterAmount = exponentialDelay * 0.1;
    return exponentialDelay + (Math.random() * jitterAmount * 2 - jitterAmount);
  }

  return exponentialDelay;
};

export const shouldRetry = (error: any, attempt: number, options: RetryOptions = defaultRetryOptions): boolean => {
  if (attempt >= options.maxAttempts) {
    return false;
  }

  if (error instanceof APIError) {
    return error.retryable;
  }

  // Retry on network errors, timeouts, and 5xx errors
  if (error?.code === 'NETWORK_ERROR' ||
      error?.code === 'TIMEOUT_ERROR' ||
      (error?.statusCode && error.statusCode >= 500)) {
    return true;
  }

  return false;
};

export const withRetry = async <T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {},
  context?: { endpoint?: string; method?: string }
): Promise<T> => {
  const retryOptions = { ...defaultRetryOptions, ...options };
  let lastError: any;

  for (let attempt = 1; attempt <= retryOptions.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = handleAPIError(error, context?.endpoint, context?.method);

      if (!shouldRetry(lastError, attempt, retryOptions)) {
        throw lastError;
      }

      if (attempt < retryOptions.maxAttempts) {
        const delay = calculateRetryDelay(attempt, retryOptions);
        logError(lastError, {
          attempt,
          retryDelay: delay,
          context: 'retry_attempt',
          ...context
        });
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError;
};

// User-friendly error message extractor
export const getUserFriendlyMessage = (error: any): string => {
  if (error instanceof AuthenticationError || error instanceof APIError || error instanceof ValidationError) {
    return error.userMessage;
  }

  if (error?.userMessage) {
    return error.userMessage;
  }

  // Fallback for unknown errors
  return 'An unexpected error occurred. Please try again or contact support if the problem persists.';
};
