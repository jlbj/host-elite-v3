import { Component, input, output, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxEditorModule, Editor, TOOLBAR_MINIMAL } from 'ngx-editor';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { EditorSection } from '../models/editor-section';

interface ContentField {
    sectionId: string;
    fieldKey: string;
    label: string;
    type: 'text' | 'richtext' | 'image' | 'select' | 'multi-select' | 'boolean' | 'photo-picker';
    value: string;
    placeholder?: string;
    options?: { value: string; label: string }[];
}

@Component({
    selector: 'app-content-editor',
    standalone: true,
    imports: [CommonModule, FormsModule, NgxEditorModule, TranslatePipe],
    template: `
        <div class="space-y-6">
            <div>
                <h3 class="text-lg font-bold text-white mb-2">{{ 'EDITOR.EditContent' | translate }}</h3>
                <p class="text-sm text-slate-400">{{ 'EDITOR.ContentHelp' | translate }}</p>
            </div>

            @if (hasAiAccess()) {
                <div class="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
                    <div class="flex items-center justify-between mb-3">
                        <h4 class="text-sm font-bold text-purple-200 flex items-center gap-2">
                            <span>✨</span> {{ 'EDITOR.AiAssistant' | translate }}
                        </h4>
                    </div>
                    <p class="text-xs text-purple-200 mb-3">{{ 'EDITOR.AiContentHelp' | translate }}</p>
                    <button 
                        (click)="generateWithAI()"
                        [disabled]="isAiLoading()"
                        class="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                        @if (isAiLoading()) {
                            <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            {{ 'COMMON.Loading' | translate }}...
                        } @else {
                            {{ 'EDITOR.GenerateWithAI' | translate }}
                        }
                    </button>
                </div>
            }

            @for (field of fields(); track field.sectionId + '.' + field.fieldKey) {
                <div class="bg-white/5 rounded-xl p-4 border border-white/10">
                    <label class="block text-sm font-medium text-slate-300 mb-2">
                        {{ field.label | translate }}
                    </label>
                    
                    @if (field.type === 'richtext') {
                        <div class="NgxEditor__Wrapper dark-editor rounded-lg overflow-hidden border border-white/20">
                            <ngx-editor-menu [editor]="getEditor(field.sectionId + '.' + field.fieldKey)" [toolbar]="toolbarConfig"></ngx-editor-menu>
                            <ngx-editor 
                                [editor]="getEditor(field.sectionId + '.' + field.fieldKey)"
                                [ngModel]="field.value"
                                (ngModelChange)="updateContent(field.sectionId, field.fieldKey, $event)"
                                [placeholder]="field.placeholder || ('EDITOR.EnterContent' | translate)"
                                class="dark-editor-content text-sm">
                            </ngx-editor>
                        </div>
                    } @else if (field.type === 'photo-picker') {
                        <div class="photo-picker">
                            <div class="grid grid-cols-4 gap-2 mb-3">
                                @for (photo of availablePhotos(); track photo.url) {
                                    <div 
                                        class="relative aspect-video rounded-lg overflow-hidden cursor-pointer border-2 transition-all"
                                        [class.border-purple-500]="isPhotoSelected(field, photo.url)"
                                        [class.border-transparent]="!isPhotoSelected(field, photo.url)"
                                        (click)="togglePhoto(field, photo.url)">
                                        <img [src]="photo.url" class="w-full h-full object-cover" alt="">
                                        @if (isPhotoSelected(field, photo.url)) {
                                            <div class="absolute top-1 right-1 w-5 h-5 bg-purple-500 rounded-full flex items-center justify-center">
                                                <svg class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/>
                                                </svg>
                                            </div>
                                        }
                                    </div>
                                }
                            </div>
                            <p class="text-xs text-slate-400">Click photos to select/deselect. Drag to reorder.</p>
                        </div>
                    } @else if (field.type === 'select' && field.options) {
                        <select
                            [ngModel]="field.value"
                            (ngModelChange)="updateContent(field.sectionId, field.fieldKey, $event)"
                            class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm appearance-none cursor-pointer">
                            @for (opt of field.options; track opt.value) {
                                <option [value]="opt.value" class="bg-slate-800 text-white">{{ opt.label }}</option>
                            }
                        </select>
                    } @else {
                        <input 
                            type="text"
                            [ngModel]="field.value"
                            (ngModelChange)="updateContent(field.sectionId, field.fieldKey, $event)"
                            [placeholder]="field.placeholder || ('EDITOR.EnterContent' | translate)"
                            class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm">
                    }
                </div>
            }
        </div>
    `,
    styles: [`
        :host { display: block; }
        .dark-editor ::ng-deep .NgxEditor {
            background: rgba(255,255,255,0.05);
            border: none;
            border-radius: 0;
            min-height: 100px;
        }
        .dark-editor ::ng-deep .NgxEditor__MenuBar {
            background: rgba(30,41,59,0.8);
            border-bottom: 1px solid rgba(255,255,255,0.1);
            padding: 4px 8px;
        }
        .dark-editor ::ng-deep .NgxEditor__Content {
            color: white;
            font-size: 0.875rem;
        }
        .dark-editor ::ng-deep .NgxEditor__Content .NgxEditor__Placeholder {
            color: rgba(148,163,184,0.6);
        }
        .dark-editor ::ng-deep .NgxEditor__Content .ProseMirror {
            min-height: 100px;
            padding: 8px 12px;
        }
        .dark-editor ::ng-deep .NgxEditor__Content .ProseMirror:focus {
            outline: none;
        }
        .dark-editor ::ng-deep button {
            color: #cbd5e1;
        }
        .dark-editor ::ng-deep button:hover {
            color: white;
            background: rgba(255,255,255,0.1);
        }
        .dark-editor ::ng-deep button.active {
            color: #818cf8;
            background: rgba(129,140,248,0.2);
        }
    `]
})
export class ContentEditorComponent implements OnDestroy {
    sections = input.required<EditorSection[]>();
    contentData = input.required<Record<string, any>>();
    hasAiAccess = input<boolean>(false);
    availablePhotos = input<{url: string, category: string}[]>([]);
    contentUpdated = output<Record<string, any>>();
    generateAI = output<void>();
    isAiLoading = input<boolean>(false);

    readonly toolbarConfig = TOOLBAR_MINIMAL;
    
    private editors = new Map<string, Editor>();

    fields = computed(() => {
        const sectionList = this.sections();
        const content = this.contentData();
        const result: ContentField[] = [];

        for (const section of sectionList) {
            for (const field of section.fields) {
                const value = content[section.id]?.[field.key] || content[field.key] || '';
                result.push({
                    sectionId: section.id,
                    fieldKey: field.key,
                    label: field.label,
                    type: field.type,
                    value: typeof value === 'string' ? value : JSON.stringify(value),
                    placeholder: field.placeholder,
                    options: field.options
                });
            }
        }

        return result;
    });

    getEditor(key: string): Editor {
        if (!this.editors.has(key)) {
            this.editors.set(key, new Editor());
        }
        return this.editors.get(key)!;
    }

    updateContent(sectionId: string, fieldKey: string, value: string) {
        const current = this.contentData();
        const updated = {
            ...current,
            [sectionId]: {
                ...current[sectionId],
                [fieldKey]: value
            }
        };
        this.contentUpdated.emit(updated);
    }

    isPhotoSelected(field: ContentField, url: string): boolean {
        if (!field.value) return false;
        try {
            const selected = typeof field.value === 'string' ? JSON.parse(field.value) : field.value;
            return Array.isArray(selected) && selected.includes(url);
        } catch {
            return false;
        }
    }

    togglePhoto(field: ContentField, url: string) {
        let selected: string[] = [];
        try {
            selected = typeof field.value === 'string' ? JSON.parse(field.value) : field.value;
            if (!Array.isArray(selected)) selected = [];
        } catch {
            selected = [];
        }
        
        if (selected.includes(url)) {
            selected = selected.filter((u: string) => u !== url);
        } else {
            selected = [...selected, url];
        }
        
        this.updateContent(field.sectionId, field.fieldKey, JSON.stringify(selected));
    }

    generateWithAI() {
        this.generateAI.emit();
    }

    ngOnDestroy(): void {
        this.editors.forEach(editor => editor.destroy());
        this.editors.clear();
    }
}
