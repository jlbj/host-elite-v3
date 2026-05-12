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
            @if (propertyId() && scriptsLoaded()) {
            <div class="flex-1 overflow-hidden">
                <listing-editor
                    [attr.property-id]="propertyId()"
                    [attr.api-url]="supabaseUrl"
                    [attr.anon-key]="supabaseKey"
                    style="display:block;height:100%;width:100%"
                ></listing-editor>
            </div>
            }
        </div>
    `
})
export class PavingListingEditorComponent implements OnInit, OnDestroy {
    propertyName = input.required<string>();
    close = output<void>();

    private repository = inject(HostRepository);

    supabaseUrl = SUPABASE_CONFIG.url;
    supabaseKey = SUPABASE_CONFIG.key;

    propertyId = signal<string | null>(null);
    scriptsLoaded = signal(false);
    loadError = signal<string | null>(null);

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
        // Wait for property data before loading the editor
    }

    ngOnDestroy() {
        this.loaded = false;
    }

    private get assetBaseUrl(): string {
        // When behind the OpenChamber preview proxy (port 3000), the proxy doesn't
        // reliably serve static assets. Load directly from the Angular dev server.
        const match = window.location.pathname.match(/^\/api\/preview\/proxy\/[a-f0-9]{16,64}/i);
        if (match) {
            return 'http://localhost:4200';
        }
        return '';
    }

    private cacheBust(): string {
        return '?v=' + Date.now();
    }

    private get listingEditorUrl(): string {
        return this.assetBaseUrl + '/listing-editor/listing-editor.umd.js' + this.cacheBust();
    }

    private get cssUrl(): string {
        return this.assetBaseUrl + '/listing-editor/listing-editor.css' + this.cacheBust();
    }

    private async loadPropertyData(propertyName: string) {
        try {
            const prop = await this.repository.getPropertyByName(propertyName);
            if (prop?.id) {
                this.propertyId.set(prop.id);
                await this.loadAssets();
            } else {
                this.loadError.set('Property not found: ' + propertyName);
            }
        } catch (e: any) {
            this.loadError.set('Failed to load property: ' + (e?.message || e));
        }
    }

    private async loadAssets() {
        if (this.loaded) return;
        this.loaded = true;

        try {
            if (!customElements.get('listing-editor')) {
                await this.loadScript(this.listingEditorUrl);
            }

            const cssUrl = this.cssUrl;
            const linkEl = document.querySelector(`link[href="${cssUrl}"]`);
            if (!linkEl) {
                const link = document.createElement('link');
                link.rel = 'stylesheet';
                link.href = cssUrl;
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
