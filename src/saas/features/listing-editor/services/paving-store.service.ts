import { Injectable, inject, signal } from '@angular/core';
import type {
  PropertyData, PropertyPhoto, PageConfig, Section, SectionType,
  Theme, Layout, GridBlock, SectionStyle, EdgeDragState, BlockHistory,
  ViewMode, EditorMode, SplitDirection, SavedLayout, ListingLayout,
} from '../models/paving.types';
import { THEMES, LAYOUTS, DEFAULT_SECTION_CONTENT, generateId, DEFAULT_SECTION_TYPES } from '../constants/paving.constants';
import { PavingSupabaseService } from './paving-supabase.service';
import { GridUtilsService } from './grid-utils.service';

const DEFAULT_PAGE_CONFIG: PageConfig = {
  layout: 'list',
  theme: 'modern-ocean',
  sections: [],
  globalStyle: {},
};

function createDefaultSections(): Section[] {
  return DEFAULT_SECTION_TYPES.map((type, index) => ({
    id: generateId(),
    type: type as SectionType,
    order: index,
    enabled: true,
    content: DEFAULT_SECTION_CONTENT[type as SectionType],
    style: {},
    animations: {},
  }));
}

function createSectionsFromProperty(propertyData: PropertyData, photos: PropertyPhoto[]): Section[] {
  const sections: Section[] = [];

  sections.push({
    id: generateId(),
    type: 'hero',
    order: 0,
    enabled: true,
    content: {
      title: propertyData.listing_title || propertyData.name || '',
      subtitle: propertyData.property_type || '',
      description: propertyData.listing_description || '',
      backgroundImage: photos.length > 0 ? photos[0].url : (propertyData.cover_image_url || ''),
      ctaText: 'Book Now',
      ctaLink: '',
    },
    style: {
      backgroundImage: photos.length > 0 ? `url(${photos[0].url})` : (propertyData.cover_image_url ? `url(${propertyData.cover_image_url})` : undefined),
      backgroundAttachment: 'parallax',
    },
    animations: {},
  });

  sections.push({
    id: generateId(),
    type: 'description',
    order: 1,
    enabled: true,
    content: { content: propertyData.listing_description || '' },
    style: {},
    animations: {},
  });

  sections.push({
    id: generateId(),
    type: 'characteristics',
    order: 2,
    enabled: true,
    content: {
      sqm: propertyData.surface_area || 0,
      plotSqm: 0,
      rooms: propertyData.rooms || 0,
      bathrooms: propertyData.bathrooms || 0,
      beds: propertyData.bed_count || 0,
      guests: propertyData.max_guests || 0,
    },
    style: {},
    animations: {},
  });

  if (photos.length > 0) {
    sections.push({
      id: generateId(),
      type: 'photos',
      order: sections.length,
      enabled: true,
      content: {
        images: photos.map(p => ({ url: p.url, caption: '' })),
        layout: 'grid',
        columns: 3,
      },
      style: {},
      animations: {},
    });
  }

  sections.push({
    id: generateId(),
    type: 'contact',
    order: sections.length,
    enabled: true,
    content: {
      email: propertyData.cleaning_contact_info || '',
      phone: propertyData.emergency_contact_info || '',
      address: propertyData.address || '',
    },
    style: {},
    animations: {},
  });

  return sections;
}

@Injectable({ providedIn: 'root' })
export class PavingStoreService {
  private supabase = inject(PavingSupabaseService);
  private gridUtils = inject(GridUtilsService);

  readonly propertyId = signal<string | null>(null);
  readonly propertyData = signal<PropertyData | null>(null);
  readonly photos = signal<PropertyPhoto[]>([]);
  readonly pageConfig = signal<PageConfig>(DEFAULT_PAGE_CONFIG);
  readonly selectedSectionId = signal<string | null>(null);
  readonly selectedBlockId = signal<string | null>(null);
  readonly selectedBlockIds = signal<string[]>([]);
  readonly selectedSeparatorId = signal<string | null>(null);
  readonly gridBlocks = signal<GridBlock[]>([]);
  readonly blockHistory = signal<BlockHistory>({ past: [], future: [] });
  readonly toastMessage = signal<string | null>(null);
  readonly containerWidth = signal(800);
  readonly containerHeight = signal(748);
  readonly sidebarOpen = signal(true);
  readonly sidebarTab = signal<'sections' | 'config'>('sections');
  readonly isLoading = signal(false);
  readonly isSaving = signal(false);
  readonly error = signal<string | null>(null);
  readonly viewMode = signal<ViewMode>('desktop');
  readonly edgeDragState = signal<EdgeDragState>({ active: false, orientation: 'H', coordinate: 0, affectedA: [], affectedB: [] });
  readonly isLayoutEditing = signal(false);
  readonly showBlocksInsteadOfSections = signal(false);
  readonly selectedCustomLayoutId = signal<string | null>(null);
  readonly availableLayouts = signal<ListingLayout[]>([]);
  readonly editingLayoutId = signal<string | null>(null);
  readonly previousLayoutId = signal<string | null>(null);
  readonly editorMode = signal<EditorMode>('display');
  readonly isFullScreen = signal(false);

  async loadProperty(propertyId: string): Promise<void> {
    this.isLoading.set(true);
    this.error.set(null);
    try {
      const [propertyData, photos] = await Promise.all([
        this.supabase.fetchProperty(propertyId),
        this.supabase.fetchPropertyPhotos(propertyId),
      ]);

      if (!propertyData) {
        throw new Error('Property not found');
      }

      let pageConfig = propertyData.page_config || DEFAULT_PAGE_CONFIG;
      if (!pageConfig.sections || pageConfig.sections.length === 0) {
        const newSections = createSectionsFromProperty(propertyData, photos);
        pageConfig = { ...pageConfig, sections: newSections };
      }

      const count = Math.max(1, pageConfig.sections.length);
      const ch = this.containerHeight() > 0 ? this.containerHeight() : 748;
      const blockWidth = this.containerWidth() || 800;
      const h = ch / count;

      const gridBlocks = pageConfig.sections.map((section, index) => ({
        id: `block_${index}`,
        sectionId: section.id,
        row: 0,
        col: 0,
        bounds: { top: index * h, left: 0, right: blockWidth, bottom: (index + 1) * h },
        displayMode: 'LOCKED' as const,
      }));

      this.propertyId.set(propertyId);
      this.propertyData.set(propertyData);
      this.photos.set(photos);
      this.pageConfig.set(pageConfig);
      this.gridBlocks.set(gridBlocks);
      this.isLoading.set(false);

      this.loadLayouts();
    } catch (error) {
      console.error('[loadProperty] Error:', error);
      this.isLoading.set(false);
      this.error.set((error as Error).message);
      throw error;
    }
  }

  async saveConfig(): Promise<void> {
    const pid = this.propertyId();
    const pc = this.pageConfig();
    if (!pid) return;

    this.isSaving.set(true);
    this.error.set(null);
    try {
      await this.supabase.savePropertyConfig(pid, pc);
      this.isSaving.set(false);
    } catch (error) {
      this.isSaving.set(false);
      this.error.set((error as Error).message);
      throw error;
    }
  }

  async loadLayouts(): Promise<void> {
    const pd = this.propertyData();
    const pc = this.pageConfig();
    const cw = this.containerWidth();
    const ch = this.containerHeight();
    const ownerId = pd?.owner_id;
    const customLayouts = await this.supabase.fetchListingLayouts(ownerId);

    const blockWidth = cw || 800;
    const blockHeight = ch > 0 ? ch : 748;

    const generatePredefinedBlocks = (layoutId: string, sections: Section[]) => {
      const count = Math.max(1, sections.length);
      const blocks: GridBlock[] = [];

      if (layoutId === 'two-column') {
        const rowHeight = blockHeight / Math.ceil(count / 2);
        let currentY = 0;
        for (let i = 0; i < count; i++) {
          if (i === count - 1 && count % 2 !== 0) {
            blocks.push({
              id: `block_${i}`, sectionId: sections[i].id, row: 0, col: 0,
              bounds: { top: currentY, left: 0, right: blockWidth, bottom: currentY + rowHeight },
              displayMode: 'LOCKED',
            });
            currentY += rowHeight;
          } else {
            const isLeft = i % 2 === 0;
            blocks.push({
              id: `block_${i}`, sectionId: sections[i].id, row: 0, col: 0,
              bounds: {
                top: currentY,
                left: isLeft ? 0 : blockWidth / 2,
                right: isLeft ? blockWidth / 2 : blockWidth,
                bottom: currentY + rowHeight,
              },
              displayMode: 'LOCKED',
            });
            if (!isLeft) currentY += rowHeight;
          }
        }
      } else if (layoutId === 'hero-first') {
        const heroHeight = blockHeight * 0.4;
        const restHeight = (blockHeight - heroHeight) / Math.max(1, count - 1);
        for (let i = 0; i < count; i++) {
          const top = i === 0 ? 0 : heroHeight + (i - 1) * restHeight;
          const bottom = i === 0 ? heroHeight : top + restHeight;
          blocks.push({
            id: `block_${i}`, sectionId: sections[i].id, row: 0, col: 0,
            bounds: { top, left: 0, right: blockWidth, bottom },
            displayMode: 'LOCKED',
          });
        }
      } else if (layoutId === 'magazine') {
        const heroHeight = blockHeight * 0.45;
        const remainingHeight = blockHeight - heroHeight;
        const remainingCount = count - 1;
        const rowHeight = remainingCount > 0 ? remainingHeight / Math.ceil(remainingCount / 2) : 0;
        let currentY = heroHeight;

        blocks.push({
          id: `block_0`, sectionId: sections[0]?.id, row: 0, col: 0,
          bounds: { top: 0, left: 0, right: blockWidth, bottom: heroHeight },
          displayMode: 'LOCKED',
        });

        for (let i = 1; i < count; i++) {
          if (i === count - 1 && remainingCount % 2 !== 0) {
            blocks.push({
              id: `block_${i}`, sectionId: sections[i].id, row: 0, col: 0,
              bounds: { top: currentY, left: 0, right: blockWidth, bottom: currentY + rowHeight },
              displayMode: 'LOCKED',
            });
            currentY += rowHeight;
          } else {
            const isLeft = (i - 1) % 2 === 0;
            blocks.push({
              id: `block_${i}`, sectionId: sections[i].id, row: 0, col: 0,
              bounds: {
                top: currentY,
                left: isLeft ? 0 : blockWidth / 2,
                right: isLeft ? blockWidth / 2 : blockWidth,
                bottom: currentY + rowHeight,
              },
              displayMode: 'LOCKED',
            });
            if (!isLeft) currentY += rowHeight;
          }
        }
      } else {
        const h = blockHeight / count;
        for (let i = 0; i < count; i++) {
          blocks.push({
            id: `block_${i}`, sectionId: sections[i].id, row: 0, col: 0,
            bounds: { top: i * h, left: 0, right: blockWidth, bottom: (i + 1) * h },
            displayMode: 'LOCKED',
          });
        }
      }
      return blocks;
    };

    const sections = pc.sections.length > 0 ? pc.sections : createDefaultSections();
    const predefinedLayouts: ListingLayout[] = LAYOUTS
      .filter(l => l.id !== 'custom')
      .map(l => ({
        id: l.id,
        name: l.name,
        type: 'predefined' as const,
        owner_id: undefined as string | undefined,
        grid_blocks: generatePredefinedBlocks(l.id, sections) as unknown as GridBlock[],
        section_assignments: sections.reduce((acc, s, i) => ({ ...acc, [`block_${i}`]: s.id }), {}),
        created_at: '',
      }));

    const cleanCustomLayouts = customLayouts.filter(l => !['list', 'two-column', 'magazine', 'hero-first'].includes(l.id));
    const allLayouts = [...cleanCustomLayouts, ...predefinedLayouts];
    this.availableLayouts.set(allLayouts);
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  toggleFullScreen(): void {
    this.isFullScreen.update(v => !v);
  }

  setEditorMode(mode: EditorMode): void {
    console.log('[Store] setEditorMode transition ->', mode);
    this.editorMode.set(mode);
    this.isLayoutEditing.set(mode === 'layout');
  }

  setSelectedSection(sectionId: string | null): void {
    this.selectedSectionId.set(sectionId);
  }

  setSelectedBlock(blockId: string | null): void {
    const block = blockId ? this.gridBlocks().find(b => b.id === blockId) : null;
    const assignedSectionId = block?.sectionId || null;

    this.selectedBlockId.set(blockId);
    this.selectedBlockIds.set(blockId ? [blockId] : []);
    this.selectedSectionId.set(assignedSectionId);
  }

  toggleBlockSelection(blockId: string): void {
    const ids = this.selectedBlockIds();
    if (ids.includes(blockId)) {
      this.selectedBlockIds.set(ids.filter(id => id !== blockId));
      this.selectedBlockId.set(ids.length > 1 ? ids[0] : null);
    } else {
      this.selectedBlockIds.set([...ids, blockId]);
    }
  }

  clearBlockSelection(): void {
    this.selectedBlockIds.set([]);
    this.selectedBlockId.set(null);
  }

  setViewMode(mode: ViewMode): void {
    this.viewMode.set(mode);
  }

  setLayout(layoutId: string): void {
    if (layoutId === 'custom') {
      let sections = this.pageConfig().sections;

      if (sections.length === 0) {
        sections = createDefaultSections();
      }

      const gridBlocks = this.gridUtils.initializeGridState(this.containerWidth(), this.containerHeight(), 4);

      this.pageConfig.update(pc => ({ ...pc, layout: layoutId, sections }));
      this.gridBlocks.set(gridBlocks);
      this.isLayoutEditing.set(true);
      this.showBlocksInsteadOfSections.set(false);
      this.previousLayoutId.set(this.selectedCustomLayoutId() || this.pageConfig().layout);
      this.editorMode.set('layout');
    } else {
      const dbLayout = this.availableLayouts().find(l => l.id === layoutId);

      if (dbLayout) {
        const gridBlocks = (dbLayout.grid_blocks as GridBlock[]) || [];
        const finalSections = this.pageConfig().sections;

        const assignedBlocks = gridBlocks.map(block => {
          const sectionId = (dbLayout.section_assignments as Record<string, string>)?.[block.id] || block.sectionId;
          return sectionId ? { ...block, sectionId } : block;
        });

        this.pageConfig.update(pc => ({ ...pc, layout: 'custom', sections: finalSections }));
        this.gridBlocks.set(assignedBlocks);
        this.selectedBlockId.set(null);
        this.selectedBlockIds.set([]);
        this.selectedSeparatorId.set(null);
        this.isLayoutEditing.set(false);
        this.showBlocksInsteadOfSections.set(false);
        this.selectedCustomLayoutId.set(dbLayout.id);
        this.editingLayoutId.set(null);
        this.previousLayoutId.set(null);
        this.editorMode.set('display');
        return;
      }

      const hardcodedLayout = LAYOUTS.find(l => l.id === layoutId);
      if (hardcodedLayout) {
        if (this.gridBlocks().length > 0 && this.selectedCustomLayoutId() === layoutId) {
          this.pageConfig.update(pc => ({ ...pc, layout: 'custom', sections: this.pageConfig().sections }));
          this.selectedBlockId.set(null);
          this.selectedBlockIds.set([]);
          this.selectedSeparatorId.set(null);
          this.isLayoutEditing.set(false);
          this.showBlocksInsteadOfSections.set(false);
          this.selectedCustomLayoutId.set(layoutId);
          this.editingLayoutId.set(null);
          this.previousLayoutId.set(null);
          this.editorMode.set('display');
          return;
        }

        const sections = this.pageConfig().sections;
        const count = Math.max(1, sections.length);
        const blockWidth = this.containerWidth() || 800;
        const ch = this.containerHeight() > 0 ? this.containerHeight() : 748;
        let gridBlocks: GridBlock[] = [];

        if (layoutId === 'two-column') {
          const rowHeight = ch / Math.ceil(count / 2);
          let currentY = 0;
          for (let i = 0; i < count; i++) {
            if (i === count - 1 && count % 2 !== 0) {
              gridBlocks.push({
                id: `block_${i}`, sectionId: sections[i].id, row: 0, col: 0,
                bounds: { top: currentY, left: 0, right: blockWidth, bottom: currentY + rowHeight }, displayMode: 'LOCKED',
              });
              currentY += rowHeight;
            } else {
              const isLeft = i % 2 === 0;
              gridBlocks.push({
                id: `block_${i}`, sectionId: sections[i].id, row: 0, col: 0,
                bounds: {
                  top: currentY,
                  left: isLeft ? 0 : blockWidth / 2,
                  right: isLeft ? blockWidth / 2 : blockWidth,
                  bottom: currentY + rowHeight,
                }, displayMode: 'LOCKED',
              });
              if (!isLeft) currentY += rowHeight;
            }
          }
        } else if (layoutId === 'hero-first') {
          const heroHeight = ch * 0.4;
          const restHeight = (ch - heroHeight) / Math.max(1, count - 1);
          for (let i = 0; i < count; i++) {
            const top = i === 0 ? 0 : heroHeight + (i - 1) * restHeight;
            const bottom = i === 0 ? heroHeight : top + restHeight;
            gridBlocks.push({
              id: `block_${i}`, sectionId: sections[i].id, row: 0, col: 0,
              bounds: { top, left: 0, right: blockWidth, bottom }, displayMode: 'LOCKED',
            });
          }
        } else if (layoutId === 'magazine') {
          const heroHeight = ch * 0.45;
          const remainingHeight = ch - heroHeight;
          const remainingCount = count - 1;
          const rowHeight = remainingCount > 0 ? remainingHeight / Math.ceil(remainingCount / 2) : 0;
          let currentY = heroHeight;

          gridBlocks.push({
            id: `block_0`, sectionId: sections[0]?.id, row: 0, col: 0,
            bounds: { top: 0, left: 0, right: blockWidth, bottom: heroHeight }, displayMode: 'LOCKED',
          });

          for (let i = 1; i < count; i++) {
            if (i === count - 1 && remainingCount % 2 !== 0) {
              gridBlocks.push({
                id: `block_${i}`, sectionId: sections[i].id, row: 0, col: 0,
                bounds: { top: currentY, left: 0, right: blockWidth, bottom: currentY + rowHeight }, displayMode: 'LOCKED',
              });
              currentY += rowHeight;
            } else {
              const isLeft = (i - 1) % 2 === 0;
              gridBlocks.push({
                id: `block_${i}`, sectionId: sections[i].id, row: 0, col: 0,
                bounds: {
                  top: currentY,
                  left: isLeft ? 0 : blockWidth / 2,
                  right: isLeft ? blockWidth / 2 : blockWidth,
                  bottom: currentY + rowHeight,
                }, displayMode: 'LOCKED',
              });
              if (!isLeft) currentY += rowHeight;
            }
          }
        } else {
          const h = ch / count;
          for (let i = 0; i < count; i++) {
            gridBlocks.push({
              id: `block_${i}`, sectionId: sections[i].id, row: 0, col: 0,
              bounds: { top: i * h, left: 0, right: blockWidth, bottom: (i + 1) * h }, displayMode: 'LOCKED',
            });
          }
        }

        this.pageConfig.update(pc => ({ ...pc, layout: 'custom', sections }));
        this.gridBlocks.set(gridBlocks);
        this.selectedBlockId.set(null);
        this.selectedBlockIds.set([]);
        this.selectedSeparatorId.set(null);
        this.isLayoutEditing.set(false);
        this.showBlocksInsteadOfSections.set(false);
        this.selectedCustomLayoutId.set(layoutId);
        this.editingLayoutId.set(null);
        this.previousLayoutId.set(null);
        this.editorMode.set('display');
      }
    }
  }

  editLayout(layoutId: string): void {
    const dbLayout = this.availableLayouts().find(l => l.id === layoutId);
    if (!dbLayout) return;

    const gridBlocks = (dbLayout.grid_blocks as GridBlock[]) || [];
    const finalSections = this.pageConfig().sections;

    const assignedBlocks = gridBlocks.map(block => {
      const sectionId = (dbLayout.section_assignments as Record<string, string>)?.[block.id] || block.sectionId;
      return sectionId ? { ...block, sectionId } : block;
    });

    this.pageConfig.update(pc => ({ ...pc, layout: 'custom', sections: finalSections }));
    this.gridBlocks.set(assignedBlocks.length > 0 ? assignedBlocks : this.gridUtils.initializeGridState(this.containerWidth(), this.containerHeight(), 4));
    this.selectedBlockId.set(null);
    this.selectedBlockIds.set([]);
    this.selectedSeparatorId.set(null);
    this.isLayoutEditing.set(true);
    this.showBlocksInsteadOfSections.set(false);
    this.selectedCustomLayoutId.set(dbLayout.type === 'custom' ? dbLayout.id : null);
    this.editingLayoutId.set(dbLayout.id);
    this.previousLayoutId.set(this.selectedCustomLayoutId() || this.pageConfig().layout);
    this.editorMode.set('layout');
  }

  startInlineEditing(): void {
    this.isLayoutEditing.set(true);
    this.previousLayoutId.set(this.selectedCustomLayoutId() || this.pageConfig().layout);
    this.editorMode.set('layout');
  }

  cancelEditing(): void {
    const prevId = this.previousLayoutId();
    if (prevId) {
      this.setLayout(prevId);
    } else {
      this.isLayoutEditing.set(false);
      this.editingLayoutId.set(null);
      this.previousLayoutId.set(null);
      this.editorMode.set('display');
    }
  }

  setTheme(themeId: string): void {
    this.pageConfig.update(pc => ({ ...pc, theme: themeId }));
  }

  addSection(type: SectionType): void {
    const newSection: Section = {
      id: generateId(),
      type,
      order: this.pageConfig().sections.length,
      enabled: true,
      content: DEFAULT_SECTION_CONTENT[type],
      style: {},
      animations: {},
    };

    const newSections = [...this.pageConfig().sections, newSection];
    const selectedBlockId = this.selectedBlockId();

    // If a block is selected, assign the new section to it
    if (selectedBlockId && this.gridBlocks().length > 0) {
      const updatedBlocks = this.gridBlocks().map(b =>
        b.id === selectedBlockId ? { ...b, sectionId: newSection.id, displayMode: 'LOCKED' as const } : b
      );
      this.pageConfig.update(pc => ({ ...pc, sections: newSections }));
      this.gridBlocks.set(updatedBlocks);
      this.selectedSectionId.set(newSection.id);
      return;
    }

    // Otherwise, assign to last block if layout is 'custom'
    if (this.pageConfig().layout === 'custom' && this.gridBlocks().length > 0) {
      const lastBlock = this.gridBlocks()[this.gridBlocks().length - 1];
      const updatedBlocks = this.gridBlocks().map(b =>
        b.id === lastBlock.id ? { ...b, sectionId: newSection.id } : b
      );

      this.pageConfig.update(pc => ({ ...pc, sections: newSections }));
      this.gridBlocks.set(updatedBlocks);
      return;
    }

    this.pageConfig.update(pc => ({ ...pc, sections: newSections }));
  }

  removeSection(sectionId: string): void {
    const currentSections = this.pageConfig().sections;
    const newSections = currentSections
      .filter(s => s.id !== sectionId)
      .map((s, i) => ({ ...s, order: i }));

    this.pageConfig.update(pc => ({ ...pc, sections: newSections }));

    if (this.selectedSectionId() === sectionId) {
      this.selectedSectionId.set(null);
    }
  }

  updateSection(sectionId: string, updates: Partial<Section>): void {
    const newSections = this.pageConfig().sections.map(s =>
      s.id === sectionId ? { ...s, ...updates } : s
    );
    this.pageConfig.update(pc => ({ ...pc, sections: newSections }));
  }

  reorderSections(sections: Section[]): void {
    this.pageConfig.update(pc => ({
      ...pc,
      sections: sections.map((s, i) => ({ ...s, order: i })),
    }));
  }

  getTheme(): Theme | undefined {
    return THEMES.find(t => t.id === this.pageConfig().theme);
  }

  getLayout(): Layout | undefined {
    return LAYOUTS.find(l => l.id === this.pageConfig().layout);
  }

  splitBlock(blockId: string, direction: SplitDirection): void {
    const current = this.gridBlocks();
    const idx = current.findIndex(b => b.id === blockId);
    const target = current[idx];
    if (!target) return;

    this.saveBlockHistory();

    if (direction === 'vertical') {
      const width = target.bounds.right - target.bounds.left;
      if (width < 100) return;
      const halfW = Math.round(width / 2);
      const newBlocks = [...current];
      newBlocks[idx] = { ...target, bounds: { ...target.bounds, right: target.bounds.left + halfW } };
      newBlocks.splice(idx + 1, 0, {
        ...target,
        id: 'blk_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        sectionId: undefined,
        bounds: { ...target.bounds, left: target.bounds.left + halfW },
      });
      this.gridBlocks.set(newBlocks);
      this.selectedBlockId.set(blockId);
      this.pageConfig.update(pc => ({ ...pc, layout: 'custom' }));
      this.selectedCustomLayoutId.set(null);
    } else {
      const height = target.bounds.bottom - target.bounds.top;
      if (height < 100) return;
      const halfH = Math.round(height / 2);
      const newBlocks = [...current];
      newBlocks[idx] = { ...target, bounds: { ...target.bounds, bottom: target.bounds.top + halfH } };
      newBlocks.splice(idx + 1, 0, {
        ...target,
        id: 'blk_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        sectionId: undefined,
        bounds: { ...target.bounds, top: target.bounds.top + halfH },
      });
      this.gridBlocks.set(newBlocks);
      this.selectedBlockId.set(blockId);
      this.pageConfig.update(pc => ({ ...pc, layout: 'custom' }));
      this.selectedCustomLayoutId.set(null);
    }
  }

  mergeBlocksById(blockId1: string, blockId2: string): void {
    this.saveBlockHistory();
    const merged = this.gridUtils.mergeBlocks(this.gridBlocks(), blockId1, blockId2);
    if (merged !== this.gridBlocks()) {
      this.gridBlocks.set(merged);
      this.selectedBlockId.set(null);
      this.selectedBlockIds.set([]);
    } else {
      this.setToastMessage('Merge failed: blocks must form a perfect rectangle');
    }
  }

  deleteBlock(blockId: string): void {
    this.saveBlockHistory();
    const updated = this.gridBlocks().filter(b => b.id !== blockId);
    this.gridBlocks.set(updated);
    this.selectedBlockId.set(null);
    this.selectedBlockIds.set([]);
  }

  assignSectionToBlock(blockId: string, sectionId: string): void {
    console.log('[assignSectionToBlock] BEFORE update - gridBlocks:', this.gridBlocks().map(b => ({ id: b.id, sectionId: b.sectionId })));
    console.log('[assignSectionToBlock] blockId:', blockId, 'sectionId:', sectionId);
    this.saveBlockHistory();
    this.gridBlocks.update(blocks => {
      const next = blocks.map(block => {
        const updated = block.id === blockId
          ? { ...block, sectionId: sectionId || undefined, displayMode: sectionId ? 'LOCKED' as const : 'UNLOCKED' as const }
          : block;
        console.log('[assignSectionToBlock update] block', block.id, ':', block.sectionId, '->', updated.sectionId);
        return updated;
      });
      console.log('[assignSectionToBlock] AFTER update - gridBlocks:', next.map(b => ({ id: b.id, sectionId: b.sectionId })));
      return next;
    });
    console.log('[assignSectionToBlock] FINAL - gridBlocks:', this.gridBlocks().map(b => ({ id: b.id, sectionId: b.sectionId })));
  }

  setGridBlocks(blocks: GridBlock[]): void {
    this.gridBlocks.set(blocks);
  }

  updateBlockStyle(blockId: string, style: Partial<SectionStyle>): void {
    this.gridBlocks.update(blocks =>
      blocks.map(block =>
        block.id === blockId ? { ...block, blockStyle: { ...block.blockStyle, ...style } } : block
      )
    );
  }

  toggleBlockDisplayMode(blockId: string): void {
    this.gridBlocks.update(blocks =>
      blocks.map(block =>
        block.id === blockId
          ? { ...block, displayMode: block.displayMode === 'LOCKED' ? 'UNLOCKED' : 'LOCKED' }
          : block
      )
    );
  }

  toggleSeparatorSelection(separatorId: string): void {
    const current = this.selectedSeparatorId();
    this.selectedSeparatorId.set(current === separatorId ? null : separatorId);
  }

  clearSeparatorSelection(): void {
    this.selectedSeparatorId.set(null);
  }

  startEdgeDrag(edge: EdgeDragState): void {
    this.saveBlockHistory();
    this.edgeDragState.set({ ...edge, active: true });
  }

  updateEdgeDrag(newPos: number): void {
    const eds = this.edgeDragState();
    if (!eds.active) return;

    const { blocks: updated, appliedPos } = this.gridUtils.applyDragToBlocks(
      this.gridBlocks(),
      eds,
      newPos,
      this.containerWidth(),
      this.containerHeight()
    );

    this.gridBlocks.set(updated);
    this.edgeDragState.set({ ...eds, coordinate: appliedPos });
  }

  endEdgeDrag(): void {
    this.edgeDragState.set({ active: false, orientation: 'H', coordinate: 0, affectedA: [], affectedB: [] });
    this.selectedSeparatorId.set(null);
  }

  setContainerDimensions(width: number, height: number): void {
    this.containerWidth.set(width);
    this.containerHeight.set(height);
  }

  saveBlockHistory(): void {
    const gb = this.gridBlocks();
    const bh = this.blockHistory();
    this.blockHistory.set({
      past: [...bh.past.slice(-29), gb],
      future: [],
    });
  }

  undoBlocks(): void {
    const bh = this.blockHistory();
    const gb = this.gridBlocks();
    if (bh.past.length === 0) return;
    const previous = bh.past[bh.past.length - 1];
    this.blockHistory.set({
      past: bh.past.slice(0, -1),
      future: [gb, ...bh.future],
    });
    this.gridBlocks.set(previous);
    this.selectedBlockId.set(null);
    this.selectedBlockIds.set([]);
  }

  redoBlocks(): void {
    const bh = this.blockHistory();
    const gb = this.gridBlocks();
    if (bh.future.length === 0) return;
    const next = bh.future[0];
    this.blockHistory.set({
      past: [...bh.past, gb],
      future: bh.future.slice(1),
    });
    this.gridBlocks.set(next);
    this.selectedBlockId.set(null);
    this.selectedBlockIds.set([]);
  }

  setToastMessage(msg: string | null): void {
    this.toastMessage.set(msg);
    if (msg) {
      setTimeout(() => {
        const current = this.toastMessage();
        if (current === msg) this.toastMessage.set(null);
      }, 2500);
    }
  }

  async saveCustomLayout(name: string): Promise<boolean> {
    const gb = this.gridBlocks();
    const pd = this.propertyData();
    const editingId = this.editingLayoutId();
    const layouts = this.availableLayouts();

    if (gb.length === 0) return false;

    const existingLayout = editingId ? layouts.find(l => l.id === editingId) : null;
    const isUpdatingCustom = existingLayout && existingLayout.type === 'custom';

    let saved: ListingLayout | null;
    if (isUpdatingCustom && editingId) {
      saved = await this.supabase.saveListingLayout({
        id: editingId,
        name: name || existingLayout.name,
        type: 'custom',
        grid_blocks: gb as unknown[],
        section_assignments: {},
        owner_id: pd?.owner_id || '',
      });
    } else {
      const layoutId = `layout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      saved = await this.supabase.saveListingLayout({
        id: layoutId,
        name,
        type: 'custom',
        grid_blocks: gb as unknown[],
        section_assignments: {},
        owner_id: pd?.owner_id || '',
      });
    }

    if (saved) {
      await this.loadLayouts();
      this.setLayout(saved.id);
      return true;
    }
    return false;
  }

  loadCustomLayout(id: string): void {
    this.setLayout(id);
  }

  async deleteCustomLayout(id: string): Promise<void> {
    const success = await this.supabase.deleteListingLayout(id);
    if (success) {
      await this.loadLayouts();

      if (this.selectedCustomLayoutId() === id) {
        this.pageConfig.update(pc => ({ ...pc, layout: 'list' }));
        this.gridBlocks.set([]);
        this.selectedBlockId.set(null);
        this.selectedBlockIds.set([]);
        this.selectedSeparatorId.set(null);
        this.selectedCustomLayoutId.set(null);
      }
    }
  }

  getCustomLayouts(): SavedLayout[] {
    return this.availableLayouts() as unknown as SavedLayout[];
  }

  getIsLayoutEditing(): boolean {
    return this.isLayoutEditing();
  }

  generatePredefinedBlocks(layoutId: string, sections: Section[]): GridBlock[] {
    const blockWidth = this.containerWidth() || 800;
    const blockHeight = this.containerHeight() > 0 ? this.containerHeight() : 748;
    const count = Math.max(1, sections.length);
    const blocks: GridBlock[] = [];

    if (layoutId === 'two-column') {
      const rowHeight = blockHeight / Math.ceil(count / 2);
      let currentY = 0;
      for (let i = 0; i < count; i++) {
        if (i === count - 1 && count % 2 !== 0) {
          blocks.push({
            id: `block_${i}`, sectionId: sections[i].id, row: 0, col: 0,
            bounds: { top: currentY, left: 0, right: blockWidth, bottom: currentY + rowHeight },
            displayMode: 'LOCKED',
          });
          currentY += rowHeight;
        } else {
          const isLeft = i % 2 === 0;
          blocks.push({
            id: `block_${i}`, sectionId: sections[i].id, row: 0, col: 0,
            bounds: {
              top: currentY,
              left: isLeft ? 0 : blockWidth / 2,
              right: isLeft ? blockWidth / 2 : blockWidth,
              bottom: currentY + rowHeight,
            },
            displayMode: 'LOCKED',
          });
          if (!isLeft) currentY += rowHeight;
        }
      }
    } else if (layoutId === 'hero-first') {
      const heroHeight = blockHeight * 0.4;
      const restHeight = (blockHeight - heroHeight) / Math.max(1, count - 1);
      for (let i = 0; i < count; i++) {
        const top = i === 0 ? 0 : heroHeight + (i - 1) * restHeight;
        const bottom = i === 0 ? heroHeight : top + restHeight;
        blocks.push({
          id: `block_${i}`, sectionId: sections[i].id, row: 0, col: 0,
          bounds: { top, left: 0, right: blockWidth, bottom },
          displayMode: 'LOCKED',
        });
      }
    } else if (layoutId === 'magazine') {
      const heroHeight = blockHeight * 0.45;
      const remainingHeight = blockHeight - heroHeight;
      const remainingCount = count - 1;
      const rowHeight = remainingCount > 0 ? remainingHeight / Math.ceil(remainingCount / 2) : 0;
      let currentY = heroHeight;

      blocks.push({
        id: `block_0`, sectionId: sections[0]?.id, row: 0, col: 0,
        bounds: { top: 0, left: 0, right: blockWidth, bottom: heroHeight },
        displayMode: 'LOCKED',
      });

      for (let i = 1; i < count; i++) {
        if (i === count - 1 && remainingCount % 2 !== 0) {
          blocks.push({
            id: `block_${i}`, sectionId: sections[i].id, row: 0, col: 0,
            bounds: { top: currentY, left: 0, right: blockWidth, bottom: currentY + rowHeight },
            displayMode: 'LOCKED',
          });
          currentY += rowHeight;
        } else {
          const isLeft = (i - 1) % 2 === 0;
          blocks.push({
            id: `block_${i}`, sectionId: sections[i].id, row: 0, col: 0,
            bounds: {
              top: currentY,
              left: isLeft ? 0 : blockWidth / 2,
              right: isLeft ? blockWidth / 2 : blockWidth,
              bottom: currentY + rowHeight,
            },
            displayMode: 'LOCKED',
          });
          if (!isLeft) currentY += rowHeight;
        }
      }
    } else {
      const h = blockHeight / count;
      for (let i = 0; i < count; i++) {
        blocks.push({
          id: `block_${i}`, sectionId: sections[i].id, row: 0, col: 0,
          bounds: { top: i * h, left: 0, right: blockWidth, bottom: (i + 1) * h },
          displayMode: 'LOCKED',
        });
      }
    }
    return blocks;
  }
}
