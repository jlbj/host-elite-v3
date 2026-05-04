import { Component, OnInit, OnDestroy, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import grapesjs from 'grapesjs';
import grapesjsPresetWebpage from 'grapesjs-preset-webpage';

@Component({
    selector: 'app-property-website-builder',
    standalone: true,
    imports: [CommonModule, TranslatePipe],
    template: `
        <div class="h-full flex flex-col bg-slate-900">
            <div class="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
                <div class="flex items-center gap-4">
                    <button (click)="close.emit()" class="text-slate-400 hover:text-white transition-colors">
                        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
                        </svg>
                    </button>
                    <h2 class="text-xl font-bold text-white">{{ 'PROPERTY.Builder' | translate }}</h2>
                </div>
                <div class="flex items-center gap-3">
                    <button (click)="save()" [disabled]="isSaving()"
                        class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50">
                        {{ isSaving() ? ('COMMON.Saving' | translate) : ('COMMON.Save' | translate) }}
                    </button>
                    <button (click)="exportHtml()"
                        class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition">
                        {{ 'PROPERTY.ExportHTML' | translate }}
                    </button>
                </div>
            </div>
            <div id="gjs" class="flex-1"></div>
        </div>
    `,
    styles: [`
        :host { display: block; height: 100%; }
        #gjs { height: 100%; }
        #gjs .gjs-cv-canvas { background: #f1f5f9; }
        #gjs .gjs-cv-canvas__frames { height: 100% !important; }
        #gjs iframe { height: 100% !important; }
        .gjs-one-bg { background-color: #1e293b !important; }
        .gjs-two-bg { background-color: #334155 !important; }
        .gjs-three-bg { background-color: #475569 !important; }
        .gjs-four-color, .gjs-four-color-h:hover { color: #f1f5f9 !important; }
        .gjs-field { background-color: #475569 !important; border-color: #64748b !important; color: #f1f5f9 !important; }
        .gjs-sm-sector { background-color: #1e293b !important; }
        .gjs-block { color: #f1f5f9 !important; }
        .gjs-category-title, .gjs-layer-title, .gjs-sm-sector-title { color: #f1f5f9 !important; }
        .gjs-sm-field { color: #f1f5f9 !important; }
        .gjs-block-label { color: #e2e8f0 !important; }
    `]
})
export class PropertyWebsiteBuilderComponent implements OnInit, OnDestroy {
    propertyName = input.required<string>();
    close = output<void>();
    isSaving = signal(false);
    private editor: any;

    async ngOnInit() {
        setTimeout(() => this.initEditor(), 200);
    }

    ngOnDestroy() {
        if (this.editor) this.editor.destroy();
    }

    private initEditor() {
        const container = document.getElementById('gjs');
        if (!container) return;

        grapesjs.plugins.add('gjs-preset-webpage', grapesjsPresetWebpage as any);

        this.editor = grapesjs.init({
            container: '#gjs',
            height: '100%',
            width: 'auto',
            fromElement: false,
            storageManager: false,
            plugins: ['gjs-preset-webpage'],
            pluginsOpts: {
                'gjs-preset-webpage': {
                    blocks: [],
                    panels: { defaults: [] },
                }
            },
            deviceManager: {
                devices: [
                    { name: 'Desktop', width: '' },
                    { name: 'Tablet', width: '768px' },
                    { name: 'Mobile', width: '320px' }
                ]
            },
            styleManager: {
                sectors: [
                    { name: 'Dimension', open: false, buildProps: ['width', 'height', 'max-height', 'min-height', 'max-width', 'min-width'] },
                    { name: 'Margin', open: false, buildProps: ['margin-top', 'margin-right', 'margin-bottom', 'margin-left'] },
                    { name: 'Padding', open: false, buildProps: ['padding-top', 'padding-right', 'padding-bottom', 'padding-left'] },
                    { name: 'Typography', open: false, buildProps: ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'color', 'line-height', 'text-align'] },
                    { name: 'Decorations', open: false, buildProps: ['background-color', 'border-radius', 'border', 'box-shadow', 'opacity'] }
                ]
            }
        });

        this.addPropertyBlocks();
    }

    private addPropertyBlocks() {
        const bm = this.editor.BlockManager;
        bm.add('hero', { label: 'Hero', content: '<section style="height:600px;background:linear-gradient(135deg,#667eea,#764ba2);display:flex;align-items:center;justify-content:center;color:white"><div style="text-align:center"><h1>Your Property Name</h1><p>Luxury Vacation Rental</p><a href="#" style="display:inline-block;padding:1rem 2rem;background:white;color:#667eea;border-radius:50px;text-decoration:none;font-weight:600">Book Now</a></div></section>' });
        bm.add('info', { label: 'Info', content: '<section style="padding:4rem 2rem;background:white"><div style="max-width:1200px;margin:0 auto;display:grid;grid-template-columns:repeat(4,1fr);gap:2rem;text-align:center"><div><div style="font-size:2rem">🏠</div><div>3 Bedrooms</div></div><div><div style="font-size:2rem">🚿</div><div>2 Bathrooms</div></div><div><div style="font-size:2rem">👥</div><div>6 Guests</div></div><div><div style="font-size:2rem">📐</div><div>120 m²</div></div></div></section>' });
        bm.add('amenities', { label: 'Amenities', content: '<section style="padding:4rem 2rem;background:#f9fafb"><div style="max-width:1200px;margin:0 auto"><h2 style="text-align:center;margin-bottom:2rem">Amenities</h2><div style="display:grid;grid-template-columns:repeat(4,1fr);gap:1rem"><div style="padding:1rem;background:white;border-radius:8px;text-align:center">📶 WiFi</div><div style="padding:1rem;background:white;border-radius:8px;text-align:center">❄️ A/C</div><div style="padding:1rem;background:white;border-radius:8px;text-align:center">🍳 Kitchen</div><div style="padding:1rem;background:white;border-radius:8px;text-align:center">🅿️ Parking</div></div></div></section>' });
        bm.add('gallery', { label: 'Gallery', content: '<section style="padding:4rem 2rem;background:white"><div style="max-width:1200px;margin:0 auto"><h2 style="text-align:center;margin-bottom:2rem">Gallery</h2><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:1rem"><div style="height:200px;background:linear-gradient(45deg,#667eea,#764ba2);border-radius:8px"></div><div style="height:200px;background:linear-gradient(45deg,#f093fb,#f5576c);border-radius:8px"></div><div style="height:200px;background:linear-gradient(45deg,#4facfe,#00f2fe);border-radius:8px"></div></div></div></section>' });
        bm.add('description', { label: 'Description', content: '<section style="padding:4rem 2rem;background:#f9fafb"><div style="max-width:800px;margin:0 auto"><h2 style="text-align:center;margin-bottom:1rem">About</h2><p>Welcome to our beautiful property! This stunning vacation rental offers the perfect blend of comfort and luxury.</p></div></section>' });
        bm.add('contact', { label: 'Contact', content: '<section style="padding:4rem 2rem;background:linear-gradient(135deg,#667eea,#764ba2);color:white"><div style="max-width:600px;margin:0 auto;text-align:center"><h2>Contact</h2><form style="display:flex;flex-direction:column;gap:1rem"><input placeholder="Name" style="padding:1rem;border-radius:8px;border:none"><input placeholder="Email" style="padding:1rem;border-radius:8px;border:none"><textarea rows="4" placeholder="Message" style="padding:1rem;border-radius:8px;border:none"></textarea><button style="padding:1rem;background:white;color:#667eea;border:none;border-radius:8px;font-weight:600">Send</button></form></div></section>' });
        bm.add('reviews', { label: 'Reviews', content: '<section style="padding:4rem 2rem;background:white"><div style="max-width:1200px;margin:0 auto"><h2 style="text-align:center;margin-bottom:2rem">Reviews</h2><div style="display:grid;grid-template-columns:repeat(2,1fr);gap:2rem"><div style="padding:2rem;background:#f9fafb;border-radius:8px"><div style="color:#fbbf24">⭐⭐⭐⭐⭐</div><p>"Amazing property!"</p><p>- Sarah M.</p></div><div style="padding:2rem;background:#f9fafb;border-radius:8px"><div style="color:#fbbf24">⭐⭐⭐⭐⭐</div><p>"Beautiful place!"</p><p>- John D.</p></div></div></div></section>' });
    }

    async save() {
        this.isSaving.set(true);
        try { console.log('Saving:', this.editor.getHtml()); }
        catch (e) { console.error(e); }
        finally { this.isSaving.set(false); }
    }

    exportHtml() {
        const html = this.editor.getHtml();
        const css = this.editor.getCss();
        const full = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${this.propertyName()}</title><style>${css}</style></head><body>${html}</body></html>`;
        navigator.clipboard.writeText(full).then(() => alert('HTML copied!'));
    }
}
