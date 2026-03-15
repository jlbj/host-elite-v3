import { Component, inject, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../../../services/translation.service';
import { TranslatePipe } from '../../../../pipes/translate.pipe';

@Component({
  selector: 'leg-11-insurance-requirements',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="p-8 bg-slate-900 rounded-2xl border border-white/10 animate-fade-in">
      <div class="flex items-center gap-4 mb-8">
        <div class="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
          <span class="material-icons text-3xl">security</span>
        </div>
        <div>
          <h1 class="text-3xl font-bold text-white">{{ 'LEG_LAUNCH.InsuranceTitle' | translate }}</h1>
          <p class="text-slate-400 mt-1">{{ 'LEG_LAUNCH.InsuranceDesc' | translate }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        @for (item of requirements; track item.id) {
          <button 
            (click)="selectItem(item)"
            class="p-6 bg-white/5 rounded-xl border border-white/5 hover:border-amber-500/50 hover:bg-white/10 transition-all text-left group cursor-pointer">
            <span class="material-icons text-3xl text-amber-500 mb-3">{{ item.icon }}</span>
            <h4 class="text-lg font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">{{ item.title | translate }}</h4>
            <p class="text-xs text-slate-400">{{ item.desc | translate }}</p>
          </button>
        }
      </div>

      @if (selectedItem()) {
        <div class="mt-8 p-6 bg-amber-500/10 border border-amber-500/30 rounded-xl">
          <div class="flex items-center gap-3 mb-3">
            <span class="material-icons text-amber-400">construction</span>
            <h4 class="text-white font-bold">{{ selectedItem()?.title | translate }} - Coming Soon</h4>
          </div>
          <p class="text-sm text-slate-400">This feature is under development. Check back soon for insurance tools and guidance.</p>
          <button (click)="selectedItem.set(null)" class="mt-4 text-xs text-amber-400 hover:text-amber-300">← Back to overview</button>
        </div>
      }
    </div>
  `,
  styles: [`:host { display: block; }`]
})
export class InsuranceRequirementsComponent {
  translate = inject(TranslationService);
  selectFeature = input<(featureId: string) => void | undefined>();
  selectedItem = signal<any>(null);

  requirements = [
    { id: 1, icon: 'home', title: 'LEG_LAUNCH.PNO', desc: 'LEG_LAUNCH.PNODesc' },
    { id: 2, icon: 'public', title: 'LEG_LAUNCH.Liability', desc: 'LEG_LAUNCH.LiabilityDesc' },
    { id: 3, icon: 'assignment_turned_in', title: 'LEG_LAUNCH.Audit', desc: 'LEG_LAUNCH.AuditDesc' }
  ];

  selectItem(item: any) {
    this.selectedItem.set(item);
  }
}
