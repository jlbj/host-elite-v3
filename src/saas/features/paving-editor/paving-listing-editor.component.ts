import { Component, inject, input, output, signal, OnInit, OnDestroy, effect, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HostRepository } from '../../../services/host-repository.service';
import { SUPABASE_CONFIG } from '../../../supabase.config';

@Component({
    selector: 'app-paving-listing-editor',
    standalone: true,
    imports: [CommonModule],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    template: `
        <div class="h-full flex flex-col">
            @if (!scriptsLoaded()) {
            <div class="flex items-center justify-center h-full bg-slate-900 text-slate-300">
                <div class="text-center">
                    <div class="animate-spin h-8 w-8 border-2 border-[#D4AF37] border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p class="text-sm">Loading editor...</p>
                    @if (loadError()) {
                    <p class="text-xs text-red-400 mt-2">{{ loadError() }}</p>
                    }
                </div>
            </div>
            }
            <div [class.hidden]="!scriptsLoaded()" class="flex-1 overflow-hidden">
                <listing-editor
                    [attr.property-id]="propertyId()"
                    [attr.api-url]="supabaseUrl"
                    [attr.anon-key]="supabaseKey"
                    style="display:block;height:100%;width:100%"
                ></listing-editor>
            </div>
        </div>
    `
})
export class PavingListingEditorComponent implements OnInit, OnDestroy {
    propertyName = input.required<string>();
    close = output<void>();

    private repository = inject(HostRepository);

    supabaseUrl = SUPABASE_CONFIG.url;
    supabaseKey = SUPABASE_CONFIG.key;

    propertyId = signal<string>('demo-property-1');
    scriptsLoaded = signal(false);
    loadError = signal<string | null>(null);

    private listingEditorUrl = '/listing-editor/listing-editor.umd.js?v=' + Date.now();
    private cssUrl = '/listing-editor/listing-editor.css?v=' + Date.now();
    private loaded = false;

    constructor() {
        effect(() => {
            const name = this.propertyName();
            if (name && !this.loaded) {
                this.loadPropertyData(name);
            }
        });
    }

    ngOnInit() {
        if (!this.loaded) {
            this.loadAssets();
        }
    }

    ngOnDestroy() {
        this.loaded = false;
    }

    private async loadPropertyData(propertyName: string) {
        try {
            const prop = await this.repository.getPropertyByName(propertyName);
            if (prop?.id) {
                this.propertyId.set(prop.id);
            }
        } catch (e) {
            console.error('Error loading property data:', e);
        }
    }

    private async loadAssets() {
        if (this.loaded) return;
        this.loaded = true;

        try {
            if (!customElements.get('listing-editor')) {
                await this.loadScript(this.listingEditorUrl);
            }

            const linkEl = document.querySelector(`link[href="${this.cssUrl}"]`);
            if (!linkEl) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = this.cssUrl;
                document.head.appendChild(link);
            }

            this.scriptsLoaded.set(true);
        } catch (e: any) {
            console.error('Failed to load listing editor:', e);
            this.loadError.set(`Failed to load editor: ${e.message || 'Unknown error'}`);
            this.loaded = false;
        }
    }

    private loadScript(src: string): Promise<void> {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
            document.body.appendChild(script);
        });
    }
}
