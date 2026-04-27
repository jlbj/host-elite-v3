import { Injectable, inject, signal, computed, effect, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { HostRepository } from '../../../services/host-repository.service';
import { WidgetService } from '../../../services/widget.service';
import { TranslationService } from '../../../services/translation.service';
import { SessionStore } from '../../../state/session.store';
import { BookletSection, WidgetDisplayData, CONTROL_LABELS, SECTIONS_CONFIG, WIDGET_DEFINITIONS, MicrositeConfig, resolveMicrositeConfig, FaqItem } from './booklet-definitions';
import { Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class WelcomeBookletService implements OnDestroy {
    repository = inject(HostRepository);
    widgetService = inject(WidgetService);
    store = inject(SessionStore);
    fb = inject(FormBuilder);
    sanitizer = inject(DomSanitizer);
    translationService = inject(TranslationService);

    editorForm: FormGroup;
    propertyId = signal<string | null>(null);
    propertyName = signal<string>('');

    // State
    activeTab = signal<'edit' | 'listing' | 'microsite' | 'booklet'>('edit');
    listingEditorTitle = signal<string>('');
    listingEditorStyle = signal<any>({});
    isLoading = signal(false);
    saveMessage = signal<string | null>(null);

    // Data
    availableCategories = signal<string[]>(['Living Room', 'Kitchen', 'Bedroom 1', 'Bedroom 2', 'Bathroom', 'Outdoor', 'Pool', 'Other']);
    activeWidgets = signal<Record<string, boolean>>({});
    propertyPhotos = signal<{ url: string, category: string }[]>([]);
    propertyEquipments = signal<string[]>([]);

    // FAQ Signal (derived from form)
    faqItems = signal<FaqItem[]>([]);

    // Initialize with a resolved default config
    micrositeConfig = signal<MicrositeConfig>(resolveMicrositeConfig({}, null));

    sections: BookletSection[] = SECTIONS_CONFIG.map(s => ({
        ...s,
        icon: this.sanitizer.bypassSecurityTrustHtml(s.iconSource!)
    }));

    widgetData = signal<Record<string, WidgetDisplayData>>({
        'weather': { value: '--' },
        'air-quality': { value: '--' },
        'uv-index': { value: '--' },
        'tides': { value: 'Voir horaires' },
        'avalanche-risk': { value: 'Voir bulletin' },
        'pharmacy': { value: 'Voir à proximité' },
        'local-events': { value: 'Agenda local' },
        'public-transport': { value: 'Itinéraires' },
        'currency-converter': { value: '--' },
    });

    private refreshInterval: any;
    private addressSub: Subscription | undefined;

    constructor() {
        this.editorForm = this.initForm();

        effect(() => {
            const name = this.propertyName();
            if (name) this.loadData(name);
        });

        this.refreshInterval = setInterval(() => this.refreshRealWidgetData(), 3600000);
    }

    ngOnDestroy() {
        clearInterval(this.refreshInterval);
        this.addressSub?.unsubscribe();
    }

    initForm(): FormGroup {
        const togglesGroup: { [key: string]: any } = {};
        this.sections.forEach(s => togglesGroup[s.id] = [true]);

        const form = this.fb.group({
            coverImageUrl: ['https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=2070&auto=format&fit=crop'],
            address: [''],
            gpsCoordinates: [''],
            photos: this.fb.array([]),
            faq: this.fb.array([]), // Init FAQ Array
            toggles: this.fb.group(togglesGroup)
        });

        SECTIONS_CONFIG.forEach(section => {
            const fields = CONTROL_LABELS[section.formGroupName];
            if (fields) {
                const group: any = {};
                for (const key in fields) {
                    group[key] = [''];
                    group[key + '_pdf'] = [''];
                }
                (form as FormGroup).addControl(section.formGroupName, this.fb.group(group));
            }
        });

        // Address change listener
        this.addressSub = form.get('address')?.valueChanges.pipe(
            debounceTime(1500), distinctUntilChanged(), filter(v => v && v.length > 5)
        ).subscribe(() => this.refreshRealWidgetData());

        return form;
    }

    async loadData(name: string) {
        this.isLoading.set(true);
        let defaults: any = { welcome: {} }; // Init Empty
        try {
            const prop = await this.repository.getPropertyByName(name);
            const booklet = await this.repository.getBooklet(name);

            if (prop) {
                console.log('[WelcomeBookletService] Loaded Property Data:', prop);
                this.propertyId.set(prop.id);
                if (prop.property_equipments) this.propertyEquipments.set(prop.property_equipments.map((e: any) => e.name));

                // Photos
                const pArray = this.editorForm.get('photos') as FormArray;
                pArray.clear();
                if (prop.property_photos?.length) {
                    this.propertyPhotos.set(prop.property_photos);
                    prop.property_photos.forEach((p: any) => pArray.push(this.fb.group({ url: [p.url], category: [p.category] })));
                }

                // Init Form basic data
                // MAPPING: DB (French) -> Form (English)
                defaults = {
                    address: prop.address || '',
                    propertyDetails: {
                        property_type: prop.property_type || '',
                        rooms: prop.rooms || '',
                        bedrooms: prop.bedrooms || '',
                        bathrooms: prop.bathrooms || '',
                        surface_area: prop.surface_area || '',
                        max_guests: prop.max_guests || '',
                        bed_count: prop.bed_count || '',
                    },
                    welcome: {
                        welcomeMessage: prop.listing_description || '',
                        hostContact: prop.cleaning_contact_info || '',
                        emergencyContact: prop.emergency_contact_info || ''
                    },
                    systems: { wifi: prop.wifi_code ? `Wi-Fi Code: ${prop.wifi_code}` : '' },
                    arrival: { 
                        arrivalInstructions: prop.arrival_instructions || '',
                        keyRetrieval: prop.arrival_instructions || ''
                    },
                    rules: { quietHours: prop.house_rules_text || '', keyManagement: prop.arrival_instructions || '' }
                };
                if (prop.cover_image_url) defaults.coverImageUrl = prop.cover_image_url;

                console.log('[WelcomeBookletService] Patching Defaults:', defaults.welcome);
                this.editorForm.patchValue(defaults);
            }

            let savedConfig = null;
            if (booklet) {
                if (booklet.widgets) this.activeWidgets.set(booklet.widgets);

                // Parse config but don't set signal yet
                if (booklet.microsite_config) {
                    savedConfig = typeof booklet.microsite_config === 'string' ? JSON.parse(booklet.microsite_config) : booklet.microsite_config;
                }

                // MIGRATION: Convert Legacy "bienvenue" to New "welcome"
                if (booklet.bienvenue && !booklet.welcome) {
                    booklet.welcome = {
                        welcomeMessage: booklet.bienvenue.messageBienvenue,
                        hostContact: booklet.bienvenue.coordonneesHote,
                        emergencyContact: booklet.bienvenue.numeroUrgenceHote,
                        // ... map other fields if needed
                    };
                }

                if (booklet.welcome) {
                    defaults.welcome = {
                        welcomeMessage: booklet.welcome.welcomeMessage ?? defaults.welcome.welcomeMessage,
                        hostContact: booklet.welcome.hostContact,
                        emergencyContact: booklet.welcome.emergencyContact
                    };
                }

                console.log('[WelcomeBookletService] Patching Booklet Data:', booklet.welcome);

                // Load FAQ
                const faqArray = this.editorForm.get('faq') as FormArray;
                faqArray.clear();
                if (booklet.faq) {
                    booklet.faq.forEach((f: FaqItem) => faqArray.push(this.fb.group(f)));
                    this.faqItems.set(booklet.faq);
                }

                this.editorForm.patchValue(this.removeEmpty(booklet));
                if (booklet.gpsCoordinates) this.editorForm.patchValue({ gpsCoordinates: booklet.gpsCoordinates });
            }

            // Resolve Config using the fully patched form data (Smart Default or Saved)
            const resolved = resolveMicrositeConfig(this.editorForm.value, savedConfig);
            this.micrositeConfig.set(resolved);

            const cats = await this.repository.getPropertyCategories(name);
            if (cats?.length) this.availableCategories.set(cats);

            this.refreshRealWidgetData();
        } catch (e) { console.error(e); } finally { this.isLoading.set(false); }
    }

    generateFaqsWithAI() {
        this.isLoading.set(true);
        setTimeout(() => {
            const formVal = this.editorForm.value;
            const address = formVal.address || 'votre location';
            const wifi = formVal.systems?.wifi || 'Non spécifié';
            const checkin = formVal.rules?.keyManagement || '15h';
            const checkout = formVal.departure?.checkoutTime || '11h';

            const newFaqs: FaqItem[] = [
                {
                    question: "Quel est le code Wi-Fi ?",
                    answer: wifi.includes('Code') ? wifi : `Le code Wi-Fi est : ${wifi}`,
                    visible: true
                },
                {
                    question: "À quelle heure est l'arrivée et le départ ?",
                    answer: `L'arrivée se fait à partir de ${checkin} et le départ avant ${checkout}.`,
                    visible: true
                },
                {
                    question: "Où se garer ?",
                    answer: "Vous pouvez vous garer gratuitement dans la rue ou sur la place indiquée dans le guide.",
                    visible: true
                },
                {
                    question: "Comment fonctionne la machine à café ?",
                    answer: "Il y a une machine Nespresso. Des capsules de bienvenue sont fournies.",
                    visible: true
                },
                {
                    question: "Où sont les poubelles ?",
                    answer: "Les poubelles de tri se trouvent sous l'évier. Le local poubelle est à l'extérieur.",
                    visible: true
                }
            ];

            const faqArray = this.editorForm.get('faq') as FormArray;
            faqArray.clear();
            newFaqs.forEach(f => faqArray.push(this.fb.group(f)));
            this.faqItems.set(newFaqs);

            this.isLoading.set(false);
            this.saveMessage.set("BOOKLET.faq_generated");
            setTimeout(() => this.saveMessage.set(null), 3000);
        }, 1500);
    }

    async save() {
        if (!this.editorForm.valid) return;
        try {
            await this.repository.saveBooklet(this.propertyName(), {
                ...this.editorForm.value,
                microsite_config: JSON.stringify(this.micrositeConfig())
            });
            await this.repository.savePropertyCategories(this.propertyName(), this.availableCategories());
            if (this.propertyId()) {
                const photos = this.editorForm.value.photos;
                await this.repository.savePropertyPhotos(this.propertyId()!, photos);
                this.propertyPhotos.set(photos.filter((p: any) => p.url));
                await this.repository.updatePropertyData(this.propertyId()!, {
                    propertyDetails: this.editorForm.value.propertyDetails
                });
            }
            this.saveMessage.set(this.translationService.translate('COMMON.Saved'));
            setTimeout(() => this.saveMessage.set(null), 3000);
            this.refreshRealWidgetData();
        } catch (e) {
            console.error(e);
            alert(this.translationService.translate('COMMON.ErrorSaving') || "Error saving");
        }
    }

    async refreshRealWidgetData() {
        const address = this.editorForm.get('address')?.value;
        if (!address || address.length < 5) return;

        // Set loading...
        this.widgetData.update(c => ({ ...c, 'weather': { value: '...' }, 'air-quality': { value: '...' } }));

        const coords = await this.widgetService.getCoordinates(address);
        if (!coords) return;

        if (!this.editorForm.get('gpsCoordinates')?.value) {
            this.editorForm.patchValue({ gpsCoordinates: `https://www.google.com/maps?q=${coords.lat},${coords.lon}` });
        }

        const [weather, air, rate] = await Promise.all([
            this.widgetService.getWeatherData(coords.lat, coords.lon),
            this.widgetService.getAirQuality(coords.lat, coords.lon),
            this.widgetService.getExchangeRate('EUR', 'USD')
        ]);

        this.widgetData.update(current => {
            const updated = { ...current };
            const encodedAddress = encodeURIComponent(address);

            if (weather) {
                const temp = weather.temperature_2m;
                const desc = this.widgetService.getWeatherDescription(weather.weather_code);
                updated['weather'] = { value: `${temp}°C ${desc}` };
                updated['uv-index'] = { value: weather.uv_index ? `${weather.uv_index}` : this.translationService.translate('WIDGET.uv_low') };
            } else {
                updated['weather'] = { value: this.translationService.translate('COMMON.Unavailable') };
            }

            if (air) {
                updated['air-quality'] = { value: `${air} AQI ${this.widgetService.getAirQualityLabel(air)}` };
            } else {
                updated['air-quality'] = { value: '--' };
            }

            if (rate) {
                updated['currency-converter'] = { value: `1€ = $${rate.toFixed(2)}` };
            } else {
                updated['currency-converter'] = { value: '--' };
            }

            updated['pharmacy'] = { value: this.translationService.translate('WIDGET.pharmacy_nearby'), link: `https://www.google.com/maps/search/pharmacie+near+${encodedAddress}` };
            updated['public-transport'] = { value: this.translationService.translate('WIDGET.transport_routes'), link: `https://www.google.com/maps/search/bus+metro+station+near+${encodedAddress}` };
            updated['local-events'] = { value: this.translationService.translate('WIDGET.events_outings'), link: `https://www.google.com/search?q=evenements+aujourd'hui+near+${encodedAddress}` };
            updated['tides'] = { value: this.translationService.translate('WIDGET.tide_times'), link: `https://www.google.com/search?q=marees+${encodedAddress}` };
            updated['avalanche-risk'] = { value: this.translationService.translate('WIDGET.avalanche_bulletin'), link: `https://www.google.com/search?q=risque+avalanche+${encodedAddress}` };

            return updated;
        });
    }

    removeEmpty(obj: any): any {
        if (typeof obj !== 'object' || obj === null) return obj;
        if (Array.isArray(obj)) return obj.map(v => this.removeEmpty(v));
        const newObj: any = {};
        for (const key in obj) {
            const val = obj[key];
            if (typeof val === 'object' && val !== null) {
                const cleanVal = this.removeEmpty(val);
                if (Object.keys(cleanVal).length > 0) newObj[key] = cleanVal;
            } else if (val !== '' && val !== null && val !== undefined) {
                newObj[key] = val;
            }
        }
        return newObj;
    }
}
// forcing reload
