import { Component, input, output, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PavingStoreService } from '../services/paving-store.service';

@Component({
  selector: 'app-layout-manager',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (isOpen()) {
      <div class="layout-manager-overlay" (click)="onClose.emit()">
        <div class="layout-manager-modal" (click)="$event.stopPropagation()">
          @if (mode() === 'save') {
            <h3 class="layout-manager-title">Save Custom Layout</h3>
            <input
              type="text"
              [(ngModel)]="layoutName"
              (keydown.enter)="handleSave()"
              (keydown.escape)="onClose.emit()"
              placeholder="Enter layout name..."
              class="layout-manager-input"
              autofocus />
            @if (error()) {
              <div class="layout-manager-error">{{ error() }}</div>
            }
            <div class="layout-manager-actions">
              <button class="btn-secondary" (click)="onClose.emit()">Cancel</button>
              <button class="btn-primary" (click)="handleSave()" [disabled]="saving()">
                {{ saving() ? 'Saving...' : 'Save Layout' }}
              </button>
            </div>
          } @else {
            <h3 class="layout-manager-title">Load Custom Layout</h3>
            @if (layouts().length === 0) {
              <div class="layout-manager-empty">No saved layouts yet.</div>
            } @else {
              <div class="layout-manager-list">
                @for (layout of layouts(); track layout.id) {
                  <div class="layout-manager-item" [class.delete-mode]="deleteConfirm() === layout.id">
                    @if (deleteConfirm() === layout.id) {
                      <span class="delete-confirm-text">Delete "{{ layout.name }}"?</span>
                      <button class="btn-danger-sm" (click)="handleDelete(layout.id)">Confirm</button>
                      <button class="btn-secondary-sm" (click)="deleteConfirm.set(null)">Cancel</button>
                    } @else {
                      <div class="layout-item-info">
                        <div class="layout-item-name">{{ layout.name }}</div>
                        <div class="layout-item-date">{{ layout.created_at ? (layout.created_at | date) : 'N/A' }}</div>
                      </div>
                      <button class="btn-load" (click)="handleLoad(layout.id)">Load</button>
                      <button class="btn-delete-icon" (click)="deleteConfirm.set(layout.id)">🗑️</button>
                    }
                  </div>
                }
              </div>
            }
            <div class="layout-manager-actions">
              <button class="btn-secondary" (click)="onClose.emit()">Close</button>
            </div>
          }
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutManagerComponent {
  isOpen = input(false);
  mode = input<'save' | 'load'>('save');
  onClose = output<void>();

  private store = inject(PavingStoreService);

  layoutName = signal('');
  error = signal<string | null>(null);
  saving = signal(false);
  deleteConfirm = signal<string | null>(null);

  layouts = signal<{ id: string; name: string; created_at?: string; type?: string }[]>([]);

  constructor() {
    // Reset state when opened
    this.layouts.set(this.store.availableLayouts().filter(l => l.type === 'custom'));
  }

  handleSave(): void {
    const name = this.layoutName().trim();
    if (!name) {
      this.error.set('Please enter a layout name');
      return;
    }
    this.saving.set(true);
    this.error.set(null);
    this.store.saveCustomLayout(name).then(success => {
      this.saving.set(false);
      if (success) {
        this.layoutName.set('');
        this.onClose.emit();
      } else {
        this.error.set('Failed to save layout. Check console for details.');
      }
    });
  }

  handleLoad(id: string): void {
    this.store.loadCustomLayout(id);
    this.onClose.emit();
  }

  async handleDelete(id: string): Promise<void> {
    await this.store.deleteCustomLayout(id);
    this.layouts.set(this.store.availableLayouts().filter(l => l.type === 'custom'));
    this.deleteConfirm.set(null);
  }
}
