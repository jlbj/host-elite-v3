import { TranslationService } from '../../../../services/translation.service';
import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Feature } from '../../../../types';
import { SessionStore } from '../../../../state/session.store';
import { TranslatePipe } from '../../../../pipes/translate.pipe';

@Component({
    selector: 'leg-01-regulatory-checklist',
    standalone: true,
    imports: [CommonModule,
    TranslatePipe
  ],
    template: `
    <div class="h-full flex flex-col gap-6 animate-fade-in-up">
      <!-- Feature Header -->
      <div class="flex justify-between items-start">
        <div>
          <div class="flex items-center gap-3">
              <h1 class="text-3xl font-extrabold text-white tracking-tight">{{ 'REGCHECK.RegulatoryComplianceVault' | translate }}</h1>
              @if (isTier3()) {
                  <span class="px-2 py-0.5 rounded-full bg-gradient-to-r from-[#D4AF37] to-amber-500 text-black text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-amber-500/20">{{ 'REGCHECK.AuditProof' | translate }}</span>
              }
          </div>
          <p class="text-slate-400 mt-2 max-w-2xl">{{ 'REGCHECK.NeverFailAnInspectionStore' | translate }}</p>
        </div>
        <div class="px-4 py-2 rounded-lg border text-xs font-mono uppercase tracking-wider"
             [ngClass]="{
                'bg-slate-800 text-slate-400 border-slate-700': isTier0(),
                'bg-indigo-500/20 text-indigo-200 border-indigo-500/30': !isTier0()
             }">
             {{ isTier3() ? 'AI Document Vault' : (isTier2() ? 'Regional Rules Engine' : 'Manual Checklist') }}
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
         <!-- Document List -->
         <div class="lg:col-span-2 bg-slate-800 rounded-xl border border-white/10 p-6 overflow-y-auto">
            <div class="flex items-center justify-between mb-6">
                <h3 class="text-xl font-bold text-white">{{ 'REGCHECK.MandatoryDocuments' | translate }}</h3>
                @if (isTier3()) {
                    <button class="text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-lg shadow-indigo-500/25" data-debug-id="regulatory-bulk-scan-btn">
                        <span class="material-icons text-sm">filter_center_focus</span>{{ 'REGCHECK.AiBulkScan' | translate }}</button>
                }
            </div>
            
             <div class="space-y-4">
                @if (documents().length === 0) {
                  <div class="flex flex-col items-center justify-center py-12 text-center">
                     <span class="text-4xl mb-3">📂</span>
                     <p class="text-slate-400 text-sm">No documents yet</p>
                     <p class="text-slate-500 text-xs mt-1">Upload your first document to get started.</p>
                  </div>
                }
                @for (doc of documents(); track doc.id) {
                    <div class="p-4 bg-white/5 rounded-lg border border-white/5 flex items-center justify-between hover:bg-white/10 transition-colors group" 
                         [class.border-l-4]="isTier3()"
                         [class.border-l-[#D4AF37]]="isTier3() && doc.status === 'valid'"
                         [class.border-l-rose-500]="isTier3() && doc.status === 'missing'"
                         [attr.data-debug-id]="'regulatory-doc-item-' + doc.id">
                         
                        <div class="flex items-center gap-4">
                             <div class="w-10 h-10 rounded-full flex items-center justify-center transition-all" 
                                [class.bg-emerald-500_20]="doc.status === 'valid'"
                                [class.text-emerald-400]="doc.status === 'valid'"
                                [class.bg-rose-500_20]="doc.status === 'missing'"
                                [class.text-rose-400]="doc.status === 'missing'"
                                [class.group-hover:scale-110]="isTier3()">
                                <span class="material-icons text-xl">{{ doc.status === 'valid' ? 'check_circle' : 'error_outline' }}</span>
                             </div>
                             <div>
                                 <h4 class="text-white font-bold flex items-center gap-2">
                                     {{ doc.name }}
                                     @if(isTier3() && doc.aiVerified) {
                                         <span class="text-[9px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20" title="{{ \'REGCHECK.VerifiedByAi\' | translate }}">{{ 'RC.AiValidated' | translate }}</span>
                                     }
                                 </h4>
                                 <p class="text-xs text-slate-400">{{ doc.description }}</p>
                             </div>
                        </div>
                        
                        @if (isTier3()) {
                            <div class="flex flex-col items-end gap-2">
                                @if(doc.expiry) {
                                    <div class="text-xs font-mono text-slate-500 flex items-center gap-1 bg-black/20 px-2 py-1 rounded">
                                        <span>Expires: {{ doc.expiry }}</span>
                                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                    </div>
                                    <label class="flex items-center gap-2 cursor-pointer group/toggle">
                                        <span class="text-[10px] uppercase font-bold text-slate-500 group-hover/toggle:text-slate-300 transition-colors">{{ 'REGCHECK.Autorenew' | translate }}</span>
                                        <div class="relative inline-flex items-center cursor-pointer">
                                            <input type="checkbox" checked class="sr-only peer">
                                            <div class="w-8 h-4 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[0px] after:left-[0px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#D4AF37]"></div>
                                        </div>
                                    </label>
                                } @else {
                                    <button class="text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded transition-colors flex items-center gap-1" [attr.data-debug-id]="'regulatory-upload-' + doc.id">
                                        <span class="text-xs">📤</span>{{ 'REGCHECK.Upload' | translate }}</button>
                                }
                            </div>
                        } @else {
                             @if (isTier2()) {
                                 <div class="text-[10px] text-slate-400 font-mono px-2 py-1 bg-white/5 rounded">Regional requirement</div>
                             }
                             <div class="flex items-center">
                                <span class="mr-3 text-xs text-slate-500 font-mono hidden md:block">{{ 'REGCHECK.ManualCheck' | translate }}</span>
                                <input type="checkbox" [checked]="doc.status === 'valid'" class="h-5 w-5 rounded border-slate-600 bg-slate-700 text-indigo-600 focus:ring-0 cursor-pointer">
                             </div>
                        }
                    </div>
                }
            </div>
         </div>

         <!-- Sidebar / Tips -->
         <div class="space-y-6">
            <!-- VISUAL: Compliance Shield Score -->
            <div class="p-6 bg-slate-800/80 rounded-xl border border-white/10 relative overflow-hidden flex flex-col items-center">
                <div class="relative w-32 h-32 mb-4 flex items-center justify-center">
                     <!-- Outer Ring -->
                     <svg class="w-full h-full transform -rotate-90">
                         <circle cx="64" cy="64" r="56" stroke="currentColor" stroke-width="8" fill="transparent" class="text-slate-700" />
                         <circle cx="64" cy="64" r="56" stroke="currentColor" stroke-width="8" fill="transparent" 
                                 [class]="isTier3() ? 'text-[#D4AF37]' : (isTier2() ? 'text-indigo-500' : 'text-slate-500')"
                                 stroke-dasharray="351.8" 
                                 [attr.stroke-dashoffset]="isTier3() ? '10' : '200'"
                                 stroke-linecap="round" />
                     </svg>
                     <!-- Shield Icon -->
                     <div class="absolute inset-0 flex items-center justify-center">
                         <span class="text-4xl">🛡️</span>
                     </div>
                </div>
                
                <h3 class="text-2xl font-black text-slate-500 mb-1">N/A</h3>
                <p class="text-xs text-slate-500 uppercase tracking-widest font-bold">{{ 'REGCHECK.AuditReady' | translate }}</p>
            </div>

            @if (!isTier3()) {
                <div class="p-4 bg-gradient-to-br from-indigo-900/50 to-slate-900/50 border border-white/10 rounded-lg">
                    <h4 class="text-white font-bold text-sm mb-2">{{ 'REGCHECK.UnlockSmartRules' | translate }}</h4>
                    <p class="text-slate-400 text-xs mb-3">{{ 'REGCHECK.DontRelyOnGenericLists' | translate }}</p>
                    <button class="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded shadow-lg transition-all" data-debug-id="regulatory-upgrade-link">{{ 'REGCHECK.UpgradeToSilver' | translate }}</button>
                </div>
            } @else {
                 <!-- Gold Only Widget (placeholder) -->
                 <div class="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <h4 class="font-bold text-emerald-400 text-sm mb-2 flex items-center gap-2">
                        <span class="animate-pulse">●</span>{{ 'REGCHECK.ActiveMonitoring' | translate }}</h4>
                    <p class="text-xs text-slate-400">Connect your property to enable automated regulatory monitoring.</p>
                 </div>
            }
            
            <!-- Coach -->
            <div class="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl mt-6">
                 <div class="flex items-start gap-3">
                    <span class="text-xl">📊</span>
                    <div>
                        <h4 class="font-bold text-indigo-300 text-sm">{{ 'REGCHECK.The4Rule' | translate }}</h4>
                        <p class="text-xs text-indigo-200/80 mt-1">{{ 'REGCHECK.AuditInfoText' | translate }}</p>
                    </div>
                </div>
            </div>
         </div>
      </div>
    </div>
  `,
    styles: [`:host { display: block; height: 100%; }`]
})
export class RegulatoryChecklistComponent {
    translate = inject(TranslationService);
    feature = computed(() => ({
        id: 'LEG_01',
        name: this.translate.instant('REGUCHEC.Title'),
        description: this.translate.instant('REGUCHEC.Description'),
    } as any));

    session = inject(SessionStore);
    tier = computed(() => this.session.userProfile()?.plan || 'Freemium');

    isTier0 = computed(() => this.tier() === 'Freemium' || this.tier() === 'TIER_0');
    isTier2 = computed(() => this.tier() === 'Silver' || this.tier() === 'TIER_2' || this.tier() === 'Gold' || this.tier() === 'TIER_3');
    isTier3 = computed(() => this.tier() === 'Gold' || this.tier() === 'TIER_3');

    documents = signal<any[]>([]);
}
