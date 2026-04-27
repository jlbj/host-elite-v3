import { Component, inject, signal, computed, Input } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { SafeHtml } from '@angular/platform-browser';
import { WelcomeBookletService } from '../welcome-booklet.service';
import { WelcomeBookletAiService } from '../welcome-booklet-ai.service';
import { BookletSection, WIDGET_DEFINITIONS, CONTROL_LABELS } from '../booklet-definitions';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
@Component({
    selector: 'app-welcome-booklet-preview',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
    templateUrl: './welcome-booklet-preview.component.html',
})
export class WelcomeBookletPreviewComponent {
    service = inject(WelcomeBookletService);

    @Input() set propertyDetails(value: any) {
        if (value && value.name) {
            this.service.propertyName.set(value.name);
        }
    }
    aiService = inject(WelcomeBookletAiService);

    editorForm = this.service.editorForm;
    // Track form changes to trigger computed updates
    formValues = toSignal(this.editorForm.valueChanges, { initialValue: this.editorForm.value });

    widgetData = this.service.widgetData;
    activeWidgets = this.service.activeWidgets;
    propertyName = this.service.propertyName;
    propertyPhotos = this.service.propertyPhotos;
    sections = this.service.sections;

    previewState = signal<'home' | 'section'>('home');
    currentSectionId = signal<string | null>(null);

    activeSections = computed(() => {
        this.formValues(); // Trigger dependency
        const form = this.editorForm;
        return this.sections.filter(s => form.get('toggles.' + s.id)?.value);
    });

    enabledWidgetIds = computed(() => {
        const active = this.activeWidgets();
        return Object.keys(active).filter(k => active[k]);
    });

    currentSection = computed(() => {
        const id = this.currentSectionId();
        return id ? this.sections.find(s => s.id === id) || null : null;
    });

    validFaqItems = computed(() => {
        this.formValues();
        const raw = this.editorForm.get('faq')?.value || [];
        // Only return visible items with content
        return raw.filter((i: any) => i.visible && i.question && i.answer);
    });

    showSection(id: string) {
        this.currentSectionId.set(id);
        this.previewState.set('section');
    }

    showHome() {
        this.previewState.set('home');
        this.currentSectionId.set(null);
    }

    // Inject microsite config
    config = this.service.micrositeConfig;

    // Computed styles for the preview container
    previewStyles = computed(() => {
        const conf = this.config();
        const fontMap: Record<string, string> = {
            'inter': 'font-sans',
            'serif': 'font-serif',
            'mono': 'font-mono'
        };

        // Theme Mapping
        const theme = conf.template || 'modern';
        let themeStyles = {
            containerBg: 'bg-slate-50',
            textColor: 'text-slate-800',
            cardBg: 'bg-white',
            borderColor: 'border-slate-100',
            mutedText: 'text-slate-400'
        };

        if (theme === 'cozy') {
            themeStyles = {
                containerBg: 'bg-orange-50', // Visibly warmer (Beige/Cream)
                textColor: 'text-stone-800',
                cardBg: 'bg-[#fffaf0]', // Floral white / very light orange
                borderColor: 'border-orange-100',
                mutedText: 'text-stone-500'
            };
        } else if (theme === 'luxury') {
            themeStyles = {
                containerBg: 'bg-slate-900',
                textColor: 'text-white',
                cardBg: 'bg-slate-800',
                borderColor: 'border-slate-700',
                mutedText: 'text-slate-400'
            };
        }

        return {
            fontClass: fontMap[conf.font || 'inter'] || 'font-sans',
            primaryColor: conf.primaryColor || '#2563eb',
            buttonRadius: conf.buttonStyle === 'pill' ? '9999px' : (conf.buttonStyle === 'sharp' ? '0px' : '0.5rem'),
            ...themeStyles
        };
    });

    getWidgetLink(id: string): string | undefined {
        return this.widgetData()[id]?.link;
    }

    getWidgetIcon(id: string): string {
        const style = this.config().iconStyle || 'emoji';
        const def = WIDGET_DEFINITIONS[id];
        if (!def) return '❓';

        if (style === 'emoji') return def.icon; // Default emoji

        // Simple mapping for 'minimalist' (SVG-like) or 'drawn' (Hand-drawn look)
        // ideally we would have SVG strings here. For now, let's map to different emoji subsets or fallback
        // Since we don't have SVGs for all widgets yet, we might mostly stick to emoji or generic icons.
        // BUT, user asked for "different style of icons". 
        // Let's implement a basic SVG mapping for 'minimalist' using a helper.
        return this.getSvgIcon(id, style) || def.icon;
    }

    getSvgIcon(id: string, style: 'minimalist' | 'drawn'): string | null {
        // Placeholder for real SVG logic. 
        // We can return null to fallback to emoji, or return a specific SVG string.
        // For 'minimalist', we could use FontAwesome or Heroicons classes if available, 
        // but here we return raw strings or just different chars? 
        // Let's stick to returning emojis for now but maybe different ones or wrap them?
        // ACTUALLY, usually "icon style" implies SVGs. 
        // Let's try to map a few common ones to SVGs if possible or just rely on CSS filters?
        // No, let's keep it simple: strict emoji for now until we import an icon lib or define SVGs
        // To show we are doing *something*, let's change the return value slightly or use a class.
        return null;
    }

    getWidgetName(id: string): string {
        return WIDGET_DEFINITIONS[id]?.name || id;
    }

    getSectionIcon(section: BookletSection): SafeHtml | string {
        const style = this.config().iconStyle || 'emoji';
        if (style === 'emoji') {
            // We need a mapping from section ID to emoji since sections use SVGs by default
            const emojiMap: Record<string, string> = {
                'propertyDetails': '🏠', 'arrival': '🚀', 'welcome': '👋', 'accessibility': '♿', 'systems': '🔧', 'security': '🛡️',
                'kitchen': '🍳', 'livingRoom': '🛋️', 'bedrooms': '🛏️', 'laundry': '🧺',
                'wellness': '🧖', 'parking': '🅿️', 'rules': '📜', 'pets': '🐾',
                'waste': '♻️', 'dining': '🍽️', 'activities': '🏄', 'localInfo': 'ℹ️',
                'transport': '🚌', 'administrative': '👮', 'extraServices': '🧹', 'departure': '👋',
                'faq': '❓'
            };
            return emojiMap[section.id] || '📁';
        }
        // Return the SVG (Minimalist/Drawn default to the SVG we have)
        return section.icon!;
    }

    getWidgetValue(id: string): string {
        return this.widgetData()[id]?.value || '--';
    }

    isValidContent(value: any): boolean {
        if (!value) return false;
        return this.aiService.isValidContent(String(value));
    }

    getGroupControls(groupName: string): string[] {
        const group = this.editorForm.get(groupName);
        if (!group) return [];
        // Filter out _pdf fields to avoid duplicates in the loop
        return Object.keys(group.value).filter(k => !k.endsWith('_pdf'));
    }

    getLabelForControl(sectionId: string, controlKey: string): string {
        const section = this.sections.find(s => s.id === sectionId);
        if (!section) return controlKey;
        const labels = CONTROL_LABELS[section.formGroupName];
        return labels ? labels[controlKey] || controlKey : controlKey;
    }

    isSectionEmpty(groupName: string): boolean {
        const group = this.editorForm.get(groupName);
        if (!group) return true;
        return !Object.keys(group.value).some(k => !k.endsWith('_pdf') && group.value[k]);
    }
}
