import { Component, input, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { Section, Theme, SectionStyle } from '../models/paving.types';
import { SECTION_TYPES } from '../constants/paving.constants';

@Component({
  selector: 'app-section-renderer',
  standalone: true,
  host: { style: 'display: flex; flex: 1; width: 100%; height: 100%;' },
  imports: [CommonModule],
  styles: [`
    .section-bg-fixed { z-index: 0; }
    .section-content-wrapper { position: relative; z-index: 1; }
  `],
  template: `
    <div
      class="section-renderer"
      [style]="sectionStyle()"
      [class.section-animate-fade-in]="animationClass() === 'fade-in'"
      [class.section-animate-fade-up]="animationClass() === 'fade-up'"
      [class.section-animate-slide]="animationClass() === 'slide'"
      (mouseenter)="onMouseEnter($event)"
      (mouseleave)="onMouseLeave($event)">

      @if (fixedBgStyle(); as bg) {
        <div class="section-bg-fixed" [style]="bg"></div>
      }

      <div class="section-content-wrapper">
        @switch (section().type) {
          @case ('hero') {
            <div class="section-hero" [class.text-left]="section().style.textAlign === 'left'" [class.text-center]="!section().style.textAlign || section().style.textAlign === 'center'" [class.text-right]="section().style.textAlign === 'right'">
              <h1 class="hero-title">{{ section().content['title'] || 'Hero Title' }}</h1>
              @if (section().content['subtitle']) {
                <p class="hero-subtitle">{{ section().content['subtitle'] }}</p>
              }
              @if (section().content['ctaText']) {
                <button class="hero-cta">{{ section().content['ctaText'] }}</button>
              }
            </div>
          }
          @case ('description') {
            <div class="section-description">
              <h2 class="section-heading">{{ section().content['title'] || 'Description' }}</h2>
              <div class="description-content" [innerHTML]="section().content['body'] || section().content['content'] || '<p>Click to edit description...</p>'"></div>
            </div>
          }
          @case ('contact') {
            <div class="section-contact">
              <h2 class="section-heading">Contact</h2>
              <div class="contact-details">
                <div>📧 {{ section().content['email'] || 'email@example.com' }}</div>
                @if (section().content['phone']) {
                  <div>📞 {{ section().content['phone'] }}</div>
                }
                @if (section().content['address']) {
                  <div>📍 {{ section().content['address'] }}</div>
                }
              </div>
            </div>
          }
          @case ('price') {
            <div class="section-price">
              <div class="price-amount">{{ section().content['minPrice'] || 0 }} {{ section().content['currency'] || '€' }}</div>
              <div class="price-period">/ {{ section().content['period'] || 'night' }}</div>
            </div>
          }
          @case ('characteristics') {
            <div class="section-characteristics">
              <h2 class="section-heading">Property Details</h2>
              <div class="characteristics-grid">
                <div class="characteristic-item">
                  <div class="char-icon">📐</div>
                  <div class="char-value">{{ section().content['sqm'] || 0 }} m²</div>
                </div>
                <div class="characteristic-item">
                  <div class="char-icon">🚪</div>
                  <div class="char-value">{{ section().content['rooms'] || 0 }} rooms</div>
                </div>
                <div class="characteristic-item">
                  <div class="char-icon">🛏️</div>
                  <div class="char-value">{{ section().content['beds'] || 0 }} beds</div>
                </div>
                <div class="characteristic-item">
                  <div class="char-icon">🚿</div>
                  <div class="char-value">{{ section().content['bathrooms'] || 0 }} baths</div>
                </div>
                <div class="characteristic-item">
                  <div class="char-icon">👥</div>
                  <div class="char-value">{{ section().content['guests'] || 0 }} guests</div>
                </div>
              </div>
            </div>
          }
          @case ('photos') {
            <div class="section-photos">
              @if (getTitle(); as title) {
                <h2 class="section-heading">{{ title }}</h2>
              }
              @if (photoList().length > 0) {
                @if (galleryStyle() === 'masonry') {
                  <div class="gallery-masonry">
                    @for (img of photoList(); track $index) {
                      <div class="gallery-masonry-item" (click)="openLightbox(img.url, img.caption || '')">
                        <img [src]="img.url" [alt]="img.caption || ''" loading="lazy" />
                      </div>
                    }
                  </div>
                } @else if (galleryStyle() === 'justified') {
                  <div class="gallery-justified">
                    @for (img of photoList(); track $index) {
                      <img class="gallery-justified-img" [src]="img.url" [alt]="img.caption || ''" loading="lazy" (click)="openLightbox(img.url, img.caption || '')" />
                    }
                  </div>
                } @else if (galleryStyle() === 'carousel-scroll') {
                  <div class="gallery-carousel-scroll">
                    @for (img of photoList(); track $index) {
                      <div class="gallery-cs-slide" (click)="openLightbox(img.url, img.caption || '')">
                        <img [src]="img.url" [alt]="img.caption || ''" loading="lazy" />
                      </div>
                    }
                  </div>
                } @else if (galleryStyle() === 'carousel-interactive') {
                  <div class="gallery-carousel-interactive">
                    <div class="gallery-ci-track" [style.transform]="'translateX(-' + carouselIndex() * 100 + '%)'">
                      @for (img of photoList(); track $index) {
                        <div class="gallery-ci-slide">
                          <img [src]="img.url" [alt]="img.caption || ''" loading="lazy" (click)="openLightbox(img.url, img.caption || '')" />
                        </div>
                      }
                    </div>
                    @if (photoList().length > 1) {
                      <button class="gallery-ci-btn gallery-ci-prev" (click)="prevCarousel(photoList().length)" aria-label="Previous">‹</button>
                      <button class="gallery-ci-btn gallery-ci-next" (click)="nextCarousel(photoList().length)" aria-label="Next">›</button>
                      <div class="gallery-ci-dots">
                        @for (_ of photoList(); track $index) {
                          <button class="gallery-ci-dot" [class.active]="$index === carouselIndex()" (click)="carouselIndex.set($index)" aria-label="Go to slide {{ $index + 1 }}"></button>
                        }
                      </div>
                    }
                  </div>
                } @else if (galleryStyle() === 'marquee') {
                  <div class="gallery-marquee-wrap">
                    <div class="gallery-marquee-track">
                      @for (img of photoList(); track $index) {
                        <img [src]="img.url" [alt]="img.caption || ''" loading="lazy" (click)="openLightbox(img.url, img.caption || '')" />
                      }
                      @for (img of photoList(); track $index) {
                        <img [src]="img.url" [alt]="img.caption || ''" loading="lazy" (click)="openLightbox(img.url, img.caption || '')" />
                      }
                    </div>
                  </div>
                } @else {
                  <div class="gallery-grid">
                    @for (img of photoList(); track $index) {
                      <div class="gallery-grid-item" (click)="openLightbox(img.url, img.caption || '')">
                        <img [src]="img.url" [alt]="img.caption || ''" loading="lazy" />
                      </div>
                    }
                  </div>
                }
              } @else {
                <div class="empty-state">No photos available</div>
              }
            </div>
          }
          @case ('amenities') {
            <div class="section-amenities">
              <h2 class="section-heading">{{ section().content['title'] || 'Amenities' }}</h2>
              @if (getContentArray('list').length > 0) {
                <div class="amenities-list two-column">
                  @for (item of getContentArray('list'); track $index) {
                    <div class="amenity-item">✓ {{ item }}</div>
                  }
                </div>
              } @else {
                <div class="empty-state">Click to configure amenities...</div>
              }
            </div>
          }
          @case ('map') {
            <div class="section-map">
              <h2 class="section-heading">Location</h2>
              <div class="map-placeholder">🗺️ Map placeholder</div>
            </div>
          }
          @case ('header') {
            <div class="section-header">
              <div class="header-logo">{{ section().content['logo'] || 'Logo' }}</div>
              <div class="header-nav">
                <span>Home</span>
                <span>About</span>
                <span>Contact</span>
              </div>
            </div>
          }
          @case ('bottom') {
            <div class="section-bottom">
              <div class="copyright">© {{ section().content['copyright'] || '2026' }}</div>
            </div>
          }
          @case ('closeTo') {
            <div class="section-close-to">
              <h2 class="section-heading">Close To</h2>
              @if (getContentArray('items').length > 0) {
                <div class="close-to-list">
                  @for (item of getContentArray('items'); track $index) {
                    <span class="close-to-chip">📍 {{ item }}</span>
                  }
                </div>
              } @else {
                <div class="empty-state">Click to add nearby places...</div>
              }
            </div>
          }
          @case ('facilities') {
            <div class="section-facilities">
              <h2 class="section-heading">Facilities</h2>
              @if (getContentArray('list').length > 0) {
                <div class="facilities-grid">
                  @for (item of getContentArray('list'); track $index) {
                    <div class="facility-item">✓ {{ item }}</div>
                  }
                </div>
              } @else {
                <div class="empty-state">Click to configure facilities...</div>
              }
            </div>
          }
          @case ('floorPlan') {
            <div class="section-floor-plan">
              <h2 class="section-heading">Floor Plan</h2>
              @if (section().content['image']) {
                <img [src]="section().content['image']" alt="Floor Plan" class="floor-plan-img" />
              } @else {
                <div class="floor-plan-placeholder">📋 Floor Plan placeholder</div>
              }
            </div>
          }
          @case ('rules') {
            <div class="section-rules">
              <h2 class="section-heading">House Rules</h2>
              @if (getContentArray('items').length > 0) {
                <ul class="rules-list">
                  @for (item of getContentArray('items'); track $index) {
                    <li>{{ item }}</li>
                  }
                </ul>
              } @else {
                <div class="empty-state">Click to add house rules...</div>
              }
            </div>
          }
          @case ('testimonials') {
            <div class="section-testimonials">
              <h2 class="section-heading">Testimonials</h2>
              @if (getContentArray('items').length > 0) {
                <div class="testimonials-list">
                  @for (item of getContentArray('items'); track $index) {
                    <div class="testimonial-card">
                      <div class="testimonial-text">{{ getItemField(item, 'text', 'Great stay!') }}</div>
                      <div class="testimonial-author">— {{ getItemField(item, 'author', 'Guest') }}</div>
                    </div>
                  }
                </div>
              } @else {
                <div class="empty-state">Click to add testimonials...</div>
              }
            </div>
          }
          @case ('location') {
            <div class="section-location">
              <h2 class="section-heading">Location</h2>
              <p class="location-description">{{ section().content['description'] || 'Click to add location description...' }}</p>
            </div>
          }
          @case ('recap') {
            <div class="section-recap">
              <h2 class="section-heading">Booking Details</h2>
              <div class="recap-grid">
                <div><strong>Check-in:</strong> {{ section().content['checkIn'] || '15:00' }}</div>
                <div><strong>Check-out:</strong> {{ section().content['checkOut'] || '11:00' }}</div>
                <div><strong>Min nights:</strong> {{ section().content['minNights'] || 1 }}</div>
                <div><strong>Cancellation:</strong> {{ section().content['cancellationPolicy'] || 'Flexible' }}</div>
              </div>
            </div>
          }
          @case ('otherProperties') {
            <div class="section-other-properties">
              <h2 class="section-heading">Other Properties</h2>
              <div class="empty-state">Click to configure...</div>
            </div>
          }
          @default {
            <div class="section-placeholder">
              {{ sectionInfo()?.icon }} {{ sectionInfo()?.label }}
            </div>
          }
        }
      </div>

      @if (lightboxUrl(); as url) {
        <div class="gallery-lightbox" (click)="closeLightbox()">
          <button class="gallery-lightbox-close" (click)="closeLightbox()">✕</button>
          <img [src]="url" [alt]="lightboxCaption()" class="gallery-lightbox-img" (click)="$event.stopPropagation()" />
          @if (lightboxCaption()) {
            <div class="gallery-lightbox-caption">{{ lightboxCaption() }}</div>
          }
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SectionRendererComponent {
  constructor() {
    console.log('[SectionRenderer] CONSTRUCTED');
  }

  section = input.required<Section>();
  blockId = input<string | undefined>(undefined);
  theme = input<Theme | undefined>(undefined);
  blockStyle = input<Partial<SectionStyle> | undefined>(undefined);

  sectionInfo = computed(() => SECTION_TYPES.find(s => s.type === this.section().type));

  galleryStyle = computed(() => this.mergedStyle().galleryStyle || (this.section().content['layout'] as string) || 'grid');

  carouselIndex = signal(0);
  lightboxUrl = signal('');
  lightboxCaption = signal('');

  getTitle(): string | null {
    const t = this.section().content['title'];
    return (t && typeof t === 'string' && t.trim()) ? t : null;
  }

  openLightbox(url: string, caption: string): void {
    this.lightboxUrl.set(url);
    this.lightboxCaption.set(caption);
  }

  closeLightbox(): void {
    this.lightboxUrl.set('');
    this.lightboxCaption.set('');
  }

  prevCarousel(length: number): void {
    this.carouselIndex.update(i => (i - 1 + length) % length);
  }

  nextCarousel(length: number): void {
    this.carouselIndex.update(i => (i + 1) % length);
  }

  mergedStyle = computed(() => {
    const s = this.section();
    const bs = this.blockStyle();
    const merged = { ...s.style, ...bs };
    console.log('[Renderer] section:', s?.type, s?.id, 'mergedStyle:', merged);
    return merged;
  });

  animationClass = computed(() => {
    const scroll = this.section().animations?.scroll;
    switch (scroll) {
      case 'fade-in': return 'fade-in';
      case 'fade-up': return 'fade-up';
      case 'slide': return 'slide';
      default: return '';
    }
  });

  sectionStyle = computed(() => {
    const ms = this.mergedStyle();
    const theme = this.theme();
    const bgImage = ms.backgroundImage;
    const hasBgImage = !!bgImage;
    const isFixed = hasBgImage && (ms.backgroundAttachment === 'fixed' || ms.backgroundAttachment === 'parallax');
    const bgSize = ms.backgroundSize === 'stretch' ? '100% 100%' : (ms.backgroundSize || (isFixed ? 'cover' : 'contain'));
    const bgPos = ms.backgroundPosition || 'center';

    return {
      position: 'relative' as const,
      border: 'none',
      margin: 0,
      borderRadius: 0,
      cursor: 'pointer',
      transition: 'border-color 0.15s ease',
      backgroundColor: ms.backgroundColor || (hasBgImage ? 'transparent' : theme?.colors.background || 'transparent'),
      backgroundImage: hasBgImage && !isFixed ? bgImage : undefined,
      backgroundSize: !isFixed ? bgSize : undefined,
      backgroundPosition: !isFixed ? bgPos : undefined,
      backgroundRepeat: !isFixed ? 'no-repeat' as const : undefined,
      overflow: 'hidden' as const,
      clipPath: isFixed ? 'inset(0)' as const : undefined,
      flex: 1,
      width: '100%',
      height: '100%',
      padding: ms.padding || theme?.spacing.sectionPadding || '0',
      textAlign: ms.textAlign || 'left',
      fontFamily: theme?.typography.bodyFont || 'inherit',
      color: ms.color || theme?.colors.text || 'inherit',
    };
  });

  fixedBgStyle = computed(() => {
    const ms = this.mergedStyle();
    const hasBgImage = !!ms.backgroundImage;
    const isFixed = hasBgImage && (ms.backgroundAttachment === 'fixed' || ms.backgroundAttachment === 'parallax');
    if (!isFixed) return null;

    const bgSize = ms.backgroundSize === 'stretch' ? '100% 100%' : (ms.backgroundSize || 'cover');
    const bgPos = ms.backgroundPosition || 'center';

    return {
      position: 'fixed' as const,
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      backgroundImage: ms.backgroundImage,
      backgroundSize: bgSize,
      backgroundPosition: bgPos,
      backgroundRepeat: 'no-repeat' as const,
      pointerEvents: 'none' as const,
    };
  });

  photoList = computed(() => {
    const c = this.section().content;
    const images = c['images'];
    const photos = c['photos'] || [];
    if (Array.isArray(images) && images.length > 0) return images;
    if (Array.isArray(photos) && photos.length > 0) return photos;
    return [];
  });

  getContentArray(key: string): unknown[] {
    const val = this.section()?.content?.[key];
    return Array.isArray(val) ? val : [];
  }

  getItemField(item: unknown, field: string, fallback: string): string {
    if (typeof item === 'object' && item !== null) {
      const val = (item as Record<string, unknown>)[field];
      return typeof val === 'string' ? val : fallback;
    }
    return fallback;
  }

  onMouseEnter(event: MouseEvent): void {
    const target = event.currentTarget as HTMLElement;
    const hover = this.section().animations?.hover;
    switch (hover) {
      case 'zoom':
        target.style.transform = 'scale(1.02)';
        break;
      case 'lift':
        target.style.transform = 'translateY(-4px)';
        target.style.boxShadow = '0 8px 25px rgba(0,0,0,0.1)';
        break;
      case 'glow':
        target.style.boxShadow = '0 0 20px rgba(59, 130, 246, 0.3)';
        break;
    }
  }

  onMouseLeave(event: MouseEvent): void {
    const target = event.currentTarget as HTMLElement;
    target.style.transform = '';
    target.style.boxShadow = '';
  }
}
