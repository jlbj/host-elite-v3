import { create } from 'zustand';
import type { PropertyData, PropertyPhoto, PageConfig, Section, SectionType, Theme, Layout, GridBlock } from '../types';
import type { SplitDirection, SavedLayout } from '../types/blocks';
import { THEMES, LAYOUTS, DEFAULT_SECTION_CONTENT, generateId, DEFAULT_SECTION_TYPES } from '../lib/constants';
import * as supabase from '../services/supabase';
import type { ListingLayout } from '../services/supabase';
import {
  initializeGridState,
  applyDragToBlocks,
  mergeBlocks,
} from '../lib/grid-utils';

type ViewMode = 'mobile' | 'mobile-horizontal' | 'tablet' | 'desktop';

interface EdgeDragState {
  active: boolean;
  orientation: 'H' | 'V';
  coordinate: number;
  affectedA: string[];
  affectedB: string[];
}

interface BlockHistory {
  past: GridBlock[][];
  future: GridBlock[][];
}

interface EditorState {
  propertyId: string | null;
  propertyData: PropertyData | null;
  photos: PropertyPhoto[];
  pageConfig: PageConfig;
  selectedSectionId: string | null;
  selectedBlockId: string | null;
  selectedBlockIds: string[];
  selectedSeparatorId: string | null;
  gridBlocks: GridBlock[];
  blockHistory: BlockHistory;
  toastMessage: string | null;
  containerWidth: number;
  containerHeight: number;
  sidebarOpen: boolean;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  viewMode: ViewMode;
  edgeDragState: EdgeDragState;
  isLayoutEditing: boolean;
  showBlocksInsteadOfSections: boolean;
  selectedCustomLayoutId: string | null;
  availableLayouts: ListingLayout[];
  editingLayoutId: string | null;
  previousLayoutId: string | null;

  loadProperty: (propertyId: string) => Promise<void>;
  saveConfig: () => Promise<void>;
  loadLayouts: () => Promise<void>;

  toggleSidebar: () => void;
  setSelectedSection: (sectionId: string | null) => void;
  setSelectedBlock: (blockId: string | null) => void;
  toggleBlockSelection: (blockId: string) => void;
  clearBlockSelection: () => void;
  setViewMode: (mode: ViewMode) => void;

  setLayout: (layoutId: string) => void;
  editLayout: (layoutId: string) => void;
  cancelEditing: () => void;
  setTheme: (themeId: string) => void;
  addSection: (type: SectionType) => void;
  removeSection: (sectionId: string) => void;
  updateSection: (sectionId: string, updates: Partial<Section>) => void;
  reorderSections: (sections: Section[]) => void;

  splitBlock: (blockId: string, direction: SplitDirection) => void;
  mergeBlocks: (blockId1: string, blockId2: string) => void;
  deleteBlock: (blockId: string) => void;
  assignSectionToBlock: (blockId: string, sectionId: string) => void;
  setGridBlocks: (blocks: GridBlock[]) => void;
  toggleBlockDisplayMode: (blockId: string) => void;

  toggleSeparatorSelection: (separatorId: string) => void;
  clearSeparatorSelection: () => void;
  startEdgeDrag: (edge: { orientation: 'H' | 'V'; coordinate: number; affectedA: string[]; affectedB: string[] }) => void;
  updateEdgeDrag: (newPos: number) => void;
  endEdgeDrag: () => void;

  setContainerDimensions: (width: number, height: number) => void;

  saveBlockHistory: () => void;
  undoBlocks: () => void;
  redoBlocks: () => void;
  setToastMessage: (msg: string | null) => void;

  saveCustomLayout: (name: string) => Promise<boolean>;
  loadCustomLayout: (id: string) => void;
  deleteCustomLayout: (id: string) => void;
  getCustomLayouts: () => SavedLayout[];

  getTheme: () => Theme | undefined;
  getLayout: () => Layout | undefined;
  getIsLayoutEditing: () => boolean;
}

const DEFAULT_PAGE_CONFIG: PageConfig = {
  layout: 'list',
  theme: 'modern-ocean',
  sections: [],
  globalStyle: {},
};

function createDefaultSections(): Section[] {
  return DEFAULT_SECTION_TYPES.map((type, index) => ({
    id: generateId(),
    type,
    order: index,
    enabled: true,
    content: DEFAULT_SECTION_CONTENT[type as SectionType],
    style: {},
    animations: {},
  }));
}

function createSectionsFromProperty(propertyData: PropertyData, photos: PropertyPhoto[]): Section[] {
  const sections: Section[] = [];

  // Hero section
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

  // Description section
  sections.push({
    id: generateId(),
    type: 'description',
    order: 1,
    enabled: true,
    content: {
      content: propertyData.listing_description || '',
    },
    style: {},
    animations: {},
  });

  // Characteristics section
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

  // Photos section
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

  // Contact section
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

const DEFAULT_GRID_BLOCKS: GridBlock[] = [];

export const useEditorStore = create<EditorState>((set, get) => ({
  propertyId: null,
  propertyData: null,
  photos: [],
  pageConfig: DEFAULT_PAGE_CONFIG,
  selectedSectionId: null,
  selectedBlockId: null,
  selectedBlockIds: [],
  selectedSeparatorId: null,
  gridBlocks: DEFAULT_GRID_BLOCKS,
  blockHistory: { past: [], future: [] },
  toastMessage: null,
  containerWidth: 800,
  containerHeight: 748,
  sidebarOpen: true,
  isLoading: false,
  isSaving: false,
  error: null,
  viewMode: 'desktop',
  edgeDragState: { active: false, orientation: 'H', coordinate: 0, affectedA: [], affectedB: [] },
  isLayoutEditing: false,
  showBlocksInsteadOfSections: false,
  selectedCustomLayoutId: null,
  availableLayouts: [],
  editingLayoutId: null,
  previousLayoutId: null,

  loadProperty: async (propertyId: string) => {
    set({ isLoading: true, error: null });
    try {
      const [propertyData, photos] = await Promise.all([
        supabase.fetchProperty(propertyId),
        supabase.fetchPropertyPhotos(propertyId),
      ]);

      if (!propertyData) {
        throw new Error('Property not found');
      }

      let pageConfig = propertyData.page_config || DEFAULT_PAGE_CONFIG;
      if (!pageConfig.sections || pageConfig.sections.length === 0) {
        const newSections = createSectionsFromProperty(propertyData, photos);
        pageConfig = {
          ...pageConfig,
          sections: newSections,
        };
      }

      const count = Math.max(1, pageConfig.sections.length);
      const ch = get().containerHeight > 0 ? get().containerHeight : 748;
      const blockWidth = get().containerWidth || 800;
      const h = ch / count;
      
      const gridBlocks = pageConfig.sections.map((section, index) => ({
        id: `block_${index}`,
        sectionId: section.id,
        row: 0,
        col: 0,
        bounds: { top: index * h, left: 0, right: blockWidth, bottom: (index + 1) * h },
        displayMode: 'LOCKED' as const,
      }));

      set({
        propertyId,
        propertyData,
        photos,
        pageConfig,
        gridBlocks,
        isLoading: false,
      });

      // Load available layouts from DB after property is loaded
      get().loadLayouts();
    } catch (error) {
      console.error('[loadProperty] Error:', error);
      set({ isLoading: false, error: (error as Error).message });
      throw error;
    }
  },

  saveConfig: async () => {
    const { propertyId, pageConfig } = get();
    if (!propertyId) return;

    set({ isSaving: true, error: null });
    try {
      await supabase.savePropertyConfig(propertyId, pageConfig);
      set({ isSaving: false });
    } catch (error) {
      set({ isSaving: false, error: (error as Error).message });
      throw error;
    }
  },

  loadLayouts: async () => {
    const { propertyData, pageConfig, containerWidth } = get();
    const ownerId = propertyData?.owner_id;
    const customLayouts = await supabase.fetchListingLayouts(ownerId);
    
    const blockWidth = containerWidth || 800;
    const blockHeight = containerHeight > 0 ? containerHeight : 748;

    const generatePredefinedBlocks = (layoutId: string, sections: Section[]) => {
      const count = Math.max(1, sections.length);
      const blocks: GridBlock[] = [];
      
      if (layoutId === 'two-column') {
        let currentY = 0;
        const rowHeight = blockHeight / Math.ceil(count / 1.5); // Approximate
        for (let i = 0; i < count; i++) {
          if (i % 3 === 0 || i === count - 1) { // Full width
            blocks.push({
              id: `block_${i}`, sectionId: sections[i].id, row: 0, col: 0,
              bounds: { top: currentY, left: 0, right: blockWidth, bottom: currentY + rowHeight },
              displayMode: 'LOCKED'
            });
            currentY += rowHeight;
          } else { // Half width
            const isLeft = i % 3 === 1;
            blocks.push({
              id: `block_${i}`, sectionId: sections[i].id, row: 0, col: 0,
              bounds: { 
                top: currentY, 
                left: isLeft ? 0 : blockWidth / 2, 
                right: isLeft ? blockWidth / 2 : blockWidth, 
                bottom: currentY + rowHeight 
              },
              displayMode: 'LOCKED'
            });
            if (!isLeft) currentY += rowHeight;
          }
        }
      } else if (layoutId === 'hero-first') {
        const heroHeight = blockHeight * 0.4;
        const restHeight = (blockHeight - heroHeight) / (count - 1 || 1);
        for (let i = 0; i < count; i++) {
          const top = i === 0 ? 0 : heroHeight + (i - 1) * restHeight;
          const bottom = i === 0 ? heroHeight : top + restHeight;
          blocks.push({
            id: `block_${i}`, sectionId: sections[i].id, row: 0, col: 0,
            bounds: { top, left: 0, right: blockWidth, bottom },
            displayMode: 'LOCKED'
          });
        }
      } else { // list, magazine, custom
        const h = blockHeight / count;
        for (let i = 0; i < count; i++) {
          blocks.push({
            id: `block_${i}`, sectionId: sections[i].id, row: 0, col: 0,
            bounds: { top: i * h, left: 0, right: blockWidth, bottom: (i + 1) * h },
            displayMode: 'LOCKED'
          });
        }
      }
      return blocks;
    };
    
    // Add predefined layouts from LAYOUTS constant with proper gridBlocks
    const sections = pageConfig.sections.length > 0 ? pageConfig.sections : createDefaultSections();
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
    
    const hasList = customLayouts.some(l => l.id === 'list');
    const hasTwoColumn = customLayouts.some(l => l.id === 'two-column');
    const hasMagazine = customLayouts.some(l => l.id === 'magazine');
    const hasHeroFirst = customLayouts.some(l => l.id === 'hero-first');
    
    const missingPredefined: ListingLayout[] = [];
    if (!hasList) missingPredefined.push(predefinedLayouts.find(l => l.id === 'list')!);
    if (!hasTwoColumn) missingPredefined.push(predefinedLayouts.find(l => l.id === 'two-column')!);
    if (!hasMagazine) missingPredefined.push(predefinedLayouts.find(l => l.id === 'magazine')!);
    if (!hasHeroFirst) missingPredefined.push(predefinedLayouts.find(l => l.id === 'hero-first')!);
    
    const allLayouts = [...customLayouts, ...missingPredefined];
    set({ availableLayouts: allLayouts });
  },

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSelectedSection: (sectionId) => set({ selectedSectionId: sectionId }),
  setSelectedBlock: (blockId) => set((state) => {
    const block = blockId ? state.gridBlocks.find(b => b.id === blockId) : null;
    const assignedSectionId = block?.sectionId || null;
    
    return {
      selectedBlockId: blockId,
      selectedBlockIds: blockId ? [blockId] : [],
      selectedSectionId: assignedSectionId,
    };
  }),
  toggleBlockSelection: (blockId) => set((state) => {
    const ids = state.selectedBlockIds;
    if (ids.includes(blockId)) {
      return {
        selectedBlockIds: ids.filter(id => id !== blockId),
        selectedBlockId: ids.length > 1 ? ids[0] : null,
      };
    }
    return { selectedBlockIds: [...ids, blockId] };
  }),
  clearBlockSelection: () => set({ selectedBlockIds: [], selectedBlockId: null }),
  setViewMode: (mode) => set({ viewMode: mode }),

  setLayout: (layoutId) => {
    if (layoutId === 'custom') {
      set((state) => {
        let sections = state.pageConfig.sections;

        if (sections.length === 0) {
          sections = createDefaultSections();
        }

        const gridBlocks = initializeGridState(state.containerWidth, state.containerHeight, 4);

        return {
          pageConfig: { ...state.pageConfig, layout: layoutId, sections },
          gridBlocks,
          isLayoutEditing: true,
          showBlocksInsteadOfSections: false,
          previousLayoutId: state.selectedCustomLayoutId || state.pageConfig.layout,
        };
      });
    } else {
      // Find layout in DB-loaded availableLayouts
      const dbLayout = get().availableLayouts.find(l => l.id === layoutId);
      
      if (dbLayout) {
        set((state) => {
          const gridBlocks = (dbLayout.grid_blocks as GridBlock[]) || [];
          const finalSections = state.pageConfig.sections;
          
          // Apply section assignments from DB layout (predefined layouts have them, custom don't)
          const assignedBlocks = gridBlocks.map(block => {
            const sectionId = (dbLayout.section_assignments as Record<string, string>)?.[block.id] || block.sectionId;
            return sectionId ? { ...block, sectionId } : block;
          });

          return {
            pageConfig: { ...state.pageConfig, layout: 'custom', sections: finalSections },
            gridBlocks: assignedBlocks,
            selectedBlockId: null,
            selectedBlockIds: [],
            selectedSeparatorId: null,
            isLayoutEditing: false,
            showBlocksInsteadOfSections: false,
            selectedCustomLayoutId: dbLayout.id,
            editingLayoutId: null,
            previousLayoutId: null,
          };
        });
        return;
      }
      
      // Fallback: hardcoded predefined layout from LAYOUTS constant
      const hardcodedLayout = LAYOUTS.find(l => l.id === layoutId);
      if (hardcodedLayout) {
        set((state) => {
          // If gridBlocks already exist for this layout, keep them (preserve modifications)
          if (state.gridBlocks.length > 0 && state.selectedCustomLayoutId === layoutId) {
            return {
              pageConfig: { ...state.pageConfig, layout: 'custom', sections: state.pageConfig.sections },
              selectedBlockId: null,
              selectedBlockIds: [],
              selectedSeparatorId: null,
              isLayoutEditing: false,
              showBlocksInsteadOfSections: false,
              selectedCustomLayoutId: layoutId,
              editingLayoutId: null,
              previousLayoutId: null,
            };
          }
          
          const sections = state.pageConfig.sections;
          const count = Math.max(1, sections.length);
          const blockWidth = state.containerWidth || 800;
          const ch = state.containerHeight > 0 ? state.containerHeight : 748;
          let gridBlocks: GridBlock[] = [];
          
          if (layoutId === 'two-column') {
            let currentY = 0;
            const rowHeight = ch / Math.ceil(count / 1.5);
            for (let i = 0; i < count; i++) {
              if (i % 3 === 0 || i === count - 1) {
                gridBlocks.push({
                  id: `block_${i}`, sectionId: sections[i].id, row: 0, col: 0,
                  bounds: { top: currentY, left: 0, right: blockWidth, bottom: currentY + rowHeight }, displayMode: 'LOCKED'
                });
                currentY += rowHeight;
              } else {
                const isLeft = i % 3 === 1;
                gridBlocks.push({
                  id: `block_${i}`, sectionId: sections[i].id, row: 0, col: 0,
                  bounds: { top: currentY, left: isLeft ? 0 : blockWidth / 2, right: isLeft ? blockWidth / 2 : blockWidth, bottom: currentY + rowHeight }, displayMode: 'LOCKED'
                });
                if (!isLeft) currentY += rowHeight;
              }
            }
          } else if (layoutId === 'hero-first') {
            const heroHeight = ch * 0.4;
            const restHeight = (ch - heroHeight) / (count - 1 || 1);
            for (let i = 0; i < count; i++) {
              const top = i === 0 ? 0 : heroHeight + (i - 1) * restHeight;
              const bottom = i === 0 ? heroHeight : top + restHeight;
              gridBlocks.push({
                id: `block_${i}`, sectionId: sections[i].id, row: 0, col: 0,
                bounds: { top, left: 0, right: blockWidth, bottom }, displayMode: 'LOCKED'
              });
            }
          } else {
            const h = ch / count;
            for (let i = 0; i < count; i++) {
              gridBlocks.push({
                id: `block_${i}`, sectionId: sections[i].id, row: 0, col: 0,
                bounds: { top: i * h, left: 0, right: blockWidth, bottom: (i + 1) * h }, displayMode: 'LOCKED'
              });
            }
          }
          
          return {
            pageConfig: { ...state.pageConfig, layout: 'custom', sections },
            gridBlocks,
            selectedBlockId: null,
            selectedBlockIds: [],
            selectedSeparatorId: null,
            isLayoutEditing: false,
            showBlocksInsteadOfSections: false,
            selectedCustomLayoutId: layoutId,
            editingLayoutId: null,
            previousLayoutId: null,
          };
        });
      }
    }
  },

  editLayout: (layoutId) => {
    const dbLayout = get().availableLayouts.find(l => l.id === layoutId);
    if (!dbLayout) return;

    set((state) => {
      const gridBlocks = (dbLayout.grid_blocks as GridBlock[]) || [];
      const finalSections = state.pageConfig.sections;
      
      // Apply section assignments from DB layout
      const assignedBlocks = gridBlocks.map(block => {
        const sectionId = (dbLayout.section_assignments as Record<string, string>)?.[block.id] || block.sectionId;
        return sectionId ? { ...block, sectionId } : block;
      });

      return {
        pageConfig: { ...state.pageConfig, layout: 'custom', sections: finalSections },
        gridBlocks: assignedBlocks.length > 0 ? assignedBlocks : initializeGridState(state.containerWidth, state.containerHeight, 4),
        selectedBlockId: null,
        selectedBlockIds: [],
        selectedSeparatorId: null,
        isLayoutEditing: true,
        showBlocksInsteadOfSections: false,
        selectedCustomLayoutId: dbLayout.type === 'custom' ? dbLayout.id : null,
        editingLayoutId: dbLayout.id,
        previousLayoutId: state.selectedCustomLayoutId || state.pageConfig.layout,
      };
    });
  },

  cancelEditing: () => {
    const { previousLayoutId } = get();
    if (previousLayoutId) {
      get().setLayout(previousLayoutId);
    } else {
      set({
        isLayoutEditing: false,
        editingLayoutId: null,
        previousLayoutId: null,
      });
    }
  },

  setTheme: (themeId) => set((state) => ({
    pageConfig: { ...state.pageConfig, theme: themeId },
  })),

  addSection: (type) => set((state) => {
    const newSection: Section = {
      id: generateId(),
      type,
      order: state.pageConfig.sections.length,
      enabled: true,
      content: DEFAULT_SECTION_CONTENT[type],
      style: {},
      animations: {},
    };

    const newSections = [...state.pageConfig.sections, newSection];

    if (state.pageConfig.layout === 'custom' && state.gridBlocks.length > 0) {
      const lastBlock = state.gridBlocks[state.gridBlocks.length - 1];
      const updatedBlocks = state.gridBlocks.map(b =>
        b.id === lastBlock.id ? { ...b, sectionId: newSection.id } : b
      );

      return {
        pageConfig: { ...state.pageConfig, sections: newSections },
        gridBlocks: updatedBlocks,
      };
    }

    return {
      pageConfig: { ...state.pageConfig, sections: newSections },
    };
  }),

  removeSection: (sectionId) => set((state) => ({
    pageConfig: {
      ...state.pageConfig,
      sections: state.pageConfig.sections
        .filter((s) => s.id !== sectionId)
        .map((s, i) => ({ ...s, order: i })),
    },
    selectedSectionId: state.selectedSectionId === sectionId ? null : state.selectedSectionId,
  })),

  updateSection: (sectionId, updates) => set((state) => {
      const newSections = state.pageConfig.sections.map((s) =>
        s.id === sectionId ? { ...s, ...updates } : s
      );
      return {
        pageConfig: {
          ...state.pageConfig,
          sections: newSections,
        },
      };
    }),

  reorderSections: (sections) => set((state) => ({
    pageConfig: {
      ...state.pageConfig,
      sections: sections.map((s, i) => ({ ...s, order: i })),
    },
  })),

  getTheme: () => THEMES.find((t) => t.id === get().pageConfig.theme),
  getLayout: () => LAYOUTS.find((l) => l.id === get().pageConfig.layout),

  splitBlock: (blockId, direction) => {
    const state = get();
    const idx = state.gridBlocks.findIndex(b => b.id === blockId);
    const target = state.gridBlocks[idx];
    if (!target) return;

    get().saveBlockHistory();

    if (direction === 'vertical') {
      const width = target.bounds.right - target.bounds.left;
      if (width < 100) return;
      const halfW = Math.round(width / 2);
      const newBlocks = [...state.gridBlocks];
      newBlocks[idx] = { ...target, bounds: { ...target.bounds, right: target.bounds.left + halfW } };
      newBlocks.splice(idx + 1, 0, {
        ...target,
        id: 'blk_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        sectionId: undefined,
        bounds: { ...target.bounds, left: target.bounds.left + halfW },
      });
      set({
        gridBlocks: newBlocks,
        selectedBlockId: blockId,
        pageConfig: { ...state.pageConfig, layout: 'custom' },
        selectedCustomLayoutId: null,
      });
    } else {
      const height = target.bounds.bottom - target.bounds.top;
      if (height < 100) return;
      const halfH = Math.round(height / 2);
      const newBlocks = [...state.gridBlocks];
      newBlocks[idx] = { ...target, bounds: { ...target.bounds, bottom: target.bounds.top + halfH } };
      newBlocks.splice(idx + 1, 0, {
        ...target,
        id: 'blk_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
        sectionId: undefined,
        bounds: { ...target.bounds, top: target.bounds.top + halfH },
      });
      set({
        gridBlocks: newBlocks,
        selectedBlockId: blockId,
        pageConfig: { ...state.pageConfig, layout: 'custom' },
        selectedCustomLayoutId: null,
      });
    }
  },

  mergeBlocks: (blockId1, blockId2) => {
    const state = get();
    get().saveBlockHistory();
    const merged = mergeBlocks(state.gridBlocks, blockId1, blockId2);
    if (merged !== state.gridBlocks) {
      set({ gridBlocks: merged, selectedBlockId: null, selectedBlockIds: [] });
    } else {
      get().setToastMessage('Merge failed: blocks must form a perfect rectangle');
    }
  },

  deleteBlock: (blockId) => {
    const state = get();
    get().saveBlockHistory();
    const updated = state.gridBlocks.filter(b => b.id !== blockId);
    set({
      gridBlocks: updated,
      selectedBlockId: null,
      selectedBlockIds: [],
    });
  },

  assignSectionToBlock: (blockId, sectionId) => {
    get().saveBlockHistory();
    set((state) => ({
      gridBlocks: state.gridBlocks.map(block =>
        block.id === blockId
          ? { ...block, sectionId: sectionId || undefined, displayMode: sectionId ? 'LOCKED' : 'UNLOCKED' }
          : block
      ),
    }));
  },

  setGridBlocks: (blocks) => set({ gridBlocks: blocks }),

  toggleBlockDisplayMode: (blockId) => set((state) => ({
    gridBlocks: state.gridBlocks.map(block =>
      block.id === blockId
        ? { ...block, displayMode: block.displayMode === 'LOCKED' ? 'UNLOCKED' : 'LOCKED' }
        : block
    ),
  })),

  toggleSeparatorSelection: (separatorId) => {
    set((state) => {
      const newValue = state.selectedSeparatorId === separatorId ? null : separatorId;
      return { selectedSeparatorId: newValue };
    });
  },

  clearSeparatorSelection: () => set({ selectedSeparatorId: null }),

  startEdgeDrag: (edge) => {
    get().saveBlockHistory();
    set({ edgeDragState: { ...edge, active: true } });
  },

  updateEdgeDrag: (newPos: number) => {
    const state = get();
    if (!state.edgeDragState.active) return;

    const { blocks: updated, appliedPos } = applyDragToBlocks(
      state.gridBlocks,
      state.edgeDragState,
      newPos,
      state.containerWidth,
      state.containerHeight
    );

    set({
      gridBlocks: updated,
      edgeDragState: { ...state.edgeDragState, coordinate: appliedPos },
    });
  },

  endEdgeDrag: () => set({
    edgeDragState: { active: false, orientation: 'H', coordinate: 0, affectedA: [], affectedB: [] },
    selectedSeparatorId: null,
  }),

  setContainerDimensions: (width, height) => set({ containerWidth: width, containerHeight: height }),

  saveBlockHistory: () => {
    const { gridBlocks, blockHistory } = get();
    set({
      blockHistory: {
        past: [...blockHistory.past.slice(-29), gridBlocks],
        future: [],
      },
    });
  },

  undoBlocks: () => {
    const { blockHistory, gridBlocks } = get();
    if (blockHistory.past.length === 0) return;
    const previous = blockHistory.past[blockHistory.past.length - 1];
    set({
      blockHistory: {
        past: blockHistory.past.slice(0, -1),
        future: [gridBlocks, ...blockHistory.future],
      },
      gridBlocks: previous,
      selectedBlockId: null,
      selectedBlockIds: [],
    });
  },

  redoBlocks: () => {
    const { blockHistory, gridBlocks } = get();
    if (blockHistory.future.length === 0) return;
    const next = blockHistory.future[0];
    set({
      blockHistory: {
        past: [...blockHistory.past, gridBlocks],
        future: blockHistory.future.slice(1),
      },
      gridBlocks: next,
      selectedBlockId: null,
      selectedBlockIds: [],
    });
  },

  setToastMessage: (msg) => {
    set({ toastMessage: msg });
    if (msg) {
      setTimeout(() => {
        const current = get().toastMessage;
        if (current === msg) set({ toastMessage: null });
      }, 2500);
    }
  },

  saveCustomLayout: async (name) => {
    const { gridBlocks, propertyData, editingLayoutId, availableLayouts } = get();
    if (gridBlocks.length === 0) return false;

    const existingLayout = editingLayoutId ? availableLayouts.find(l => l.id === editingLayoutId) : null;
    const isUpdatingCustom = existingLayout && existingLayout.type === 'custom';

    let saved;
    if (isUpdatingCustom && editingLayoutId) {
      // Update existing custom layout in place
      saved = await supabase.saveListingLayout({
        id: editingLayoutId,
        name: name || existingLayout.name,
        type: 'custom',
        grid_blocks: gridBlocks as unknown[],
        section_assignments: {},
        owner_id: propertyData?.owner_id || '',
      });
    } else {
      // Save as new custom layout (editing predefined or fresh custom)
      const layoutId = `layout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      saved = await supabase.saveListingLayout({
        id: layoutId,
        name,
        type: 'custom',
        grid_blocks: gridBlocks as unknown[],
        section_assignments: {},
        owner_id: propertyData?.owner_id || '',
      });
    }

    if (saved) {
      // Refresh layouts list
      await get().loadLayouts();
      // Switch to the saved layout (exit editing mode)
      get().setLayout(saved.id);
      return true;
    }
    return false;
  },

  loadCustomLayout: (id) => {
    // Now handled by setLayout which uses availableLayouts from DB
    get().setLayout(id);
  },

  deleteCustomLayout: async (id) => {
    const success = await supabase.deleteListingLayout(id);
    if (success) {
      // Refresh layouts list
      await get().loadLayouts();

      const state = get();
      if (state.selectedCustomLayoutId === id) {
        set({
          pageConfig: {
            ...state.pageConfig,
            layout: 'list',
          },
          gridBlocks: [],
          selectedBlockId: null,
          selectedBlockIds: [],
          selectedSeparatorId: null,
          selectedCustomLayoutId: null,
        });
      }
    }
  },

  getCustomLayouts: () => {
    return get().availableLayouts as unknown as SavedLayout[];
  },

  getIsLayoutEditing: () => get().isLayoutEditing,
}));
