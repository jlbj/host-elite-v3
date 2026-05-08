import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mdx-hero',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="relative h-[60vh] min-h-[400px] flex items-center justify-center text-center px-6"
         [style.background-image]="backgroundImage() ? 'url(' + backgroundImage() + ')' : ''"
         [style.background-size]="'cover'"
         [style.background-position]="'center'">
      @if (backgroundImage()) {
        <div class="absolute inset-0 bg-black/40"></div>
      }
      <div class="relative z-10 max-w-4xl">
        @if (subtitle()) {
          <p class="text-white/90 text-lg mb-4 tracking-wide uppercase">{{ subtitle() }}</p>
        }
        <h1 class="text-4xl md:text-6xl font-bold text-white mb-6">{{ title() }}</h1>
        @if (description()) {
          <p class="text-white/80 text-lg md:text-xl max-w-2xl mx-auto">{{ description() }}</p>
        }
        @if (ctaText()) {
          <a [href]="ctaLink() || '#'" 
             class="inline-block mt-8 px-8 py-3 bg-white text-slate-900 font-semibold rounded-lg hover:bg-white/90 transition">
            {{ ctaText() }}
          </a>
        }
      </div>
    </div>
  `
})
export class MdxHeroComponent {
  title = input('Welcome');
  subtitle = input('');
  description = input('');
  ctaText = input('');
  ctaLink = input('');
  backgroundImage = input('');
}