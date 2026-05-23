import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-layout-canvas',
  standalone: true,
  imports: [CommonModule],
  template: `<div class="layout-canvas"><ng-content /></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutCanvasComponent {}
