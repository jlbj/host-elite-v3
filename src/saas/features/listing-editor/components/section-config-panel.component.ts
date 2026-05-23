import { Component, inject, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PavingStoreService } from '../services/paving-store.service';
import { SECTION_TYPES } from '../constants/paving.constants';
import type { Section, SectionType, SectionStyle } from '../models/paving.types';

type ConfigTab = 'content' | 'style' | 'animations';
type BackgroundMode = 'color' | 'image';

const ANIMATION_PRESETS = [
  { id: 'none', label: 'None', hover: 'none', scroll: 'none' },
  { id: 'fade-up', label: 'Fade Up', hover: 'none', scroll: 'fade-up' },
  { id: 'fade-in', label: 'Fade In', hover: 'none', scroll: 'fade-in' },
  { id: 'zoom', label: 'Zoom', hover: 'zoom', scroll: 'none' },
  { id: 'lift', label: 'Lift', hover: 'lift', scroll: 'fade-up' },
];

@Component({
  selector: 'app-section-config-panel',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (section(); as section) {
      @let sinfo = getSectionInfo(section.type);
      <div class="config-panel-header">
        <div class="config-panel-title">{{ sinfo?.icon }} {{ sinfo?.label }}</div>
        <div class="config-panel-subtitle">Configure section</div>
      </div>

      <div class="config-tabs">
        @for (tab of ['content', 'style', 'animations']; track tab) {
          <button
            class="config-tab"
            [class.active]="activeTab() === tab"
            (click)="setActiveTab(tab)">
            {{ tab }}
          </button>
        }
      </div>

      <div class="config-body">
        @if (activeTab() === 'content') {
          @switch (section.type) {
            @case ('hero') {
              <div class="config-field">
                <label>Title</label>
                <input type="text" [ngModel]="section.content['title']" (ngModelChange)="updateContent('title', $event)" />
              </div>
              <div class="config-field">
                <label>Subtitle</label>
                <input type="text" [ngModel]="section.content['subtitle']" (ngModelChange)="updateContent('subtitle', $event)" />
              </div>
              <div class="config-field">
                <label>CTA Text</label>
                <input type="text" [ngModel]="section.content['ctaText']" (ngModelChange)="updateContent('ctaText', $event)" />
              </div>
              <div class="config-field">
                <label>CTA Link</label>
                <input type="text" [ngModel]="section.content['ctaLink']" (ngModelChange)="updateContent('ctaLink', $event)" />
              </div>
              <div class="config-field">
                <label>Description</label>
                <textarea
                  [ngModel]="section.content['description']"
                  (ngModelChange)="updateContent('description', $event)"
                  rows="3"></textarea>
              </div>
            }
            @case ('description') {
              <div class="config-field">
                <label>Title</label>
                <input type="text" [ngModel]="section.content['title']" (ngModelChange)="updateContent('title', $event)" />
              </div>
              <div class="config-field">
                <label>Content</label>
                <textarea
                  [ngModel]="section.content['body'] || section.content['content']"
                  (ngModelChange)="updateContent(section.content['body'] !== undefined ? 'body' : 'content', $event)"
                  rows="6"></textarea>
              </div>
            }
            @case ('contact') {
              <div class="config-field">
                <label>Email</label>
                <input type="email" [ngModel]="section.content['email']" (ngModelChange)="updateContent('email', $event)" />
              </div>
              <div class="config-field">
                <label>Phone</label>
                <input type="tel" [ngModel]="section.content['phone']" (ngModelChange)="updateContent('phone', $event)" />
              </div>
              <div class="config-field">
                <label>Address</label>
                <input type="text" [ngModel]="section.content['address']" (ngModelChange)="updateContent('address', $event)" />
              </div>
            }
            @case ('price') {
              <div class="config-field">
                <label>Min Price</label>
                <input type="number" [ngModel]="section.content['minPrice']" (ngModelChange)="updateContent('minPrice', Number($event))" />
              </div>
              <div class="config-field">
                <label>Currency</label>
                <select [ngModel]="section.content['currency']" (ngModelChange)="updateContent('currency', $event)">
                  <option value="€">€ EUR</option>
                  <option value="$">$ USD</option>
                  <option value="£">£ GBP</option>
                </select>
              </div>
              <div class="config-field">
                <label>Period</label>
                <select [ngModel]="section.content['period']" (ngModelChange)="updateContent('period', $event)">
                  <option value="night">Per Night</option>
                  <option value="week">Per Week</option>
                  <option value="month">Per Month</option>
                </select>
              </div>
            }
            @case ('characteristics') {
              <div class="config-field">
                <label>Surface (m²)</label>
                <input type="number" [ngModel]="section.content['sqm']" (ngModelChange)="updateContent('sqm', Number($event))" />
              </div>
              <div class="config-field">
                <label>Plot (m²)</label>
                <input type="number" [ngModel]="section.content['plotSqm']" (ngModelChange)="updateContent('plotSqm', Number($event))" />
              </div>
              <div class="config-field">
                <label>Rooms</label>
                <input type="number" [ngModel]="section.content['rooms']" (ngModelChange)="updateContent('rooms', Number($event))" />
              </div>
              <div class="config-field">
                <label>Bedrooms</label>
                <input type="number" [ngModel]="section.content['bedrooms']" (ngModelChange)="updateContent('bedrooms', Number($event))" />
              </div>
              <div class="config-field">
                <label>Bathrooms</label>
                <input type="number" [ngModel]="section.content['bathrooms']" (ngModelChange)="updateContent('bathrooms', Number($event))" />
              </div>
              <div class="config-field">
                <label>Beds</label>
                <input type="number" [ngModel]="section.content['beds']" (ngModelChange)="updateContent('beds', Number($event))" />
              </div>
              <div class="config-field">
                <label>Max Guests</label>
                <input type="number" [ngModel]="section.content['guests']" (ngModelChange)="updateContent('guests', Number($event))" />
              </div>
            }
            @case ('photos') {
              <div class="config-field">
                <label>Image URLs (one per line)</label>
                <textarea
                  [ngModel]="imageListText()"
                  (ngModelChange)="updateImageList($event)"
                  rows="4"></textarea>
              </div>
            }
            @case ('amenities') {
              <div class="config-field">
                <label>Amenities</label>
                <div class="array-editor">
                  @for (item of getArrayField('list'); track $index) {
                    <div class="array-item">
                      <input type="text" [ngModel]="item" (ngModelChange)="updateArrayItem('list', $index, $event)" />
                      <button class="array-remove" (click)="removeArrayItem('list', $index)">✕</button>
                    </div>
                  }
                  <button class="array-add" (click)="addArrayItem('list')">+ Add Amenity</button>
                </div>
              </div>
            }
            @case ('facilities') {
              <div class="config-field">
                <label>Facilities</label>
                <div class="array-editor">
                  @for (item of getArrayField('list'); track $index) {
                    <div class="array-item">
                      <input type="text" [ngModel]="item" (ngModelChange)="updateArrayItem('list', $index, $event)" />
                      <button class="array-remove" (click)="removeArrayItem('list', $index)">✕</button>
                    </div>
                  }
                  <button class="array-add" (click)="addArrayItem('list')">+ Add Facility</button>
                </div>
              </div>
            }
            @case ('rules') {
              <div class="config-field">
                <label>Rules</label>
                <div class="array-editor">
                  @for (item of getArrayField('items'); track $index) {
                    <div class="array-item">
                      <input type="text" [ngModel]="item" (ngModelChange)="updateArrayItem('items', $index, $event)" />
                      <button class="array-remove" (click)="removeArrayItem('items', $index)">✕</button>
                    </div>
                  }
                  <button class="array-add" (click)="addArrayItem('items')">+ Add Rule</button>
                </div>
              </div>
            }
            @case ('testimonials') {
              <div class="config-field">
                <label>Testimonials</label>
                <div class="array-editor">
                  @for (item of getArrayField('items'); track $index) {
                    <div class="array-item testimonial-item">
                      <input type="text" [ngModel]="item['text']" (ngModelChange)="updateTestimonialText($index, $event)" placeholder="Review text" />
                      <input type="text" [ngModel]="item['author']" (ngModelChange)="updateTestimonialAuthor($index, $event)" placeholder="Author" />
                      <button class="array-remove" (click)="removeArrayItem('items', $index)">✕</button>
                    </div>
                  }
                  <button class="array-add" (click)="addTestimonial()">+ Add Testimonial</button>
                </div>
              </div>
            }
            @case ('closeTo') {
              <div class="config-field">
                <label>Nearby Places</label>
                <div class="array-editor">
                  @for (item of getArrayField('items'); track $index) {
                    <div class="array-item">
                      <input type="text" [ngModel]="item" (ngModelChange)="updateArrayItem('items', $index, $event)" />
                      <button class="array-remove" (click)="removeArrayItem('items', $index)">✕</button>
                    </div>
                  }
                  <button class="array-add" (click)="addArrayItem('items')">+ Add Place</button>
                </div>
              </div>
            }
            @case ('location') {
              <div class="config-field">
                <label>Description</label>
                <textarea
                  [ngModel]="section.content['description']"
                  (ngModelChange)="updateContent('description', $event)"
                  rows="3"></textarea>
              </div>
            }
            @case ('recap') {
              <div class="config-field">
                <label>Check-in</label>
                <input type="text" [ngModel]="section.content['checkIn']" (ngModelChange)="updateContent('checkIn', $event)" />
              </div>
              <div class="config-field">
                <label>Check-out</label>
                <input type="text" [ngModel]="section.content['checkOut']" (ngModelChange)="updateContent('checkOut', $event)" />
              </div>
              <div class="config-field">
                <label>Min Nights</label>
                <input type="number" [ngModel]="section.content['minNights']" (ngModelChange)="updateContent('minNights', Number($event))" />
              </div>
              <div class="config-field">
                <label>Cancellation Policy</label>
                <input type="text" [ngModel]="section.content['cancellationPolicy']" (ngModelChange)="updateContent('cancellationPolicy', $event)" />
              </div>
              <div class="config-field">
                <label>Payment Terms</label>
                <input type="text" [ngModel]="section.content['paymentTerms']" (ngModelChange)="updateContent('paymentTerms', $event)" />
              </div>
            }
            @case ('header') {
              <div class="config-field">
                <label>Logo Text</label>
                <input type="text" [ngModel]="section.content['logo']" (ngModelChange)="updateContent('logo', $event)" />
              </div>
            }
            @case ('bottom') {
              <div class="config-field">
                <label>Copyright Text</label>
                <input type="text" [ngModel]="section.content['copyright']" (ngModelChange)="updateContent('copyright', $event)" />
              </div>
            }
            @case ('floorPlan') {
              <div class="config-field">
                <label>Floor Plan Image URL</label>
                <input type="url" [ngModel]="section.content['image']" (ngModelChange)="updateContent('image', $event)" />
              </div>
            }
            @case ('map') {
              <div class="config-field">
                <label>Address</label>
                <input type="text" [ngModel]="section.content['address']" (ngModelChange)="updateContent('address', $event)" />
              </div>
            }
            @case ('otherProperties') {
              <div class="config-field">
                <label>Other Properties (JSON)</label>
                <textarea
                  [ngModel]="section.content['properties'] | json"
                  (ngModelChange)="updateContent('properties', $event)"
                  rows="3"></textarea>
              </div>
            }
            @default {
              <div class="config-no-content">No content options for {{ sinfo?.label }} section</div>
            }
          }
        }

        @if (activeTab() === 'style') {
          <div class="config-style-section">
            <label class="config-field-label">Background Type</label>
            <div class="btn-group">
              <button class="btn-group-btn" [class.active]="backgroundMode() === 'color'" (click)="backgroundMode.set('color')">Color</button>
              <button class="btn-group-btn" [class.active]="backgroundMode() === 'image'" (click)="backgroundMode.set('image')">Image</button>
            </div>

            @if (backgroundMode() === 'color') {
              <div class="config-field">
                <label>Theme Colors</label>
                <div class="theme-swatches">
                  <button class="swatch-btn none-btn" (click)="updateStyle({ backgroundColor: undefined, backgroundImage: undefined })">None</button>
                  @for (tc of themeColors(); track tc.id) {
                    <button
                      class="swatch-btn"
                      [class.selected]="effectiveStyle().backgroundColor === tc.color"
                      [style.background]="tc.color"
                      [title]="tc.label"
                      (click)="updateStyle({ backgroundColor: tc.color, backgroundImage: undefined })">
                    </button>
                  }
                </div>
              </div>
              <div class="config-field">
                <label>Custom Color</label>
                <div class="color-picker-row">
                  <input type="color" [ngModel]="customColor()" (ngModelChange)="setCustomColor($event)" class="color-input" />
                  <input type="text" [ngModel]="customColor()" (ngModelChange)="setCustomColor($event)" class="color-text-input" placeholder="#000000" />
                </div>
              </div>
            }

            @if (backgroundMode() === 'image') {
              <div class="config-field">
                <label>Background Image URL</label>
                <input type="text" [ngModel]="effectiveStyle().backgroundImage" (ngModelChange)="updateStyle({ backgroundImage: $event ? 'url(' + $event + ')' : undefined })" placeholder="https://..." />
              </div>
              <div class="config-field">
                <label>Attachment</label>
                <div class="btn-group">
                  <button class="btn-group-btn" [class.active]="!effectiveStyle().backgroundAttachment || effectiveStyle().backgroundAttachment === 'scroll'" (click)="updateStyle({ backgroundAttachment: 'scroll' })">Scroll</button>
                  <button class="btn-group-btn" [class.active]="effectiveStyle().backgroundAttachment === 'fixed'" (click)="updateStyle({ backgroundAttachment: 'fixed' })">Fixed</button>
                  <button class="btn-group-btn" [class.active]="effectiveStyle().backgroundAttachment === 'parallax'" (click)="updateStyle({ backgroundAttachment: 'parallax' })">Parallax</button>
                </div>
              </div>
            }
          </div>

          <div class="config-style-section">
            <label class="config-field-label">Text Color</label>
            <div class="theme-swatches">
              <button class="swatch-btn none-btn" (click)="updateStyle({ color: undefined })">Default</button>
              @for (tc of themeColors(); track tc.id) {
                <button
                  class="swatch-btn"
                  [class.selected]="effectiveStyle().color === tc.color"
                  [style.background]="tc.color"
                  [title]="tc.label"
                  (click)="updateStyle({ color: tc.color })">
                </button>
              }
            </div>
            <div class="color-picker-row">
              <input type="color" [ngModel]="effectiveStyle().color || '#000000'" (ngModelChange)="updateStyle({ color: $event })" class="color-input" />
              <input type="text" [ngModel]="effectiveStyle().color || ''" (ngModelChange)="updateStyle({ color: $event })" class="color-text-input" placeholder="Theme default" />
            </div>
          </div>

          <div class="config-field">
            <label>Text Align</label>
            <select [ngModel]="effectiveStyle().textAlign || 'left'" (ngModelChange)="updateStyle({ textAlign: $event })">
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>

          <div class="config-field">
            <label>Padding</label>
            <input type="text" [ngModel]="effectiveStyle().padding || ''" (ngModelChange)="updateStyle({ padding: $event })" placeholder="e.g., 2rem 1rem" />
          </div>
        }

        @if (activeTab() === 'animations') {
          <div class="config-field">
            <label>Animation Preset</label>
            <div class="animation-presets">
              @for (preset of ANIMATION_PRESETS; track preset.id) {
                <button
                  class="animation-preset-btn"
                  [class.active]="section.animations.hover === preset.hover && section.animations.scroll === preset.scroll"
                  (click)="setAnimationPreset(preset)">
                  {{ preset.label }}
                </button>
              }
            </div>
          </div>
        }
      </div>
    } @else {
      <div class="config-empty">Select a section to configure</div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionConfigPanelComponent {
  private store = inject(PavingStoreService);
  readonly ANIMATION_PRESETS = ANIMATION_PRESETS;
  readonly getSectionInfo = (type: SectionType) => SECTION_TYPES.find(s => s.type === type);

  getArrayField(key: string): string[] {
    const arr = this.section()?.content?.[key];
    return Array.isArray(arr) ? arr as string[] : [];
  }

  setActiveTab(tab: string): void {
    this.activeTab.set(tab as ConfigTab);
  }

  activeTab = signal<ConfigTab>('content');
  backgroundMode = signal<BackgroundMode>('color');
  customColor = signal('#000000');

  section = computed(() => {
    const id = this.store.selectedSectionId();
    return id ? this.store.pageConfig().sections.find(s => s.id === id) ?? null : null;
  });

  themeColors = computed(() => {
    const theme = this.store.getTheme();
    if (!theme) return [];
    return [
      { id: 'theme-primary', color: theme.colors.primary, label: 'Primary' },
      { id: 'theme-primaryLight', color: theme.colors.primaryLight, label: 'Primary Light' },
      { id: 'theme-secondary', color: theme.colors.secondary, label: 'Secondary' },
      { id: 'theme-accent', color: theme.colors.accent, label: 'Accent' },
      { id: 'theme-background', color: theme.colors.background, label: 'Background' },
      { id: 'theme-surface', color: theme.colors.surface, label: 'Surface' },
      { id: 'theme-text', color: theme.colors.text, label: 'Text' },
      { id: 'theme-textMuted', color: theme.colors.textMuted, label: 'Text Muted' },
    ];
  });

  effectiveStyle = computed(() => {
    const s = this.section();
    const blockId = this.store.selectedBlockId();
    const block = blockId ? this.store.gridBlocks().find(b => b.id === blockId) : null;
    return { ...(s?.style || {}), ...(block?.blockStyle || {}) };
  });

  imageListText = computed(() => {
    const images = this.section()?.content['images'];
    return Array.isArray(images) ? images.map((i: unknown) => typeof i === 'object' && i !== null ? (i as {url?: string}).url || '' : String(i)).join('\n') : '';
  });

  updateContent(key: string, value: unknown): void {
    const sec = this.section();
    if (!sec) return;
    this.store.updateSection(sec.id, {
      content: { ...sec.content, [key]: value },
    });
  }

  updateStyle(styleUpdate: Partial<SectionStyle>): void {
    const blockId = this.store.selectedBlockId();
    const sec = this.section();
    if (blockId) {
      this.store.updateBlockStyle(blockId, styleUpdate);
    } else if (sec) {
      this.store.updateSection(sec.id, { style: { ...sec.style, ...styleUpdate } });
    }
  }

  setAnimationPreset(preset: typeof ANIMATION_PRESETS[0]): void {
    const sec = this.section();
    if (!sec) return;
    this.store.updateSection(sec.id, {
      animations: {
        hover: preset.hover as 'none' | 'zoom' | 'lift' | 'glow',
        scroll: preset.scroll as 'none' | 'fade-in' | 'fade-up' | 'slide',
      },
    });
  }

  setCustomColor(color: string): void {
    this.customColor.set(color);
    this.updateStyle({ backgroundColor: color, backgroundImage: undefined });
  }

  updateImageList(text: string): void {
    const urls = text.split('\n').filter(u => u.trim());
    const images = urls.map(url => ({ url: url.trim(), caption: '' }));
    this.updateContent('images', images);
  }

  addArrayItem(key: string): void {
    const sec = this.section();
    if (!sec) return;
    const current = Array.isArray(sec.content[key]) ? [...sec.content[key] as unknown[]] : [];
    current.push('');
    this.updateContent(key, current);
  }

  removeArrayItem(key: string, index: number): void {
    const sec = this.section();
    if (!sec) return;
    const current = Array.isArray(sec.content[key]) ? [...sec.content[key] as unknown[]] : [];
    current.splice(index, 1);
    this.updateContent(key, current);
  }

  updateArrayItem(key: string, index: number, value: string): void {
    const sec = this.section();
    if (!sec) return;
    const current = Array.isArray(sec.content[key]) ? [...sec.content[key] as unknown[]] : [];
    current[index] = value;
    this.updateContent(key, current);
  }

  addTestimonial(): void {
    const sec = this.section();
    if (!sec) return;
    const current = Array.isArray(sec.content['items']) ? [...sec.content['items'] as unknown[]] : [];
    current.push({ text: '', author: '' });
    this.updateContent('items', current);
  }

  updateTestimonialText(index: number, value: string): void {
    const sec = this.section();
    if (!sec) return;
    const current = Array.isArray(sec.content['items']) ? [...sec.content['items'] as unknown[]] : [];
    current[index] = { ...(current[index] as Record<string, unknown> || {}), text: value };
    this.updateContent('items', current);
  }

  updateTestimonialAuthor(index: number, value: string): void {
    const sec = this.section();
    if (!sec) return;
    const current = Array.isArray(sec.content['items']) ? [...sec.content['items'] as unknown[]] : [];
    current[index] = { ...(current[index] as Record<string, unknown> || {}), author: value };
    this.updateContent('items', current);
  }
}
