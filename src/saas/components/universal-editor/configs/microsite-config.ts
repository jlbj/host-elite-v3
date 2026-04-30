import { EditorLayout, MICROSITE_LAYOUTS } from '../models/editor-layout';
import { EditorTheme, MICROSITE_THEME_DEFAULTS } from '../models/editor-theme';
import { EditorSection, MICROSITE_SECTIONS } from '../models/editor-section';

export const MICROSITE_EDITOR_CONFIG = {
    editorType: 'microsite' as const,
    layouts: MICROSITE_LAYOUTS,
    sections: MICROSITE_SECTIONS,
    themeDefaults: MICROSITE_THEME_DEFAULTS,
    previewMode: 'desktop' as const,
    showSectionManager: true,
    showPhotoManager: true,
    title: 'MICROSITE.EditorTitle',
    icon: '🌐'
};
