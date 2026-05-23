import { Component, OnInit, OnDestroy, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PavingStoreService } from '../services/paving-store.service';
import { EditorToolbarComponent } from './editor-toolbar.component';
import { EditorCanvasComponent } from './editor-canvas.component';
import { EditorSidebarComponent } from './editor-sidebar.component';
import { PavingCanvasComponent } from './paving-canvas.component';

@Component({
  selector: 'app-editor-shell',
  standalone: true,
  imports: [CommonModule, EditorToolbarComponent, EditorCanvasComponent, EditorSidebarComponent, PavingCanvasComponent],
  template: `
    @if (store.isFullScreen()) {
      <div class="editor-fullscreen">
        <app-editor-canvas>
          <app-paving-canvas />
        </app-editor-canvas>
        <button
          class="editor-fullscreen-exit"
          (click)="store.toggleFullScreen()"
          title="Exit Full Display Mode (Esc)">
          ✕ Exit Preview
        </button>
      </div>
    } @else {
      <div class="editor-shell">
        <app-editor-toolbar />
        <div class="editor-main">
          <app-editor-canvas>
            <app-paving-canvas />
          </app-editor-canvas>
          @if (showSidebar()) {
            <app-editor-sidebar />
          }
        </div>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorShellComponent implements OnInit, OnDestroy {
  store = inject(PavingStoreService);

  showSidebar = () => this.store.sidebarOpen() && !this.store.isLayoutEditing();

  private fullscreenHandler: ((e: KeyboardEvent) => void) | null = null;

  ngOnInit(): void {
    this.fullscreenHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') this.store.toggleFullScreen();
    };
    window.addEventListener('keydown', this.fullscreenHandler);
  }

  ngOnDestroy(): void {
    if (this.fullscreenHandler) {
      window.removeEventListener('keydown', this.fullscreenHandler);
    }
  }
}
