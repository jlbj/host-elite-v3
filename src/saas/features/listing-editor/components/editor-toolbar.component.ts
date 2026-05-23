import { Component, inject, signal, computed, OnInit, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PavingStoreService } from '../services/paving-store.service';
import { THEMES } from '../constants/paving.constants';
import { LayoutManagerComponent } from './layout-manager.component';

const VIEW_OPTIONS = [
  { id: 'mobile' as const, label: 'Mobile', icon: '📱' },
  { id: 'mobile-horizontal' as const, label: 'Mobile H', icon: '📱' },
  { id: 'tablet' as const, label: 'Tablet', icon: '📱' },
  { id: 'desktop' as const, label: 'Desktop', icon: '💻' },
];

@Component({
  selector: 'app-editor-toolbar',
  standalone: true,
  imports: [CommonModule, FormsModule, LayoutManagerComponent],
  template: `
    <div class="editor-toolbar">
      <div class="toolbar-title">{{ store.propertyData()?.name || 'Property Editor' }}</div>

      <div class="toolbar-spacer"></div>

      <div class="toolbar-view-modes">
        <button class="view-mode-btn" (click)="store.toggleFullScreen()" title="Full Display Mode (preview)">🖥️</button>
        @for (view of VIEW_OPTIONS; track view.id) {
          <button
            class="view-mode-btn"
            [class.active]="store.viewMode() === view.id"
            (click)="store.setViewMode(view.id)"
            [title]="view.label">
            {{ view.icon }}
          </button>
        }
      </div>

      <div class="toolbar-layout-dropdown" #dropdownRef>
        <button class="layout-dropdown-btn" (click)="toggleDropdown()">
          <span class="layout-dropdown-label">{{ currentLayoutName() }}</span>
          <span class="layout-dropdown-arrow">▼</span>
        </button>
        @if (dropdownOpen()) {
          <div class="dropdown-menu">
            @for (layout of store.availableLayouts(); track layout.id) {
              <div class="dropdown-item" [class.active]="dropdownValue() === layout.id">
                <button class="dropdown-item-btn" (click)="selectLayout(layout.id)">{{ layout.name }}</button>
                @if (layout.type === 'custom') {
                  <button class="dropdown-delete-btn" (click)="deleteLayout(layout.id)" title="Delete layout">🗑️</button>
                }
              </div>
            }
          </div>
        }
      </div>

      @if (store.isLayoutEditing()) {
        @if (showSaveInput()) {
          <div class="save-input-group">
            <input
              type="text"
              [(ngModel)]="saveName"
              (keydown.enter)="confirmSave()"
              (keydown.escape)="cancelEdit()"
              placeholder="Layout name..."
              class="save-name-input"
              autofocus />
            <button class="btn-save-small" (click)="confirmSave()">Save</button>
            <button class="btn-cancel-small" (click)="cancelEdit()">Cancel</button>
          </div>
        } @else {
          <button class="btn-save-layout" (click)="handleSaveClick()">Save Layout</button>
          <button class="btn-cancel-layout" (click)="cancelEdit()">Cancel</button>
        }
      }

      <select
        class="theme-select"
        [ngModel]="store.pageConfig().theme"
        (ngModelChange)="store.setTheme($event)">
        @for (theme of THEMES; track theme.id) {
          <option [value]="theme.id">{{ theme.name }}</option>
        }
      </select>

      <button
        class="btn-save-config"
        (click)="handleSaveClick()"
        [disabled]="store.isSaving()">
        {{ store.isSaving() ? 'Saving...' : 'Save' }}
      </button>

      <app-layout-manager
        [isOpen]="layoutManagerOpen()"
        [mode]="layoutManagerMode()"
        (onClose)="layoutManagerOpen.set(false)" />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorToolbarComponent implements OnInit, OnDestroy {
  store = inject(PavingStoreService);
  readonly THEMES = THEMES;
  readonly VIEW_OPTIONS = VIEW_OPTIONS;

  dropdownOpen = signal(false);
  saveName = signal('');
  showSaveInput = signal(false);
  layoutManagerOpen = signal(false);
  layoutManagerMode = signal<'save' | 'load'>('save');

  dropdownValue = computed(() =>
    this.store.isLayoutEditing()
      ? this.store.editingLayoutId()
      : (this.store.selectedCustomLayoutId() || this.store.pageConfig().layout)
  );

  currentLayoutName = computed(() => {
    const dv = this.dropdownValue();
    const layout = this.store.availableLayouts().find(l => l.id === dv);
    return layout?.name || (this.store.pageConfig().layout === 'custom' ? 'Custom' : this.store.pageConfig().layout);
  });

  private clickHandler: ((e: MouseEvent) => void) | null = null;

  ngOnInit(): void {
    this.store.loadLayouts();
    this.clickHandler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.toolbar-layout-dropdown')) {
        this.dropdownOpen.set(false);
      }
    };
    document.addEventListener('mousedown', this.clickHandler);
  }

  ngOnDestroy(): void {
    if (this.clickHandler) {
      document.removeEventListener('mousedown', this.clickHandler);
    }
  }

  toggleDropdown(): void {
    this.dropdownOpen.update(v => !v);
  }

  selectLayout(layoutId: string): void {
    this.store.setLayout(layoutId);
    this.dropdownOpen.set(false);
  }

  async deleteLayout(layoutId: string): Promise<void> {
    await this.store.deleteCustomLayout(layoutId);
    this.dropdownOpen.set(false);
  }

  handleSaveClick(): void {
    if (this.store.pageConfig().layout === 'custom') {
      const editingId = this.store.editingLayoutId();
      const isEditingCustom = editingId && this.store.availableLayouts().find(l => l.id === editingId)?.type === 'custom';
      if (isEditingCustom) {
        this.store.saveCustomLayout('');
      } else {
        const existingLayout = editingId ? this.store.availableLayouts().find(l => l.id === editingId) : null;
        this.saveName.set(existingLayout ? `${existingLayout.name} (copy)` : '');
        this.showSaveInput.set(true);
      }
    } else {
      this.store.saveConfig();
    }
  }

  async confirmSave(): Promise<void> {
    if (!this.saveName().trim()) return;
    const success = await this.store.saveCustomLayout(this.saveName().trim());
    if (success) {
      this.showSaveInput.set(false);
      this.saveName.set('');
    }
  }

  cancelEdit(): void {
    this.showSaveInput.set(false);
    this.saveName.set('');
    this.store.cancelEditing();
  }
}
