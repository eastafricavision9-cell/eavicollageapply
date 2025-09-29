// Logger service to replace console statements with proper logging
export class Logger {
  private static isDevelopment = process.env.NODE_ENV === 'development'
  
  static log(message: string, ...args: any[]) {
    if (this.isDevelopment) {
      console.log(`[LOG] ${new Date().toISOString()}: ${message}`, ...args)
    }
  }
  
  static info(message: string, ...args: any[]) {
    if (this.isDevelopment) {
      console.info(`[INFO] ${new Date().toISOString()}: ${message}`, ...args)
    }
  }
  
  static warn(message: string, ...args: any[]) {
    console.warn(`[WARN] ${new Date().toISOString()}: ${message}`, ...args)
  }
  
  static error(message: string, error?: any, ...args: any[]) {
    console.error(`[ERROR] ${new Date().toISOString()}: ${message}`, error, ...args)
  }
  
  static debug(message: string, ...args: any[]) {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${new Date().toISOString()}: ${message}`, ...args)
    }
  }
  
  // For production, you might want to send logs to a service like LogRocket, Sentry, etc.
  static logToService(level: 'info' | 'warn' | 'error', message: string, metadata?: any) {
    if (!this.isDevelopment) {
      // In production, send to logging service
      // Example: LogRocket.captureMessage(message, { level, ...metadata })
      // Example: Sentry.captureMessage(message, level as SeverityLevel)
    }
  }
}

// Convenience exports for cleaner imports
export const logger = Logger