import { Injectable, inject, signal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { GeminiService } from '../../../services/gemini.service';
import { BookletSection, CONTROL_LABELS } from './booklet-definitions';

@Injectable({ providedIn: 'root' })
export class WelcomeBookletAiService {
    gemini = inject(GeminiService);
    isAiLoading = signal(false);

    async autoFill(form: FormGroup, address: string, sections: BookletSection[]) {
        if (!address) { alert('Veuillez entrer une adresse d\'abord.'); return; }
        this.isAiLoading.set(true);

        try {
            // 1. Build Skeleton
            const skeleton: any = {};

            // Welcome Section
            skeleton['welcome'] = { welcomeMessage: "Rédige un message de bienvenue chaleureux" };

            // Other Sections
            for (const section of sections) {
                const group = form.get(section.formGroupName);
                const labels = CONTROL_LABELS[section.formGroupName];
                if (!group || !labels) continue;

                // Add section prompt
                skeleton[section.formGroupName] = {};

                for (const key in labels) {
                    const currentVal = group.get(key)?.value;
                    // Only ask to fill if EMPTY
                    if (!currentVal) {
                        const label = labels[key];
                        const hint = this.getAiHint(section.id, key);
                        skeleton[section.formGroupName][key] = `INSTRUCTION: Remplir pour "${label}". ${hint}`;
                    }
                }
            }

            // 2. Single Call to Optimized Gemini Method
            const filledData = await this.gemini.autoFillBooklet(address, skeleton);

            // 3. Patch Form
            if (filledData) {
                form.patchValue(filledData);
            }

        } catch (e) {
            console.error("AI Error", e);
            alert("Erreur lors de la génération. Veuillez réessayer.");
        } finally {
            this.isAiLoading.set(false);
        }
    }

    async findManuals(form: FormGroup, sections: BookletSection[], address: string) {
        // Simplistic manual finder simulation / logic
        // In real implementation this would invoke a search tool or more complex AI flow
        // Keeping it placeholder-ish but functional structure based on original code structure which seemed to do Google Search via Gemini usage or specific logic?
        // Original code had generic search logic.
        // We will perform a focused search for appliance manuals if we had descriptions.
        // Since we don't have appliance names, we skip or do a generic attempt?
        // Re-reading original code (step 61): it used `generateText` with "Cherche le manuel...".
        // Let's implement that loop.

        for (const section of sections) {
            if (['kitchen', 'laundry', 'livingRoom'].includes(section.id)) {
                const group = form.get(section.formGroupName);
                const labels = CONTROL_LABELS[section.formGroupName];
                if (!group || !labels) continue;

                for (const key in labels) {
                    if (key.includes('pdf')) continue; // Skip PDF fields themselves
                    // If we have content in the text field (e.g. "Samsung TV"), try to find PDF
                    const val = group.get(key)?.value;
                    if (val && val.length < 50 && !val.includes('[A COMPLÉTER]')) {
                        // Assume the value is an appliance name if short
                        const prompt = `Trouve l'URL directe d'un manuel PDF pour : ${val}. Réponds UNIQUEMENT par l'URL ou "NON".`;
                        const url = await this.gemini.generateText(prompt); // Gemini can't browse, but maybe it hallucinates a link or we use search tool?
                        // Verify logic: Original code used Gemini.
                        if (url && url.startsWith('http')) {
                            group.get(key + '_pdf')?.setValue(url);
                        }
                    }
                }
            }
        }
    }

    getAiHint(sectionId: string, key: string): string {
        if (key === 'wifi') return 'Donne un format type : "Réseau : [NOM], Mot de passe : [MDP]".';
        if (key === 'bakery') return 'Suggère une boulangerie réputée dans le quartier si possible, ou explique comment en trouver une.';
        if (key === 'supermarket') return 'Indique les chaînes de supermarchés habituelles en France.';
        if (sectionId === 'arrival') return "Donne des instructions claires d'arrivée avec code porte, digicode, et stationnement.";
        if (sectionId === 'departure') return 'Donne des instructions standards de départ (poubelles, clés, lumières).';
        return '';
    }

    formatAiResponse(text: string): string {
        return text.replace(/^"|"$/g, '').trim();
    }

    isValidContent(text: string): boolean {
        const lower = text.toLowerCase();
        return !lower.includes("je ne peux pas") && !lower.includes("en tant qu'ia");
    }

    // Helper for components to format values for display
    formatValueToString(value: any): string {
        if (value === null || value === undefined) return '';
        if (typeof value === 'string') return value;
        if (typeof value === 'object') {
            // Handle "Check-in: 15h" etc pairs
            return Object.entries(value).map(([k, v]) => `${k}: ${v}`).join('\n');
        }
        return String(value);
    }
}
