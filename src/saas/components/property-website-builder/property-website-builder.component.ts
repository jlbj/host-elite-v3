import { Component, OnInit, OnDestroy, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import grapesjs from 'grapesjs';

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
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <h2 class="text-xl font-bold text-white">{{ 'PROPERTY.Builder' | translate }}</h2>
                </div>
                <div class="flex items-center gap-3">
                    <button (click)="save()" [disabled]="isSaving()" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition flex items-center gap-2 disabled:opacity-50">
                        @if (isSaving()) {
                            <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        }
                        {{ isSaving() ? ('COMMON.Saving' | translate) : ('COMMON.Save' | translate) }}
                    </button>
                    <button (click)="exportHtml()" class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        {{ 'PROPERTY.ExportHTML' | translate }}
                    </button>
                </div>
            </div>

            <div class="flex flex-1 overflow-hidden" id="editor-wrapper">
                <div class="w-28 bg-slate-800 border-r border-white/10 overflow-y-auto flex-shrink-0">
                    <div class="p-1.5 text-xs font-semibold text-white border-b border-white/10">Blocks</div>
                    <div id="gjs-blocks" class="p-1.5"></div>
                </div>
                <div class="flex-1 flex flex-col min-w-0 bg-slate-900">
                    <div class="flex items-center gap-1 px-2 py-1 bg-slate-800 border-b border-white/10">
                        <button *ngFor="let device of devices" (click)="setDevice(device.name)"
                            [class.bg-blue-600]="currentDevice === device.name"
                            [class.bg-slate-700]="currentDevice !== device.name"
                            class="px-2 py-0.5 text-xs text-white rounded hover:bg-slate-600 transition whitespace-nowrap">
                            {{ device.label }}
                        </button>
                    </div>
                    <div class="flex-1 overflow-auto">
                        <div id="gjs" class="h-full"></div>
                    </div>
                </div>
                <div class="w-32 bg-slate-800 border-l border-white/10 overflow-y-auto flex-shrink-0">
                    <div class="p-1.5 text-xs font-semibold text-white border-b border-white/10">Styles</div>
                    <div id="gjs-styles" class="p-1.5"></div>
                </div>
            </div>
        </div>
    `,
    styles: [`
        :host { display: block; height: 100%; }
        #editor-wrapper { height: calc(100% - 73px); }
        #gjs { height: 100%; min-height: 0; }
        #gjs .gjs-pn-devices-c, #gjs .gjs-pn-views-container, #gjs .gjs-pn-views,
        #gjs .gjs-pn-commands, #gjs .gjs-pn-options { display: none !important; }
        #gjs-blocks { display: grid; grid-template-columns: 1fr 1fr; gap: 3px; }
        #gjs-blocks .gjs-block { background: #475569 !important; border: 1px solid #64748b !important; border-radius: 4px; padding: 4px 2px !important; min-height: 45px; color: #f1f5f9 !important; cursor: grab; display: flex; flex-direction: column; align-items: center; justify-content: center; }
        #gjs-blocks .gjs-block:hover { border-color: #3b82f6 !important; background: #64748b !important; }
        #gjs-blocks .gjs-block__media { font-size: 16px !important; margin-bottom: 1px; color: #fff !important; }
        #gjs-blocks .gjs-block-label { color: #e2e8f0 !important; font-size: 9px !important; font-weight: 500; }
        #gjs-styles { font-size: 10px !important; }
        #gjs-styles * { font-size: 10px !important; }
        #gjs-styles svg { width: 10px !important; height: 10px !important; min-width: 10px !important; min-height: 10px !important; }
        #gjs-styles i { font-size: 10px !important; width: 10px !important; }
        #gjs-styles .gjs-sm-sector { background: #1e293b !important; margin-bottom: 4px; border-radius: 3px; padding: 3px !important; }
        #gjs-styles .gjs-sm-sector-title { color: #f1f5f9 !important; font-weight: 600; font-size: 10px !important; cursor: pointer; padding: 1px 0; }
        #gjs-styles .gjs-sm-property { background: #334155 !important; border-color: #475569 !important; color: #f1f5f9 !important; margin-bottom: 2px; padding: 2px !important; border-radius: 2px; }
        #gjs-styles .gjs-sm-label, #gjs-styles .gjs-sm-icon { color: #cbd5e1 !important; font-size: 10px !important; }
        #gjs-styles .gjs-sm-field { background: #475569 !important; border-color: #64748b !important; color: #f1f5f9 !important; font-size: 10px !important; padding: 2px 4px !important; }
        #gjs-styles .gjs-sm-field input, #gjs-styles .gjs-sm-field select { background: #475569 !important; color: #f1f5f9 !important; font-size: 10px !important; border: none !important; }
        #gjs-styles .gjs-sm-layer { background: #334155 !important; color: #f1f5f9 !important; }
    `]
})
export class PropertyWebsiteBuilderComponent implements OnInit, OnDestroy {
    propertyName = input.required<string>();
    close = output<void>();
    isSaving = signal(false);
    private editor: any;
    devices = [{ name: 'Desktop', label: '🖥️ Desktop' }, { name: 'Tablet', label: '📱 Tablet' }, { name: 'Mobile', label: '📱 Mobile' }];
    currentDevice = 'Desktop';

    async ngOnInit() { setTimeout(() => this.initEditor(), 200); }
    ngOnDestroy() { if (this.editor) this.editor.destroy(); }

    private initEditor() {
        const container = document.getElementById('gjs');
        if (!container) return;
        this.editor = grapesjs.init({
            container: '#gjs', height: '100%', width: 'auto', fromElement: false, storageManager: false,
            blockManager: { appendTo: '#gjs-blocks' },
            deviceManager: { devices: [{ name: 'Desktop', width: '' }, { name: 'Tablet', width: '768px' }, { name: 'Mobile', width: '320px' }] },
            selectorManager: { appendTo: '#gjs-styles' },
            traitManager: { appendTo: '#gjs-styles' },
            layerManager: { appendTo: '#gjs-styles' },
            styleManager: {
                appendTo: '#gjs-styles',
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

    setDevice(name: string) { this.currentDevice = name; if (this.editor) this.editor.setDevice(name); }

    private addPropertyBlocks() {
        const bm = this.editor.BlockManager;
        bm.add('hero', { label: 'Hero', attributes: { class: 'fa fa-image' }, content: '<section style="position:relative;height:600px;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);display:flex;align-items:center;justify-content:center;"><div style="text-align:center;color:white;"><h1 style="font-size:3rem;margin-bottom:1rem;font-weight:700;">Your Property Name</h1><p style="font-size:1.5rem;margin-bottom:2rem;opacity:0.9;">Luxury Vacation Rental</p><a href="#contact" style="display:inline-block;padding:1rem 2rem;background:white;color:#667eea;text-decoration:none;border-radius:50px;font-weight:600;">Book Now</a></div></section>' });
        bm.add('info', { label: 'Info', attributes: { class: 'fa fa-home' }, content: '<section style="padding:4rem 2rem;background:white;"><div style="max-width:1200px;margin:0 auto;display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:2rem;text-align:center;"><div><div style="font-size:2.5rem;">🏠</div><div style="font-size:1.1rem;font-weight:600;color:#1f2937;">3 Bedrooms</div></div><div><div style="font-size:2.5rem;">🚿</div><div style="font-size:1.1rem;font-weight:600;color:#1f2937;">2 Bathrooms</div></div><div><div style="font-size:2.5rem;">👥</div><div style="font-size:1.1rem;font-weight:600;color:#1f2937;">6 Guests</div></div><div><div style="font-size:2.5rem;">📐</div><div style="font-size:1.1rem;font-weight:600;color:#1f2937;">120 m²</div></div></div></div></section>' });
        bm.add('amenities', { label: 'Amenities', attributes: { class: 'fa fa-star' }, content: '<section style="padding:4rem 2rem;background:#f9fafb;"><div style="max-width:1200px;margin:0 auto;"><h2 style="text-align:center;font-size:2.5rem;margin-bottom:3rem;color:#1f2937;">Amenities</h2><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:1.5rem;"><div style="display:flex;align-items:center;gap:1rem;padding:1rem;background:white;border-radius:8px;"><span style="font-size:2rem;">📶</span><span style="font-weight:500;color:#374151;">WiFi</span></div><div style="display:flex;align-items:center;gap:1rem;padding:1rem;background:white;border-radius:8px;"><span style="font-size:2rem;">❄️</span><span style="font-weight:500;color:#374151;">A/C</span></div><div style="display:flex;align-items:center;gap:1rem;padding:1rem;background:white;border-radius:8px;"><span style="font-size:2rem;">🍳</span><span style="font-weight:500;color:#374151;">Kitchen</span></div><div style="display:flex;align-items:center;gap:1rem;padding:1rem;background:white;border-radius:8px;"><span style="font-size:2rem;">🅿️</span><span style="font-weight:500;color:#374151;">Parking</span></div></div></div></section>' });
        bm.add('gallery', { label: 'Gallery', attributes: { class: 'fa fa-th' }, content: '<section style="padding:4rem 2rem;background:white;"><div style="max-width:1200px;margin:0 auto;"><h2 style="text-align:center;font-size:2.5rem;margin-bottom:3rem;color:#1f2937;">Gallery</h2><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:1rem;"><div style="height:200px;background:linear-gradient(45deg,#667eea,#764ba2);border-radius:8px;display:flex;align-items:center;justify-content:center;color:white;font-size:3rem;">📸</div><div style="height:200px;background:linear-gradient(45deg,#f093fb,#f5576c);border-radius:8px;display:flex;align-items:center;justify-content:center;color:white;font-size:3rem;">📸</div><div style="height:200px;background:linear-gradient(45deg,#4facfe,#00f2fe);border-radius:8px;display:flex;align-items:center;justify-content:center;color:white;font-size:3rem;">📸</div></div></div></section>' });
        bm.add('description', { label: 'Description', attributes: { class: 'fa fa-align-left' }, content: '<section style="padding:4rem 2rem;background:#f9fafb;"><div style="max-width:800px;margin:0 auto;"><h2 style="text-align:center;font-size:2.5rem;margin-bottom:2rem;color:#1f2937;">About</h2><p style="font-size:1.125rem;line-height:1.8;color:#4b5563;">Welcome to our beautiful property! This stunning vacation rental offers the perfect blend of comfort and luxury.</p></div></section>' });
        bm.add('contact', { label: 'Contact', attributes: { class: 'fa fa-envelope' }, content: '<section style="padding:4rem 2rem;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);"><div style="max-width:600px;margin:0 auto;text-align:center;"><h2 style="font-size:2.5rem;margin-bottom:1rem;color:white;">Contact</h2><form style="display:flex;flex-direction:column;gap:1rem;"><input type="text" placeholder="Name" style="padding:1rem;border-radius:8px;border:none;font-size:1rem;"><input type="email" placeholder="Email" style="padding:1rem;border-radius:8px;border:none;font-size:1rem;"><textarea rows="4" placeholder="Message" style="padding:1rem;border-radius:8px;border:none;font-size:1rem;resize:vertical;"></textarea><button type="submit" style="padding:1rem;background:white;color:#667eea;border:none;border-radius:8px;font-size:1rem;font-weight:600;cursor:pointer;">Send</button></form></div></section>' });
        bm.add('testimonials', { label: 'Reviews', attributes: { class: 'fa fa-comment' }, content: '<section style="padding:4rem 2rem;background:white;"><div style="max-width:1200px;margin:0 auto;"><h2 style="text-align:center;font-size:2.5rem;margin-bottom:3rem;color:#1f2937;">Reviews</h2><div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:2rem;"><div style="padding:2rem;background:#f9fafb;border-radius:8px;"><div style="color:#fbbf24;font-size:1.5rem;margin-bottom:1rem;">⭐⭐⭐⭐⭐</div><p style="font-style:italic;color:#4b5563;margin-bottom:1rem;">"Amazing property!"</p><p style="font-weight:600;color:#1f2937;">- Sarah M.</p></div><div style="padding:2rem;background:#f9fafb;border-radius:8px;"><div style="color:#fbbf24;font-size:1.5rem;margin-bottom:1rem;">⭐⭐⭐⭐⭐</div><p style="font-style:italic;color:#4b5563;margin-bottom:1rem;">"Beautiful place!"</p><p style="font-weight:600;color:#1f2937;">- John D.</p></div></div></div></section>' });
    }

    async save() {
        this.isSaving.set(true);
        try {
            const html = this.editor.getHtml();
            const css = this.editor.getCss();
            console.log('Saving:', { html, css });
        } catch (error) { console.error('Save error:', error); }
        finally { this.isSaving.set(false); }
    }

    exportHtml() {
        const html = this.editor.getHtml();
        const css = this.editor.getCss();
        const fullHtml = `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${this.propertyName()}</title><style>${css}</style></head><body>${html}</body></html>`;
        navigator.clipboard.writeText(fullHtml).then(() => alert('HTML copied!'));
    }
}
