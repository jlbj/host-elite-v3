import { Component, inject, input, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UniversalEditorComponent } from '../../../components/universal-editor/universal-editor.component';
import { MICROSITE_EDITOR_CONFIG } from '../../../components/universal-editor/configs/microsite-config';
import { EditorSaveData } from '../../../components/universal-editor/universal-editor.component';
import { HostRepository } from '../../../../services/host-repository.service';
import { TranslationService } from '../../../../services/translation.service';
import { TranslatePipe } from '../../../../pipes/translate.pipe';

@Component({
    selector: 'app-microsite-editor-wrapper',
    standalone: true,
    imports: [CommonModule, TranslatePipe, UniversalEditorComponent],
    template: `
        <app-universal-editor
            [editorType]="'microsite'"
            [layouts]="MICROSITE_EDITOR_CONFIG.layouts"
            [sections]="MICROSITE_EDITOR_CONFIG.sections"
            [themeDefaults]="MICROSITE_EDITOR_CONFIG.themeDefaults"
            [contentData]="contentData()"
            [propertyName]="propertyName()"
            [selectedLayoutInput]="selectedLayout()"
            [selectedThemeInput]="currentTheme()"
            [previewMode]="MICROSITE_EDITOR_CONFIG.previewMode"
            [showSectionManager]="MICROSITE_EDITOR_CONFIG.showSectionManager"
            [showAiButton]="true"
            [hasAiAccess]="hasAiAccess()"
            [configTitle]="MICROSITE_EDITOR_CONFIG.title"
            [configIcon]="MICROSITE_EDITOR_CONFIG.icon"
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
export class MicrositeEditorWrapperComponent {
    propertyName = input.required<string>();
    close = output<void>();

    private repository = inject(HostRepository);
    private translationService = inject(TranslationService);

    readonly MICROSITE_EDITOR_CONFIG = MICROSITE_EDITOR_CONFIG;
    
    contentData = signal<Record<string, any>>({
        headline: '',
        description: '',
        headerPhotoUrl: '',
        visibleSections: ['gallery', 'amenities', 'guide']
    });

    hasAiAccess = signal(true); // TODO: Check actual plan
    isSaving = signal(false);
    saveMessage = signal<string | null>(null);
    selectedLayout = signal<any>(null);
    currentTheme = signal<any>(null);

    constructor() {
        // Load property data when propertyName changes
        effect(() => {
            const name = this.propertyName();
            if (name) {
                this.loadPropertyData(name);
            }
        });
    }

    async loadPropertyData(propertyName: string) {
        try {
            const prop = await this.repository.getPropertyByName(propertyName);
            if (prop) {
                const bookletData = await this.repository.getBooklet(propertyName);
                
                let micrositeConfig = {
                    headline: '',
                    description: prop.listing_description || '',
                    headerPhotoUrl: prop.property_photos?.[0]?.url || '',
                    visibleSections: ['gallery', 'amenities', 'guide']
                };

                if (bookletData?.microsite_config) {
                    try {
                        const config = typeof bookletData.microsite_config === 'string'
                            ? JSON.parse(bookletData.microsite_config)
                            : bookletData.microsite_config;
                        micrositeConfig = { ...micrositeConfig, ...config };
                    } catch (e) {
                        console.error('Error parsing microsite config:', e);
                    }
                }

                this.contentData.set(micrositeConfig);
            }
        } catch (e) {
            console.error('Error loading property:', e);
        }
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
        this.contentData.update(d => ({ ...d, visibleSections: sections }));
    }

    onContentUpdated(content: Record<string, any>) {
        this.contentData.set(content);
    }

    async save(data: EditorSaveData) {
        this.isSaving.set(true);
        try {
            const configToSave = {
                ...data.theme,
                layout: data.layout.id,
                visibleSections: data.sections,
                headline: data.content['headline'],
                description: data.content['description']
            };

            await this.repository.saveBooklet(this.propertyName(), {
                microsite_config: JSON.stringify(configToSave),
                ...data.content
            });

        } catch (e) {
            console.error('Error saving:', e);
            alert(this.translationService.translate('COMMON.Error'));
        } finally {
            this.isSaving.set(false);
        }
    }

    async generateWithAI() {
        // TODO: Implement AI generation for microsite
        console.log('Generate microsite with AI');
    }
}
