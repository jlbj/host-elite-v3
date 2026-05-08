import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-mdx-contact',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="py-16 px-6 bg-amber-50">
      <div class="max-w-4xl mx-auto">
        @if (title()) {
          <h2 class="text-3xl font-bold text-slate-900 text-center mb-4">{{ title() }}</h2>
        }
        @if (subtitle()) {
          <p class="text-slate-600 text-center mb-12">{{ subtitle() }}</p>
        }
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          @if (email()) {
            <div class="text-center p-6 bg-white rounded-xl shadow-md">
              <div class="text-2xl mb-2">✉️</div>
              <p class="font-semibold text-slate-900">Email</p>
              <a [href]="'mailto:' + email()" class="text-amber-600 hover:underline">{{ email() }}</a>
            </div>
          }
          @if (phone()) {
            <div class="text-center p-6 bg-white rounded-xl shadow-md">
              <div class="text-2xl mb-2">📞</div>
              <p class="font-semibold text-slate-900">Phone</p>
              <a [href]="'tel:' + phone()" class="text-amber-600 hover:underline">{{ phone() }}</a>
            </div>
          }
          @if (address()) {
            <div class="text-center p-6 bg-white rounded-xl shadow-md">
              <div class="text-2xl mb-2">📍</div>
              <p class="font-semibold text-slate-900">Address</p>
              <p class="text-slate-600">{{ address() }}</p>
            </div>
          }
        </div>
      </div>
    </section>
  `
})
export class MdxContactComponent {
  title = input('Contact Us');
  subtitle = input('');
  email = input('');
  phone = input('');
  address = input('');
}