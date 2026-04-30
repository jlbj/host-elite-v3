export interface EditorTheme {
    // Identity
    id?: string;
    name?: string;

    // Colors
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
    accentColor: string;

    // Typography
    fontFamily: string;
    fontHeading: string;
    fontSize: 'sm' | 'md' | 'lg' | 'xl';

    // Style
    template: 'modern' | 'classic' | 'minimal' | 'luxury' | 'cozy';
    buttonStyle: 'rounded' | 'sharp' | 'pill';
    headerStyle: 'modern' | 'classic' | 'minimal' | 'elegant';
    iconStyle: 'emoji' | 'minimalist' | 'outlined' | 'filled';

    // Background
    backgroundImage?: string;
    backgroundSize: 'cover' | 'contain' | 'auto';

    // Layout preferences
    spacing: 'compact' | 'normal' | 'spacious';
    borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
}

export const DEFAULT_THEME: EditorTheme = {
    primaryColor: '#3b82f6',
    secondaryColor: '#64748b',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    accentColor: '#8b5cf6',
    fontFamily: 'system-ui',
    fontHeading: 'Georgia',
    fontSize: 'md',
    template: 'modern',
    buttonStyle: 'rounded',
    headerStyle: 'modern',
    iconStyle: 'emoji',
    backgroundImage: undefined,
    backgroundSize: 'cover',
    spacing: 'normal',
    borderRadius: 'md'
};

export const LISTING_THEME_DEFAULTS: EditorTheme = {
    ...DEFAULT_THEME,
    primaryColor: '#1f2937',
    backgroundColor: '#ffffff',
    textColor: '#374151',
    accentColor: '#3b82f6',
    fontHeading: 'Georgia',
    template: 'modern',
    buttonStyle: 'rounded',
    headerStyle: 'modern'
};

export const WELCOME_BOOKLET_THEME_DEFAULTS: EditorTheme = {
    ...DEFAULT_THEME,
    primaryColor: '#0ea5e9',
    secondaryColor: '#6366f1',
    backgroundColor: '#f0f9ff',
    textColor: '#0c4a6e',
    accentColor: '#8b5cf6',
    fontFamily: 'system-ui',
    fontHeading: 'Georgia',
    template: 'classic',
    buttonStyle: 'pill',
    headerStyle: 'classic',
    iconStyle: 'outlined'
};

export const MICROSITE_THEME_DEFAULTS: EditorTheme = {
    ...DEFAULT_THEME,
    primaryColor: '#3b82f6',
    secondaryColor: '#64748b',
    backgroundColor: '#ffffff',
    textColor: '#1f2937',
    accentColor: '#8b5cf6',
    fontHeading: 'system-ui',
    template: 'modern',
    buttonStyle: 'rounded',
    headerStyle: 'modern',
    iconStyle: 'emoji'
};

export const THEME_PRESETS: EditorTheme[] = [
    {
        ...DEFAULT_THEME,
        id: 'light',
        name: 'Light',
        primaryColor: '#1f2937',
        backgroundColor: '#ffffff',
        textColor: '#374151',
        accentColor: '#3b82f6'
    },
    {
        ...DEFAULT_THEME,
        id: 'dark',
        name: 'Dark',
        primaryColor: '#f5f5f4',
        backgroundColor: '#1c1917',
        textColor: '#e7e5e4',
        accentColor: '#d4af37'
    },
    {
        ...DEFAULT_THEME,
        id: 'warm',
        name: 'Warm',
        primaryColor: '#7c2d12',
        backgroundColor: '#fef3c7',
        textColor: '#431407',
        accentColor: '#c2410c'
    },
    {
        ...DEFAULT_THEME,
        id: 'ocean',
        name: 'Ocean',
        primaryColor: '#0c4a6e',
        backgroundColor: '#e0f2fe',
        textColor: '#082f49',
        accentColor: '#0ea5e9'
    },
    {
        ...DEFAULT_THEME,
        id: 'forest',
        name: 'Forest',
        primaryColor: '#14532d',
        backgroundColor: '#f0fdf4',
        textColor: '#052e16',
        accentColor: '#22c55e'
    },
    {
        ...DEFAULT_THEME,
        id: 'rose',
        name: 'Rose',
        primaryColor: '#881337',
        backgroundColor: '#fdf2f8',
        textColor: '#500724',
        accentColor: '#fb7185'
    },
    {
        ...DEFAULT_THEME,
        id: 'midnight',
        name: 'Midnight',
        primaryColor: '#e2e8f0',
        backgroundColor: '#0f172a',
        textColor: '#94a3b8',
        accentColor: '#8b5cf6'
    },
    {
        ...DEFAULT_THEME,
        id: 'sunset',
        name: 'Sunset',
        primaryColor: '#7c2d12',
        backgroundColor: '#fff7ed',
        textColor: '#7c2d12',
        accentColor: '#f97316'
    },
    {
        ...DEFAULT_THEME,
        id: 'arctic',
        name: 'Arctic',
        primaryColor: '#0c4a6e',
        backgroundColor: '#f0f9ff',
        textColor: '#164e63',
        accentColor: '#06b6d4'
    },
    {
        ...DEFAULT_THEME,
        id: 'cocoa',
        name: 'Cocoa',
        primaryColor: '#3f2e26',
        backgroundColor: '#f5f0eb',
        textColor: '#2c1810',
        accentColor: '#a78b6b'
    }
];
