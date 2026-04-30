# Universal Editor - Integration Guide

## ✅ Implementation Complete

The universal editor component system is fully implemented and ready for integration.

---

## 📁 File Structure (24 files)

```
src/saas/components/universal-editor/
├── universal-editor.component.ts       # Main reusable component
├── models/
│   ├── editor-layout.ts                # 20 layouts (9+6+5)
│   ├── editor-theme.ts                 # Unified theme system
│   ├── editor-section.ts               # 39 sections (5+23+5+6)
│   └── editor-step.ts                  # Wizard configuration
├── parts/
│   ├── layout-selector.component.ts    # Layout selection grid
│   ├── theme-customizer.component.ts   # Theme customization
│   ├── section-manager.component.ts    # Section selection/ordering
│   ├── content-editor.component.ts     # WYSIWYG editor
│   └── preview-panel.component.ts      # Live preview + phone frame
├── configs/
│   ├── listing-config.ts               # Listing editor config
│   ├── welcome-booklet-config.ts       # Welcome booklet config
│   └── microsite-config.ts             # Microsite config
├── services/
│   └── preview-generation.service.ts   # Preview HTML generation
├── wrappers/
│   ├── listing-editor-wrapper.component.ts
│   ├── welcome-booklet-editor-wrapper.component.ts
│   └── microsite-editor-wrapper.component.ts
└── Documentation
    ├── README.md                       # Full documentation
    ├── IMPLEMENTATION_SUMMARY.md       # Implementation details
    └── INTEGRATION_GUIDE.md            # This file
```

---

## 🚀 Quick Integration

### Option 1: Use Wrapper Components (Recommended)

**For Listing Editor:**
```typescript
import { ListingEditorWrapperComponent } from '@/saas/components/universal-editor/wrappers';

@Component({
  standalone: true,
  imports: [ListingEditorWrapperComponent],
  template: `
    <app-listing-editor-wrapper
      [propertyName]="propertyName"
      (close)="handleClose()"
      (save)="handleSave($event)">
    </app-listing-editor-wrapper>
  `
})
export class PropertyEditorPage {
  propertyName = 'My Property';
  
  handleClose() {
    // Navigate back or close modal
  }
  
  handleSave(data: EditorSaveData) {
    // Data saved automatically, just handle navigation
    console.log('Saved:', data);
  }
}
```

**For Welcome Booklet:**
```typescript
import { WelcomeBookletEditorWrapperComponent } from '@/saas/components/universal-editor/wrappers';

@Component({
  standalone: true,
  imports: [WelcomeBookletEditorWrapperComponent],
  template: `
    <app-welcome-booklet-editor-wrapper
      [propertyName]="propertyName"
      (close)="handleClose()">
    </app-welcome-booklet-editor-wrapper>
  `
})
export class WelcomeBookletPage {
  propertyName = 'My Property';
  
  handleClose() {
    // Navigate back
  }
}
```

**For Microsite:**
```typescript
import { MicrositeEditorWrapperComponent } from '@/saas/components/universal-editor/wrappers';

@Component({
  standalone: true,
  imports: [MicrositeEditorWrapperComponent],
  template: `
    <app-microsite-editor-wrapper
      [propertyName]="propertyName"
      (close)="handleClose()">
    </app-microsite-editor-wrapper>
  `
})
export class MicrositeEditorPage {
  propertyName = 'My Property';
  
  handleClose() {
    // Navigate back
  }
}
```

---

### Option 2: Direct Component Usage (Advanced)

```typescript
import { 
  UniversalEditorComponent,
  LISTING_LAYOUTS,
  LISTING_SECTIONS,
  LISTING_THEME_DEFAULTS,
  EditorSaveData
} from '@/saas/components/universal-editor';

@Component({
  standalone: true,
  imports: [UniversalEditorComponent],
  template: `
    <app-universal-editor
      [editorType]="'listing'"
      [layouts]="LISTING_LAYOUTS"
      [sections]="LISTING_SECTIONS"
      [themeDefaults]="LISTING_THEME_DEFAULTS"
      [contentData]="contentData"
      [propertyName]="propertyName"
      (saveRequested)="save($event)"
      (closeRequested)="close()">
    </app-universal-editor>
  `
})
export class CustomEditorPage {
  contentData = {
    'title': { 'title': 'My Listing' },
    'description': { 'description': 'Beautiful property...' }
  };
  
  save(data: EditorSaveData) {
    // Custom save logic
    console.log('Layout:', data.layout);
    console.log('Theme:', data.theme);
    console.log('Sections:', data.sections);
    console.log('Content:', data.content);
  }
  
  close() {
    // Custom close logic
  }
}
```

---

## 🔄 Migration from Legacy Editors

### Step 1: Update Routes

**Before:**
```typescript
{
  path: 'listing-editor/:propertyName',
  component: ListingEditorComponent // Legacy
}
```

**After:**
```typescript
{
  path: 'listing-editor/:propertyName',
  component: ListingEditorWrapperComponent // New
}
```

### Step 2: Update Template Usage

**Before:**
```html
<app-listing-editor 
  [propertyName]="name" 
  (close)="closeEditor()">
</app-listing-editor>
```

**After:**
```html
<app-listing-editor-wrapper 
  [propertyName]="name" 
  (close)="closeEditor()">
</app-listing-editor-wrapper>
```

### Step 3: Keep Legacy Components (Optional)

Legacy components can remain in `src/saas/features/legacy/` during transition period.

---

## 🎨 Customization Examples

### Add Custom Layout

```typescript
import { EditorLayout } from '@/saas/components/universal-editor/models';

const CUSTOM_LAYOUT: EditorLayout = {
  id: 'my-custom',
  name: 'My Custom Layout',
  description: 'Unique design for special properties',
  icon: '🌟',
  config: {
    layoutType: 'custom',
    photoPlacement: 'hero',
    contentFlow: 'linear',
    mobileOptimized: true
  }
};

// Use in wrapper
contentData = signal({
  layouts: [...LISTING_LAYOUTS, CUSTOM_LAYOUT]
});
```

### Add Custom Theme Preset

```typescript
import { EditorTheme } from '@/saas/components/universal-editor/models';

const CUSTOM_THEME: EditorTheme = {
  ...DEFAULT_THEME,
  primaryColor: '#ff6b6b',
  backgroundColor: '#f7fff7',
  textColor: '#2d3436',
  accentColor: '#fd79a8',
  template: 'modern'
};
```

### Add Custom Section

```typescript
import { EditorSection } from '@/saas/components/universal-editor/models';

const CUSTOM_SECTION: EditorSection = {
  id: 'special-features',
  label: 'EDITOR.SpecialFeatures',
  icon: '⭐',
  category: 'content',
  required: false,
  fields: [
    {
      key: 'features',
      label: 'EDITOR.SpecialFeaturesList',
      type: 'richtext',
      placeholder: 'List special features...'
    }
  ]
};
```

---

## 🔧 Service Integration

### Connect AI Service

```typescript
// In wrapper component
async generateWithAI() {
  const prompt = this.buildAIPrompt();
  const content = await this.geminiService.generateText(prompt);
  
  this.contentData.update(current => ({
    ...current,
    'description': { 'description': content }
  }));
}
```

### Connect Translation Service

Already integrated! All UI text uses translation keys:
- `EDITOR.Title`
- `EDITOR.GenerateAI`
- `EDITOR.Save`
- etc.

---

## 📊 Features Checklist

### ✅ Implemented
- [x] 4-step wizard (Layout → Theme → Sections → Content)
- [x] Tab navigation for direct step access
- [x] Progress bar with completion percentage
- [x] 20 layouts across 3 editor types
- [x] 10 theme presets with full customization
- [x] 39 sections across 3 editor types
- [x] WYSIWYG content editor (ngx-editor)
- [x] Live preview with real-time updates
- [x] Desktop/Tablet/Mobile preview modes
- [x] Smartphone frame for mobile preview
- [x] Preview HTML generation service
- [x] AI generation hooks
- [x] Save/Close functionality
- [x] Multi-language support (EN/FR/ES)
- [x] Event-driven architecture
- [x] Signal-based reactivity
- [x] Wrapper components for easy integration

### 🔄 To Be Integrated
- [ ] Photo management UI (pick, reorder, hide)
- [ ] Full AI service integration
- [ ] Draft auto-save
- [ ] Version history
- [ ] Keyboard shortcuts

---

## 🧪 Testing

### Build Test
```bash
cd /home/jose/dev/host-elite-v3
npm run build
```

✅ **Status**: Build successful (no errors)

### Integration Test

1. **Create test route:**
```typescript
// app.routes.ts
{
  path: 'test-editor/:propertyName',
  component: ListingEditorWrapperComponent
}
```

2. **Navigate to:** `http://localhost:4200/test-editor/My%20Property`

3. **Test:**
   - Select a layout
   - Customize theme
   - Add/edit content
   - Check preview updates
   - Save and verify

---

## 📝 Best Practices

1. **Use Wrapper Components**: Simpler API, less boilerplate
2. **Structure Content by Section**: Use nested objects for content
3. **Handle Save in Wrapper**: Let wrappers manage persistence
4. **Lazy Load if Needed**: Import wrappers only when needed
5. **Test Preview Generation**: Verify HTML renders correctly
6. **Respect Theme Defaults**: Each editor type has optimized defaults

---

## 🐛 Troubleshooting

### Preview Not Updating
- Check that `contentData` signal is properly structured
- Verify layout and theme are selected
- Check browser console for errors

### Build Errors
- Ensure all imports use correct paths
- Check that ngx-editor is installed: `npm list ngx-editor`
- Verify translation keys exist in all language files

### Content Not Saving
- Check wrapper's `save()` method implementation
- Verify repository service is working
- Check network tab for API calls

---

## 📞 Support

For issues or questions:
1. Check `README.md` for detailed documentation
2. Review `IMPLEMENTATION_SUMMARY.md` for design decisions
3. Inspect browser console for errors
4. Check network tab for API failures

---

## ✨ Next Steps

1. **Test with Real Data**: Integrate with one editor type
2. **Gather Feedback**: Get user input on UX
3. **Iterate**: Improve based on feedback
4. **Migrate All Editors**: Roll out to all three editor types
5. **Remove Legacy**: Clean up old components

---

**Status**: ✅ Ready for Production Integration
**Build**: ✅ Passing
**Documentation**: ✅ Complete
**Test Coverage**: ⚠️ Manual testing recommended

**Created**: 2026-04-29
**Version**: 1.0.0
