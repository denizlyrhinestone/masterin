import { type HealthIncident, HealthStatus } from "./health-monitoring"
import { logError } from "./error-handling"

// Alert severity levels
export enum AlertSeverity {
  INFO = "info",
  WARNING = "warning",
  ERROR = "error",
  CRITICAL = "critical",
}

// Alert types
export enum AlertType {
  SERVICE_DEGRADED = "service_degraded",
  SERVICE_OUTAGE = "service_outage",
  SERVICE_RECOVERED = "service_recovered",
  ERROR_THRESHOLD = "error_threshold",
  PERFORMANCE_DEGRADATION = "performance_degradation",
  SECURITY_ISSUE = "security_issue",
  QUOTA_WARNING = "quota_warning",
}

// Interface for alert notifications
export interface AlertNotification {
  id: string
  type: AlertType
  severity: AlertSeverity
  title: string
  message: string
  timestamp: string
  source: string
  metadata?: Record<string, any>
  acknowledged: boolean
  acknowledgedBy?: string
  acknowledgedAt?: string
}

// Alert channel interface
export interface AlertChannel {
  name: string
  send(alert: AlertNotification): Promise<boolean>
}

// Email alert channel
export class EmailAlertChannel implements AlertChannel {
  name = "email"

  constructor(private recipients: string[]) {}

  async send(alert: AlertNotification): Promise<boolean> {
    try {
      console.log(`[EmailAlert] Sending alert to ${this.recipients.join(", ")}:`, alert)
      // In a real implementation, you would send an email here
      return true
    } catch (error) {
      logError(error instanceof Error ? error : String(error), "EmailAlertChannel.send", { alert })
      return false
    }
  }
}

// Slack alert channel
export class SlackAlertChannel implements AlertChannel {
  name = "slack"

  constructor(private webhookUrl: string) {}

  async send(alert: AlertNotification): Promise<boolean> {
    try {
      console.log(`[SlackAlert] Sending alert to webhook:`, alert)
      // In a real implementation, you would send a Slack message here
      return true
    } catch (error) {
      logError(error instanceof Error ? error : String(error), "SlackAlertChannel.send", { alert })
      return false
    }
  }
}

// In-app notification alert channel
export class InAppAlertChannel implements AlertChannel {
  name = "in-app"
  private listeners: ((alert: AlertNotification) => void)[] = []

  registerListener(listener: (alert: AlertNotification) => void): void {
    this.listeners.push(listener)
  }

  async send(alert: AlertNotification): Promise<boolean> {
    try {
      console.log(`[InAppAlert] Broadcasting alert:`, alert)

      // Notify all listeners
      for (const listener of this.listeners) {
        listener(alert)
      }

      return true
    } catch (error) {
      logError(error instanceof Error ? error : String(error), "InAppAlertChannel.send", { alert })
      return false
    }
  }
}

// Alert manager class
export class AlertManager {
  private static instance: AlertManager
  private channels: AlertChannel[] = []
  private alerts: AlertNotification[] = []
  private alertThrottling: Record<string, { count: number; lastSent: string }> = {}

  private constructor() {}

  // Singleton pattern
  public static getInstance(): AlertManager {
    if (!AlertManager.instance) {
      AlertManager.instance = new AlertManager()
    }
    return AlertManager.instance
  }

  // Register an alert channel
  public registerChannel(channel: AlertChannel): void {
    this.channels.push(channel)
  }

  // Create and send an alert
  public async sendAlert(
    type: AlertType,
    severity: AlertSeverity,
    title: string,
    message: string,
    source: string,
    metadata?: Record<string, any>,
  ): Promise<AlertNotification> {
    const alert: AlertNotification = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      title,
      message,
      timestamp: new Date().toISOString(),
      source,
      metadata,
      acknowledged: false,
    }

    // Check if we should throttle this alert
    if (this.shouldThrottleAlert(alert)) {
      console.log(`[AlertManager] Throttling alert:`, alert)
      return alert
    }

    // Store the alert
    this.alerts.push(alert)

    // Send to all channels
    const results = await Promise.all(this.channels.map((channel) => channel.send(alert)))

    // Log if any channel failed
    if (results.some((result) => !result)) {
      logError(`Failed to send alert to some channels`, "AlertManager.sendAlert", { alert, channelResults: results })
    }

    return alert
  }

  // Check if we should throttle an alert
  private shouldThrottleAlert(alert: AlertNotification): boolean {
    // Create a key based on type and source
    const key = `${alert.type}-${alert.source}`

    // Get the current time
    const now = new Date()

    // Check if we have a record for this alert type
    if (this.alertThrottling[key]) {
      const { count, lastSent } = this.alertThrottling[key]
      const lastSentTime = new Date(lastSent)

      // If we've sent this alert recently, increment the count
      if (now.getTime() - lastSentTime.getTime() < 300000) {
        // 5 minutes
        this.alertThrottling[key] = {
          count: count + 1,
          lastSent: now.toISOString(),
        }

        // Throttle if we've sent too many
        return count >= 3
      } else {
        // Reset the count if it's been a while
        this.alertThrottling[key] = {
          count: 1,
          lastSent: now.toISOString(),
        }
        return false
      }
    } else {
      // First time seeing this alert
      this.alertThrottling[key] = {
        count: 1,
        lastSent: now.toISOString(),
      }
      return false
    }
  }

  // Acknowledge an alert
  public acknowledgeAlert(alertId: string, acknowledgedBy: string): AlertNotification | null {
    const alert = this.alerts.find((a) => a.id === alertId)

    if (alert) {
      alert.acknowledged = true
      alert.acknowledgedBy = acknowledgedBy
      alert.acknowledgedAt = new Date().toISOString()
      return alert
    }

    return null
  }

  // Get all alerts
  public getAlerts(): AlertNotification[] {
    return [...this.alerts]
  }

  // Get unacknowledged alerts
  public getUnacknowledgedAlerts(): AlertNotification[] {
    return this.alerts.filter((a) => !a.acknowledged)
  }

  // Create an alert from a health incident\
  publicic
  createAlertFromHealthIncident(incident: HealthIncident): Promise<AlertNotification> {
    let type: AlertType
    let severity: AlertSeverity

    // Determine alert type and severity based on incident status
    switch (incident.status) {
      case HealthStatus.DEGRADED:
        type = AlertType.SERVICE_DEGRADED
        severity = AlertSeverity.WARNING
        break
      case HealthStatus.OUTAGE:
        type = AlertType.SERVICE_OUTAGE
        severity = AlertSeverity.ERROR
        break
      case HealthStatus.OPERATIONAL:
        type = AlertType.SERVICE_RECOVERED
        severity = AlertSeverity.INFO
        break
      default:
        type = AlertType.SERVICE_DEGRADED
        severity = AlertSeverity.WARNING
    }

    // Create a title and message
    const title = `${incident.service} ${incident.status === HealthStatus.OPERATIONAL ? "Recovered" : "Issue"}`
    const message = incident.updates[incident.updates.length - 1]?.message || incident.message

    // Send the alert
    return this.sendAlert(type, severity, title, message, `HealthMonitor.${incident.service}`, { incident })
  }
}
