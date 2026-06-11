import { Component, inject, computed, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PavingStoreService } from '../services/paving-store.service';
import { SECTION_TYPES } from '../constants/paving.constants';
import type { Section, SectionType, SectionStyle, RentableRoom } from '../models/paving.types';

type ConfigTab = 'content' | 'style' | 'animations';
type BackgroundMode = 'color' | 'image';

const ANIMATION_PRESETS = [
  { id: 'none', label: 'None', hover: 'none', scroll: 'none' },
  { id: 'fade-up', label: 'Fade Up', hover: 'none', scroll: 'fade-up' },
  { id: 'fade-in', label: 'Fade In', hover: 'none', scroll: 'fade-in' },
  { id: 'zoom', label: 'Zoom', hover: 'zoom', scroll: 'none' },
  { id: 'lift', label: 'Lift', hover: 'lift', scroll: 'fade-up' },
];

interface StylePreset {
  id: string;
  label: string;
  icon: string;
  description: string;
  style: Partial<SectionStyle>;
}

const SECTION_PRESETS: Record<string, StylePreset[]> = {
  hero: [
    { id: 'hero-full', label: 'Fullscreen Cover', icon: '🖼️', description: 'Full-width background with centered content', style: { textAlign: 'center', padding: '6rem 2rem', backgroundColor: undefined, backgroundImage: undefined } },
    { id: 'hero-split', label: 'Split Layout', icon: '↔️', description: 'Side-by-side text and media', style: { textAlign: 'left', padding: '4rem 2rem' } },
    { id: 'hero-minimal', label: 'Minimal', icon: '◇', description: 'Clean, simple header with minimal padding', style: { textAlign: 'center', padding: '2rem 2rem' } },
  ],
  photos: [
    { id: 'photos-grid', label: 'CSS Grid', icon: '⊞', description: 'Clean multi-column grid — auto-fill, uniform cells', style: { galleryStyle: 'grid' } },
    { id: 'photos-masonry', label: 'Masonry', icon: '▦', description: 'Pinterest-style brick wall — CSS columns', style: { galleryStyle: 'masonry' } },
    { id: 'photos-justified', label: 'Justified Row', icon: '▬', description: 'Flickr-style flex fill — variable widths, fixed height', style: { galleryStyle: 'justified' } },
    { id: 'photos-scroll', label: 'Scroll Snap', icon: '◀▶', description: 'Pure CSS scroll-snap horizontal carousel', style: { galleryStyle: 'carousel-scroll' } },
    { id: 'photos-interactive', label: 'Interactive Carousel', icon: '▶⏸', description: 'JS-driven carousel with prev/next + dot navigation', style: { galleryStyle: 'carousel-interactive' } },
    { id: 'photos-marquee', label: 'Infinite Marquee', icon: '∞', description: 'Auto-scrolling horizontal banner with pause on hover', style: { galleryStyle: 'marquee' } },
  ],
  description: [
    { id: 'desc-single', label: 'Single Column', icon: '📄', description: 'Clean single-column text, left-aligned', style: { textAlign: 'left', padding: '1rem 0' } },
    { id: 'desc-centered', label: 'Centered', icon: '☰', description: 'Centered text with comfortable margins', style: { textAlign: 'center', padding: '2rem' } },
    { id: 'desc-featured', label: 'Featured', icon: '⭐', description: 'Emphasized text with accent styling', style: { textAlign: 'center', padding: '3rem 2rem', color: undefined, backgroundColor: undefined } },
  ],
  contact: [
    { id: 'contact-inline', label: 'Inline', icon: '➡️', description: 'Horizontal contact details in a row', style: { textAlign: 'center', padding: '1.5rem' } },
    { id: 'contact-card', label: 'Card Style', icon: '🔲', description: 'Bordered card with padded contact info', style: { textAlign: 'left', padding: '2rem' } },
    { id: 'contact-minimal', label: 'Minimal', icon: '·', description: 'Clean, borderless contact block', style: { textAlign: 'left', padding: '1rem' } },
  ],
  price: [
    { id: 'price-large', label: 'Large Display', icon: '💰', description: 'Big prominent price with accent color', style: { textAlign: 'center', padding: '2rem' } },
    { id: 'price-inline', label: 'Inline', icon: '↔️', description: 'Price inline with label, compact', style: { textAlign: 'left', padding: '1rem' } },
    { id: 'price-highlight', label: 'Highlighted', icon: '🔶', description: 'Price on an accent background badge', style: { textAlign: 'center', padding: '1.5rem', backgroundColor: undefined } },
  ],
  header: [
    { id: 'header-center', label: 'Centered', icon: '☰', description: 'Centered logo and navigation', style: { textAlign: 'center', padding: '0.75rem' } },
    { id: 'header-left', label: 'Left Aligned', icon: '≡', description: 'Logo left, nav right', style: { textAlign: 'left', padding: '0.75rem' } },
  ],
  characteristics: [
    { id: 'chars-grid', label: 'Grid Layout', icon: '⊞', description: 'Features in a 2-column grid', style: { textAlign: 'left', padding: '1.5rem' } },
    { id: 'chars-inline', label: 'Inline Row', icon: '➡️', description: 'All characteristics in a single row', style: { textAlign: 'center', padding: '1rem' } },
    { id: 'chars-icons', label: 'With Icons', icon: '🎯', description: 'Icon-accented characteristic badges', style: { textAlign: 'center', padding: '1.5rem' } },
  ],
  otherProperties: [
    { id: 'other-grid', label: 'Card Grid', icon: '⊞', description: 'Properties as a grid of cards', style: { textAlign: 'left', padding: '1.5rem' } },
    { id: 'other-list', label: 'Simple List', icon: '📋', description: 'Compact property list', style: { textAlign: 'left', padding: '1rem' } },
  ],
  bottom: [
    { id: 'bottom-center', label: 'Centered', icon: '⊟', description: 'Centered footer content', style: { textAlign: 'center', padding: '2rem 1rem' } },
    { id: 'bottom-split', label: 'Split Layout', icon: '↔️', description: 'Content split left and right', style: { textAlign: 'left', padding: '1.5rem' } },
  ],
  closeTo: [
    { id: 'close-grid', label: 'Grid Layout', icon: '⊞', description: 'Nearby places in a grid', style: { textAlign: 'left', padding: '1rem' } },
    { id: 'close-list', label: 'List Layout', icon: '📋', description: 'Nearby places as a bullet list', style: { textAlign: 'left', padding: '1rem' } },
  ],
  amenities: [
    { id: 'amen-grid', label: 'Grid', icon: '⊞', description: 'Amenities in a multi-column grid', style: { textAlign: 'left', padding: '1.5rem' } },
    { id: 'amen-list', label: 'List', icon: '📋', description: 'Simple vertical list', style: { textAlign: 'left', padding: '1rem' } },
    { id: 'amen-compact', label: 'Compact Tags', icon: '🏷️', description: 'Small badge-style chips', style: { textAlign: 'left', padding: '0.75rem' } },
  ],
  map: [
    { id: 'map-full', label: 'Full Height', icon: '🗺️', description: 'Large full-height map', style: { padding: '0' } },
    { id: 'map-compact', label: 'Compact', icon: '📍', description: 'Small map with address overlay', style: { padding: '0' } },
  ],
  facilities: [
    { id: 'fac-grid', label: 'Grid Layout', icon: '⊞', description: 'Facilities in a grid', style: { textAlign: 'left', padding: '1.5rem' } },
    { id: 'fac-list', label: 'List Layout', icon: '📋', description: 'Facilities as a list', style: { textAlign: 'left', padding: '1rem' } },
  ],
  floorPlan: [
    { id: 'floor-full', label: 'Full Width', icon: '🖼️', description: 'Full-width floor plan image', style: { textAlign: 'center', padding: '1rem' } },
    { id: 'floor-side', label: 'Side by Side', icon: '↔️', description: 'Image and room labels side by side', style: { textAlign: 'left', padding: '1rem' } },
  ],
  rules: [
    { id: 'rules-list', label: 'Bullet List', icon: '📋', description: 'Rules as bullet points', style: { textAlign: 'left', padding: '1rem' } },
    { id: 'rules-icons', label: 'Icon List', icon: '🎯', description: 'Rules with icon markers', style: { textAlign: 'left', padding: '1.5rem' } },
  ],
  testimonials: [
    { id: 'testim-carousel', label: 'Carousel', icon: '◀▶', description: 'Rotating testimonial cards', style: { textAlign: 'center', padding: '2rem' } },
    { id: 'testim-grid', label: 'Grid', icon: '⊞', description: 'Testimonials in a grid layout', style: { textAlign: 'left', padding: '1.5rem' } },
    { id: 'testim-featured', label: 'Featured', icon: '⭐', description: 'Large featured testimonial', style: { textAlign: 'center', padding: '3rem' } },
  ],
  location: [
    { id: 'loc-full', label: 'Full Layout', icon: '🌍', description: 'Map with description and nearby places', style: { textAlign: 'left', padding: '1.5rem' } },
    { id: 'loc-compact', label: 'Compact', icon: '📍', description: 'Minimal location display', style: { textAlign: 'left', padding: '1rem' } },
  ],
  recap: [
    { id: 'recap-table', label: 'Table Layout', icon: '⊟', description: 'Key details in a structured table', style: { textAlign: 'left', padding: '1.5rem' } },
    { id: 'recap-inline', label: 'Inline', icon: '↔️', description: 'Compact inline details', style: { textAlign: 'center', padding: '1rem' } },
  ],
};

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
              @let rm = store.rentalMode();
              @if (rm === 'entire_place' || rm === 'both') {
                <div class="config-field">
                  <label>Min Price {{ rm === 'both' ? '(Whole Property)' : '' }}</label>
                  <input type="number" [ngModel]="section.content['minPrice']" (ngModelChange)="updateContent('minPrice', Number($event))" />
                </div>
              }
              @if (rm === 'private_rooms' || rm === 'both') {
                <div class="config-field">
                  <label>Rooms ({{ getRooms().length }})</label>
                  <div class="room-editor-list">
                    @for (room of getRooms(); track room.id; let idx = $index) {
                      <div class="room-editor-card">
                        <div class="room-editor-header">
                          <span class="room-editor-title">{{ room.name || 'Room ' + (idx + 1) }}</span>
                          <button class="array-remove" (click)="removeRoom(idx)" title="Remove room">✕</button>
                        </div>
                        <div class="room-editor-body">
                          <div class="room-editor-row">
                            <div class="room-editor-field flex-2">
                              <label>Name</label>
                              <input type="text" [ngModel]="room.name" (ngModelChange)="updateRoomField(idx, 'name', $event)" placeholder="e.g. Master Bedroom" />
                            </div>
                            <div class="room-editor-field flex-1">
                              <label>Price/night</label>
                              <input type="number" [ngModel]="room.price" (ngModelChange)="updateRoomField(idx, 'price', Number($event))" placeholder="0" />
                            </div>
                            <div class="room-editor-field flex-1">
                              <label>Max Guests</label>
                              <input type="number" [ngModel]="room.maxGuests" (ngModelChange)="updateRoomField(idx, 'maxGuests', Number($event))" placeholder="2" min="1" />
                            </div>
                          </div>
                          <div class="room-editor-row">
                            <div class="room-editor-field flex-1">
                              <label>Bed Type</label>
                              <select [ngModel]="room.bedType" (ngModelChange)="updateRoomField(idx, 'bedType', $event)">
                                <option value="king">King</option>
                                <option value="queen">Queen</option>
                                <option value="double">Double</option>
                                <option value="twin">Twin</option>
                                <option value="bunk">Bunk</option>
                                <option value="single">Single</option>
                                <option value="sofa_bed">Sofa Bed</option>
                                <option value="crib">Crib</option>
                              </select>
                            </div>
                            <div class="room-editor-field flex-1">
                              <label>Surface (m²)</label>
                              <input type="number" [ngModel]="room.surface" (ngModelChange)="updateRoomField(idx, 'surface', Number($event))" placeholder="0" />
                            </div>
                            <div class="room-editor-field flex-1">
                              <label class="checkbox-label">
                                <input type="checkbox" [ngModel]="room.privateBathroom" (ngModelChange)="updateRoomField(idx, 'privateBathroom', $event)" />
                                Private Bathroom
                              </label>
                            </div>
                          </div>
                          <div class="room-editor-field">
                            <label>Description</label>
                            <textarea [ngModel]="room.description" (ngModelChange)="updateRoomField(idx, 'description', $event)" rows="2" placeholder="Room features, view, notes..."></textarea>
                          </div>
                          <div class="room-editor-field">
                            <label>Amenities (comma separated)</label>
                            <input type="text" [ngModel]="(room.amenities || []).join(', ')" (ngModelChange)="updateRoomAmenities(idx, $event)" placeholder="TV, Air conditioning, Balcony" />
                          </div>
                          <div class="room-editor-field">
                            <label>Room Photos</label>
                            @let roomUrls = room.photos || [];
                            @if (store.photos().length > 0) {
                              <div class="photo-grid" style="margin-bottom: 6px;">
                                @for (photo of store.photos(); track photo.id) {
                                  <div
                                    class="photo-grid-item photo-grid-item-sm"
                                    [class.selected]="roomUrls.includes(photo.url)"
                                    (click)="toggleRoomPhoto(idx, photo.url)"
                                    [style.background-image]="'url(' + photo.url + ')'"
                                    [title]="(roomUrls.includes(photo.url) ? 'Remove' : 'Add') + ' photo'">
                                    @if (roomUrls.includes(photo.url)) {
                                      <span class="photo-check">✓</span>
                                    }
                                  </div>
                                }
                              </div>
                            }
                            <input type="text" [ngModel]="roomExternalPhotosValue(idx)" (ngModelChange)="updateRoomExternalPhotos(idx, $event)" placeholder="Or paste external photo URLs, comma separated" class="room-editor-external-input" />
                          </div>
                        </div>
                      </div>
                    }
                    <button class="array-add" (click)="addRoom()">+ Add Room</button>
                  </div>
                </div>
              }
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
                <label>Title</label>
                <input type="text" [ngModel]="section.content['title']" (ngModelChange)="updateContent('title', $event)" placeholder="Photo Gallery" />
              </div>
              <div class="config-field">
                <label>Property Photos</label>
                @let selectedUrls = sectionPhotos();
                <div class="photo-grid">
                  @for (photo of store.photos(); track photo.id) {
                    <div
                      class="photo-grid-item"
                      [class.selected]="selectedUrls.includes(photo.url)"
                      (click)="togglePhoto(photo.url)"
                      [style.background-image]="'url(' + photo.url + ')'"
                      [title]="(selectedUrls.includes(photo.url) ? 'Remove' : 'Add') + ' photo'">
                      @if (selectedUrls.includes(photo.url)) {
                        <span class="photo-check">✓</span>
                      }
                    </div>
                  }
                </div>
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
          <div style="font-size:10px;color:#6366f1;padding:4px 0;">
            Type: {{ section.type }} | Presets: {{ sectionPresets().length }}
          </div>
          @if (sectionPresets().length > 0) {
            <div class="config-style-section">
              <label class="config-field-label">Presets</label>
              <div class="preset-grid">
                @for (preset of sectionPresets(); track preset.id) {
                  <button
                    class="preset-card"
                    [class.active]="activePresetId() === preset.id"
                    (click)="applyPreset(preset)">
                    <span class="preset-icon">{{ preset.icon }}</span>
                    <span class="preset-label">{{ preset.label }}</span>
                    <span class="preset-desc">{{ preset.description }}</span>
                  </button>
                }
              </div>
            </div>
          }

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
                <label>Fit / Layout</label>
                <select [ngModel]="effectiveStyle().backgroundSize || 'cover'" (ngModelChange)="updateStyle({ backgroundSize: $event })">
                  <option value="cover">Cover — fills block, clips edges</option>
                  <option value="contain">Contain — fits inside</option>
                  <option value="auto">Original — native size</option>
                  <option value="stretch">Stretch — distorts to fill</option>
                </select>
              </div>
              <div class="config-field">
                <label>Anchor Point</label>
                <select [ngModel]="effectiveStyle().backgroundPosition || '50% 50%'" (ngModelChange)="updateStyle({ backgroundPosition: $event })">
                  <option value="0% 0%">Top Left</option>
                  <option value="50% 0%">Top Center</option>
                  <option value="100% 0%">Top Right</option>
                  <option value="0% 50%">Center Left</option>
                  <option value="50% 50%">Center</option>
                  <option value="100% 50%">Center Right</option>
                  <option value="0% 100%">Bottom Left</option>
                  <option value="50% 100%">Bottom Center</option>
                  <option value="100% 100%">Bottom Right</option>
                </select>
              </div>
              <div class="config-field">
                <label>Attachment</label>
                <select [ngModel]="effectiveStyle().backgroundAttachment || 'scroll'" (ngModelChange)="updateStyle({ backgroundAttachment: $event })">
                  <option value="scroll">Scroll — moves with page</option>
                  <option value="fixed">Fixed — stays in place</option>
                  <option value="parallax">Parallax — slow movement</option>
                </select>
              </div>
              <div class="config-field">
                <label>Scroll Effect</label>
                <select [ngModel]="effectiveStyle().scrollEffect || 'none'" (ngModelChange)="updateStyle({ scrollEffect: $event })">
                  <option value="none">None</option>
                  <option value="parallax">Shift</option>
                  <option value="zoom-parallax">Zoom</option>
                  <option value="translate-parallax">Pan</option>
                </select>
              </div>
            }
          </div>

          @if (section.type === 'photos') {
          <div class="config-style-section">
            <label class="config-field-label">Gallery Style</label>
            <div class="config-field">
              <select [ngModel]="effectiveStyle().galleryStyle || 'grid'" (ngModelChange)="updateStyle({ galleryStyle: $event })">
                <option value="grid">CSS Grid — clean multi-column</option>
                <option value="masonry">Masonry — Pinterest style</option>
                <option value="justified">Justified Row — Flickr style</option>
                <option value="carousel-scroll">Scroll Snap Carousel</option>
                <option value="carousel-interactive">Interactive Carousel</option>
                <option value="marquee">Infinite Marquee</option>
              </select>
            </div>
          </div>
          }

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

  sectionPhotos = computed(() => {
    const images = this.section()?.content['images'];
    return Array.isArray(images) ? images.map((i: unknown) => typeof i === 'object' && i !== null ? (i as {url?: string}).url || '' : String(i)).filter(Boolean) : [];
  });

  sectionPresets = computed(() => {
    const sec = this.section();
    if (!sec) return [];
    const presets = SECTION_PRESETS[sec.type] || [];
    console.log('[Presets] section type:', sec.type, 'presets found:', presets.length);
    return presets;
  });

  activePresetId = computed(() => {
    const presets = this.sectionPresets();
    const style = this.effectiveStyle();
    for (const preset of presets) {
      const matches = Object.keys(preset.style).every(key => {
        const k = key as keyof SectionStyle;
        return style[k] === preset.style[k];
      });
      if (matches) return preset.id;
    }
    return null;
  });

  applyPreset(preset: StylePreset): void {
    const sec = this.section();
    if (!sec) return;
    if (this.activePresetId() === preset.id) return;
    this.updateStyle(preset.style);
  }

  updateContent(key: string, value: unknown): void {
    const sec = this.section();
    if (!sec) return;
    this.store.updateSection(sec.id, {
      content: { ...sec.content, [key]: value },
    });
  }

  togglePhoto(url: string): void {
    const current = this.sectionPhotos();
    const next = current.includes(url) ? current.filter(u => u !== url) : [...current, url];
    this.updateContent('images', next.map(u => ({ url: u, caption: '' })));
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

  getRooms(): RentableRoom[] {
    const rooms = this.section()?.content['rooms'];
    return Array.isArray(rooms) ? rooms as RentableRoom[] : [];
  }

  addRoom(): void {
    const sec = this.section();
    if (!sec) return;
    const current = this.getRooms();
    current.push({
      id: `room_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      name: '',
      price: 0,
      maxGuests: 2,
      bedType: 'queen',
      privateBathroom: true,
      description: '',
      amenities: [],
      photos: [],
    });
    this.updateContent('rooms', current);
  }

  removeRoom(index: number): void {
    const sec = this.section();
    if (!sec) return;
    const current = this.getRooms();
    current.splice(index, 1);
    this.updateContent('rooms', current);
  }

  updateRoomField(index: number, field: string, value: unknown): void {
    const sec = this.section();
    if (!sec) return;
    const current = this.getRooms();
    current[index] = { ...current[index], [field]: value };
    this.updateContent('rooms', current);
  }

  updateRoomAmenities(index: number, raw: string): void {
    const list = raw.split(',').map(s => s.trim()).filter(Boolean);
    this.updateRoomField(index, 'amenities', list);
  }

  updateRoomPhotos(index: number, raw: string): void {
    const list = raw.split('\n').map(s => s.trim()).filter(Boolean);
    this.updateRoomField(index, 'photos', list);
  }

  toggleRoomPhoto(index: number, url: string): void {
    const sec = this.section();
    if (!sec) return;
    const current = this.getRooms();
    const photos = current[index]?.photos || [];
    const next = photos.includes(url) ? photos.filter(u => u !== url) : [...photos, url];
    current[index] = { ...current[index], photos: next };
    this.updateContent('rooms', current);
  }

  roomExternalPhotosValue(index: number): string {
    const room = this.getRooms()[index];
    if (!room) return '';
    const propUrls = this.store.photos().map((p: any) => p.url);
    return (room.photos || []).filter((u: string) => !propUrls.includes(u)).join(', ');
  }

  updateRoomExternalPhotos(index: number, raw: string): void {
    const external = raw.split(',').map(s => s.trim()).filter(Boolean);
    const propPhotoUrls = this.store.photos().map((p: any) => p.url);
    const existing = (this.getRooms()[index]?.photos || []).filter((u: string) => propPhotoUrls.includes(u));
    this.updateRoomField(index, 'photos', [...existing, ...external]);
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
