import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mdx-text',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="py-16 px-6">
      <div class="max-w-4xl mx-auto">
        @if (title()) {
          <h2 class="text-3xl font-bold text-slate-900 mb-8">{{ title() }}</h2>
        }
        <div class="prose prose-lg max-w-none text-slate-700" [innerHTML]="content()"></div>
      </div>
    </section>
  `
})
export class MdxTextComponent {
  title = input('');
  content = input('');
}