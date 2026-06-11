import { Component, Input, Output, EventEmitter, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormArray, FormControl } from '@angular/forms';
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
    @Input({ required: true }) parentForm!: FormGroup;

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

    // ── Room Management ──

    getRoomsArray(): FormArray {
        return this.group.get('rental_rooms') as FormArray;
    }

    addRoom(): void {
        const rooms = this.getRoomsArray();
        rooms.push(new FormGroup({
            name: new FormControl(''),
            price: new FormControl(0),
            maxGuests: new FormControl(2),
            bedType: new FormControl('queen'),
            privateBathroom: new FormControl(true),
        }));
    }

    removeRoom(index: number): void {
        this.getRoomsArray().removeAt(index);
    }

    roomBedTypeIcon(bedType: string): string {
        const icons: Record<string, string> = { king: '👑', queen: '👑', double: '🛏️', twin: '🛌', bunk: '🪜', single: '🛌', sofa_bed: '🛋️', crib: '👶' };
        return icons[bedType] || '🛏️';
    }
}
