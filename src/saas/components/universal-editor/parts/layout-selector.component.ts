import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { EditorLayout } from '../models/editor-layout';

@Component({
    selector: 'app-layout-selector',
    standalone: true,
    imports: [CommonModule, TranslatePipe],
    template: `
        <div class="space-y-4">
            <div class="flex items-center justify-between">
                <h3 class="text-lg font-bold text-white">{{ 'EDITOR.ChooseLayout' | translate }}</h3>
                <p class="text-xs text-slate-400">{{ 'EDITOR.LayoutHelp' | translate }}</p>
            </div>
            
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                @for (layout of layouts(); track layout.id) {
                    <div 
                        (click)="selectLayout(layout)"
                        class="p-4 rounded-xl border-2 cursor-pointer transition-all hover:scale-[1.02] hover:shadow-lg"
                        [class.border-purple-500]="selectedLayout()?.id === layout.id"
                        [class.border-white/10]="selectedLayout()?.id !== layout.id"
                        [class.bg-white/10]="selectedLayout()?.id === layout.id"
                        [class.bg-white/5]="selectedLayout()?.id !== layout.id">
                        
                        <div class="flex items-start gap-3">
                            <span class="text-3xl">{{ layout.icon }}</span>
                            <div class="flex-1">
                                <h4 class="font-semibold text-white">{{ layout.name }}</h4>
                                <p class="text-xs text-slate-400 mt-1">{{ layout.description }}</p>
                                <div class="flex gap-2 mt-2">
                                    <span class="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                                        {{ layout.config.layoutType }}
                                    </span>
                                    @if (layout.config.mobileOptimized) {
                                        <span class="text-[10px] px-2 py-0.5 rounded-full bg-green-500/20 text-green-300">
                                            📱 Mobile
                                        </span>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                }
            </div>
        </div>
    `,
    styles: [`
        :host { display: block; }
    `]
})
export class LayoutSelectorComponent {
    layouts = input.required<EditorLayout[]>();
    selectedLayout = input<EditorLayout | null>(null);
    layoutSelected = output<EditorLayout>();

    selectLayout(layout: EditorLayout) {
        this.layoutSelected.emit(layout);
    }
}
