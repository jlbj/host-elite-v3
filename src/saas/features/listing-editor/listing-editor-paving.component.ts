import { Component, inject, input, output, signal, effect, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditorShellComponent } from './components/editor-shell.component';
import { PavingStoreService } from './services/paving-store.service';
import { HostRepository } from '../../../services/host-repository.service';

@Component({
    selector: 'app-listing-editor-paving',
    standalone: true,
    imports: [CommonModule, EditorShellComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="h-full flex flex-col">
            @if (store.isLoading()) {
                <div class="flex items-center justify-center h-full bg-slate-900 text-slate-300">
                    <div class="text-center">
                        <div class="animate-spin h-8 w-8 border-2 border-[#D4AF37] border-t-transparent rounded-full mx-auto mb-4"></div>
                        <p class="text-sm">Loading listing editor...</p>
                        @if (store.error(); as err) {
                            <p class="text-xs text-red-400 mt-2">{{ err }}</p>
                        }
                    </div>
                </div>
            } @else {
                <app-editor-shell />
            }
        </div>
    `
})
export class ListingEditorPavingComponent {
    propertyName = input.required<string>();
    close = output<void>();

    private repository = inject(HostRepository);
    store = inject(PavingStoreService);

    private loaded = signal(false);

    constructor() {
        effect(() => {
            const name = this.propertyName();
            if (name && !this.loaded()) {
                this.loadProperty(name);
            }
        });
    }

    private async loadProperty(name: string) {
        console.log('[ListingEditorPaving] Loading property:', name);
        try {
            const prop = await this.repository.getPropertyByName(name);
            console.log('[ListingEditorPaving] Got property:', prop?.id, prop?.name);
            if (prop?.id) {
                await this.store.loadProperty(prop.id);
                console.log('[ListingEditorPaving] Store loaded');
                this.loaded.set(true);
            } else {
                this.store.error.set('Property not found: ' + name);
            }
        } catch (e: any) {
            console.error('[ListingEditorPaving] Error:', e);
            this.store.error.set('Failed to load property: ' + (e?.message || e));
        }
    }
}
