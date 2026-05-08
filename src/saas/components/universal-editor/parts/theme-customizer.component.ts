import { Component, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgxEditorModule, Editor, TOOLBAR_MINIMAL } from 'ngx-editor';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { EditorTheme, THEME_PRESETS } from '../models/editor-theme';

@Component({
    selector: 'app-theme-customizer',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslatePipe],
    template: `
        <div class="h-full flex flex-col">
            <!-- Theme Presets - large visual cards -->
            <div class="flex-1">
                <h3 class="text-sm font-semibold text-white mb-3">{{ 'EDITOR.ThemePresets' | translate }}</h3>
                <div class="grid grid-cols-2 gap-3">
                    @for (preset of themePresets; track preset.id) {
                        <button 
                            (click)="selectPreset(preset)"
                            class="p-3 rounded-lg border transition-all hover:border-purple-400 text-left"
                            [class.border-purple-500]="currentTheme()?.primaryColor === preset.primaryColor"
                            [class.border-white/10]="currentTheme()?.primaryColor !== preset.primaryColor"
                            [class.bg-white/5]="currentTheme()?.primaryColor !== preset.primaryColor"
                            [style.background-color]="preset.backgroundColor">
                            <div class="flex items-center gap-2 mb-2">
                                <div class="w-3 h-3 rounded-full border border-white/30" [style.background-color]="preset.primaryColor"></div>
                                <div class="w-3 h-3 rounded-full border border-white/30" [style.background-color]="preset.accentColor"></div>
                            </div>
                            <div class="text-xs font-medium" [style.color]="preset.textColor">{{ preset.name }}</div>
                        </button>
                    }
                </div>
            </div>

            <!-- Colors - compact section -->
            <div class="space-y-2 pt-4 border-t border-white/10">
                <div class="flex items-center justify-between">
                    <span class="text-xs text-slate-400">{{ 'EDITOR.PrimaryColor' | translate }}</span>
                    <div class="flex items-center gap-1">
                        <div class="w-4 h-4 rounded border border-white/20" [style.background-color]="currentTheme()?.primaryColor"></div>
                        <input 
                            type="color" 
                            [ngModel]="currentTheme()?.primaryColor"
                            (ngModelChange)="updateTheme('primaryColor', $event)"
                            class="w-5 h-5 rounded cursor-pointer opacity-0 absolute">
                    </div>
                </div>

                <div class="flex items-center justify-between">
                    <span class="text-xs text-slate-400">{{ 'EDITOR.BackgroundColor' | translate }}</span>
                    <div class="flex items-center gap-1">
                        <div class="w-4 h-4 rounded border border-white/20" [style.background-color]="currentTheme()?.backgroundColor"></div>
                        <input 
                            type="color" 
                            [ngModel]="currentTheme()?.backgroundColor"
                            (ngModelChange)="updateTheme('backgroundColor', $event)"
                            class="w-5 h-5 rounded cursor-pointer opacity-0 absolute">
                    </div>
                </div>

                <div class="flex items-center justify-between">
                    <span class="text-xs text-slate-400">{{ 'EDITOR.TextColor' | translate }}</span>
                    <div class="flex items-center gap-1">
                        <div class="w-4 h-4 rounded border border-white/20" [style.background-color]="currentTheme()?.textColor"></div>
                        <input 
                            type="color" 
                            [ngModel]="currentTheme()?.textColor"
                            (ngModelChange)="updateTheme('textColor', $event)"
                            class="w-5 h-5 rounded cursor-pointer opacity-0 absolute">
                    </div>
                </div>

                <div class="flex items-center justify-between">
                    <span class="text-xs text-slate-400">{{ 'EDITOR.AccentColor' | translate }}</span>
                    <div class="flex items-center gap-1">
                        <div class="w-4 h-4 rounded border border-white/20" [style.background-color]="currentTheme()?.accentColor"></div>
                        <input 
                            type="color" 
                            [ngModel]="currentTheme()?.accentColor"
                            (ngModelChange)="updateTheme('accentColor', $event)"
                            class="w-5 h-5 rounded cursor-pointer opacity-0 absolute">
                    </div>
                </div>
            </div>

            <!-- Typography -->
            <div class="space-y-2 pt-4 border-t border-white/10">
                <span class="text-xs text-slate-400">Font</span>
                <select 
                    [ngModel]="currentTheme()?.fontFamily"
                    (ngModelChange)="updateTheme('fontFamily', $event)"
                    class="w-full bg-slate-800 border border-white/10 rounded px-2 py-2 text-sm text-white">
                    <option value="system-ui">System Default</option>
                    <option value="Georgia, serif">Georgia (Serif)</option>
                    <option value="Arial, sans-serif">Arial (Sans)</option>
                    <option value="Helvetica, sans-serif">Helvetica (Sans)</option>
                    <option value="Times New Roman, serif">Times New Roman (Serif)</option>
                    <option value="Verdana, sans-serif">Verdana (Sans)</option>
                    <option value="Courier New, monospace">Courier (Mono)</option>
                    <option value="Palatino, serif">Palatino (Serif)</option>
                    <option value="Trebuchet MS, sans-serif">Trebuchet (Sans)</option>
                    <option value="Lucida Console, monospace">Lucida (Mono)</option>
                </select>
            </div>

            <!-- Style Options -->
            <div class="space-y-2 pt-4 border-t border-white/10">
                <div class="flex gap-1">
                    @for (template of templates; track template.value) {
                        <button 
                            (click)="updateTheme('template', template.value)"
                            class="flex-1 py-2 rounded text-sm transition-all"
                            [class.bg-purple-500]="currentTheme()?.template === template.value"
                            [class.text-white]="currentTheme()?.template === template.value"
                            [class.bg-slate-800]="currentTheme()?.template !== template.value"
                            [class.text-slate-300]="currentTheme()?.template !== template.value">
                            {{ template.label | translate }}
                        </button>
                    }
                </div>

                <div class="flex gap-1">
                    @for (style of buttonStyles; track style.value) {
                        <button 
                            (click)="updateTheme('buttonStyle', style.value)"
                            class="flex-1 py-2 rounded text-sm transition-all"
                            [class.bg-purple-500]="currentTheme()?.buttonStyle === style.value"
                            [class.text-white]="currentTheme()?.buttonStyle === style.value"
                            [class.bg-slate-800]="currentTheme()?.buttonStyle !== style.value"
                            [class.text-slate-300]="currentTheme()?.buttonStyle !== style.value"
                            [style.border-radius]="getButtonRadius(style.value)">
                            {{ style.label }}
                        </button>
                    }
                </div>

                <div class="flex gap-1">
                    @for (spacing of spacings; track spacing.value) {
                        <button 
                            (click)="updateTheme('spacing', spacing.value)"
                            class="flex-1 py-2 rounded text-sm transition-all"
                            [class.bg-purple-500]="currentTheme()?.spacing === spacing.value"
                            [class.text-white]="currentTheme()?.spacing === spacing.value"
                            [class.bg-slate-800]="currentTheme()?.spacing !== spacing.value"
                            [class.text-slate-300]="currentTheme()?.spacing !== spacing.value">
                            {{ spacing.label | translate }}
                        </button>
                    }
                </div>
            </div>
        </div>
    `,
    styles: [`
        :host { display: block; }
    `]
})
export class ThemeCustomizerComponent {
    currentTheme = input<EditorTheme | null>(null);
    themeChanged = output<EditorTheme>();

    readonly themePresets = THEME_PRESETS;
    
    readonly fontSizes = [
        { value: 'sm', label: 'Small', preview: '12px' },
        { value: 'md', label: 'Medium', preview: '16px' },
        { value: 'lg', label: 'Large', preview: '18px' },
        { value: 'xl', label: 'Extra Large', preview: '20px' }
    ];

    readonly templates = [
        { value: 'modern', label: 'EDITOR.TemplateModern' },
        { value: 'classic', label: 'EDITOR.TemplateClassic' },
        { value: 'minimal', label: 'EDITOR.TemplateMinimal' },
        { value: 'luxury', label: 'EDITOR.TemplateLuxury' },
        { value: 'cozy', label: 'EDITOR.TemplateCozy' }
    ];

    readonly buttonStyles = [
        { value: 'rounded', label: 'Rounded' },
        { value: 'sharp', label: 'Sharp' },
        { value: 'pill', label: 'Pill' }
    ];

    readonly spacings = [
        { value: 'compact', label: 'EDITOR.Compact' },
        { value: 'normal', label: 'EDITOR.Normal' },
        { value: 'spacious', label: 'EDITOR.Spacious' }
    ];

    updateTheme<K extends keyof EditorTheme>(key: K, value: EditorTheme[K]) {
        const current = this.currentTheme();
        if (current) {
            this.themeChanged.emit({ ...current, [key]: value });
        }
    }

    selectPreset(preset: EditorTheme) {
        this.themeChanged.emit(preset);
    }

    getButtonRadius(style: string): string {
        switch (style) {
            case 'rounded': return '0.375rem';
            case 'sharp': return '0';
            case 'pill': return '9999px';
            default: return '0.375rem';
        }
    }
}
