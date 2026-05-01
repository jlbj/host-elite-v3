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
        id: 'propertyDetails',
        label: 'LISTING.PropertyDetails',
        icon: '🏠',
        category: 'info',
        required: true,
        fields: [
            { key: 'property_type', label: 'BOOKLET.fields.property_type', type: 'select', options: [
                { value: 'Entire Home', label: 'Entire Home' },
                { value: 'Apartment', label: 'Apartment' },
                { value: 'Private Room', label: 'Private Room' },
                { value: 'Shared Room', label: 'Shared Room' },
                { value: 'Villa', label: 'Villa' },
                { value: 'Cabin', label: 'Cabin' },
                { value: 'Chalet', label: 'Chalet' },
                { value: 'Cottage', label: 'Cottage' },
                { value: 'Loft', label: 'Loft' },
                { value: 'Studio', label: 'Studio' },
            ]},
            { key: 'bedrooms', label: 'BOOKLET.fields.bedrooms', type: 'text', placeholder: '2' },
            { key: 'bathrooms', label: 'BOOKLET.fields.bathrooms', type: 'text', placeholder: '1' },
            { key: 'max_guests', label: 'BOOKLET.fields.max_guests', type: 'text', placeholder: '4' },
        ]
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
    { 
        id: 'propertyDetails', 
        label: 'BOOKLET.propertyDetails', 
        icon: '🏠', 
        category: 'info', 
        required: false, 
        fields: [
            { key: 'property_type', label: 'BOOKLET.fields.property_type', type: 'select', options: [
                { value: 'Entire Home', label: 'Entire Home' },
                { value: 'Apartment', label: 'Apartment' },
                { value: 'Private Room', label: 'Private Room' },
                { value: 'Shared Room', label: 'Shared Room' },
                { value: 'Villa', label: 'Villa' },
                { value: 'Cabin', label: 'Cabin' },
                { value: 'Chalet', label: 'Chalet' },
                { value: 'Cottage', label: 'Cottage' },
                { value: 'Loft', label: 'Loft' },
                { value: 'Studio', label: 'Studio' },
            ]},
            { key: 'rooms', label: 'BOOKLET.fields.rooms', type: 'text', placeholder: '3' },
            { key: 'bedrooms', label: 'BOOKLET.fields.bedrooms', type: 'text', placeholder: '2' },
            { key: 'bathrooms', label: 'BOOKLET.fields.bathrooms', type: 'text', placeholder: '1' },
            { key: 'surface_area', label: 'BOOKLET.fields.surface_area', type: 'text', placeholder: '80 m²' },
            { key: 'max_guests', label: 'BOOKLET.fields.max_guests', type: 'text', placeholder: '4' },
            { key: 'bed_count', label: 'BOOKLET.fields.bed_count', type: 'text', placeholder: '3' },
        ] 
    },
    { 
        id: 'arrival', 
        label: 'BOOKLET.arrival', 
        icon: '🔑', 
        category: 'info', 
        required: false, 
        fields: [
            { key: 'checkInTime', label: 'BOOKLET.fields.checkInTime', type: 'text', placeholder: '15:00' },
            { key: 'checkOutTime', label: 'BOOKLET.fields.checkOutTime', type: 'text', placeholder: '11:00' },
            { key: 'arrivalInstructions', label: 'BOOKLET.fields.arrivalInstructions', type: 'richtext', placeholder: 'Explain how to arrive...' },
            { key: 'keyRetrieval', label: 'BOOKLET.fields.keyRetrieval', type: 'richtext', placeholder: 'Key collection instructions...' },
            { key: 'accessCodes', label: 'BOOKLET.fields.accessCodes', type: 'text', placeholder: 'Door code, alarm code...' },
            { key: 'parkingArrival', label: 'BOOKLET.fields.parkingArrival', type: 'richtext', placeholder: 'Parking instructions...' },
        ] 
    },
    { 
        id: 'welcome', 
        label: 'BOOKLET.welcome_editor', 
        icon: '👋', 
        category: 'content', 
        required: false, 
        fields: [
            { key: 'welcomeMessage', label: 'BOOKLET.fields.welcomeMessage', type: 'richtext', placeholder: 'Welcome your guests...' },
            { key: 'hostContact', label: 'BOOKLET.fields.hostContact', type: 'text', placeholder: 'Your phone number' },
            { key: 'emergencyContact', label: 'BOOKLET.fields.emergencyContact', type: 'text', placeholder: 'Emergency phone number' },
            { key: 'localEmergencyNumber', label: 'BOOKLET.fields.localEmergencyNumber', type: 'text', placeholder: '112 (EU), 911 (US)' },
        ] 
    },
    { 
        id: 'photo-gallery', 
        label: 'BOOKLET.SelectPhotos', 
        icon: '📸', 
        category: 'media', 
        required: false, 
        fields: [
            { key: 'selectedPhotos', label: 'BOOKLET.SelectPhotos', type: 'photo-picker' }
        ] 
    },
    { 
        id: 'accessibility', 
        label: 'BOOKLET.accessibility', 
        icon: '♿', 
        category: 'info', 
        required: false, 
        fields: [
            { key: 'accessibilityInstructions', label: 'BOOKLET.fields.accessibilityInstructions', type: 'richtext' },
            { key: 'babyEquipment', label: 'BOOKLET.fields.babyEquipment', type: 'richtext' },
            { key: 'medicalEquipmentRental', label: 'BOOKLET.fields.medicalEquipmentRental', type: 'richtext' },
        ] 
    },
    { 
        id: 'systems', 
        label: 'BOOKLET.systems', 
        icon: '⚙️', 
        category: 'settings', 
        required: false, 
        fields: [
            { key: 'wifi', label: 'BOOKLET.fields.wifi', type: 'text', placeholder: 'WiFi network & password' },
            { key: 'heating', label: 'BOOKLET.fields.heating', type: 'richtext' },
            { key: 'airConditioning', label: 'BOOKLET.fields.airConditioning', type: 'richtext' },
            { key: 'ventilation', label: 'BOOKLET.fields.ventilation', type: 'richtext' },
            { key: 'circuitBreaker', label: 'BOOKLET.fields.circuitBreaker', type: 'richtext' },
            { key: 'waterValve', label: 'BOOKLET.fields.waterValve', type: 'richtext' },
            { key: 'fireplace', label: 'BOOKLET.fields.fireplace', type: 'richtext' },
        ] 
    },
    { 
        id: 'security', 
        label: 'BOOKLET.security', 
        icon: '🔒', 
        category: 'settings', 
        required: false, 
        fields: [
            { key: 'alarm', label: 'BOOKLET.fields.alarm', type: 'richtext' },
            { key: 'fireExtinguisher', label: 'BOOKLET.fields.fireExtinguisher', type: 'richtext' },
            { key: 'firstAid', label: 'BOOKLET.fields.firstAid', type: 'richtext' },
            { key: 'detectors', label: 'BOOKLET.fields.detectors', type: 'richtext' },
            { key: 'evacuation', label: 'BOOKLET.fields.evacuation', type: 'richtext' },
        ] 
    },
    { 
        id: 'kitchen', 
        label: 'BOOKLET.kitchen', 
        icon: '🍳', 
        category: 'info', 
        required: false, 
        fields: [
            { key: 'refrigerator', label: 'BOOKLET.fields.refrigerator', type: 'richtext' },
            { key: 'freezer', label: 'BOOKLET.fields.freezer', type: 'richtext' },
            { key: 'oven', label: 'BOOKLET.fields.oven', type: 'richtext' },
            { key: 'microwave', label: 'BOOKLET.fields.microwave', type: 'richtext' },
            { key: 'cooktop', label: 'BOOKLET.fields.cooktop', type: 'richtext' },
            { key: 'dishwasher', label: 'BOOKLET.fields.dishwasher', type: 'richtext' },
            { key: 'coffeeMaker', label: 'BOOKLET.fields.coffeeMaker', type: 'richtext' },
        ] 
    },
    { 
        id: 'livingRoom', 
        label: 'BOOKLET.livingRoom', 
        icon: '🛋️', 
        category: 'info', 
        required: false, 
        fields: [
            { key: 'livingRoomInstructions', label: 'BOOKLET.fields.livingRoomInstructions', type: 'richtext' },
            { key: 'tv', label: 'BOOKLET.fields.tv', type: 'richtext' },
            { key: 'soundSystem', label: 'BOOKLET.fields.soundSystem', type: 'richtext' },
        ] 
    },
    { 
        id: 'bedrooms', 
        label: 'BOOKLET.bedrooms', 
        icon: '🛏️', 
        category: 'info', 
        required: false, 
        fields: [
            { key: 'bedroomsInstructions', label: 'BOOKLET.fields.bedroomsInstructions', type: 'richtext' },
        ] 
    },
    { 
        id: 'laundry', 
        label: 'BOOKLET.laundry', 
        icon: '🧺', 
        category: 'info', 
        required: false, 
        fields: [
            { key: 'washingMachine', label: 'BOOKLET.fields.washingMachine', type: 'richtext' },
            { key: 'dryer', label: 'BOOKLET.fields.dryer', type: 'richtext' },
            { key: 'iron', label: 'BOOKLET.fields.iron', type: 'richtext' },
        ] 
    },
    { 
        id: 'parking', 
        label: 'BOOKLET.parking', 
        icon: '🅿️', 
        category: 'info', 
        required: false, 
        fields: [
            { key: 'parkingInstructions', label: 'BOOKLET.fields.parkingInstructions', type: 'richtext' },
        ] 
    },
    { 
        id: 'rules', 
        label: 'BOOKLET.rules', 
        icon: '📜', 
        category: 'settings', 
        required: false, 
        fields: [
            { key: 'quietHours', label: 'BOOKLET.fields.quietHours', type: 'text', placeholder: '22:00 - 08:00' },
            { key: 'smokingPolicy', label: 'BOOKLET.fields.smokingPolicy', type: 'richtext' },
            { key: 'partyPolicy', label: 'BOOKLET.fields.partyPolicy', type: 'richtext' },
            { key: 'keyManagement', label: 'BOOKLET.fields.keyManagement', type: 'richtext' },
        ] 
    },
    { 
        id: 'waste', 
        label: 'BOOKLET.waste', 
        icon: '♻️', 
        category: 'settings', 
        required: false, 
        fields: [
            { key: 'trashDisposal', label: 'BOOKLET.fields.trashDisposal', type: 'richtext' },
            { key: 'recycling', label: 'BOOKLET.fields.recycling', type: 'richtext' },
        ] 
    },
    { 
        id: 'departure', 
        label: 'BOOKLET.departure', 
        icon: '👋', 
        category: 'info', 
        required: false, 
        fields: [
            { key: 'departureInstructions', label: 'BOOKLET.fields.departureInstructions', type: 'richtext' },
            { key: 'checkOutTime', label: 'BOOKLET.fields.checkOutTime', type: 'text', placeholder: '11:00' },
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

export const MICROSITE_SECTIONS: EditorSection[] = [
    { id: 'gallery', label: 'MICROSITE.SectionGallery', icon: '🖼️', category: 'media', required: false, fields: [] },
    { id: 'amenities', label: 'MICROSITE.SectionAmenities', icon: '✨', category: 'info', required: false, fields: [] },
    { id: 'reviews', label: 'MICROSITE.SectionReviews', icon: '⭐', category: 'content', required: false, fields: [] },
    { id: 'rules', label: 'MICROSITE.SectionRules', icon: '📜', category: 'settings', required: false, fields: [] },
    { id: 'guide', label: 'MICROSITE.SectionGuide', icon: '📚', category: 'info', required: false, fields: [] }
];
