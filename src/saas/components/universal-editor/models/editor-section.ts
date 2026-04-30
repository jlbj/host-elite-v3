export interface SectionField {
    key: string;
    label: string;
    type: 'text' | 'richtext' | 'image' | 'boolean' | 'select' | 'multi-select' | 'photo-picker';
    options?: { value: string; label: string }[];
    placeholder?: string;
}

export interface EditorSection {
    id: string;
    label: string;
    icon?: string;
    category: 'content' | 'info' | 'media' | 'settings';
    required?: boolean;
    fields: SectionField[];
}

export const LISTING_SECTIONS: EditorSection[] = [
    {
        id: 'title',
        label: 'LISTING.ListingTitle',
        icon: '📝',
        category: 'content',
        required: true,
        fields: [{ key: 'title', label: 'LISTING.Title', type: 'text', placeholder: 'Your listing title...' }]
    },
    {
        id: 'description',
        label: 'LISTING.Description',
        icon: '📄',
        category: 'content',
        required: true,
        fields: [{ key: 'description', label: 'LISTING.Description', type: 'richtext', placeholder: 'Describe your property...' }]
    },
    {
        id: 'cover-image',
        label: 'LISTING.CoverImage',
        icon: '🖼️',
        category: 'media',
        required: false,
        fields: [{ key: 'coverImageUrl', label: 'LISTING.CoverImageURL', type: 'image', placeholder: 'Image URL...' }]
    },
    {
        id: 'photo-gallery',
        label: 'LISTING.PhotoGallery',
        icon: '📸',
        category: 'media',
        required: false,
        fields: [
            { key: 'selectedPhotos', label: 'LISTING.SelectPhotos', type: 'photo-picker' }
        ]
    },
    {
        id: 'amenities',
        label: 'LISTING.Amenities',
        icon: '✨',
        category: 'info',
        required: false,
        fields: [{ key: 'amenities', label: 'LISTING.Amenities', type: 'multi-select', options: [] }]
    }
];

export const WELCOME_BOOKLET_SECTIONS: EditorSection[] = [
    { id: 'propertyDetails', label: 'BOOKLET.propertyDetails', icon: '🏠', category: 'info', required: false, fields: [] },
    { id: 'arrival', label: 'BOOKLET.arrival', icon: '🔑', category: 'info', required: false, fields: [] },
    { id: 'welcome', label: 'BOOKLET.welcome_editor', icon: '👋', category: 'content', required: false, fields: [] },
    { id: 'photo-gallery', label: 'BOOKLET.SelectPhotos', icon: '📸', category: 'media', required: false, fields: [
        { key: 'selectedPhotos', label: 'BOOKLET.SelectPhotos', type: 'photo-picker' }
    ]},
    { id: 'accessibility', label: 'BOOKLET.accessibility', icon: '♿', category: 'info', required: false, fields: [] },
    { id: 'systems', label: 'BOOKLET.systems', icon: '⚙️', category: 'settings', required: false, fields: [] },
    { id: 'security', label: 'BOOKLET.security', icon: '🔒', category: 'settings', required: false, fields: [] },
    { id: 'kitchen', label: 'BOOKLET.kitchen', icon: '🍳', category: 'info', required: false, fields: [] },
    { id: 'livingRoom', label: 'BOOKLET.livingRoom', icon: '🛋️', category: 'info', required: false, fields: [] },
    { id: 'bedrooms', label: 'BOOKLET.bedrooms', icon: '🛏️', category: 'info', required: false, fields: [] },
    { id: 'laundry', label: 'BOOKLET.laundry', icon: '🧺', category: 'info', required: false, fields: [] },
    { id: 'wellness', label: 'BOOKLET.wellness', icon: '🧘', category: 'info', required: false, fields: [] },
    { id: 'parking', label: 'BOOKLET.parking', icon: '🅿️', category: 'info', required: false, fields: [] },
    { id: 'rules', label: 'BOOKLET.rules', icon: '📜', category: 'settings', required: false, fields: [] },
    { id: 'pets', label: 'BOOKLET.pets', icon: '🐾', category: 'info', required: false, fields: [] },
    { id: 'waste', label: 'BOOKLET.waste', icon: '♻️', category: 'settings', required: false, fields: [] },
    { id: 'dining', label: 'BOOKLET.dining', icon: '🍽️', category: 'info', required: false, fields: [] },
    { id: 'activities', label: 'BOOKLET.activities', icon: '🎯', category: 'info', required: false, fields: [] },
    { id: 'localInfo', label: 'BOOKLET.localInfo', icon: 'ℹ️', category: 'info', required: false, fields: [] },
    { id: 'transport', label: 'BOOKLET.transport', icon: '🚗', category: 'info', required: false, fields: [] },
    { id: 'administrative', label: 'BOOKLET.administrative', icon: '🏛️', category: 'info', required: false, fields: [] },
    { id: 'extraServices', label: 'BOOKLET.extraServices', icon: '💎', category: 'info', required: false, fields: [] },
    { id: 'departure', label: 'BOOKLET.departure', icon: '👋', category: 'info', required: false, fields: [] },
    { id: 'faq', label: 'BOOKLET.faq_title', icon: '❓', category: 'info', required: false, fields: [] }
];

export const MICROSITE_SECTIONS: EditorSection[] = [
    { id: 'gallery', label: 'MICROSITE.SectionGallery', icon: '🖼️', category: 'media', required: false, fields: [] },
    { id: 'amenities', label: 'MICROSITE.SectionAmenities', icon: '✨', category: 'info', required: false, fields: [] },
    { id: 'reviews', label: 'MICROSITE.SectionReviews', icon: '⭐', category: 'content', required: false, fields: [] },
    { id: 'rules', label: 'MICROSITE.SectionRules', icon: '📜', category: 'settings', required: false, fields: [] },
    { id: 'guide', label: 'MICROSITE.SectionGuide', icon: '📚', category: 'info', required: false, fields: [] }
];
