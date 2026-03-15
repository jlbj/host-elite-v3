import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../../../services/translation.service';
import { TranslatePipe } from '../../../../pipes/translate.pipe';

@Component({
  selector: 'leg-12-tax-obligations',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="p-8 bg-slate-900 rounded-2xl border border-white/10 animate-fade-in">
      <div class="flex items-center gap-4 mb-6">
        <div class="w-12 h-12 rounded-xl bg-rose-500/20 flex items-center justify-center text-rose-400">
          <span class="material-icons text-3xl">account_balance</span>
        </div>
        <div>
          <h1 class="text-3xl font-bold text-white">{{ 'LEG_LAUNCH.TaxTitle' | translate }}</h1>
          <p class="text-slate-400">{{ 'LEG_LAUNCH.TaxDesc' | translate }}</p>
        </div>
      </div>

      <div class="bg-indigo-600/10 border border-indigo-500/20 p-6 rounded-xl flex items-start gap-4">
        <span class="material-icons text-indigo-400">info</span>
        <div>
          <h4 class="text-white font-bold mb-1">{{ 'LEG_LAUNCH.TaxNoticeTitle' | translate }}</h4>
          <p class="text-sm text-indigo-200/70">{{ 'LEG_LAUNCH.TaxNoticeText' | translate }}</p>
        </div>
      </div>
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class TaxObligationsComponent {
  translate = inject(TranslationService);
}
