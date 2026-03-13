import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormArray, FormControl } from '@angular/forms';
import { signal, computed } from '@angular/core';
import { WelcomeBookletService } from '../welcome-booklet.service';
import { WelcomeBookletSectionEditorComponent } from './welcome-booklet-section-editor.component';
import { CONTROL_LABELS } from '../booklet-definitions';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { WelcomeBookletAiService } from '../welcome-booklet-ai.service';

@Component({
    selector: 'app-welcome-booklet-editor',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, WelcomeBookletSectionEditorComponent, TranslatePipe],
    templateUrl: './welcome-booklet-editor.component.html',
})
export class WelcomeBookletEditorComponent {
    service = inject(WelcomeBookletService);
    aiService = inject(WelcomeBookletAiService);
    form = this.service.editorForm;
    sections = this.service.sections;

    getSectionGroup(name: string): FormGroup {
        return this.form.get(name) as FormGroup;
    }

    // Photo Section State
    isPhotosOpen = signal(false);
    showCategoryManager = signal(false);
    newCategoryName = signal('');
    // ... (skip lines)


    // Helpers
    availableCategories = this.service.availableCategories;

    get photosArray(): FormArray {
        return this.form.get('photos') as FormArray;
    }

    togglePhotosSection() {
        this.isPhotosOpen.update(v => !v);
    }

    toggleCategoryManager() {
        this.showCategoryManager.update(v => !v);
    }

    updateNewCategoryName(event: Event) {
        const input = event.target as HTMLInputElement;
        this.newCategoryName.set(input.value);
    }

    addCategory() {
        const name = this.newCategoryName().trim();
        const current = this.availableCategories();
        if (name && !current.includes(name)) {
            this.availableCategories.set([...current, name]);
            this.newCategoryName.set('');
        }
    }

    removeCategory(cat: string) {
        this.availableCategories.update(cats => cats.filter(c => c !== cat));
    }

    addPhoto(url: string = '', category: string = '', markModified = false) {
        const group = this.service.fb.group({
            url: [url],
            category: [category]
        });
        this.photosArray.push(group);
        if (markModified) {
            this.form.markAsDirty();
        }
    }

    removePhoto(index: number) {
        this.photosArray.removeAt(index);
        this.form.markAsDirty();
    }

    getPhotoGroup(index: number): FormGroup {
        return this.photosArray.at(index) as FormGroup;
    }

    // Progress Helper (Simplified for now)
    getSectionCompletion(sectionId: string): number {
        if (sectionId === 'photos') {
            return this.photosArray.length > 0 ? 100 : 0;
        }
        if (sectionId === 'cover') {
            return this.form.get('coverImageUrl')?.value ? 100 : 0;
        }
        if (sectionId === 'location') {
            return this.form.get('address')?.value ? 100 : 0;
        }
        // Basic check for chapters: if any field has content
        const group = this.form.get(sectionId) as FormGroup;
        if (group) {
            const controls = Object.keys(group.controls);
            const filled = controls.filter(k => group.get(k)?.value).length;
            return filled > 0 ? Math.min(100, Math.round((filled / controls.length) * 100)) : 0;
        }
        return 0;
    }

    // General Sections State
    isCoverOpen = signal(false);
    isLocationOpen = signal(false);
    openChapter = signal<string | null>(null);

    toggleCoverSection() {
        this.isCoverOpen.update(v => !v);
    }

    toggleLocationSection() {
        this.isLocationOpen.update(v => !v);
    }

    toggleChapter(id: string) {
        this.openChapter.update(current => current === id ? null : id);
    }

    // AI Generation Helpers
    hasAiAccess() { return true; } // Mock for now
    isAiLoading = this.aiService.isAiLoading; // Fix: use aiService loading signal

    regenerateSection(sectionId: string, event: Event) {
        event.stopPropagation();
        // TODO: Call service to regenerate
        console.log('Regenerate', sectionId);
    }

    async autoFillAI() {
        const address = this.form.get('address')?.value;
        if (!address) {
            // Simple alert for now, could be toast
            alert("Veuillez entrer une adresse avant de générer.");
            return;
        }

        // Call the AI Service
        await this.aiService.autoFill(this.form, address, this.sections);
    }

    // Template helpers
    getGroupControls(groupName: string): string[] {
        const group = this.form.get(groupName) as FormGroup;
        return group ? Object.keys(group.controls).filter(k => !k.endsWith('_pdf')) : [];
    }

    // Need to import CONTROL_LABELS or generic way to get label?
    // We can inject the service or use the definitions
    getLabelForControl(sectionId: string, controlName: string): string {
        // Implementation depends on how we want to access labels.
        // For now, let's look at how the HTML expects it. 
        // The HTML uses `getLabelForControl(section.id, control)`.
        // We can import CONTROL_LABELS
        return (CONTROL_LABELS[sectionId] && CONTROL_LABELS[sectionId][controlName]) || controlName;
    }

}
