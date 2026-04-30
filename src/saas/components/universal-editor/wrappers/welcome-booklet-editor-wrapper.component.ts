import { Component, inject, input, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UniversalEditorComponent } from '../../../components/universal-editor/universal-editor.component';
import { WELCOME_BOOKLET_EDITOR_CONFIG } from '../../../components/universal-editor/configs/welcome-booklet-config';
import { EditorSaveData } from '../../../components/universal-editor/universal-editor.component';
import { WelcomeBookletService } from '../../../views/welcome-booklet/welcome-booklet.service';
import { TranslationService } from '../../../../services/translation.service';
import { TranslatePipe } from '../../../../pipes/translate.pipe';

@Component({
    selector: 'app-welcome-booklet-editor-wrapper',
    standalone: true,
    imports: [CommonModule, TranslatePipe, UniversalEditorComponent],
    template: `
        <app-universal-editor
            [editorType]="'welcome-booklet'"
            [layouts]="WELCOME_BOOKLET_EDITOR_CONFIG.layouts"
            [sections]="WELCOME_BOOKLET_EDITOR_CONFIG.sections"
            [themeDefaults]="WELCOME_BOOKLET_EDITOR_CONFIG.themeDefaults"
            [contentData]="contentData()"
            [propertyName]="propertyName()"
            [selectedLayoutInput]="selectedLayout()"
            [selectedThemeInput]="currentTheme()"
            [previewMode]="WELCOME_BOOKLET_EDITOR_CONFIG.previewMode"
            [forceMobileFrame]="true"
            [showSectionManager]="WELCOME_BOOKLET_EDITOR_CONFIG.showSectionManager"
            [showAiButton]="true"
            [hasAiAccess]="hasAiAccess()"
            [configTitle]="WELCOME_BOOKLET_EDITOR_CONFIG.title"
            [configIcon]="WELCOME_BOOKLET_EDITOR_CONFIG.icon"
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
    `
})
export class WelcomeBookletEditorWrapperComponent {
    propertyName = input.required<string>();
    close = output<void>();

    private bookletService = inject(WelcomeBookletService) as any;
    private translationService = inject(TranslationService);

    readonly WELCOME_BOOKLET_EDITOR_CONFIG = WELCOME_BOOKLET_EDITOR_CONFIG;
    
    contentData = signal<Record<string, any>>({});
    hasAiAccess = signal(true);
    isSaving = signal(false);
    saveMessage = signal<string | null>(null);
    selectedLayout = signal<any>(null);
    currentTheme = signal<any>(null);

    constructor() {
        // Load booklet data when propertyName changes
        effect(() => {
            const name = this.propertyName();
            if (name) {
                this.loadBookletData();
            }
        });
    }

    async loadBookletData() {
        // Load from WelcomeBookletService
        const form = this.bookletService.editorForm;
        if (form && form.value) {
            // Get photos from FormArray and convert to array
            const photosArray = form.get('photos') as any;
            const photos = photosArray && photosArray.value ? photosArray.value : [];
            const propPhotos = this.bookletService.propertyPhotos ? this.bookletService.propertyPhotos() : [];
            
            console.log('[Wrapper] Form photos:', photos.length, 'Property photos:', propPhotos.length);
            
            // Normalize to {url, category} format
            const normalizedPhotos = [...photos, ...propPhotos].map((p: any) => ({
                url: p.url || p,
                category: p.category || 'Property'
            }));
            
            // Remove duplicates by URL
            const uniquePhotos = normalizedPhotos.filter((p: any, i: number, arr: any[]) => 
                arr.findIndex((x: any) => x.url === p.url) === i
            );
            
            this.contentData.set({
                ...form.value,
                photos: uniquePhotos,
                'photo-gallery': {
                    photos: uniquePhotos
                }
            });
        } else {
            // Initialize with defaults
            this.initializeDefaults();
        }
    }

    initializeDefaults() {
        // Set default content for welcome booklet
        this.contentData.set({
            'propertyDetails': {
                'property_type': 'Apartment',
                'rooms': '',
                'bedrooms': '',
                'bathrooms': '',
                'surface_area': '',
                'max_guests': ''
            },
            'welcome': {
                'welcomeMessage': 'Welcome to our property! We\'re delighted to have you as our guest.',
                'hostContact': '',
                'emergencyContact': ''
            },
            'arrival': {
                'checkInTime': '15:00',
                'arrivalInstructions': '',
                'keyRetrieval': ''
            }
        });
    }

    onLayoutSelected(layout: any) {
        this.selectedLayout.set(layout);
        console.log('Layout selected:', layout);
    }

    onThemeChanged(theme: any) {
        this.currentTheme.set(theme);
        console.log('Theme changed:', theme);
    }

    onSectionsUpdated(sections: string[]) {
        console.log('Sections updated:', sections);
    }

    onContentUpdated(content: Record<string, any>) {
        this.contentData.set(content);
    }

    async save(data: EditorSaveData) {
        this.isSaving.set(true);
        try {
            // Save using WelcomeBookletService
            await this.bookletService.saveBooklet();
        } catch (e) {
            console.error('Error saving:', e);
            alert(this.translationService.translate('COMMON.Error'));
        } finally {
            this.isSaving.set(false);
        }
    }

    async generateWithAI() {
        // Use existing AI service from WelcomeBooklet
        await this.bookletService.generateWithAI();
    }
}
