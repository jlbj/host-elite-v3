import { Component, input, output, signal, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { EditorLayout, EditorTheme, DEFAULT_THEME, EditorSection, EditorStep, DEFAULT_WIZARD_STEPS, WizardState } from './models';
import { PreviewGenerationService, PreviewData } from './services';
import { LayoutSelectorComponent, ThemeCustomizerComponent, SectionManagerComponent, ContentEditorComponent, PreviewPanelComponent } from './parts';

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
        PreviewPanelComponent
    ],
    template: `
        <div class="h-[calc(100vh-6rem)] flex flex-col bg-slate-900/50 rounded-2xl overflow-hidden border border-white/10">
            
            <!-- Header -->
            <div class="flex items-center justify-between p-4 border-b border-white/10 bg-white/5 backdrop-blur-md">
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
                    <!-- Quick Info -->
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

            <!-- Tab Navigation / Wizard Steps -->
            <div class="flex border-b border-white/10 bg-white/5">
                @for (step of wizardSteps; track step.id; let i = $index) {
                    <button 
                        (click)="goToStep(i)"
                        class="flex-1 py-3 px-4 text-xs font-medium transition-all text-center relative"
                        [class.bg-purple-500/20]="currentStepIndex() === i"
                        [class.text-white]="currentStepIndex() === i"
                        [class.text-slate-400]="currentStepIndex() !== i"
                        [class.border-b-2]="currentStepIndex() === i"
                        [class.border-purple-500]="currentStepIndex() === i">
                        <div class="flex items-center justify-center gap-2">
                            <span class="text-lg">{{ step.icon }}</span>
                            <span class="hidden sm:inline">{{ step.title | translate }}</span>
                        </div>
                        @if (step.completed) {
                            <span class="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full"></span>
                        }
                    </button>
                }
            </div>

            <!-- Progress Bar -->
            <div class="h-1 bg-white/10">
                <div 
                    class="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
                    [style.width.%]="wizardState().completionPercentage">
                </div>
            </div>

            <!-- Wizard Navigation (Previous/Next) -->
            <div class="flex items-center justify-between p-3 border-b border-white/10 bg-white/5">
                <button 
                    (click)="previousStep()"
                    [disabled]="currentStepIndex() === 0"
                    class="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    {{ 'COMMON.Previous' | translate }}
                </button>
                
                <div class="flex items-center gap-2">
                    @for (dot of wizardSteps; track dot.id; let i = $index) {
                        <button 
                            (click)="goToStep(i)"
                            class="w-2 h-2 rounded-full transition-all"
                            [class.bg-purple-500]="currentStepIndex() === i"
                            [class.bg-white/20]="currentStepIndex() !== i"
                            [class.w-3]="currentStepIndex() === i">
                        </button>
                    }
                </div>

                <button 
                    (click)="nextStep()"
                    [disabled]="!canProceed()"
                    class="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2">
                    {{ 'COMMON.Next' | translate }}
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                    </svg>
                </button>
            </div>

            <!-- Main Content - Split Screen -->
            <div class="flex-1 overflow-hidden flex flex-col lg:flex-row">
                
                <!-- LEFT PANEL: Editor Steps -->
                <div class="w-full lg:w-[450px] h-full overflow-y-auto custom-scrollbar border-r border-white/10 bg-slate-900/50">
                    <div class="p-4 space-y-4">

                        <!-- Step 1: Layout Selector -->
                        @if (currentStepIndex() === 0) {
                            <app-layout-selector
                                [layouts]="layouts()"
                                [selectedLayout]="selectedLayout()"
                                (layoutSelected)="onLayoutSelected($event)">
                            </app-layout-selector>
                        }

                        <!-- Step 2: Theme Customizer -->
                        @if (currentStepIndex() === 1) {
                            <app-theme-customizer
                                [currentTheme]="currentTheme()"
                                (themeChanged)="onThemeChanged($event)">
                            </app-theme-customizer>
                        }

                        <!-- Step 3: Section Manager -->
                        @if (currentStepIndex() === 2 && showSectionManager()) {
                            <app-section-manager
                                [sections]="sections()"
                                [selectedSectionIds]="selectedSectionIds()"
                                (sectionsUpdated)="onSectionsUpdated($event)">
                            </app-section-manager>
                        }

                        <!-- Step 4: Content Editor -->
                        @if (currentStepIndex() === 3 || (currentStepIndex() === 2 && !showSectionManager())) {
                            <app-content-editor
                                [sections]="sections()"
                                [contentData]="contentData()"
                                [hasAiAccess]="hasAiAccess()"
                                [isAiLoading]="isAiLoading()"
                                [availablePhotos]="propertyPhotos()"
                                (contentUpdated)="onContentUpdated($event)"
                                (generateAI)="generateAIRequested.emit()">
                            </app-content-editor>
                        }
                    </div>
                </div>

                <!-- RIGHT PANEL: Preview -->
                <div class="flex-1 bg-slate-800 overflow-hidden" [class.hidden]="isFullscreenPreview()">
                    <app-preview-panel
                        [previewHtml]="previewHtml()"
                        [theme]="currentTheme()"
                        [layout]="selectedLayout()"
                        [previewModeInput]="previewMode()"
                        [forceMobileFrame]="forceMobileFrame()"
                        (fullscreenChanged)="onFullscreenChanged($event)">
                    </app-preview-panel>
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
    previewHtml = signal<string>('');
    isFullscreenPreview = signal(false);

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
                this.markStepCompleted('layout');
            }
        });

        // Initialize theme from input or defaults
        effect(() => {
            const inputTheme = this.selectedThemeInput();
            if (inputTheme) {
                this.currentTheme.set(inputTheme);
                this.markStepCompleted('theme');
            } else {
                const defaults = this.themeDefaults();
                if (defaults) {
                    this.currentTheme.set({ ...defaults });
                }
            }
        });

        // Initialize content
        effect(() => {
            const content = this.contentData();
            if (content) {
                this.currentContent.set({ ...content });
            }
        });

        // Initialize sections
        effect(() => {
            const sectionList = this.sections();
            if (sectionList && sectionList.length > 0) {
                // Select all non-required sections by default
                const selected = sectionList
                    .filter(s => s.required || s.category !== 'settings')
                    .map(s => s.id);
                this.selectedSectionIds.set(selected);
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
        this.markStepCompleted('layout');
    }

    onThemeChanged(theme: EditorTheme) {
        this.currentTheme.set(theme);
        this.themeChanged.emit(theme);
        this.markStepCompleted('theme');
    }

    onSectionsUpdated(sectionIds: string[]) {
        this.selectedSectionIds.set(sectionIds);
        this.sectionsUpdated.emit(sectionIds);
        this.markStepCompleted('sections');
    }

    onContentUpdated(content: Record<string, any>) {
        this.currentContent.set(content);
        
        // Extract photos from content for the photo picker
        const photos = content['photos'] || content['photo-gallery']?.['photos'] || [];
        if (photos.length > 0) {
            this.propertyPhotos.set(photos);
        }
        
        this.contentUpdated.emit(content);
        this.markStepCompleted('content');
    }

    onFullscreenChanged(isFullscreen: boolean) {
        this.isFullscreenPreview.set(isFullscreen);
    }

    goToStep(index: number) {
        if (index >= 0 && index < this.wizardSteps.length) {
            this.currentStepIndex.set(index);
        }
    }

    nextStep() {
        if (this.currentStepIndex() < this.wizardSteps.length - 1) {
            this.currentStepIndex.update(i => i + 1);
        }
    }

    previousStep() {
        if (this.currentStepIndex() > 0) {
            this.currentStepIndex.update(i => i - 1);
        }
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
