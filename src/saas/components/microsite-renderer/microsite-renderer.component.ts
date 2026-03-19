import { Component, Input, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MicrositeConfig, BuilderPhoto } from '../../views/welcome-booklet/booklet-definitions';
import { TranslatePipe } from '../../../pipes/translate.pipe';
import { TranslationService } from '../../../services/translation.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

interface GuideModalState {
    isOpen: boolean;
    title: string;
    content: string;
    icon: string;
}

@Component({
    selector: 'app-microsite-renderer',
    standalone: true,
    imports: [CommonModule, TranslatePipe],
    templateUrl: './microsite-renderer.component.html',
    styles: [`
        .animate-fade-in-up { animation: fadeInUp 0.8s ease-out forwards; }
        .animate-bounce-subtle { animation: bounceSubtle 2s infinite; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes bounceSubtle { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
    `]
})
export class MicrositeRendererComponent {
    @Input() config!: MicrositeConfig;
    @Input() content!: any; // The full booklet form value
    @Input() photos: BuilderPhoto[] = [];
    @Input() propertyDetails!: any;
    @Input() marketingText: string = '';
    @Input() userEmail: string = '';

    private translationService = inject(TranslationService);
    private sanitizer = inject(DomSanitizer);

    // Internal state for the guide modal
    guideModalState = signal<GuideModalState>({ isOpen: false, title: '', content: '', icon: '' });

    openGuideModal(titleKeyOrText: string, contentKeyOrText: string, icon: string) {
        const title = this.isTranslationKey(titleKeyOrText)
            ? this.translationService.translate(titleKeyOrText)
            : titleKeyOrText;

        const content = this.isTranslationKey(contentKeyOrText)
            ? this.translationService.translate(contentKeyOrText)
            : contentKeyOrText;

        this.guideModalState.set({ isOpen: true, title, content, icon });
    }

    private isTranslationKey(text: string): boolean {
        return text.includes('.') && !text.includes(' ');
    }

    closeGuideModal() {
        this.guideModalState.update(s => ({ ...s, isOpen: false }));
    }

    sanitizeHtml(html: string): SafeHtml {
        return this.sanitizer.bypassSecurityTrustHtml(html || '');
    }
}
