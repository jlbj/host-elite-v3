
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { View } from '../../types';
import { PropertyDashboardViewComponent } from './property-dashboard-view.component';

@Component({
  selector: 'saas-property-view',
  standalone: true,
  imports: [CommonModule, PropertyDashboardViewComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-6">
      <!-- Content -->
      <div class="pt-2">
        <saas-property-dashboard-view [propertyName]="view().propertyName || ''"></saas-property-dashboard-view>
      </div>
    </div>
  `
})
export class PropertyViewComponent {
  view = input.required<View>();
}
