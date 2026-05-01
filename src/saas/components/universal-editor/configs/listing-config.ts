import { EditorLayout, LISTING_LAYOUTS } from '../models/editor-layout';
import { EditorTheme, LISTING_THEME_DEFAULTS } from '../models/editor-theme';
import { EditorSection, LISTING_SECTIONS } from '../models/editor-section';

export interface EditorTypeConfig {
    editorType: 'listing' | 'welcome-booklet' | 'microsite';
    layouts: EditorLayout[];
    sections: EditorSection[];
    themeDefaults: EditorTheme;
    previewMode: 'desktop' | 'mobile' | 'auto';
    showSectionManager: boolean;
    showPhotoManager: boolean;
    title: string;
    icon: string;
}

export const LISTING_EDITOR_CONFIG: EditorTypeConfig = {
    editorType: 'listing',
    layouts: LISTING_LAYOUTS,
    sections: LISTING_SECTIONS,
    themeDefaults: LISTING_THEME_DEFAULTS,
    previewMode: 'desktop',
    showSectionManager: true,
    showPhotoManager: true,
    title: 'LISTING.ListingEditor',
    icon: '📝'
};
