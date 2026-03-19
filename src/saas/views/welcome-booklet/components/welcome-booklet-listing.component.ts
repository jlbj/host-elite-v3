import { Component, inject, ChangeDetectorRef, computed } from '@angular/core';
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
    cdr = inject(ChangeDetectorRef);
    editorForm = this.service.editorForm;
    propertyName = this.service.propertyName;
    propertyEquipments = this.service.propertyEquipments;
    userEmail = this.service.store.userProfile;

    // Use listing title from editor if set, otherwise fall back to property name
    displayTitle = computed(() => this.service.listingEditorTitle() || this.propertyName());

    // Get style from editor
    listingStyle = computed(() => this.service.listingEditorStyle() || {});

    // Computed helper for photos
    visiblePhotos = this.service.propertyPhotos;
}
