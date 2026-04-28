import { Component, inject, ChangeDetectorRef, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WelcomeBookletService } from '../welcome-booklet.service';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { TranslationService } from '../../../../services/translation.service';

@Component({
    selector: 'app-welcome-booklet-listing',
    standalone: true,
    imports: [CommonModule, TranslatePipe],
    templateUrl: './welcome-booklet-listing.component.html',
})
export class WelcomeBookletListingComponent {
    service = inject(WelcomeBookletService);
    translate = inject(TranslationService);
    cdr = inject(ChangeDetectorRef);
    editorForm = this.service.editorForm;
    propertyName = this.service.propertyName;
    propertyEquipments = this.service.propertyEquipments;
    propertyDetails = this.service.propertyDetails;
    userEmail = this.service.store.userProfile;

    // Use listing title from editor if set, otherwise fall back to property name
    displayTitle = computed(() => this.service.listingEditorTitle() || this.propertyName());

    // Get style from editor
    listingStyle = computed(() => this.service.listingEditorStyle() || {});

    // Computed helper for photos
    visiblePhotos = this.service.propertyPhotos;

    // Get translated description based on current language
    translatedDescription = computed(() => {
        const currentLang = this.translate.currentLang() || 'en';
        const description = this.editorForm.get('welcome.welcomeMessage')?.value || '';
        
        // Try to load multi-language description from localStorage
        const propertyId = this.service.propertyId();
        if (propertyId) {
            const storedDesc = localStorage.getItem(`listing_descriptions_${propertyId}`);
            if (storedDesc) {
                try {
                    const allDesc = JSON.parse(storedDesc);
                    return allDesc[currentLang] || allDesc['en'] || description;
                } catch {
                    return description;
                }
            }
        }
        return description;
    });

    // Translate equipment names
    translateEquipment(name: string): string {
        const translations: Record<string, Record<string, string>> = {
            'Wifi': { en: 'Wifi', es: 'Wi-Fi', fr: 'Wifi' },
            'Wifi rapide': { en: 'Fast Wifi', es: 'Wi-Fi rápido', fr: 'Wifi rapide' },
            'Climatisation': { en: 'Air conditioning', es: 'Aire acondicionado', fr: 'Climatisation' },
            'Chauffage': { en: 'Heating', es: 'Calefacción', fr: 'Chauffage' },
            'Cuisine équipée': { en: 'Equipped kitchen', es: 'Cocina equipada', fr: 'Cuisine équipée' },
            'Lave-linge': { en: 'Washing machine', es: 'Lavadora', fr: 'Lave-linge' },
            'Sèche-linge': { en: 'Dryer', es: 'Secadora', fr: 'Sèche-linge' },
            'TV': { en: 'TV', es: 'TV', fr: 'TV' },
            'Lave-vaisselle': { en: 'Dishwasher', es: 'Lavavajillas', fr: 'Lave-vaisselle' },
            'Four': { en: 'Oven', es: 'Horno', fr: 'Four' },
            'Micro-ondes': { en: 'Microwave', es: 'Microondas', fr: 'Micro-ondes' },
            'Réfrigérateur': { en: 'Refrigerator', es: 'Refrigerador', fr: 'Réfrigérateur' },
            'Congélateur': { en: 'Freezer', es: 'Congelador', fr: 'Congélateur' },
            'Cafetière': { en: 'Coffee maker', es: 'Cafetera', fr: 'Cafetière' },
            'Grille-pain': { en: 'Toaster', es: 'Tostadora', fr: 'Grille-pain' },
            'Bouilloire': { en: 'Kettle', es: 'Hervidor', fr: 'Bouilloire' },
            'Fer à repasser': { en: 'Iron', es: 'Plancha', fr: 'Fer à repasser' },
            'Sèche-cheveux': { en: 'Hair dryer', es: 'Secador de pelo', fr: 'Sèche-cheveux' },
            'Shampoing': { en: 'Shampoo', es: 'Champú', fr: 'Shampoing' },
            'Gel douche': { en: 'Body wash', es: 'Gel de baño', fr: 'Gel douche' },
            'Serviettes': { en: 'Towels', es: 'Toallas', fr: 'Serviettes' },
            'Draps': { en: 'Bed sheets', es: 'Sábanas', fr: 'Draps' },
            'Parking': { en: 'Parking', es: 'Aparcamiento', fr: 'Parking' },
            'Parking gratuit': { en: 'Free parking', es: 'Aparcamiento gratuito', fr: 'Parking gratuit' },
            'Piscine': { en: 'Pool', es: 'Piscina', fr: 'Piscine' },
            'Jardin': { en: 'Garden', es: 'Jardín', fr: 'Jardin' },
            'Terrasse': { en: 'Terrace', es: 'Terraza', fr: 'Terrasse' },
            'Balcon': { en: 'Balcony', es: 'Balcón', fr: 'Balcon' },
            'Barbecue': { en: 'BBQ', es: 'Barbacoa', fr: 'Barbecue' },
            'Cheminée': { en: 'Fireplace', es: 'Chimenea', fr: 'Cheminée' },
            'Bureau': { en: 'Workspace', es: 'Espacio de trabajo', fr: 'Bureau' },
            'Ascenseur': { en: 'Elevator', es: 'Ascensor', fr: 'Ascenseur' },
            'Accessible PMR': { en: 'Wheelchair accessible', es: 'Accesible en silla', fr: 'Accessible PMR' },
        };
        
        const lang = this.translate.currentLang() || 'fr';
        return translations[name]?.[lang] || name;
    }
}
