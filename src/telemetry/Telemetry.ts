/**
 * Telemetry & Logging Module
 * Real-time monitoring and event tracking
 */

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export interface LogEntry {
  level: LogLevel;
  timestamp: number;
  message: string;
  data?: any;
}

export class Telemetry {
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;

  public log(
    level: LogLevel,
    message: string,
    data?: any
  ): void {
    const entry: LogEntry = {
      level,
      timestamp: Math.floor(Date.now() / 1000),
      message,
      data
    };

    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Also print to console
    const prefix = `[${new Date().toISOString()}] [${level}]`;
    if (data) {
      console.log(`${prefix} ${message}`, data);
    } else {
      console.log(`${prefix} ${message}`);
    }
  }

  public debug(message: string, data?: any): void {
    this.log('DEBUG', message, data);
  }

  public info(message: string, data?: any): void {
    this.log('INFO', message, data);
  }

  public warn(message: string, data?: any): void {
    this.log('WARN', message, data);
  }

  public error(message: string, data?: any): void {
    this.log('ERROR', message, data);
  }

  public getLogs(
    filter?: { level?: LogLevel; limit?: number }
  ): LogEntry[] {
    let result = [...this.logs];

    if (filter?.level) {
      result = result.filter((l) => l.level === filter.level);
    }

    if (filter?.limit) {
      result = result.slice(-filter.limit);
    }

    return result;
  }

  public getLastError(): LogEntry | undefined {
    return [...this.logs].reverse().find((l) => l.level === 'ERROR');
  }

  public exportCsv(): string {
    const headers = 'timestamp,level,message,data\n';
    const rows = this.logs
      .map((l) => `${l.timestamp},"${l.level}","${l.message}","${JSON.stringify(l.data || '')}"`)
      .join('\n');
    return headers + rows;
  }
}
