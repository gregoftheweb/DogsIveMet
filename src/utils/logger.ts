/**
 * Lightweight logging utility for development and debugging.
 * Logs events to console in development mode.
 */

// Check if we're in development mode
const isDev = typeof __DEV__ !== 'undefined' ? __DEV__ : process.env.NODE_ENV !== 'production';

export interface LogEventData {
  [key: string]: any;
}

/**
 * Log an event with optional data for debugging and workflow tracking.
 * Only logs in development mode.
 * 
 * @param event - Event name/description
 * @param data - Optional key-value pairs with event details
 */
export function logEvent(event: string, data?: LogEventData): void {
  if (!isDev) {
    return;
  }

  const timestamp = new Date().toISOString();
  const prefix = '[DogsIveMet]';
  
  if (data && Object.keys(data).length > 0) {
    console.log(`${prefix} ${timestamp} - ${event}`, data);
  } else {
    console.log(`${prefix} ${timestamp} - ${event}`);
  }
}

/**
 * Log an error with optional context data.
 * Logs in both dev and production for critical errors.
 * 
 * @param error - Error object or message
 * @param context - Optional context information
 */
export function logError(error: Error | string, context?: LogEventData): void {
  const timestamp = new Date().toISOString();
  const prefix = '[DogsIveMet Error]';
  const errorMessage = error instanceof Error ? error.message : error;
  const errorStack = error instanceof Error ? error.stack : undefined;
  
  console.error(`${prefix} ${timestamp} - ${errorMessage}`);
  
  if (context) {
    console.error('Context:', context);
  }
  
  if (errorStack) {
    console.error('Stack:', errorStack);
  }
}
