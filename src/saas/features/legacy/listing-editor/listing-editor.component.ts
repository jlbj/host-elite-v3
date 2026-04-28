import { Component, computed, inject, input, signal, effect, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { WelcomeBookletListingComponent } from '../../../views/welcome-booklet/components/welcome-booklet-listing.component';
import { HostRepository } from '../../../../services/host-repository.service';
import { SessionStore } from '../../../../state/session.store';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { TranslationService } from '../../../../services/translation.service';
import { WelcomeBookletService } from '../../../views/welcome-booklet/welcome-booklet.service';
import { GeminiService } from '../../../../services/gemini.service';

interface PropertyPhoto {
    url: string;
    category: string;
    visible: boolean;
    order?: number;
}

interface ListingStyle {
    backgroundColor: string;
    backgroundImage: string;
    fontFamily: string;
    fontSize: string;
    textColor: string;
    headerStyle: string;
}

@Component({
    selector: 'app-listing-editor',
    standalone: true,
    imports: [CommonModule, TranslatePipe, FormsModule, WelcomeBookletListingComponent],
    templateUrl: './listing-editor.component.html',
    styles: [`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.3); }
        .drag-handle { cursor: grab; }
        .drag-handle:active { cursor: grabbing; }
    `]
})
export class ListingEditorComponent {
    propertyName = input.required<string>();
    close = output<void>();

    bookletService = inject(WelcomeBookletService);
    private geminiService = inject(GeminiService);
    private repository = inject(HostRepository);
    private store = inject(SessionStore);
    private translationService = inject(TranslationService);

    isSaving = signal(false);
    saveMessage = signal<string | null>(null);
    showPhotoPicker = signal(false);

    // Form fields
    listingTitle = '';
    listingDescription = '';
    coverImageUrl = '';
    existingPropertyId = signal<string | null>(null);
    
    // Property photos
    propertyPhotos = signal<PropertyPhoto[]>([]);
    selectedCoverPhoto = signal<string>('');
    
    // WYSIWYG Style options
    style = signal<ListingStyle>({
        backgroundColor: '#ffffff',
        backgroundImage: '',
        fontFamily: 'system-ui',
        fontSize: '16px',
        textColor: '#1f2937',
        headerStyle: 'modern'
    });

    // Font options
    fontFamilies = [
        { value: 'system-ui', label: 'System Default' },
        { value: 'Georgia, serif', label: 'Georgia' },
        { value: 'Arial, sans-serif', label: 'Arial' },
        { value: 'Helvetica, Arial, sans-serif', label: 'Helvetica' },
        { value: 'Times New Roman, serif', label: 'Times New Roman' },
        { value: 'Verdana, sans-serif', label: 'Verdana' },
        { value: 'Trebuchet MS, sans-serif', label: 'Trebuchet' },
        { value: 'Courier New, monospace', label: 'Courier' },
    ];

    fontSizes = ['14px', '16px', '18px', '20px', '22px', '24px'];
    
    headerStyles = [
        { value: 'modern', label: 'Modern Bold' },
        { value: 'classic', label: 'Classic Serif' },
        { value: 'minimal', label: 'Minimal Clean' },
        { value: 'elegant', label: 'Elegant' },
    ];

    backgroundColors = ['#ffffff', '#f9fafb', '#f3f4f6', '#e5e7eb', '#1f2937', '#0f172a', '#7c3aed', '#059669'];

    constructor() {
        effect(() => {
            const prop = this.propertyName();
            if (prop) {
                this.loadPropertyData(prop);
            }
        });
    }

    async loadPropertyData(propertyName: string) {
        try {
            const prop = await this.repository.getPropertyByName(propertyName);
            if (prop) {
                this.existingPropertyId.set(prop.id);
                this.listingTitle = prop.listing_title || prop.name || '';
                this.coverImageUrl = prop.cover_image_url || '';
                this.selectedCoverPhoto.set(this.coverImageUrl);
                
                // Load multi-language descriptions (from localStorage or DB)
                const currentLang = this.translationService.currentLang() || 'en';
                let description = prop.listing_description || '';
                
                // First try localStorage
                const storedDesc = localStorage.getItem(`listing_descriptions_${prop.id}`);
                if (storedDesc) {
                    try {
                        const allDesc = JSON.parse(storedDesc);
                        description = allDesc[currentLang] || allDesc['en'] || description;
                        // Save to localStorage for future use
                        localStorage.setItem(`listing_descriptions_${prop.id}`, JSON.stringify(allDesc));
                    } catch {}
                }
                // Then try DB stored descriptions_all
                else if (prop.marketing?.descriptions_all) {
                    try {
                        const allDesc = typeof prop.marketing.descriptions_all === 'string' 
                            ? JSON.parse(prop.marketing.descriptions_all) 
                            : prop.marketing.descriptions_all;
                        description = allDesc[currentLang] || allDesc['en'] || description;
                        localStorage.setItem(`listing_descriptions_${prop.id}`, JSON.stringify(allDesc));
                    } catch {}
                }
                
                this.listingDescription = description;
                
                // Update service for preview
                this.bookletService.listingEditorTitle.set(this.listingTitle);
                
                // Load photos
                if (prop.property_photos && prop.property_photos.length > 0) {
                    const photos = prop.property_photos.map((p: any, index: number) => ({
                        url: p.url,
                        category: p.category || 'general',
                        visible: true,
                        order: index
                    }));
                    this.propertyPhotos.set(photos);
                }
            }
        } catch (e) {
            console.error('Error loading property:', e);
        }
    }

    onTitleChange(value: string) {
        this.listingTitle = value;
        this.bookletService.listingEditorTitle.set(value);
    }

    onDescriptionChange(value: string) {
        this.listingDescription = value;
        this.bookletService.editorForm.get('welcome.welcomeMessage')?.setValue(value);
    }

    onCoverImageChange(value: string) {
        this.coverImageUrl = value;
        this.bookletService.editorForm.get('coverImageUrl')?.setValue(value);
    }

    selectCoverPhoto(url: string) {
        this.selectedCoverPhoto.set(url);
        this.coverImageUrl = url;
        this.bookletService.editorForm.get('coverImageUrl')?.setValue(url);
    }

    movePhoto(index: number, direction: 'up' | 'down') {
        const photos = [...this.propertyPhotos()];
        if (direction === 'up' && index > 0) {
            [photos[index], photos[index - 1]] = [photos[index - 1], photos[index]];
        } else if (direction === 'down' && index < photos.length - 1) {
            [photos[index], photos[index + 1]] = [photos[index + 1], photos[index]];
        }
        this.propertyPhotos.set(photos);
    }

    updateStyle(key: keyof ListingStyle, value: string) {
        const current = this.style();
        this.style.set({ ...current, [key]: value });
        
        // Apply styles to preview
        this.bookletService.listingEditorStyle.set(this.style());
    }

    async save() {
        if (!this.existingPropertyId()) return;
        
        this.isSaving.set(true);
        try {
            // Get all language descriptions from localStorage
            const propertyId = this.existingPropertyId()!;
            const storedDesc = localStorage.getItem(`listing_descriptions_${propertyId}`);
            let allDescriptions = { en: '', fr: '', es: '' };
            
            if (storedDesc) {
                allDescriptions = JSON.parse(storedDesc);
            }
            
            // Update current language description
            const currentLang = this.translationService.currentLang() || 'en';
            allDescriptions[currentLang] = this.listingDescription;
            
            // Save to DB (use current language as main, store all in additional_data)
            await this.repository.updatePropertyData(propertyId, {
                marketing: {
                    title: this.listingTitle,
                    description: this.listingDescription, // Current language
                    descriptions_all: allDescriptions, // All languages
                    coverImageUrl: this.coverImageUrl
                }
            });

            // Save style preferences
            await this.repository.saveBooklet(this.propertyName(), {
                listing_style: JSON.stringify(this.style())
            });

            this.saveMessage.set(this.translationService.translate('COMMON.Saved'));
            setTimeout(() => this.saveMessage.set(null), 3000);
        } catch (e) {
            console.error('Error saving:', e);
            alert(this.translationService.translate('COMMON.Error'));
        } finally {
            this.isSaving.set(false);
        }
    }

    async generateWithAI() {
        if (!this.existingPropertyId()) return;

        this.isSaving.set(true);
        try {
            const prop = await this.repository.getPropertyByName(this.propertyName());
            if (!prop) return;

            const basePrompt = `
You are an expert copywriter specializing in high-converting vacation rental listings.

PROPERTY DETAILS:
- Name: ${prop.name}
- Location: ${prop.address || prop.city || prop.country || 'Not specified'}
- Type: ${prop.property_type || 'Apartment'}
- Bedrooms: ${prop.bedrooms || 'Studio'}
- Bathrooms: ${prop.bathrooms || '1'}
- Max Guests: ${prop.max_guests || '2'}
- Size: ${prop.size || 'Not specified'} m²
- Amenities: ${prop.amenities?.join(', ') || 'Not specified'}
- Special Features: ${prop.additional_details || 'None'}

TASK: Write a compelling, high-converting property listing description (3-4 paragraphs) that:
1. Creates an emotional hook in the first paragraph
2. Highlights unique features and amenities
3. Describes the location and nearby attractions
4. Ends with a call-to-action for booking

TONE: Warm, inviting, professional, and aspirational
FORMAT: Plain text only, no markdown, no headings
`;

            // Generate in all 3 languages
            const [descEn, descFr, descEs] = await Promise.all([
                this.geminiService.generateText(basePrompt + 'LANGUAGE: English\n\nWrite the description now:'),
                this.geminiService.generateText(basePrompt + 'LANGUAGE: French\n\nWrite the description now:'),
                this.geminiService.generateText(basePrompt + 'LANGUAGE: Spanish\n\nWrite the description now:')
            ]);

            // Store all translations
            const allDescriptions = {
                en: descEn || '',
                fr: descFr || '',
                es: descEs || ''
            };

            // Use current language description
            const currentLang = this.translationService.currentLang() || 'en';
            this.listingDescription = allDescriptions[currentLang] || descEn;
            this.onDescriptionChange(this.listingDescription);

            // Store in localStorage for persistence (will be saved to DB on save)
            localStorage.setItem(`listing_descriptions_${this.existingPropertyId()}`, JSON.stringify(allDescriptions));

            this.saveMessage.set('✨ AI descriptions generated in EN, FR, ES!');
            setTimeout(() => this.saveMessage.set(null), 3000);
        } catch (e: any) {
            console.error('Error generating:', e);
            const message = e?.message?.includes('after multiple attempts') 
                ? 'AI service temporarily unavailable. Please try again in a few moments.'
                : 'Error generating description';
            this.saveMessage.set(message);
            setTimeout(() => this.saveMessage.set(null), 5000);
        } finally {
            this.isSaving.set(false);
        }
    }
}
