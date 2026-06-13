import { Component, input, output, inject, ElementRef, viewChild, AfterViewInit, OnDestroy, ChangeDetectionStrategy, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PavingStoreService } from '../services/paving-store.service';
import { HostRepository } from '../../../../services/host-repository.service';
import createStudioEditor from '@grapesjs/studio-sdk';

@Component({
  selector: 'app-craftjs-editor',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full flex flex-col bg-slate-900">
      <div class="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-slate-800/50" style="flex-shrink:0;">
        <div class="flex items-center gap-2">
          <span class="text-lg">⚡</span>
          <span class="text-sm font-bold text-white">Listing Editor</span>
          <span class="px-1.5 py-0.5 bg-[#D4AF37]/20 text-[#D4AF37] text-[9px] font-bold rounded">PREMIUM</span>
        </div>
        <div class="flex items-center gap-2">
          <button (click)="openTemplates()" class="px-3 py-1.5 text-xs font-bold bg-[#D4AF37]/20 text-[#D4AF37] hover:bg-[#D4AF37]/30 border border-[#D4AF37]/30 rounded-lg transition">Choose Template</button>
          <button (click)="saveAsTemplate()" class="px-3 py-1.5 text-xs font-bold bg-emerald-700/30 text-emerald-400 hover:bg-emerald-700/50 border border-emerald-700/30 rounded-lg transition">Save as Template</button>
          <button (click)="openManageTemplates()" class="px-3 py-1.5 text-xs font-bold bg-amber-700/30 text-amber-400 hover:bg-amber-700/50 border border-amber-700/30 rounded-lg transition">Manage Templates</button>
          <button (click)="save()" class="px-3 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition">Save</button>
          <button (click)="close.emit()" class="px-3 py-1.5 text-xs text-slate-400 hover:text-white transition">Close</button>
        </div>
      </div>
      <div #editorContainer class="flex-1" style="min-height:0;position:relative;"></div>
    </div>

    @if (showSaveDialog()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60" (click)="showSaveDialog.set(false)">
        <div class="bg-slate-800 rounded-xl p-6 w-96 shadow-2xl border border-white/10" (click)="$event.stopPropagation()">
          <h3 class="text-white font-semibold text-base mb-1">Save as Template</h3>
          <p class="text-slate-400 text-xs mb-4">Save the current design as a reusable template.</p>
          <input
            [value]="templateName()"
            (input)="templateName.set($any($event.target).value)"
            (keydown.enter)="confirmSaveTemplate(templateName())"
            class="w-full px-3 py-2 bg-slate-700 border border-white/10 rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 mb-4"
            placeholder="Template name..."
            autocomplete="off"
          />
          <div class="flex justify-end gap-2">
            <button (click)="showSaveDialog.set(false)" class="px-3 py-1.5 text-xs text-slate-400 hover:text-white transition">Cancel</button>
            <button (click)="confirmSaveTemplate(templateName())" class="px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition">Save Template</button>
          </div>
        </div>
      </div>
    }

    @if (showManageDialog()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/60" (click)="showManageDialog.set(false)">
        <div class="bg-slate-800 rounded-xl p-6 w-[420px] shadow-2xl border border-white/10 max-h-[80vh] overflow-y-auto" (click)="$event.stopPropagation()">
          <h3 class="text-white font-semibold text-base mb-1">Manage Templates</h3>
          <p class="text-slate-400 text-xs mb-4">View and delete your saved templates.</p>
          @if (store.templates().length === 0) {
            <p class="text-slate-500 text-sm py-8 text-center">No saved templates yet.</p>
          }
          @for (t of store.templates(); track t.id) {
            <div class="flex items-center justify-between py-2 px-3 bg-slate-700/50 rounded-lg mb-2">
              <span class="text-white text-sm truncate flex-1">{{ t.name }}</span>
              <button (click)="deleteTemplate(t.id)" class="px-2 py-1 text-xs text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded transition">Delete</button>
            </div>
          }
          <div class="flex justify-end mt-4">
            <button (click)="showManageDialog.set(false)" class="px-3 py-1.5 text-xs text-slate-400 hover:text-white transition">Close</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    :host { display: block; height: calc(100vh - 220px); min-height: 550px; }
    :host ::ng-deep .gjs-editor { background: #e8e2da; }
    :host ::ng-deep .gjs-cv-canvas { background: #e8e2da; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CraftjsEditorComponent implements AfterViewInit, OnDestroy {
  propertyName = input.required<string>();
  galleryMode = signal<string>('lookbook');
  hasPhotos = signal<boolean>(false);
  close = output<void>();

  editorContainer = viewChild<ElementRef>('editorContainer');

  store = inject(PavingStoreService);
  private repository = inject(HostRepository);
  private cdr = inject(ChangeDetectorRef);

  private editor: any = null;
  private isPreviewActive = false;
  showSaveDialog = signal(false);
  showManageDialog = signal(false);
  templateName = signal('');

  async openManageTemplates(): Promise<void> {
    await this.store.loadTemplates();
    this.showManageDialog.set(true);
  }

  async deleteTemplate(templateId: string): Promise<void> {
    await this.store.deleteTemplate(templateId);
  }

  async saveAsTemplate(): Promise<void> {
    if (this.editor) {
      await this.store.loadTemplates();
      this.templateName.set('');
      this.showSaveDialog.set(true);
    }
  }

  async confirmSaveTemplate(name: string): Promise<void> {
    const trimmed = (name || '').trim();
    if (!trimmed || !this.editor) {
      console.warn('[Template] No name provided or editor not ready');
      return;
    }
    try {
      const html = this.editor.getHtml();
      const css = this.editor.getCss();
      const components = this.editor.getComponents ? JSON.stringify(this.editor.getComponents()) : undefined;
      const result = await this.store.saveTemplate(trimmed, html, css, components);
      if (result) {
        this.showSaveDialog.set(false);
        this.templateName.set('');
        // Force reload templates
        await this.store.loadTemplates();
      }
    } catch (err) {
      console.error('[Template] Save failed:', err);
    }
  }

  async ngAfterViewInit() {
    const el = this.editorContainer()?.nativeElement;
    if (!el) return;

    await this.ensurePropertyLoaded();

    const photos = this.store.photos() || [];
    this.hasPhotos.set(photos.length > 0);
    const storedMode = this.store.pageConfig()?.settings?.galleryMode;
    if (storedMode) this.galleryMode.set(storedMode);
    else this.galleryMode.set('lookbook');
    const propData = this.store.propertyData();
    const fullProp = await this.repository.getPropertyByName(this.propertyName());

    const title = propData?.listing_title || propData?.name || 'The Luxury Estate';
    const location = propData?.address || 'Location, Country';
    const description = propData?.listing_description || 'This prestigious property blends refined luxury with serene surroundings...';
    const coverImage = propData?.cover_image_url || (photos.length > 0 ? photos[0].url : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80');
    const guests = propData?.max_guests || 12;
    const bedrooms = propData?.bedrooms || 6;
    const bathrooms = propData?.bathrooms || 6;
    const sqm = propData?.surface_area || 0;
    const propertyType = propData?.property_type || 'Villa';

    const equipments = fullProp?.property_equipments || [];
    const hasPool = equipments.some((eq: any) => eq.name.toLowerCase().includes('pool') || eq.name.toLowerCase().includes('piscine'));
    const hasSpa = equipments.some((eq: any) => eq.name.toLowerCase().includes('spa') || eq.name.toLowerCase().includes('sauna') || eq.name.toLowerCase().includes('hammam') || eq.name.toLowerCase().includes('jacuzzi'));

    const poolStatus = hasPool ? 'Heated' : 'No';
    const spaStatus = hasSpa ? 'Yes' : 'No';

    // Amenities HTML
    const getAmenityIcon = (name: string): string => {
      const n = name.toLowerCase();
      if (n.includes('pool-table') || n.includes('billard')) return 'pool-table';
      if (n.includes('pool') || n.includes('piscine')) return 'pool';
      if (n.includes('jacuzzi') || n.includes('bain') || n.includes('hot tub') || n.includes('hottub')) return 'jacuzzi';
      if (n.includes('spa') || n.includes('sauna') || n.includes('hammam')) return 'spa';
      if (n.includes('gym') || n.includes('fitness') || n.includes('sport') || n.includes('salle de sport')) return 'gym';
      if (n.includes('cinema') || n.includes('film') || n.includes('projection')) return 'cinema';
      if (n.includes('tv') || n.includes('télévision') || n.includes('television')) return 'tv';
      if (n.includes('audio') || n.includes('son') || n.includes('speaker') || n.includes('enceinte')) return 'audio';
      if (n.includes('bar') || n.includes('cigar') || n.includes('wine') || n.includes('cave')) return 'wine';
      if (n.includes('golf') || n.includes('green')) return 'golf';
      if (n.includes('tennis') || n.includes('padel') || n.includes('paddle')) return 'tennis';
      if (n.includes('bbq') || n.includes('barbecue') || n.includes('grill') || n.includes('cuisine extérieure') || n.includes('outdoor kitchen')) return 'bbq';
      if (n.includes('workspace') || n.includes('bureau') || n.includes('travail') || n.includes('desk')) return 'workspace';
      if (n.includes('lake') || n.includes('lac') || n.includes('bord de l\'eau') || n.includes('waterfront') || n.includes('rivière') || n.includes('river')) return 'lake';
      if (n.includes('mountain') || n.includes('montagne') || n.includes('ski')) return 'mountain';
      if (n.includes('concierge') || n.includes('service') || n.includes('personnel') || n.includes('staff')) return 'concierge';
      if (n.includes('wardrobe') || n.includes('dressing')) return 'wardrobe';
      if (n.includes('baby') || n.includes('bébé') || n.includes('crib')) return 'baby';
      if (n.includes('helipad') || n.includes('hélisurface')) return 'helipad';
      if (n.includes('wifi') || n.includes('wi-fi') || n.includes('internet')) return 'wifi';
      if (n.includes('garden') || n.includes('jardin') || n.includes('park')) return 'garden';
      if (n.includes('terrace') || n.includes('terrasse') || n.includes('balcon')) return 'terrace';
      if (n.includes('coffee') || n.includes('café') || n.includes('breakfast') || n.includes('petit déjeuner')) return 'coffee';
      if (n.includes('bed') || n.includes('lit') || n.includes('chambre')) return 'bed';
      if (n.includes('bath') || n.includes('baignoire') || n.includes('salle de bain')) return 'bath';
      if (n.includes('laundry') || n.includes('lave-linge')) return 'laundry';
      if (n.includes('dishwasher') || n.includes('lave-vaisselle')) return 'dishwasher';
      if (n.includes('kitchen') || n.includes('cuisine') || n.includes('chef')) return 'kitchen';
      if (n.includes('air conditioning') || n.includes('clim')) return 'ac';
      if (n.includes('parking') || n.includes('garage')) return 'parking';
      if (n.includes('fireplace') || n.includes('cheminée')) return 'fireplace';
      if (n.includes('beach') || n.includes('plage') || n.includes('sea') || n.includes('mer')) return 'beach';
      if (n.includes('pet') || n.includes('animal')) return 'pets';
      if (n.includes('security') || n.includes('sécurité') || n.includes('safe')) return 'security';
      if (n.includes('ev') || n.includes('recharge') || n.includes('borne') || n.includes('électrique')) return 'ev-charger';
      if (n.includes('elevator') || n.includes('ascenseur')) return 'elevator';
      if (n.includes('view') || n.includes('vue')) return 'view';
      return 'default';
    };

    const iconSvgMap: Record<string, string> = {
      pool: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 20c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M2 16c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M12 2v10"/><path d="M8 6h8"/></svg>',
      spa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 12c0-2 2-4 4-4s4 2 4 4"/><path d="M12 12c0-2 2-4 4-4s4 2 4 4"/><path d="M4 20c0-2 2-4 4-4"/><path d="M16 16c2 0 4 2 4 4"/></svg>',
      cinema: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M9 8v8l6-4z"/></svg>',
      wine: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2v12"/><path d="M8 14h8v8H8z"/><path d="M6 10c0-3 2-5 6-5s6 2 6 5"/></svg>',
      gym: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 6l4 4"/><path d="M14 14l4 4"/><path d="M2 12h20"/><path d="M12 2v20"/></svg>',
      ac: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2v20"/><path d="M4 12h16"/><path d="M7 7l5 5 5-5"/><path d="M7 17l5-5 5 5"/></svg>',
      jacuzzi: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 12c0-2 2-4 4-4s4 2 4 4"/><path d="M12 12c0-2 2-4 4-4s4 2 4 4"/><path d="M4 20c0-2 2-4 4-4"/><path d="M16 16c2 0 4 2 4 4"/></svg>',
      view: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 12s4-8 10-8 10 8 10 8-4 8-10 8-10-8-10-8z"/><circle cx="12" cy="12" r="3"/></svg>',
      kitchen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 9v12h18V9"/><path d="M3 9l9-7 9 7"/><path d="M9 21V12h6v9"/></svg>',
      wifi: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 8.5C5 5 9 3 12 3s7 2 10 5.5"/><path d="M5 12c2-2 4.5-3 7-3s5 1 7 3"/><path d="M8.5 15.5c1-1 2.5-1.5 3.5-1.5s2.5.5 3.5 1.5"/><circle cx="12" cy="19" r="1"/></svg>',
      garden: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2C8 6 6 10 6 14a6 6 0 0 0 12 0c0-4-2-8-6-12z"/><path d="M12 22V14"/></svg>',
      parking: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 17V7h4a3 3 0 0 1 0 6H9"/></svg>',
      terrace: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="8" width="18" height="13" rx="1"/><path d="M3 12h18"/><path d="M7 8V3"/><path d="M17 8V3"/></svg>',
      beach: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 18h20"/><path d="M3 14c1-1 2-1 3 0s2 1 3 0 2-1 3 0 2 1 3 0 2-1 3 0 2 1 3 0"/><path d="M12 2L2 18"/></svg>',
      default: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>',
    };

    const getIconSvg = (symbol: string): string => iconSvgMap[symbol] || iconSvgMap['default'];

    const luxuryPlaceholders = [
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80',
      'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=600&q=80'
    ];

    const displayPhotos = [...photos.map(p => p.url)];
    if (displayPhotos.length === 0) {
      displayPhotos.push(...luxuryPlaceholders);
    }

    const villaPhotos = displayPhotos.length >= 6 ? displayPhotos.slice(0, 6) : [...displayPhotos, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80'];
    const galleryItemsHtml = villaPhotos.map((u, i) => '<div class="gal-item' + (i === 0 ? ' featured' : '') + '"><img src="' + u + '" alt="Photo ' + (i+1) + '" loading="lazy" /></div>').join('');

    let amenitiesHtml = '';
    if (equipments.length > 0) {
      amenitiesHtml = equipments.map((eq: any) => {
        const symbol = getAmenityIcon(eq.name);
        const svgContent = getIconSvg(symbol);
        return '<div class="luxury-amenity-item"><span class="luxury-amenity-icon" data-icon-family="outline" data-icon-symbol="' + symbol + '">' + svgContent + '</span><span>' + eq.name + '</span></div>';
      }).join('\n');
    } else {
      const symbols = ['pool', 'spa', 'cinema', 'wine', 'gym', 'ac'];
      const labels = ['Heated Swimming Pool', 'Spa, Hammam & Sauna', 'Private Cinema Room', 'Cigar Room & Bar', 'Fitness Room', 'Air Conditioning'];
      amenitiesHtml = symbols.map((s, i) => '<div class="luxury-amenity-item"><span class="luxury-amenity-icon" data-icon-family="outline" data-icon-symbol="' + s + '">' + getIconSvg(s) + '</span><span>' + labels[i] + '</span></div>').join('\n');
    }

    // Price HTML
    let priceAmount = 0;
    let priceCurrency = '€';
    let pricePeriod = 'night';
    const priceSection = this.store.pageConfig().sections?.find(s => s.type === 'price');
    if (priceSection && priceSection.content) {
      const c = priceSection.content;
      priceAmount = typeof c['minPrice'] === 'number' ? c['minPrice'] : (Number(c['minPrice']) || 0);
      priceCurrency = (c['currency'] as string) || '€';
      pricePeriod = (c['period'] as string) || 'night';
    }

    let priceHtml = '';
    if (priceAmount > 0) {
      if (pricePeriod === 'night') {
        const weeklyPrice = priceAmount * 7;
        priceHtml = '<div class="luxury-price-label">Weekly Price From</div><div class="luxury-price">' + priceCurrency + weeklyPrice.toLocaleString() + ' <span style="font-size:0.9rem; font-weight:400; color:#757575;">/ week</span></div><div style="font-size: 0.8rem; color: #757575; margin-top: -16px; margin-bottom: 24px; text-align: center;">(' + priceCurrency + priceAmount.toLocaleString() + ' / night)</div>';
      } else {
        priceHtml = '<div class="luxury-price-label">' + (pricePeriod === 'week' ? 'Weekly' : 'Stay') + ' Price From</div><div class="luxury-price">' + priceCurrency + priceAmount.toLocaleString() + ' <span style="font-size:0.9rem; font-weight:400; color:#757575;">/ ' + pricePeriod + '</span></div>';
      }
    } else {
      priceHtml = '<div class="luxury-price-label">Weekly Price From</div><div class="luxury-price">€62,515 <span style="font-size:0.9rem; font-weight:400; color:#757575;">/ week</span></div>';
    }

    const galleryHtml = this.generateGalleryHtml(this.galleryMode(), displayPhotos);

    // Features for Iconic template
    const defaultFeatures = [
      'Heated Swimming Pool', 'Spa, Hammam & Sauna', 'Private Cinema Room',
      'Cigar Room & Bar', 'Fitness Room', 'Air Conditioning'
    ];
    const featureNames = equipments.length > 0 ? equipments.map((e: any) => e.name) : defaultFeatures;
    const featureHtml = featureNames.slice(0, 6).map((f: string) => {
      const symbol = getAmenityIcon(f);
      return '<div class="lc-feature"><span class="lc-feature-icon">' + getIconSvg(symbol) + '</span>' + f + '</div>';
    }).join('');

    const roomsData = Array.from({length: Math.min(Number(bedrooms) || 6, 9)}, (_, i) => ({
      name: 'Bedroom ' + (i + 1),
      bed: '1 Double bed (180×200 cm)',
      features: ['Air conditioning', 'Flat screen TV', 'Safe', 'Desk']
    }));
    const roomsHtml = roomsData.map(r =>
      '<div class="lc-room"><div class="lc-room-name">' + r.name + '</div><div class="lc-room-bed">' + r.bed + '</div><div class="lc-room-details">' + r.features.map(t => '<span class="lc-room-tag">' + t + '</span>').join('') + '</div></div>'
    ).join('');

    // Initialize GrapesJS Studio SDK
    try {
      this.editor = await createStudioEditor({
        licenseKey: '',
        root: el,
        theme: 'dark',
        assets: {
          onUpload: async () => {
            throw new Error('Upload is disabled. Please use the property photo library.');
          },
          // Project assets (saved with the project)
          onLoad: async () => {
            return [];
          },
          // Custom providers — these show up in the asset picker filter
          providers: [
            {
              id: 'property-photos',
              types: 'image',
              label: 'Property Photos',
              onLoad: async () => {
                // Force load photos if not yet loaded
                if (!this.store.propertyId()) {
                  try {
                    const prop = await this.repository.getPropertyByName(this.propertyName());
                    if (prop?.id) {
                      await this.store.loadProperty(prop.id);
                    }
                  } catch (e) {
                    console.warn('[Assets] Failed to load property:', e);
                  }
                }
                let photosList = this.store.photos() || [];
                if (photosList.length === 0) {
                  await new Promise(r => setTimeout(r, 500));
                  photosList = this.store.photos() || [];
                }
                const photoAssets = photosList.map(p => ({
                  src: p.url,
                  name: p.category || 'Property Photo',
                }));
                // Always provide a fallback so the picker is never empty
                if (photoAssets.length === 0) {
                  return [{
                    src: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
                    name: 'Property Photo',
                  }];
                }
                return photoAssets;
              }
            }
          ]
        },
        templates: {
          onLoad: async ({ editor, fetchCommunityTemplates }) => {
            const list = await fetchCommunityTemplates() || [];
            await this.store.loadTemplates();
            const savedTemplates = this.store.templates();
            const savedTemplateEntries = savedTemplates.map(t => ({
              id: t.id,
              name: t.name,
              media: t.media || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=600&q=80',
              data: {
                pages: [{ name: 'Home', component: t.html + '<style>' + t.css + '</style>' }]
              }
            }));
            const myTemplatesHeader = savedTemplates.length > 0 ? [{
              id: '---my-templates-header---',
              name: '— My Saved Templates —',
              media: '',
              data: { pages: [] }
            }] : [];
            return [
              {
                id: 'le-collectionist',
                name: 'Le Collectionist Luxury Style',
                media: 'https://cdn.lecollectionist.com/__lecollectionist__/production/houses/8076/photos/IgJA7syOTbGe4kyvXl9b_72f6f733-d7a7-4ada-d93a-804ae9fd4375.jpg?q=50&width=600',
                data: {
                  pages: [{
                    name: 'Home',
                    component: `<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Sora:wght@100..800&display=swap" rel="stylesheet">
<style>
.luxury-template { font-family: 'Sora', sans-serif; color: #202020; background-color: #ffffff; line-height: 1.6; }
.luxury-serif { font-family: 'Playfair Display', serif; }
.luxury-hero { position: relative; height: 75vh; background-image: url('${coverImage}'); background-size: cover; background-position: center; display: flex; align-items: flex-end; padding: 60px 4%; }
.luxury-hero::before { content: ''; position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.6)); }
.luxury-hero-content { position: relative; z-index: 10; color: #ffffff; }
.luxury-hero-title { font-size: 3.5rem; font-weight: 400; margin: 0 0 10px; letter-spacing: -0.02em; }
.luxury-hero-subtitle { font-size: 1.1rem; text-transform: uppercase; letter-spacing: 0.15em; opacity: 0.9; }
.luxury-bar { border-bottom: 1px solid #eaeaea; padding: 24px 4%; display: flex; gap: 40px; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 0.08em; color: #757575; background: #fafafa; }
.luxury-bar span strong { color: #202020; }
.luxury-container { max-width: 1200px; margin: 60px auto; padding: 0 4%; display: grid; grid-template-columns: 1.6fr 1fr; gap: 60px; }
@media(max-width: 992px) { .luxury-container { grid-template-columns: 1fr; gap: 40px; } }
.luxury-story-title { font-size: 2rem; font-weight: 400; margin: 0 0 24px; line-height: 1.3; }
.luxury-story-text { font-size: 1.05rem; color: #4c4c4c; margin-bottom: 30px; line-height: 1.7; }
.luxury-booking-card { border: 1px solid #eaeaea; border-radius: 4px; padding: 32px; position: sticky; top: 100px; box-shadow: 0 10px 30px rgba(0,0,0,0.03); background: #ffffff; }
.luxury-price-label { font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.1em; color: #757575; }
.luxury-price { font-size: 1.8rem; font-weight: 500; color: #202020; margin: 4px 0 24px; }
.luxury-btn { width: 100%; padding: 16px; background-color: #202020; color: #ffffff; border: none; border-radius: 2px; font-size: 0.9rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; cursor: pointer; transition: background-color 0.2s; }
.luxury-btn:hover { background-color: #000000; }
.luxury-amenities-section { border-top: 1px solid #eaeaea; padding-top: 40px; margin-top: 40px; }
.luxury-section-title { font-size: 1.4rem; font-weight: 400; margin-bottom: 24px; text-transform: uppercase; letter-spacing: 0.08em; }
.luxury-amenities-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px 40px; }
.luxury-amenity-item { display: flex; align-items: center; gap: 12px; font-size: 0.95rem; color: #4c4c4c; }
.luxury-amenity-icon { display: flex; align-items: center; justify-content: center; width: 24px; height: 24px; }
.luxury-gallery { max-width: 1200px; margin: 80px auto; padding: 0 4%; }
</style>
<div class="luxury-template">
  <div class="luxury-hero">
    <div class="luxury-hero-content">
      <span class="luxury-hero-subtitle">Exclusive Rental</span>
      <h1 class="luxury-hero-title luxury-serif">${title}</h1>
      <span class="luxury-hero-subtitle">${location}</span>
    </div>
  </div>
  <div class="luxury-bar">
    <span>Guests <strong>${guests}</strong></span>
    <span>Bedrooms <strong>${bedrooms}</strong></span>
    <span>Bathrooms <strong>${bathrooms}</strong></span>
    <span>Pool <strong>${poolStatus}</strong></span>
    <span>Spa & Hamam <strong>${spaStatus}</strong></span>
  </div>
  <div class="luxury-container">
    <div>
      <h2 class="luxury-story-title luxury-serif">A luxury retreat built with exceptional refinement.</h2>
      <div class="luxury-story-text">${description}</div>
      <div class="luxury-amenities-section">
        <h3 class="luxury-section-title luxury-serif">Premium Amenities</h3>
        <div class="luxury-amenities-grid">${amenitiesHtml}</div>
      </div>
    </div>
    <div>
      <div class="luxury-booking-card">
        ${priceHtml}
        <button class="luxury-btn">Inquire About Stay</button>
        <div style="margin-top: 20px; font-size: 0.8rem; color: #757575; text-align: center;">Concierge Services & In-House Staff Included</div>
      </div>
    </div>
  </div>
  <div class="luxury-gallery">
    <h3 class="luxury-section-title luxury-serif" style="margin-bottom:32px;">The Property Gallery</h3>
    ${galleryHtml}
  </div>
</div>`
                  }]
                }
              },
              {
                id: 'villa-serenity',
                name: 'Villa Serenity — Amalfi Luxury',
                media: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=600&q=80',
                data: {
                  pages: [{
                    name: 'Home',
                    component: `<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500&display=swap" rel="stylesheet">
<style>:root{--bg:#f7f5f0;--fg:#1e2a35;--primary:#1a6b73;--primary-fg:#fff;--muted-fg:#6b7a85;--accent:#c9975b;--border:#d9d2c7;--sans:'Inter',system-ui,sans-serif;--serif:'Playfair Display',Georgia,serif;--shadow-lg:0 10px 30px rgba(0,0,0,0.1);--shadow-xl:0 20px 50px rgba(0,0,0,0.15);--max-w:1280px}*,*::before,*::after{margin:0;padding:0;box-sizing:border-box}body{font-family:var(--sans);background:var(--bg);color:var(--fg);line-height:1.6;-webkit-font-smoothing:antialiased}h1,h2,h3{font-family:var(--serif);line-height:1.2}img{max-width:100%;display:block}button{cursor:pointer;font-family:inherit;border:none;background:none}.container{max-width:var(--max-w);margin:0 auto;padding:0 1rem}@media(min-width:768px){.container{padding:0 2rem}}@keyframes fade-up{0%{opacity:0;transform:translateY(30px)}100%{opacity:1;transform:translateY(0)}}@keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}.anim{opacity:0;animation:fade-up .7s ease-out forwards}.d1{animation-delay:.1s}.d2{animation-delay:.2s}.d3{animation-delay:.3s}.section-pad{padding:5rem 1rem}@media(min-width:768px){.section-pad{padding:7rem 1rem}}.section-tag{font-size:.75rem;text-transform:uppercase;letter-spacing:.2em;color:var(--primary);font-weight:500;margin-bottom:.75rem}.section-title{font-size:2rem;color:var(--fg)}@media(min-width:768px){.section-title{font-size:3rem}}.section-sub{color:var(--muted-fg);font-size:1rem;margin-top:1rem;max-width:36rem;margin-left:auto;margin-right:auto;line-height:1.7}.text-center{text-align:center}.bg-soft{background:#faf8f5}.navbar{position:fixed;top:0;left:0;right:0;z-index:100;padding:1.25rem 0;transition:background .4s,padding .4s}.navbar.scrolled{background:rgba(255,255,255,.95);backdrop-filter:blur(8px);box-shadow:0 1px 2px rgba(0,0,0,.05);padding:.75rem 0}.navbar .container{display:flex;align-items:center;justify-content:space-between}.brand{font-family:var(--serif);font-size:1.25rem;color:#fff;transition:color .3s}.scrolled .brand{color:var(--fg)}.nav-links{display:none;align-items:center;gap:2rem}@media(min-width:768px){.nav-links{display:flex}}.nav-link{font-size:.8125rem;text-transform:uppercase;letter-spacing:.08em;font-weight:500;color:rgba(255,255,255,.8);transition:color .3s}.nav-link:hover{color:#fff}.scrolled .nav-link{color:rgba(30,42,53,.7)}.scrolled .nav-link:hover{color:var(--fg)}.btn-cta{padding:.5rem 1.5rem;border-radius:9999px;font-size:.875rem;font-weight:500;background:#fff;color:var(--primary);transition:background .3s}.btn-cta:hover{background:rgba(255,255,255,.9)}.scrolled .btn-cta{background:var(--primary);color:var(--primary-fg)}.scrolled .btn-cta:hover{background:#155a61}.hero{position:relative;height:100vh;min-height:600px;display:flex;align-items:center;justify-content:center;overflow:hidden}.hero-bg{position:absolute;inset:0}.hero-bg img{width:100%;height:100%;object-fit:cover}.hero-overlay{position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,.5),rgba(0,0,0,.3) 50%,rgba(0,0,0,.6))}.hero-content{position:relative;z-index:10;text-align:center;padding:0 1rem;max-width:56rem}.hero-loc{color:rgba(255,255,255,.8);font-size:.8125rem;text-transform:uppercase;letter-spacing:.3em;margin-bottom:1rem;font-weight:500}.hero-title{font-size:2.5rem;color:#fff;margin-bottom:1.25rem}@media(min-width:768px){.hero-title{font-size:5rem}}@media(min-width:1024px){.hero-title{font-size:6rem}}.hero-desc{color:rgba(255,255,255,.8);font-size:1rem;max-width:36rem;margin:0 auto 2rem;line-height:1.7}.hero-actions{display:flex;flex-direction:column;gap:1rem;align-items:center;justify-content:center}@media(min-width:640px){.hero-actions{flex-direction:row}}.btn-pill{display:inline-flex;align-items:center;justify-content:center;padding:.75rem 2rem;border-radius:9999px;font-size:1rem;font-weight:500;transition:background .3s,transform .2s}.btn-pill:hover{transform:translateY(-1px)}.btn-light{background:#fff;color:var(--fg)}.btn-light:hover{background:rgba(255,255,255,.9)}.btn-outline{background:transparent;color:#fff;border:1.5px solid #fff}.btn-outline:hover{background:rgba(255,255,255,.1)}.hero-scroll{position:absolute;bottom:2rem;left:50%;transform:translateX(-50%);animation:bounce 2s infinite;width:1.5rem;height:1.5rem;color:rgba(255,255,255,.6)}.ov-grid{display:grid;gap:2.5rem;align-items:center}@media(min-width:768px){.ov-grid{grid-template-columns:1fr 1fr;gap:3.5rem}}.ov-img{width:100%;height:320px;object-fit:cover;border-radius:1rem;box-shadow:var(--shadow-lg)}@media(min-width:768px){.ov-img{height:520px}}.ov-text{display:flex;flex-direction:column;gap:1.25rem}.ov-desc{color:var(--muted-fg);line-height:1.7;font-size:1.125rem}.stats{display:grid;grid-template-columns:1fr 1fr;gap:1rem;padding-top:1rem}@media(min-width:640px){.stats{grid-template-columns:repeat(4,1fr);gap:1.5rem}}.stat{text-align:center;padding:.75rem}.stat-icon{width:1.5rem;height:1.5rem;margin:0 auto .5rem;color:var(--primary)}.stat-val{font-family:var(--serif);font-size:1.25rem;font-weight:600}@media(min-width:768px){.stat-val{font-size:1.5rem}}.stat-lbl{font-size:.75rem;color:var(--muted-fg)}@media(min-width:768px){.stat-lbl{font-size:.875rem}}.am-grid{display:grid;gap:1.25rem}@media(min-width:640px){.am-grid{grid-template-columns:1fr 1fr}}@media(min-width:1024px){.am-grid{grid-template-columns:repeat(4,1fr)}}.am-card{background:#faf8f5;border-radius:1rem;padding:1.5rem;transition:box-shadow .3s,transform .3s}.am-card:hover{box-shadow:var(--shadow-xl);transform:translateY(-4px)}.am-icon{width:3rem;height:3rem;border-radius:50%;background:rgba(26,107,115,.1);display:flex;align-items:center;justify-content:center;margin-bottom:1rem;transition:background .3s}.am-card:hover .am-icon{background:var(--primary)}.am-icon svg{width:1.25rem;height:1.25rem;color:var(--primary);transition:color .3s}.am-card:hover .am-icon svg{color:#fff}.am-title{font-family:var(--serif);font-size:1.125rem;margin-bottom:.5rem}.am-desc{color:var(--muted-fg);font-size:.875rem;line-height:1.6}.gal-grid{display:grid;gap:1rem}@media(min-width:768px){.gal-grid{grid-template-columns:repeat(3,1fr);grid-auto-rows:240px}}.gal-item{overflow:hidden;border-radius:1rem}@media(min-width:768px){.gal-item.featured{grid-column:span 2;grid-row:span 2}}.gal-item img{width:100%;height:100%;object-fit:cover;transition:transform .7s;cursor:pointer}.gal-item img:hover{transform:scale(1.05)}.test-grid{display:grid;gap:1.5rem}@media(min-width:768px){.test-grid{grid-template-columns:repeat(3,1fr);gap:2rem}}.test-card{background:#fff;border-radius:1rem;padding:1.5rem;box-shadow:0 1px 2px rgba(0,0,0,.05);border:1px solid rgba(217,210,199,.5)}.test-quote{width:2rem;height:2rem;color:rgba(26,107,115,.2);margin-bottom:1rem}.test-text{color:var(--muted-fg);line-height:1.7;margin-bottom:1.5rem;font-style:italic;font-size:.875rem}.test-name{font-weight:500;color:var(--fg);font-size:.9375rem}.test-loc{font-size:.8125rem;color:var(--muted-fg)}.booking{background:var(--primary);position:relative;overflow:hidden;padding:5rem 1rem;text-align:center}.booking-bg{position:absolute;inset:0;background:url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1920&q=80') center/cover;opacity:.05}.booking-content{max-width:56rem;margin:0 auto;position:relative;z-index:10}.booking-tag{font-size:.75rem;text-transform:uppercase;letter-spacing:.2em;color:rgba(255,255,255,.6);font-weight:500;margin-bottom:.75rem}.booking-title{font-size:2rem;color:#fff}@media(min-width:768px){.booking-title{font-size:3rem}}.booking-sub{color:rgba(255,255,255,.7);font-size:1rem;max-width:36rem;margin:.75rem auto 2.5rem;line-height:1.7}.book-form{background:#fff;border-radius:1rem;padding:1.5rem;box-shadow:var(--shadow-xl);max-width:28rem;margin:0 auto;text-align:left}.form-row{display:grid;gap:1rem}@media(min-width:640px){.form-row{grid-template-columns:1fr 1fr}}.form-g{margin-bottom:1.25rem}.form-l{display:block;font-size:.875rem;font-weight:500;color:var(--fg);margin-bottom:.5rem}.input-w{position:relative}.input-w svg{position:absolute;left:.75rem;top:50%;transform:translateY(-50%);width:1rem;height:1rem;color:var(--muted-fg);pointer-events:none}.form-i{width:100%;height:2.5rem;padding:0 .75rem 0 2.5rem;border:1px solid var(--border);border-radius:.75rem;background:var(--bg);font-size:.875rem;color:var(--fg);outline:none;transition:border-color .2s}.form-i:focus{border-color:var(--primary);box-shadow:0 0 0 2px rgba(26,107,115,.15)}.btn-sub{width:100%;padding:1rem 1.5rem;border-radius:9999px;background:var(--primary);color:var(--primary-fg);font-size:1rem;font-weight:500;margin-top:1.25rem;transition:background .3s}.btn-sub:hover{background:#155a61}.footer{background:#1a1a2e;color:rgba(255,255,255,.8);padding:4rem 1rem}.footer-grid{display:grid;gap:2.5rem}@media(min-width:640px){.footer-grid{grid-template-columns:1fr 1fr}}@media(min-width:1024px){.footer-grid{grid-template-columns:repeat(4,1fr);gap:3rem}}.footer-brand{font-family:var(--serif);font-size:1.5rem;color:#fff;margin-bottom:1rem}.footer-desc{font-size:.875rem;line-height:1.6;color:rgba(255,255,255,.6)}.footer-h{font-size:.8125rem;text-transform:uppercase;letter-spacing:.08em;color:#fff;font-weight:500;margin-bottom:1rem}.footer-contact{list-style:none;display:flex;flex-direction:column;gap:.75rem;font-size:.875rem}.footer-links{list-style:none;display:flex;flex-direction:column;gap:.5rem}.footer-links button{background:none;border:none;color:rgba(255,255,255,.8);font-size:.875rem;cursor:pointer;text-align:left;padding:0}.footer-links button:hover{color:#fff}.social{display:flex;gap:.75rem}.social a{width:2.5rem;height:2.5rem;border-radius:50%;background:rgba(255,255,255,.1);display:flex;align-items:center;justify-content:center;transition:background .3s;color:rgba(255,255,255,.8)}.social a:hover{background:var(--primary)}.footer-bottom{border-top:1px solid rgba(255,255,255,.1);margin-top:3rem;padding-top:2rem;display:flex;flex-direction:column;align-items:center;gap:1rem;font-size:.875rem;color:rgba(255,255,255,.4)}@media(min-width:640px){.footer-bottom{flex-direction:row;justify-content:space-between}}[data-toast]{position:fixed;top:5rem;right:1rem;z-index:200;width:24rem;background:var(--primary);color:#fff;padding:.875rem 1.25rem;border-radius:.75rem;box-shadow:var(--shadow-lg);font-size:.875rem;transform:translateX(120%);transition:transform .4s,opacity .4s;opacity:0}[data-toast].s{transform:translateX(0);opacity:1}</style>
<div style="font-family:var(--sans);background:var(--bg);color:var(--fg)">
<nav class="navbar" id="navbar">
<div class="container">
<span class="brand" onclick="window.scrollTo({top:0,behavior:'smooth'})">${title}</span>
<div class="nav-links">
<a class="nav-link" onclick="document.getElementById('overview').scrollIntoView({behavior:'smooth'})">The Villa</a>
<a class="nav-link" onclick="document.getElementById('amenities').scrollIntoView({behavior:'smooth'})">Amenities</a>
<a class="nav-link" onclick="document.getElementById('gallery').scrollIntoView({behavior:'smooth'})">Gallery</a>
<a class="nav-link" onclick="document.getElementById('reviews').scrollIntoView({behavior:'smooth'})">Reviews</a>
<button class="btn-cta" onclick="document.getElementById('booking').scrollIntoView({behavior:'smooth'})">Book Now</button>
</div>
</div>
</nav>
<section class="hero">
<div class="hero-bg"><img src="${coverImage}" alt="${title}" /></div>
<div class="hero-overlay"></div>
<div class="hero-content">
<p class="hero-loc anim">${location}</p>
<h1 class="hero-title anim d1">${title}</h1>
<p class="hero-desc anim d2">Experience unparalleled luxury — where timeless elegance meets breathtaking coastline.</p>
<div class="hero-actions anim d3">
<button class="btn-pill btn-light" onclick="document.getElementById('booking').scrollIntoView({behavior:'smooth'})">Book Your Stay</button>
<button class="btn-pill btn-outline" onclick="document.getElementById('overview').scrollIntoView({behavior:'smooth'})">Explore</button>
</div>
</div>
<svg class="hero-scroll" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg>
</section>
<section id="overview" class="section-pad bg-soft">
<div class="container ov-grid">
<img class="ov-img" src="https://images.unsplash.com/photo-1600607687644-aac4c3eac7f4?auto=format&fit=crop&w=1200&q=80" alt="Villa interior" />
<div class="ov-text">
<p class="section-tag">The Villa</p>
<h2 class="section-title">Where Every Moment Becomes a Memory</h2>
<p class="ov-desc">${description}</p>
<div class="stats">
<div class="stat"><svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg><div class="stat-val">${bedrooms}</div><div class="stat-lbl">Bedrooms</div></div>
<div class="stat"><svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 12h16a1 1 0 0 1 1 1v3a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-3a1 1 0 0 1 1-1z"/><path d="M6 12V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v7"/></svg><div class="stat-val">${bathrooms}</div><div class="stat-lbl">Bathrooms</div></div>
<div class="stat"><svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg><div class="stat-val">${guests}</div><div class="stat-lbl">Guests</div></div>
<div class="stat"><svg class="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg><div class="stat-val">∞</div><div class="stat-lbl">Pool</div></div>
</div>
</div>
</div>
</section>
<section id="amenities" class="section-pad">
<div class="container">
<div class="text-center">
<p class="section-tag">Amenities</p>
<h2 class="section-title">Everything You Need</h2>
<p class="section-sub">Every detail thoughtfully considered for your comfort.</p>
</div>
<div class="am-grid" style="margin-top:3.5rem">
<div class="am-card"><div class="am-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M17 3a2.85 2.85 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="M15 5l4 4"/></svg></div><h3 class="am-title">Panoramic Views</h3><p class="am-desc">Breathtaking sea views from every room</p></div>
<div class="am-card"><div class="am-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/></svg></div><h3 class="am-title">Infinity Pool</h3><p class="am-desc">Heated infinity pool overlooking the coastline</p></div>
<div class="am-card"><div class="am-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/><line x1="6" x2="18" y1="17" y2="17"/></svg></div><h3 class="am-title">Gourmet Kitchen</h3><p class="am-desc">Professional-grade appliances for culinary excellence</p></div>
<div class="am-card"><div class="am-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M6 13.87A4 4 0 0 1 7.41 6a5.11 5.11 0 0 1 1.05-1.54 5 5 0 0 1 7.08 0A5.11 5.11 0 0 1 16.59 6 4 4 0 0 1 18 13.87V21H6Z"/><path d="M22 17H2"/><path d="M22 21H2"/><path d="M6 11l4-4 4 4"/></svg></div><h3 class="am-title">Private Beach</h3><p class="am-desc">Exclusive access to a secluded Mediterranean cove</p></div>
<div class="am-card"><div class="am-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 22h8"/><path d="M7 10h10"/><path d="M12 15v7"/><path d="M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z"/></svg></div><h3 class="am-title">Wine Cellar</h3><p class="am-desc">Curated selection of fine Italian wines</p></div>
<div class="am-card"><div class="am-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 20h.01"/><path d="M6 20h.01"/><path d="M18 20h.01"/><path d="M2 7.45 12 2l10 5.45"/><path d="M12 2v3"/><path d="M4 15.5V17a8 8 0 0 0 16 0v-1.5"/></svg></div><h3 class="am-title">Spa Bathrooms</h3><p class="am-desc">Marble bathrooms with soaking tubs</p></div>
<div class="am-card"><div class="am-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg></div><h3 class="am-title">Butler Service</h3><p class="am-desc">Dedicated butler available 24/7</p></div>
<div class="am-card"><div class="am-icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="m8 3 4 8 5-5 5 15H2L8 3z"/></svg></div><h3 class="am-title">Hiking Trails</h3><p class="am-desc">Scenic coastal trails from the property</p></div>
</div>
</div>
</section>
<section id="gallery" class="section-pad bg-soft">
<div class="container">
<div class="text-center">
<p class="section-tag">Gallery</p>
<h2 class="section-title">A Glimpse Inside</h2>
<p class="section-sub">Explore the beauty through our curated collection.</p>
</div>
<div class="gal-grid" style="margin-top:3.5rem">${galleryItemsHtml}</div>
</div>
</section>
<section id="reviews" class="section-pad">
<div class="container">
<div class="text-center">
<p class="section-tag">Testimonials</p>
<h2 class="section-title">What Our Guests Say</h2>
<p class="section-sub">Hear from those who have experienced the villa firsthand.</p>
</div>
<div class="test-grid" style="margin-top:3.5rem">
<div class="test-card">
<svg class="test-quote" viewBox="0 0 24 24" fill="currentColor"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
<p class="test-text">&ldquo;An absolutely magical experience. The villa exceeded every expectation. We are already planning our return.&rdquo;</p>
<p class="test-name">Elizabeth &amp; James Mitchell</p>
<p class="test-loc">London, UK</p>
</div>
<div class="test-card">
<svg class="test-quote" viewBox="0 0 24 24" fill="currentColor"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
<p class="test-text">&ldquo;We celebrated our anniversary here — pure perfection. From the private chef dinner to sunset yoga on the terrace.&rdquo;</p>
<p class="test-name">Sophie Laurent</p>
<p class="test-loc">Paris, France</p>
</div>
<div class="test-card">
<svg class="test-quote" viewBox="0 0 24 24" fill="currentColor"><path d="M3 21c0 0-1 0-1 1v1c0 1 1 2 2 2h14c1 0 1-1 1-1v-3c-3 0-3-1-3-2V11c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>
<p class="test-text">&ldquo;The perfect family getaway. The kids loved the pool and private beach, while we enjoyed the wine cellar and spa.&rdquo;</p>
<p class="test-name">The Anderson Family</p>
<p class="test-loc">New York, USA</p>
</div>
</div>
</div>
</section>
<section id="booking" class="booking">
<div class="booking-bg"></div>
<div class="booking-content">
<p class="booking-tag">Reserve Your Stay</p>
<h2 class="booking-title">Your Dream Vacation Awaits</h2>
<p class="booking-sub">Check availability and secure your dates. Our concierge team will ensure every detail is perfect.</p>
<div class="book-form">
<div class="form-row">
<div class="form-g"><label class="form-l">Check In</label><div class="input-w"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg><input class="form-i" type="date" /></div></div>
<div class="form-g"><label class="form-l">Check Out</label><div class="input-w"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" x2="16" y1="2" y2="6"/><line x1="8" x2="8" y1="2" y2="6"/><line x1="3" x2="21" y1="10" y2="10"/></svg><input class="form-i" type="date" /></div></div>
</div>
<div class="form-g"><label class="form-l">Guests</label><div class="input-w"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg><select class="form-i" style="appearance:none;cursor:pointer"><option>2 Guests</option><option>4 Guests</option><option>6 Guests</option><option>8 Guests</option><option>10 Guests</option></select></div></div>
<button class="btn-sub" onclick="var t=this.parentElement.parentElement.parentElement;var d=document.createElement('div');d.setAttribute('data-toast','');d.className='s';d.textContent='Thank you! We will check availability and get back to you within 24 hours.';document.body.appendChild(d);setTimeout(function(){d.classList.remove('s');setTimeout(function(){d.remove()},400)},5000)">Check Availability</button>
</div>
</div>
</section>
<footer class="footer">
<div class="container">
<div class="footer-grid">
<div><h3 class="footer-brand">${title}</h3><p class="footer-desc">Your private sanctuary awaits on the Amalfi Coast.</p></div>
<div><h4 class="footer-h">Contact</h4><ul class="footer-contact"><li>📍 ${location}</li><li>📞 +39 089 123 4567</li><li>✉️ stay@villaserenity.com</li></ul></div>
<div><h4 class="footer-h">Quick Links</h4><ul class="footer-links"><li><button onclick="document.getElementById('overview').scrollIntoView({behavior:'smooth'})">The Villa</button></li><li><button onclick="document.getElementById('amenities').scrollIntoView({behavior:'smooth'})">Amenities</button></li><li><button onclick="document.getElementById('gallery').scrollIntoView({behavior:'smooth'})">Gallery</button></li><li><button onclick="document.getElementById('reviews').scrollIntoView({behavior:'smooth'})">Reviews</button></li></ul></div>
<div><h4 class="footer-h">Follow Us</h4><div class="social"><a href="#" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg></a><a href="#" aria-label="Facebook"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg></a></div></div>
</div>
<div class="footer-bottom"><p>&copy; 2026 ${title}. All rights reserved.</p></div>
</div>
</footer>
<script>window.addEventListener('scroll',function(){var n=document.getElementById('navbar');if(window.scrollY>50)n.classList.add('scrolled');else n.classList.remove('scrolled')});</script>
</div>`
                  }]
                }
              },
              ...myTemplatesHeader,
              ...savedTemplateEntries,
              ...list
            ];
          }
        },
        gjsOptions: {
          allowScripts: true,
          storageManager: false,
          assetManager: {
            upload: false,
            noAssets: 'No property images available. Please add photos to the property first.',
          },
        } as any,
        onReady: async (editorInstance) => {
          this.editor = editorInstance;
          const setEditorMode = () => {
            const frame = this.editor?.Canvas?.getFrameEl();
            if (frame) {
              if (frame.contentDocument && frame.contentDocument.body) {
                frame.contentDocument.body.setAttribute('data-editor-mode', 'true');
              }
              if (frame.contentWindow) {
                (frame.contentWindow as any).isGjsPreview = () => this.isPreviewActive;
              }
            }
          };
          setEditorMode();
          this.editor.on('canvas:frame:load', setEditorMode);
          
          const originalStates = new Map<any, any>();
          this.editor.on('run:preview', () => {
            this.isPreviewActive = true;
            this.editor.select(null);
            originalStates.clear();
            this.editor.getWrapper().find('*').forEach((cmp: any) => {
              originalStates.set(cmp, { selectable: cmp.get('selectable'), hoverable: cmp.get('hoverable'), draggable: cmp.get('draggable'), editable: cmp.get('editable') });
              cmp.set('selectable', false);
              cmp.set('hoverable', false);
              cmp.set('draggable', false);
              cmp.set('editable', false);
            });
            const frame = this.editor.Canvas.getFrameEl();
            if (frame && frame.contentDocument && frame.contentDocument.body) {
              frame.contentDocument.body.setAttribute('data-preview-mode', 'true');
            }
          });
          this.editor.on('stop:preview', () => {
            this.isPreviewActive = false;
            originalStates.forEach((state, cmp) => {
              cmp.set('selectable', state.selectable);
              cmp.set('hoverable', state.hoverable);
              cmp.set('draggable', state.draggable);
              cmp.set('editable', state.editable);
            });
            const frame = this.editor.Canvas.getFrameEl();
            if (frame && frame.contentDocument && frame.contentDocument.body) {
              frame.contentDocument.body.removeAttribute('data-preview-mode');
            }
          });
          this.editor.setDevice('desktop');

          // Populate the GrapesJS AssetManager with property photos.
          // This is what the "Select Image" dialog uses when changing an image's src.
          const populateAssetManager = () => {
            try {
              const list = this.store.photos() || [];
              const am = this.editor.AssetManager;
              if (!am) return;
              // Disable upload so only property photos are shown
              am.set('upload', false);
              const assets = list.length > 0
                ? list.map(p => ({ type: 'image', src: p.url, name: p.category || 'Property Photo' }))
                : [{ type: 'image', src: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80', name: 'Placeholder' }];
              am.getAll().reset(assets);
            } catch (e) {
              console.warn('[AssetManager] populate error:', e);
            }
          };
          populateAssetManager();
          setTimeout(populateAssetManager, 1000);

          // Re-populate the AssetManager every time it opens.
          // This ensures property photos are always present, even if the SDK or
          // another plugin cleared them.
          this.editor.on('asset:open', () => {
            const list = this.store.photos() || [];
            if (list.length > 0) {
              populateAssetManager();
            }
          });

          // When a new image is dropped, auto-assign the first property photo as src
          this.editor.on('component:create', (cmp: any) => {
            if (cmp.is('image') && !cmp.get('src')) {
              const photos = this.store.photos();
              if (photos.length > 0) {
                cmp.set('src', photos[0].url);
              }
            }
          });

          // Load saved editor state if it exists
          const savedMeta = this.store.pageConfig()?.grapesjsMeta;
          if (savedMeta && savedMeta.html) {
            try {
              this.editor.setComponents(savedMeta.html);
              if (savedMeta.css) {
                this.editor.setStyle(savedMeta.css);
              }
            } catch (e) {
              console.warn('[Studio SDK] Failed to load saved state:', e);
            }
          }
        }
      });
    } catch (err) {
      console.error('[GrapesJS Studio Editor] Init failed:', err);
      alert('Failed to initialize the editor: ' + (err instanceof Error ? err.message : err));
    }
  }

  ngOnDestroy(): void {
    try {
      if (this.editor) {
        this.editor.destroy();
      }
    } catch (e) {
      console.warn('[CraftjsEditor] Destroy error:', e);
    }
  }

  openTemplates(): void {
    if (this.editor) {
      try {
        this.editor.runCommand('studio:layoutToggle', {
          id: 'templates-dialog-panel',
          header: false,
          placer: { type: 'dialog', title: 'Choose a starting template', size: 'l' },
          layout: { type: 'panelTemplates' },
        });
      } catch (e) {
        console.error('[Studio SDK] Failed to trigger templates layout panel:', e);
      }
    }
  }

  async save(): Promise<void> {
    if (!this.editor) return;
    try {
      const html = this.editor.getHtml();
      const css = this.editor.getCss();

      const prop = await this.repository.getPropertyByName(this.propertyName());
      if (!prop?.id) {
        console.warn('[Save] Property not found, cannot save');
        return;
      }

      const updatedConfig: any = {
        ...this.store.pageConfig(),
        grapesjsMeta: { html, css },
        settings: { ...(this.store.pageConfig()?.settings || {}), galleryMode: this.galleryMode() },
      };

      this.store.pageConfig.set(updatedConfig);
      await this.store.saveConfig();
      this.close.emit();
    } catch (err) {
      console.error('[GrapesJS Studio Editor] Save failed:', err);
      alert('Failed to save listing changes: ' + (err instanceof Error ? err.message : err));
    }
  }

  onGalleryModeChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.galleryMode.set(select.value);
  }

  private async ensurePropertyLoaded(): Promise<void> {
    const prop = await this.repository.getPropertyByName(this.propertyName());
    if (prop?.id && this.store.propertyId() !== prop.id) {
      await this.store.loadProperty(prop.id);
    }
  }

  private generateGalleryHtml(mode: string, photos: string[]): string {
    return `<div class="luxury-gallery-container" data-gallery-type="${mode}">${this.generateGalleryInnerHtml(photos)}</div>`;
  }

  private generateGalleryInnerHtml(photos: string[]): string {
    const styleBlock = `
<style>
.luxury-gallery-container { width: 100%; display: flex; flex-direction: column; }
.luxury-gallery-container .gallery-lookbook, .luxury-gallery-container .gallery-filmstrip, .luxury-gallery-container .gallery-curtain, .luxury-gallery-container .gallery-scatter { display: none !important; }
.luxury-gallery-container[data-gallery-type="lookbook"] .gallery-lookbook { display: grid !important; }
.luxury-gallery-container[data-gallery-type="filmstrip"] .gallery-filmstrip { display: block !important; }
.luxury-gallery-container[data-gallery-type="curtain"] .gallery-curtain { display: block !important; }
.luxury-gallery-container[data-gallery-type="scatter"] .gallery-scatter { display: block !important; }
.gallery-lookbook { background-color: #fcfbfa; padding: 60px 5%; display: grid; grid-template-columns: repeat(12, 1fr); gap: 32px; width: 100%; box-sizing: border-box; }
.lookbook-item { position: relative; display: flex; flex-direction: column; cursor: pointer; }
.lookbook-item:nth-child(4n+1) { grid-column: 1 / span 7; }
.lookbook-item:nth-child(4n+2) { grid-column: 9 / span 4; margin-top: 80px; }
.lookbook-item:nth-child(4n+3) { grid-column: 2 / span 5; margin-top: -40px; }
.lookbook-item:nth-child(4n+0) { grid-column: 8 / span 5; margin-top: 50px; }
.lookbook-image-wrapper { overflow: hidden; position: relative; background-color: #f5f2eb; }
.lookbook-image-wrapper img { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 1.2s ease; }
.lookbook-item:hover img { transform: scale(1.05); }
.gallery-filmstrip { background-color: #0d0d0d; padding: 40px 0; width: 100%; overflow: hidden; box-sizing: border-box; }
.filmstrip-track { display: flex; gap: 40px; overflow-x: auto; padding: 20px 8%; scroll-behavior: auto; }
.filmstrip-image-wrapper { position: relative; width: 350px; aspect-ratio: 3 / 4; overflow: hidden; background-color: #1a1a1a; }
.filmstrip-image-wrapper img { width: 100%; height: 100%; object-fit: cover; display: block; }
.gallery-curtain { background-color: #0d0d0d; padding: 40px 5%; width: 100%; box-sizing: border-box; }
.curtain-container { position: relative; width: 100%; height: 60vh; overflow: hidden; background-color: #000; }
.curtain-slide { position: absolute; inset: 0; opacity: 0; pointer-events: none; transition: opacity 1s ease; }
.curtain-slide.active { opacity: 1; pointer-events: auto; }
.curtain-slide img { width: 100%; height: 100%; object-fit: cover; }
.curtain-controls { position: absolute; bottom: 20px; left: 0; right: 0; display: flex; justify-content: space-between; padding: 0 24px; }
.curtain-btn { background: rgba(255,255,255,0.1); border: none; color: #fff; padding: 8px 16px; cursor: pointer; }
.gallery-scatter { position: relative; background-color: #fcfbfa; padding: 60px 5%; min-height: 500px; width: 100%; box-sizing: border-box; }
.scatter-content-grid { display: grid; grid-template-columns: 1fr 1.5fr; gap: 40px; }
.scatter-menu { display: flex; flex-direction: column; gap: 16px; }
.scatter-menu-item { background: none; border: none; padding: 8px 0; cursor: pointer; text-align: left; transition: color 0.3s; }
.scatter-menu-item.active { color: #1a1a1a; font-weight: 600; }
.scatter-menu-item:not(.active) { color: #8c8a87; }
.scatter-preview-image { width: 100%; aspect-ratio: 16/10; object-fit: cover; }
</style>`;

    const photosJson = JSON.stringify(photos);
    const lookbookItems = photos.map((url, i) => `<div class="lookbook-item"><div class="lookbook-image-wrapper"><img src="${url}" alt="Lookbook ${i+1}" /></div></div>`).join('');
    const filmstripItems = photos.map((url, i) => `<div class="filmstrip-item"><div class="filmstrip-image-wrapper"><img src="${url}" alt="Filmstrip ${i+1}" /></div></div>`).join('');
    const curtainSlides = photos.map((url, i) => `<div class="curtain-slide ${i === 0 ? 'active' : ''}"><img src="${url}" alt="Slide ${i+1}" /></div>`).join('');
    
    const scatterMenuItems = photos.map((url, i) => `
      <div role="button" tabindex="0" class="scatter-menu-item ${i === 0 ? 'active' : ''}" style="outline:none;" onmouseenter="
        if (typeof isGjsPreview === 'function' && !isGjsPreview()) return;
        this.parentNode.querySelectorAll('.scatter-menu-item').forEach(el => el.classList.remove('active'));
        this.classList.add('active');
        const idx = Array.from(this.parentNode.querySelectorAll('.scatter-menu-item')).indexOf(this);
        const previewImg = this.closest('.gallery-scatter').querySelector('.scatter-preview-image');
        if (previewImg) {
          const photosData = this.closest('.gallery-scatter').getAttribute('data-photos');
          const images = photosData ? JSON.parse(photosData) : [];
          if (images[idx]) previewImg.src = images[idx];
        }
      ">Photo ${i+1}</div>`).join('');

    const lookbookHtml = `<div class="gallery-lookbook">${lookbookItems}</div>`;
    const filmstripHtml = `<div class="gallery-filmstrip"><div class="filmstrip-track">${filmstripItems}</div></div>`;
    const curtainHtml = `<div class="gallery-curtain"><div class="curtain-container">${curtainSlides}<div class="curtain-controls"><button class="curtain-btn" onclick="if(typeof isGjsPreview==='function' && !isGjsPreview())return;var s=this.closest('.curtain-container').querySelectorAll('.curtain-slide');var a=Array.from(s).findIndex(x=>x.classList.contains('active'));s[a].classList.remove('active');var n=(a+1)%s.length;s[n].classList.add('active');">Next</button></div></div></div>`;
    
    const scatterHtml = `<div class="gallery-scatter" data-photos='${photosJson}' onmousemove="
      if (typeof isGjsPreview === 'function' && !isGjsPreview()) return;
      const rect = this.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      if (!this.lastX) { this.lastX = x; this.lastY = y; }
      const dist = Math.hypot(x - this.lastX, y - this.lastY);
      if (dist > 70) {
        this.lastX = x;
        this.lastY = y;
        const menu = this.querySelector('.scatter-menu');
        const activeIdx = menu ? Array.from(menu.querySelectorAll('.scatter-menu-item')).findIndex(c => c.classList.contains('active')) : 0;
        const images = JSON.parse(this.getAttribute('data-photos') || '[]');
        if (images.length === 0) return;
        const url = images[activeIdx] || images[0];
        
        const canvas = this.querySelector('.scatter-bg-canvas') || this;
        const particle = document.createElement('div');
        particle.className = 'scatter-particle';
        particle.style.position = 'absolute';
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '5';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        const rot = Math.random() * 20 - 10;
        particle.style.transform = 'translate(-50%, -50%) rotate(' + rot + 'deg) scale(0.8)';
        particle.style.opacity = '1';
        particle.style.transition = 'all 1.2s ease-out';
        
        const img = document.createElement('img');
        img.src = url;
        img.style.width = '120px';
        img.style.height = '160px';
        img.style.objectFit = 'cover';
        img.style.borderRadius = '8px';
        img.style.boxShadow = '0 10px 25px rgba(0,0,0,0.15)';
        particle.appendChild(img);
        canvas.appendChild(particle);
        
        setTimeout(() => {
          particle.style.opacity = '0';
          particle.style.transform = 'translate(-50%, -50%) rotate(' + rot + 'deg) scale(0.9)';
          particle.style.top = (y - 40) + 'px';
        }, 50);
        
        setTimeout(() => particle.remove(), 1200);
      }
    "><div class="scatter-bg-canvas" style="position:absolute; inset:0; pointer-events:none; overflow:hidden;"></div><div class="scatter-content-grid" style="position:relative; z-index:10;"><div class="scatter-menu">${scatterMenuItems}</div><div class="scatter-preview"><img class="scatter-preview-image" src="${photos[0] || ''}" alt="Preview" /></div></div></div>`;

    return `${styleBlock}${lookbookHtml}${filmstripHtml}${curtainHtml}${scatterHtml}`;
  }
}
