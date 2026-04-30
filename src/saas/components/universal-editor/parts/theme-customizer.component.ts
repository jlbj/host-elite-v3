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
        <div class="space-y-6">
            <div>
                <h3 class="text-lg font-bold text-white mb-3">{{ 'EDITOR.ThemePresets' | translate }}</h3>
                <div class="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    @for (preset of themePresets; track preset.id) {
                        <button 
                            (click)="selectPreset(preset)"
                            class="p-3 rounded-lg border-2 transition-all hover:scale-105"
                            [class.border-purple-500]="currentTheme()?.primaryColor === preset.primaryColor"
                            [class.border-white/10]="currentTheme()?.primaryColor !== preset.primaryColor"
                            [style.background-color]="preset.backgroundColor">
                            <div class="text-xs font-medium" [style.color]="preset.textColor">{{ preset.name }}</div>
                            <div class="flex gap-1 mt-1">
                                <div class="w-4 h-4 rounded-full border border-white/20" [style.background-color]="preset.primaryColor"></div>
                                <div class="w-4 h-4 rounded-full border border-white/20" [style.background-color]="preset.accentColor"></div>
                            </div>
                        </button>
                    }
                </div>
            </div>

            <div class="border-t border-white/10 pt-6">
                <h3 class="text-lg font-bold text-white mb-4">{{ 'EDITOR.CustomizeTheme' | translate }}</h3>
                
                <!-- Colors -->
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-300 mb-2">{{ 'EDITOR.PrimaryColor' | translate }}</label>
                        <div class="flex items-center gap-2">
                            <input 
                                type="color" 
                                [ngModel]="currentTheme()?.primaryColor"
                                (ngModelChange)="updateTheme('primaryColor', $event)"
                                class="w-10 h-10 rounded cursor-pointer border-2 border-white/20">
                            <input 
                                type="text" 
                                [ngModel]="currentTheme()?.primaryColor"
                                (ngModelChange)="updateTheme('primaryColor', $event)"
                                class="flex-1 bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm font-mono">
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-slate-300 mb-2">{{ 'EDITOR.BackgroundColor' | translate }}</label>
                        <div class="flex items-center gap-2">
                            <input 
                                type="color" 
                                [ngModel]="currentTheme()?.backgroundColor"
                                (ngModelChange)="updateTheme('backgroundColor', $event)"
                                class="w-10 h-10 rounded cursor-pointer border-2 border-white/20">
                            <input 
                                type="text" 
                                [ngModel]="currentTheme()?.backgroundColor"
                                (ngModelChange)="updateTheme('backgroundColor', $event)"
                                class="flex-1 bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm font-mono">
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-slate-300 mb-2">{{ 'EDITOR.TextColor' | translate }}</label>
                        <div class="flex items-center gap-2">
                            <input 
                                type="color" 
                                [ngModel]="currentTheme()?.textColor"
                                (ngModelChange)="updateTheme('textColor', $event)"
                                class="w-10 h-10 rounded cursor-pointer border-2 border-white/20">
                            <input 
                                type="text" 
                                [ngModel]="currentTheme()?.textColor"
                                (ngModelChange)="updateTheme('textColor', $event)"
                                class="flex-1 bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm font-mono">
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-slate-300 mb-2">{{ 'EDITOR.AccentColor' | translate }}</label>
                        <div class="flex items-center gap-2">
                            <input 
                                type="color" 
                                [ngModel]="currentTheme()?.accentColor"
                                (ngModelChange)="updateTheme('accentColor', $event)"
                                class="w-10 h-10 rounded cursor-pointer border-2 border-white/20">
                            <input 
                                type="text" 
                                [ngModel]="currentTheme()?.accentColor"
                                (ngModelChange)="updateTheme('accentColor', $event)"
                                class="flex-1 bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm font-mono">
                        </div>
                    </div>
                </div>

                <!-- Typography -->
                <div class="border-t border-white/10 pt-4 mt-4 space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-300 mb-2">{{ 'EDITOR.FontFamily' | translate }}</label>
                        <select 
                            [ngModel]="currentTheme()?.fontFamily"
                            (ngModelChange)="updateTheme('fontFamily', $event)"
                            class="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm">
                            <option value="system-ui">System Default</option>
                            <option value="Georgia, serif">Georgia</option>
                            <option value="Arial, sans-serif">Arial</option>
                            <option value="Helvetica, sans-serif">Helvetica</option>
                            <option value="Times New Roman, serif">Times New Roman</option>
                            <option value="Verdana, sans-serif">Verdana</option>
                            <option value="Courier New, monospace">Courier New</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-slate-300 mb-2">{{ 'EDITOR.FontHeading' | translate }}</label>
                        <select 
                            [ngModel]="currentTheme()?.fontHeading"
                            (ngModelChange)="updateTheme('fontHeading', $event)"
                            class="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm">
                            <option value="system-ui">System Default</option>
                            <option value="Georgia, serif">Georgia</option>
                            <option value="Arial, sans-serif">Arial</option>
                            <option value="Helvetica, sans-serif">Helvetica</option>
                            <option value="Times New Roman, serif">Times New Roman</option>
                            <option value="Verdana, sans-serif">Verdana</option>
                        </select>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-slate-300 mb-2">{{ 'EDITOR.FontSize' | translate }}</label>
                        <div class="flex gap-2">
                            @for (size of fontSizes; track size.value) {
                                <button 
                                    (click)="updateTheme('fontSize', size.value)"
                                    class="flex-1 py-2 rounded border transition-all"
                                    [class.border-purple-500]="currentTheme()?.fontSize === size.value"
                                    [class.border-white/20]="currentTheme()?.fontSize !== size.value"
                                    [class.bg-white/10]="currentTheme()?.fontSize === size.value">
                                    <span class="text-white" [style.font-size]="size.preview">{{ size.label }}</span>
                                </button>
                            }
                        </div>
                    </div>
                </div>

                <!-- Style Options -->
                <div class="border-t border-white/10 pt-4 mt-4 space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-slate-300 mb-2">{{ 'EDITOR.Template' | translate }}</label>
                        <div class="flex gap-2">
                            @for (template of templates; track template.value) {
                                <button 
                                    (click)="updateTheme('template', template.value)"
                                    class="flex-1 py-2 px-3 rounded border text-sm transition-all"
                                    [class.border-purple-500]="currentTheme()?.template === template.value"
                                    [class.border-white/20]="currentTheme()?.template !== template.value"
                                    [class.bg-white/10]="currentTheme()?.template === template.value">
                                    <span class="text-white">{{ template.label | translate }}</span>
                                </button>
                            }
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-slate-300 mb-2">{{ 'EDITOR.ButtonStyle' | translate }}</label>
                        <div class="flex gap-2 items-center">
                            @for (style of buttonStyles; track style.value) {
                                <button 
                                    (click)="updateTheme('buttonStyle', style.value)"
                                    class="flex-1 py-3 px-4 rounded border text-sm transition-all"
                                    [class.border-purple-500]="currentTheme()?.buttonStyle === style.value"
                                    [class.border-white/20]="currentTheme()?.buttonStyle !== style.value"
                                    [class.bg-white/10]="currentTheme()?.buttonStyle === style.value"
                                    [style.border-radius]="getButtonRadius(style.value)">
                                    <span class="text-white">Button</span>
                                </button>
                            }
                        </div>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-slate-300 mb-2">{{ 'EDITOR.Spacing' | translate }}</label>
                        <div class="flex gap-2">
                            @for (spacing of spacings; track spacing.value) {
                                <button 
                                    (click)="updateTheme('spacing', spacing.value)"
                                    class="flex-1 py-2 px-3 rounded border text-sm transition-all"
                                    [class.border-purple-500]="currentTheme()?.spacing === spacing.value"
                                    [class.border-white/20]="currentTheme()?.spacing !== spacing.value"
                                    [class.bg-white/10]="currentTheme()?.spacing === spacing.value">
                                    <span class="text-white">{{ spacing.label | translate }}</span>
                                </button>
                            }
                        </div>
                    </div>
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
