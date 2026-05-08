import { Component, signal, inject, HostListener, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoggingService, LogEntry, LogCategory } from '../services/logging.service';

@Component({
  selector: 'app-logs-panel',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button (click)="toggle()" 
            class="fixed top-4 right-4 z-[9998] px-3 py-1.5 bg-slate-800 text-white text-xs font-mono rounded border border-slate-600 hover:bg-slate-700 shadow-lg">
      📋 Logs
    </button>
    
    @if (isVisible()) {
      <div class="fixed inset-0 bg-black/50 z-[9999] flex items-end" (click)="toggle()">
        <div class="w-full max-w-full max-h-[80vh] bg-slate-900 border-t-2 border-slate-700 text-white flex flex-col font-mono text-xs" (click)="$event.stopPropagation()">
          <div class="flex items-center justify-between px-3 py-2 bg-slate-800 border-b border-slate-700 flex-wrap gap-2">
            <div class="flex items-center gap-2">
              <span class="text-yellow-400 font-bold">LOGS</span>
            </div>
            <div class="flex items-center gap-2">
              <select (change)="filterCategory($event)" class="bg-slate-700 text-white px-2 py-1 rounded border border-slate-600 text-xs">
                <option value="">All</option>
                <option value="USER_EVENT">User</option>
                <option value="DB_QUERY">DB</option>
                <option value="AI_PROMPT">AI</option>
                <option value="APP_STATE">State</option>
                <option value="SYSTEM">System</option>
              </select>
              <button (click)="clearLogs()" class="px-2 py-1 bg-red-600 hover:bg-red-500 rounded text-xs">Clear</button>
              <button (click)="toggle()" class="px-2 py-1 bg-slate-600 hover:bg-slate-500 rounded text-xs">✕</button>
            </div>
          </div>
        
        <div class="flex-1 overflow-y-auto p-2 space-y-1 max-h-[50vh]">
          @for (log of filteredLogs(); track log.id) {
            <div class="px-2 py-1.5 rounded bg-slate-800/50 hover:bg-slate-800 text-[10px] sm:text-xs"
                 [class.border-l-2]="true"
                 [class.border-l-green-400]="log.level === 'INFO'"
                 [class.border-l-yellow-400]="log.level === 'WARN'"
                 [class.border-l-red-400]="log.level === 'ERROR'"
                 [class.border-l-blue-400]="log.level === 'DEBUG'">
              <div class="flex flex-wrap items-center gap-1 sm:gap-2">
                <span class="text-slate-500">{{ log.timestamp.split(' ')[1] }}</span>
                <span class="px-1 rounded text-[9px] font-bold shrink-0"
                      [class.bg-green-900]="log.category === 'USER_EVENT'"
                      [class.text-green-300]="log.category === 'USER_EVENT'"
                      [class.bg-blue-900]="log.category === 'DB_QUERY'"
                      [class.text-blue-300]="log.category === 'DB_QUERY'"
                      [class.bg-purple-900]="log.category === 'AI_PROMPT'"
                      [class.text-purple-300]="log.category === 'AI_PROMPT'"
                      [class.bg-cyan-900]="log.category === 'APP_STATE'"
                      [class.text-cyan-300]="log.category === 'APP_STATE'"
                      [class.bg-slate-700]="log.category === 'SYSTEM'"
                      [class.text-slate-300]="log.category === 'SYSTEM'">
                  {{ log.category }}
                </span>
                <span class="text-slate-200 break-all">{{ log.message }}</span>
                @if (log.duration) {
                  <span class="text-slate-500 shrink-0">{{ log.duration }}ms</span>
                }
              </div>
              @if (log.context && log.category === 'AI_PROMPT') {
                <div class="mt-1 text-slate-400 text-[9px] break-all">
                  {{ getContextPreview(log) }}
                </div>
              }
            </div>
          } @empty {
            <div class="text-center text-slate-500 py-4">No logs yet</div>
          }
        </div>
        
        <div class="px-3 py-1 bg-slate-800 border-t border-slate-700 text-slate-400 text-[10px]">
          {{ filteredLogs().length }} logs • {{ loggingService.getLogs().length }} total
        </div>
        </div>
      </div>
    }
  `
})
export class LogsPanelComponent {
  loggingService = inject(LoggingService);
  isVisible = signal(false);
  categoryFilter = signal<LogCategory | ''>('');

  filteredLogs = computed(() => {
    const filter = this.categoryFilter();
    const logs = this.loggingService.getLogs();
    if (!filter) return logs;
    return logs.filter(log => log.category === filter);
  });

  toggle(): void {
    this.isVisible.update(v => !v);
  }

  filterCategory(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as LogCategory | '';
    this.categoryFilter.set(value);
  }

  clearLogs(): void {
    this.loggingService.clearLogs();
  }

  getContextPreview(log: LogEntry): string {
    if (!log.context) return '';
    const ctx = log.context;
    if (log.category === 'AI_PROMPT' && ctx['prompt']) {
      const prompt = ctx['prompt'] as string;
      return prompt.substring(0, 200) + (prompt.length > 200 ? '...' : '');
    }
    return JSON.stringify(ctx).substring(0, 150);
  }
}