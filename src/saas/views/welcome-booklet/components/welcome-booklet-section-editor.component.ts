import { Component, Input, Output, EventEmitter, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { BookletSection, CONTROL_LABELS } from '../booklet-definitions';
import { WelcomeBookletAiService } from '../welcome-booklet-ai.service';
import { WelcomeBookletService } from '../welcome-booklet.service';
import { TranslatePipe } from '../../../../pipes/translate.pipe';

@Component({
    selector: 'app-welcome-booklet-section-editor',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
    templateUrl: './welcome-booklet-section-editor.component.html',
})
export class WelcomeBookletSectionEditorComponent {
    @Input({ required: true }) section!: BookletSection;
    @Input({ required: true }) group!: FormGroup;
    @Input({ required: true }) parentForm!: FormGroup; // For address access

    aiService = inject(WelcomeBookletAiService);
    mainService = inject(WelcomeBookletService);

    @Input() isOpen = false;
    @Output() toggleRequest = new EventEmitter<void>();

    toggle() {
        this.toggleRequest.emit();
    }

    getFields() {
        return CONTROL_LABELS[this.section.formGroupName] ? Object.keys(CONTROL_LABELS[this.section.formGroupName]) : [];
    }

    getLabel(key: string) {
        return CONTROL_LABELS[this.section.formGroupName][key];
    }
}
