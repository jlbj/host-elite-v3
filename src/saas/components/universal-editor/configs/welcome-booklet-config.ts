import { EditorLayout, WELCOME_BOOKLET_LAYOUTS } from '../models/editor-layout';
import { EditorTheme, WELCOME_BOOKLET_THEME_DEFAULTS } from '../models/editor-theme';
import { EditorSection } from '../models/editor-section';
import { buildWelcomeBookletSections } from '../../../views/welcome-booklet/booklet-definitions';

export const WELCOME_BOOKLET_EDITOR_CONFIG = {
    editorType: 'welcome-booklet' as const,
    layouts: WELCOME_BOOKLET_LAYOUTS,
    sections: buildWelcomeBookletSections(),
    themeDefaults: WELCOME_BOOKLET_THEME_DEFAULTS,
    previewMode: 'mobile' as const,
    showSectionManager: false,
    showPhotoManager: true,
    title: 'BOOKLET.WelcomeBookletEditor',
    icon: '📱'
};
