import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mdx-testimonials',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="py-16 px-6 bg-slate-900 text-white">
      <div class="max-w-4xl mx-auto text-center">
        @if (title()) {
          <h2 class="text-3xl font-bold mb-12">{{ title() }}</h2>
        }
        <div class="space-y-8">
          @for (testimonial of testimonials(); track $index) {
            <div class="bg-slate-800 p-6 rounded-lg">
              <p class="text-lg text-slate-300 italic mb-4">"{{ testimonial.text }}"</p>
              <div class="flex items-center justify-center gap-3">
                @if (testimonial.avatar) {
                  <img [src]="testimonial.avatar" class="w-10 h-10 rounded-full object-cover" />
                }
                <div>
                  <p class="font-semibold">{{ testimonial.name }}</p>
                  @if (testimonial.location) {
                    <p class="text-slate-400 text-sm">{{ testimonial.location }}</p>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    </section>
  `
})
export class MdxTestimonialsComponent {
  title = input('');
  testimonials = input<{text: string, name: string, location?: string, avatar?: string}[]>([]);
}