import { Component, input, output, signal, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { EditorLayout, EditorTheme, DEFAULT_THEME, EditorSection, EditorStep, DEFAULT_WIZARD_STEPS, WizardState } from './models';
import { PreviewGenerationService, PreviewData } from './services';
import { LayoutSelectorComponent, ThemeCustomizerComponent, SectionManagerComponent, ContentEditorComponent, PreviewPanelComponent } from './parts';
import { LayoutEditorComponent } from './parts/layout-editor.component';

// Metadata for mapping layout templateSection types to user-friendly labels/icons
const TEMPLATE_SECTION_META: Record<string, { label: string; icon: string }> = {
    'hero': { label: 'EDITOR.SectionHero', icon: '🖼️' },
    'headline': { label: 'EDITOR.SectionHeadline', icon: '📝' },
    'property-info': { label: 'EDITOR.SectionPropertyInfo', icon: '🏠' },
    'description': { label: 'EDITOR.SectionDescription', icon: '📄' },
    'amenities': { label: 'EDITOR.SectionAmenities', icon: '✨' },
    'contact': { label: 'EDITOR.SectionContact', icon: '📎' },
    'gallery': { label: 'EDITOR.SectionGallery', icon: '📸' },
};

export interface EditorSaveData {
    layout: EditorLayout;
    theme: EditorTheme;
    sections: string[];
    content: Record<string, any>;
}

@Component({
    selector: 'app-universal-editor',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        TranslatePipe,
        LayoutSelectorComponent,
        ThemeCustomizerComponent,
        SectionManagerComponent,
        ContentEditorComponent,
        PreviewPanelComponent,
        LayoutEditorComponent
    ],
    template: `
        <div class="h-full flex flex-col bg-slate-900/50 rounded-2xl overflow-hidden border border-white/10">
            
            <!-- Header -->
            <div class="flex items-center justify-between p-3 sm:p-4 border-b border-white/10 bg-white/5 backdrop-blur-md flex-shrink-0">
                <div class="flex items-center gap-4">
                    <button 
                        (click)="closeRequested.emit()"
                        class="text-slate-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full"
                        title="{{ 'COMMON.Close' | translate }}">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                        </svg>
                    </button>
                    <h2 class="text-xl font-bold text-white flex items-center gap-2">
                        <span class="text-2xl">{{ configIcon() }}</span>
                        {{ configTitle() | translate }}
                    </h2>
                    <span class="text-xs text-slate-400 hidden lg:inline-flex items-center gap-2">
                        <span>{{ selectedLayout()?.name }}</span>
                        <span>·</span>
                        <span>{{ currentTheme().template }}</span>
                    </span>
                </div>

                <div class="flex items-center gap-3">
                    @if (saveMessageInput()) {
                        <span class="text-green-400 text-sm font-medium">{{ saveMessageInput() }}</span>
                    }
                    @if (showAiButton()) {
                        <button 
                            (click)="generateAIRequested.emit()"
                            [disabled]="isAiLoading()"
                            class="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-bold transition-all flex items-center gap-2 disabled:opacity-50">
                            <span>✨</span>
                            {{ 'EDITOR.GenerateAI' | translate }}
                        </button>
                    }
                    <button 
                        (click)="saveRequested.emit(getSaveData())"
                        [disabled]="isSavingInput()"
                        class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold transition-all flex items-center gap-2 shadow-lg shadow-emerald-900/20 border border-white/10 disabled:opacity-50">
                        @if (isSavingInput()) {
                            <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        } @else {
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                            </svg>
                        }
                        {{ isSavingInput() ? ('COMMON.Saving' | translate) : ('COMMON.Save' | translate) }}
                    </button>
                </div>
            </div>

            <!-- Main Content - Split Screen -->
            <div class="flex-1 overflow-hidden flex flex-col lg:flex-row">
                
                <!-- LEFT PANEL: Foldable Accordion Sections -->
                <div class="w-full lg:w-[225px] lg:h-full overflow-y-auto custom-scrollbar border-r border-white/10 bg-slate-900/50 flex flex-col">
                    
                    <!-- Accordion Section 1: Layout -->
                    <div class="border-b border-white/10">
                        <button 
                            (click)="toggleSection(0)"
                            class="w-full px-4 py-3 flex items-center justify-between text-left transition-all"
                            [class.bg-purple-500/20]="expandedSection() === 0"
                            [class.bg-white/5]="expandedSection() !== 0">
                            <div class="flex items-center gap-2">
                                <span class="text-lg">📐</span>
                                <span class="text-sm font-medium" [class.text-white]="expandedSection() === 0" [class.text-slate-400]="expandedSection() !== 0">
                                    {{ wizardSteps[0].title | translate }}
                                </span>
                                @if (wizardSteps[0].completed) {
                                    <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                                }
                            </div>
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                class="w-4 h-4 text-slate-400 transition-transform duration-200"
                                [class.rotate-180]="expandedSection() === 0"
                                viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                            </svg>
                        </button>
                        @if (expandedSection() === 0) {
                            <div class="p-3 bg-slate-900/30">
                                <app-layout-selector
                                    [layouts]="layouts()"
                                    [selectedLayout]="selectedLayout()"
                                    (layoutSelected)="onLayoutSelected($event)">
                                </app-layout-selector>
                                
                                @if (selectedLayout()) {
                                    <button 
                                        (click)="toggleLayoutEditor()"
                                        class="w-full mt-3 py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 border"
                                        [class.bg-purple-600]="isEditingLayout()"
                                        [class.border-purple-500]="isEditingLayout()"
                                        [class.text-white]="isEditingLayout()"
                                        [class.bg-white/5]="!isEditingLayout()"
                                        [class.border-white/10]="!isEditingLayout()"
                                        [class.text-slate-300]="!isEditingLayout()"
                                        [class.hover:bg-white/10]="!isEditingLayout()">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-4 h-4">
                                            <path stroke-linecap="round" stroke-linejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
                                        </svg>
                                        {{ isEditingLayout() ? 'Close Layout Editor' : 'Edit Selected Layout' }}
                                    </button>
                                }
                            </div>
                        }
                    </div>

                    <!-- Accordion Section 2: Theme -->
                    <div class="border-b border-white/10">
                        <button 
                            (click)="toggleSection(1)"
                            class="w-full px-4 py-3 flex items-center justify-between text-left transition-all"
                            [class.bg-purple-500/20]="expandedSection() === 1"
                            [class.bg-white/5]="expandedSection() !== 1">
                            <div class="flex items-center gap-2">
                                <span class="text-lg">🎨</span>
                                <span class="text-sm font-medium" [class.text-white]="expandedSection() === 1" [class.text-slate-400]="expandedSection() !== 1">
                                    {{ wizardSteps[1].title | translate }}
                                </span>
                                @if (wizardSteps[1].completed) {
                                    <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                                }
                            </div>
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                class="w-4 h-4 text-slate-400 transition-transform duration-200"
                                [class.rotate-180]="expandedSection() === 1"
                                viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                            </svg>
                        </button>
                        @if (expandedSection() === 1) {
                            <div class="p-3 bg-slate-900/30">
                                <app-theme-customizer
                                    [currentTheme]="currentTheme()"
                                    (themeChanged)="onThemeChanged($event)">
                                </app-theme-customizer>
                            </div>
                        }
                    </div>

                    <!-- Accordion Section 3: Sections -->
                    @if (showSectionManager()) {
                        <div class="border-b border-white/10">
                            <button 
                                (click)="toggleSection(2)"
                                class="w-full px-4 py-3 flex items-center justify-between text-left transition-all"
                                [class.bg-purple-500/20]="expandedSection() === 2"
                                [class.bg-white/5]="expandedSection() !== 2">
                                <div class="flex items-center gap-2">
                                    <span class="text-lg">📑</span>
                                    <span class="text-sm font-medium" [class.text-white]="expandedSection() === 2" [class.text-slate-400]="expandedSection() !== 2">
                                        {{ wizardSteps[2].title | translate }}
                                    </span>
                                    @if (wizardSteps[2].completed) {
                                        <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                                    }
                                </div>
                                <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    class="w-4 h-4 text-slate-400 transition-transform duration-200"
                                    [class.rotate-180]="expandedSection() === 2"
                                    viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                                </svg>
                            </button>
                            @if (expandedSection() === 2) {
                                <div class="p-3 bg-slate-900/30">
                                    <app-section-manager
                                        [sections]="displaySections()"
                                        [selectedSectionIds]="selectedSectionIds()"
                                        (sectionsUpdated)="onSectionsUpdated($event)">
                                    </app-section-manager>
                                </div>
                            }
                        </div>
                    }

                    <!-- Accordion Section 4: Content -->
                    <div class="border-b border-white/10">
                        <button 
                            (click)="toggleSection(showSectionManager() ? 3 : 2)"
                            class="w-full px-4 py-3 flex items-center justify-between text-left transition-all"
                            [class.bg-purple-500/20]="expandedSection() === (showSectionManager() ? 3 : 2)"
                            [class.bg-white/5]="expandedSection() !== (showSectionManager() ? 3 : 2)">
                            <div class="flex items-center gap-2">
                                <span class="text-lg">✏️</span>
                                <span class="text-sm font-medium" [class.text-white]="expandedSection() === (showSectionManager() ? 3 : 2)" [class.text-slate-400]="expandedSection() !== (showSectionManager() ? 3 : 2)">
                                    {{ wizardSteps[showSectionManager() ? 3 : 2].title | translate }}
                                </span>
                                @if (wizardSteps[showSectionManager() ? 3 : 2].completed) {
                                    <span class="w-2 h-2 bg-green-500 rounded-full"></span>
                                }
                            </div>
                            <svg 
                                xmlns="http://www.w3.org/2000/svg" 
                                class="w-4 h-4 text-slate-400 transition-transform duration-200"
                                [class.rotate-180]="expandedSection() === (showSectionManager() ? 3 : 2)"
                                viewBox="0 0 20 20" fill="currentColor">
                                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                            </svg>
                        </button>
                        @if (expandedSection() === (showSectionManager() ? 3 : 2)) {
                            <div class="p-3 bg-slate-900/30">
                                <app-content-editor
                                    [sections]="sections()"
                                    [contentData]="contentData()"
                                    [hasAiAccess]="hasAiAccess()"
                                    [isAiLoading]="isAiLoading()"
                                    [availablePhotos]="propertyPhotos()"
                                    [propertyEquipments]="propertyEquipments()"
                                    (contentUpdated)="onContentUpdated($event)"
                                    (generateAI)="generateAIRequested.emit()">
                                </app-content-editor>
                            </div>
                        }
                    </div>
                </div>

                <!-- RIGHT PANEL: Preview or Layout Editor -->
                <div class="flex-1 lg:h-full bg-slate-800 overflow-hidden" [class.hidden]="isFullscreenPreview()">
                    @if (isEditingLayout()) {
                        <app-layout-editor></app-layout-editor>
                    } @else {
                        <app-preview-panel
                            [previewHtml]="previewHtml()"
                            [theme]="currentTheme()"
                            [layout]="selectedLayout()"
                            [previewModeInput]="previewMode()"
                            [forceMobileFrame]="forceMobileFrame()"
                            (fullscreenChanged)="onFullscreenChanged($event)">
                        </app-preview-panel>
                    }
                </div>
            </div>
        </div>

        <!-- Fullscreen Preview Overlay -->
        @if (isFullscreenPreview()) {
            <div class="fixed inset-0 bg-slate-900 z-50 flex flex-col">
                <app-preview-panel
                    [previewHtml]="previewHtml()"
                    [theme]="currentTheme()"
                    [layout]="selectedLayout()"
                    [previewModeInput]="previewMode()"
                    [forceMobileFrame]="forceMobileFrame()"
                    (fullscreenChanged)="onFullscreenChanged($event)">
                </app-preview-panel>
            </div>
        }
    `,
    styles: [`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.3); }
    `]
})
export class UniversalEditorComponent {
    // Configuration Inputs
    editorType = input<'listing' | 'welcome-booklet' | 'microsite'>('listing');
    propertyName = input<string>('');
    propertyEquipmentsInput = input<string[]>([]);
    layouts = input.required<EditorLayout[]>();
    sections = input.required<EditorSection[]>();
    themeDefaults = input.required<EditorTheme>();
    contentData = input.required<Record<string, any>>();
    
    // Pre-selected layout and theme (from wrappers)
    selectedLayoutInput = input<EditorLayout | null>(null);
    selectedThemeInput = input<EditorTheme | null>(null);
    
    // Optional Configuration
    previewMode = input<'desktop' | 'tablet' | 'mobile'>('desktop');
    forceMobileFrame = input<boolean>(false);
    showSectionManager = input<boolean>(true);
    showAiButton = input<boolean>(true);
    hasAiAccess = input<boolean>(true);
    configTitle = input<string>('EDITOR.Title');
    configIcon = input<string>('🎨');

    // Status Inputs (from wrappers)
    isSavingInput = input<boolean>(false);
    saveMessageInput = input<string | null>(null);
    isAiLoadingInput = input<boolean>(false);

    // State Outputs
    layoutSelected = output<EditorLayout>();
    themeChanged = output<EditorTheme>();
    sectionsUpdated = output<string[]>();
    contentUpdated = output<Record<string, any>>();
    saveRequested = output<EditorSaveData>();
    closeRequested = output<void>();
    generateAIRequested = output<void>();

    // Status Signals (local)
    isAiLoading = signal<boolean>(false);

    // Internal State
    selectedLayout = signal<EditorLayout | null>(null);
    currentTheme = signal<EditorTheme>({ ...DEFAULT_THEME });
    selectedSectionIds = signal<string[]>([]);
    currentContent = signal<Record<string, any>>({});
    propertyPhotos = signal<{url: string, category: string}[]>([]);
    propertyEquipments = signal<string[]>([]);
    previewHtml = signal<string>('');
    isFullscreenPreview = signal(false);
    isEditingLayout = signal(false);
    expandedSection = signal(0);

    // Computed: convert layout templateSections into EditorSection[] format for the SectionManager
    displaySections = computed<EditorSection[]>(() => {
        const layout = this.selectedLayout();
        if (!layout || !layout.templateSections) return [];

        // Deduplicate by type (some layouts may have duplicate types)
        const seen = new Set<string>();
        return layout.templateSections
            .filter(ts => {
                if (seen.has(ts.type)) return false;
                seen.add(ts.type);
                return true;
            })
            .map(ts => ({
                id: ts.type,
                label: TEMPLATE_SECTION_META[ts.type]?.label || ts.type,
                icon: TEMPLATE_SECTION_META[ts.type]?.icon || '📋',
                category: 'content' as const,
                required: false,
                fields: []
            }));
    });

    private previewService = inject(PreviewGenerationService) as any;

    // Wizard State
    wizardSteps = [...DEFAULT_WIZARD_STEPS];
    currentStepIndex = signal(0);

    wizardState = computed<WizardState>(() => {
        const completed = this.wizardSteps.filter(s => s.completed).length;
        const total = this.wizardSteps.length;
        return {
            currentStep: this.currentStepIndex(),
            steps: this.wizardSteps,
            canProceed: this.canProceed(),
            completionPercentage: Math.round((completed / total) * 100)
        };
    });

    canProceed = computed(() => {
        const step = this.wizardSteps[this.currentStepIndex()];
        if (!step) return true;
        
        switch (step.id) {
            case 'layout':
                return !!this.selectedLayout();
            case 'theme':
                return !!this.currentTheme();
            case 'sections':
                return !this.showSectionManager() || this.selectedSectionIds().length > 0;
            case 'content':
                return Object.keys(this.currentContent()).length > 0;
            default:
                return true;
        }
    });

    constructor() {
        // Initialize layout from input or defaults
        effect(() => {
            const inputLayout = this.selectedLayoutInput();
            if (inputLayout) {
                this.selectedLayout.set(inputLayout);
                this.wizardSteps[0].completed = true;
            }
        });

        // Initialize theme from input or defaults
        effect(() => {
            const inputTheme = this.selectedThemeInput();
            if (inputTheme) {
                this.currentTheme.set(inputTheme);
                this.wizardSteps[1].completed = true;
            } else {
                const defaults = this.themeDefaults();
                if (defaults) {
                    this.currentTheme.set({ ...defaults });
                }
            }
        });

        // Initialize property equipments
        effect(() => {
            const equipments = this.propertyEquipmentsInput();
            if (equipments && equipments.length > 0) {
                this.propertyEquipments.set(equipments);
            }
        });

        // Initialize content
        effect(() => {
            const content = this.contentData();
            if (content) {
                this.currentContent.set({ ...content });
            }
        });

        // Initialize selected sections from layout's templateSections (all visible ones)
        effect(() => {
            const layout = this.selectedLayout();
            if (layout && layout.templateSections) {
                const selected = layout.templateSections
                    .filter(s => s.visible)
                    .map(s => s.type);
                // Deduplicate
                this.selectedSectionIds.set([...new Set(selected)]);
            }
        });

        // Update preview when content, layout, or theme changes
        effect(() => {
            const layout = this.selectedLayout();
            const theme = this.currentTheme();
            const content = this.currentContent();
            const sections = this.selectedSectionIds();
            
            if (layout && theme) {
                this.generatePreview(layout, theme, content, sections);
            }
        });
    }

    onLayoutSelected(layout: EditorLayout) {
        this.selectedLayout.set(layout);
        this.layoutSelected.emit(layout);
        this.wizardSteps[0].completed = true;
    }

    onThemeChanged(theme: EditorTheme) {
        this.currentTheme.set(theme);
        this.themeChanged.emit(theme);
        this.wizardSteps[1].completed = true;
    }

    onSectionsUpdated(sectionIds: string[]) {
        this.selectedSectionIds.set(sectionIds);
        this.sectionsUpdated.emit(sectionIds);
        this.wizardSteps[2].completed = true;
    }

    onContentUpdated(content: Record<string, any>) {
        this.currentContent.set(content);
        
        // Extract photos from content for the photo picker (handle multiple possible structures)
        const photos = content['photos'] || 
                       content['photo-gallery']?.['photos'] || 
                       content['photo-gallery']?.['selectedPhotos'] ||
                       [];
        if (photos.length > 0) {
            try {
                // Parse if stringified
                const parsedPhotos = typeof photos === 'string' ? JSON.parse(photos) : photos;
                this.propertyPhotos.set(Array.isArray(parsedPhotos) ? parsedPhotos : []);
            } catch {
                this.propertyPhotos.set([]);
            }
        }
        
        // DO NOT extract amenities to propertyEquipments - propertyEquipments must contain ALL available equipments from the property, not just selected ones
        // propertyEquipments is set by the wrapper component from property.property_equipments
        
        this.contentUpdated.emit(content);
        this.wizardSteps[3].completed = true;
    }

    onFullscreenChanged(isFullscreen: boolean) {
        this.isFullscreenPreview.set(isFullscreen);
    }

    toggleSection(index: number) {
        if (this.expandedSection() === index) {
            this.expandedSection.set(-1);
        } else {
            this.expandedSection.set(index);
            // Hide the layout editor if we switch away from the layout tab
            if (index !== 0) {
                this.isEditingLayout.set(false);
            }
        }
    }

    toggleLayoutEditor() {
        this.isEditingLayout.update(v => !v);
    }

    markStepCompleted(stepId: string) {
        const step = this.wizardSteps.find(s => s.id === stepId);
        if (step) {
            step.completed = true;
        }
    }

    generatePreview(layout: EditorLayout, theme: EditorTheme, content: Record<string, any>, sections: string[]) {
        const previewData: PreviewData = {
            layout,
            theme,
            sections,
            content,
            photos: content['photo-gallery']?.['photos'] || content['photos'] || [],
            propertyDetails: content['propertyDetails'] || {}
        };

        const html = this.previewService.generateHtml(previewData);
        this.previewHtml.set(html);
    }

    getSaveData(): EditorSaveData {
        return {
            layout: this.selectedLayout()!,
            theme: this.currentTheme(),
            sections: this.selectedSectionIds(),
            content: this.currentContent()
        };
    }
}
