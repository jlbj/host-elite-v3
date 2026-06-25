import { TranslationService } from '../../../../services/translation.service';
import { Component, computed, inject, signal, input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Feature } from '../../../../types';
import { SessionStore } from '../../../../state/session.store';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { HostRepository } from '../../../../services/host-repository.service';
import { ComplianceRule } from '../../../../types';
import { GeminiService } from '../../../../services/gemini.service';

@Component({
    selector: 'leg-00-compliance-checker',
    standalone: true,
    imports: [CommonModule, TranslatePipe, FormsModule],
    template: `
    <div class="h-full flex flex-col gap-6 animate-fade-in-up">
      <!-- Header -->
      <div class="flex justify-between items-start">
        <div>
          <h1 class="text-3xl font-extrabold text-white tracking-tight">{{ 'COMPLY.ZoningRegulatorySentinel' | translate }}</h1>
          <p class="text-slate-400 mt-2 max-w-2xl">{{ 'COMPLY.DontBuyALiabilityCheck' | translate }}</p>
        </div>
        <div class="px-4 py-2 rounded-lg border text-xs font-mono uppercase tracking-wider"
             [ngClass]="{
                'bg-slate-800 text-slate-400 border-slate-700': isTier0(),
                'bg-indigo-500/20 text-indigo-200 border-indigo-500/30': !isTier0()
             }">
             {{ isTier0() ? 'Regulation DB' : (isTier3() ? 'Real-Time Sentinel' : 'Zoning Detective') }}
        </div>
      </div>

      <!-- Tier 0: No compliance data available without subscription -->
      @if (isTier0()) {
         <div class="p-6 bg-slate-800 rounded-xl border border-white/10 flex-1 overflow-y-auto custom-scrollbar">
            <div class="flex flex-col items-center justify-center h-full text-center gap-6">
               <span class="text-6xl">🕵️</span>
               <div>
                  <h3 class="text-xl font-bold text-white mb-2">{{ 'COMPLY.NeedAddresslevelChecks' | translate }}</h3>
                  <p class="text-slate-400 max-w-md">{{ 'COMPLY.UpgradeToSilverToCheck' | translate }}</p>
               </div>
            </div>
         </div>
      }

      <!-- Tier 1/2/3: Advanced View -->
      @else {
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1 min-h-0">
             <!-- COL 1: Zoning Detective -->
             <div class="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm flex flex-col">
                <h3 class="text-xl font-bold text-white mb-6">{{ 'COMPLY.ZoningDetective' | translate }}</h3>
                
                <div class="flex gap-2 mb-8">
                    <input type="text" [(ngModel)]="address" placeholder="{{ 'COMPLY.EnterPropertyAddress' | translate }}" class="flex-1 bg-black/30 border border-white/20 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none text-sm placeholder:text-slate-600" data-debug-id="compliance-address-input">
                    <button (click)="scanAddress()" [disabled]="isScanning()" class="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors text-sm disabled:opacity-50" data-debug-id="compliance-check-btn">
                        {{ isScanning() ? '...' : ('COMPLY.Scan' | translate) }}
                    </button>
                </div>
                
                <!-- VISUAL: Risk Gauge -->
                <div class="flex-1 flex flex-col items-center justify-center relative">
                    <div class="relative w-48 h-24 overflow-hidden mb-4">
                         <div class="absolute inset-0 bg-slate-800 rounded-t-full"></div>
                         <div class="absolute inset-4 bg-[#1e293b] rounded-t-full z-10"></div> <!-- Mask -->
                         <div class="absolute bottom-0 left-1/2 w-1 h-[90%] bg-emerald-500 origin-bottom transform z-20 transition-transform duration-1000 shadow-[0_0_10px_2px_rgba(16,185,129,0.5)]"
                              [style.transform]="getGaugeRotation()"
                              [style.backgroundColor]="riskColor()"></div>
                    </div>
                    <div class="text-2xl font-black text-white mb-1" [style.color]="riskColor()">{{ riskLevel() }}</div>
                    <div class="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border"
                         [style.backgroundColor]="riskColor() + '20'"
                         [style.borderColor]="riskColor() + '40'"
                         [style.color]="riskColor()">
                         {{ riskStatus() }}
                    </div>
                    <p class="text-xs text-slate-400 mt-4 text-center max-w-xs">
                        {{ riskDescription() }}
                    </p>
                </div>
             </div>

             <!-- COL 2: Sentinel & Coach -->
             <div class="flex flex-col gap-6">
                 <!-- Sentinel (Tier 3) -->
                 <div class="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm relative overflow-hidden flex-1 flex flex-col">
                     <div class="flex justify-between items-center mb-4">
                         <h3 class="text-md font-bold text-white">{{ 'COMPLY.LegislativeSentinel' | translate }}</h3>
                         @if (isTier3()) {
                             <div class="flex items-center gap-2">
                                 <span class="relative flex h-2 w-2">
                                   <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                   <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                 </span>
                                 <span class="text-[10px] text-emerald-400 font-mono uppercase">{{ 'COMPLY.Live' | translate }}</span>
                             </div>
                         }
                     </div>

                     @if (isTier3()) {
                          <div class="space-y-3 overflow-y-auto custom-scrollbar pr-2 h-48">
                             @for (alert of sentinelAlerts(); track alert.id) {
                                 <div class="p-3 bg-white/5 rounded-lg border-l-2"
                                      [class.border-emerald-500]="alert.severity === 'safe'"
                                      [class.border-amber-500]="alert.severity === 'warning'"
                                      [class.border-red-500]="alert.severity === 'critical'">
                                     <div class="flex justify-between items-start mb-1">
                                         <span class="text-xs text-white font-bold">{{ alert.title }}</span>
                                         <span class="text-[10px] text-slate-500">{{ alert.time }}</span>
                                     </div>
                                     <p class="text-[10px] text-slate-400">{{ alert.desc }}</p>
                                 </div>
                             } @empty {
                                 <div class="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
                                     <span class="material-icons text-2xl">radar</span>
                                     <p class="text-[10px]">{{ 'COMPLY.SentinelIsScanning' | translate }}</p>
                                 </div>
                             }
                          </div>
                     } @else {
                         <div class="absolute inset-0 z-10 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
                             <span class="text-3xl mb-2">📡</span>
                             <h3 class="text-sm font-bold text-white mb-2">{{ 'COMPLY.MonitorTheLaw247' | translate }}</h3>
                             <p class="text-xs text-slate-400 mb-4 max-w-xs">{{ 'COMPLY.LawsChangeOvernightGetAlerts' | translate }}</p>
                             <div class="px-3 py-1 bg-amber-500/20 text-amber-300 rounded text-[10px] border border-amber-500/30">{{ 'COMPLY.GoldFeature' | translate }}</div>
                         </div>
                     }
                 </div>
                                  <!-- Coach -->
                  <div class="bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
                       <div class="flex flex-col gap-3">
                          <h4 class="font-bold text-indigo-300 text-sm flex items-center gap-2">
                              <span class="material-icons text-sm">balance</span>
                              {{ 'COMPLY.TheNonretroactiveRule' | translate }}
                          </h4>
                          <ul class="space-y-2">
                              @for (rec of recommendations(); track rec) {
                                  <li class="text-xs text-indigo-200/80 flex items-start gap-2">
                                      <span class="text-indigo-400">•</span> {{ rec }}
                                  </li>
                              } @empty {
                                  <li class="text-xs text-indigo-200/80 italic"> {{ 'COMPLY.MostNewBansCannotApply' | translate }} </li>
                              }
                          </ul>
                      </div>
                  </div>
              </div>
           </div>
       }
     </div>
   `,
    styles: [`:host { display: block; height: 100%; }`]
})
export class ComplianceCheckerComponent implements OnInit, OnChanges {
    feature = input.required<Feature>();
    propertyDetails = input<any>();
    translate = inject(TranslationService);
    session = inject(SessionStore);
    repository = inject(HostRepository);
    gemini = inject(GeminiService);

    tier = computed(() => this.session.userProfile()?.plan || 'Freemium');
    isTier0 = computed(() => this.tier() === 'Freemium' || this.tier() === 'TIER_0');
    isTier3 = computed(() => this.tier() === 'Gold' || this.tier() === 'TIER_3');

    address = '';
    isScanning = signal(false);

    ngOnInit() {
        this.updateFromProperty();
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['propertyDetails'] && !changes['propertyDetails'].firstChange) {
            this.updateFromProperty();
        }
    }

    private updateFromProperty() {
        const prop = this.propertyDetails();
        if (prop?.address) {
            this.address = prop.address;
        }
    }

    sentinelAlerts = signal<any[]>([]);

    // Result signals
    riskScore = signal(0); // 0 (Safe) to 100 (Banned)
    riskLevel = signal('Ready');
    riskStatus = signal('Idle');
    riskDescription = signal('Enter an address to perform a zoning detective scan.');
    riskColor = signal('#94a3b8');

    recommendations = signal<string[]>([]);

    async scanAddress() {
        if (!this.address || this.isScanning()) return;

        this.isScanning.set(true);
        this.riskStatus.set('Scanning...');
        this.riskDescription.set('Cross-referencing municipal gazettes and zoning maps...');
        this.riskColor.set('#6366f1');

        // Extract city from address
        const cityMatch = this.address.match(/([a-zA-Z\s]+),?\s*[0-9]*/);
        const cityCandidate = cityMatch ? cityMatch[1].trim() : this.address;

        try {
            const rentalMode = this.propertyDetails()?.rental_mode || 'entire_place';
            if (this.isTier3()) {
                // Real-time AI Scan for Gold Tier
                const aiResult = await this.gemini.checkCompliance(this.address, cityCandidate, rentalMode);
                this.riskScore.set(aiResult.riskScore);
                this.riskLevel.set(aiResult.riskLevel);
                this.riskStatus.set(aiResult.riskStatus);
                this.riskDescription.set(aiResult.description);
                this.recommendations.set(aiResult.recommendations || []);

                if (aiResult.riskScore >= 90) this.riskColor.set('#f43f5e');
                else if (aiResult.riskScore >= 60) this.riskColor.set('#f59e0b');
                else this.riskColor.set('#10b981');
            } else {
                // Static Database Lookup for Silver Tier
                const match = await this.repository.getComplianceRuleForCity(cityCandidate);
                if (match) {
                    this.riskScore.set(match.risk_level);
                    this.updateRiskStatus(match);
                    this.recommendations.set([
                        `Verify ${match.mandatory_req} requirements`,
                        `Check ${match.limit_days} days annual limit`,
                        'Consult local tax advisor'
                    ]);
                } else {
                    this.riskScore.set(0);
                    this.riskLevel.set('No Data');
                    this.riskStatus.set('Unknown');
                    this.riskDescription.set('No compliance data available for this city. Consult local authorities for accurate information.');
                    this.riskColor.set('#94a3b8');
                    this.recommendations.set([]);
                }
            }
        } catch (error) {
            console.error('Scan failed', error);
            this.riskStatus.set('Unavailable');
            this.riskDescription.set('AI compliance check requires a configured API key. Set GEMINI_API_KEY in your environment or configure AI provider in settings.');
        } finally {
            this.isScanning.set(false);
        }
    }

    private updateRiskStatus(match: ComplianceRule) {
        if (match.risk_level >= 90) {
            this.riskLevel.set('Critical Risk');
            this.riskStatus.set('Prohibited');
            this.riskColor.set('#f43f5e');
            this.riskDescription.set(`${match.city} has a strict moratorium or ban. Short-term rentals are virtually impossible for new entrants.`);
        } else if (match.risk_level >= 60) {
            this.riskLevel.set('High Risk');
            this.riskStatus.set('Restricted');
            this.riskColor.set('#f59e0b');
            this.riskDescription.set(`${match.city} requires complex permits (e.g., separate entrance or 90-day cap) that are strictly enforced.`);
        } else {
            this.riskLevel.set('Safe Zone');
            this.riskStatus.set('Permitted');
            this.riskColor.set('#10b981');
            this.riskDescription.set(`${match.city} allows STR with a ${match.mandatory_req}. Annual limit: ${match.limit_days} days.`);
        }
    }

    getGaugeRotation() {
        // -90deg is 0 risk, 90deg is 100 risk
        const rotation = (this.riskScore() / 100) * 180 - 90;
        return `rotate(${rotation}deg)`;
    }
}
