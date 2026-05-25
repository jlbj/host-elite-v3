import { Component, AfterViewInit, ElementRef, inject, viewChild, ChangeDetectionStrategy, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PavingStoreService } from '../services/paving-store.service';

@Component({
  selector: 'app-editor-canvas',
  standalone: true,
  imports: [CommonModule],
  host: { style: 'display: flex; flex-direction: column; flex: 1; min-width: 0; min-height: 0; width: 100%; overflow: hidden;' },
  template: `
    <div #canvasRef class="editor-canvas view-{{ store.viewMode() }}" [style]="cssVars()">
      <ng-content />
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorCanvasComponent implements AfterViewInit, OnDestroy {
  store = inject(PavingStoreService);
  private canvasRef = viewChild<ElementRef<HTMLElement>>('canvasRef');
  private resizeHandler: (() => void) | null = null;

  cssVars(): Record<string, string> {
    const theme = this.store.getTheme();
    if (!theme) return {};
    return {
      '--color-primary': theme.colors.primary,
      '--color-primary-light': theme.colors.primaryLight,
      '--color-secondary': theme.colors.secondary,
      '--color-accent': theme.colors.accent,
      '--color-background': theme.colors.background,
      '--color-surface': theme.colors.surface,
      '--color-text': theme.colors.text,
      '--color-text-muted': theme.colors.textMuted,
      '--color-border': theme.colors.border,
      '--font-heading': theme.typography.headingFont,
      '--font-body': theme.typography.bodyFont,
      '--border-radius': theme.borders.radius,
    };
  }

  ngAfterViewInit(): void {
    const updateDimensions = () => {
      const el = this.canvasRef();
      if (el) {
        const rect = el.nativeElement.getBoundingClientRect();
        this.store.setContainerDimensions(rect.width, rect.height);
      }
    };

    updateDimensions();
    this.resizeHandler = updateDimensions;
    window.addEventListener('resize', updateDimensions);
  }

  ngOnDestroy(): void {
    if (this.resizeHandler) {
      window.removeEventListener('resize', this.resizeHandler);
    }
  }
}
