import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { EditorSection } from '../models/editor-section';

@Component({
    selector: 'app-section-manager',
    standalone: true,
    imports: [CommonModule, TranslatePipe],
    template: `
        <div class="space-y-6">
            <div>
                <h3 class="text-lg font-bold text-white mb-2">{{ 'EDITOR.SelectSections' | translate }}</h3>
                <p class="text-sm text-slate-400">{{ 'EDITOR.SectionsHelp' | translate }}</p>
            </div>

            <!-- Sections by Category -->
            @for (category of categories(); track category.id) {
                <div class="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h4 class="text-sm font-bold text-slate-300 uppercase tracking-wide mb-3 flex items-center gap-2">
                        <span>{{ category.icon }}</span>
                        {{ category.label | translate }}
                    </h4>
                    <div class="space-y-2">
                        @for (section of category.sections; track section.id) {
                            <div class="flex items-center justify-between p-2 rounded hover:bg-white/5 transition-colors">
                                <div class="flex items-center gap-3">
                                    <input 
                                        type="checkbox" 
                                        [id]="'section-' + section.id"
                                        [checked]="isSelected(section.id)"
                                        (change)="toggleSection(section.id, $event)"
                                        [disabled]="section.required"
                                        class="w-4 h-4 rounded border-slate-500 bg-white/10 text-purple-500 focus:ring-purple-500">
                                    <label [for]="'section-' + section.id" class="text-sm text-white cursor-pointer flex items-center gap-2">
                                        @if (section.icon) {
                                            <span>{{ section.icon }}</span>
                                        }
                                        {{ section.label | translate }}
                                        @if (section.required) {
                                            <span class="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">Required</span>
                                        }
                                    </label>
                                </div>
                            </div>
                        }
                    </div>
                </div>
            }

            <!-- Section Order -->
            @if (selectedSections().length > 1) {
                <div class="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h4 class="text-sm font-bold text-slate-300 uppercase tracking-wide mb-3">
                        {{ 'EDITOR.SectionOrder' | translate }}
                    </h4>
                    <div class="space-y-1">
                        @for (sectionId of selectedSections(); track sectionId; let i = $index) {
                            <div class="flex items-center gap-2 bg-white/5 rounded p-2">
                                <span class="text-xs text-slate-400 w-6">{{ i + 1 }}.</span>
                                <span class="text-sm text-white flex-1">{{ getSectionLabel(sectionId) | translate }}</span>
                                <div class="flex gap-1">
                                    <button 
                                        (click)="moveSection(i, 'up')" 
                                        [disabled]="i === 0"
                                        class="p-1 text-slate-400 hover:text-white disabled:opacity-30 transition-colors">
                                        ↑
                                    </button>
                                    <button 
                                        (click)="moveSection(i, 'down')" 
                                        [disabled]="i === selectedSections().length - 1"
                                        class="p-1 text-slate-400 hover:text-white disabled:opacity-30 transition-colors">
                                        ↓
                                    </button>
                                </div>
                            </div>
                        }
                    </div>
                </div>
            }
        </div>
    `,
    styles: [`
        :host { display: block; }
    `]
})
export class SectionManagerComponent {
    sections = input.required<EditorSection[]>();
    selectedSectionIds = input.required<string[]>();
    sectionsUpdated = output<string[]>();

    readonly categories = computed(() => {
        const sectionList = this.sections();
        const categoryMap = new Map<string, { id: string; label: string; icon: string; sections: EditorSection[] }>();
        
        const categoryInfo = {
            'content': { icon: '📝', label: 'EDITOR.CategoryContent' },
            'info': { icon: 'ℹ️', label: 'EDITOR.CategoryInfo' },
            'media': { icon: '🖼️', label: 'EDITOR.CategoryMedia' },
            'settings': { icon: '⚙️', label: 'EDITOR.CategorySettings' }
        };

        for (const section of sectionList) {
            const catId = section.category;
            if (!categoryMap.has(catId)) {
                const info = categoryInfo[catId as keyof typeof categoryInfo];
                categoryMap.set(catId, { id: catId, label: info.label, icon: info.icon, sections: [] });
            }
            categoryMap.get(catId)!.sections.push(section);
        }

        return Array.from(categoryMap.values());
    });

    selectedSections = computed(() => {
        const selectedIds = this.selectedSectionIds();
        const allSections = this.sections();
        return selectedIds
            .map(id => allSections.find(s => s.id === id))
            .filter((s): s is EditorSection => !!s)
            .map(s => s.id);
    });

    isSelected(sectionId: string): boolean {
        return this.selectedSectionIds().includes(sectionId);
    }

    toggleSection(sectionId: string, event: Event) {
        const checked = (event.target as HTMLInputElement).checked;
        const current = [...this.selectedSectionIds()];
        
        if (checked) {
            if (!current.includes(sectionId)) {
                current.push(sectionId);
            }
        } else {
            const index = current.indexOf(sectionId);
            if (index > -1) {
                current.splice(index, 1);
            }
        }
        
        this.sectionsUpdated.emit(current);
    }

    moveSection(index: number, direction: 'up' | 'down') {
        const current = [...this.selectedSectionIds()];
        if (direction === 'up' && index > 0) {
            [current[index], current[index - 1]] = [current[index - 1], current[index]];
        } else if (direction === 'down' && index < current.length - 1) {
            [current[index], current[index + 1]] = [current[index + 1], current[index]];
        }
        this.sectionsUpdated.emit(current);
    }

    getSectionLabel(sectionId: string): string {
        const section = this.sections().find(s => s.id === sectionId);
        return section?.label || sectionId;
    }
}
