/**
 * Logging utility for the application
 * Provides structured logging with different levels
 */

type LogLevel = 'info' | 'warn' | 'error' | 'debug'

interface LogEntry {
  level: LogLevel
  message: string
  data?: any
  timestamp: string
  context?: string
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  
  private formatMessage(level: LogLevel, message: string, data?: any, context?: string): LogEntry {
    return {
      level,
      message,
      data,
      context,
      timestamp: new Date().toISOString()
    }
  }

  private output(entry: LogEntry): void {
    const { level, message, data, context, timestamp } = entry
    
    const prefix = context ? `[${context}] ${timestamp}` : timestamp
    const fullMessage = `${prefix} - ${message}`
    
    if (this.isDevelopment) {
      // In development, use console methods for better debugging
      switch (level) {
        case 'error':
          if (data) {
            console.error(fullMessage, data)
          } else {
            console.error(fullMessage)
          }
          break
        case 'warn':
          if (data) {
            console.warn(fullMessage, data)
          } else {
            console.warn(fullMessage)
          }
          break
        case 'info':
          if (data) {
            console.info(fullMessage, data)
          } else {
            console.info(fullMessage)
          }
          break
        case 'debug':
          if (data) {
            console.debug(fullMessage, data)
          } else {
            console.debug(fullMessage)
          }
          break
      }
    } else {
      // In production, you might want to send to a logging service
      // For now, we'll still use console but in a more controlled way
      const logData = data ? `${fullMessage} ${JSON.stringify(data)}` : fullMessage
      
      switch (level) {
        case 'error':
          console.error(logData)
          break
        case 'warn':
          console.warn(logData)
          break
        default:
          console.log(logData)
          break
      }
    }
  }

  info(message: string, data?: any, context?: string): void {
    const entry = this.formatMessage('info', message, data, context)
    this.output(entry)
  }

  warn(message: string, data?: any, context?: string): void {
    const entry = this.formatMessage('warn', message, data, context)
    this.output(entry)
  }

  error(message: string, data?: any, context?: string): void {
    const entry = this.formatMessage('error', message, data, context)
    this.output(entry)
  }

  debug(message: string, data?: any, context?: string): void {
    const entry = this.formatMessage('debug', message, data, context)
    this.output(entry)
  }
}

// Export singleton instance
export const logger = new Logger()

// Export types for use in other files
export type { LogLevel, LogEntry }