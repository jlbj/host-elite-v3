import { Component, inject, input, output, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WelcomeBookletEditorComponent } from '../../../views/welcome-booklet/components/welcome-booklet-editor.component';
import { WelcomeBookletService } from '../../../views/welcome-booklet/welcome-booklet.service';
import { TranslationService } from '../../../../services/translation.service';
import { TranslatePipe } from '../../../../pipes/translate.pipe';

@Component({
    selector: 'app-welcome-booklet-editor-wrapper',
    standalone: true,
    imports: [CommonModule, TranslatePipe, WelcomeBookletEditorComponent],
    template: `
        <app-welcome-booklet-editor></app-welcome-booklet-editor>
    `
})
export class WelcomeBookletEditorWrapperComponent {
    propertyName = input.required<string>();
    close = output<void>();

    private bookletService = inject(WelcomeBookletService) as any;
    private translationService = inject(TranslationService);

    constructor() {
        // Load booklet data when propertyName changes
        effect(() => {
            const name = this.propertyName();
            if (name) {
                this.loadBookletData();
            }
        });
    }

    async loadBookletData() {
        // Data is loaded directly by WelcomeBookletEditorComponent via the service
        // No need to pass contentData - the form is managed by the service
    }

    async save() {
        // Save using WelcomeBookletService
        await this.bookletService.saveBooklet();
    }
}
