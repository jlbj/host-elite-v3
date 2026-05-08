import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mdx-gallery',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="py-16 px-6 bg-slate-50">
      <div class="max-w-6xl mx-auto">
        @if (title()) {
          <h2 class="text-3xl font-bold text-slate-900 text-center mb-12">{{ title() }}</h2>
        }
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (img of images(); track $index) {
            <div class="aspect-[4/3] rounded-lg overflow-hidden shadow-lg">
              <img [src]="img" alt="Gallery image" class="w-full h-full object-cover hover:scale-105 transition-transform duration-300" />
            </div>
          }
        </div>
      </div>
    </section>
  `
})
export class MdxGalleryComponent {
  title = input('');
  images = input<string[]>([]);
}