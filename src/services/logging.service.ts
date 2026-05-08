import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
export type LogCategory = 'USER_EVENT' | 'DB_QUERY' | 'AI_PROMPT' | 'APP_STATE' | 'SYSTEM';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  context?: Record<string, unknown>;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class LoggingService {
  private supabaseService = inject(SupabaseService);
  private logs: LogEntry[] = [];
  private readonly STORAGE_KEY = 'app_logs';
  private readonly MAX_LOCAL_LOGS = 1000;
  private syncInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.loadFromStorage();
    this.startPeriodicSync();
    this.logAppState('App initialized');
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
  }

  private formatTimestamp(): string {
    const now = new Date();
    return now.toISOString().replace('T', ' ').substring(0, 19);
  }

  private createEntry(
    level: LogLevel,
    category: LogCategory,
    message: string,
    context?: Record<string, unknown>,
    duration?: number
  ): LogEntry {
    return {
      id: this.generateId(),
      timestamp: this.formatTimestamp(),
      level,
      category,
      message,
      context,
      duration
    };
  }

  private log(entry: LogEntry): void {
    this.logs.unshift(entry);
    if (this.logs.length > this.MAX_LOCAL_LOGS) {
      this.logs.pop();
    }
    this.saveToStorage();
    this.consoleOutput(entry);
    console.log('[LOG]', entry.category, '-', entry.message);
  }

  private consoleOutput(entry: LogEntry): void {
    const prefix = `[${entry.timestamp}] [${entry.category}]`;
    const suffix = entry.duration ? ` • ${entry.duration}ms` : '';
    const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : '';

    switch (entry.level) {
      case 'ERROR':
        console.error(`${prefix} ${entry.message}${suffix}${contextStr}`);
        break;
      case 'WARN':
        console.warn(`${prefix} ${entry.message}${suffix}${contextStr}`);
        break;
      case 'DEBUG':
        console.debug(`${prefix} ${entry.message}${suffix}${contextStr}`);
        break;
      default:
        console.log(`${prefix} ${entry.message}${suffix}${contextStr}`);
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load logs from storage:', e);
    }
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.logs));
    } catch (e) {
      console.warn('Failed to save logs to storage:', e);
    }
  }

  private startPeriodicSync(): void {
    this.syncInterval = setInterval(() => {
      this.syncToDatabase();
    }, 30000);
  }

  private async syncToDatabase(): Promise<void> {
    if (!this.supabaseService.isConfigured || this.logs.length === 0) {
      return;
    }

    const logsToSync = this.logs.slice(0, 50);
    const entries = logsToSync.map(log => ({
      timestamp: log.timestamp,
      level: log.level,
      category: log.category,
      message: log.message,
      context: log.context ? JSON.stringify(log.context) : null,
      duration: log.duration || null
    }));

    try {
      const { error } = await this.supabaseService.supabase
        .from('app_logs')
        .insert(entries);

      if (error) {
        console.warn('Failed to sync logs to database:', error.message);
      }
    } catch (e) {
      console.warn('Error syncing logs to database:', e);
    }
  }

  logUserEvent(action: string, context?: Record<string, unknown>): void {
    const entry = this.createEntry('INFO', 'USER_EVENT', action, context);
    this.log(entry);
  }

  logDatabaseQuery(
    operation: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE',
    table: string,
    rowCount?: number,
    duration?: number,
    context?: Record<string, unknown>
  ): void {
    const message = `${operation} ${table}${rowCount !== undefined ? ` • ${rowCount} rows` : ''}`;
    const entry = this.createEntry('INFO', 'DB_QUERY', message, context, duration);
    this.log(entry);
  }

  logAiPrompt(
    provider: string,
    model: string,
    prompt: string,
    responseStatus: 'success' | 'error',
    duration?: number,
    context?: Record<string, unknown>
  ): void {
    const tokenCount = Math.round(prompt.length / 4);
    const statusStr = responseStatus === 'success' ? '✓' : '✗';
    const message = `${provider} ${model} • ${tokenCount} tokens • ${statusStr}`;
    const entry = this.createEntry(
      responseStatus === 'error' ? 'ERROR' : 'INFO',
      'AI_PROMPT',
      message,
      { ...context, prompt: prompt.substring(0, 10000) },
      duration
    );
    this.log(entry);
  }

  logAppState(state: string, context?: Record<string, unknown>): void {
    const entry = this.createEntry('DEBUG', 'APP_STATE', state, context);
    this.log(entry);
  }

  logSystem(message: string, level: LogLevel = 'INFO', context?: Record<string, unknown>): void {
    const entry = this.createEntry(level, 'SYSTEM', message, context);
    this.log(entry);
  }

  getLogs(): LogEntry[] {
    return this.logs;
  }

  clearLogs(): void {
    this.logs = [];
    localStorage.removeItem(this.STORAGE_KEY);
  }

  getLogsByCategory(category: LogCategory): LogEntry[] {
    return this.logs.filter(log => log.category === category);
  }

  ngOnDestroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
  }
}