import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mdx-cta',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="py-20 px-6 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-center">
      <div class="max-w-3xl mx-auto">
        <h2 class="text-3xl md:text-4xl font-bold mb-4">{{ title() }}</h2>
        @if (description()) {
          <p class="text-lg text-white/90 mb-8">{{ description() }}</p>
        }
        <a [href]="buttonLink() || '#'" 
           class="inline-block px-8 py-4 bg-white text-amber-600 font-bold rounded-lg hover:bg-white/90 transition shadow-lg">
          {{ buttonText() }}
        </a>
      </div>
    </section>
  `
})
export class MdxCtaComponent {
  title = input('Ready to Book?');
  description = input('');
  buttonText = input('Book Now');
  buttonLink = input('');
}