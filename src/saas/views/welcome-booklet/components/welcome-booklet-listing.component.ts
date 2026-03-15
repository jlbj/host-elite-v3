import { Component, inject, ChangeDetectorRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WelcomeBookletService } from '../welcome-booklet.service';
import { TranslatePipe } from '../../../../pipes/translate.pipe';

@Component({
    selector: 'app-welcome-booklet-listing',
    standalone: true,
    imports: [CommonModule, TranslatePipe],
    templateUrl: './welcome-booklet-listing.component.html',
})
export class WelcomeBookletListingComponent {
    service = inject(WelcomeBookletService);

    @Input() set propertyDetails(value: any) {
        if (value && value.name) {
            this.service.propertyName.set(value.name);
        }
    }

    cdr = inject(ChangeDetectorRef);
    editorForm = this.service.editorForm;
    propertyName = this.service.propertyName;
    propertyEquipments = this.service.propertyEquipments;
    userEmail = this.service.store.userProfile;

    // Computed helper for photos to match AngleView structure
    // We treat all property photos as "visible" candidates for the grid
    visiblePhotos = this.service.propertyPhotos;
}
