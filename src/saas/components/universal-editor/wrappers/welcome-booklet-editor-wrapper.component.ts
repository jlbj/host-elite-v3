import { Component, inject, input, output, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { UniversalEditorComponent, EditorSaveData } from '../../../components/universal-editor/universal-editor.component';
import { WELCOME_BOOKLET_EDITOR_CONFIG } from '../../../components/universal-editor/configs/welcome-booklet-config';
import { EditorLayout } from '../../../components/universal-editor/models/editor-layout';
import { EditorTheme } from '../../../components/universal-editor/models/editor-theme';
import { WelcomeBookletService } from '../../../views/welcome-booklet/welcome-booklet.service';
import { WelcomeBookletAiService } from '../../../views/welcome-booklet/welcome-booklet-ai.service';
import { FaqItem } from '../../../views/welcome-booklet/booklet-definitions';
import { HostRepository } from '../../../../services/host-repository.service';
import { TranslationService } from '../../../../services/translation.service';
import { TranslatePipe } from '../../../../pipes/translate.pipe';

@Component({
    selector: 'app-welcome-booklet-editor-wrapper',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslatePipe, UniversalEditorComponent],
    host: { class: 'h-full block' },
    template: `
        <div class="h-full flex flex-col">
            <div class="flex-1 overflow-hidden" style="min-height: 600px;">
                <app-universal-editor
                    [editorType]="config.editorType"
                    [layouts]="config.layouts"
                    [sections]="config.sections"
                    [themeDefaults]="config.themeDefaults"
                    [contentData]="contentData()"
                    [propertyName]="propertyName()"
                    [selectedLayoutInput]="selectedLayout()"
                    [selectedThemeInput]="currentTheme()"
                    [previewMode]="config.previewMode"
                    [showSectionManager]="config.showSectionManager"
                    [showAiButton]="true"
                    [hasAiAccess]="true"
                    [configTitle]="config.title"
                    [configIcon]="config.icon"
                    [propertyEquipmentsInput]="propertyEquipments()"
                    [isSavingInput]="isSaving()"
                    [saveMessageInput]="saveMessage()"
                    (layoutSelected)="onLayoutSelected($event)"
                    (themeChanged)="onThemeChanged($event)"
                    (sectionsUpdated)="onSectionsUpdated($event)"
                    (contentUpdated)="onContentUpdated($event)"
                    (saveRequested)="save($event)"
                    (closeRequested)="close.emit()"
                    (generateAIRequested)="generateWithAI()">
                </app-universal-editor>
            </div>

            <div class="bg-slate-900/50 border-t border-white/10 p-3 flex flex-wrap gap-2">
                <button (click)="openExtras.set(true)" data-debug-id="open-extras-button"
                    class="px-3 py-1.5 text-sm bg-white/10 hover:bg-white/20 text-white rounded-md transition-colors flex items-center gap-1.5">
                    <span>⚙️</span> {{ 'BOOKLET.AdditionalSettings' | translate }}
                </button>
                <button (click)="generateFaqs()" data-debug-id="generate-faq-button"
                    class="px-3 py-1.5 text-sm bg-purple-600/30 hover:bg-purple-600/50 text-purple-100 rounded-md transition-colors flex items-center gap-1.5">
                    <span>✨</span> {{ 'BOOKLET.GenerateFAQ' | translate }}
                </button>
            </div>

            @if (openExtras()) {
                <div class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" (click)="openExtras.set(false)">
                    <div class="bg-slate-800 rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col" (click)="$event.stopPropagation()">
                        <div class="p-4 border-b border-white/10 flex justify-between items-center flex-shrink-0">
                            <h3 class="text-lg font-bold text-white">{{ 'BOOKLET.AdditionalSettings' | translate }}</h3>
                            <button (click)="openExtras.set(false)" class="text-slate-400 hover:text-white p-1">✕</button>
                        </div>
                        <div class="p-4 overflow-y-auto space-y-6">

                            <section>
                                <h4 class="text-sm font-bold text-slate-200 mb-3">{{ 'BOOKLET.MicrositeDesign' | translate }}</h4>
                                <div class="space-y-3">
                                    <div>
                                        <label class="block text-xs text-slate-300 mb-1">{{ 'BOOKLET.Headline' | translate }}</label>
                                        <input type="text" [ngModel]="micrositeHeadline()" (ngModelChange)="updateMicrositeHeadline($event)"
                                            class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm" />
                                    </div>
                                    <div class="grid grid-cols-2 gap-3">
                                        <div>
                                            <label class="block text-xs text-slate-300 mb-1">{{ 'BOOKLET.HeroLayout' | translate }}</label>
                                            <select [ngModel]="micrositeHeroLayout()" (ngModelChange)="updateMicrositeHeroLayout($event)"
                                                class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm">
                                                <option value="full">{{ 'BOOKLET.HeroLayoutFull' | translate }}</option>
                                                <option value="split">{{ 'BOOKLET.HeroLayoutSplit' | translate }}</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label class="block text-xs text-slate-300 mb-1">{{ 'BOOKLET.HeaderPhotoUrl' | translate }}</label>
                                            <input type="text" [ngModel]="micrositeHeaderPhotoUrl()" (ngModelChange)="updateMicrositeHeaderPhotoUrl($event)"
                                                class="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm" />
                                        </div>
                                    </div>
                                    <div>
                                        <label class="block text-xs text-slate-300 mb-2">{{ 'BOOKLET.HiddenPhotos' | translate }}</label>
                                        <div class="grid grid-cols-4 sm:grid-cols-6 gap-2">
                                            @for (photo of service.propertyPhotos(); track photo.url) {
                                                <div class="relative aspect-video rounded overflow-hidden border-2 cursor-pointer"
                                                    [class.border-purple-500]="isPhotoHidden(photo.url)"
                                                    [class.border-transparent]="!isPhotoHidden(photo.url)"
                                                    (click)="togglePhotoHidden(photo.url)">
                                                    <img [src]="photo.url" class="w-full h-full object-cover" alt="" />
                                                    @if (isPhotoHidden(photo.url)) {
                                                        <div class="absolute inset-0 bg-black/70 flex items-center justify-center text-white text-xs font-medium">{{ 'BOOKLET.Hidden' | translate }}</div>
                                                    }
                                                </div>
                                            }
                                        </div>
                                        @if (service.propertyPhotos().length === 0) {
                                            <p class="text-xs text-slate-500 italic">{{ 'BOOKLET.NoPhotos' | translate }}</p>
                                        }
                                    </div>
                                </div>
                            </section>

                            <hr class="border-white/10" />

                            <section>
                                <div class="flex items-center justify-between mb-3">
                                    <h4 class="text-sm font-bold text-slate-200">{{ 'BOOKLET.faq_title' | translate }}</h4>
                                    <button (click)="addFaqItem()" data-debug-id="add-faq-item"
                                        class="text-xs bg-blue-600 hover:bg-blue-500 text-white px-2 py-1 rounded">
                                        + {{ 'COMMON.Add' | translate }}
                                    </button>
                                </div>
                                <div class="space-y-2">
                                    @for (item of faqItems(); track $index; let i = $index) {
                                        <div class="bg-white/5 border border-white/10 rounded-lg p-3 space-y-2">
                                            <div class="flex items-start gap-2">
                                                <input type="text" [ngModel]="item.question" (ngModelChange)="updateFaqItem(i, 'question', $event)"
                                                    [placeholder]="'BOOKLET.FaqQuestion' | translate"
                                                    class="flex-1 bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm" />
                                                <button (click)="removeFaqItem(i)" class="text-red-400 hover:text-red-300 p-1">✕</button>
                                            </div>
                                            <textarea [ngModel]="item.answer" (ngModelChange)="updateFaqItem(i, 'answer', $event)" rows="2"
                                                [placeholder]="'BOOKLET.FaqAnswer' | translate"
                                                class="w-full bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm resize-none"></textarea>
                                            <label class="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                                                <input type="checkbox" [ngModel]="item.visible" (ngModelChange)="updateFaqItem(i, 'visible', $event)" />
                                                {{ 'BOOKLET.VisibleInMicrosite' | translate }}
                                            </label>
                                        </div>
                                    }
                                    @if (faqItems().length === 0) {
                                        <p class="text-xs text-slate-500 italic text-center py-3">{{ 'BOOKLET.NoFaqItems' | translate }}</p>
                                    }
                                </div>
                            </section>

                        </div>
                    </div>
                </div>
            }
        </div>
    `
})
export class WelcomeBookletEditorWrapperComponent {
    propertyName = input.required<string>();
    close = output<void>();

    readonly config = WELCOME_BOOKLET_EDITOR_CONFIG;
    service = inject(WelcomeBookletService);
    aiService = inject(WelcomeBookletAiService);
    repository = inject(HostRepository);
    translationService = inject(TranslationService);
    private fb = inject(FormBuilder);

    contentData = signal<Record<string, any>>({});
    propertyEquipments = signal<string[]>([]);
    selectedLayout = signal<EditorLayout | null>(null);
    currentTheme = signal<EditorTheme | null>(null);
    isSaving = signal(false);
    saveMessage = signal<string | null>(null);
    openExtras = signal(false);

    micrositeHeadline = computed(() => this.service.micrositeConfig().headline || '');
    micrositeHeroLayout = computed(() => this.service.micrositeConfig().heroLayout || 'full');
    micrositeHeaderPhotoUrl = computed(() => this.service.micrositeConfig().headerPhotoUrl || '');

    faqItems = computed<FaqItem[]>(() => {
        const arr = this.service.editorForm.get('faq') as FormArray;
        return arr ? (arr.value as FaqItem[]) : [];
    });

    private initialized = false;

    constructor() {
        effect(() => {
            const name = this.propertyName();
            if (name) {
                this.service.propertyName.set(name);
            }
        });

        effect(() => {
            const layout = this.selectedLayout();
            const theme = this.currentTheme();
            if (!layout || !theme) return;
            this.service.micrositeConfig.update(c => ({
                ...c,
                theme,
                layoutId: layout.id,
                template: layout.id as any,
                primaryColor: theme.primaryColor,
                buttonStyle: theme.buttonStyle as any,
                iconStyle: theme.iconStyle === 'emoji' ? 'emoji' : theme.iconStyle === 'minimalist' ? 'minimalist' : 'drawn',
                font: theme.fontFamily?.includes('serif') ? 'serif' : theme.fontFamily?.includes('mono') ? 'mono' : 'inter',
            }));
        });

        effect(() => {
            const propertyId = this.service.propertyId();
            if (propertyId && !this.initialized) {
                this.initializeFromService();
            }
        });
    }

    private initializeFromService() {
        this.initialized = true;
        this.contentData.set(this.extractContentFromForm());
        this.propertyEquipments.set(this.service.propertyEquipments());

        const cfg = this.service.micrositeConfig();
        const layoutId = cfg.layoutId || cfg.template || 'editorial';
        const layout = this.config.layouts.find(l => l.id === layoutId) || this.config.layouts[0];
        this.selectedLayout.set(layout);

        if (cfg.theme) {
            this.currentTheme.set(cfg.theme as EditorTheme);
        } else {
            this.currentTheme.set({
                ...this.config.themeDefaults,
                primaryColor: cfg.primaryColor,
                buttonStyle: cfg.buttonStyle || 'rounded',
                iconStyle: cfg.iconStyle === 'minimalist' ? 'minimalist' : 'emoji',
                fontFamily: cfg.font === 'serif' ? 'Georgia, serif' : cfg.font === 'mono' ? 'monospace' : 'system-ui',
            } as EditorTheme);
        }
    }

    private extractContentFromForm(): Record<string, any> {
        const form = this.service.editorForm;
        const result: Record<string, any> = {
            general: {
                address: form.get('address')?.value || '',
                coverImageUrl: form.get('coverImageUrl')?.value || '',
                gpsCoordinates: form.get('gpsCoordinates')?.value || '',
            }
        };
        for (const section of this.service.sections) {
            const group = form.get(section.formGroupName) as FormGroup;
            if (!group) continue;
            const sectionData: Record<string, any> = {};
            for (const key of Object.keys(group.controls)) {
                if (key.endsWith('_pdf') || key === 'rental_rooms') continue;
                sectionData[key] = group.get(key)?.value || '';
            }
            result[section.id] = sectionData;
        }
        const photosArray = form.get('photos') as FormArray;
        if (photosArray) {
            result['photo-gallery'] = {
                selectedPhotos: JSON.stringify(photosArray.value.map((p: any) => p.url).filter(Boolean))
            };
        }
        return result;
    }

    private applyContentToForm(content: Record<string, any>) {
        const form = this.service.editorForm;
        if (content.general) {
            form.patchValue({
                address: content.general.address || '',
                coverImageUrl: content.general.coverImageUrl || '',
                gpsCoordinates: content.general.gpsCoordinates || '',
            });
        }
        for (const section of this.service.sections) {
            const group = form.get(section.formGroupName) as FormGroup;
            if (!group) continue;
            const sectionData = content[section.id];
            if (!sectionData || typeof sectionData !== 'object') continue;
            for (const key of Object.keys(sectionData)) {
                if (key === 'rental_rooms') continue;
                const control = group.get(key);
                if (control && !key.endsWith('_pdf')) {
                    control.setValue(sectionData[key] || '');
                }
            }
        }
        if (content['photo-gallery']?.selectedPhotos) {
            try {
                const urls = JSON.parse(content['photo-gallery'].selectedPhotos);
                const photosArray = form.get('photos') as FormArray;
                photosArray.clear();
                (urls as string[]).forEach((url: string) => {
                    photosArray.push(this.fb.group({ url: [url], category: [''] }));
                });
            } catch { /* ignore */ }
        }
    }

    onLayoutSelected(layout: EditorLayout) {
        this.selectedLayout.set(layout);
    }

    onThemeChanged(theme: EditorTheme) {
        this.currentTheme.set(theme);
    }

    onSectionsUpdated(sections: string[]) {
        this.service.micrositeConfig.update(c => ({ ...c, visibleSections: sections }));
    }

    onContentUpdated(content: Record<string, any>) {
        this.contentData.set(content);
    }

    isPhotoHidden(url: string): boolean {
        return (this.service.micrositeConfig().hiddenPhotoUrls || []).includes(url);
    }

    togglePhotoHidden(url: string) {
        this.service.micrositeConfig.update(c => {
            const hidden = c.hiddenPhotoUrls || [];
            return {
                ...c,
                hiddenPhotoUrls: hidden.includes(url) ? hidden.filter(u => u !== url) : [...hidden, url]
            };
        });
    }

    updateMicrositeHeadline(value: string) {
        this.service.micrositeConfig.update(c => ({ ...c, headline: value }));
    }

    updateMicrositeHeroLayout(value: 'full' | 'split') {
        this.service.micrositeConfig.update(c => ({ ...c, heroLayout: value }));
    }

    updateMicrositeHeaderPhotoUrl(value: string) {
        this.service.micrositeConfig.update(c => ({ ...c, headerPhotoUrl: value || null }));
    }

    addFaqItem() {
        const arr = this.service.editorForm.get('faq') as FormArray;
        arr.push(this.fb.group({ question: [''], answer: [''], visible: [true] }));
    }

    removeFaqItem(index: number) {
        const arr = this.service.editorForm.get('faq') as FormArray;
        arr.removeAt(index);
    }

    updateFaqItem(index: number, key: keyof FaqItem, value: any) {
        const arr = this.service.editorForm.get('faq') as FormArray;
        arr.at(index).get(key)?.setValue(value);
    }

    generateFaqs() {
        this.service.generateFaqsWithAI();
    }

    async save(data: EditorSaveData) {
        this.isSaving.set(true);
        try {
            this.applyContentToForm(data.content);
            this.service.micrositeConfig.update(c => ({
                ...c,
                theme: data.theme,
                layoutId: data.layout.id,
                template: data.layout.id as any,
                primaryColor: data.theme.primaryColor,
                buttonStyle: data.theme.buttonStyle,
                iconStyle: data.theme.iconStyle === 'emoji' ? 'emoji' : data.theme.iconStyle === 'minimalist' ? 'minimalist' : 'drawn',
                font: data.theme.fontFamily?.includes('serif') ? 'serif' : data.theme.fontFamily?.includes('mono') ? 'mono' : 'inter',
                visibleSections: data.sections,
            }));
            await this.service.save();
            this.saveMessage.set(this.translationService.translate('COMMON.Saved'));
            setTimeout(() => this.saveMessage.set(null), 3000);
        } catch (e) {
            console.error('Save error:', e);
            this.saveMessage.set(this.translationService.translate('COMMON.ErrorSaving') || 'Error');
            setTimeout(() => this.saveMessage.set(null), 3000);
        } finally {
            this.isSaving.set(false);
        }
    }

    async generateWithAI() {
        const address = this.service.editorForm.get('address')?.value;
        if (!address) {
            alert(this.translationService.translate('BOOKLET.AddressRequired') || 'Veuillez entrer une adresse d\'abord.');
            return;
        }
        await this.aiService.autoFill(this.service.editorForm, address, this.service.sections);
        this.contentData.set(this.extractContentFromForm());
    }
}
