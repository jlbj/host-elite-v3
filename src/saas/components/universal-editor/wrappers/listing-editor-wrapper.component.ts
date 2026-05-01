import { Component, inject, input, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UniversalEditorComponent } from '../../../components/universal-editor/universal-editor.component';
import { PropertyWebsiteBuilderComponent } from '../../../components/property-website-builder/property-website-builder.component';
import { LISTING_EDITOR_CONFIG } from '../../../components/universal-editor/configs/listing-config';
import { EditorSaveData } from '../../../components/universal-editor/universal-editor.component';
import { HostRepository } from '../../../../services/host-repository.service';
import { TranslationService } from '../../../../services/translation.service';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { WelcomeBookletService } from '../../../views/welcome-booklet/welcome-booklet.service';

@Component({
    selector: 'app-listing-editor-wrapper',
    standalone: true,
    imports: [CommonModule, TranslatePipe, UniversalEditorComponent, PropertyWebsiteBuilderComponent],
    template: `
        <div class="h-full flex flex-col">
            <!-- Toggle Bar -->
            <div class="flex items-center justify-between px-6 py-3 border-b border-white/10 bg-white/5">
                <div class="flex items-center gap-3">
                    <span class="text-sm text-slate-400">Éditeur :</span>
                    <button 
                        (click)="setEditorType('universal')"
                        [class.bg-purple-600]="editorType() === 'universal'"
                        [class.bg-white/10]="editorType() !== 'universal'"
                        class="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2">
                        <span>🎨</span>
                        Universal
                    </button>
                    <button 
                        (click)="setEditorType('website')"
                        [class.bg-purple-600]="editorType() === 'website'"
                        [class.bg-white/10]="editorType() !== 'website'"
                        class="px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2">
                        <span>🌐</span>
                        Website Builder
                    </button>
                </div>
                
                <div class="flex items-center gap-2 text-xs text-slate-400">
                    <span class="px-2 py-1 rounded bg-white/5">
                        {{ editorType() === 'universal' ? 'Wizard avec étapes' : 'Drag & Drop WYSIWYG' }}
                    </span>
                </div>
            </div>
            
            <!-- Editor Content -->
            <div class="flex-1 overflow-hidden">
                @if (editorType() === 'universal') {
                    <app-universal-editor
                        [editorType]="'listing'"
                        [layouts]="LISTING_EDITOR_CONFIG.layouts"
                        [sections]="LISTING_EDITOR_CONFIG.sections"
                        [themeDefaults]="LISTING_EDITOR_CONFIG.themeDefaults"
                        [contentData]="contentData()"
                        [propertyName]="propertyName()"
                        [selectedLayoutInput]="selectedLayout()"
                        [selectedThemeInput]="currentTheme()"
                        [previewMode]="LISTING_EDITOR_CONFIG.previewMode"
                        [showSectionManager]="LISTING_EDITOR_CONFIG.showSectionManager"
                        [showAiButton]="true"
                        [hasAiAccess]="hasAiAccess()"
                        [configTitle]="LISTING_EDITOR_CONFIG.title"
                        [configIcon]="LISTING_EDITOR_CONFIG.icon"
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
                } @else {
                    <app-property-website-builder
                        [propertyName]="propertyName()"
                        (close)="close.emit()">
                    </app-property-website-builder>
                }
            </div>
        </div>
    `
})
export class ListingEditorWrapperComponent {
    propertyName = input.required<string>();
    close = output<void>();

    private repository = inject(HostRepository);
    private translationService = inject(TranslationService);
    private bookletService = inject(WelcomeBookletService);

    readonly LISTING_EDITOR_CONFIG = LISTING_EDITOR_CONFIG;
    
    contentData = signal<Record<string, any>>({});
    hasAiAccess = signal(true); // TODO: Check actual plan
    selectedLayout = signal<any>(null);
    currentTheme = signal<any>(null);
    saveMessage = signal<string | null>(null);
    isSaving = signal(false);
    propertyEquipments = signal<string[]>([]);
    editorType = signal<'universal' | 'website'>('universal');

    constructor() {
        // Load property data when propertyName changes
        effect(() => {
            const name = this.propertyName();
            if (name) {
                this.loadPropertyData(name);
            }
        });

        // Sync layout/theme/photos to WelcomeBookletService for listing preview
        effect(() => {
            const layout = this.selectedLayout();
            if (layout) {
                this.bookletService.listingEditorLayout.set(layout);
            }
        });

        effect(() => {
            const theme = this.currentTheme();
            if (theme) {
                this.bookletService.listingEditorTheme.set(theme);
            }
        });

        effect(() => {
            const content = this.contentData();
            const photos = content['photo-gallery']?.['photos'] || content['photos'] || [];
            this.bookletService.propertyPhotos.set(photos);
        });
    }

    async loadPropertyData(propertyName: string) {
        try {
            const prop = await this.repository.getPropertyByName(propertyName);
            if (prop) {
                // Load all available equipments for the amenities multi-select
                if (prop.property_equipments) {
                    this.propertyEquipments.set(prop.property_equipments.map((e: any) => e.name));
                }
                
                // Structure content according to section format
                this.contentData.set({
                    'title': {
                        'title': prop.listing_title || prop.name || 'Beautiful Property'
                    },
                    'description': {
                        'description': prop.listing_description || 'Welcome to our wonderful property. Enjoy your stay!'
                    },
                    'propertyDetails': {
                        'property_type': prop.property_type || 'Entire Home',
                        'bedrooms': prop.bedrooms?.toString() || '',
                        'bathrooms': prop.bathrooms?.toString() || '',
                        'max_guests': prop.max_guests?.toString() || '',
                    },
                    'cover-image': {
                        'coverImageUrl': prop.cover_image_url || ''
                    },
                    'photo-gallery': {
                        'photos': prop.property_photos?.map((p: any) => ({
                            url: p.url,
                            category: p.category || 'General'
                        })) || []
                    },
                    'amenities': {
                        'amenities': prop.amenities || []
                    }
                });

                // Load saved layout/theme if exists
                if (prop.marketing?.listingLayout) {
                    try {
                        const layout = typeof prop.marketing.listingLayout === 'string'
                            ? JSON.parse(prop.marketing.listingLayout)
                            : prop.marketing.listingLayout;
                        this.selectedLayout.set(layout);
                    } catch (e) {
                        console.error('Error parsing layout:', e);
                    }
                } else {
                    // Set default layout
                    this.selectedLayout.set(LISTING_EDITOR_CONFIG.layouts[0]);
                }
                
                if (prop.marketing?.listingTheme) {
                    try {
                        const theme = typeof prop.marketing.listingTheme === 'string'
                            ? JSON.parse(prop.marketing.listingTheme)
                            : prop.marketing.listingTheme;
                        this.currentTheme.set(theme);
                    } catch (e) {
                        console.error('Error parsing theme:', e);
                    }
                } else {
                    // Set default theme
                    this.currentTheme.set(LISTING_EDITOR_CONFIG.themeDefaults);
                }
            } else {
                // Initialize with defaults even if no property found
                this.initializeDefaults();
            }
        } catch (e) {
            console.error('Error loading property:', e);
            this.initializeDefaults();
        }
    }

    initializeDefaults() {
        // Set default layout and theme
        this.selectedLayout.set(LISTING_EDITOR_CONFIG.layouts[0]);
        this.currentTheme.set(LISTING_EDITOR_CONFIG.themeDefaults);
        
        // Set default content
        this.contentData.set({
            'title': {
                'title': 'Your Property Name'
            },
            'description': {
                'description': 'Welcome to our property. Start editing to create your perfect listing!'
            },
            'propertyDetails': {
                'property_type': 'Entire Home',
                'bedrooms': '2',
                'bathrooms': '1',
                'max_guests': '4',
            },
            'cover-image': {
                'coverImageUrl': ''
            },
            'photo-gallery': {
                'photos': []
            },
            'amenities': {
                'amenities': []
            }
        });
    }

    onLayoutSelected(layout: any) {
        this.selectedLayout.set(layout);
    }

    onThemeChanged(theme: any) {
        this.currentTheme.set(theme);
    }

    onSectionsUpdated(sections: string[]) {
        console.log('Sections updated:', sections);
        // Update content structure if needed
    }

    onContentUpdated(content: Record<string, any>) {
        this.contentData.set(content);
    }

    setEditorType(type: 'universal' | 'website') {
        this.editorType.set(type);
        console.log('[ListingEditorWrapper] Switched to', type, 'editor');
    }

    async save(data: EditorSaveData) {
        this.isSaving.set(true);
        try {
            const prop = await this.repository.getPropertyByName(this.propertyName());
            if (!prop) return;

            const title = typeof data.content['title'] === 'object' 
                ? data.content['title']?.['title'] 
                : data.content['title'];
            
            const description = typeof data.content['description'] === 'object'
                ? data.content['description']?.['description']
                : data.content['description'];

            const coverImageUrl = typeof data.content['cover-image'] === 'object'
                ? data.content['cover-image']?.['coverImageUrl']
                : data.content['cover-image'];

            await this.repository.updatePropertyData(prop.id, {
                listing_title: title || prop.listing_title,
                listing_description: description || prop.listing_description,
                cover_image_url: coverImageUrl || prop.cover_image_url,
                marketing: {
                    title: title,
                    description: description,
                    coverImageUrl: coverImageUrl,
                    listingLayout: JSON.stringify(data.layout),
                    listingTheme: JSON.stringify(data.theme)
                }
            });

            this.saveMessage.set('Listing saved successfully!');
            setTimeout(() => this.saveMessage.set(null), 3000);

        } catch (e) {
            console.error('Error saving:', e);
            this.saveMessage.set(this.translationService.translate('COMMON.Error'));
            setTimeout(() => this.saveMessage.set(null), 3000);
        } finally {
            this.isSaving.set(false);
        }
    }

    async generateWithAI() {
        try {
            const prop = await this.repository.getPropertyByName(this.propertyName());
            if (!prop) return;

            const prompt = `
You are an expert copywriter specializing in high-converting vacation rental listings.

PROPERTY DETAILS:
- Name: ${prop.name}
- Location: ${prop.address || prop.city || prop.country || 'Not specified'}
- Type: ${prop.property_type || 'Apartment'}
- Bedrooms: ${prop.bedrooms || 'Studio'}
- Bathrooms: ${prop.bathrooms || '1'}
- Max Guests: ${prop.max_guests || '2'}
- Amenities: ${prop.amenities?.join(', ') || 'Not specified'}

TASK: Write a compelling property listing description (3-4 paragraphs).
TONE: Warm, inviting, professional
FORMAT: Plain text only
`;

            // TODO: Call actual AI service
            console.log('AI Prompt:', prompt);
            
            // Mock AI response for now
            const aiDescription = "Beautiful property with amazing amenities. Perfect for your vacation getaway!";
            
            this.contentData.update(current => ({
                ...current,
                'description': {
                    'description': aiDescription
                }
            }));

            this.saveMessage.set('✨ AI description generated!');
            setTimeout(() => this.saveMessage.set(null), 3000);
        } catch (e) {
            console.error('Error generating AI content:', e);
            this.saveMessage.set('Error generating AI content');
            setTimeout(() => this.saveMessage.set(null), 3000);
        }
    }
}
