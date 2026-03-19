import { Component, computed, inject, input, signal, effect, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookletContentConfigComponent } from './booklet-content-config.component';
import { WelcomeBookletPreviewComponent } from '../../../views/welcome-booklet/components/welcome-booklet-preview.component';
import { WelcomeBookletListingComponent } from '../../../views/welcome-booklet/components/welcome-booklet-listing.component';
import { HostRepository } from '../../../../services/host-repository.service';
import { SessionStore } from '../../../../state/session.store';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { TranslationService } from '../../../../services/translation.service';
import { WelcomeBookletService } from '../../../views/welcome-booklet/welcome-booklet.service';
import { GeminiService } from '../../../../services/gemini.service';

@Component({
    selector: 'app-booklet-tool',
    standalone: true,
    imports: [CommonModule, TranslatePipe, FormsModule, BookletContentConfigComponent, WelcomeBookletPreviewComponent, WelcomeBookletListingComponent],
    templateUrl: './booklet-tool.component.html',
    styles: [`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.3); }
    `]
})
export class BookletToolComponent {
    propertyName = input.required<string>();
    previewType = input<'booklet' | 'listing'>('booklet');
    close = output<void>();

    bookletService = inject(WelcomeBookletService); // Make public for template access
    private geminiService = inject(GeminiService);
    private repository = inject(HostRepository);

    // Design State (Mirrors MicrositeConfig in service)
    config = this.bookletService.micrositeConfig;

    // AI State
    isAiDesigning = signal(false);
    aiMessage = signal<string | null>(null);

    // Computed Options
    themes = [
        { id: 'modern', label: 'BOOKLET.theme_modern' },
        { id: 'cozy', label: 'BOOKLET.theme_cozy' },
        { id: 'luxury', label: 'BOOKLET.theme_luxury' }
    ];

    colorPresets = [
        '#3b82f6', // Blue
        '#ef4444', // Red
        '#10b981', // Emerald
        '#f59e0b', // Amber
        '#8b5cf6', // Violet
        '#ec4899', // Pink
        '#64748b', // Slate
        '#000000', // Black
    ];

    buttonStyles = [
        { id: 'rounded', label: 'BOOKLET.button_rounded' },
        { id: 'sharp', label: 'BOOKLET.button_sharp' },
        { id: 'pill', label: 'BOOKLET.button_pill' }
    ];

    fonts = [
        { id: 'inter', label: 'BOOKLET.font_inter' },
        { id: 'serif', label: 'BOOKLET.font_serif' },
        { id: 'mono', label: 'BOOKLET.font_mono' }
    ];

    iconStyles = [
        { id: 'emoji', label: 'BOOKLET.icon_emoji' },
        { id: 'minimalist', label: 'BOOKLET.icon_minimalist' },
        { id: 'drawn', label: 'BOOKLET.icon_drawn' }
    ];

    // Initialize service
    constructor() {
        effect(() => {
            const prop = this.propertyName();
            if (prop && this.bookletService.propertyName() !== prop) {
                this.bookletService.propertyName.set(prop);
            }
        });
    }

    updateConfig(key: string, value: any) {
        this.config.update(c => ({ ...c, [key]: value }));
    }

    async generateDesignWithAI() {
        this.isAiDesigning.set(true);
        this.aiMessage.set(null);
        try {
            const propName = this.propertyName();
            const prop = await this.repository.getPropertyByName(propName);
            const context = {
                name: propName,
                description: prop?.listing_description || '',
                address: prop?.address || '',
                type: 'Vacation Rental',
                amenities: prop?.property_equipments ? prop.property_equipments.map((e: any) => e.name) : []
            };

            const aiConfig = await this.geminiService.generateMicrositeDesign(context);

            if (aiConfig) {
                this.config.update(c => ({
                    ...c,
                    ...aiConfig
                }));
                this.aiMessage.set("BOOKLET.ai_design_success");
                setTimeout(() => this.aiMessage.set(null), 3000);
            }
        } catch (e) {
            console.error("AI Design Error:", e);
            this.aiMessage.set("BOOKLET.ai_error");
        } finally {
            this.isAiDesigning.set(false);
        }
    }

    save() {
        this.bookletService.save();
    }
}
