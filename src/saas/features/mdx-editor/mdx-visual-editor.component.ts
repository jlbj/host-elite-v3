import { Component, OnInit, signal, inject, OnDestroy, ViewChild, ElementRef, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MdxParserService } from '../../../services/mdx-parser.service';
import { HostRepository } from '../../../services/host-repository.service';

import { MdxHeroComponent } from './components/mdx-hero.component';
import { MdxGalleryComponent } from './components/mdx-gallery.component';
import { MdxFeaturesComponent } from './components/mdx-features.component';
import { MdxTestimonialsComponent } from './components/mdx-testimonials.component';
import { MdxContactComponent } from './components/mdx-contact.component';
import { MdxCtaComponent } from './components/mdx-cta.component';
import { MdxTextComponent } from './components/mdx-text.component';

declare const monaco: any;

export type EditorSection = any;

@Component({
  selector: 'app-mdx-visual-editor',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MdxHeroComponent,
    MdxGalleryComponent,
    MdxFeaturesComponent,
    MdxTestimonialsComponent,
    MdxContactComponent,
    MdxCtaComponent,
    MdxTextComponent
  ],
  template: `
    <div class="h-screen flex flex-col bg-slate-900">
      <!-- Header -->
      <div class="flex items-center justify-between px-4 py-3 bg-slate-800 border-b border-slate-700 flex-shrink-0">
        <div class="flex items-center gap-4">
          <h1 class="text-white font-bold text-lg">MDX Editor</h1>
          <span class="text-amber-400 text-sm font-mono">{{ propertyName() }}</span>
        </div>
        
        <!-- Toggle Button -->
        <div class="flex items-center gap-1 bg-slate-700 rounded-lg p-1">
          <button (click)="setView('preview')" 
                  [class.bg-amber-600]="viewMode() === 'preview'"
                  [class.text-white]="viewMode() === 'preview'"
                  [class.text-slate-400]="viewMode() !== 'preview'"
                  class="px-4 py-2 text-sm font-bold rounded-md hover:bg-amber-500 transition-colors">
            👁️ Preview
          </button>
          <button (click)="setView('code')" 
                  [class.bg-amber-600]="viewMode() === 'code'"
                  [class.text-white]="viewMode() === 'code'"
                  [class.text-slate-400]="viewMode() !== 'code'"
                  class="px-4 py-2 text-sm font-bold rounded-md hover:bg-amber-500 transition-colors">
            📝 MDX Code
          </button>
        </div>
        
        <div class="flex items-center gap-2">
          <button (click)="reloadFromProperty()" class="px-3 py-1.5 bg-green-700 text-white text-sm rounded hover:bg-green-600">
            🔄 Reload from Property
          </button>
          <button (click)="loadTemplate('basic')" class="px-3 py-1.5 bg-slate-700 text-white text-sm rounded hover:bg-slate-600">
            Basic Template
          </button>
          <button (click)="loadTemplate('luxury')" class="px-3 py-1.5 bg-slate-700 text-white text-sm rounded hover:bg-slate-600">
            Luxury Template
          </button>
          <button (click)="save()" [disabled]="saving()" class="px-4 py-1.5 bg-amber-600 text-white text-sm rounded hover:bg-amber-500 disabled:opacity-50">
            {{ saving() ? 'Saving...' : 'Save' }}
          </button>
        </div>
      </div>

      <div class="flex-1 flex overflow-hidden">
        <!-- Left Panel: UI Editor -->
        <div class="w-[450px] border-r border-slate-700 flex flex-col bg-slate-800 flex-shrink-0">
          <div class="px-4 py-3 bg-slate-700 text-white text-sm font-bold border-b border-slate-600 flex-shrink-0">
            ✏️ Edit Sections
          </div>
          
          <div class="flex-1 overflow-y-auto p-4 space-y-2">
            @for (section of sections(); track $index) {
              <div class="bg-slate-700 rounded-lg border border-slate-600 overflow-hidden">
                <!-- Section Header -->
                <div class="flex items-center justify-between px-4 py-3 bg-slate-750 border-b border-slate-600">
                  <div class="flex items-center gap-2">
                    <button (click)="toggleExpanded($index)" class="text-slate-400 hover:text-white transition">
                      {{ isExpanded($index) ? '▼' : '▶' }}
                    </button>
                    <h3 class="text-white font-bold text-sm">{{ section.type }}</h3>
                    @if (section.hidden) {
                      <span class="text-xs bg-orange-600 text-white px-2 py-0.5 rounded">Hidden</span>
                    }
                  </div>
                  <div class="flex items-center gap-1">
                    <button (click)="moveSection($index, -1)" [disabled]="$index === 0" 
                            class="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed" title="Move Up">
                      ↑
                    </button>
                    <button (click)="moveSection($index, 1)" [disabled]="$index === sections().length - 1" 
                            class="p-1 text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed" title="Move Down">
                      ↓
                    </button>
                    <button (click)="toggleSectionVisibility($index)" 
                            [class.text-green-400]="!section.hidden" 
                            [class.text-red-400]="section.hidden"
                            class="p-1 hover:text-white transition" 
                            [title]="section.hidden ? 'Show Section' : 'Hide Section'">
                      {{ section.hidden ? '👁️' : '🙈' }}
                    </button>
                  </div>
                </div>

                <!-- Section Content (Collapsible) -->
                @if (isExpanded($index)) {
                  <div class="p-4">
                @if (section.type === 'Hero') {
                  <div class="space-y-3">
                    <div>
                      <label class="block text-slate-400 text-xs mb-1">Title</label>
                      <input type="text" [(ngModel)]="section.props.title" class="w-full px-3 py-2 bg-slate-600 text-white text-sm rounded border border-slate-500 focus:border-amber-500 focus:outline-none" />
                    </div>
                    <div>
                      <label class="block text-slate-400 text-xs mb-1">Subtitle</label>
                      <input type="text" [(ngModel)]="section.props.subtitle" class="w-full px-3 py-2 bg-slate-600 text-white text-sm rounded border border-slate-500 focus:border-amber-500 focus:outline-none" />
                    </div>
                    <div>
                      <label class="block text-slate-400 text-xs mb-1">Description</label>
                      <textarea [(ngModel)]="section.props.description" rows="2" class="w-full px-3 py-2 bg-slate-600 text-white text-sm rounded border border-slate-500 focus:border-amber-500 focus:outline-none"></textarea>
                    </div>
                    <div>
                      <label class="block text-slate-400 text-xs mb-1">Background Image</label>
                      <div class="grid grid-cols-4 gap-2 mb-2">
                        @for (photo of propertyPhotos; track $index) {
                          <button (click)="section.props.backgroundImage = photo.url" 
                                  class="aspect-square rounded border-2 overflow-hidden hover:opacity-80 transition"
                                  [class.border-amber-500]="section.props.backgroundImage === photo.url"
                                  [class.border-slate-600]="section.props.backgroundImage !== photo.url">
                            <img [src]="photo.url" [alt]="photo.category" class="w-full h-full object-cover" />
                          </button>
                        } @empty {
                          <p class="col-span-4 text-slate-500 text-xs text-center py-4">No property photos available</p>
                        }
                      </div>
                      <input type="text" [(ngModel)]="section.props.backgroundImage" placeholder="Or paste image URL" class="w-full px-3 py-2 bg-slate-600 text-white text-sm rounded border border-slate-500 focus:border-amber-500 focus:outline-none" />
                    </div>
                  </div>
                }

                @if (section.type === 'Text') {
                  <div class="space-y-3">
                    <div>
                      <label class="block text-slate-400 text-xs mb-1">Title</label>
                      <input type="text" [(ngModel)]="section.props.title" class="w-full px-3 py-2 bg-slate-600 text-white text-sm rounded border border-slate-500 focus:border-amber-500 focus:outline-none" />
                    </div>
                    <div>
                      <label class="block text-slate-400 text-xs mb-1">Content</label>
                      <textarea [(ngModel)]="section.props.content" rows="4" class="w-full px-3 py-2 bg-slate-600 text-white text-sm rounded border border-slate-500 focus:border-amber-500 focus:outline-none"></textarea>
                    </div>
                  </div>
                }

                @if (section.type === 'Features') {
                  <div class="space-y-3">
                    <div>
                      <label class="block text-slate-400 text-xs mb-1">Title</label>
                      <input type="text" [(ngModel)]="section.props.title" class="w-full px-3 py-2 bg-slate-600 text-white text-sm rounded border border-slate-500 focus:border-amber-500 focus:outline-none" />
                    </div>
                    <div>
                      <label class="block text-slate-400 text-xs mb-2">Select from Property Features</label>
                      <div class="max-h-48 overflow-y-auto border border-slate-600 rounded mb-3">
                        @for (equip of propertyEquipments; track $index) {
                          <button (click)="toggleFeatureFromEquipment(section, equip.name)" 
                                  class="w-full flex items-center justify-between px-3 py-2 hover:bg-slate-600 transition border-b border-slate-700 last:border-0"
                                  [class.bg-slate-600]="isFeatureSelected(section, equip.name)"
                                  [class.bg-slate-700]="!isFeatureSelected(section, equip.name)">
                            <div class="flex items-center gap-2">
                              <span class="text-lg">{{ isFeatureSelected(section, equip.name) ? '☑️' : '⬜' }}</span>
                              <span class="text-white text-sm">{{ equip.name }}</span>
                            </div>
                            @if (equip.manual_url) {
                              <span class="text-slate-400 text-xs truncate max-w-[150px]">{{ equip.manual_url }}</span>
                            }
                          </button>
                        } @empty {
                          <p class="text-slate-500 text-xs text-center py-4">No property features available</p>
                        }
                      </div>
                      <div class="border-t border-slate-600 pt-3">
                        <label class="block text-slate-400 text-xs mb-2">Selected Features ({{ section.props.features?.length || 0 }})</label>
                        @for (feature of section.props.features; track $index) {
                          <div class="bg-slate-600 p-2 rounded border border-slate-500 mb-2">
                            <div class="flex items-center justify-between mb-2">
                              <span class="text-slate-300 text-xs font-bold">Feature {{ $index + 1 }}: {{ feature.title }}</span>
                              <button (click)="removeFeature(section, $index)" class="text-red-400 hover:text-red-300 text-xs">✕ Remove</button>
                            </div>
                            <div class="grid grid-cols-3 gap-2">
                              <input type="text" [(ngModel)]="feature.icon" placeholder="Icon" class="px-2 py-1 bg-slate-700 text-white text-xs rounded border border-slate-500" />
                              <input type="text" [(ngModel)]="feature.title" placeholder="Title" class="px-2 py-1 bg-slate-700 text-white text-xs rounded border border-slate-500" />
                              <input type="text" [(ngModel)]="feature.description" placeholder="Description" class="px-2 py-1 bg-slate-700 text-white text-xs rounded border border-slate-500" />
                            </div>
                          </div>
                        } @empty {
                          <p class="text-slate-500 text-xs text-center py-2">No features selected. Click from the list above or add manually.</p>
                          <button (click)="addFeature(section)" class="w-full px-2 py-1 bg-amber-600 text-white text-xs rounded hover:bg-amber-500 mt-2">+ Add Manual Feature</button>
                        }
                      </div>
                    </div>
                  </div>
                }

                @if (section.type === 'Gallery') {
                  <div class="space-y-3">
                    <div>
                      <label class="block text-slate-400 text-xs mb-1">Title</label>
                      <input type="text" [(ngModel)]="section.props.title" class="w-full px-3 py-2 bg-slate-600 text-white text-sm rounded border border-slate-500 focus:border-amber-500 focus:outline-none" />
                    </div>
                    <div>
                      <label class="block text-slate-400 text-xs mb-2">Select Photos for Gallery</label>
                      <div class="grid grid-cols-4 gap-2 mb-3">
                        @for (photo of propertyPhotos; track $index) {
                          <button (click)="toggleGalleryImage(section, photo.url)" 
                                  class="aspect-square rounded border-2 overflow-hidden hover:opacity-80 transition relative"
                                  [class.border-amber-500]="section.props.images?.includes(photo.url)"
                                  [class.border-slate-600]="!section.props.images?.includes(photo.url)">
                            <img [src]="photo.url" [alt]="photo.category" class="w-full h-full object-cover" />
                            @if (section.props.images?.includes(photo.url)) {
                              <div class="absolute inset-0 bg-amber-500/30 flex items-center justify-center">
                                <span class="text-white text-2xl">✓</span>
                              </div>
                            }
                          </button>
                        } @empty {
                          <p class="col-span-4 text-slate-500 text-xs text-center py-4">No property photos available</p>
                        }
                      </div>
                      <div class="border-t border-slate-600 pt-3">
                        <label class="block text-slate-400 text-xs mb-2">Selected Images ({{ section.props.images?.length || 0 }})</label>
                        @for (img of section.props.images; track $index) {
                          <div class="flex items-center gap-2 mb-2 bg-slate-600 p-2 rounded">
                            <img [src]="img" class="w-12 h-12 object-cover rounded" />
                            <span class="text-slate-300 text-xs flex-1 truncate">{{ img }}</span>
                            <button (click)="removeGalleryImage(section, $index)" class="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-500">✕</button>
                          </div>
                        } @empty {
                          <p class="text-slate-500 text-xs text-center py-2">No images selected. Click photos above to add.</p>
                        }
                      </div>
                    </div>
                  </div>
                }

                @if (section.type === 'Testimonials') {
                  <div class="space-y-3">
                    <div>
                      <label class="block text-slate-400 text-xs mb-1">Title</label>
                      <input type="text" [(ngModel)]="section.props.title" class="w-full px-3 py-2 bg-slate-600 text-white text-sm rounded border border-slate-500 focus:border-amber-500 focus:outline-none" />
                    </div>
                    <div>
                      <div class="flex items-center justify-between mb-2">
                        <label class="block text-slate-400 text-xs">Testimonials</label>
                        <button (click)="addTestimonial(section)" class="px-2 py-1 bg-amber-600 text-white text-xs rounded hover:bg-amber-500">+ Add</button>
                      </div>
                      @for (t of section.props.testimonials; track $index) {
                        <div class="bg-slate-600 p-2 rounded border border-slate-500 space-y-2">
                          <div class="flex items-center justify-between">
                            <span class="text-slate-300 text-xs font-bold">Testimonial {{ $index + 1 }}</span>
                            <button (click)="removeTestimonial(section, $index)" class="text-red-400 hover:text-red-300 text-xs">✕</button>
                          </div>
                          <textarea [(ngModel)]="t.text" placeholder="Testimonial text" rows="2" class="w-full px-2 py-1 bg-slate-700 text-white text-xs rounded border border-slate-500"></textarea>
                          <input type="text" [(ngModel)]="t.name" placeholder="Name" class="w-full px-2 py-1 bg-slate-700 text-white text-xs rounded border border-slate-500" />
                          <input type="text" [(ngModel)]="t.location" placeholder="Location" class="w-full px-2 py-1 bg-slate-700 text-white text-xs rounded border border-slate-500" />
                        </div>
                      }
                    </div>
                  </div>
                }

                @if (section.type === 'Contact') {
                  <div class="space-y-3">
                    <div>
                      <label class="block text-slate-400 text-xs mb-1">Title</label>
                      <input type="text" [(ngModel)]="section.props.title" class="w-full px-3 py-2 bg-slate-600 text-white text-sm rounded border border-slate-500 focus:border-amber-500 focus:outline-none" />
                    </div>
                    <div>
                      <label class="block text-slate-400 text-xs mb-1">Subtitle</label>
                      <input type="text" [(ngModel)]="section.props.subtitle" class="w-full px-3 py-2 bg-slate-600 text-white text-sm rounded border border-slate-500 focus:border-amber-500 focus:outline-none" />
                    </div>
                    <div class="space-y-2">
                      <div>
                        <label class="block text-slate-400 text-xs mb-1">Email</label>
                        <input type="text" [(ngModel)]="section.props.email" class="w-full px-3 py-2 bg-slate-600 text-white text-sm rounded border border-slate-500 focus:border-amber-500 focus:outline-none" />
                      </div>
                      <div>
                        <label class="block text-slate-400 text-xs mb-1">Phone</label>
                        <input type="text" [(ngModel)]="section.props.phone" class="w-full px-3 py-2 bg-slate-600 text-white text-sm rounded border border-slate-500 focus:border-amber-500 focus:outline-none" />
                      </div>
                      <div>
                        <label class="block text-slate-400 text-xs mb-1">Address</label>
                        <input type="text" [(ngModel)]="section.props.address" class="w-full px-3 py-2 bg-slate-600 text-white text-sm rounded border border-slate-500 focus:border-amber-500 focus:outline-none" />
                      </div>
                    </div>
                  </div>
                }

                @if (section.type === 'CTA') {
                  <div class="space-y-3">
                    <div>
                      <label class="block text-slate-400 text-xs mb-1">Title</label>
                      <input type="text" [(ngModel)]="section.props.title" class="w-full px-3 py-2 bg-slate-600 text-white text-sm rounded border border-slate-500 focus:border-amber-500 focus:outline-none" />
                    </div>
                    <div>
                      <label class="block text-slate-400 text-xs mb-1">Description</label>
                      <textarea [(ngModel)]="section.props.description" rows="2" class="w-full px-3 py-2 bg-slate-600 text-white text-sm rounded border border-slate-500 focus:border-amber-500 focus:outline-none"></textarea>
                    </div>
                    <div class="grid grid-cols-2 gap-3">
                      <div>
                        <label class="block text-slate-400 text-xs mb-1">Button Text</label>
                        <input type="text" [(ngModel)]="section.props.buttonText" class="w-full px-3 py-2 bg-slate-600 text-white text-sm rounded border border-slate-500 focus:border-amber-500 focus:outline-none" />
                      </div>
                      <div>
                        <label class="block text-slate-400 text-xs mb-1">Button Link</label>
                        <input type="text" [(ngModel)]="section.props.buttonLink" class="w-full px-3 py-2 bg-slate-600 text-white text-sm rounded border border-slate-500 focus:border-amber-500 focus:outline-none" />
                      </div>
                    </div>
                  </div>
                }
              </div>
            }
          </div>
            } @empty {
              <div class="text-center text-slate-400 py-8">
                <p class="mb-2">No sections yet</p>
                <button (click)="loadTemplate('basic')" class="px-4 py-2 bg-amber-600 text-white text-sm rounded hover:bg-amber-500">Load Basic Template</button>
              </div>
            }
          </div>
        </div>

        <!-- Right Panel: Preview or Code -->
        <div class="flex-1 flex flex-col overflow-hidden">
          @if (viewMode() === 'preview') {
            <div class="flex-1 overflow-y-auto bg-white">
              @for (section of sections(); track $index) {
                @if (!section.hidden) {
                  @switch (section.type) {
                  @case ('Hero') {
                    <app-mdx-hero [title]="section.props.title" [subtitle]="section.props.subtitle" [description]="section.props.description" [backgroundImage]="section.props.backgroundImage" ctaText="" ctaLink="" />
                  }
                  @case ('Text') {
                    <app-mdx-text [title]="section.props.title" [content]="section.props.content" />
                  }
                  @case ('Features') {
                    <app-mdx-features [title]="section.props.title" [features]="section.props.features || []" />
                  }
                  @case ('Gallery') {
                    <app-mdx-gallery [title]="section.props.title" [images]="section.props.images || []" />
                  }
                  @case ('Testimonials') {
                    <app-mdx-testimonials [title]="section.props.title" [testimonials]="section.props.testimonials || []" />
                  }
                  @case ('Contact') {
                    <app-mdx-contact [title]="section.props.title" [subtitle]="section.props.subtitle" [email]="section.props.email" [phone]="section.props.phone" [address]="section.props.address" />
                  }
                  @case ('CTA') {
                    <app-mdx-cta [title]="section.props.title" [description]="section.props.description" [buttonText]="section.props.buttonText" [buttonLink]="section.props.buttonLink" />
                  }
                  }
                }
              }
            </div>
          } @else if (viewMode() === 'code') {
            <div #codeContainer class="flex-1 overflow-hidden"></div>
          }
        </div>
      </div>
    </div>
  `
})
export class MdxVisualEditorComponent implements OnInit, OnDestroy {
  @ViewChild('codeContainer') codeContainer!: ElementRef;

  private parser = inject(MdxParserService);
  private repository = inject(HostRepository);

  editor: any = null;
  monaco: any = null;
  propertyName = input('');
  
  sections = signal<EditorSection[]>([]);
  viewMode = signal<'preview' | 'code'>('preview');
  saving = signal(false);
  monacoLoaded = signal(false);
  propertyData: any = null;
  propertyPhotos: any[] = [];
  propertyEquipments: any[] = [];
  expandedSections = signal<Set<number>>(new Set());

  // EMPTY template - clearly shows it's empty
  emptyTemplate: EditorSection[] = [
    {
      type: 'Hero',
      props: { 
        title: '[YOUR PROPERTY NAME]', 
        subtitle: '[Add a subtitle]', 
        description: '[Add a description]', 
        backgroundImage: '' 
      }
    }
  ];

  // Basic template
  basicTemplate: EditorSection[] = [
    {
      type: 'Hero',
      props: { title: 'Your Property', subtitle: 'Short description', description: '', backgroundImage: '' }
    },
    {
      type: 'Text',
      props: { title: 'About', content: 'Your content here...' }
    },
    {
      type: 'Contact',
      props: { title: 'Contact Us', subtitle: '', email: 'you@example.com', phone: '+34 000 000 000', address: '' }
    }
  ];

  // Luxury template
  luxuryTemplate: EditorSection[] = [
    {
      type: 'Hero',
      props: {
        title: 'Luxury Villa',
        subtitle: 'Premium Holiday Rental',
        description: 'Experience the ultimate luxury getaway',
        backgroundImage: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1200'
      }
    },
    {
      type: 'Text',
      props: {
        title: 'About This Property',
        content: 'This beautiful villa offers the perfect blend of luxury and comfort.'
      }
    },
    {
      type: 'Features',
      props: {
        title: 'Property Features',
        features: [
          {icon: '🏊', title: 'Private Pool', description: 'Heated infinity pool'},
          {icon: '📶', title: 'Fast WiFi', description: 'Fiber optic internet'},
          {icon: '🚗', title: 'Parking', description: 'Private garage'}
        ]
      }
    },
    {
      type: 'Gallery',
      props: {
        title: 'Photo Gallery',
        images: [
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
          'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800'
        ]
      }
    },
    {
      type: 'Contact',
      props: {
        title: 'Get in Touch',
        subtitle: 'We\'d love to hear from you',
        email: 'booking@property.com',
        phone: '+34 612 345 678',
        address: 'Your Address Here'
      }
    },
    {
      type: 'CTA',
      props: {
        title: 'Ready to Book?',
        description: 'Book now for an unforgettable experience',
        buttonText: 'Reserve Now',
        buttonLink: '#book'
      }
    }
  ];

  async ngOnInit() {
    await this.loadContent();
    // Expand all sections by default
    const allIndices = Array.from({length: 10}, (_, i) => i);
    this.expandedSections.set(new Set(allIndices));
  }

  ngOnDestroy() {
    if (this.editor) {
      this.editor.dispose();
    }
  }

  async loadContent() {
    try {
      console.log('[MDX Editor] Loading for property:', this.propertyName());
      
      // 1. Get full property data from database
      this.propertyData = await this.repository.getPropertyByName(this.propertyName());
      console.log('[MDX Editor] Property data:', this.propertyData);
      
      // 2. Extract photos for image picker
      this.propertyPhotos = this.propertyData?.property_photos || [];
      console.log('[MDX Editor] Property photos:', this.propertyPhotos.length);
      
      // 3. Extract equipments for feature picker
      this.propertyEquipments = this.propertyData?.property_equipments || [];
      console.log('[MDX Editor] Property equipments:', this.propertyEquipments.length);
      
      // 4. Check if MDX content exists
      if (this.propertyData && this.propertyData.mdx_content && this.propertyData.mdx_content.trim()) {
        console.log('[MDX Editor] Loading existing MDX content');
        const parsed = this.parser.parse(this.propertyData.mdx_content);
        if (parsed && parsed.length > 0) {
          this.sections.set(parsed as EditorSection[]);
          console.log('[MDX Editor] Loaded', parsed.length, 'sections from database');
        } else {
          console.log('[MDX Editor] Invalid MDX, using property data');
          this.createFromPropertyData();
        }
      } else {
        console.log('[MDX Editor] No MDX content, creating from property data');
        this.createFromPropertyData();
      }

      // Load Monaco after content
      await this.loadMonaco();
      setTimeout(() => this.initCodeEditor(), 500);
    } catch (e) {
      console.error('[MDX Editor] Error loading content:', e);
      this.createFromPropertyData();
    }
  }

  createFromPropertyData() {
    // Create editor content from real property data
    const propName = this.propertyData?.name || this.propertyName() || 'Your Property';
    const address = this.propertyData?.address || '[Your Address]';
    const description = this.propertyData?.listing_description || this.propertyData?.description || '[Add description]';
    const coverImage = this.propertyData?.cover_image_url || '';
    
    // Get photos if available
    const photos = this.propertyData?.property_photos || [];
    const imageUrls = photos.slice(0, 6).map((p: any) => p.url);
    
    // Get equipments if available
    const equipments = this.propertyData?.property_equipments || [];
    const features = equipments.slice(0, 6).map((e: any) => ({
      icon: '✓',
      title: e.name,
      description: e.manual_url || ''
    }));
    
    const sections: EditorSection[] = [
      {
        type: 'Hero',
        props: {
          title: propName,
          subtitle: 'Holiday Rental',
          description: description,
          backgroundImage: coverImage || ''
        }
      },
      {
        type: 'Text',
        props: {
          title: 'About ' + propName,
          content: description
        }
      }
    ];
    
    // Add features if available
    if (features.length > 0) {
      sections.push({
        type: 'Features',
        props: {
          title: 'Features',
          features: features
        }
      });
    }
    
    // Add gallery if photos available
    if (imageUrls.length > 0) {
      sections.push({
        type: 'Gallery',
        props: {
          title: 'Photo Gallery',
          images: imageUrls
        }
      });
    }
    
    // Add contact section
    sections.push({
      type: 'Contact',
      props: {
        title: 'Contact',
        subtitle: 'Book your stay',
        email: 'your@email.com',
        phone: '+34 000 000 000',
        address: address
      }
    });
    
    this.sections.set(sections);
    console.log('[MDX Editor] Created', sections.length, 'sections from property data');
  }

  setView(mode: 'preview' | 'code') {
    this.viewMode.set(mode);
    if (mode === 'code' && this.monacoLoaded() && !this.editor) {
      setTimeout(() => this.initCodeEditor(), 100);
    }
  }

  toggleExpanded(index: number) {
    const expanded = this.expandedSections();
    if (expanded.has(index)) {
      expanded.delete(index);
    } else {
      expanded.add(index);
    }
    this.expandedSections.set(new Set(expanded));
  }

  isExpanded(index: number): boolean {
    return this.expandedSections().has(index);
  }

  moveSection(index: number, direction: number) {
    const sections = this.sections();
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= sections.length) return;
    
    // Swap sections
    [sections[index], sections[newIndex]] = [sections[newIndex], sections[index]];
    this.sections.set([...sections]);
    
    // Update expanded state
    const expanded = this.expandedSections();
    if (expanded.has(index) && expanded.has(newIndex)) {
      // Both expanded, no change needed
    } else if (expanded.has(index)) {
      expanded.delete(index);
      expanded.add(newIndex);
    } else if (expanded.has(newIndex)) {
      expanded.delete(newIndex);
      expanded.add(index);
    }
    this.expandedSections.set(new Set(expanded));
    
    // Update code editor
    setTimeout(() => {
      if (this.editor) {
        this.editor.setValue(this.generateMdx());
      }
    }, 100);
  }

  toggleSectionVisibility(index: number) {
    const sections = this.sections();
    sections[index].hidden = !sections[index].hidden;
    this.sections.set([...sections]);
    setTimeout(() => {
      if (this.editor) {
        this.editor.setValue(this.generateMdx());
      }
    }, 100);
  }

  removeSection(index: number) {
    const sections = this.sections();
    sections.splice(index, 1);
    this.sections.set([...sections]);
    if (this.editor) {
      this.editor.setValue(this.generateMdx());
    }
  }

  loadTemplate(type: string) {
    if (type === 'basic') {
      this.sections.set([...this.basicTemplate]);
    } else {
      this.sections.set([...this.luxuryTemplate]);
    }
    setTimeout(() => {
      if (this.editor) {
        this.editor.setValue(this.generateMdx());
      }
    }, 100);
  }

  reloadFromProperty() {
    console.log('[MDX Editor] Reloading from property data');
    this.propertyPhotos = this.propertyData?.property_photos || [];
    this.propertyEquipments = this.propertyData?.property_equipments || [];
    this.createFromPropertyData();
    setTimeout(() => {
      if (this.editor) {
        this.editor.setValue(this.generateMdx());
      }
    }, 100);
  }

  toggleFeatureFromEquipment(section: any, equipmentName: string) {
    const features = section.props.features || [];
    const idx = features.findIndex((f: any) => f.title === equipmentName);
    if (idx === -1) {
      // Add equipment as feature
      const equip = this.propertyEquipments.find(e => e.name === equipmentName);
      features.push({
        icon: '✓',
        title: equipmentName,
        description: equip?.manual_url || ''
      });
    } else {
      // Remove feature
      features.splice(idx, 1);
    }
    section.props.features = [...features];
  }

  isFeatureSelected(section: any, equipmentName: string): boolean {
    return section.props.features?.some((f: any) => f.title === equipmentName) || false;
  }

  addFeature(section: any) {
    section.props.features.push({icon: '✓', title: 'New Feature', description: 'Description'});
  }

  removeFeature(section: any, index: number) {
    section.props.features.splice(index, 1);
  }

  toggleGalleryImage(section: any, photoUrl: string) {
    const images = section.props.images || [];
    const idx = images.indexOf(photoUrl);
    if (idx === -1) {
      // Add photo to gallery
      images.push(photoUrl);
    } else {
      // Remove photo from gallery
      images.splice(idx, 1);
    }
    section.props.images = [...images];
  }

  removeGalleryImage(section: any, index: number) {
    section.props.images.splice(index, 1);
    section.props.images = [...section.props.images];
  }

  addImage(section: any) {
    section.props.images.push('');
  }

  removeImage(section: any, index: number) {
    section.props.images.splice(index, 1);
  }

  addTestimonial(section: any) {
    section.props.testimonials.push({text: '', name: '', location: ''});
  }

  removeTestimonial(section: any, index: number) {
    section.props.testimonials.splice(index, 1);
  }

  generateMdx(): string {
    let mdx = '';
    for (const section of this.sections()) {
      const props = section.props;
      mdx += `<${section.type}\n`;
      for (const [key, value] of Object.entries(props)) {
        if (Array.isArray(value)) {
          mdx += `  ${key}={[\n`;
          for (const item of value) {
            if (typeof item === 'string') {
              mdx += `    "${item}",\n`;
            } else {
              const objStr = Object.entries(item).map(([k, v]) => `${k}: "${v}"`).join(', ');
              mdx += `    {${objStr}},\n`;
            }
          }
          mdx += `  ]}\n`;
        } else if (value) {
          mdx += `  ${key}="${value}"\n`;
        }
      }
      mdx += '/>\n\n';
    }
    return mdx.trim();
  }

  async loadMonaco(): Promise<void> {
    if (this.monacoLoaded()) return;
    return new Promise((resolve) => {
      if ((window as any).monaco) {
        this.monaco = (window as any).monaco;
        this.monacoLoaded.set(true);
        resolve();
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs/loader.min.js';
      script.onload = () => {
        const req = (window as any).require;
        req.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' } });
        req(['vs/editor/editor.main'], () => {
          this.monaco = (window as any).monaco;
          this.monacoLoaded.set(true);
          resolve();
        });
      };
      document.body.appendChild(script);
    });
  }

  initCodeEditor() {
    if (!this.codeContainer || !this.monaco) {
      console.log('Code editor init skipped - container or monaco not ready');
      return;
    }
    try {
      this.editor = this.monaco.editor.create(this.codeContainer.nativeElement, {
        value: this.generateMdx(),
        language: 'markdown',
        theme: 'vs-dark',
        minimap: { enabled: false },
        fontSize: 14,
        lineNumbers: 'on',
        wordWrap: 'on',
        automaticLayout: true,
        readOnly: true,
        padding: { top: 16 }
      });
      console.log('Code editor initialized');
    } catch (e) {
      console.error('Failed to init code editor:', e);
    }
  }

  async save() {
    this.saving.set(true);
    try {
      const mdx = this.generateMdx();
      await this.repository.saveMdxContent(this.propertyName(), mdx);
      alert('✓ Saved successfully!');
    } catch (e) {
      console.error('Save error:', e);
      alert('✕ Failed to save');
    } finally {
      this.saving.set(false);
    }
  }
}
