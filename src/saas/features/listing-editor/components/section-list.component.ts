import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PavingStoreService } from '../services/paving-store.service';
import { SECTION_TYPES } from '../constants/paving.constants';
import type { SectionType } from '../models/paving.types';

@Component({
  selector: 'app-section-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="section-list-grid">
      @for (st of SECTION_TYPES; track st.type) {
        @let existing = findSection(st.type);
        @let isSelected = existing ? store.selectedSectionId() === existing.id : false;
        <div
          class="section-list-item"
          [class.selected]="isSelected"
          (click)="handleClick(st.type)">
          <span class="section-list-icon">{{ st.icon }}</span>
          <span class="section-list-label">{{ st.label }}</span>
        </div>
      }
    </div>
    @if (sortedSections().length > 0) {
      <div class="existing-sections">
        <div class="existing-sections-title">Current Sections</div>
        @for (section of sortedSections(); track section.id) {
          @let sinfo = getSectionInfo(section.type);
          <div
            class="existing-section-item"
            [class.selected]="store.selectedSectionId() === section.id"
            (click)="handleSectionClick(section.id)">
            <span class="drag-handle">⋮⋮</span>
            <span class="existing-section-label">{{ sinfo?.icon }} {{ sinfo?.label }}</span>
            <button
              class="existing-section-remove"
              (click)="$event.stopPropagation(); store.removeSection(section.id)"
              title="Remove section">
              🗑️
            </button>
          </div>
        }
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionListComponent {
  store = inject(PavingStoreService);
  readonly SECTION_TYPES = SECTION_TYPES;
  readonly getSectionInfo = (type: SectionType) => SECTION_TYPES.find(s => s.type === type);

  sortedSections = computed(() =>
    [...this.store.pageConfig().sections].sort((a, b) => a.order - b.order)
  );

  findSection(type: SectionType) {
    return this.sortedSections().find(s => s.type === type);
  }

  handleClick(type: SectionType): void {
    const existing = this.findSection(type);
    const selectedBlockId = this.store.selectedBlockId();

    if (existing) {
      if (selectedBlockId) {
        if (this.store.selectedSectionId() === existing.id) {
          this.store.assignSectionToBlock(selectedBlockId, '');
          this.store.setSelectedSection(null);
        } else {
          this.store.assignSectionToBlock(selectedBlockId, existing.id);
          this.store.setSelectedSection(existing.id);
        }
      } else {
        this.store.setSelectedSection(existing.id);
      }
    } else {
      this.store.addSection(type);
    }
  }

  handleSectionClick(sectionId: string): void {
    const selectedBlockId = this.store.selectedBlockId();
    if (selectedBlockId) {
      if (this.store.selectedSectionId() === sectionId) {
        this.store.assignSectionToBlock(selectedBlockId, '');
        this.store.setSelectedSection(null);
      } else {
        this.store.assignSectionToBlock(selectedBlockId, sectionId);
        this.store.setSelectedSection(sectionId);
      }
    } else {
      this.store.setSelectedSection(sectionId);
    }
  }
}
