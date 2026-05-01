import { Component, OnInit, OnDestroy, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import grapesjs from 'grapesjs';
import 'grapesjs-preset-webpage';

@Component({
    selector: 'app-property-website-builder',
    standalone: true,
    imports: [CommonModule, TranslatePipe],
    template: `
        <div class="h-full flex flex-col bg-slate-900">
            <!-- Header -->
            <div class="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-white/5">
                <div class="flex items-center gap-4">
                    <button 
                        (click)="close.emit()"
                        class="text-slate-400 hover:text-white transition-colors">
                        <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <h2 class="text-xl font-bold text-white">
                        {{ 'PROPERTY.Builder' | translate }}
                    </h2>
                </div>
                
                <div class="flex items-center gap-3">
                    <button 
                        (click)="save()"
                        [disabled]="isSaving()"
                        class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition flex items-center gap-2 disabled:opacity-50">
                        @if (isSaving()) {
                            <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        }
                        {{ isSaving() ? ('COMMON.Saving' | translate) : ('COMMON.Save' | translate) }}
                    </button>
                    <button 
                        (click)="exportHtml()"
                        class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition flex items-center gap-2">
                        <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                        {{ 'PROPERTY.ExportHTML' | translate }}
                    </button>
                </div>
            </div>

            <!-- GrapesJS Container -->
            <div id="gjs" class="flex-1 overflow-hidden"></div>
        </div>
    `,
    styles: [`
        :host { display: block; height: 100%; }
        #gjs { height: 100%; }
        
        /* Custom GrapesJS Styles to match app theme */
        .gjs-one-bg { background-color: #1e293b !important; }
        .gjs-two-bg { background-color: #334155 !important; }
        .gjs-four-color, .gjs-four-color-h:hover { color: #f1f5f9 !important; }
        .gjs-field { background-color: #475569 !important; border-color: #64748b !important; color: #f1f5f9 !important; }
        .gjs-sm-sector { background-color: #1e293b !important; }
        .gjs-block { color: #f1f5f9 !important; }
        .gjs-category-title, .gjs-layer-title, .gjs-sm-sector-title { color: #f1f5f9 !important; }
        .gjs-sm-field { color: #f1f5f9 !important; }
    `]
})
export class PropertyWebsiteBuilderComponent implements OnInit, OnDestroy {
    propertyName = input.required<string>();
    close = output<void>();
    
    isSaving = signal(false);
    private editor: any;

    async ngOnInit() {
        // Initialize GrapesJS after view init with longer delay
        setTimeout(() => this.initEditor(), 500);
    }

    ngOnDestroy() {
        if (this.editor) {
            this.editor.destroy();
        }
    }

    private initEditor() {
        console.log('[PropertyWebsiteBuilder] Initializing GrapesJS...');
        
        const container = document.getElementById('gjs');
        if (!container) {
            console.error('[PropertyWebsiteBuilder] Container #gjs not found!');
            return;
        }

        console.log('[PropertyWebsiteBuilder] Container found, initializing...');

        this.editor = grapesjs.init({
            container: '#gjs',
            height: '100%',
            width: 'auto',
            fromElement: false,
            storageManager: false,
            panels: {
                defaults: [
                    {
                        id: 'commands',
                        el: '.panel__commands',
                        buttons: [
                            {
                                id: 'visibility',
                                active: false,
                                className: 'fa fa-eye',
                                command: 'preview',
                                attributes: { title: 'Preview' }
                            }
                        ]
                    }
                ]
            },
            plugins: ['gjs-preset-webpage'],
            pluginsOpts: {
                'gjs-preset-webpage': {
                    modalImportTitle: 'Import Template',
                    modalImportLabel: '<div style="margin-bottom: 10px; font-size: 13px;">Paste your HTML/CSS here</div>',
                    modalImportContent: undefined,
                    codeViewer: {
                        theme: 'hopscotch'
                    }
                }
            },
            deviceManager: {
                devices: [
                    { name: 'Desktop', width: '' },
                    { name: 'Tablet', width: '768px' },
                    { name: 'Mobile landscape', width: '568px' },
                    { name: 'Mobile portrait', width: '320px' }
                ]
            },
            styleManager: {
                sectors: [
                    {
                        name: 'Dimension',
                        open: false,
                        buildProps: ['width', 'height', 'max-height', 'min-height', 'max-width', 'min-width']
                    },
                    {
                        name: 'Margin',
                        open: false,
                        buildProps: ['margin-top', 'margin-right', 'margin-bottom', 'margin-left']
                    },
                    {
                        name: 'Padding',
                        open: false,
                        buildProps: ['padding-top', 'padding-right', 'padding-bottom', 'padding-left']
                    },
                    {
                        name: 'Typography',
                        open: false,
                        buildProps: ['font-family', 'font-size', 'font-weight', 'letter-spacing', 'color', 'line-height', 'text-align']
                    },
                    {
                        name: 'Decorations',
                        open: false,
                        buildProps: ['background-color', 'border-radius', 'border', 'box-shadow', 'opacity']
                    }
                ]
            }
        });

        console.log('[PropertyWebsiteBuilder] GrapesJS initialized successfully');

        // Add custom blocks for property listings
        this.addPropertyBlocks();

        // Load existing content if any
        this.loadExistingContent();
    }

    private addPropertyBlocks() {
        const blockManager = this.editor.BlockManager;

        // Hero Section
        blockManager.add('hero-section', {
            label: 'Hero',
            attributes: { class: 'fa fa-image' },
            content: `
                <section class="hero-section" style="position: relative; height: 600px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center;">
                    <div style="text-align: center; color: white; z-index: 2;">
                        <h1 style="font-size: 3rem; margin-bottom: 1rem; font-weight: 700;">Your Property Name</h1>
                        <p style="font-size: 1.5rem; margin-bottom: 2rem; opacity: 0.9;">Luxury Vacation Rental</p>
                        <a href="#contact" style="display: inline-block; padding: 1rem 2rem; background: white; color: #667eea; text-decoration: none; border-radius: 50px; font-weight: 600;">Book Now</a>
                    </div>
                </section>
            `
        });

        // Property Info
        blockManager.add('property-info', {
            label: 'Property Info',
            attributes: { class: 'fa fa-home' },
            content: `
                <section class="property-info" style="padding: 4rem 2rem; background: white;">
                    <div style="max-width: 1200px; margin: 0 auto;">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 2rem; text-align: center;">
                            <div>
                                <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🏠</div>
                                <div style="font-size: 1.25rem; font-weight: 600; color: #1f2937;">3 Bedrooms</div>
                            </div>
                            <div>
                                <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">🚿</div>
                                <div style="font-size: 1.25rem; font-weight: 600; color: #1f2937;">2 Bathrooms</div>
                            </div>
                            <div>
                                <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">👥</div>
                                <div style="font-size: 1.25rem; font-weight: 600; color: #1f2937;">6 Guests</div>
                            </div>
                            <div>
                                <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">📐</div>
                                <div style="font-size: 1.25rem; font-weight: 600; color: #1f2937;">120 m²</div>
                            </div>
                        </div>
                    </div>
                </section>
            `
        });

        // Amenities
        blockManager.add('amenities', {
            label: 'Amenities',
            attributes: { class: 'fa fa-star' },
            content: `
                <section class="amenities" style="padding: 4rem 2rem; background: #f9fafb;">
                    <div style="max-width: 1200px; margin: 0 auto;">
                        <h2 style="text-align: center; font-size: 2.5rem; margin-bottom: 3rem; color: #1f2937;">Amenities</h2>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem;">
                            <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                                <span style="font-size: 2rem;">📶</span>
                                <span style="font-weight: 500; color: #374151;">High-Speed WiFi</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                                <span style="font-size: 2rem;">❄️</span>
                                <span style="font-weight: 500; color: #374151;">Air Conditioning</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                                <span style="font-size: 2rem;">🍳</span>
                                <span style="font-weight: 500; color: #374151;">Full Kitchen</span>
                            </div>
                            <div style="display: flex; align-items: center; gap: 1rem; padding: 1rem; background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                                <span style="font-size: 2rem;">🅿️</span>
                                <span style="font-weight: 500; color: #374151;">Free Parking</span>
                            </div>
                        </div>
                    </div>
                </section>
            `
        });

        // Photo Gallery
        blockManager.add('photo-gallery', {
            label: 'Gallery',
            attributes: { class: 'fa fa-th' },
            content: `
                <section class="photo-gallery" style="padding: 4rem 2rem; background: white;">
                    <div style="max-width: 1200px; margin: 0 auto;">
                        <h2 style="text-align: center; font-size: 2.5rem; margin-bottom: 3rem; color: #1f2937;">Photo Gallery</h2>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem;">
                            <div style="height: 250px; background: linear-gradient(45deg, #667eea, #764ba2); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 3rem;">📸</div>
                            <div style="height: 250px; background: linear-gradient(45deg, #f093fb, #f5576c); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 3rem;">📸</div>
                            <div style="height: 250px; background: linear-gradient(45deg, #4facfe, #00f2fe); border-radius: 8px; display: flex; align-items: center; justify-content: center; color: white; font-size: 3rem;">📸</div>
                        </div>
                    </div>
                </section>
            `
        });

        // Description
        blockManager.add('description', {
            label: 'Description',
            attributes: { class: 'fa fa-align-left' },
            content: `
                <section class="description" style="padding: 4rem 2rem; background: #f9fafb;">
                    <div style="max-width: 800px; margin: 0 auto;">
                        <h2 style="text-align: center; font-size: 2.5rem; margin-bottom: 2rem; color: #1f2937;">About This Property</h2>
                        <div style="font-size: 1.125rem; line-height: 1.8; color: #4b5563;">
                            <p style="margin-bottom: 1.5rem;">Welcome to our beautiful property! This stunning vacation rental offers the perfect blend of comfort and luxury.</p>
                            <p style="margin-bottom: 1.5rem;">Located in a prime location, you'll enjoy easy access to local attractions while retreating to your peaceful sanctuary.</p>
                            <p>Whether you're traveling for business or leisure, our property provides all the amenities you need for a memorable stay.</p>
                        </div>
                    </div>
                </section>
            `
        });

        // Contact Form
        blockManager.add('contact-form', {
            label: 'Contact',
            attributes: { class: 'fa fa-envelope' },
            content: `
                <section class="contact" style="padding: 4rem 2rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                    <div style="max-width: 600px; margin: 0 auto; text-align: center;">
                        <h2 style="font-size: 2.5rem; margin-bottom: 1rem; color: white;">Get in Touch</h2>
                        <p style="font-size: 1.125rem; margin-bottom: 2rem; color: rgba(255,255,255,0.9);">Have questions? We'd love to hear from you!</p>
                        <form style="display: flex; flex-direction: column; gap: 1rem;">
                            <input type="text" placeholder="Your Name" style="padding: 1rem; border-radius: 8px; border: none; font-size: 1rem;">
                            <input type="email" placeholder="Your Email" style="padding: 1rem; border-radius: 8px; border: none; font-size: 1rem;">
                            <textarea rows="4" placeholder="Your Message" style="padding: 1rem; border-radius: 8px; border: none; font-size: 1rem; resize: vertical;"></textarea>
                            <button type="submit" style="padding: 1rem; background: white; color: #667eea; border: none; border-radius: 8px; font-size: 1rem; font-weight: 600; cursor: pointer;">Send Message</button>
                        </form>
                    </div>
                </section>
            `
        });

        // Testimonials
        blockManager.add('testimonials', {
            label: 'Reviews',
            attributes: { class: 'fa fa-comment' },
            content: `
                <section class="testimonials" style="padding: 4rem 2rem; background: white;">
                    <div style="max-width: 1200px; margin: 0 auto;">
                        <h2 style="text-align: center; font-size: 2.5rem; margin-bottom: 3rem; color: #1f2937;">Guest Reviews</h2>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 2rem;">
                            <div style="padding: 2rem; background: #f9fafb; border-radius: 8px;">
                                <div style="color: #fbbf24; font-size: 1.5rem; margin-bottom: 1rem;">⭐⭐⭐⭐⭐</div>
                                <p style="font-style: italic; color: #4b5563; margin-bottom: 1rem;">"Amazing property! Everything was perfect from check-in to check-out. Highly recommend!"</p>
                                <p style="font-weight: 600; color: #1f2937;">- Sarah M.</p>
                            </div>
                            <div style="padding: 2rem; background: #f9fafb; border-radius: 8px;">
                                <div style="color: #fbbf24; font-size: 1.5rem; margin-bottom: 1rem;">⭐⭐⭐⭐⭐</div>
                                <p style="font-style: italic; color: #4b5563; margin-bottom: 1rem;">"Beautiful place with stunning views. The host was very responsive and helpful."</p>
                                <p style="font-weight: 600; color: #1f2937;">- John D.</p>
                            </div>
                        </div>
                    </div>
                </section>
            `
        });
    }

    private async loadExistingContent() {
        // TODO: Load from repository if property already has a website
        console.log('[PropertyWebsiteBuilder] Loading existing content for:', this.propertyName());
    }

    async save() {
        this.isSaving.set(true);
        try {
            const html = this.editor.getHtml();
            const css = this.editor.getCss();
            const projectData = this.editor.getProjectData();

            console.log('[PropertyWebsiteBuilder] Saving:', { html, css, projectData });
            
            // TODO: Save to repository
            // await this.repository.savePropertyWebsite(this.propertyName(), { html, css, projectData });
            
        } catch (error) {
            console.error('[PropertyWebsiteBuilder] Save error:', error);
        } finally {
            this.isSaving.set(false);
        }
    }

    exportHtml() {
        const html = this.editor.getHtml();
        const css = this.editor.getCss();
        
        const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${this.propertyName()}</title>
    <style>${css}</style>
</head>
<body>
    ${html}
</body>
</html>`;

        // Copy to clipboard
        navigator.clipboard.writeText(fullHtml).then(() => {
            console.log('[PropertyWebsiteBuilder] HTML copied to clipboard');
            alert('HTML copied to clipboard!');
        });
    }
}
