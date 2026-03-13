import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WelcomeBookletService } from '../../../views/welcome-booklet/welcome-booklet.service';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { WelcomeBookletEditorComponent } from '../../../views/welcome-booklet/components/welcome-booklet-editor.component';

@Component({
    selector: 'app-data-entry-feature',
    standalone: true,
    imports: [CommonModule, WelcomeBookletEditorComponent, TranslatePipe],
    template: `
        <div class="h-full w-full flex flex-col bg-slate-900/50 backdrop-blur-xl rounded-xl border border-white/10 overflow-hidden">
            <div class="flex items-center justify-between border-b border-white/10 px-6 py-4 bg-white/5">
                <h2 class="text-lg font-semibold text-white">{{ 'FEATURE.OPS_12.Title' | translate }}</h2>
                <div class="flex items-center space-x-3">
                    <div *ngIf="service.saveMessage()" class="text-green-400 text-sm font-medium animate-pulse">
                        {{ service.saveMessage() | translate }}
                    </div>
                    <button (click)="service.save()" [disabled]="service.isLoading()"
                        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center shadow-sm disabled:opacity-50">
                        <span *ngIf="service.isLoading()" class="mr-2">...</span>
                        {{ service.isLoading() ? ('COMMON.Loading' | translate) : ('COMMON.Save' | translate) }}
                    </button>
                </div>
            </div>
            <div class="flex-1 overflow-y-auto">
                <app-welcome-booklet-editor></app-welcome-booklet-editor>
            </div>
        </div>
    `
})
export class DataEntryFeatureComponent {
    service = inject(WelcomeBookletService);

    @Input() set propertyName(val: string) {
        if (val) {
            this.service.propertyName.set(val);
        }
    }
}
