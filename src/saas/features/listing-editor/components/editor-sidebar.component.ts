import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PavingStoreService } from '../services/paving-store.service';
import { SectionListComponent } from './section-list.component';
import { SectionConfigPanelComponent } from './section-config-panel.component';
import { SECTION_TYPES } from '../constants/paving.constants';

@Component({
  selector: 'app-editor-sidebar',
  standalone: true,
  imports: [CommonModule, SectionListComponent, SectionConfigPanelComponent],
  template: `
    @if (!store.sidebarOpen()) {
      <button class="sidebar-toggle" (click)="store.toggleSidebar()">
        ☰ Sections
      </button>
    }
    <div class="editor-sidebar" [class.collapsed]="!store.sidebarOpen()">
      @if (store.sidebarOpen()) {
        <div class="sidebar-header">
          <div class="sidebar-tabs">
            <button
              class="sidebar-tab"
              [class.active]="store.sidebarTab() === 'sections'"
              (click)="store.sidebarTab.set('sections')">
              Sections
            </button>
            <button
              class="sidebar-tab"
              [class.active]="store.sidebarTab() === 'config'"
              [class.disabled]="!store.selectedSectionId()"
              [disabled]="!store.selectedSectionId()"
              (click)="store.sidebarTab.set('config')">
              Config
            </button>
          </div>
          <button class="sidebar-close" (click)="closeSidebar()">✕</button>
        </div>

        @if (store.sidebarTab() === 'sections' && showBlockTools()) {
          <div class="block-tools">
            <button
              class="block-tool-btn"
              (click)="store.splitBlock(store.selectedBlockId()!, 'vertical')"
              title="Split Vertical">
              <span class="tool-icon">✂</span>
            </button>
            <button
              class="block-tool-btn"
              (click)="store.splitBlock(store.selectedBlockId()!, 'horizontal')"
              title="Split Horizontal">
              <span class="tool-icon rotated">✂</span>
            </button>
            <button
              class="block-tool-btn"
              (click)="store.undoBlocks()"
              [class.disabled]="store.blockHistory().past.length === 0"
              [disabled]="store.blockHistory().past.length === 0"
              title="Undo">
              ↩
            </button>
            <button
              class="block-tool-btn"
              (click)="store.redoBlocks()"
              [class.disabled]="store.blockHistory().future.length === 0"
              [disabled]="store.blockHistory().future.length === 0"
              title="Redo">
              ↪
            </button>
            <button
              class="block-tool-btn"
              (click)="mergeSelected()"
              [class.disabled]="store.selectedBlockIds().length !== 2"
              [disabled]="store.selectedBlockIds().length !== 2"
              title="Merge selected blocks">
              ⊞
            </button>
          </div>
        }

        <div class="sidebar-content">
        @if (store.sidebarTab() === 'sections') {
          <app-section-list />
        } @else {
          <app-section-config-panel />
        }
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorSidebarComponent {
  store = inject(PavingStoreService);

  sortedSections = computed(() =>
    [...this.store.pageConfig().sections].sort((a, b) => a.order - b.order)
  );

  showBlockTools = computed(() =>
    !!this.store.selectedBlockId() && this.store.editorMode() === 'layout'
  );

  closeSidebar(): void {
    this.store.toggleSidebar();
  }

  mergeSelected(): void {
    const ids = this.store.selectedBlockIds();
    if (ids.length === 2) {
      this.store.mergeBlocksById(ids[0], ids[1]);
    }
  }
}
