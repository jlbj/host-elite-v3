import { Injectable, signal } from '@angular/core';
import { fr } from './translations/fr';
import { en } from './translations/en';
import { es } from './translations/es';

export type Language = 'en' | 'fr' | 'es';

@Injectable({
    providedIn: 'root'
})
export class TranslationService {
    currentLang = signal<Language>('en');

    private dictionaries: Record<Language, Record<string, string>> = {
        'fr': fr,
        'en': en,
        'es': es
    };

    setLanguage(lang: Language) {
        this.currentLang.set(lang);
    }

    translate(key: string, params?: Record<string, string | number>): string {
        const lang = this.currentLang();
        const dict = this.dictionaries[lang] || this.dictionaries['en'];
        let translation = dict[key] || key;

        if (params && translation) {
            Object.entries(params).forEach(([paramKey, paramValue]) => {
                translation = translation.replace(new RegExp(`{{${paramKey}}}`, 'g'), String(paramValue));
            });
        }
        return translation;
    }

    instant(key: string, params?: Record<string, string | number>): string {
        return this.translate(key, params);
    }

    // Debug Support
    debugMode = signal(false); // Forced true for dev

    toggleDebugMode() {
        const newValue = !this.debugMode();
        this.debugMode.set(newValue);
        localStorage.setItem('debug_show_tags', String(newValue));
    }

    getKeysForValue(text: string): string[] {
        if (!text) return [];
        const lang = this.currentLang();
        const dict = this.dictionaries[lang] || this.dictionaries['en'];

        // Normalize text (trim, remove extra spaces) to improve matching
        const normalizedText = text.trim();

        // Reverse lookup
        return Object.entries(dict)
            .filter(([_, value]) => value === normalizedText) // Exact match for now
            .map(([key]) => key);
    }
}
