
import { ChangeDetectionStrategy, Component, input, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { View, AppPhase } from '../types';
import { SessionStore } from '../state/session.store';
import { TranslatePipe } from '../pipes/translate.pipe';

@Component({
  selector: 'saas-phases-menu',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Floating Glass Panel Container (Soft Rounded Rectangle) -->
    <!-- Mobile: Horizontal scroll | Desktop: Centered flex -->
    <div class="w-full overflow-x-auto scrollbar-hide pb-2">
      <nav class="inline-flex items-center p-1.5 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl ring-1 ring-black/5 mx-auto">
        @for (phase of phases(); track phase.id) {
          <a (click)="selectPhase(phase)"
             class="group relative flex flex-col items-center justify-center px-3 sm:px-4 py-2 rounded-xl cursor-pointer transition-all duration-300 min-w-[70px] sm:min-w-[80px] whitespace-nowrap"
             [class]="activePhaseId() === phase.id
               ? 'bg-white text-slate-900 shadow-md transform scale-105' 
               : 'text-slate-300 hover:bg-white/10 hover:text-white'"
             [attr.data-debug-id]="'phase-menu-' + phase.id">
             
             <!-- Icon (Generic for now based on sort order or ID) -->
             <span class="w-4 h-4 sm:w-5 sm:h-5 mb-1 transition-transform duration-300" 
                   [class.group-hover:-translate-y-0.5]="activePhaseId() !== phase.id"
                   [innerHTML]="getPhaseIcon(phase)">
             </span>
             
             <!-- Title -->
             <span class="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider leading-none text-center">
               {{ ('PHASE.' + phase.id) | translate }}
             </span>
          </a>
        }
      </nav>
    </div>
  `
})
export class PhasesMenuComponent {
  activeView = input.required<View>();
  viewChange = output<View>();

  private store = inject(SessionStore);
  private sanitizer = inject(DomSanitizer);

  phases = this.store.visiblePhases;

  activePhaseId() {
    // Logic to determine active phase from active view
    // If the view has a 'phase' property, match it.
    // Or if the view ID matches a phase ID structure.
    // For now, let's rely on the View having a 'phaseId' or similar, 
    // but 'View' type uses 'phase' property which is lowercase enum.
    // We might need to map it.

    const v = this.activeView();
    // Only highlight if we are in a phase view (not dashboard/settings)
    if (v.id.startsWith('PH_')) return v.id;

    return null;
  }

  selectPhase(phase: AppPhase): void {
    // Navigate to the phase view
    // We construct a View object representing this phase
    const view: View = {
      id: phase.id,
      title: phase.name,
      icon: 'layers', // generic
      propertyName: this.activeView().propertyName // Keep context
    };
    this.viewChange.emit(view);
  }

  getPhaseIcon(phase: AppPhase): SafeHtml {
    // Simple icon mapping based on sort_order or ID content
    let icon = '';
    if (phase.id.includes('INVEST')) icon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" /></svg>`; // Bank
    else if (phase.id.includes('DESIGN')) icon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.53 16.122a3 3 0 0 0-5.78 1.128 2.25 2.25 0 0 1-2.4 2.245 4.5 4.5 0 0 0 8.4-2.245c0-.399-.078-.78-.22-1.128Zm0 0a15.998 15.998 0 0 0 3.388-1.62m-5.043-.025a15.994 15.994 0 0 1 1.622-3.395m3.42 3.42a15.995 15.995 0 0 0 4.764-4.635l3.61 3.61a.75.75 0 0 1 .021 1.06l-2.135 2.136a.5.5 0 0 1-.707 0l-1.935-1.935a.75.75 0 0 1-.007-1.07Zm-2.796-7.43a15.995 15.995 0 0 1 4.635-4.764l-3.61-3.61a.75.75 0 0 0-1.06-.02l-2.136 2.135a.5.5 0 0 0 0 .707l1.935 1.935a.75.75 0 0 0 1.07.007Z" /></svg>`; // Brush
    else if (phase.id.includes('LAUNCH')) icon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" /></svg>`; // Rocket
    else if (phase.id.includes('OPS')) icon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 0 1 0 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 0 1 0-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.28Z" /><path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>`; // Gear
    else if (phase.id.includes('ANALYZE')) icon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" /></svg>`; // Chart
    else if (phase.id.includes('SCALE')) icon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M3.75 3v11.25A2.25 2.25 0 0 0 6 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0 1 18 16.5h-2.25m-7.5 0h7.5m-7.5 0-1 3m8.5-3 1 3m0 0 .5 1.5m-.5-1.5h-9.5m0 0-.5 1.5M9 11.25v1.5M12 9v3.75m3-6v6" /></svg>`; // Crown/Structure

    return this.sanitizer.bypassSecurityTrustHtml(icon || '<span class="text-sm">?</span>');
  }
}
