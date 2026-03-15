import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../../../services/translation.service';
import { TranslatePipe } from '../../../../pipes/translate.pipe';

@Component({
  selector: 'leg-10-property-licensing',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="p-8 bg-slate-900 rounded-2xl border border-white/10 animate-fade-in">
      <div class="flex items-center gap-4 mb-8">
        <div class="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
          <span class="material-icons text-3xl">verified_user</span>
        </div>
        <div>
          <h1 class="text-3xl font-bold text-white">{{ 'LEG_LAUNCH.LicensingTitle' | translate }}</h1>
          <p class="text-slate-400 mt-1">{{ 'LEG_LAUNCH.LicensingDesc' | translate }}</p>
        </div>
      </div>

      <div class="p-12 bg-white/5 rounded-2xl border border-white/5 text-center">
        <span class="material-icons text-6xl text-slate-600 mb-4">gavel</span>
        <h3 class="text-xl font-bold text-white mb-2">{{ 'LEG_LAUNCH.ComplianceCheck' | translate }}</h3>
        <p class="text-slate-400 mb-6 max-w-md mx-auto">{{ 'LEG_LAUNCH.ComplianceText' | translate }}</p>
        <button 
          (click)="onStartCheck()"
          class="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95">
          {{ 'LEG_LAUNCH.StartCheck' | translate }}
        </button>
      </div>
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class PropertyLicensingComponent {
  translate = inject(TranslationService);
  selectFeature = input<(featureId: string) => void | undefined>();

  onStartCheck() {
    const callback = this.selectFeature();
    if (callback) {
      callback('LEG_00');
    }
  }
}
