// Layout types correspond to CSS classes in preview-generation.service.ts
// fullscreen: Hero Fullscreen with fade-in animation + scroll indicator
// split: Split screen (photo left, content right) with slide-in animation
// grid: Photo grid with hover zoom effects
// carousel: Sliding photo carousel
// masonry: Pinterest-style masonry layout
// sidebar: Sticky sidebar photos, scrolling content
// classic: Legacy hero section (backward compat)
export interface EditorLayout {
    id: string;
    name: string;
    description: string;
    icon: string;
    thumbnail?: string;
    config: {
        layoutType: 'fullscreen' | 'split' | 'grid' | 'carousel' | 'masonry' | 'sidebar' | 'classic' | 'modern' | 'minimal';
        photoPlacement: 'hero' | 'grid' | 'sidebar' | 'masonry' | 'carousel' | 'none';
        contentFlow: 'linear' | 'modular' | 'tabbed' | 'accordion';
        mobileOptimized: boolean;
    };
    // Template structure for preview generation
    templateSections: Array<{
        type: 'hero' | 'headline' | 'property-info' | 'description' | 'amenities' | 'contact' | 'gallery';
        order: number;
        visible: boolean;
        style?: string;
    }>;
}

export const LISTING_LAYOUTS: EditorLayout[] = [
    { 
        id: 'hero-fullscreen', 
        name: 'Hero Fullscreen', 
        description: 'Full viewport hero with fade-in animation and scroll indicator', 
        icon: '✨', 
        config: { layoutType: 'fullscreen', photoPlacement: 'hero', contentFlow: 'linear', mobileOptimized: true },
        templateSections: [
            { type: 'hero', order: 0, visible: true, style: 'fullscreen' },
            { type: 'headline', order: 1, visible: true, style: 'centered' },
            { type: 'property-info', order: 2, visible: true, style: 'cards' },
            { type: 'description', order: 3, visible: true, style: 'elegant' },
            { type: 'amenities', order: 4, visible: true, style: 'grid-3-col' },
            { type: 'contact', order: 5, visible: true, style: 'sidebar' }
        ]
    },
    { 
        id: 'split', 
        name: 'Split View', 
        description: 'Photo on left, content on right with slide-in animation', 
        icon: '↔️', 
        config: { layoutType: 'split', photoPlacement: 'sidebar', contentFlow: 'modular', mobileOptimized: true },
        templateSections: [
            { type: 'hero', order: 0, visible: true, style: 'split-left' },
            { type: 'headline', order: 1, visible: true, style: 'split-right' },
            { type: 'property-info', order: 2, visible: true, style: 'right-panel' },
            { type: 'description', order: 3, visible: true, style: 'right-panel-text' },
            { type: 'amenities', order: 4, visible: true, style: 'right-panel-list' },
            { type: 'contact', order: 5, visible: true, style: 'sticky-sidebar' }
        ]
    },
    { 
        id: 'gallery-grid', 
        name: 'Gallery Grid', 
        description: 'Photo grid with hover zoom effects and captions', 
        icon: '🖼️', 
        config: { layoutType: 'grid', photoPlacement: 'grid', contentFlow: 'modular', mobileOptimized: true },
        templateSections: [
            { type: 'hero', order: 0, visible: true, style: 'gallery-hero' },
            { type: 'headline', order: 1, visible: true, style: 'overlay' },
            { type: 'property-info', order: 2, visible: true, style: 'compact-overlay' },
            { type: 'amenities', order: 3, visible: true, style: 'icon-badges' },
            { type: 'description', order: 4, visible: true, style: 'minimal-block' },
            { type: 'contact', order: 5, visible: true, style: 'gallery-footer' }
        ]
    },
    { 
        id: 'carousel', 
        name: 'Photo Carousel', 
        description: 'Sliding photo carousel with navigation', 
        icon: '🎠', 
        config: { layoutType: 'carousel', photoPlacement: 'carousel', contentFlow: 'linear', mobileOptimized: true },
        templateSections: [
            { type: 'hero', order: 0, visible: true, style: 'carousel-hero' },
            { type: 'gallery', order: 1, visible: true, style: 'carousel-slides' },
            { type: 'headline', order: 2, visible: true, style: 'carousel-title' },
            { type: 'property-info', order: 3, visible: true, style: 'carousel-info' },
            { type: 'description', order: 4, visible: true, style: 'narrative' },
            { type: 'amenities', order: 5, visible: true, style: 'feature-list' },
            { type: 'contact', order: 6, visible: true, style: 'personal-note' }
        ]
    },
    { 
        id: 'masonry', 
        name: 'Masonry', 
        description: 'Pinterest-style masonry photo layout', 
        icon: '📐', 
        config: { layoutType: 'masonry', photoPlacement: 'masonry', contentFlow: 'modular', mobileOptimized: true },
        templateSections: [
            { type: 'hero', order: 0, visible: true, style: 'masonry-hero' },
            { type: 'headline', order: 1, visible: true, style: 'overlay' },
            { type: 'property-info', order: 2, visible: true, style: 'compact-overlay' },
            { type: 'amenities', order: 3, visible: true, style: 'icon-badges' },
            { type: 'description', order: 4, visible: true, style: 'minimal-block' },
            { type: 'contact', order: 5, visible: true, style: 'gallery-footer' }
        ]
    },
    { 
        id: 'sidebar-scroll', 
        name: 'Sidebar Scroll', 
        description: 'Sticky sidebar photos with scrolling content', 
        icon: '📜', 
        config: { layoutType: 'sidebar', photoPlacement: 'sidebar', contentFlow: 'linear', mobileOptimized: true },
        templateSections: [
            { type: 'hero', order: 0, visible: true, style: 'sidebar-hero' },
            { type: 'headline', order: 1, visible: true, style: 'sidebar-header' },
            { type: 'property-info', order: 2, visible: true, style: 'sidebar-stats' },
            { type: 'description', order: 3, visible: true, style: 'sidebar-content' },
            { type: 'amenities', order: 4, visible: true, style: 'sidebar-list' },
            { type: 'contact', order: 5, visible: true, style: 'sidebar-form' }
        ]
    },
    { 
        id: 'classic', 
        name: 'Classic', 
        description: 'Traditional listing layout', 
        icon: '📋', 
        config: { layoutType: 'classic', photoPlacement: 'hero', contentFlow: 'linear', mobileOptimized: true },
        templateSections: [
            { type: 'hero', order: 0, visible: true, style: 'full-width' },
            { type: 'headline', order: 1, visible: true, style: 'centered' },
            { type: 'property-info', order: 2, visible: true, style: 'cards' },
            { type: 'description', order: 3, visible: true, style: 'elegant' },
            { type: 'amenities', order: 4, visible: true, style: 'grid-3-col' },
            { type: 'contact', order: 5, visible: true, style: 'sidebar' }
        ]
    },
    { 
        id: 'modern', 
        name: 'Modern Minimal', 
        description: 'Clean modern design with white space', 
        icon: '🎨', 
        config: { layoutType: 'modern', photoPlacement: 'grid', contentFlow: 'modular', mobileOptimized: true },
        templateSections: [
            { type: 'headline', order: 0, visible: true, style: 'bold-large' },
            { type: 'hero', order: 1, visible: true, style: 'split-screen' },
            { type: 'property-info', order: 2, visible: true, style: 'minimal-icons' },
            { type: 'amenities', order: 3, visible: true, style: 'bullet-modern' },
            { type: 'description', order: 4, visible: true, style: 'clean-text' },
            { type: 'contact', order: 5, visible: true, style: 'floating-card' }
        ]
    },
    { 
        id: 'minimal', 
        name: 'Minimalist', 
        description: 'Text-focused, minimal photos', 
        icon: '📝', 
        config: { layoutType: 'minimal', photoPlacement: 'grid', contentFlow: 'linear', mobileOptimized: true },
        templateSections: [
            { type: 'headline', order: 0, visible: true, style: 'typography-hero' },
            { type: 'property-info', order: 1, visible: true, style: 'simple-stats' },
            { type: 'description', order: 2, visible: true, style: 'clean-prose' },
            { type: 'amenities', order: 3, visible: true, style: 'simple-bullets' },
            { type: 'hero', order: 4, visible: true, style: 'small-grid' },
            { type: 'contact', order: 5, visible: true, style: 'minimal-form' }
        ]
    }
];

export const WELCOME_BOOKLET_LAYOUTS: EditorLayout[] = [
    { id: 'hero-fullscreen', name: 'Hero Fullscreen', description: 'Full viewport hero with animations', icon: '✨', config: { layoutType: 'fullscreen', photoPlacement: 'hero', contentFlow: 'linear', mobileOptimized: true }, templateSections: [
        { type: 'hero', order: 0, visible: true, style: 'fullscreen' },
        { type: 'headline', order: 1, visible: true, style: 'centered' },
        { type: 'property-info', order: 2, visible: true, style: 'cards' },
        { type: 'description', order: 3, visible: true, style: 'elegant' },
        { type: 'amenities', order: 4, visible: true, style: 'grid-3-col' },
        { type: 'contact', order: 5, visible: true, style: 'sidebar' }
    ]},
    { id: 'gallery-grid', name: 'Gallery Grid', description: 'Photo grid with hover effects', icon: '🖼️', config: { layoutType: 'grid', photoPlacement: 'grid', contentFlow: 'modular', mobileOptimized: true }, templateSections: [
        { type: 'hero', order: 0, visible: true, style: 'gallery-hero' },
        { type: 'gallery', order: 1, visible: true, style: 'grid-3-col' },
        { type: 'headline', order: 2, visible: true, style: 'overlay' },
        { type: 'property-info', order: 3, visible: true, style: 'compact-overlay' },
        { type: 'amenities', order: 4, visible: true, style: 'icon-badges' },
        { type: 'description', order: 5, visible: true, style: 'minimal-block' },
        { type: 'contact', order: 6, visible: true, style: 'gallery-footer' }
    ]},
    { id: 'masonry', name: 'Masonry', description: 'Pinterest-style masonry layout', icon: '📐', config: { layoutType: 'masonry', photoPlacement: 'masonry', contentFlow: 'modular', mobileOptimized: true }, templateSections: [
        { type: 'hero', order: 0, visible: true, style: 'masonry-hero' },
        { type: 'headline', order: 1, visible: true, style: 'overlay' },
        { type: 'property-info', order: 2, visible: true, style: 'compact-overlay' },
        { type: 'amenities', order: 3, visible: true, style: 'icon-badges' },
        { type: 'description', order: 4, visible: true, style: 'minimal-block' },
        { type: 'contact', order: 5, visible: true, style: 'gallery-footer' }
    ]},
    { id: 'sidebar-scroll', name: 'Sidebar Scroll', description: 'Sticky sidebar photos with content', icon: '📜', config: { layoutType: 'sidebar', photoPlacement: 'sidebar', contentFlow: 'linear', mobileOptimized: true }, templateSections: [
        { type: 'hero', order: 0, visible: true, style: 'sidebar-hero' },
        { type: 'headline', order: 1, visible: true, style: 'sidebar-header' },
        { type: 'property-info', order: 2, visible: true, style: 'sidebar-stats' },
        { type: 'description', order: 3, visible: true, style: 'sidebar-content' },
        { type: 'amenities', order: 4, visible: true, style: 'sidebar-list' },
        { type: 'contact', order: 5, visible: true, style: 'sidebar-form' }
    ]},
    { id: 'split', name: 'Split View', description: 'Side-by-side photo and content', icon: '↔️', config: { layoutType: 'split', photoPlacement: 'sidebar', contentFlow: 'modular', mobileOptimized: true }, templateSections: [
        { type: 'hero', order: 0, visible: true, style: 'split-left' },
        { type: 'headline', order: 1, visible: true, style: 'split-right' },
        { type: 'property-info', order: 2, visible: true, style: 'right-panel' },
        { type: 'description', order: 3, visible: true, style: 'right-panel-text' },
        { type: 'amenities', order: 4, visible: true, style: 'right-panel-list' },
        { type: 'contact', order: 5, visible: true, style: 'sticky-sidebar' }
    ]},
    { id: 'minimal', name: 'Minimalist', description: 'Clean minimal design', icon: '🎨', config: { layoutType: 'minimal', photoPlacement: 'grid', contentFlow: 'linear', mobileOptimized: true }, templateSections: [
        { type: 'headline', order: 0, visible: true, style: 'typography-hero' },
        { type: 'property-info', order: 1, visible: true, style: 'simple-stats' },
        { type: 'description', order: 2, visible: true, style: 'clean-prose' },
        { type: 'amenities', order: 3, visible: true, style: 'simple-bullets' },
        { type: 'hero', order: 4, visible: true, style: 'small-grid' },
        { type: 'contact', order: 5, visible: true, style: 'minimal-form' }
    ]}
];

export const MICROSITE_LAYOUTS: EditorLayout[] = [
    { id: 'hero-fullscreen', name: 'Hero Fullscreen', description: 'Full viewport hero for conversions', icon: '✨', config: { layoutType: 'fullscreen', photoPlacement: 'hero', contentFlow: 'linear', mobileOptimized: true }, templateSections: [
        { type: 'hero', order: 0, visible: true, style: 'fullscreen' },
        { type: 'headline', order: 1, visible: true, style: 'centered' },
        { type: 'property-info', order: 2, visible: true, style: 'cards' },
        { type: 'description', order: 3, visible: true, style: 'elegant' },
        { type: 'amenities', order: 4, visible: true, style: 'grid-3-col' },
        { type: 'contact', order: 5, visible: true, style: 'sidebar' }
    ]},
    { id: 'split', name: 'Split View', description: 'Conversion-focused split layout', icon: '↔️', config: { layoutType: 'split', photoPlacement: 'sidebar', contentFlow: 'modular', mobileOptimized: true }, templateSections: [
        { type: 'hero', order: 0, visible: true, style: 'split-left' },
        { type: 'headline', order: 1, visible: true, style: 'split-right' },
        { type: 'property-info', order: 2, visible: true, style: 'right-panel' },
        { type: 'description', order: 3, visible: true, style: 'right-panel-text' },
        { type: 'amenities', order: 4, visible: true, style: 'right-panel-list' },
        { type: 'contact', order: 5, visible: true, style: 'sticky-sidebar' }
    ]},
    { id: 'gallery-grid', name: 'Gallery Grid', description: 'Visual-heavy grid for tourism', icon: '🖼️', config: { layoutType: 'grid', photoPlacement: 'grid', contentFlow: 'modular', mobileOptimized: true }, templateSections: [
        { type: 'hero', order: 0, visible: true, style: 'gallery-hero' },
        { type: 'headline', order: 1, visible: true, style: 'overlay' },
        { type: 'property-info', order: 2, visible: true, style: 'compact-overlay' },
        { type: 'amenities', order: 3, visible: true, style: 'icon-badges' },
        { type: 'description', order: 4, visible: true, style: 'minimal-block' },
        { type: 'contact', order: 5, visible: true, style: 'gallery-footer' }
    ]},
    { id: 'masonry', name: 'Masonry', description: 'Editorial masonry layout', icon: '📐', config: { layoutType: 'masonry', photoPlacement: 'masonry', contentFlow: 'modular', mobileOptimized: true }, templateSections: [
        { type: 'hero', order: 0, visible: true, style: 'masonry-hero' },
        { type: 'headline', order: 1, visible: true, style: 'overlay' },
        { type: 'property-info', order: 2, visible: true, style: 'compact-overlay' },
        { type: 'amenities', order: 3, visible: true, style: 'icon-badges' },
        { type: 'description', order: 4, visible: true, style: 'minimal-block' },
        { type: 'contact', order: 5, visible: true, style: 'gallery-footer' }
    ]},
    { id: 'minimal', name: 'Minimal', description: 'Minimal convert-optimized layout', icon: '🎨', config: { layoutType: 'minimal', photoPlacement: 'grid', contentFlow: 'linear', mobileOptimized: true }, templateSections: [
        { type: 'headline', order: 0, visible: true, style: 'typography-hero' },
        { type: 'property-info', order: 1, visible: true, style: 'simple-stats' },
        { type: 'description', order: 2, visible: true, style: 'clean-prose' },
        { type: 'amenities', order: 3, visible: true, style: 'simple-bullets' },
        { type: 'hero', order: 4, visible: true, style: 'small-grid' },
        { type: 'contact', order: 5, visible: true, style: 'minimal-form' }
    ]}
];
