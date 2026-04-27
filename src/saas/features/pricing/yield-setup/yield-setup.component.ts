import { TranslationService } from '../../../../services/translation.service';
import { Component, computed, inject, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Feature } from '../../../../types';
import { SessionStore } from '../../../../state/session.store';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../../pipes/translate.pipe';

@Component({
    selector: 'pri-01-yield-setup',
    standalone: true,
    imports: [CommonModule, FormsModule,
        TranslatePipe
    ],
    template: `
    <div class="h-full flex flex-col gap-6 animate-fade-in-up">
      <div class="flex justify-between items-start">
        <div>
          <h1 class="text-3xl font-extrabold text-white tracking-tight">{{ 'YIELD.YieldStrategyEngine' | translate }}</h1>
          <p class="text-slate-400 mt-2 max-w-2xl">{{ 'YIELD.DynamicPricingRulesToMaximize' | translate }}</p>
        </div>
        <div class="px-4 py-2 rounded-lg border text-xs font-mono uppercase tracking-wider transition-all duration-500"
             [ngClass]="{
                'bg-slate-800 text-slate-400 border-slate-700': isTier0(),
                'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]': !isTier0()
             }">
             {{ isTier3() ? 'AI Market Demand' : (isTier2() ? 'Smart Rules' : 'Manual Rules') }}
        </div>
      </div>

       <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 overflow-hidden min-h-0">
           
           <!-- Left: Rules & Strategy -->
           <div class="lg:col-span-1 flex flex-col gap-6 overflow-y-auto pr-2 custom-scrollbar">
               <!-- Baseline Costs -->
               <div class="bg-slate-800/50 rounded-2xl border border-white/10 p-6 backdrop-blur-sm">
                    <h3 class="text-white font-bold mb-4 flex items-center gap-2">
                        {{ 'YIELD.BaselineStrategy' | translate }}
                    </h3>
                   <div class="space-y-6">
                       <div class="p-4 bg-black/20 rounded-xl border border-white/5">
                           <label class="block text-slate-400 text-[10px] uppercase font-bold mb-1 tracking-wider">{{ 'YIELD.BreakevenPrice' | translate }}</label>
                           <div class="text-3xl font-mono text-white font-bold">€85.00</div>
                           <p class="text-[10px] text-slate-500 mt-1">{{ 'YIELD.FixedCostsCleaning30Nights' | translate }}</p>
                       </div>
                       <div>
                           <div class="flex justify-between text-xs text-slate-400 mb-3">
                               <span class="font-bold">{{ 'YIELD.MinimumMargin' | translate }}</span>
                               <span class="text-emerald-400 font-mono font-bold">+{{ margin() }}%</span>
                           </div>
                           <input type="range" [(ngModel)]="margin" (input)="recalculate()" min="0" max="100" 
                                  class="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500" 
                                  [disabled]="isTier0()">
                            <div class="flex justify-between text-[10px] text-slate-600 mt-2 font-mono">
                                <span>CONSERVATIVE</span>
                                <span>AGGRESSIVE</span>
                            </div>
                       </div>
                   </div>
               </div>

               <!-- Advanced Rules (Tier 2) -->
               <div class="bg-slate-800/50 rounded-2xl border border-white/10 p-6 backdrop-blur-sm">
                   <h3 class="text-white font-bold mb-4 flex items-center gap-2">
                       <span class="material-icons text-indigo-400 text-sm">tune</span>
                       {{ 'YIELD.SmartAdjustments' | translate }}
                   </h3>
                   
                   @if (isTier2()) {
                       <div class="space-y-3">
                           <label class="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 cursor-pointer hover:border-indigo-500/50 transition-all group">
                               <div class="flex items-center gap-4">
                                   <div class="relative flex items-center">
                                       <input type="checkbox" checked class="peer h-5 w-5 rounded-md border-slate-600 bg-transparent text-indigo-500 focus:ring-0">
                                       <span class="material-icons absolute opacity-0 peer-checked:opacity-100 text-white text-xs left-0.5 pointer-events-none">check</span>
                                   </div>
                                   <div>
                                       <div class="text-sm text-white font-bold group-hover:text-indigo-300 transition-colors">{{ 'YIELD.OrphanNightFiller' | translate }}</div>
                                       <div class="text-[10px] text-slate-400">{{ 'YIELD.Discount1nightGapsBy15' | translate }}</div>
                                   </div>
                               </div>
                           </label>
                           
                           <label class="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 cursor-pointer hover:border-amber-500/50 transition-all group">
                               <div class="flex items-center gap-4">
                                   <div class="relative flex items-center">
                                       <input type="checkbox" class="peer h-5 w-5 rounded-md border-slate-600 bg-transparent text-amber-500 focus:ring-0">
                                       <span class="material-icons absolute opacity-0 peer-checked:opacity-100 text-white text-xs left-0.5 pointer-events-none">check</span>
                                   </div>
                                   <div>
                                       <div class="text-sm text-white font-bold group-hover:text-amber-300 transition-colors">{{ 'YIELD.LastMinuteDeal' | translate }}</div>
                                       <div class="text-[10px] text-slate-400">-10% within 48h arrival</div>
                                   </div>
                               </div>
                           </label>
                       </div>
                   } @else {
                       <div class="p-6 bg-indigo-900/20 rounded-xl text-center border border-indigo-500/20 relative overflow-hidden group">
                           <div class="absolute -right-4 -bottom-4 text-indigo-500/10 rotate-12 group-hover:scale-110 transition-transform">
                               <span class="material-icons text-6xl">lock</span>
                           </div>
                           <p class="text-indigo-300 text-xs mb-4 relative z-10">{{ 'YIELD.UnlockSmartRulesWithSilver' | translate }}</p>
                           <button class="relative z-10 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold px-4 py-2 rounded-lg transition-all shadow-lg shadow-indigo-600/20">
                               {{ 'YIELD.UpgradeNow' | translate }}
                           </button>
                       </div>
                   }
               </div>

               <!-- Coach -->
               <div class="p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl relative overflow-hidden">
                    <div class="absolute top-0 right-0 p-2 opacity-10">
                        <span class="material-icons text-4xl text-emerald-500">lightbulb</span>
                    </div>
                    <div class="flex items-center gap-2 mb-2">
                        <span class="text-emerald-400 font-bold text-[10px] uppercase tracking-widest">{{ 'YIELD.CoachTip' | translate }}</span>
                    </div>
                    <p class="text-slate-400 text-[11px] leading-relaxed italic">
                        "Kill the Orphans. 'Orphan nights' (1-2 day gaps) wreck occupancy. Tier 2 'Orphan Filler' automatically discounts these hard-to-sell dates."
                    </p>
               </div>
           </div>

           <!-- Right: Heatmap & Forecast -->
           <div class="lg:col-span-2 bg-slate-900/80 rounded-2xl border border-white/10 p-8 flex flex-col relative overflow-hidden group shadow-2xl">
                
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
                    <div>
                        <h3 class="text-white font-bold text-xl tracking-tight">12-Month Demand Forecast</h3>
                        <p class="text-xs text-slate-500 mt-1">Based on historical data and current market events</p>
                    </div>
                    <div class="flex flex-wrap gap-4 text-[10px] uppercase font-bold tracking-widest">
                        <div class="flex items-center gap-2">
                            <div class="w-2 h-2 bg-slate-700 rounded-full"></div> <span class="text-slate-500">{{ 'YIELD.Low' | translate }}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <div class="w-2 h-2 bg-emerald-500 rounded-full"></div> <span class="text-slate-500">{{ 'YIELD.Good' | translate }}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <div class="w-2 h-2 bg-amber-500 rounded-full"></div> <span class="text-slate-500">{{ 'YIELD.High' | translate }}</span>
                        </div>
                    </div>
                </div>

                <!-- Heatmap Bars -->
                <div class="flex-1 flex items-end justify-between gap-1 md:gap-2 pb-6 relative">
                    
                    @if(isTier3()) {
                        <!-- AI Projection Line Overlay -->
                        <div class="absolute inset-x-0 bottom-6 h-[70%] pointer-events-none z-10">
                            <svg class="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 100">
                                <path [attr.d]="svgPath()" 
                                      fill="none" 
                                      stroke="url(#gradient-ai)" 
                                      stroke-width="2" 
                                      stroke-dasharray="4,4" 
                                      class="opacity-70 drop-shadow-[0_0_10px_rgba(99,102,241,0.5)]"></path>
                                <defs>
                                    <linearGradient id="gradient-ai" x1="0%" y1="0%" x2="100%" y2="0%">
                                        <stop offset="0%" style="stop-color:#6366f1" />
                                        <stop offset="100%" style="stop-color:#10b981" />
                                    </linearGradient>
                                </defs>
                            </svg>
                        </div>
                        <div class="absolute top-0 right-0 bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[10px] px-3 py-1.5 rounded-full backdrop-blur-md flex items-center gap-2 z-20 shadow-lg">
                            <span class="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse"></span>
                            <span>✨ AI Predictive Demand</span>
                        </div>
                    }

                    <!-- Bars -->
                    @for (month of forecast(); track month.name) {
                        <div class="flex-1 group/bar relative">
                            <div class="w-full bg-opacity-20 transition-all duration-500 rounded-t-lg relative flex items-end overflow-hidden"
                                 [style.height.%]="month.demand"
                                 [class.bg-slate-700]="month.demand < 50"
                                 [class.bg-emerald-500]="month.demand >= 50 && month.demand < 80"
                                 [class.bg-amber-500]="month.demand >= 80"
                                 [class.hover:bg-opacity-40]="true">
                                 <!-- Bar Animation Overlay -->
                                 <div class="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                            </div>
                            <!-- Tooltip -->
                            <div class="opacity-0 group-hover/bar:opacity-100 absolute -top-12 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-3 py-2 rounded-xl whitespace-nowrap z-30 shadow-2xl border border-white/10 transition-all duration-300 scale-90 group-hover/bar:scale-100 pointer-events-none">
                                <div class="font-bold border-b border-white/5 pb-1 mb-1">{{ month.name }} Forecast</div>
                                <div class="flex justify-between gap-4">
                                    <span class="text-slate-400">Demand:</span>
                                    <span class="text-white">{{ month.demand }}%</span>
                                </div>
                                <div class="flex justify-between gap-4">
                                    <span class="text-slate-400">Avg Price:</span>
                                    <span class="text-emerald-400">€{{ (85 * (1 + margin()/100) * (0.5 + month.demand/100)).toFixed(0) }}</span>
                                </div>
                            </div>
                        </div>
                    }
                </div>
                
                <div class="flex justify-between text-[10px] text-slate-500 mt-4 px-1 uppercase font-mono tracking-[0.2em]">
                    @for (month of forecast(); track month.name) {
                        <span class="flex-1 text-center">{{ month.name.slice(0,3) }}</span>
                    }
                </div>

                <!-- Footer Stats -->
                <div class="mt-8 pt-8 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div class="text-center md:text-left">
                        <div class="text-[9px] text-slate-500 uppercase font-bold tracking-widest mb-1">Projected ADR</div>
                        <div class="text-xl font-mono text-white font-bold">€{{ (85 * (1 + margin()/100) * 1.2).toFixed(0) }}</div>
                    </div>
                    <div class="text-center md:text-left">
                        <div class="text-[9px] text-slate-500 uppercase font-bold tracking-widest mb-1">Peak Occupancy</div>
                        <div class="text-xl font-mono text-emerald-400 font-bold">94%</div>
                    </div>
                    <div class="text-center md:text-left">
                        <div class="text-[9px] text-slate-500 uppercase font-bold tracking-widest mb-1">Margin Capture</div>
                        <div class="text-xl font-mono text-amber-400 font-bold">€{{ (85 * (margin()/100)).toFixed(0) }}/night</div>
                    </div>
                    <div class="text-center md:text-left">
                        <button (click)="recalculate()" 
                                class="bg-indigo-600/10 hover:bg-indigo-600/20 border border-indigo-500/30 text-indigo-300 px-4 py-2 rounded-lg text-[10px] font-bold transition-all w-full flex items-center justify-center gap-2">
                            <span class="material-icons text-sm">refresh</span>
                            SYNC LATEST DATA
                        </button>
                    </div>
                </div>
           </div>
       </div>
    </div>
    `,
    styles: [`
        :host { display: block; height: 100%; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.1); }
        input[type=range]::-webkit-slider-thumb {
            -webkit-appearance: none;
            height: 16px;
            width: 16px;
            border-radius: 50%;
            background: #10b981;
            cursor: pointer;
            box-shadow: 0 0 10px rgba(16,185,129,0.3);
            border: 2px solid #0f172a;
        }
    `]
})
export class YieldSetupComponent {
    translate = inject(TranslationService);
    featureData = computed(() => ({
        id: 'PRI_01',
        name: this.translate.instant('YIELSETU.Title'),
        description: this.translate.instant('YIELSETU.Description'),
    } as any));

    session = inject(SessionStore);
    tier = computed(() => this.session.userProfile()?.plan || 'Freemium');

    isTier0 = computed(() => this.tier() === 'Freemium' || this.tier() === 'TIER_0');
    isTier2 = computed(() => this.tier() === 'Silver' || this.tier() === 'TIER_2' || this.tier() === 'Gold' || this.tier() === 'TIER_3');
    isTier3 = computed(() => this.tier() === 'Gold' || this.tier() === 'TIER_3');

    margin = signal(25);

    @Input() feature?: any;
    @Input() propertyDetails?: any;
    @Input() selectFeature?: (featureId: string) => void;

    forecast = signal([
        { name: 'January', demand: 40 },
        { name: 'February', demand: 35 },
        { name: 'March', demand: 45 },
        { name: 'April', demand: 65 },
        { name: 'May', demand: 60 },
        { name: 'June', demand: 85 },
        { name: 'July', demand: 95 },
        { name: 'August', demand: 90 },
        { name: 'September', demand: 70 },
        { name: 'October', demand: 55 },
        { name: 'November', demand: 45 },
        { name: 'December', demand: 75 }
    ]);

    svgPath = computed(() => {
        const points = this.forecast().map((m, i) => `${(i * 100) / 11},${100 - m.demand}`);
        let d = `M ${points[0]}`;
        for (let i = 0; i < points.length; i++) {
            d += ` L ${points[i]}`;
        }
        return d;
    });

    recalculate() {
        // Simulation of dynamic recalculation
        this.forecast.update(prev => prev.map(m => ({
            ...m,
            demand: Math.min(100, Math.max(20, m.demand + (Math.random() * 10 - 5)))
        })));
    }
}
