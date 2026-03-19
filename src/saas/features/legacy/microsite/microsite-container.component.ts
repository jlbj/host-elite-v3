
import { Component, computed, inject, input, signal, effect, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { TranslationService } from '../../../../services/translation.service';
import { HostRepository } from '../../../../services/host-repository.service';
import { GeminiService } from '../../../../services/gemini.service';
import { SessionStore } from '../../../../state/session.store';
import { WelcomeBookletService } from '../../../views/welcome-booklet/welcome-booklet.service';
import { MicrositeRendererComponent } from '../../../components/microsite-renderer/microsite-renderer.component';
import { MicrositeConfig, SectionDef, BuilderPhoto, resolveMicrositeConfig } from '../../../views/welcome-booklet/booklet-definitions';
import { NgxEditorModule } from 'ngx-editor';
import { Editor } from 'ngx-editor';
import { DOCUMENT } from '@angular/common';


@Component({
    selector: 'app-microsite-container',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslatePipe, MicrositeRendererComponent, NgxEditorModule],
    templateUrl: './microsite-container.component.html',
    styles: [`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.3); }
        /* Toggle Switch */
        .toggle-checkbox:checked { right: 0; border-color: #68D391; }
        .toggle-checkbox:checked + .toggle-label { background-color: #68D391; }
        .toggle-checkbox { right: 0; transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
    `]
})
export class MicrositeContainerComponent {
    // Inputs
    propertyName = input.required<string>();

    // Services
    private repository = inject(HostRepository);
    private geminiService = inject(GeminiService);
    private store = inject(SessionStore);
    private translationService = inject(TranslationService);
    // We still access BookletService for shared content (like Guide restaurants) which are part of the Booklet Form
    private bookletService = inject(WelcomeBookletService);

    @Output() close = new EventEmitter<void>();

    // Local State
    saveMessage = signal<string | null>(null);
    isAiDesigning = signal(false);
    currentPropertyId = signal<string | null>(null);
    propertyDetails = signal<any>(null);

    // User Context
    userEmail = computed(() => this.store.userProfile()?.email || '');
    hasAiAccess = computed(() => {
        // Assume passed from parent or checked via store. 
        // For now, let's look at the plan in the store if available, or just default true for now as logic was in parent.
        // Replicating parent logic:
        const plan = this.store.userProfile()?.plan || 'Freemium';
        // Note: The parent used `userPlan()` input which might be different from store (e.g. override). 
        // Let's rely on store for self-containment.
        return ['Silver', 'Gold'].includes(plan);
    });

    // Microsite State
    micrositeConfig = signal<MicrositeConfig>({
        template: 'modern',
        primaryColor: '#3b82f6',
        showDescription: true,
        showContact: true,
        visibleSections: ['gallery', 'amenities', 'guide'],
        hiddenPhotoUrls: [],
        headerPhotoUrl: null,
        heroLayout: 'full',
        headline: 'Bienvenue chez vous'
    });
    micrositePhotos = signal<BuilderPhoto[]>([]);

    // Content state (Marketing Text & Booklet Data for Renderer)
    marketingText = signal<string>('');
    bookletContent = signal<any>(null);

    // ngx-editor instances
    marketingEditor: Editor;
    guideEditor: Editor;

    // Computed
    visiblePhotos = computed(() => this.micrositePhotos().filter(p => p.visible));

    readonly availableSections: SectionDef[] = [
        { id: 'gallery', label: 'MICROSITE.SectionGallery' },
        { id: 'amenities', label: 'MICROSITE.SectionAmenities' },
        { id: 'reviews', label: 'MICROSITE.SectionReviews' },
        { id: 'rules', label: 'MICROSITE.SectionRules' },
        { id: 'guide', label: 'MICROSITE.SectionGuide' },
    ];

    orderedSections = computed(() => {
        const order = this.micrositeConfig().visibleSections;
        if (!order) return [];
        return order
            .map(id => this.availableSections.find(s => s.id === id))
            .filter((s): s is SectionDef => !!s);
    });

    readonly themeOptions = [
        { id: 'modern', label: 'MICROSITE.ThemeModern' },
        { id: 'cozy', label: 'MICROSITE.ThemeCozy' },
        { id: 'luxury', label: 'MICROSITE.ThemeLuxury' },
    ];

    readonly toolbarConfig = [
        ['bold', 'italic', 'underline', 'strike'],
        ['blockquote'],
        ['bullet_list', 'ordered_list'],
        [{ heading: ['h1', 'h2', 'h3', 'h4'] }],
        ['link'],
        ['format_clear'],
    ];

    constructor() {
        this.marketingEditor = new Editor();
        this.guideEditor = new Editor();
        effect(() => {
            const prop = this.propertyName();
            if (prop) {
                this.loadPropertyData(prop);
            }
        });
    }

    ngOnDestroy(): void {
        this.marketingEditor.destroy();
        this.guideEditor.destroy();
    }

    async loadPropertyData(propName: string) {
        try {
            const prop = await this.repository.getPropertyByName(propName);
            if (prop) {
                this.currentPropertyId.set(prop.id);
                this.propertyDetails.set(prop);
                this.marketingText.set(prop.listing_description || '');
            }

            // Load Booklet Data (which contains Microsite Config)
            const bookletData = await this.repository.getBooklet(propName);

            // Setup content for renderer
            const defaultContent = {
                guideGastro: { recommandationRestaurants: '' },
                guideActivites: { guideActivites: '' },
                transports: { taxisLocaux: '' },
                depart: { heureLimiteCheckout: '11:00' },
                regles: { politiqueFetes: '', politiqueNonFumeur: '', heuresSilence: '' }
            };
            const mergedBooklet = { ...defaultContent, ...bookletData };
            // Ensure sub-objects
            if (!mergedBooklet.guideGastro) mergedBooklet.guideGastro = {};
            if (!mergedBooklet.guideActivites) mergedBooklet.guideActivites = {};
            if (!mergedBooklet.transports) mergedBooklet.transports = {};
            if (!mergedBooklet.depart) mergedBooklet.depart = {};
            if (!mergedBooklet.regles) mergedBooklet.regles = {};

            this.bookletContent.set(mergedBooklet);

            // Parse Config
            let savedConfig: Partial<MicrositeConfig> | null = null;
            if (bookletData && bookletData.microsite_config) {
                try {
                    savedConfig = typeof bookletData.microsite_config === 'string'
                        ? JSON.parse(bookletData.microsite_config)
                        : bookletData.microsite_config;
                } catch (e) {
                    console.error("Error parsing microsite config", e);
                }
            }

            const resolved = resolveMicrositeConfig(mergedBooklet, savedConfig as any);

            // Override defaults with property-specific data if needed
            if (!resolved.headerPhotoUrl && prop?.property_photos?.[0]) {
                resolved.headerPhotoUrl = prop.property_photos[0].url;
            }

            // Sync Photos
            if (prop?.property_photos) {
                const hidden = resolved.hiddenPhotoUrls || [];
                const photosWithVisibility = prop.property_photos.map((p: any) => ({
                    ...p,
                    visible: !hidden.includes(p.url)
                }));
                this.micrositePhotos.set(photosWithVisibility);
                // Set default header if not set
                if (!resolved.headerPhotoUrl && photosWithVisibility.length > 0) {
                    resolved.headerPhotoUrl = photosWithVisibility[0].url;
                }
            }

            this.micrositeConfig.set(resolved);

        } catch (e) {
            console.error("Error loading microsite data:", e);
        }
    }

    emitClose() {
        // Dispatch custom event or rely on parent
        // Since we are moving logic out of parent, we might need an Output()
        // But the parent controls the switch. 
        // We can add an output later. For now, let's assume the template will bind to a parent method or we add an output.
    }

    // --- Actions ---

    updateConfig(key: keyof MicrositeConfig, value: any) {
        this.micrositeConfig.update(c => ({ ...c, [key]: value }));
    }

    updateBookletText(section: string, field: string, value: any) {
        this.bookletContent.update(current => {
            const updated = { ...current };
            if (!updated[section]) updated[section] = {};
            updated[section][field] = value;
            return updated;
        });
    }

    toggleContactForm(event: Event) {
        const isChecked = (event.target as HTMLInputElement).checked;
        this.micrositeConfig.update(c => ({ ...c, showContact: isChecked }));
    }

    toggleSectionVisibility(sectionId: string, event: Event) {
        const isChecked = (event.target as HTMLInputElement).checked;
        this.micrositeConfig.update(c => {
            const currentSections = c.visibleSections || [];
            if (isChecked) {
                if (!currentSections.includes(sectionId)) {
                    return { ...c, visibleSections: [...currentSections, sectionId] };
                }
            } else {
                return { ...c, visibleSections: currentSections.filter(id => id !== sectionId) };
            }
            return c;
        });
    }

    moveSection(index: number, direction: 'up' | 'down') {
        this.micrositeConfig.update(c => {
            const sections = [...c.visibleSections];
            if (direction === 'up' && index > 0) {
                [sections[index], sections[index - 1]] = [sections[index - 1], sections[index]];
            } else if (direction === 'down' && index < sections.length - 1) {
                [sections[index], sections[index + 1]] = [sections[index + 1], sections[index]];
            }
            return { ...c, visibleSections: sections };
        });
    }

    toggleDescriptionVisibility(event: Event) {
        const isChecked = (event.target as HTMLInputElement).checked;
        this.micrositeConfig.update(c => ({ ...c, showDescription: isChecked }));
    }

    togglePhotoVisibility(index: number) {
        this.micrositePhotos.update(photos => {
            const newPhotos = [...photos];
            newPhotos[index] = { ...newPhotos[index], visible: !newPhotos[index].visible };
            return newPhotos;
        });
        const hidden = this.micrositePhotos().filter(p => !p.visible).map(p => p.url);
        this.micrositeConfig.update(c => ({ ...c, hiddenPhotoUrls: hidden }));
    }

    setCoverPhoto(url: string) {
        this.updateConfig('headerPhotoUrl', url);
    }

    async generateMicrositeWithAI() {
        if (!this.hasAiAccess()) return;
        if (!this.propertyName()) return;

        this.isAiDesigning.set(true);
        try {
            const propName = this.propertyName();
            const bookletData = this.bookletContent();
            const propData = this.propertyDetails();

            const context = {
                name: propName,
                description: propData?.listing_description,
                address: propData?.address,
                type: 'Vacation Rental',
                amenities: propData?.property_equipments ? propData.property_equipments.map((e: any) => e.name) : [],
                bookletSummary: bookletData ? JSON.stringify(bookletData).substring(0, 1000) : ''
            };

            const aiConfig = await this.geminiService.generateMicrositeDesign(context);

            if (aiConfig) {
                this.micrositeConfig.update(c => ({
                    ...c,
                    ...aiConfig,
                    visibleSections: (aiConfig.visibleSections || []).filter((s: string) =>
                        this.availableSections.some(avail => avail.id === s)
                    )
                }));
                this.saveMessage.set(this.translationService.translate('MICROSITE.DesignGenerated'));
                setTimeout(() => this.saveMessage.set(null), 3000);
            }
        } catch (e) {
            console.error("AI Design Error:", e);
            alert(this.translationService.translate('COMMON.Error'));
        } finally {
            this.isAiDesigning.set(false);
        }
    }

    async saveMicrosite() {
        if (!this.propertyName()) return;

        try {
            this.saveMessage.set(null);

            const hidden = this.micrositePhotos().filter(p => !p.visible).map(p => p.url);
            const configToSave = { ...this.micrositeConfig(), hiddenPhotoUrls: hidden };

            // Save Booklet (Config + Content)
            const contentToSave = this.bookletContent();
            // We need to merge config and content
            await this.repository.saveBooklet(this.propertyName(), {
                ...contentToSave,
                microsite_config: JSON.stringify(configToSave)
            });

            // Save Photo Visibility (persisted in photos table order/metadata if needed, 
            // but here we primarily care about config. The AngleView also saved property photos order? 
            // Yes: await this.repository.savePropertyPhotos(...)
            if (this.currentPropertyId()) {
                await this.repository.savePropertyPhotos(this.currentPropertyId()!, this.micrositePhotos());
            }

            this.saveMessage.set(this.translationService.translate('MICROSITE.Published'));
            setTimeout(() => this.saveMessage.set(null), 3000);
        } catch (e) {
            console.error(e);
            alert(this.translationService.translate('COMMON.Error'));
        }
    }
}
