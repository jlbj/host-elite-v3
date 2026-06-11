import { TranslationService } from '../../../../services/translation.service';
import { Component, computed, inject, signal, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Feature } from '../../../../types';
import { SessionStore } from '../../../../state/session.store';
import { TranslatePipe } from '../../../../pipes/translate.pipe';

@Component({
    selector: 'leg-04-vut-license',
    standalone: true,
    imports: [CommonModule,
    TranslatePipe
  ],
    template: `
    <div class="h-full flex flex-col gap-6 animate-fade-in-up">
      <div class="flex justify-between items-start">
        <div>
          <h1 class="text-3xl font-extrabold text-white tracking-tight">{{ 'VUT.SpanishVutManager' | translate }}</h1>
          <p class="text-slate-400 mt-2 max-w-2xl">{{ 'VUT.StepbystepViviendaDeUsoTurstico' | translate }}</p>
          @if (propertyDetails()?.rental_mode && propertyDetails()?.rental_mode !== 'entire_place') {
            <span class="inline-block mt-2 px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 rounded-full text-xs font-bold text-indigo-300">
              {{ rentalModeLabel() }}
            </span>
          }
        </div>
        <div class="px-4 py-2 rounded-lg border text-xs font-mono uppercase tracking-wider"
             [ngClass]="{
                'bg-slate-800 text-slate-400 border-slate-700': isTier0(),
                'bg-yellow-500/20 text-yellow-300 border-yellow-500/30': !isTier0()
             }">
             {{ isTier3() ? 'License Dashboard' : (isTier2() ? 'Regional Wizard' : 'Checklist') }}
        </div>
      </div>

       <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0">
           <!-- Checklists & Logic -->
           <div class="bg-slate-800 rounded-xl border border-white/10 p-6 flex flex-col overflow-y-auto">
               <h3 class="text-xl font-bold text-white mb-6">{{ 'VUT.LicenseRequirements' | translate }}</h3>
               
               <div class="mb-6">
                   <label class="block text-slate-400 text-xs uppercase font-bold mb-2">{{ 'VUT.RegionComunidadAutnoma' | translate }}</label>
                   @if (isTier2()) {
                       <select class="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-white">
                           <option>{{ 'VUT.AndalucaJunta' | translate }}</option>
                           <option>{{ 'VUT.Madrid' | translate }}</option>
                           <option>{{ 'VUT.CatalunyaGeneralitat' | translate }}</option>
                           <option>{{ 'VUT.Valencia' | translate }}</option>
                       </select>
                   } @else {
                       <div class="p-3 bg-white/5 rounded text-slate-400 text-xs italic border border-white/5">
                           Unlock detailed regional rules (Andalucía, Madrid, etc.) on Silver Tier.
                       </div>
                   }
               </div>

               <div class="space-y-4 flex-1">
                   <div class="bg-white/5 p-4 rounded-lg flex items-start gap-3 transition-colors hover:bg-white/10">
                       <input type="checkbox" checked class="mt-1 bg-transparent border-emerald-500 rounded text-emerald-500 focus:ring-0" data-debug-id="vut-check-cedula">
                       <div>
                           <div class="text-white font-bold text-sm">{{ 'VUT.CdulaDeHabitabilidad' | translate }}</div>
                           <p class="text-xs text-slate-500">{{ 'VUT.ValidOccupancyCertificateRequiredMax' | translate }}</p>
                       </div>
                   </div>
                   <div class="bg-white/5 p-4 rounded-lg flex items-start gap-3 transition-colors hover:bg-white/10">
                       <input type="checkbox" class="mt-1 bg-transparent border-slate-600 rounded text-emerald-500 focus:ring-0" data-debug-id="vut-check-occupation">
                       <div>
                           <div class="text-white font-bold text-sm">{{ 'VUT.FirstOccupationLicense' | translate }}</div>
                           <p class="text-xs text-slate-500">"Licencia de Primera Ocupación" registered at Town Hall.</p>
                       </div>
                   </div>
                   
                   @if (isTier3()) {
                       <div class="mt-6 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                           <h4 class="text-indigo-300 font-bold mb-2 flex items-center gap-2">
                               <span class="material-icons text-sm">gavel</span>{{ 'VUT.StatuteAnalyzerAi' | translate }}</h4>
                           <p class="text-xs text-slate-400 mb-3">Supreme Court (Tribunal Supremo) allows neighbors to ban Airbnb by 3/5 vote. Upload your "Estatutos" to check for bans.</p>
                           <button class="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold shadow-lg transition-all" data-debug-id="vut-upload-statutes-btn">{{ 'VUT.RunAiAnalysis' | translate }}</button>
                       </div>
                   }
               </div>
           </div>
           
           <!-- Visual Status -->
           <div class="flex flex-col gap-6">
                <div class="bg-slate-900 rounded-xl border border-white/10 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden flex-1 group">
                    <!-- VISUAL: License Plate -->
                    <div class="relative w-64 h-20 bg-white rounded-lg border-4 border-slate-800 shadow-2xl flex items-center overflow-hidden transform transition-transform duration-500 group-hover:scale-105">
                        <!-- Blue EU Strip -->
                        <div class="h-full w-8 bg-blue-800 flex flex-col items-center justify-center pt-1">
                             <div class="w-4 h-4 rounded-full border border-yellow-400 flex items-center justify-center">
                                 <span class="text-[6px] text-yellow-400 font-bold">★</span>
                             </div>
                             <span class="text-white font-bold text-[10px] mt-1">E</span>
                        </div>
                        <!-- Number -->
                        <div class="flex-1 flex items-center justify-center bg-white">
                             <span class="text-3xl font-black text-slate-900 font-mono tracking-widest"
                                   [class.blur-sm]="!isTier3()">
                                 {{ isTier3() ? 'VFT/MA/12345' : 'PENDING' }}
                             </span>
                        </div>
                    </div>
                    
                    <h3 class="text-white font-bold mt-8 mb-2">
                        {{ isTier3() ? 'License Active & Valid' : 'VUT Status: Pending' }}
                    </h3>
                    
                    @if (!isTier3()) {
                        <p class="text-slate-500 text-xs max-w-xs">{{ 'VUT.CompleteAllChecksToGenerate' | translate }}</p>
                    } @else {
                        <div class="flex gap-4 mt-4 text-xs font-mono text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
                            <span class="flex items-center gap-1">● Guardia Civil Connected</span>
                        </div>
                    }
                </div>

                <!-- Coach -->
                <div class="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
                   <div class="flex items-start gap-3">
                      <span class="text-xl">⚠️</span>
                      <div>
                          <h4 class="font-bold text-indigo-300 text-sm">{{ 'VUT.BarcelonaWarningPeuat' | translate }}</h4>
                          <p class="text-xs text-indigo-200/80 mt-1">{{ 'VUT.NewLicensesInBarcelonaAre' | translate }}</p>
                      </div>
                   </div>
                </div>
            </div>
       </div>
    </div>
  `,
    styles: [`:host { display: block; height: 100%; }`]
})
export class VutLicenseComponent {
    translate = inject(TranslationService);
    propertyDetails = input<any>();
    feature = computed(() => ({
        id: 'LEG_04',
        name: this.translate.instant('VUTLICE.Title'),
        description: this.translate.instant('VUTLICE.Description'),
    } as any));

    rentalModeLabel = computed(() => {
        const rm = this.propertyDetails()?.rental_mode;
        switch (rm) {
            case 'private_rooms': return 'Private Rooms';
            case 'both': return 'Entire Place & Rooms';
            default: return 'Entire Place';
        }
    });

    session = inject(SessionStore);
    tier = computed(() => this.session.userProfile()?.plan || 'Freemium');

    isTier0 = computed(() => this.tier() === 'Freemium' || this.tier() === 'TIER_0');
    isTier2 = computed(() => this.tier() === 'Silver' || this.tier() === 'TIER_2' || this.tier() === 'Gold' || this.tier() === 'TIER_3');
    isTier3 = computed(() => this.tier() === 'Gold' || this.tier() === 'TIER_3');
}
