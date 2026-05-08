import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { EditorLayout } from '../models/editor-layout';

@Component({
    selector: 'app-layout-selector',
    standalone: true,
    imports: [CommonModule, TranslatePipe],
    template: `
        <div class="space-y-3">
            <h3 class="text-sm font-medium text-white">{{ 'EDITOR.ChooseLayout' | translate }}</h3>
            
            <div class="grid grid-cols-1 gap-2">
                @for (layout of layouts(); track layout.id) {
                    <div 
                        (click)="selectLayout(layout)"
                        class="py-3 px-4 rounded-lg border cursor-pointer transition-all text-center group"
                        [class.border-purple-500]="selectedLayout()?.id === layout.id"
                        [class.bg-purple-500/20]="selectedLayout()?.id === layout.id"
                        [class.border-white/10]="selectedLayout()?.id !== layout.id"
                        [class.bg-white/5]="selectedLayout()?.id !== layout.id"
                        [class.hover:border-white/30]="selectedLayout()?.id !== layout.id">
                        <span class="text-sm font-medium text-white">{{ layout.name }}</span>
                        <p class="text-xs text-slate-500 mt-1">{{ layout.description }}</p>
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
