export interface EditorLayout {
    id: string;
    name: string;
    description: string;
    icon: string;
    thumbnail?: string;
    config: {
        layoutType: 'editorial' | 'cinematic' | 'minimal' | 'story';
        heroHeight: '70vh' | '60vh' | '50vh' | 'sections';
        photoPlacement: 'hero' | 'carousel' | 'gallery' | 'none';
        contentFlow: 'linear' | 'modular' | 'scroll';
        mobileOptimized: boolean;
    };
    templateSections: Array<{
        type: 'hero' | 'headline' | 'property-info' | 'description' | 'amenities' | 'contact' | 'gallery';
        order: number;
        visible: boolean;
        style?: string;
    }>;
}

export const LISTING_LAYOUTS: EditorLayout[] = [
    { 
        id: 'editorial', 
        name: 'Editorial', 
        description: 'Full-bleed hero with elegant content panel below', 
        icon: '◰',
        config: { layoutType: 'editorial', heroHeight: '70vh', photoPlacement: 'hero', contentFlow: 'linear', mobileOptimized: true },
        templateSections: [
            { type: 'hero', order: 0, visible: true, style: 'editorial-hero' },
            { type: 'headline', order: 1, visible: true, style: 'editorial-title' },
            { type: 'property-info', order: 2, visible: true, style: 'inline' },
            { type: 'description', order: 3, visible: true, style: 'editorial-text' },
            { type: 'amenities', order: 4, visible: true, style: 'editorial-amenities' },
            { type: 'contact', order: 5, visible: true, style: 'editorial-contact' }
        ]
    },
    { 
        id: 'cinematic', 
        name: 'Cinematic', 
        description: 'Horizontal gallery scroll with floating info', 
        icon: '▸▸',
        config: { layoutType: 'cinematic', heroHeight: '60vh', photoPlacement: 'carousel', contentFlow: 'linear', mobileOptimized: true },
        templateSections: [
            { type: 'gallery', order: 0, visible: true, style: 'cinematic-carousel' },
            { type: 'headline', order: 1, visible: true, style: 'cinematic-title' },
            { type: 'property-info', order: 2, visible: true, style: 'cinematic-info' },
            { type: 'description', order: 3, visible: true, style: 'cinematic-text' },
            { type: 'amenities', order: 4, visible: true, style: 'cinematic-amenities' },
            { type: 'contact', order: 5, visible: true, style: 'cinematic-contact' }
        ]
    },
    { 
        id: 'minimal', 
        name: 'Minimal', 
        description: 'Text overlay on hero with clean details', 
        icon: '◻',
        config: { layoutType: 'minimal', heroHeight: '50vh', photoPlacement: 'hero', contentFlow: 'linear', mobileOptimized: true },
        templateSections: [
            { type: 'hero', order: 0, visible: true, style: 'minimal-hero' },
            { type: 'headline', order: 1, visible: true, style: 'minimal-title' },
            { type: 'property-info', order: 2, visible: true, style: 'minimal-info' },
            { type: 'description', order: 3, visible: true, style: 'minimal-text' },
            { type: 'amenities', order: 4, visible: true, style: 'minimal-amenities' },
            { type: 'contact', order: 5, visible: true, style: 'minimal-contact' }
        ]
    },
    { 
        id: 'story', 
        name: 'Story', 
        description: 'Vertical scroll journey with sections', 
        icon: '☰',
        config: { layoutType: 'story', heroHeight: 'sections', photoPlacement: 'gallery', contentFlow: 'scroll', mobileOptimized: true },
        templateSections: [
            { type: 'hero', order: 0, visible: true, style: 'story-hero' },
            { type: 'headline', order: 1, visible: true, style: 'story-title' },
            { type: 'description', order: 2, visible: true, style: 'story-text' },
            { type: 'property-info', order: 3, visible: true, style: 'story-info' },
            { type: 'gallery', order: 4, visible: true, style: 'story-gallery' },
            { type: 'amenities', order: 5, visible: true, style: 'story-amenities' },
            { type: 'contact', order: 6, visible: true, style: 'story-contact' }
        ]
    }
];

export const WELCOME_BOOKLET_LAYOUTS: EditorLayout[] = [
    { 
        id: 'editorial', 
        name: 'Editorial', 
        description: 'Full-bleed hero with elegant content panel below', 
        icon: '◰',
        config: { layoutType: 'editorial', heroHeight: '70vh', photoPlacement: 'hero', contentFlow: 'linear', mobileOptimized: true },
        templateSections: [
            { type: 'hero', order: 0, visible: true, style: 'editorial-hero' },
            { type: 'headline', order: 1, visible: true, style: 'editorial-title' },
            { type: 'property-info', order: 2, visible: true, style: 'inline' },
            { type: 'description', order: 3, visible: true, style: 'editorial-text' },
            { type: 'amenities', order: 4, visible: true, style: 'editorial-amenities' },
            { type: 'contact', order: 5, visible: true, style: 'editorial-contact' }
        ]
    },
    { 
        id: 'cinematic', 
        name: 'Cinematic', 
        description: 'Horizontal gallery scroll with floating info', 
        icon: '▸▸',
        config: { layoutType: 'cinematic', heroHeight: '60vh', photoPlacement: 'carousel', contentFlow: 'linear', mobileOptimized: true },
        templateSections: [
            { type: 'gallery', order: 0, visible: true, style: 'cinematic-carousel' },
            { type: 'headline', order: 1, visible: true, style: 'cinematic-title' },
            { type: 'property-info', order: 2, visible: true, style: 'cinematic-info' },
            { type: 'description', order: 3, visible: true, style: 'cinematic-text' },
            { type: 'amenities', order: 4, visible: true, style: 'cinematic-amenities' },
            { type: 'contact', order: 5, visible: true, style: 'cinematic-contact' }
        ]
    },
    { 
        id: 'minimal', 
        name: 'Minimal', 
        description: 'Text overlay on hero with clean details', 
        icon: '◻',
        config: { layoutType: 'minimal', heroHeight: '50vh', photoPlacement: 'hero', contentFlow: 'linear', mobileOptimized: true },
        templateSections: [
            { type: 'hero', order: 0, visible: true, style: 'minimal-hero' },
            { type: 'headline', order: 1, visible: true, style: 'minimal-title' },
            { type: 'property-info', order: 2, visible: true, style: 'minimal-info' },
            { type: 'description', order: 3, visible: true, style: 'minimal-text' },
            { type: 'amenities', order: 4, visible: true, style: 'minimal-amenities' },
            { type: 'contact', order: 5, visible: true, style: 'minimal-contact' }
        ]
    },
    { 
        id: 'story', 
        name: 'Story', 
        description: 'Vertical scroll journey with sections', 
        icon: '☰',
        config: { layoutType: 'story', heroHeight: 'sections', photoPlacement: 'gallery', contentFlow: 'scroll', mobileOptimized: true },
        templateSections: [
            { type: 'hero', order: 0, visible: true, style: 'story-hero' },
            { type: 'headline', order: 1, visible: true, style: 'story-title' },
            { type: 'description', order: 2, visible: true, style: 'story-text' },
            { type: 'property-info', order: 3, visible: true, style: 'story-info' },
            { type: 'gallery', order: 4, visible: true, style: 'story-gallery' },
            { type: 'amenities', order: 5, visible: true, style: 'story-amenities' },
            { type: 'contact', order: 6, visible: true, style: 'story-contact' }
        ]
    }
];

export const MICROSITE_LAYOUTS: EditorLayout[] = [
    { 
        id: 'editorial', 
        name: 'Editorial', 
        description: 'Full-bleed hero with elegant content panel below', 
        icon: '◰',
        config: { layoutType: 'editorial', heroHeight: '70vh', photoPlacement: 'hero', contentFlow: 'linear', mobileOptimized: true },
        templateSections: [
            { type: 'hero', order: 0, visible: true, style: 'editorial-hero' },
            { type: 'headline', order: 1, visible: true, style: 'editorial-title' },
            { type: 'property-info', order: 2, visible: true, style: 'inline' },
            { type: 'description', order: 3, visible: true, style: 'editorial-text' },
            { type: 'amenities', order: 4, visible: true, style: 'editorial-amenities' },
            { type: 'contact', order: 5, visible: true, style: 'editorial-contact' }
        ]
    },
    { 
        id: 'cinematic', 
        name: 'Cinematic', 
        description: 'Horizontal gallery scroll with floating info', 
        icon: '▸▸',
        config: { layoutType: 'cinematic', heroHeight: '60vh', photoPlacement: 'carousel', contentFlow: 'linear', mobileOptimized: true },
        templateSections: [
            { type: 'gallery', order: 0, visible: true, style: 'cinematic-carousel' },
            { type: 'headline', order: 1, visible: true, style: 'cinematic-title' },
            { type: 'property-info', order: 2, visible: true, style: 'cinematic-info' },
            { type: 'description', order: 3, visible: true, style: 'cinematic-text' },
            { type: 'amenities', order: 4, visible: true, style: 'cinematic-amenities' },
            { type: 'contact', order: 5, visible: true, style: 'cinematic-contact' }
        ]
    },
    { 
        id: 'minimal', 
        name: 'Minimal', 
        description: 'Text overlay on hero with clean details', 
        icon: '◻',
        config: { layoutType: 'minimal', heroHeight: '50vh', photoPlacement: 'hero', contentFlow: 'linear', mobileOptimized: true },
        templateSections: [
            { type: 'hero', order: 0, visible: true, style: 'minimal-hero' },
            { type: 'headline', order: 1, visible: true, style: 'minimal-title' },
            { type: 'property-info', order: 2, visible: true, style: 'minimal-info' },
            { type: 'description', order: 3, visible: true, style: 'minimal-text' },
            { type: 'amenities', order: 4, visible: true, style: 'minimal-amenities' },
            { type: 'contact', order: 5, visible: true, style: 'minimal-contact' }
        ]
    },
    { 
        id: 'story', 
        name: 'Story', 
        description: 'Vertical scroll journey with sections', 
        icon: '☰',
        config: { layoutType: 'story', heroHeight: 'sections', photoPlacement: 'gallery', contentFlow: 'scroll', mobileOptimized: true },
        templateSections: [
            { type: 'hero', order: 0, visible: true, style: 'story-hero' },
            { type: 'headline', order: 1, visible: true, style: 'story-title' },
            { type: 'description', order: 2, visible: true, style: 'story-text' },
            { type: 'property-info', order: 3, visible: true, style: 'story-info' },
            { type: 'gallery', order: 4, visible: true, style: 'story-gallery' },
            { type: 'amenities', order: 5, visible: true, style: 'story-amenities' },
            { type: 'contact', order: 6, visible: true, style: 'story-contact' }
        ]
    }
];