import { Component, input, signal, output, ViewChild, ElementRef, OnInit, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { EditorTheme } from '../models/editor-theme';
import { EditorLayout } from '../models/editor-layout';

@Component({
    selector: 'app-preview-panel',
    standalone: true,
    imports: [CommonModule, TranslatePipe],
    template: `
        <div class="flex flex-col h-full">
            <div class="flex items-center justify-between p-3 border-b border-white/10 bg-white/5">
                <div class="flex items-center gap-2">
                    <span class="text-xs text-slate-400">{{ 'EDITOR.Preview' | translate }}:</span>
                    <div class="flex gap-1">
                        <button (click)="setPreviewMode('desktop')" class="p-1.5 rounded" [class.bg-purple-500]="previewMode() === 'desktop'" [class.bg-white/10]="previewMode() !== 'desktop'" title="Desktop">
                            <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>
                        </button>
                        <button (click)="setPreviewMode('tablet')" class="p-1.5 rounded" [class.bg-purple-500]="previewMode() === 'tablet'" [class.bg-white/10]="previewMode() !== 'tablet'" title="Tablet">
                            <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                        </button>
                        <button (click)="setPreviewMode('mobile')" class="p-1.5 rounded" [class.bg-purple-500]="previewMode() === 'mobile'" [class.bg-white/10]="previewMode() !== 'mobile'" title="Mobile">
                            <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
                        </button>
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <span class="text-xs text-slate-400 font-mono">{{ layout()?.name }} · {{ theme()?.template }}</span>
                    <button (click)="toggleFullscreen()" class="p-1.5 rounded hover:bg-white/10">
                        <svg class="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            @if (isFullscreen()) {
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25"/>
                            } @else {
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15"/>
                            }
                        </svg>
                    </button>
                </div>
            </div>

            <div class="flex-1 overflow-auto p-4 flex items-start justify-center bg-slate-900/50">
                @if (previewMode() === 'mobile' || forceMobileFrame()) {
                    <div class="relative">
                        <div class="iphone-frame">
                            <div class="iphone-notch"></div>
                            <div class="iphone-screen" [style.font-family]="theme()?.fontFamily">
                                <iframe #mobileIframe class="w-full h-full border-0" sandbox="allow-same-origin allow-scripts" (load)="onIframeLoad()"></iframe>
                            </div>
                        </div>
                        <p class="text-center text-xs text-slate-500 mt-3">{{ 'EDITOR.MobilePreview' | translate }}</p>
                    </div>
                } @else {
                    <div class="w-full max-w-6xl">
                        <div class="browser-chrome">
                            <div class="browser-buttons">
                                <div class="w-3 h-3 rounded-full bg-red-500"></div>
                                <div class="w-3 h-3 rounded-full bg-yellow-500"></div>
                                <div class="w-3 h-3 rounded-full bg-green-500"></div>
                            </div>
                            <div class="browser-url"><span class="text-xs text-slate-400">www.your-preview.com</span></div>
                        </div>
                        <div class="preview-content" [class.preview-desktop]="previewMode() === 'desktop'" [class.preview-tablet]="previewMode() === 'tablet'" [style.font-family]="theme()?.fontFamily">
                            <iframe #desktopIframe class="w-full h-full border-0" sandbox="allow-same-origin allow-scripts" (load)="onIframeLoad()"></iframe>
                        </div>
                    </div>
                }
            </div>
        </div>
    `,
    styles: [`
        :host { display: block; height: 100%; }
        .iphone-frame { width: 375px; height: 750px; background: #1a1a1a; border-radius: 40px; padding: 12px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); border: 3px solid #333; position: relative; }
        .iphone-notch { position: absolute; top: 12px; left: 50%; transform: translateX(-50%); width: 150px; height: 25px; background: #1a1a1a; border-radius: 0 0 15px 15px; z-index: 10; }
        .iphone-screen { width: 100%; height: 100%; background: white; border-radius: 30px; overflow: hidden; }
        .browser-chrome { background: #1e293b; padding: 8px 12px; border-radius: 8px 8px 0 0; display: flex; align-items: center; gap: 12px; border: 1px solid rgba(255,255,255,0.1); border-bottom: none; }
        .browser-buttons { display: flex; gap: 6px; }
        .browser-url { flex: 1; background: rgba(255,255,255,0.1); padding: 4px 12px; border-radius: 4px; }
        .preview-content { background: white; border-radius: 0 0 8px 8px; overflow: hidden; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.5); }
        .preview-desktop { height: calc(100vh - 280px); min-height: 600px; }
        .preview-tablet { height: calc(100vh - 280px); min-height: 600px; max-width: 768px; margin: 0 auto; }
        iframe { width: 100%; height: 100%; }
    `]
})
export class PreviewPanelComponent implements OnInit {
    previewHtml = input<string>('');
    theme = input<EditorTheme | null>(null);
    layout = input<EditorLayout | null>(null);
    previewModeInput = input<'desktop' | 'tablet' | 'mobile'>('desktop');
    forceMobileFrame = input<boolean>(false);
    fullscreenChanged = output<boolean>();

    @ViewChild('desktopIframe') desktopIframe?: ElementRef<HTMLIFrameElement>;
    @ViewChild('mobileIframe') mobileIframe?: ElementRef<HTMLIFrameElement>;

    previewMode = signal<'desktop' | 'tablet' | 'mobile'>('desktop');
    isFullscreen = signal(false);
    private lastHtml = '';

    constructor() {
        effect(() => {
            const html = this.previewHtml();
            if (html && html !== this.lastHtml) {
                this.lastHtml = html;
                setTimeout(() => this.updateIframeContent(html), 50);
            }
        });
    }

    ngOnInit() {
        this.previewMode.set(this.previewModeInput());
    }

    onIframeLoad() {
        // Iframe loaded
    }

    private updateIframeContent(html?: string) {
        const content = html || this.previewHtml();
        if (!content) return;
        
        const iframe = this.previewMode() === 'mobile' || this.forceMobileFrame() 
            ? this.mobileIframe?.nativeElement 
            : this.desktopIframe?.nativeElement;
        
        if (iframe) {
            iframe.srcdoc = content;
        }
    }

    setPreviewMode(mode: 'desktop' | 'tablet' | 'mobile') {
        this.previewMode.set(mode);
        setTimeout(() => this.updateIframeContent(), 100);
    }

    toggleFullscreen() {
        this.isFullscreen.update(v => !v);
        this.fullscreenChanged.emit(this.isFullscreen());
    }
}