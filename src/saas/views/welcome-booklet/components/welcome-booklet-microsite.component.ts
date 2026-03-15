import { Component, inject, computed, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WelcomeBookletService } from '../welcome-booklet.service';
import { MicrositeRendererComponent } from '../../../components/microsite-renderer/microsite-renderer.component';

@Component({
    selector: 'app-welcome-booklet-microsite',
    standalone: true,
    imports: [CommonModule, MicrositeRendererComponent],
    templateUrl: './welcome-booklet-microsite.component.html',
})
export class WelcomeBookletMicrositeComponent {
    service = inject(WelcomeBookletService);

    @Input() set propertyDetails(value: any) {
        if (value && value.name) {
            this.service.propertyName.set(value.name);
        }
    }

    // Signals
    config = this.service.micrositeConfig; // Source of truth (already resolved in service)

    // Computed value for photos (mapping service data to BuilderPhoto format)
    photos = computed(() => {
        const photoList = this.service.propertyPhotos(); // {url, category}[]
        const currentConfig = this.config();
        const hidden = currentConfig.hiddenPhotoUrls || [];

        return photoList.map(p => ({
            ...p,
            visible: !hidden.includes(p.url)
        })).filter(p => p.visible); // Only show visible ones in public preview
    });

    // Computed properties for template
    viewDetails = computed(() => ({
        property_equipments: this.service.propertyEquipments().map(name => ({ name }))
    }));

    userEmail = computed(() => this.service.store.userProfile()?.email || '');

    // Getters for form data (EditorForm is not a signal, relying on CD or initial state)
    // Since this view is loaded afresh when tabbing, the form will have been loaded by service.
    get content() {
        return this.service.editorForm.value;
    }

    get marketingText() {
        const val = this.service.editorForm.get('welcome.welcomeMessage')?.value || '';
        console.log('[WelcomeBookletMicrosite] Reading marketingText:', val ? val.substring(0, 20) + '...' : 'EMPTY');
        return val;
    }
}
