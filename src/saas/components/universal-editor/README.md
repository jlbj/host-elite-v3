# Universal Editor Component

A reusable, configurable editor component for creating listing pages, welcome booklets, and microsites with a unified wizard-based interface.

## Features

- **Wizard + Tabs Navigation**: Step-by-step wizard flow with tab navigation for flexibility
- **Unified Theme System**: Consistent theme options across all editor types (colors, fonts, styles)
- **Layout Selection**: Predefined layouts per editor type
- **Section Management**: Configurable content sections with drag-and-drop ordering
- **WYSIWYG Content Editing**: Rich text editing with ngx-editor
- **Live Preview**: Real-time preview with desktop/tablet/mobile views
- **Smartphone Frame**: Mobile preview with realistic iPhone frame for welcome booklet
- **AI Integration**: Built-in AI content generation support
- **Multi-language**: Full i18n support (EN, FR, ES)

## Architecture

```
universal-editor/
├── universal-editor.component.ts    # Main reusable component
├── models/
│   ├── editor-layout.ts             # Layout definitions
│   ├── editor-theme.ts              # Theme system
│   ├── editor-section.ts            # Section definitions
│   └── editor-step.ts               # Wizard steps
├── parts/
│   ├── layout-selector.component.ts
│   ├── theme-customizer.component.ts
│   ├── section-manager.component.ts
│   ├── content-editor.component.ts
│   └── preview-panel.component.ts
├── configs/
│   ├── listing-config.ts
│   ├── welcome-booklet-config.ts
│   └── microsite-config.ts
└── wrappers/
    ├── listing-editor-wrapper.component.ts
    ├── welcome-booklet-editor-wrapper.component.ts
    └── microsite-editor-wrapper.component.ts
```

## Usage

### Basic Usage (with Wrapper)

```typescript
import { ListingEditorWrapperComponent } from '@/saas/components/universal-editor/wrappers';

@Component({
  template: `
    <app-listing-editor-wrapper
      [propertyName]="propertyName"
      (close)="closeEditor()">
    </app-listing-editor-wrapper>
  `
})
export class MyComponent {
  propertyName = 'My Property';
  
  closeEditor() {
    console.log('Editor closed');
  }
}
```

### Advanced Usage (Direct Component)

```typescript
import { 
  UniversalEditorComponent,
  LISTING_LAYOUTS,
  LISTING_SECTIONS,
  LISTING_THEME_DEFAULTS
} from '@/saas/components/universal-editor';

@Component({
  template: `
    <app-universal-editor
      [editorType]="'listing'"
      [layouts]="LISTING_LAYOUTS"
      [sections]="LISTING_SECTIONS"
      [themeDefaults]="LISTING_THEME_DEFAULTS"
      [contentData]="contentData"
      [propertyName]="propertyName"
      (layoutSelected)="onLayoutSelected($event)"
      (themeChanged)="onThemeChanged($event)"
      (sectionsUpdated)="onSectionsUpdated($event)"
      (contentUpdated)="onContentUpdated($event)"
      (saveRequested)="save($event)"
      (closeRequested)="close()">
    </app-universal-editor>
  `
})
export class MyComponent {
  contentData = {
    title: 'My Listing',
    description: 'Beautiful property...'
  };
  
  onLayoutSelected(layout: EditorLayout) {
    console.log('Layout:', layout);
  }
  
  save(data: EditorSaveData) {
    // Save to backend
  }
}
```

## Configuration

### Editor Types

1. **Listing Editor**: For property listings
   - 9 layouts (classic, modern, luxe, story, gallery, etc.)
   - Sections: title, description, cover-image, photo-gallery, amenities
   - Desktop preview mode

2. **Welcome Booklet Editor**: For guest welcome books
   - 6 layouts (smartphone-app, card-based, timeline, etc.)
   - 23 sections (propertyDetails, arrival, welcome, etc.)
   - Mobile preview with smartphone frame

3. **Microsite Editor**: For property microsites
   - 5 layouts (landing-page, multi-section, one-page, etc.)
   - 5 sections (gallery, amenities, reviews, rules, guide)
   - Desktop preview mode

### Theme System

All editors share the same theme options:

```typescript
interface EditorTheme {
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
  
  // Layout
  spacing: 'compact' | 'normal' | 'spacious';
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
}
```

### Inputs

| Input | Type | Required | Description |
|-------|------|----------|-------------|
| `editorType` | `'listing' \| 'welcome-booklet' \| 'microsite'` | Yes | Type of editor |
| `layouts` | `EditorLayout[]` | Yes | Available layouts |
| `sections` | `EditorSection[]` | Yes | Available sections |
| `themeDefaults` | `EditorTheme` | Yes | Default theme values |
| `contentData` | `Record<string, any>` | Yes | Initial content |
| `propertyName` | `string` | Yes | Property identifier |
| `previewMode` | `'desktop' \| 'tablet' \| 'mobile'` | No | Preview device |
| `forceMobileFrame` | `boolean` | No | Force smartphone frame |
| `showSectionManager` | `boolean` | No | Show section step |
| `showAiButton` | `boolean` | No | Show AI generate button |
| `hasAiAccess` | `boolean` | No | Enable AI features |
| `configTitle` | `string` | No | Editor title translation key |
| `configIcon` | `string` | No | Editor icon emoji |

### Outputs

| Output | Type | Description |
|--------|------|-------------|
| `layoutSelected` | `EditorLayout` | When layout is chosen |
| `themeChanged` | `EditorTheme` | When theme is modified |
| `sectionsUpdated` | `string[]` | When sections change |
| `contentUpdated` | `Record<string, any>` | When content changes |
| `saveRequested` | `EditorSaveData` | When save is clicked |
| `closeRequested` | `void` | When close is clicked |
| `generateAIRequested` | `void` | When AI generation is triggered |

## Wizard Flow

The editor follows a 4-step wizard:

1. **Layout** → Choose visual layout
2. **Theme** → Customize colors, fonts, styles
3. **Sections** → Select and order content sections (optional)
4. **Content** → Edit text content with WYSIWYG editor

Navigation:
- **Next/Previous** buttons for sequential flow
- **Tab bar** for direct step access
- **Progress bar** showing completion percentage
- **Step validation** prevents proceeding without required steps

## Preview System

The preview panel supports three view modes:

1. **Desktop**: Full browser chrome with URL bar
2. **Tablet**: Centered tablet-sized preview
3. **Mobile**: Smartphone frame with notch (iPhone-style)

Preview updates automatically when:
- Layout changes
- Theme changes
- Content is edited

## AI Integration

The editor includes built-in AI support:

```typescript
// In wrapper component
async generateWithAI() {
  const prompt = `Generate compelling content for...`;
  const content = await geminiService.generateText(prompt);
  this.contentData.set({ ...this.contentData(), description: content });
}
```

AI button appears in:
- Header (global generation)
- Content step (per-section generation)

## Migration Guide

### From Legacy Listing Editor

```typescript
// Old
<app-listing-editor [propertyName]="name" (close)="close()" />

// New
<app-listing-editor-wrapper [propertyName]="name" (close)="close()" />
```

### From Legacy Welcome Booklet Editor

```typescript
// Old
<app-welcome-booklet-editor ... />

// New
<app-welcome-booklet-editor-wrapper ... />
```

### From Legacy Microsite Editor

```typescript
// Old
<app-microsite-container ... />

// New
<app-microsite-editor-wrapper ... />
```

## Customization

### Adding Custom Layouts

```typescript
import { EditorLayout } from '@/saas/components/universal-editor/models';

const CUSTOM_LAYOUTS: EditorLayout[] = [
  {
    id: 'custom',
    name: 'Custom Layout',
    description: 'My custom layout',
    icon: '🎨',
    config: {
      layoutType: 'custom',
      photoPlacement: 'hero',
      contentFlow: 'linear',
      mobileOptimized: true
    }
  }
];
```

### Adding Custom Theme Presets

```typescript
import { EditorTheme } from '@/saas/components/universal-editor/models';

const CUSTOM_THEME: EditorTheme = {
  ...DEFAULT_THEME,
  primaryColor: '#ff6b6b',
  backgroundColor: '#f7fff7',
  template: 'modern'
};
```

### Adding Custom Sections

```typescript
import { EditorSection } from '@/saas/components/universal-editor/models';

const CUSTOM_SECTIONS: EditorSection[] = [
  {
    id: 'custom-section',
    label: 'EDITOR.CustomSection',
    icon: '⭐',
    category: 'content',
    required: false,
    fields: [
      {
        key: 'customField',
        label: 'EDITOR.CustomField',
        type: 'richtext',
        placeholder: 'Enter custom content...'
      }
    ]
  }
];
```

## Styling

The editor uses Tailwind CSS with a dark glassmorphism theme:

- Background: `bg-slate-900/50`
- Borders: `border-white/10`
- Panels: `bg-white/5` with `backdrop-blur-md`
- Accents: Purple gradient (`from-purple-500 to-blue-500`)
- Scrollbars: Custom thin scrollbars

## Performance

- **Lazy Loading**: Parts loaded only when step is active
- **Signal-based**: Uses Angular signals for reactivity
- **OnPush**: Change detection strategy for performance
- **Memoization**: Computed signals for derived state

## Testing

```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UniversalEditorComponent } from './universal-editor.component';

describe('UniversalEditorComponent', () => {
  let fixture: ComponentFixture<UniversalEditorComponent>;
  
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UniversalEditorComponent]
    }).compileComponents();
    
    fixture = TestBed.createComponent(UniversalEditorComponent);
    fixture.componentInstance.layouts = LISTING_LAYOUTS;
    fixture.componentInstance.sections = LISTING_SECTIONS;
    fixture.componentInstance.themeDefaults = LISTING_THEME_DEFAULTS;
    fixture.componentInstance.contentData = {};
    fixture.componentInstance.propertyName = 'Test';
    fixture.detectChanges();
  });
  
  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
```

## Future Enhancements

- [ ] Drag-and-drop section reordering
- [ ] Template export/import
- [ ] Version history
- [ ] Collaboration mode
- [ ] A/B testing support
- [ ] Analytics integration
- [ ] More preview themes
- [ ] Custom CSS injection
- [ ] Component library integration

## Support

For issues or questions, please refer to the main project documentation or contact the development team.
