import { EditorLayout, WELCOME_BOOKLET_LAYOUTS } from '../models/editor-layout';
import { EditorTheme, WELCOME_BOOKLET_THEME_DEFAULTS } from '../models/editor-theme';
import { EditorSection, WELCOME_BOOKLET_SECTIONS } from '../models/editor-section';

export const WELCOME_BOOKLET_EDITOR_CONFIG = {
    editorType: 'welcome-booklet' as const,
    layouts: WELCOME_BOOKLET_LAYOUTS,
    sections: WELCOME_BOOKLET_SECTIONS,
    themeDefaults: WELCOME_BOOKLET_THEME_DEFAULTS,
    previewMode: 'mobile' as const,
    showSectionManager: true,
    showPhotoManager: true,
    title: 'BOOKLET.WelcomeBookletEditor',
    icon: '📱'
};
