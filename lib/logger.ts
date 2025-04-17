// Comprehensive logging system with different log levels and context
type LogLevel = "debug" | "info" | "warn" | "error"

interface LogContext {
  [key: string]: any
}

interface LoggerOptions {
  minLevel?: LogLevel
  enableConsole?: boolean
  serviceName?: string
}

// Map log levels to numeric values for comparison
const LOG_LEVEL_VALUES: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

export class Logger {
  private minLevel: LogLevel
  private enableConsole: boolean
  private serviceName: string

  constructor(options: LoggerOptions = {}) {
    this.minLevel = options.minLevel || (process.env.NODE_ENV === "production" ? "info" : "debug")
    this.enableConsole = options.enableConsole ?? true
    this.serviceName = options.serviceName || "educational-platform"
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVEL_VALUES[level] >= LOG_LEVEL_VALUES[this.minLevel]
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString()
    const contextStr = context ? ` ${JSON.stringify(context)}` : ""
    return `[${timestamp}] [${level.toUpperCase()}] [${this.serviceName}] ${message}${contextStr}`
  }

  private log(level: LogLevel, message: string, context?: LogContext): void {
    if (!this.shouldLog(level)) return

    const formattedMessage = this.formatMessage(level, message, context)

    if (this.enableConsole) {
      switch (level) {
        case "debug":
          console.debug(formattedMessage)
          break
        case "info":
          console.info(formattedMessage)
          break
        case "warn":
          console.warn(formattedMessage)
          break
        case "error":
          console.error(formattedMessage)
          break
      }
    }

    // In a production environment, we could also send logs to a service like Vercel Logs
    // or another logging service. This would be implemented here.
  }

  debug(message: string, context?: LogContext): void {
    this.log("debug", message, context)
  }

  info(message: string, context?: LogContext): void {
    this.log("info", message, context)
  }

  warn(message: string, context?: LogContext): void {
    this.log("warn", message, context)
  }

  error(message: string, context?: LogContext): void {
    this.log("error", message, context)
  }

  // Create a child logger with additional context
  child(context: LogContext): Logger {
    const childLogger = new Logger({
      minLevel: this.minLevel,
      enableConsole: this.enableConsole,
      serviceName: this.serviceName,
    })

    // Override log methods to include parent context
    const originalLog = childLogger.log.bind(childLogger)
    childLogger.log = (level: LogLevel, message: string, additionalContext?: LogContext) => {
      originalLog(level, message, { ...context, ...additionalContext })
    }

    return childLogger
  }
}

// Make sure the logger is properly exported at the end of the file

// Create and export the default logger instance
export const logger = new Logger({
  minLevel: (process.env.LOG_LEVEL as LogLevel) || undefined,
})
