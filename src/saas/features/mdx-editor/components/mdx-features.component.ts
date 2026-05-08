import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mdx-features',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="py-16 px-6">
      <div class="max-w-6xl mx-auto">
        @if (title()) {
          <h2 class="text-3xl font-bold text-slate-900 text-center mb-12">{{ title() }}</h2>
        }
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          @for (feature of features(); track $index) {
            <div class="p-6 bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow">
              <div class="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4 text-amber-600 text-2xl">
                {{ feature.icon || '✓' }}
              </div>
              <h3 class="text-xl font-semibold text-slate-900 mb-2">{{ feature.title }}</h3>
              <p class="text-slate-600">{{ feature.description }}</p>
            </div>
          }
        </div>
      </div>
    </section>
  `
})
export class MdxFeaturesComponent {
  title = input('');
  features = input<{icon?: string, title: string, description: string}[]>([]);
}