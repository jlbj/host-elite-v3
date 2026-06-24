import { Component, input, output, inject, ElementRef, viewChild, AfterViewInit, OnDestroy, ChangeDetectionStrategy, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PavingStoreService } from '../services/paving-store.service';
import { SessionStore } from '../../../../state/session.store';
import { HostRepository } from '../../../../services/host-repository.service';
import grapesjs from 'grapesjs';
import gjsPresetWebpage from 'grapesjs-preset-webpage';
import { TemplateManagerComponent } from './template-manager.component';
import type { SavedTemplate } from '../models/paving.types';

@Component({
  selector: 'app-craftjs-editor',
  standalone: true,
  imports: [CommonModule, TemplateManagerComponent],
  template: `
    <div class="h-full flex flex-col bg-slate-900">
      <!-- Info editing template banner -->
      @if (editingTemplate(); as et) {
        <div class="px-4 py-2.5 bg-indigo-950 border-b border-indigo-500/20 text-indigo-200 text-xs flex items-center justify-between shrink-0">
          <span class="font-semibold flex items-center gap-1.5">
            <span class="text-sm">✏️</span>
            <span>Editing Template: <strong class="text-white font-bold">{{ et.name }}</strong></span>
          </span>
          <button (click)="exitTemplateEditMode()" class="px-2 py-0.5 bg-indigo-900 hover:bg-indigo-850 text-white rounded font-bold text-[10px] uppercase tracking-wider transition">Cancel Edit</button>
        </div>
      }
      <div class="flex items-center justify-between px-4 py-2 border-b border-white/10 bg-slate-800/50" style="flex-shrink:0;">
        <div class="flex items-center gap-2">
          <span class="text-lg">⚡</span>
          <span class="text-sm font-bold text-white">Listing Editor</span>
          <span class="px-1.5 py-0.5 bg-[#D4AF37]/20 text-[#D4AF37] text-[9px] font-bold rounded">PREMIUM</span>
          <span class="text-[10px] text-slate-500 hidden md:inline">💡 Double-click any image to pick from property photos</span>
        </div>
        <div class="flex items-center gap-2">
          <button (click)="openTemplates()" class="px-3 py-1.5 text-xs font-bold bg-[#D4AF37]/20 text-[#D4AF37] hover:bg-[#D4AF37]/30 border border-[#D4AF37]/30 rounded-lg transition">Choose Template</button>
          @if (isAdmin()) {
            <button (click)="saveAsTemplate()" class="px-3 py-1.5 text-xs font-bold bg-emerald-700/30 text-emerald-400 hover:bg-emerald-700/50 border border-emerald-700/30 rounded-lg transition">Save as Template</button>
          }
          <button (click)="save()" class="px-3 py-1.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition">
            {{ editingTemplate() ? 'Save Template' : 'Save' }}
          </button>
          <button (click)="preview()" class="px-3 py-1.5 text-xs font-bold bg-sky-600/30 text-sky-300 hover:bg-sky-600/50 border border-sky-500/30 rounded-lg transition">👁 Preview</button>
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

    @if (showTemplates()) {
      <app-template-manager class="fixed inset-0 z-50" (select)="applyTemplateFromManager($event)" (edit)="loadTemplateForEditing($event)" (close)="showTemplates.set(false)" />
    }
  `,
  styles: [`
    :host { display: block; height: calc(100vh - 220px); min-height: 550px; }
    :host ::ng-deep .gjs-editor { background: #1e293b; }
    :host ::ng-deep .gjs-cv-canvas { background: #f8f6f0; }
    :host ::ng-deep .gjs-pn-panel { background: #0f172a; border-color: #1e293b; }
    :host ::ng-deep .gjs-pn-btn { fill: #94a3b8; color: #94a3b8; }
    :host ::ng-deep .gjs-pn-btn:hover { fill: #e2e8f0; color: #e2e8f0; background: rgba(255,255,255,0.05); }
    :host ::ng-deep .gjs-pn-active { fill: #e2e8f0; color: #e2e8f0; background: rgba(255,255,255,0.08); }
    :host ::ng-deep .gjs-pn-views { background: #0f172a; border-left: 1px solid #1e293b; }
    :host ::ng-deep .gjs-pn-views-container { overflow: auto !important; }
    :host ::ng-deep .gjs-block { box-sizing: border-box !important; width: 80px !important; max-width: 80px !important; min-width: 80px !important; flex: 0 0 80px !important; min-height: 72px !important; padding: 6px 4px !important; }
    :host ::ng-deep .gjs-block svg, :host ::ng-deep .gjs-block-media svg { width: 22px !important; height: 22px !important; max-width: 22px !important; max-height: 22px !important; }
    :host ::ng-deep .gjs-block-label { font-size: 9px !important; line-height: 1.1 !important; padding: 2px 0 0 !important; }
    :host ::ng-deep .gjs-pn-views-container::-webkit-scrollbar { width: 6px; }
    :host ::ng-deep .gjs-pn-views-container::-webkit-scrollbar-track { background: transparent; }
    :host ::ng-deep .gjs-pn-views-container::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 3px; }
    :host ::ng-deep .gjs-pn-views-container::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.2); }

    :host ::ng-deep .gjs-pn-views .gjs-pn-btn { border-bottom: 1px solid #1e293b; }
    :host ::ng-deep .gjs-pn-views-container[data-active-view="layers"] .gjs-sm-sectors,
    :host ::ng-deep .gjs-pn-views-container[data-active-view="layers"] .gjs-blocks-cs,
    :host ::ng-deep .gjs-pn-views-container[data-active-view="layers"] .gjs-trt-traits,
    :host ::ng-deep .gjs-pn-views-container[data-active-view="layers"] .gjs-clm-tags,
    :host ::ng-deep .gjs-pn-views-container[data-active-view="layers"] .gjs-clm-sels-info,
    :host ::ng-deep .gjs-pn-views[data-active-view="layers"] .gjs-clm-tags,
    :host ::ng-deep .gjs-pn-views[data-active-view="layers"] .gjs-clm-sels-info { display: none !important; }
    :host ::ng-deep .gjs-pn-views-container[data-active-view="styles"] .gjs-layers,
    :host ::ng-deep .gjs-pn-views-container[data-active-view="styles"] .gjs-blocks-cs { display: none !important; }
    :host ::ng-deep .gjs-pn-views-container[data-active-view="blocks"] .gjs-sm-sectors,
    :host ::ng-deep .gjs-pn-views-container[data-active-view="blocks"] .gjs-layers,
    :host ::ng-deep .gjs-pn-views-container[data-active-view="blocks"] .gjs-trt-traits,
    :host ::ng-deep .gjs-pn-views-container[data-active-view="blocks"] .gjs-clm-tags,
    :host ::ng-deep .gjs-pn-views-container[data-active-view="blocks"] .gjs-clm-sels-info { display: none !important; }
    :host ::ng-deep .gjs-pn-views-container[data-active-view="traits"] .gjs-sm-sectors,
    :host ::ng-deep .gjs-pn-views-container[data-active-view="traits"] .gjs-blocks-cs,
    :host ::ng-deep .gjs-pn-views-container[data-active-view="traits"] .gjs-layers,
    :host ::ng-deep .gjs-pn-views-container[data-active-view="traits"] .gjs-clm-tags,
    :host ::ng-deep .gjs-pn-views-container[data-active-view="traits"] .gjs-clm-sels-info { display: none !important; }
    :host ::ng-deep .gjs-clm-tag { background: #1e293b; border-color: #334155; color: #cbd5e1; }
    :host ::ng-deep .gjs-clm-tags { background: #0f172a; }
    :host ::ng-deep .gjs-clm-sels-info { color: #94a3b8; }
    :host ::ng-deep .gjs-sm-field { background: #1e293b; border-color: #334155; color: #e2e8f0; }
    :host ::ng-deep .gjs-sm-label { color: #94a3b8; }
    :host ::ng-deep .gjs-sm-sector { background: #0f172a; border-color: #1e293b; color: #e2e8f0; }
    :host ::ng-deep .gjs-sm-sector-title { background: #1e293b; border-bottom: 1px solid #334155; }
    :host ::ng-deep .gjs-sm-sector-title:hover { background: #334155; }
    :host ::ng-deep .gjs-layer { background: #0f172a; border-bottom: 1px solid #1e293b; color: #cbd5e1; }
    :host ::ng-deep .gjs-layer-item { background: #1e293b; border: 1px solid #334155; color: #e2e8f0; }
    :host ::ng-deep .gjs-layer-name { color: #e2e8f0; }
    :host ::ng-deep .gjs-layer-selected { background: #1e3a5f !important; border-left: 3px solid #D4AF37 !important; }
    :host ::ng-deep .gjs-layer-item.selected { background: #D4AF37 !important; color: #000 !important; border-left: 3px solid #0f172a !important; text-decoration: none !important; }
    :host ::ng-deep .gjs-layer.selected { background: #D4AF37 !important; color: #000 !important; border-left: 3px solid #0f172a !important; text-decoration: none !important; }
    :host ::ng-deep .gjs-layers [class*="selected"] { background: #D4AF37 !important; color: #000 !important; text-decoration: none !important; }
    :host ::ng-deep .gjs-layer-active { background: #1e293b; border-left: 3px solid #3b82f6 !important; }
    :host ::ng-deep .gjs-layer-title { background: #0f172a; border-bottom: 1px solid #1e293b; color: #e2e8f0; }
    :host ::ng-deep .gjs-layer-title:hover { background: #1e293b; }
    :host ::ng-deep .gjs-blocks-c { background: #0f172a; }
    :host ::ng-deep .gjs-block { background: #1e293b; border: 1px solid #334155; color: #cbd5e1; }
    :host ::ng-deep .gjs-block:hover { border-color: #475569; box-shadow: 0 2px 8px rgba(0,0,0,0.3); }
    :host ::ng-deep .gjs-block-label { color: #94a3b8; }
    :host ::ng-deep .gjs-traits-c { background: #0f172a; }
    :host ::ng-deep .gjs-traits-label { color: #94a3b8; }
    :host ::ng-deep .gjs-traits-field { background: #1e293b; border-color: #334155; color: #e2e8f0; }
    :host ::ng-deep .gjs-select option { background: #1e293b; color: #e2e8f0; }
    :host ::ng-deep .gjs-am-assets { background: #0f172a; }
    :host ::ng-deep .gjs-am-asset { background: #1e293b; border: 1px solid #334155; }
    :host ::ng-deep .gjs-am-asset:hover { border-color: #475569; }
    :host ::ng-deep .gjs-am-meta { color: #94a3b8; }
    :host ::ng-deep .gjs-am-close { color: #94a3b8; }
    :host ::ng-deep .gjs-am-close:hover { color: #e2e8f0; }
    :host ::ng-deep .gjs-am-file-uploader { background: #0f172a; border-color: #334155; color: #94a3b8; }
    :host ::ng-deep .gjs-field { background: #1e293b; border-color: #334155; color: #e2e8f0; }
    :host ::ng-deep .gjs-field input { background: #1e293b; color: #e2e8f0; }
    :host ::ng-deep .gjs-field select { background: #1e293b; color: #e2e8f0; }
    :host ::ng-deep .gjs-field textarea { background: #1e293b; color: #e2e8f0; }
    :host ::ng-deep .gjs-modal { background: rgba(0,0,0,0.7); }
    :host ::ng-deep .gjs-modal-dialog { background: #0f172a; border: 1px solid #1e293b; }
    :host ::ng-deep .gjs-modal-header { background: #1e293b; border-bottom: 1px solid #334155; color: #e2e8f0; }
    :host ::ng-deep .gjs-modal-body { color: #cbd5e1; }
    :host ::ng-deep .gjs-btn-prim { background: #3b82f6; color: #fff; }
    :host ::ng-deep .gjs-btn-prim:hover { background: #2563eb; }
    :host ::ng-deep .gjs-composites { background: #0f172a; }
    :host ::ng-deep .gjs-category { background: #0f172a; border-bottom: 1px solid #1e293b; }
    :host ::ng-deep .gjs-category-title { color: #e2e8f0; background: #1e293b; }
    :host ::ng-deep .gjs-category-title:hover { background: #334155; }
    :host ::ng-deep .gjs-category-open { border-bottom: 1px solid #334155; }
    :host ::ng-deep [data-no-select] img { pointer-events: none; user-select: none; }
    :host ::ng-deep [data-no-select] * { user-select: none; }

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
  private sessionStore = inject(SessionStore);

  private editor: any = null;
  private isPreviewActive = false;
  showSaveDialog = signal(false);
  showTemplates = signal(false);
  templateName = signal('');

  // Track editing template context
  editingTemplate = signal<SavedTemplate | null>(null);
  private initialListingMeta: { html: string; css: string } | null = null;

  // Determine if current user has admin permissions
  isAdmin = computed(() => this.sessionStore.userProfile()?.role === 'admin');
  private galleryCssText = '';

  async openTemplates(): Promise<void> {
    await this.store.loadTemplates();
    this.showTemplates.set(true);
  }

  async loadTemplateForEditing(t: SavedTemplate): Promise<void> {
    this.showTemplates.set(false);
    if (!this.editor || !t) return;
    try {
      this.editingTemplate.set(t);
      const fullHtml = t.html + (t.css ? '<style>' + t.css + '</style>' : '');
      this.editor.setComponents(fullHtml);
    } catch (err) {
      console.error('[Editor] Failed to load template:', err);
    }
  }

  async applyTemplateFromManager(t: SavedTemplate): Promise<void> {
    this.showTemplates.set(false);
    if (!this.editor || !t) return;
    try {
      await this.ensurePropertyLoaded();
      const mapped = await this.mapTemplateToPropertyData(t.html, t.css || '');
      this.editor.setComponents(mapped.html);
      this.editor.setStyle(mapped.css);
      this.initialListingMeta = { html: mapped.html, css: mapped.css || '' };
      this.store.setToastMessage(`Template "${t.name}" applied successfully!`);
    } catch (err) {
      console.error('[Editor] Failed to apply template:', err);
      this.store.setToastMessage('Error applying template.');
    }
  }

  exitTemplateEditMode(): void {
    this.editingTemplate.set(null);
    this.reloadListingContent();
  }

  async reloadListingContent(): Promise<void> {
    if (!this.editor || !this.initialListingMeta) return;
    try {
      this.editor.setComponents(this.initialListingMeta.html);
      this.editor.setStyle(this.initialListingMeta.css);
    } catch (err) {
      console.warn('[Editor] Failed to reload listing content:', err);
    }
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
        this.store.setToastMessage('Template saved successfully!');
        // Force reload templates
        await this.store.loadTemplates();
      } else {
        this.store.setToastMessage('Failed to save template. Check if you are authorized.');
      }
    } catch (err) {
      console.error('[Template] Save failed:', err);
      this.store.setToastMessage('Error saving template: ' + (err instanceof Error ? err.message : err));
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

    // Amenities HTML mapping using helper methods
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
      beach: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 18h20"/><path d="M3 14c1-1 2-1 3 0s2 1 3 0 2-1 3 0 2-1 3 0 2-1 3 0 2 1 3 0"/><path d="M12 2L2 18"/></svg>',
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
        const symbol = this.getAmenityIcon(eq.name);
        const svgContent = this.getIconSvg(symbol);
        return '<div class="luxury-amenity-item"><span class="luxury-amenity-icon" data-icon-family="outline" data-icon-symbol="' + symbol + '">' + svgContent + '</span><span>' + eq.name + '</span></div>';
      }).join('\n');
    } else {
      const symbols = ['pool', 'spa', 'cinema', 'wine', 'gym', 'ac'];
      const labels = ['Heated Swimming Pool', 'Spa, Hammam & Sauna', 'Private Cinema Room', 'Cigar Room & Bar', 'Fitness Room', 'Air Conditioning'];
      amenitiesHtml = symbols.map((s, i) => '<div class="luxury-amenity-item"><span class="luxury-amenity-icon" data-icon-family="outline" data-icon-symbol="' + s + '">' + this.getIconSvg(s) + '</span><span>' + labels[i] + '</span></div>').join('\n');
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
      const symbol = this.getAmenityIcon(f);
      return '<div class="lc-feature"><span class="lc-feature-icon">' + this.getIconSvg(symbol) + '</span>' + f + '</div>';
    }).join('');

    const roomsData = Array.from({length: Math.min(Number(bedrooms) || 6, 9)}, (_, i) => ({
      name: 'Bedroom ' + (i + 1),
      bed: '1 Double bed (180×200 cm)',
      features: ['Air conditioning', 'Flat screen TV', 'Safe', 'Desk']
    }));
    const roomsHtml = roomsData.map(r =>
      '<div class="lc-room"><div class="lc-room-name">' + r.name + '</div><div class="lc-room-bed">' + r.bed + '</div><div class="lc-room-details">' + r.features.map(t => '<span class="lc-room-tag">' + t + '</span>').join('') + '</div></div>'
    ).join('');

    // Initialize GrapesJS core with preset-webpage plugin
    try {
      const config: Record<string, any> = {
        container: el,
        plugins: [gjsPresetWebpage],
        storageManager: false,
        assetManager: {
          upload: false,
          noAssets: 'No property images available. Please add photos to the property first.',
        },
        allowScripts: true,
      };
      this.editor = grapesjs.init(config as any);

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

      this.editor.on('load', () => {
        this.editor.setDevice('desktop');

        // Inject gallery type CSS and body reset into the canvas
        const galleryCss = document.createElement('style');
        galleryCss.textContent = `
          body { margin: 0 !important; padding: 0 !important; }
          .luxury-gallery-container .gallery-lookbook,
          .luxury-gallery-container .gallery-filmstrip,
          .luxury-gallery-container .gallery-curtain,
          .luxury-gallery-container .gallery-scatter,
          .luxury-gallery-container .gallery-carousel { display: none !important; }
          .luxury-gallery-container[data-gallery-type="lookbook"] .gallery-lookbook { display: grid !important; }
          .luxury-gallery-container[data-gallery-type="filmstrip"] .gallery-filmstrip { display: block !important; }
          .luxury-gallery-container[data-gallery-type="grid"] .gallery-grid { display: grid !important; }
          .luxury-gallery-container[data-gallery-type="curtain"] .gallery-curtain { display: block !important; }
          .luxury-gallery-container[data-gallery-type="scatter"] .gallery-scatter { display: block !important; }
          .luxury-gallery-container[data-gallery-type="carousel"] .gallery-carousel { display: block !important; }
          .luxury-gallery-container[data-gallery-type="3d-carousel"] .gallery-3d-carousel { display: block !important; }
          .luxury-gallery-container[data-gallery-type="isometric-grid"] .gallery-isometric-grid { display: block !important; }
          .luxury-gallery-container[data-gallery-type="masonry"] .gallery-masonry { display: block !important; }
          .luxury-gallery-container[data-gallery-type="ken-burns"] .gallery-ken-burns { display: block !important; }
          .luxury-gallery-container[data-gallery-type="accordion"] .gallery-accordion { display: block !important; }
          .luxury-gallery-container[data-gallery-type="parallax"] .gallery-parallax { display: block !important; }
          .luxury-gallery-container[data-gallery-type="polaroid"] .gallery-polaroid { display: block !important; }
          .gallery-lookbook { background: #fcfbfa; padding: 60px 5%; display: grid; grid-template-columns: repeat(12,1fr); gap: 32px; }
          .gallery-lookbook > div:nth-child(4n+1) { grid-column: 1 / span 7; }
          .gallery-lookbook > div:nth-child(4n+2) { grid-column: 9 / span 4; margin-top: 80px; }
          .gallery-lookbook > div:nth-child(4n+3) { grid-column: 2 / span 5; margin-top: -40px; }
          .gallery-lookbook > div:nth-child(4n) { grid-column: 8 / span 5; margin-top: 50px; }
          .gallery-lookbook img, .gallery-filmstrip img, .gallery-grid img, .gallery-curtain img, .gallery-carousel img { width: 100%; display: block; }
          .gallery-lookbook img { height: 100%; object-fit: cover; }
          .gallery-filmstrip { background: #0d0d0d; padding: 40px 0; overflow: hidden; }
          .filmstrip-track { display: flex; gap: 40px; overflow-x: auto; padding: 20px 8%; }
          .filmstrip-track > div { width: 350px; height: 260px; overflow: hidden; background: #1a1a1a; flex-shrink: 0; }
          .filmstrip-track img { width: 100%; height: 100%; object-fit: cover; }
          .gallery-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; padding: 20px 4%; }
          .gallery-grid img { height: 250px; border-radius: 4px; object-fit: cover; }
          .gallery-curtain { background: #0d0d0d; padding: 20px; }
          .gallery-curtain img { height: 100%; object-fit: cover; border-radius: 6px; }
          .gallery-scatter { background: #fcfbfa; padding: 20px; min-height: 400px; }
          .gallery-scatter img { border-radius: 8px; margin-bottom: 16px; }
          .gallery-carousel { background: #0d0d0d; padding: 40px 5%; }
          .carousel-track { display: flex; gap: 24px; overflow-x: auto; scroll-snap-type: x mandatory; padding: 20px 0; cursor: grab; }
          .carousel-track > div { min-width: 320px; height: 400px; flex-shrink: 0; scroll-snap-align: start; overflow: hidden; border-radius: 8px; background: #1a1a1a; }
          .carousel-track img { width: 100%; height: 100%; object-fit: cover; }

          /* ── 3D Carousel ── */
          .gallery-3d-carousel { display: none; }
          .carousel-perspective { width:100%; height:600px; perspective:1200px; position:relative; display:flex; flex-direction:column; align-items:center; justify-content:center; overflow:hidden; padding:2rem 0; }
          .carousel-3d-stage { width:260px; height:380px; position:relative; transform-style:preserve-3d; transition:transform 0.1s ease-out; will-change:transform; }
          .carousel-item-3d { position:absolute; top:0; left:0; width:100%; height:100%; backface-visibility:hidden; border-radius:16px; overflow:hidden; cursor:pointer; box-shadow:0 15px 35px rgba(0,0,0,0.4); transform-style:preserve-3d; transition:filter 0.5s ease,transform 0.5s ease; -webkit-box-reflect:below 15px linear-gradient(transparent,transparent 65%,rgba(0,0,0,0.25)); }
          .carousel-item-3d img { width:100%; height:100%; object-fit:cover; pointer-events:none; }
          .carousel-item-3d .card-meta { position:absolute; bottom:0; left:0; right:0; padding:1.25rem 1rem; background:linear-gradient(transparent,rgba(0,0,0,0.85) 75%); color:#fff; opacity:0; transform:translateY(10px); transition:opacity 0.3s ease,transform 0.3s ease; }
          .carousel-item-3d:hover .card-meta { opacity:1; transform:translateY(0); }
          .carousel-item-3d .card-title { font-size:1rem; font-weight:600; margin:0; }
          .carousel-item-3d .card-tag { font-family:monospace; font-size:0.7rem; text-transform:uppercase; color:#ec4899; }
          .carousel-controls { display:flex; align-items:center; gap:1.5rem; margin-top:4.5rem; z-index:100; }
          .control-btn { background:#161623; border:1px solid rgba(255,255,255,0.1); color:#f8fafc; width:3rem; height:3rem; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; font-weight:bold; transition:all 0.3s cubic-bezier(0.25,0.8,0.25,1); box-shadow:0 4px 6px rgba(0,0,0,0.15); }
          .control-btn:hover { background:#ec4899; color:#000; transform:scale(1.08); }
          .carousel-hint { margin-top:1.5rem; font-size:0.8rem; opacity:0.5; font-family:monospace; color:#f8fafc; text-align:center; }

          /* ── Isometric Grid ── */
          .gallery-isometric-grid { display: none; }
          .iso-workspace { width:100%; height:600px; position:relative; background:rgba(0,0,0,0.22); border:1px dashed rgba(255,255,255,0.08); border-radius:16px; overflow:hidden; margin:0; box-shadow:inset 0 10px 30px rgba(0,0,0,0.35); perspective:1200px; }
          .iso-controls { position:absolute; top:1rem; left:1rem; right:1rem; display:flex; justify-content:space-between; align-items:center; z-index:10000; pointer-events:none; }
          .iso-hint { font-family:monospace; font-size:0.75rem; color:#f8fafc; opacity:0.8; background:rgba(11,11,15,0.8); padding:0.4rem 0.8rem; border-radius:99px; backdrop-filter:blur(4px); -webkit-backdrop-filter:blur(4px); border:1px solid rgba(255,255,255,0.05); }
          .iso-toggle-btn { pointer-events:auto; background:#ec4899; color:#0f172a; border:none; border-radius:99px; padding:0.45rem 1rem; font-size:0.75rem; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:0.4rem; transition:all 0.2s ease; box-shadow:0 4px 12px rgba(0,0,0,0.2); }
          .iso-toggle-btn:hover { transform:translateY(-1px); box-shadow:0 6px 16px rgba(0,0,0,0.3); }
          .iso-stage { width:100%; height:100%; display:flex; align-items:center; justify-content:center; overflow:auto; padding:4rem; box-sizing:border-box; }
          .iso-grid { display:grid; grid-template-columns:repeat(3,190px); gap:32px; transform-style:preserve-3d; transition:transform 1s cubic-bezier(0.19,1,0.22,1); padding:2rem; }
          .iso-grid.active-3d { transform:rotateX(54deg) rotateZ(-45deg) scale(0.9) translateY(-10px); }
          .iso-card { position:relative; width:190px; height:240px; background:#161623; border-radius:16px; overflow:hidden; cursor:pointer; transform-style:preserve-3d; transition:transform 0.4s cubic-bezier(0.19,1,0.22,1),box-shadow 0.4s ease; border:1px solid rgba(255,255,255,0.06); box-shadow:0 10px 25px rgba(0,0,0,0.25); }
          .iso-grid.active-3d .iso-card:hover { transform:translateZ(45px); box-shadow:-15px 15px 32px rgba(0,0,0,0.45),0 0 20px #ec489955; }
          .iso-grid:not(.active-3d) .iso-card:hover { transform:scale(1.06) translateY(-6px); box-shadow:0 15px 35px rgba(0,0,0,0.35); }
          .iso-card-image { width:100%; height:100%; object-fit:cover; pointer-events:none; transition:transform 0.5s ease; }
          .iso-card:hover .iso-card-image { transform:scale(1.1); }
          .iso-card-overlay { position:absolute; inset:0; background:linear-gradient(to top,rgba(0,0,0,0.85) 0%,rgba(0,0,0,0.2) 60%,transparent 100%); display:flex; flex-direction:column; justify-content:flex-end; padding:1rem; box-sizing:border-box; opacity:0.9; transition:opacity 0.3s ease; transform:translateZ(10px); }
          .iso-card:hover .iso-card-overlay { opacity:1; }
          .iso-title { font-family:inherit; font-size:0.85rem; font-weight:700; color:#fff; margin:0 0 4px 0; text-shadow:0 2px 4px rgba(0,0,0,0.5); }
          .iso-desc { font-family:inherit; font-size:0.70rem; color:#ccc; margin:0; opacity:0.85; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
          .iso-tag { align-self:flex-start; font-size:0.55rem; font-family:monospace; text-transform:uppercase; color:#ec4899; background:rgba(0,0,0,0.4); padding:2px 6px; border-radius:4px; font-weight:bold; letter-spacing:0.05em; margin-bottom:6px; border:1px solid rgba(255,255,255,0.05); }

          /* ── Masonry ── */
          .gallery-masonry { display: none; }
          .masonry-wrapper-field { width:100%; padding:1.5rem 0; }
          .filter-toolbar { display:flex; flex-wrap:wrap; justify-content:center; gap:0.75rem; margin-bottom:2.5rem; }
          .filter-tab { background:#161623; border:1px solid rgba(255,255,255,0.08); color:#f8fafc; padding:0.5rem 1.25rem; border-radius:99px; font-size:0.85rem; font-weight:500; cursor:pointer; transition:all 0.3s cubic-bezier(0.25,0.8,0.25,1); }
          .filter-tab:hover, .filter-tab.active { background:#ec4899; color:#000; border-color:#ec4899; box-shadow:0 4px 14px rgba(0,0,0,0.25); }
          .masonry-grid-canvas { column-count:3; column-gap:16px; width:100%; }
          .masonry-item { break-inside:avoid; margin-bottom:16px; position:relative; border-radius:16px; overflow:hidden; background:#161623; cursor:pointer; box-shadow:0 4px 6px -1px rgba(0,0,0,0.1),0 2px 4px -1px rgba(0,0,0,0.06); transition:transform 0.4s cubic-bezier(0.25,0.8,0.25,1),box-shadow 0.4s cubic-bezier(0.25,0.8,0.25,1); }
          .masonry-item:hover { transform:translateY(-5px); box-shadow:0 20px 25px -5px rgba(0,0,0,0.3),0 10px 10px -5px rgba(0,0,0,0.2); }
          .masonry-item img { width:100%; height:auto; display:block; transition:transform 0.6s cubic-bezier(0.25,0.8,0.25,1); }
          .masonry-item:hover img { transform:scale(1.05); }
          .masonry-overlay { position:absolute; top:0; left:0; width:100%; height:100%; background:linear-gradient(to top,rgba(0,0,0,0.85) 0%,rgba(0,0,0,0.2) 60%,rgba(0,0,0,0) 100%); opacity:0; transition:opacity 0.3s ease; display:flex; flex-direction:column; justify-content:flex-end; padding:1.5rem; color:#fff; box-sizing:border-box; }
          .masonry-item:hover .masonry-overlay { opacity:1; }
          .masonry-meta-tag { font-family:monospace; font-size:0.7rem; text-transform:uppercase; color:#ec4899; letter-spacing:0.08em; margin-bottom:0.25rem; }
          .masonry-meta-title { font-size:1.1rem; font-weight:600; margin:0; letter-spacing:-0.01em; }
          .masonry-meta-desc { font-size:0.8rem; opacity:0.8; margin:0.25rem 0 0 0; line-height:1.4; }

          /* ── Ken Burns ── */
          .gallery-ken-burns { display: none; }
          .slideshow-stage-ken { position:relative; width:100%; height:600px; background:#000; border-radius:16px; overflow:hidden; margin:0; box-shadow:0 10px 30px rgba(0,0,0,0.5); }
          .slideshow-canvas { width:100%; height:100%; position:relative; }
          .ken-slide { position:absolute; top:0; left:0; width:100%; height:100%; opacity:0; z-index:1; overflow:hidden; transition:opacity 1.2s cubic-bezier(0.4,0,0.2,1); }
          .ken-slide.active { opacity:1; z-index:2; }
          .ken-slide img { width:100%; height:100%; object-fit:cover; transform-origin:center center; transform:scale(1); }
          .ken-slide.active img { animation:kenBurnsCycle 15s linear infinite alternate; }
          @keyframes kenBurnsCycle { 0%{transform:scale(1) translate(0,0)} 100%{transform:scale(1.15) translate(-1%,-1.5%)} }
          .slideshow-overlay-card { position:absolute; bottom:2.5rem; left:2.5rem; max-width:480px; background:rgba(15,23,42,0.8); border:1px solid rgba(255,255,255,0.1); backdrop-filter:blur(16px); -webkit-backdrop-filter:blur(16px); border-radius:16px; padding:2rem; color:#fff; z-index:10; box-shadow:0 20px 25px -5px rgba(0,0,0,0.4); }
          .slideshow-cat { font-family:monospace; font-size:0.75rem; text-transform:uppercase; color:#ec4899; font-weight:600; letter-spacing:0.15em; }
          .slideshow-headline { font-size:1.75rem; font-weight:600; margin:0.5rem 0; letter-spacing:-0.025em; }
          .slideshow-synopsis { font-size:0.95rem; opacity:0.85; line-height:1.5; margin:0 0 1.5rem 0; }
          .slideshow-action-bar { display:flex; align-items:center; gap:1rem; }
          .action-btn { background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.15); color:#fff; width:2.5rem; height:2.5rem; border-radius:50%; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:all 0.3s ease; }
          .action-btn:hover { background:#ec4899; color:#000; border-color:#ec4899; }
          .action-circle-btn { width:3rem; height:3rem; background:#ec4899; color:#000; border:none; }
          .action-circle-btn:hover { transform:scale(1.08); filter:brightness(1.1); }
          .slideshow-bullets { position:absolute; top:2.5rem; right:2.5rem; display:flex; flex-direction:column; gap:0.5rem; z-index:10; }
          .bullet-dot { width:0.5rem; height:0.5rem; border-radius:50%; background:rgba(255,255,255,0.3); cursor:pointer; transition:all 0.3s ease; }
          .bullet-dot.active { background:#ec4899; transform:scale(1.3); }
          .slideshow-progress-track { position:absolute; bottom:0; left:0; width:100%; height:4px; background:rgba(255,255,255,0.15); z-index:20; }
          .slideshow-progress-bar { height:100%; background:#ec4899; width:0%; }

          /* ── Accordion ── */
          .gallery-accordion { display: none; }
          .accordion-container { display:flex; width:100%; height:520px; gap:16px; margin:0; box-sizing:border-box; }
          .accordion-pane { flex:1; height:100%; position:relative; border-radius:16px; overflow:hidden; cursor:pointer; background:#161623; box-shadow:0 4px 10px rgba(0,0,0,0.15); transition:flex 0.65s cubic-bezier(0.25,0.8,0.25,1); will-change:flex; }
          .accordion-pane img { position:absolute; top:0; left:50%; transform:translateX(-50%); height:100%; width:100%; object-fit:cover; pointer-events:none; transition:scale 0.65s cubic-bezier(0.25,0.8,0.25,1),filter 0.5s ease; filter:brightness(0.7) grayscale(0.2); }
          .accordion-pane.active { flex:4; }
          .accordion-pane.active img { scale:1.05; filter:brightness(0.9) grayscale(0); }
          .pane-shroud { position:absolute; top:0; left:0; width:100%; height:100%; background:linear-gradient(to top,rgba(0,0,0,0.9) 0%,rgba(0,0,0,0.4) 50%,rgba(0,0,0,0.1) 100%); pointer-events:none; transition:opacity 0.4s ease; }
          .pane-text-card { position:absolute; bottom:0; left:0; right:0; padding:2rem; color:#fff; opacity:0; transform:translateY(15px); transition:opacity 0.5s cubic-bezier(0.25,0.8,0.25,1) 0.15s,transform 0.5s cubic-bezier(0.25,0.8,0.25,1) 0.15s; box-sizing:border-box; }
          .accordion-pane.active .pane-text-card { opacity:1; transform:translateY(0); }
          .pane-tag { font-family:monospace; font-size:0.75rem; text-transform:uppercase; color:#ec4899; letter-spacing:0.12em; display:inline-block; margin-bottom:0.4rem; }
          .pane-title { font-size:1.6rem; font-weight:600; margin:0 0 0.5rem 0; letter-spacing:-0.015em; }
          .pane-desc { font-size:0.95rem; opacity:0.85; margin:0; max-width:500px; line-height:1.5; }
          .pane-action { margin-top:1.25rem; display:inline-flex; align-items:center; gap:0.5rem; background:#ec4899; color:#000; font-size:0.85rem; font-weight:500; padding:0.5rem 1.25rem; border-radius:99px; border:none; cursor:pointer; }
          .pane-collapsed-line { position:absolute; bottom:2rem; left:50%; transform:translateX(-50%) rotate(-90deg); transform-origin:center center; white-space:nowrap; text-transform:uppercase; font-family:monospace; font-size:0.85rem; font-weight:500; letter-spacing:0.15em; opacity:0.7; color:#fff; transition:opacity 0.3s ease; pointer-events:none; }
          .accordion-pane.active .pane-collapsed-line { opacity:0; }

          /* ── Parallax ── */
          .gallery-parallax { display: none; }
          .parallax-strip-viewport { width:100%; height:520px; overflow:hidden; position:relative; background:transparent; margin:0; cursor:grab; display:flex; flex-direction:column; justify-content:space-between; }
          .parallax-strip-viewport:active { cursor:grabbing; }
          .parallax-strip-grid { display:flex; gap:2rem; padding:1.5rem 0; width:max-content; height:420px; transform:translateX(0); will-change:transform; }
          .strip-card { width:310px; height:390px; border-radius:16px; overflow:hidden; position:relative; background:#161623; box-shadow:0 10px 25px rgba(0,0,0,0.25); flex-shrink:0; user-select:none; -webkit-user-drag:none; }
          .strip-card-image-box { width:100%; height:100%; overflow:hidden; position:relative; }
          .strip-card-image-box img { position:absolute; top:0; left:-20%; width:140%; height:100%; object-fit:cover; pointer-events:none; transform:translateX(0); transition:transform 0.05s ease-out; }
          .strip-card-overlay { position:absolute; top:0; left:0; width:100%; height:100%; background:linear-gradient(to top,rgba(0,0,0,0.9) 0%,rgba(0,0,0,0.3) 55%,rgba(0,0,0,0) 100%); display:flex; flex-direction:column; justify-content:flex-end; padding:1.5rem; box-sizing:border-box; color:#fff; }
          .strip-tag { font-family:monospace; font-size:0.7rem; text-transform:uppercase; color:#ec4899; letter-spacing:0.1em; margin-bottom:0.25rem; }
          .strip-title { font-size:1.25rem; font-weight:600; margin:0; letter-spacing:-0.01em; }
          .strip-desc { font-size:0.85rem; opacity:0.8; margin:0.25rem 0 0 0; line-height:1.4; }
          .strip-footer { display:flex; align-items:center; justify-content:space-between; width:100%; padding:0.5rem 0; }
          .strip-hint { font-family:monospace; font-size:0.75rem; opacity:0.5; color:#f8fafc; }
          .strip-scroll-track { width:150px; height:3px; background:rgba(255,255,255,0.1); border-radius:99px; overflow:hidden; }
          .strip-scroll-bar { width:25%; height:100%; background:#ec4899; border-radius:99px; transform:translateX(0); }

          /* ── Polaroid ── */
          .gallery-polaroid { display: none; }
          .polaroid-desk { width:100%; height:600px; position:relative; background:rgba(0,0,0,0.22); border:1px dashed rgba(255,255,255,0.08); border-radius:16px; overflow:hidden; margin:0; box-shadow:inset 0 10px 30px rgba(0,0,0,0.3); }
          .polaroid-desk-header { position:absolute; top:1rem; left:1rem; right:1rem; display:flex; justify-content:space-between; align-items:center; z-index:10000; pointer-events:none; }
          .polaroid-desk-hint { font-family:monospace; font-size:0.75rem; color:#f8fafc; opacity:0.8; background:rgba(11,11,15,0.8); padding:0.4rem 0.8rem; border-radius:99px; backdrop-filter:blur(4px); -webkit-backdrop-filter:blur(4px); border:1px solid rgba(255,255,255,0.05); }
          .reshuffle-btn { pointer-events:auto; background:#ec4899; color:#0f172a; border:none; border-radius:99px; padding:0.45rem 1rem; font-size:0.75rem; font-weight:600; cursor:pointer; display:flex; align-items:center; gap:0.4rem; transition:all 0.2s ease; box-shadow:0 4px 12px rgba(0,0,0,0.2); }
          .reshuffle-btn:hover { transform:translateY(-1px); box-shadow:0 6px 16px rgba(0,0,0,0.3); }
          .polaroid-pile { position:absolute; top:0; left:0; width:100%; height:100%; }
          .polaroid-card { position:absolute; width:210px; height:265px; background:#fff; color:#0f172a; padding:12px 12px 32px 12px; box-shadow:0 8px 20px rgba(0,0,0,0.2); border-radius:3px; cursor:pointer; user-select:none; transform-origin:center center; transition:transform 0.6s cubic-bezier(0.19,1,0.22,1),left 0.6s cubic-bezier(0.19,1,0.22,1),top 0.6s cubic-bezier(0.19,1,0.22,1),box-shadow 0.3s ease; }
          .polaroid-card:hover { box-shadow:0 16px 38px rgba(0,0,0,0.3); }
          .polaroid-card img { width:100%; height:185px; object-fit:cover; pointer-events:none; border:1px solid rgba(0,0,0,0.03); }
          .polaroid-text-pane { margin-top:10px; text-align:center; overflow:hidden; }
          .polaroid-card-title { font-family:inherit; font-size:11px; font-weight:700; letter-spacing:-0.01em; color:#0f172a; white-space:nowrap; text-overflow:ellipsis; overflow:hidden; margin:0; }
          .polaroid-card-tag { font-size:8px; font-family:monospace; text-transform:uppercase; color:#ec4899; letter-spacing:0.1em; font-weight:bold; margin-top:3px; }
          .polaroid-card.focused { box-shadow:0 25px 65px rgba(0,0,0,0.5); }

          /* ── Shared Lightbox ── */
          .lightbox-overlay { position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(10,10,12,0.96); z-index:100000; display:flex; align-items:center; justify-content:center; opacity:0; pointer-events:none; transition:opacity 0.4s cubic-bezier(0.25,0.8,0.25,1); backdrop-filter:blur(10px); -webkit-backdrop-filter:blur(10px); }
          .lightbox-overlay.active { opacity:1; pointer-events:auto; }
          .lightbox-content-wrapper { width:90%; max-width:1100px; display:flex; flex-direction:column; height:85vh; justify-content:space-between; }
          .lightbox-stage { flex:1; display:flex; align-items:center; justify-content:center; min-height:0; position:relative; }
          .lightbox-stage img { max-width:100%; max-height:100%; object-fit:contain; border-radius:8px; box-shadow:0 25px 50px -12px rgba(0,0,0,0.5); opacity:0; transform:scale(0.95); transition:opacity 0.3s ease,transform 0.3s ease; }
          .lightbox-overlay.active #lightbox-image { opacity:1; transform:scale(1); }
          .lightbox-caption-panel { padding:1.5rem 0 1rem 0; color:#fff; text-align:left; border-top:1px solid rgba(255,255,255,0.1); }
          .lightbox-tag { display:inline-block; background:#ec4899; color:#000; font-size:0.75rem; font-weight:600; text-transform:uppercase; letter-spacing:0.1em; padding:0.25rem 0.75rem; border-radius:99px; margin-bottom:0.5rem; }
          .lightbox-title { font-size:1.5rem; font-weight:600; margin:0; letter-spacing:-0.02em; }
          .lightbox-desc { font-size:0.95rem; opacity:0.8; margin:0.25rem 0 0 0; line-height:1.5; }
          .lightbox-counter { font-family:monospace; font-size:0.85rem; opacity:0.5; margin-top:0.75rem; }
          .lightbox-close { position:absolute; top:1.5rem; right:1.5rem; background:none; border:none; color:#fff; font-size:2.5rem; cursor:pointer; opacity:0.7; transition:opacity 0.2s,transform 0.2s; z-index:100100; }
          .lightbox-close:hover { opacity:1; transform:scale(1.1); }
          .lightbox-nav { position:absolute; top:50%; transform:translateY(-50%); background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); width:3rem; height:3rem; border-radius:50%; color:#fff; font-size:1.25rem; cursor:pointer; display:flex; align-items:center; justify-content:center; opacity:0.6; transition:opacity 0.2s,background 0.2s; z-index:100100; }
          .lightbox-nav:hover { opacity:1; background:rgba(255,255,255,0.15); }
          .lightbox-prev { left:1.5rem; }
          .lightbox-next { right:1.5rem; }
        `;
        this.galleryCssText = galleryCss.textContent;
        const frameEl = this.editor.Canvas.getFrameEl();
        if (frameEl && frameEl.contentDocument?.head) {
          frameEl.contentDocument.head.appendChild(galleryCss);
        }
        this.editor.on('canvas:frame:load', () => {
          const fr = this.editor.Canvas.getFrameEl();
          if (fr && fr.contentDocument?.head && !fr.contentDocument.querySelector('.he-gallery-styles')) {
            const c = galleryCss.cloneNode(true) as HTMLStyleElement;
            c.className = 'he-gallery-styles';
            fr.contentDocument.head.appendChild(c);
          }
        });

        // Open the right-side panel with Style Manager by default for element properties
        this.editor.runCommand('open-sm');

        // Inject CSS directly into document head
        const viewCssId = 'he-view-isolation-css';
        if (!document.getElementById(viewCssId)) {
          const style = document.createElement('style');
          style.id = viewCssId;
          style.textContent = `
            .gjs-pn-views-container[data-active-view="layers"] .gjs-sm-sectors,
            .gjs-pn-views-container[data-active-view="layers"] .gjs-blocks-cs,
            .gjs-pn-views-container[data-active-view="layers"] .gjs-trt-traits,
            .gjs-pn-views-container[data-active-view="layers"] .gjs-clm-tags,
            .gjs-pn-views-container[data-active-view="layers"] .gjs-clm-sels-info,
            .gjs-pn-views[data-active-view="layers"] .gjs-clm-tags,
            .gjs-pn-views[data-active-view="layers"] .gjs-clm-sels-info { display: none !important; }
            .gjs-pn-views-container[data-active-view="styles"] .gjs-layers,
            .gjs-pn-views-container[data-active-view="styles"] .gjs-blocks-cs { display: none !important; }
            .gjs-pn-views-container[data-active-view="blocks"] .gjs-sm-sectors,
            .gjs-pn-views-container[data-active-view="blocks"] .gjs-layers,
            .gjs-pn-views-container[data-active-view="blocks"] .gjs-trt-traits,
            .gjs-pn-views-container[data-active-view="blocks"] .gjs-clm-tags,
            .gjs-pn-views-container[data-active-view="blocks"] .gjs-clm-sels-info { display: none !important; }
            .gjs-pn-views-container[data-active-view="traits"] .gjs-sm-sectors,
            .gjs-pn-views-container[data-active-view="traits"] .gjs-blocks-cs,
            .gjs-pn-views-container[data-active-view="traits"] .gjs-layers,
            .gjs-pn-views-container[data-active-view="traits"] .gjs-clm-tags,
            .gjs-pn-views-container[data-active-view="traits"] .gjs-clm-sels-info { display: none !important; }
          `;
          document.head.appendChild(style);
        }

        // Update data-active-view AND directly enforce visibility
        const updateActiveView = () => {
          try {
            const viewsPanel: any = this.editor.Panels.getPanel('views');
            if (!viewsPanel) return;
            const btns: any = viewsPanel.get('buttons');
            if (!btns) return;
            const container = document.querySelector('.gjs-pn-views-container');
            const views = document.querySelector('.gjs-pn-views');
            if (!container && !views) return;
            let activeId = '';
            btns.models.forEach((b: any) => {
              if (b.get('active')) activeId = b.get('id');
            });
            const viewMap: Record<string, string> = {
              'open-styles': 'styles',
              'open-layers': 'layers',
              'open-blocks': 'blocks',
              'open-traits': 'traits',
              'open-sm': 'styles',
              'open-tm': 'traits',
            };
            const val = viewMap[activeId] || '';
            if (val) {
              if (container) container.setAttribute('data-active-view', val);
              if (views) views.setAttribute('data-active-view', val);
            } else {
              if (container) container.removeAttribute('data-active-view');
              if (views) views.removeAttribute('data-active-view');
            }

            // --- Direct JavaScript enforcement (bypasses CSS selector issues) ---
            // Use .gjs-pn-views as root because the class manager (.gjs-clm-tags) lives OUTSIDE the container
            const root = views || container || document;
            const allContent = root.querySelectorAll('.gjs-clm-tags, .gjs-clm-sels-info, .gjs-sm-sectors, .gjs-layers, .gjs-blocks-cs, .gjs-trt-traits');
            allContent.forEach((el: Element) => {
              (el as HTMLElement).style.setProperty('display', 'none', 'important');
            });
            // Show only the active view's content
            if (val === 'layers') {
              const layersEl = root.querySelector('.gjs-layers');
              if (layersEl) (layersEl as HTMLElement).style.setProperty('display', '', 'important');
              // Force-highlight the selected layer if any
              const selectedCmp = this.editor.getSelected();
              if (selectedCmp) {
                const layerItems = root.querySelectorAll('.gjs-layer-item, .gjs-layer');
                layerItems.forEach((item: Element) => {
                  (item as HTMLElement).classList.remove('he-layer-selected');
                  (item as HTMLElement).style.removeProperty('background');
                  (item as HTMLElement).style.removeProperty('border-left');
                });
                // Try to find and highlight the selected component's layer
                const id = selectedCmp.get('id') || selectedCmp.ccid;
                root.querySelectorAll(`[data-id="${id}"], [gjs-cid="${id}"]`).forEach((el: Element) => {
                  (el as HTMLElement).style.setProperty('background', '#D4AF37', 'important');
                  (el as HTMLElement).style.setProperty('color', '#000', 'important');
                  (el as HTMLElement).style.setProperty('border-left', '3px solid #0f172a', 'important');
                  (el as HTMLElement).style.setProperty('text-decoration', 'none', 'important');
                });
              }
            } else if (val === 'blocks') {
              const blocksEl = root.querySelector('.gjs-blocks-cs');
              if (blocksEl) (blocksEl as HTMLElement).style.setProperty('display', '', 'important');
            } else if (val === 'styles') {
              const smEl = root.querySelector('.gjs-sm-sectors');
              const clmEl = root.querySelector('.gjs-clm-tags');
              const infoEl = root.querySelector('.gjs-clm-sels-info');
              if (smEl) (smEl as HTMLElement).style.setProperty('display', '', 'important');
              if (clmEl) (clmEl as HTMLElement).style.setProperty('display', '', 'important');
              if (infoEl) (infoEl as HTMLElement).style.setProperty('display', '', 'important');
            } else if (val === 'traits') {
              const traitsEl = root.querySelector('.gjs-trt-traits');
              if (traitsEl) (traitsEl as HTMLElement).style.setProperty('display', '', 'important');
            }
            console.log('[ViewIsolation] active:', activeId, 'view:', val);
          } catch (e) {}
        };

        const viewsPanelInstance: any = this.editor.Panels.getPanel('views');
        if (viewsPanelInstance) {
          const btns: any = viewsPanelInstance.get('buttons');
          if (btns) btns.on('change:active', updateActiveView);
        }
        this.editor.on('component:selected', () => setTimeout(updateActiveView, 50));
        setInterval(updateActiveView, 200);
        setTimeout(updateActiveView, 200);

        // Ensure hoverable matches selectable for ALL components to prevent hover/selection mismatch
        const syncHoverAndSelect = () => {
          try {
            this.editor.getWrapper().find('*').forEach((cmp: any) => {
              const s = cmp.get('selectable');
              const h = cmp.get('hoverable');
              if (h !== s) cmp.set('hoverable', s);
            });
          } catch (e) {}
        };
        this.editor.on('component:selected', () => setTimeout(syncHoverAndSelect, 20));
        setInterval(syncHoverAndSelect, 3000);

        // Refresh canvas highlights when sidebar visibility changes (resize issue)
        let lastCanvasWidth = 0;
        setInterval(() => {
          const cv = document.querySelector('.gjs-cv-canvas') as HTMLElement | null;
          if (cv && cv.offsetWidth !== lastCanvasWidth) {
            lastCanvasWidth = cv.offsetWidth;
            try { (this.editor as any).Canvas.refresh({ all: true }); } catch (e) {}
          }
        }, 200);

        // Register comprehensive block library matching Studio SDK capabilities
        const B = (id: string, opts: any) => this.editor.Blocks.add(id, opts);
        const s = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:100%;height:100%">';

        // ── Basic Blocks ──
        B('he-heading', { label: 'Heading', category: 'Basic', media: s+'<path d="M4 6h16M4 12h10M4 18h14"/></svg>', content: '<h1 style="font-size:2.5rem;font-weight:700;margin:0 0 16px;font-family:Playfair Display,serif;color:#202020">Section Heading</h1>' });
        B('he-text', { label: 'Text', category: 'Basic', media: s+'<path d="M4 6h16M4 12h16M4 18h12"/></svg>', content: '<p style="font-size:1.05rem;line-height:1.7;color:#4c4c4c;margin:0 0 16px">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>' });
        B('he-image', { label: 'Image', category: 'Basic', media: s+'<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>', content: '<img src="" style="width:100%;border-radius:4px;display:block" alt="Property Photo" data-property-photo="true" />' });
        B('he-button', { label: 'Button', category: 'Basic', media: s+'<rect x="4" y="8" width="16" height="8" rx="2"/></svg>', content: '<button style="padding:14px 32px;background:#202020;color:#fff;border:none;border-radius:2px;font-size:0.9rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer">Learn More</button>' });
        B('he-divider', { label: 'Divider', category: 'Basic', media: s+'<line x1="3" x2="21" y1="12" y2="12"/></svg>', content: '<hr style="border:none;border-top:1px solid #eaeaea;margin:24px 0" />' });
        B('he-spacer', { label: 'Spacer', category: 'Basic', media: s+'<rect x="8" y="3" width="8" height="18" rx="1"/></svg>', content: '<div style="height:48px"></div>' });
        B('he-link', { label: 'Link', category: 'Basic', media: s+'<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>', content: '<a href="#" style="color:#1a6b73;text-decoration:underline;font-size:1rem">Read more →</a>' });

        // ── Layout Blocks ──
        B('he-columns-1', { label: '1 Column', category: 'Layout', media: s+'<rect x="4" y="4" width="16" height="16" rx="1"/></svg>', content: '<div style="padding:40px 4%"><div style="background:#fafafa;padding:40px;border:1px dashed #d9d2c7;text-align:center;color:#757575;border-radius:4px">Content Area</div></div>' });
        B('he-columns-2', { label: '2 Columns', category: 'Layout', media: s+'<rect x="3" y="4" width="8" height="16" rx="1"/><rect x="13" y="4" width="8" height="16" rx="1"/></svg>', content: '<div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;padding:20px 4%"><div style="background:#fafafa;padding:24px;border:1px dashed #d9d2c7;text-align:center;color:#757575;border-radius:4px">Column 1</div><div style="background:#fafafa;padding:24px;border:1px dashed #d9d2c7;text-align:center;color:#757575;border-radius:4px">Column 2</div></div>' });
        B('he-columns-3', { label: '3 Columns', category: 'Layout', media: s+'<rect x="2" y="4" width="6" height="16" rx="1"/><rect x="9" y="4" width="6" height="16" rx="1"/><rect x="16" y="4" width="6" height="16" rx="1"/></svg>', content: '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;padding:20px 4%"><div style="background:#fafafa;padding:20px;border:1px dashed #d9d2c7;text-align:center;color:#757575;border-radius:4px">Col 1</div><div style="background:#fafafa;padding:20px;border:1px dashed #d9d2c7;text-align:center;color:#757575;border-radius:4px">Col 2</div><div style="background:#fafafa;padding:20px;border:1px dashed #d9d2c7;text-align:center;color:#757575;border-radius:4px">Col 3</div></div>' });
        B('he-columns-70-30', { label: '70/30 Columns', category: 'Layout', media: s+'<rect x="2" y="4" width="12" height="16" rx="1"/><rect x="16" y="4" width="6" height="16" rx="1"/></svg>', content: '<div style="display:grid;grid-template-columns:2.4fr 1fr;gap:24px;padding:20px 4%"><div style="background:#fafafa;padding:24px;border:1px dashed #d9d2c7;text-align:center;color:#757575;border-radius:4px">Main Content</div><div style="background:#fafafa;padding:24px;border:1px dashed #d9d2c7;text-align:center;color:#757575;border-radius:4px">Sidebar</div></div>' });

        // ── Media Blocks ──
        B('he-media-video', { label: 'Video', category: 'Media', media: s+'<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M10 9v6l5-3z"/></svg>', content: '<div style="position:relative;padding-bottom:56.25%;height:0;background:#1a1a1a;border-radius:4px;overflow:hidden;margin:20px 0"><div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);color:#fff;font-size:3rem;opacity:0.6">▶</div></div>' });
        B('he-media-gallery', { label: 'Image Grid', category: 'Media', media: s+'<rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/></svg>', content: '<div data-property-gallery="true" style="display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:20px 4%"><img src="" style="width:100%;border-radius:4px;display:block" /><img src="" style="width:100%;border-radius:4px;display:block" /><img src="" style="width:100%;border-radius:4px;display:block" /><img src="" style="width:100%;border-radius:4px;display:block" /></div>' });

        // ── Content Blocks ──
        B('he-cta', { label: 'Call to Action', category: 'Content', media: s+'<rect x="3" y="6" width="18" height="12" rx="2"/><path d="M12 10v4M10 12h4"/></svg>', content: '<div data-cta-title="Ready to Experience Luxury?" data-cta-text="Book your stay today and discover unparalleled comfort." data-cta-btn="Book Now" style="background:#1e2a35;padding:60px 4%;text-align:center;color:#fff;margin:20px 0"><h2 style="font-size:2rem;font-family:Playfair Display,serif;margin:0 0 12px">Ready to Experience Luxury?</h2><p style="opacity:0.8;margin:0 0 24px;font-size:1.05rem">Book your stay today and discover unparalleled comfort.</p><button style="padding:14px 40px;background:#c9975b;color:#fff;border:none;border-radius:2px;font-size:0.9rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer">Book Now</button></div>' });
        B('he-list', { label: 'List', category: 'Content', media: s+'<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>', content: '<ul style="list-style:none;padding:0;color:#4c4c4c;line-height:2.2;font-size:1rem"><li>✓ Premium feature one</li><li>✓ Premium feature two</li><li>✓ Premium feature three</li><li>✓ Premium feature four</li></ul>' });
        B('he-quote', { label: 'Quote', category: 'Content', media: s+'<path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2"/></svg>', content: '<blockquote style="border-left:4px solid #c9975b;padding:16px 24px;margin:20px 0;background:#fafafa;border-radius:0 4px 4px 0"><p style="font-style:italic;font-size:1.15rem;color:#4c4c4c;margin:0;line-height:1.6">"An absolutely magical experience. The villa exceeded every expectation."</p><cite style="display:block;margin-top:12px;font-style:normal;font-weight:600;color:#202020">— Elizabeth Mitchell</cite></blockquote>' });

        // ── Form Blocks ──
        B('he-form-contact', { label: 'Contact Form', category: 'Form', media: s+'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 3l9 9 9-9"/></svg>', content: '<div style="max-width:500px;margin:20px auto;padding:32px;border:1px solid #eaeaea;border-radius:4px"><h3 style="font-size:1.2rem;margin:0 0 20px;font-family:Playfair Display,serif">Send a Message</h3><input placeholder="Your Name" style="width:100%;padding:12px;margin-bottom:12px;border:1px solid #d9d2c7;border-radius:4px;font-size:0.95rem;box-sizing:border-box" /><input placeholder="Email" style="width:100%;padding:12px;margin-bottom:12px;border:1px solid #d9d2c7;border-radius:4px;font-size:0.95rem;box-sizing:border-box" /><textarea placeholder="Message" rows="4" style="width:100%;padding:12px;margin-bottom:16px;border:1px solid #d9d2c7;border-radius:4px;font-size:0.95rem;resize:vertical;box-sizing:border-box"></textarea><button style="padding:12px 32px;background:#202020;color:#fff;border:none;border-radius:2px;font-size:0.85rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer">Send</button></div>' });

        // ── Property Listing Blocks ──
        B('he-hero', { label: 'Hero', category: 'Property', media: s+'<rect x="2" y="3" width="20" height="18" rx="2"/><path d="M2 12h20"/></svg>', content: '<div class="luxury-hero" data-hero-title="Property Title" data-hero-subtitle="Exclusive Rental" data-hero-bg="https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80" style="position:relative;height:70vh;background-image:url(https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80);background-size:cover;background-position:center;display:flex;align-items:flex-end;padding:60px 4%"><div style="position:absolute;inset:0;background:linear-gradient(to bottom,rgba(0,0,0,0.1),rgba(0,0,0,0.6))"></div><div style="position:relative;z-index:10;color:#fff"><span style="font-size:1.1rem;text-transform:uppercase;letter-spacing:0.15em;opacity:0.9">Exclusive Rental</span><h1 style="font-size:3.5rem;font-weight:400;margin:0 0 10px;letter-spacing:-0.02em;font-family:Playfair Display,serif">Property Title</h1><span style="font-size:1.1rem;text-transform:uppercase;letter-spacing:0.15em;opacity:0.9">Location</span></div></div>' });
        B('he-stats', { label: 'Stats Bar', category: 'Property', media: s+'<path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/></svg>', content: '<div class="luxury-bar" data-guests="12" data-bedrooms="6" data-bathrooms="6" style="border-bottom:1px solid #eaeaea;padding:24px 4%;display:flex;gap:40px;font-size:0.9rem;text-transform:uppercase;letter-spacing:0.08em;color:#757575;background:#fafafa"><span>Guests <strong>12</strong></span><span>Bedrooms <strong>6</strong></span><span>Bathrooms <strong>6</strong></span><span>Pool <strong>Heated</strong></span></div>' });
        B('he-description', { label: 'Description', category: 'Property', media: s+'<path d="M4 6h16M4 12h16M4 18h12"/></svg>', content: '<div style="max-width:1200px;margin:60px auto;padding:0 4%"><h2 style="font-size:2rem;font-weight:400;margin:0 0 24px;line-height:1.3;font-family:Playfair Display,serif">A luxury retreat built with exceptional refinement.</h2><p style="font-size:1.05rem;color:#4c4c4c;margin-bottom:30px;line-height:1.7">This prestigious property blends refined luxury with serene surroundings. Nestled on a coastal hillside, the estate offers complete privacy, scenic panoramas, and customized concierge services.</p></div>' });
        B('he-amenities', { label: 'Amenities', category: 'Property', media: s+'<path d="M2 20c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M2 16c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/></svg>', content: '<div style="border-top:1px solid #eaeaea;padding-top:40px;margin:40px 0"><h3 style="font-size:1.4rem;font-weight:400;margin-bottom:24px;text-transform:uppercase;letter-spacing:0.08em">Premium Amenities</h3><div style="display:grid;grid-template-columns:repeat(2,1fr);gap:20px 40px"><div style="display:flex;align-items:center;gap:12px;font-size:0.95rem;color:#4c4c4c"><span style="display:flex;align-items:center;justify-content:center;width:24px;height:24px"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:100%;height:100%"><path d="M2 20c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M2 16c2-2 4-2 6 0s4 2 6 0 4-2 6 0"/><path d="M12 2v10"/><path d="M8 6h8"/></svg></span><span>Heated Pool</span></div><div style="display:flex;align-items:center;gap:12px;font-size:0.95rem;color:#4c4c4c"><span style="display:flex;align-items:center;justify-content:center;width:24px;height:24px"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:100%;height:100%"><path d="M4 12c0-2 2-4 4-4s4 2 4 4"/><path d="M12 12c0-2 2-4 4-4s4 2 4 4"/><path d="M4 20c0-2 2-4 4-4"/><path d="M16 16c2 0 4 2 4 4"/></svg></span><span>Spa & Sauna</span></div><div style="display:flex;align-items:center;gap:12px;font-size:0.95rem;color:#4c4c4c"><span style="display:flex;align-items:center;justify-content:center;width:24px;height:24px"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:100%;height:100%"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M9 8v8l6-4z"/></svg></span><span>Cinema Room</span></div><div style="display:flex;align-items:center;gap:12px;font-size:0.95rem;color:#4c4c4c"><span style="display:flex;align-items:center;justify-content:center;width:24px;height:24px"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="width:100%;height:100%"><path d="M12 2v12"/><path d="M8 14h8v8H8z"/><path d="M6 10c0-3 2-5 6-5s6 2 6 5"/></svg></span><span>Wine Cellar</span></div></div></div>' });
        B('he-gallery', { label: 'Gallery', category: 'Property', media: s+'<rect x="2" y="2" width="8" height="8" rx="1"/><rect x="14" y="2" width="8" height="4" rx="1"/><rect x="2" y="14" width="4" height="8" rx="1"/><rect x="10" y="14" width="12" height="8" rx="1"/></svg>', content: '<div class="luxury-gallery-container" data-gallery-type="lookbook" style="max-width:1200px;margin:80px auto;padding:0 4%"><h3 style="font-size:1.4rem;font-weight:400;margin-bottom:32px;text-transform:uppercase;letter-spacing:0.08em">Gallery</h3><style>.luxury-gallery-container .gallery-lookbook{display:none}.luxury-gallery-container .gallery-filmstrip{display:none}.luxury-gallery-container .gallery-grid{display:none}.luxury-gallery-container[data-gallery-type=lookbook] .gallery-lookbook{display:grid!important}.luxury-gallery-container[data-gallery-type=filmstrip] .gallery-filmstrip{display:block!important}.luxury-gallery-container[data-gallery-type=grid] .gallery-grid{display:grid!important}.gallery-lookbook{background:#fcfbfa;padding:60px 5%;display:grid;grid-template-columns:repeat(12,1fr);gap:32px}.gallery-lookbook>div:nth-child(4n+1){grid-column:1/span 7}.gallery-lookbook>div:nth-child(4n+2){grid-column:9/span 4;margin-top:80px}.gallery-lookbook>div:nth-child(4n+3){grid-column:2/span 5;margin-top:-40px}.gallery-lookbook>div:nth-child(4n){grid-column:8/span 5;margin-top:50px}.gallery-lookbook img{width:100%;object-fit:cover;display:block}.gallery-filmstrip{background:#0d0d0d;padding:40px 0;overflow:hidden}.filmstrip-track{display:flex;gap:40px;overflow-x:auto;padding:20px 8%}.filmstrip-track>div{width:350px;aspect-ratio:3/4;overflow:hidden;background:#1a1a1a}.filmstrip-track img{width:100%;height:100%;object-fit:cover}.gallery-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px;padding:20px 4%}.gallery-grid img{width:100%;height:250px;object-fit:cover;border-radius:4px}</style><div class="gallery-lookbook"><div><img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80" /></div><div><img src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=600&q=80" /></div><div><img src="https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=600&q=80" /></div><div><img src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80" /></div></div><div class="gallery-filmstrip"><div class="filmstrip-track"><div><img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80" /></div><div><img src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=600&q=80" /></div><div><img src="https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=600&q=80" /></div></div></div><div class="gallery-grid"><img src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80" /><img src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=600&q=80" /><img src="https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=600&q=80" /><img src="https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80" /><img src="https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=600&q=80" /><img src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80" /></div></div>' });
        B('he-booking', { label: 'Booking Card', category: 'Property', media: s+'<rect x="2" y="4" width="20" height="16" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>', content: '<div class="luxury-booking-card" data-price="62515" data-currency="€" data-period="week" style="border:1px solid #eaeaea;border-radius:4px;padding:32px;box-shadow:0 10px 30px rgba(0,0,0,0.03);background:#fff;max-width:400px;margin:40px auto"><div style="font-size:0.85rem;text-transform:uppercase;letter-spacing:0.1em;color:#757575">Weekly Price From</div><div style="font-size:1.8rem;font-weight:500;color:#202020;margin:4px 0 24px">€62,515 <span style="font-size:0.9rem;font-weight:400;color:#757575">/ week</span></div><button style="width:100%;padding:16px;background-color:#202020;color:#fff;border:none;border-radius:2px;font-size:0.9rem;font-weight:600;letter-spacing:0.1em;text-transform:uppercase;cursor:pointer">Inquire</button></div>' });
        B('he-contact', { label: 'Contact', category: 'Property', media: s+'<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72"/></svg>', content: '<div style="max-width:600px;margin:40px auto;padding:0 4%;text-align:center"><h3 style="font-size:1.4rem;font-weight:400;margin-bottom:24px;text-transform:uppercase;letter-spacing:0.08em;font-family:Playfair Display,serif">Get In Touch</h3><p style="color:#4c4c4c;margin-bottom:8px">📍 123 Ocean Drive, Malibu, CA</p><p style="color:#4c4c4c;margin-bottom:8px">📞 +1 (310) 555-0123</p><p style="color:#4c4c4c">✉️ concierge@theluxuryestate.com</p></div>' });
        B('he-testimonials', { label: 'Testimonials', category: 'Property', media: s+'<path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2"/></svg>', content: '<div style="max-width:1200px;margin:60px auto;padding:0 4%"><h3 style="font-size:1.4rem;font-weight:400;margin-bottom:32px;text-transform:uppercase;letter-spacing:0.08em;text-align:center">Guest Reviews</h3><div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px"><div style="background:#fafafa;padding:24px;border-radius:8px"><p style="font-style:italic;color:#4c4c4c;line-height:1.6;font-size:0.95rem">&ldquo;An absolutely magical experience. The villa exceeded every expectation.&rdquo;</p><p style="font-weight:600;margin-top:16px;color:#202020">Elizabeth Mitchell</p></div><div style="background:#fafafa;padding:24px;border-radius:8px"><p style="font-style:italic;color:#4c4c4c;line-height:1.6;font-size:0.95rem">&ldquo;Pure perfection. From the private chef dinner to sunset yoga.&rdquo;</p><p style="font-weight:600;margin-top:16px;color:#202020">Sophie Laurent</p></div><div style="background:#fafafa;padding:24px;border-radius:8px"><p style="font-style:italic;color:#4c4c4c;line-height:1.6;font-size:0.95rem">&ldquo;The perfect family getaway. Kids loved the pool!&rdquo;</p><p style="font-weight:600;margin-top:16px;color:#202020">The Anderson Family</p></div></div></div>' });
        B('he-rules', { label: 'House Rules', category: 'Property', media: s+'<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12l2 2 4-4"/></svg>', content: '<div style="max-width:800px;margin:40px auto;padding:0 4%"><h3 style="font-size:1.4rem;font-weight:400;margin-bottom:24px;text-transform:uppercase;letter-spacing:0.08em">House Rules</h3><ul style="list-style:none;padding:0;color:#4c4c4c;line-height:2.2"><li>✓ Check-in: 4:00 PM - 10:00 PM</li><li>✓ Check-out: 11:00 AM</li><li>✓ No smoking indoors</li><li>✓ Pets considered on request</li><li>✓ Quiet hours after 10:00 PM</li><li>✓ Maximum 12 guests</li></ul></div>' });
        B('he-location', { label: 'Location', category: 'Property', media: s+'<path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>', content: '<div style="max-width:1200px;margin:60px auto;padding:0 4%"><h3 style="font-size:1.4rem;font-weight:400;margin-bottom:24px;text-transform:uppercase;letter-spacing:0.08em">Location</h3><div style="background:#f0f0f0;height:300px;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#757575;font-size:1.1rem"><span>📍 Amalfi Coast, Italy</span></div><div style="margin-top:24px;display:grid;grid-template-columns:repeat(2,1fr);gap:16px;color:#4c4c4c;font-size:0.95rem"><div><strong>Airport:</strong> Naples (40 min)</div><div><strong>Beach:</strong> 5 min walk</div></div></div>' });
        B('he-header', { label: 'Nav Header', category: 'Property', media: s+'<path d="M3 12h18M3 6h18M3 18h14"/></svg>', content: '<div style="display:flex;align-items:center;justify-content:space-between;padding:20px 4%;border-bottom:1px solid #eaeaea;background:#fff"><span style="font-family:Playfair Display,serif;font-size:1.25rem;font-weight:bold;color:#202020">The Luxury Estate</span><div style="display:flex;gap:24px;font-size:0.9rem;text-transform:uppercase;letter-spacing:0.08em;color:#757575"><span>The Villa</span><span>Amenities</span><span>Gallery</span></div></div>' });

        // ── Register component types with custom traits (properties panel) ──
        const DC = this.editor.DomComponents;
        DC.addType('he-gallery-component', {
          isComponent: (el: any) => el.classList && el.classList.contains('luxury-gallery-container'),
          model: {
            defaults: {
              traits: [
                {
                  type: 'select',
                  name: 'data-gallery-type',
                  label: 'Gallery Type',
                  options: [
                    { value: 'lookbook', name: 'Lookbook' },
                    { value: 'filmstrip', name: 'Filmstrip' },
                    { value: 'curtain', name: 'Curtain' },
                    { value: 'scatter', name: 'Scatter' },
                    { value: 'grid', name: 'Grid' },
                    { value: 'carousel', name: 'Carousel' },
                    { value: '3d-carousel', name: '3D Carousel' },
                    { value: 'isometric-grid', name: 'Isometric Grid' },
                    { value: 'masonry', name: 'Masonry' },
                    { value: 'ken-burns', name: 'Ken Burns' },
                    { value: 'accordion', name: 'Accordion' },
                    { value: 'parallax', name: 'Parallax' },
                    { value: 'polaroid', name: 'Polaroid' },
                  ],
                },
              ],
            },
          },
        });
        DC.addType('he-hero-component', {
          isComponent: (el: any) => el.classList && el.classList.contains('luxury-hero'),
          model: {
            defaults: {
              traits: [
                { type: 'text', name: 'data-hero-title', label: 'Title' },
                { type: 'text', name: 'data-hero-subtitle', label: 'Subtitle' },
                { type: 'text', name: 'data-hero-bg', label: 'Background URL' },
              ],
            },
          },
        });
        DC.addType('he-booking-component', {
          isComponent: (el: any) => el.classList && el.classList.contains('luxury-booking-card'),
          model: {
            defaults: {
              traits: [
                { type: 'number', name: 'data-price', label: 'Price' },
                { type: 'text', name: 'data-currency', label: 'Currency' },
                { type: 'select', name: 'data-period', label: 'Period', options: [{ value: 'night', name: 'Night' }, { value: 'week', name: 'Week' }] },
              ],
            },
          },
        });
        DC.addType('he-stats-component', {
          isComponent: (el: any) => el.classList && el.classList.contains('luxury-bar'),
          model: {
            defaults: {
              traits: [
                { type: 'number', name: 'data-guests', label: 'Guests' },
                { type: 'number', name: 'data-bedrooms', label: 'Bedrooms' },
                { type: 'number', name: 'data-bathrooms', label: 'Bathrooms' },
              ],
            },
          },
        });
        DC.addType('he-cta-component', {
          isComponent: (el: any) => el.tagName === 'DIV' && (el.textContent || '').includes('Book Now') && (el.textContent || '').includes('Ready to Experience'),
          model: {
            defaults: {
              traits: [
                { type: 'text', name: 'data-cta-title', label: 'Heading' },
                { type: 'text', name: 'data-cta-text', label: 'Body Text' },
                { type: 'text', name: 'data-cta-btn', label: 'Button Text' },
              ],
            },
          },
        });

        // ── Resizable right panel (views panel) ──
        // Clean up any stale resizer state
        document.querySelectorAll('.he-panel-resizer').forEach(e => e.remove());
        document.querySelectorAll('.he-resizer-handle').forEach(e => e.remove());

        setTimeout(() => {
          const viewsPanel = el.querySelector('.gjs-pn-views') as HTMLElement | null;
          console.log('[Resizer] viewsPanel found:', !!viewsPanel);
          if (!viewsPanel) return;

          // Ensure editor is positioned so absolute children reference it correctly
          const editorEl = el.querySelector('.gjs-editor') as HTMLElement | null;
          if (editorEl && editorEl.style.position !== 'relative' && editorEl.style.position !== 'absolute' && editorEl.style.position !== 'fixed') {
            editorEl.style.position = 'relative';
          }

          const viewsContainer = el.querySelector('.gjs-pn-views-container') as HTMLElement | null;
          const canvas = el.querySelector('.gjs-cv-canvas') as HTMLElement | null;
          console.log('[Resizer] viewsPanel:', !!viewsPanel, 'viewsContainer:', !!viewsContainer, 'canvas:', !!canvas);

          // Find toolbar panels (top-positioned panels with small height) to keep them from being overlapped
          const findToolbarPanels = (): HTMLElement[] => {
            const panels: HTMLElement[] = [];
            el.querySelectorAll('.gjs-pn-panel').forEach(p => {
              const panel = p as HTMLElement;
              if (panel.classList.contains('gjs-pn-views')) return;
              // Only panels near the top with small height = toolbar panels
              if (panel.offsetTop < 60 && panel.offsetHeight < 100) {
                panels.push(panel);
              }
            });
            return panels;
          };
          const toolbarPanels = findToolbarPanels();
          console.log('[Resizer] viewsPanel:', !!viewsPanel, 'toolbarPanels:', toolbarPanels.length);

          const setPanelWidth = (w: number) => {
            viewsPanel.style.setProperty('width', w + 'px', 'important');
            if (viewsContainer) viewsContainer.style.setProperty('width', w + 'px', 'important');
            if (canvas) {
              canvas.style.setProperty('width', 'auto', 'important');
              canvas.style.setProperty('right', w + 'px', 'important');
            }
            // Shrink toolbar panels so the sidebar doesn't cover them
            toolbarPanels.forEach(p => p.style.setProperty('right', w + 'px', 'important'));
            try { (this.editor as any).Panels?.getPanel?.('views')?.set?.('width', w); } catch (_) {}
          };

          // Restore saved width or use default
          const savedWidth = localStorage.getItem('he-editor-views-width');
          const defaultWidth = 340;
          const initialW = savedWidth ? parseInt(savedWidth, 10) : defaultWidth;
          setPanelWidth(initialW);
          viewsPanel.style.minWidth = '180px';
          viewsPanel.style.maxWidth = '55vw';

          // Create handle with ALL inline styles (no CSS dependency)
          const handle = document.createElement('div');
          handle.className = 'he-resizer-handle';

          const setHandleStyle = () => {
            if (!viewsPanel.isConnected) return;
            const vr = viewsPanel.getBoundingClientRect();
            handle.style.cssText = `
              position: fixed !important;
              left: ${vr.left}px !important;
              top: ${vr.top}px !important;
              width: 14px !important;
              height: ${vr.height}px !important;
              cursor: col-resize !important;
              z-index: 99999 !important;
              pointer-events: auto !important;
              border-left: 2px solid #D4AF37 !important;
              background: rgba(0,0,0,0.1) !important;
              margin: 0 !important;
              padding: 0 !important;
            `;
          };
          setHandleStyle();
          document.body.appendChild(handle);
          console.log('[Resizer] handle added to body');

          let isResizing = false;
          let startX = 0;
          let startWidth = 0;

          const onMouseDown = (e: MouseEvent) => {
            console.log('[Resizer] mousedown on handle');
            isResizing = true;
            startX = e.clientX;
            startWidth = viewsPanel.offsetWidth;
            handle.style.borderLeftColor = '#FFD700';
            handle.style.background = 'rgba(212,175,55,0.15)';
            document.body.style.cursor = 'col-resize';
            document.body.style.userSelect = 'none';
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
            e.preventDefault();
          };

          const onMouseMove = (e: MouseEvent) => {
            if (!isResizing) return;
            const delta = e.clientX - startX;
            const newWidth = startWidth - delta;
            const minPx = 180;
            const maxPx = Math.round(window.innerWidth * 0.55);
            const clamped = Math.max(minPx, Math.min(maxPx, newWidth));
            setPanelWidth(clamped);
            const vr = viewsPanel.getBoundingClientRect();
            handle.style.left = vr.left + 'px';
            try { (this.editor as any).Canvas.refresh({ all: true }); } catch (_) {}
          };

          const onMouseUp = () => {
            if (!isResizing) return;
            console.log('[Resizer] mouseup');
            isResizing = false;
            handle.style.borderLeftColor = '#D4AF37';
            handle.style.background = 'rgba(0,0,0,0.1)';
            document.body.style.cursor = '';
            document.body.style.userSelect = '';
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            localStorage.setItem('he-editor-views-width', String(viewsPanel.offsetWidth));
            try { (this.editor as any).Canvas.refresh({ all: true }); } catch (_) {}
          };

          handle.addEventListener('mousedown', onMouseDown);

          // Keep handle aligned on window resize
          const onWindowResize = () => {
            setHandleStyle();
            const current = viewsPanel.offsetWidth;
            const maxAllowed = Math.round(window.innerWidth * 0.55);
            if (current > maxAllowed) {
              viewsPanel.style.width = maxAllowed + 'px';
              try { (this.editor as any).Canvas.refresh({ all: true }); } catch (_) {}
            }
          };
          window.addEventListener('resize', onWindowResize);

          // Continuous repositioning for GrapesJS internal relayouts
          const repositionInterval = setInterval(() => {
            if (!viewsPanel.isConnected) {
              clearInterval(repositionInterval);
              return;
            }
            setHandleStyle();
          }, 500);

          // Clean up on editor destroy
          this.editor.on('destroy', () => {
            clearInterval(repositionInterval);
            window.removeEventListener('resize', onWindowResize);
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            handle.remove();
          });
        }, 1000);

        // ── Property Photos: add as a sector in the StyleManager (positioned below 'Extra') ──
        const PHOTOS_TYPE = 'he-photo-picker';
        let photosInputEl: HTMLElement | null = null;

        const isGalleryComponent = (cmp: any): boolean => {
          if (!cmp || typeof cmp.get !== 'function') return false;
          const selType = cmp.get('type') || '';
          const attrsCls = (cmp.get('attributes') || {}).class || '';
          const modelCls = cmp.get('class') || '';
          let classesCls = '';
          if (typeof cmp.getClasses === 'function') {
            const arr = cmp.getClasses();
            classesCls = Array.isArray(arr) ? arr.join(' ') : '';
          }
          const clsCombined = [attrsCls, modelCls, classesCls].filter(Boolean).join(' ');
          return selType.includes('gallery')
            || clsCombined.includes('luxury-gallery')
            || clsCombined.includes('gallery-')
            || clsCombined.includes('he-gallery');
        };

        const openPhotosDialog = (gallery: any) => {
          const photos = (this.store.photos() || []).slice();
          if (photos.length === 0) {
            this.store.setToastMessage('No property photos available. Upload via the property manager.');
            return;
          }

          // Pre-select images already used in the gallery (preserve order)
          const existingImgs: any[] = gallery.find?.('img') || [];
          const existingSrcs = existingImgs.map((img: any) => img.get?.('src') || '').filter((s: string) => s && !s.includes('base64') && !s.includes('placeholder') && !s.includes('unsplash'));
          const selectedSet = new Set<string>(existingSrcs);

          // DOM containers
          const backdrop = document.createElement('div');
          backdrop.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.7);z-index:99998;display:flex;align-items:center;justify-content:center';
          const dialog = document.createElement('div');
          dialog.style.cssText = 'background:#0f172a;color:#e2e8f0;border:1px solid #1e293b;border-radius:8px;width:min(900px,90vw);max-height:85vh;display:flex;flex-direction:column;box-shadow:0 20px 60px rgba(0,0,0,.6);font-family:inherit';
          dialog.addEventListener('click', (e) => e.stopPropagation());
          backdrop.appendChild(dialog);
          backdrop.addEventListener('click', () => backdrop.remove());
          document.body.appendChild(backdrop);

          // Header
          const header = document.createElement('div');
          header.style.cssText = 'padding:16px 20px;border-bottom:1px solid #1e293b;display:flex;align-items:center;justify-content:space-between';
          header.innerHTML = '<div><div style="font-size:15px;font-weight:600;color:#fff">Select photos</div><div style="font-size:12px;color:#94a3b8;margin-top:2px">Click to toggle selection</div></div>';
          const closeBtn = document.createElement('button');
          closeBtn.innerHTML = '×';
          closeBtn.style.cssText = 'background:transparent;border:none;color:#94a3b8;font-size:24px;cursor:pointer;line-height:1;padding:0 8px';
          closeBtn.addEventListener('click', () => backdrop.remove());
          header.appendChild(closeBtn);
          dialog.appendChild(header);

          // Toolbar
          const selCount = document.createElement('span');
          selCount.style.cssText = 'color:#D4AF37;font-weight:600';
          const clearBtn = document.createElement('button');
          clearBtn.textContent = 'Clear all';
          clearBtn.style.cssText = 'margin-left:auto;padding:4px 10px;background:transparent;color:#94a3b8;border:1px solid rgba(255,255,255,.1);border-radius:3px;font-size:11px;cursor:pointer';
          const toolbar = document.createElement('div');
          toolbar.style.cssText = 'padding:8px 20px;border-bottom:1px solid #1e293b;display:flex;align-items:center;gap:8px;font-size:12px;color:#94a3b8';
          toolbar.appendChild(selCount);
          toolbar.appendChild(clearBtn);
          dialog.appendChild(toolbar);

          // Grid
          const grid = document.createElement('div');
          grid.style.cssText = 'padding:16px 20px;display:grid;grid-template-columns:repeat(4,1fr);gap:8px;overflow-y:auto;flex:1;min-height:0';
          dialog.appendChild(grid);

          // Footer
          const applyBtn = document.createElement('button');
          applyBtn.style.cssText = 'padding:8px 20px;background:#D4AF37;color:#000;border:none;border-radius:4px;font-size:12px;font-weight:600;cursor:pointer';
          const cancelBtn = document.createElement('button');
          cancelBtn.textContent = 'Cancel';
          cancelBtn.style.cssText = 'padding:8px 16px;background:transparent;color:#94a3b8;border:1px solid rgba(255,255,255,.1);border-radius:4px;font-size:12px;cursor:pointer';
          const footer = document.createElement('div');
          footer.style.cssText = 'padding:12px 20px;border-top:1px solid #1e293b;display:flex;justify-content:flex-end;gap:8px';
          footer.appendChild(cancelBtn);
          footer.appendChild(applyBtn);
          dialog.appendChild(footer);

          // --- Behavior (all references now resolve) ---
          const updateLabels = () => {
            selCount.textContent = selectedSet.size + ' selected';
            applyBtn.textContent = 'Apply (' + selectedSet.size + ')';
          };

          const renderGrid = () => {
            grid.innerHTML = '';
            const selectedList = Array.from(selectedSet);
            photos.forEach((p: any) => {
              const isSel = selectedSet.has(p.url);
              const card = document.createElement('div');
              card.style.cssText = 'position:relative;aspect-ratio:1;border-radius:4px;overflow:hidden;cursor:pointer;border:2px solid ' + (isSel ? '#D4AF37' : 'transparent') + ';transition:all .15s;background:#0a1424';
              const img = document.createElement('img');
              img.src = p.url;
              img.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block';
              img.loading = 'lazy';
              card.appendChild(img);
              if (isSel) {
                const badge = document.createElement('div');
                badge.textContent = '✓';
                badge.style.cssText = 'position:absolute;top:4px;right:4px;background:#D4AF37;color:#000;border-radius:50%;width:22px;height:22px;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:bold;box-shadow:0 2px 4px rgba(0,0,0,.4)';
                card.appendChild(badge);
                const order = document.createElement('div');
                order.textContent = String(selectedList.indexOf(p.url) + 1);
                order.style.cssText = 'position:absolute;bottom:4px;left:4px;background:rgba(0,0,0,.8);color:#D4AF37;padding:2px 6px;border-radius:3px;font-size:10px;font-weight:700';
                card.appendChild(order);
              }
              card.addEventListener('click', () => {
                if (selectedSet.has(p.url)) selectedSet.delete(p.url);
                else selectedSet.add(p.url);
                renderGrid();
                updateLabels();
              });
              grid.appendChild(card);
            });
          };

          clearBtn.addEventListener('click', () => {
            selectedSet.clear();
            renderGrid();
            updateLabels();
          });

          cancelBtn.addEventListener('click', () => backdrop.remove());

          applyBtn.addEventListener('click', () => {
            const selected = photos.filter((p: any) => selectedSet.has(p.url)).map((p: any) => p.url);
            const imgs: any[] = gallery.find?.('img') || [];
            const empty = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
            for (let i = 0; i < imgs.length; i++) {
              if (i < selected.length) imgs[i].set('src', selected[i]);
              else imgs[i].set('src', empty);
            }
            backdrop.remove();
          });

          renderGrid();
          updateLabels();
        };

        const renderPhotosInto = async (wrap: HTMLElement) => {
          try {
            const sel = this.editor.getSelected();
            const isGallery = isGalleryComponent(sel);

            if (!isGallery) {
              wrap.innerHTML = '';
              return;
            }

            let photos = (this.store.photos() || []).slice();
            // Try repository for more complete photo list
            try {
              const fullProp = await this.repository.getPropertyByName(this.propertyName());
              if (fullProp?.property_photos?.length && fullProp.property_photos.length > photos.length) {
                photos = fullProp.property_photos.map((p: any) => ({ url: p.url, category: p.category || '' }));
              }
            } catch (_) {}
            console.log('[Photos] photos count:', photos.length, 'first url:', photos[0]?.url);
            const existingImgs: any[] = sel.find?.('img') || [];
            const existingSrcs = new Set(existingImgs.map((img: any) => img.get?.('src') || '').filter((s: string) => s && !s.includes('base64') && !s.includes('placeholder') && !s.includes('unsplash')));

            if (photos.length === 0) {
              wrap.innerHTML = '<div style="padding:8px;color:#64748b;font-size:11px">No photos loaded. Use property manager.</div>';
              return;
            }

            let html = '<div style="padding:8px"><label style="display:block;font-size:11px;color:#94a3b8;margin-bottom:4px">Select Photos</label><div style="max-height:200px;overflow-y:auto">';
            photos.forEach((p: any) => {
              const checked = existingSrcs.has(p.url) ? 'checked' : '';
              html += `<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
                <input type="checkbox" data-he-photo-check="${p.url}" ${checked} style="flex-shrink:0" />
                <img src="${p.url}" style="width:32px;height:32px;object-fit:cover;border-radius:3px;flex-shrink:0" />
                <input type="text" data-he-photo-caption="${p.url}" value="${(p.category || '').replace(/"/g,'&quot;')}" placeholder="Caption..." style="flex:1;min-width:0;background:#1e293b;border:1px solid #334155;border-radius:4px;padding:2px 6px;color:white;font-size:11px" />
              </div>`;
            });
            html += '</div></div>';

            // Store current state for event binding
            wrap.innerHTML = html;

            // Bind events
            const updateGallery = () => {
              const checkedCbs = wrap.querySelectorAll('[data-he-photo-check]:checked');
              const selected: { url: string; caption: string }[] = [];
              checkedCbs.forEach(cb => {
                const url = (cb as HTMLInputElement).getAttribute('data-he-photo-check') || '';
                const inp = wrap.querySelector(`[data-he-photo-caption="${url}"]`) as HTMLInputElement;
                selected.push({ url, caption: inp?.value || '' });
              });
              const imgs: any[] = sel.find?.('img') || [];
              const empty = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
              for (let i = 0; i < imgs.length; i++) {
                imgs[i].set('src', i < selected.length ? selected[i].url : empty);
              }
              sel.set('attributes', { ...sel.get('attributes'), 'data-gallery-photos': JSON.stringify(selected) });
            };
            wrap.querySelectorAll('[data-he-photo-check]').forEach(el => (el as HTMLInputElement).addEventListener('change', updateGallery));
            wrap.querySelectorAll('[data-he-photo-caption]').forEach(el => (el as HTMLInputElement).addEventListener('input', updateGallery));
          } catch (e) {
            console.warn('[Photos Sector] render error:', e);
          }
        };

        // Custom property type: renders a "Select photos" button
        try {
          this.editor.StyleManager.addType(PHOTOS_TYPE, {
            create() {
              const wrap = document.createElement('div');
              wrap.className = 'he-photo-picker';
              wrap.style.cssText = 'background:#0a1424;padding:0;';
              photosInputEl = wrap;
              renderPhotosInto(wrap);
              return wrap;
            },
          });
        } catch (e) {
          console.warn('[Photos Sector] addType failed:', e);
        }

        // Add sector to StyleManager — order 6 places it right after 'Extra' (order 5)
        try {
          this.editor.StyleManager.addSector('he-photos', {
            name: 'Photos',
            open: true,
            order: 6,
            properties: [{ type: PHOTOS_TYPE, name: 'picker' }],
          });
        } catch (e) {
          console.warn('[Photos Sector] addSector failed:', e);
        }

        // Re-render on selection change
        this.editor.on('component:selected', (cmp: any) => {
          setTimeout(() => {
            if (!photosInputEl || !photosInputEl.isConnected) {
              photosInputEl = document.querySelector('.he-photo-grid') as HTMLElement | null;
            }
            if (photosInputEl) renderPhotosInto(photosInputEl);
          }, 100);
          if (cmp && cmp.is && cmp.is('image')) {
            this.store.setToastMessage('Image selected — pick a photo from the 📷 Property Photos sector below.');
          }
          if (cmp && cmp.get && (cmp.get('class') || '').includes('luxury-gallery-container')) {
            this.store.setToastMessage('Gallery selected — pick photos from the 📷 Property Photos sector below.');
          }
        });

        // Periodic re-render (photos list may change; element may be re-created)
        setInterval(() => {
          if (!photosInputEl || !photosInputEl.isConnected) {
            photosInputEl = document.querySelector('.he-photo-grid') as HTMLElement | null;
          }
          if (photosInputEl) renderPhotosInto(photosInputEl);
        }, 3000);

        const populateAssetManager = () => {
          try {
            const list = this.store.photos() || [];
            const am = this.editor.AssetManager;
            if (!am) return;
            if (am && typeof am.getConfig === 'function') {
              const config = am.getConfig();
              if (config) config.upload = false;
            }
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

        this.editor.on('asset:open', () => {
          const list = this.store.photos() || [];
          if (list.length > 0) {
            populateAssetManager();
          }
        });

        // Gallery interactivity removed — GrapesJS editor intercepts all mouse events
        // for editing (selection, double-click → AssetManager). Interactive galleries
        // require deep integration with GrapesJS's event system which is beyond
        // quick fix scope. The gallery layouts work visually via pure CSS.

        // ── Replace template images with property photos and ensure gallery structures ─
        this.editor.on('component:mount', (cmp: any) => {
          const all = this.store.photos() || [];
          const cls = cmp.get('class') || '';
          if (cls.includes('luxury-gallery-container')) {
            // Prevent duplicate gallery structures
            if (cmp.get('data-gallery-structures-added')) return;
            cmp.set('data-gallery-structures-added', true);
            
            const photoUrls = all.length > 0 ? all.map((p: any) => p.url) : ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80'];
            // Use the same HTML generation as templates for consistency
            const fullHtml = this.generateGalleryInnerHtml(photoUrls);
            if (fullHtml) {
              const newComponents = cmp.append(fullHtml);
              // Mark all gallery children as non-interactive in editor
              const markNonInteractive = (children: any) => {
                if (Array.isArray(children)) {
                  children.forEach((c: any) => {
                    try { c.set('selectable', false); c.set('hoverable', false); c.set('clickable', false); c.set('draggable', false); } catch(e) {}
                    if (c.components && typeof c.components === 'function') {
                      markNonInteractive(c.components());
                    }
                  });
                } else if (children) {
                  try { children.set('selectable', false); children.set('hoverable', false); children.set('clickable', false); children.set('draggable', false); } catch(e) {}
                }
              };
              markNonInteractive(newComponents);
            }
          }
          if (all.length > 0) {
            let idx = 0;
            const walk = (c: any) => {
              if (c.is && c.is('image')) {
                const cur = c.get('src');
                if (!cur || cur.includes('unsplash') || cur.includes('placeholder')) {
                  c.set('src', all[idx % all.length].url);
                  idx++;
                }
              }
              if (c.components && typeof c.components === 'function') {
                c.components().forEach((child: any) => walk(child));
              }
            };
            walk(cmp);
          }
        });
        // Keep Asset Manager populated with property photos
        this.editor.on('component:update', (cmp: any) => {
          if (cmp.is && cmp.is('image')) {
            const list = this.store.photos() || [];
            if (list.length) {
              const am = this.editor.AssetManager;
              if (am) am.getAll().reset(list.map((p: any) => ({ type: 'image', src: p.url, name: p.category || 'Property Photo' })));
            }
          }
        });

        const savedMeta = this.store.pageConfig()?.grapesjsMeta;
        if (savedMeta && savedMeta.html) {
          this.initialListingMeta = { html: savedMeta.html, css: savedMeta.css || '' };
          try {
            this.editor.setComponents(savedMeta.html);
            if (savedMeta.css) {
              this.editor.setStyle(savedMeta.css);
            }
          } catch (e) {
            console.warn('[GrapesJS] Failed to load saved state:', e);
          }
        } else {
          try {
            const defaultHtml = `<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Sora:wght@100..800&display=swap" rel="stylesheet">
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
</div>`;
            this.editor.setStyle('');
            this.editor.setComponents(defaultHtml);
            this.initialListingMeta = { html: defaultHtml, css: '' };
          } catch (err) {
            console.warn('[GrapesJS] Failed to load default starting template:', err);
          }
        }
      });
    } catch (err) {
      console.error('[GrapesJS] Init failed:', err);
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



  preview(): void {
    if (!this.editor) return;
    try {
      const html = this.editor.getHtml() || '';
      const css = this.editor.getCss() || '';
      const propData = this.store.propertyData();
      const title = propData?.listing_title || propData?.name || 'Property Preview';

      const fullDoc = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — Preview</title>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Sora:wght@100..800&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; font-family: 'Sora', system-ui, sans-serif; color: #202020; background: #fff; line-height: 1.6; }
    ${css}
    .he-preview-back {
      position: fixed; top: 16px; right: 16px; z-index: 99999;
      background: rgba(0,0,0,0.85); color: #fff; padding: 8px 16px; border-radius: 8px;
      font-family: system-ui, sans-serif; font-size: 13px; text-decoration: none;
      border: 1px solid rgba(255,255,255,0.2);
    }
    .he-preview-back:hover { background: #1e293b; }
  </style>
  <style>${this.galleryCssText || ''}</style>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
  <a class="he-preview-back" href="javascript:window.close()">&larr; Close Preview</a>
  ${html}
  <script>
document.addEventListener('DOMContentLoaded', function(){
try{
  var injected = document.createElement('style');
  injected.textContent = '@keyframes heFadeIn{from{opacity:0}to{opacity:1}}';
  document.head.appendChild(injected);

  function showLightbox(src){
    if (!src) return;
    var ov = document.createElement('div');
    ov.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.95);display:flex;align-items:center;justify-content:center;cursor:zoom-out;animation:heFadeIn .2s';
    var close = document.createElement('button');
    close.innerHTML = '\\u2715';
    close.style.cssText = 'position:absolute;top:24px;right:32px;font-size:2.5rem;color:#fff;background:none;border:none;cursor:pointer;z-index:10;line-height:1';
    var img2 = document.createElement('img');
    img2.src = src;
    img2.style.cssText = 'max-width:90vw;max-height:85vh;object-fit:contain;border-radius:4px;box-shadow:0 20px 60px rgba(0,0,0,.5)';
    var lbl = document.createElement('div');
    lbl.textContent = 'Click anywhere to close';
    lbl.style.cssText = 'position:absolute;bottom:24px;left:0;right:0;text-align:center;color:rgba(255,255,255,.55);font-family:system-ui;font-size:13px;letter-spacing:.05em';
    ov.appendChild(close); ov.appendChild(img2); ov.appendChild(lbl);
    ov.addEventListener('click', function(){ ov.remove(); });
    close.addEventListener('click', function(e){ e.stopPropagation(); ov.remove(); });
    document.body.appendChild(ov);
  }

  // ── Click-to-lightbox for ALL images in the page ──
  var allImgs = document.querySelectorAll('img');
  allImgs.forEach(function(img){
    if (img.dataset.heLb) return;
    var src = img.getAttribute('src') || '';
    if (!src || src.indexOf('data:') === 0) return;
    img.dataset.heLb = '1';
    img.style.cursor = 'zoom-in';
    img.addEventListener('click', function(e){
      e.preventDefault();
      e.stopPropagation();
      showLightbox(this.src);
    });
  });

  // ── Scatter gallery: proper hover/click/zoom behavior ──
  var scatterContainer = document.querySelector('.gallery-scatter');
  if (scatterContainer) {
    // Find all "Photo N" text menu items
    var photoMenuItems = [];
    var allChildren = scatterContainer.querySelectorAll('div');
    allChildren.forEach(function(el){
      var text = (el.textContent || '').trim();
      if (/^Photo\\s+\\d+/.test(text) && el.children.length === 0 && el.offsetWidth > 0) {
        photoMenuItems.push(el);
      }
    });

    if (photoMenuItems.length > 0) {
      // Find the images in the scatter
      var scatterImgs = scatterContainer.querySelectorAll('img');
      var allScatterImgs = [];
      scatterImgs.forEach(function(img){ allScatterImgs.push(img.src); });

      // Create a preview panel on the right
      scatterContainer.style.display = 'grid';
      scatterContainer.style.gridTemplateColumns = '1fr 2fr';
      scatterContainer.style.gap = '32px';
      scatterContainer.style.padding = '60px 5%';
      scatterContainer.style.minHeight = '500px';
      scatterContainer.style.position = 'relative';
      scatterContainer.style.background = '#fcfbfa';

      // Create the preview area
      var previewArea = document.createElement('div');
      previewArea.className = 'scatter-preview';
      previewArea.style.cssText = 'position:relative;width:100%;height:100%;min-height:400px;display:flex;align-items:center;justify-content:center;background:#f0eeea;border-radius:8px;overflow:hidden';
      var previewImg = document.createElement('img');
      previewImg.style.cssText = 'max-width:100%;max-height:100%;object-fit:contain;display:none;border-radius:8px';
      previewImg.addEventListener('click', function(){ showLightbox(previewImg.src); });
      var placeholder = document.createElement('div');
      placeholder.textContent = '← Click a photo from the menu';
      placeholder.style.cssText = 'color:#8c8a87;font-family:system-ui;font-size:14px;font-style:italic';
      previewArea.appendChild(previewImg);
      previewArea.appendChild(placeholder);
      scatterContainer.appendChild(previewArea);

      // Style the menu items
      photoMenuItems.forEach(function(el, idx){
        el.style.cursor = 'pointer';
        el.style.padding = '10px 0';
        el.style.transition = 'color 0.2s, font-weight 0.2s';
        el.style.color = '#8c8a87';

        // HOVER: show vignette preview near the text
        el.addEventListener('mouseenter', function(e){
          el.style.color = '#1a1a1a';
          if (allScatterImgs[idx]) {
            var vignette = document.createElement('div');
            vignette.className = 'scatter-vignette';
            vignette.style.cssText = 'position:absolute;left:' + (el.offsetLeft + el.offsetWidth + 20) + 'px;top:' + (el.offsetTop) + 'px;width:200px;height:140px;background-size:cover;background-position:center;background-image:url(\"' + allScatterImgs[idx] + '\");border-radius:8px;box-shadow:0 10px 40px rgba(0,0,0,.25);z-index:1000;pointer-events:none;animation:heFadeIn .2s';
            el.parentNode.style.position = 'relative';
            el.appendChild(vignette);
          }
        });

        el.addEventListener('mouseleave', function(){
          el.style.color = '#8c8a87';
          var vig = el.querySelector('.scatter-vignette');
          if (vig) vig.remove();
        });

        // CLICK: display the photo in the preview area
        el.addEventListener('click', function(e){
          e.preventDefault();
          e.stopPropagation();
          // Highlight active menu item
          photoMenuItems.forEach(function(m){ m.style.color = '#8c8a87'; m.style.fontWeight = ''; });
          el.style.color = '#1a1a1a';
          el.style.fontWeight = '600';
          // Show the photo in the preview area
          if (allScatterImgs[idx]) {
            previewImg.src = allScatterImgs[idx];
            previewImg.style.display = 'block';
            previewImg.style.cursor = 'zoom-in';
            placeholder.style.display = 'none';
          }
        });
      });
    } else {
      // Simple scatter (CSS columns) - just add lightbox to all images
      scatterContainer.querySelectorAll('img').forEach(function(img){
        if (img.dataset.heLb) return;
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', function(e){
          e.preventDefault();
          showLightbox(this.src);
        });
      });
    }
  }

  // ── Draggable carousel ──
  var track = document.querySelector('.he-drag-track');
  if (track) {
    track.style.cursor = 'grab';
    var dX = 0, pp = 0;
    track.addEventListener('mousedown', function(e){ dX = e.clientX; track.style.cursor = 'grabbing'; e.preventDefault(); });
    track.addEventListener('touchstart', function(e){ dX = e.touches[0].clientX; }, {passive:true});
    var onUp = function(){ pp = parseFloat(track.dataset.pp || '0'); dX = 0; track.style.cursor = 'grab'; };
    var onMv = function(e){
      if (!dX) return;
      var cx = e.clientX || (e.touches && e.touches[0] && e.touches[0].clientX) || 0;
      var dx = dX - cx;
      var n = Math.max(Math.min(pp + (dx / (window.innerWidth / 2)) * -100, 0), -100);
      track.dataset.pp = n;
      track.style.transform = 'translateX(' + n + '%)';
      track.style.transition = 'transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94)';
    };
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchend', onUp);
    window.addEventListener('mousemove', onMv);
    window.addEventListener('touchmove', onMv, {passive:true});
  }

  // ── Curtain: add click feedback (images already get lightbox above) ──
  var curtainImgs = document.querySelectorAll('.gallery-curtain .he-lb-item');
  curtainImgs.forEach(function(el){
    el.style.cursor = 'pointer';
    el.addEventListener('mouseenter', function(){ this.style.transform = 'scale(1.02)'; this.style.transition = 'transform 0.3s'; });
    el.addEventListener('mouseleave', function(){ this.style.transform = 'scale(1)'; });
  });

  // ── 3D Carousel ──
  (function(){
    var stage = document.getElementById('carousel-stage');
    if (!stage) return;
    var items = stage.querySelectorAll('.carousel-item-3d');
    if (items.length === 0) return;
    var rotationY = 0, targetRotationY = 0;
    var radius = Math.max(280, Math.min(480, window.innerWidth * 0.35));
    var count = items.length;
    var angleStep = 360 / count;
    // Position items
    items.forEach(function(el, i){
      var a = i * angleStep;
      el.style.transform = 'rotateY(' + a + 'deg) translateZ(' + radius + 'px)';
    });
    function updateRotation(){
      rotationY += (targetRotationY - rotationY) * 0.15;
      stage.style.transform = 'rotateY(' + rotationY + 'deg)';
      items.forEach(function(card, idx){
        var cardAngle = idx * angleStep;
        var currentFront = (-rotationY) % 360;
        var diff = Math.abs((cardAngle - currentFront) % 360);
        if (diff > 180) diff = 360 - diff;
        if (diff < 15) { card.style.filter = 'none'; card.style.opacity = '1'; }
        else if (diff < 45) { card.style.filter = 'blur(1px) brightness(0.85)'; card.style.opacity = '0.9'; }
        else { card.style.filter = 'blur(3px) brightness(0.5)'; card.style.opacity = '0.6'; }
      });
      requestAnimationFrame(updateRotation);
    }
    updateRotation();
    var prevBtn = document.getElementById('carousel-prev');
    var nextBtn = document.getElementById('carousel-next');
    if (prevBtn) prevBtn.addEventListener('click', function(){ targetRotationY += angleStep; });
    if (nextBtn) nextBtn.addEventListener('click', function(){ targetRotationY -= angleStep; });
    // Drag
    var isDragging = false, startX = 0, lastRot = 0;
    function onStart(e){
      if (e.target.closest('.carousel-3d-stage') || e.target.closest('.carousel-controls')) {
        var pt = e.touches ? e.touches[0] : e;
        isDragging = true; startX = pt.pageX; lastRot = targetRotationY;
      }
    }
    function onMove(e){
      if (!isDragging) return;
      var pt = e.touches ? e.touches[0] : e;
      targetRotationY = lastRot + (pt.pageX - startX) * 0.45;
    }
    function onEnd(){ isDragging = false; }
    document.addEventListener('mousedown', onStart); document.addEventListener('mousemove', onMove); document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchstart', onStart, {passive:true}); document.addEventListener('touchmove', onMove, {passive:true}); document.addEventListener('touchend', onEnd, {passive:true});
    // Autoplay
    var playBtn = document.getElementById('carousel-play-pause');
    var isPlaying = false, autoTimer = null;
    if (playBtn) {
      playBtn.addEventListener('click', function(){
        isPlaying = !isPlaying;
        if (isPlaying) {
          autoTimer = setInterval(function(){ targetRotationY -= angleStep; }, 3500);
        } else {
          if (autoTimer) clearInterval(autoTimer);
        }
      });
      playBtn.click();
    }
  })();

  // ── Isometric Grid ──
  (function(){
    var grid = document.getElementById('iso-grid');
    var toggleBtn = document.getElementById('iso-toggle-angle-btn');
    if (!grid) return;
    grid.classList.add('active-3d');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', function(){
        var is3D = grid.classList.toggle('active-3d');
        var span = toggleBtn.querySelector('span');
        if (span) span.textContent = is3D ? 'Toggle Flat View' : 'Toggle 3D View';
      });
    }
  })();

  // ── Masonry ──
  (function(){
    var canvas = document.getElementById('masonry-canvas');
    if (!canvas) return;
    var filterContainer = document.getElementById('filter-tabs');
    var items = canvas.querySelectorAll('.masonry-item');
    var tagsSet = new Set();
    items.forEach(function(){
      // Simple masonry animation
    });
    if (filterContainer) {
      canvas.querySelectorAll('.masonry-item').forEach(function(el){ el.style.opacity = '1'; el.style.transform = 'translateY(0)'; });
      filterContainer.addEventListener('click', function(e){
        var target = e.target.closest('.filter-tab');
        if (!target) return;
        filterContainer.querySelectorAll('.filter-tab').forEach(function(t){ t.classList.remove('active'); });
        target.classList.add('active');
      });
    }
    // Add lightbox to masonry items
    canvas.querySelectorAll('.masonry-item').forEach(function(el, idx){
      el.addEventListener('click', function(){
        var imgs = el.querySelectorAll('img');
        if (imgs.length) showLightbox(imgs[0].src);
      });
    });
  })();

  // ── Ken Burns ──
  (function(){
    var slides = document.querySelectorAll('.ken-slide');
    if (!slides.length) return;
    var currentIdx = 0;
    var tagEl = document.getElementById('slide-tag');
    var titleEl = document.getElementById('slide-title');
    var descEl = document.getElementById('slide-desc');
    var progressBar = document.getElementById('slide-progress-bar');
    var isPlaying = true, progressStart = 0, progressElapsed = 0, animId = null;
    var duration = 3500;
    function changeSlide(idx){
      slides.forEach(function(s, i){
        s.classList.toggle('active', i === idx);
        var bullet = document.getElementById('bullet-' + i);
        if (bullet) bullet.classList.toggle('active', i === idx);
      });
      currentIdx = idx;
      resetProgress();
    }
    function nextKen(){
      changeSlide((currentIdx + 1) % slides.length);
    }
    function prevKen(){
      changeSlide((currentIdx - 1 + slides.length) % slides.length);
    }
    function animateProgress(timestamp){
      if (!progressStart) progressStart = timestamp;
      var elapsed = timestamp - progressStart + progressElapsed;
      var pct = Math.min((elapsed / duration) * 100, 100);
      if (progressBar) progressBar.style.width = pct + '%';
      if (pct >= 100) { nextKen(); }
      else if (isPlaying) { animId = requestAnimationFrame(animateProgress); }
    }
    function startProgress(){
      if (!isPlaying) return;
      progressStart = performance.now();
      animId = requestAnimationFrame(animateProgress);
    }
    function resetProgress(){
      if (animId) cancelAnimationFrame(animId);
      progressElapsed = 0; progressStart = 0;
      if (progressBar) progressBar.style.width = '0%';
      if (isPlaying) startProgress();
    }
    // Create bullets
    var bulletsContainer = document.querySelector('.slideshow-bullets');
    if (bulletsContainer) {
      bulletsContainer.innerHTML = '';
      slides.forEach(function(_, i){
        var dot = document.createElement('div');
        dot.className = 'bullet-dot' + (i === 0 ? ' active' : '');
        dot.id = 'bullet-' + i;
        dot.addEventListener('click', function(){ changeSlide(i); });
        bulletsContainer.appendChild(dot);
      });
    }
    var nextBtn = document.getElementById('slide-next');
    var prevBtn = document.getElementById('slide-prev');
    var playBtn = document.getElementById('slide-play-pause');
    if (nextBtn) nextBtn.addEventListener('click', nextKen);
    if (prevBtn) prevBtn.addEventListener('click', prevKen);
    if (playBtn) {
      playBtn.addEventListener('click', function(){
        isPlaying = !isPlaying;
        var playSvg = playBtn.querySelector('.play-svg');
        var pauseSvg = playBtn.querySelector('.pause-svg');
        if (playSvg) playSvg.style.display = isPlaying ? 'none' : '';
        if (pauseSvg) pauseSvg.style.display = isPlaying ? '' : 'none';
        if (isPlaying) startProgress();
        else if (animId) cancelAnimationFrame(animId);
      });
    }
    // Click slides for lightbox
    slides.forEach(function(s, i){
      s.addEventListener('click', function(){
        var imgs = s.querySelectorAll('img');
        if (imgs.length) showLightbox(imgs[0].src);
      });
    });
    startProgress();
  })();

  // ── Accordion ──
  (function(){
    var container = document.getElementById('accordion-container');
    if (!container) return;
    var panes = container.querySelectorAll('.accordion-pane');
    if (!panes.length) return;
    var autoTimer = null, activeIdx = 0;
    function selectPane(idx){
      panes.forEach(function(p, i){ p.classList.toggle('active', i === idx); });
      activeIdx = idx;
    }
    panes.forEach(function(p, i){
      p.addEventListener('mouseenter', function(){ selectPane(i); });
      p.addEventListener('click', function(){ selectPane(i); });
    });
    function startAccordionCycle(){
      autoTimer = setInterval(function(){
        selectPane((activeIdx + 1) % panes.length);
      }, 3500);
    }
    container.addEventListener('mouseenter', function(){ if (autoTimer) clearInterval(autoTimer); });
    container.addEventListener('mouseleave', function(){ startAccordionCycle(); });
    startAccordionCycle();
  })();

  // ── Parallax ──
  (function(){
    var viewport = document.getElementById('strip-viewport');
    if (!viewport) return;
    var gridEl = document.getElementById('strip-grid');
    if (!gridEl) return;
    var scrollBar = document.getElementById('strip-bar');
    var isMoving = false, gridStartX = 0, gridScrollLeft = 0, gridCurrentX = 0, maxScroll = 0;
    function recalcBounds(){
      maxScroll = Math.max(0, gridEl.scrollWidth - viewport.clientWidth);
      updateIndicator(0);
    }
    function updateIndicator(offset){
      if (maxScroll <= 0) return;
      var ratio = Math.min(1, Math.max(0, -offset / maxScroll));
      var maxBar = 150 - (150 * 0.25);
      if (scrollBar) scrollBar.style.transform = 'translateX(' + (ratio * maxBar) + 'px)';
      var imgs = gridEl.querySelectorAll('.strip-card-image-box img');
      imgs.forEach(function(img){
        var rect = img.parentElement.getBoundingClientRect();
        var viewCenter = window.innerWidth / 2;
        var cardCenter = rect.left + rect.width / 2;
        var drift = (cardCenter - viewCenter) / window.innerWidth * -45;
        img.style.transform = 'translateX(' + drift + 'px)';
      });
    }
    function onStart(e){
      isMoving = true;
      gridStartX = e.pageX || (e.touches && e.touches[0].pageX);
      gridScrollLeft = gridCurrentX;
      viewport.style.cursor = 'grabbing';
    }
    function onMove(e){
      if (!isMoving) return;
      var x = e.pageX || (e.touches && e.touches[0].pageX);
      var walk = (x - gridStartX) * 1.5;
      var target = gridScrollLeft + walk;
      if (target > 0) target = 0;
      if (target < -maxScroll) target = -maxScroll;
      gridCurrentX = target;
      gridEl.style.transform = 'translateX(' + gridCurrentX + 'px)';
      updateIndicator(gridCurrentX);
    }
    function onEnd(){ isMoving = false; viewport.style.cursor = 'grab'; }
    viewport.addEventListener('mousedown', onStart);
    viewport.addEventListener('mousemove', onMove);
    viewport.addEventListener('mouseup', onEnd);
    viewport.addEventListener('mouseleave', onEnd);
    viewport.addEventListener('touchstart', onStart, {passive:true});
    viewport.addEventListener('touchmove', onMove, {passive:true});
    viewport.addEventListener('touchend', onEnd, {passive:true});
    setTimeout(recalcBounds, 100);
    window.addEventListener('resize', recalcBounds);
    // Autoplay
    var isForward = true;
    setInterval(function(){
      if (isMoving) return;
      if (isForward) {
        gridCurrentX -= 1.5;
        if (gridCurrentX <= -maxScroll) { gridCurrentX = -maxScroll; isForward = false; }
      } else {
        gridCurrentX += 1.5;
        if (gridCurrentX >= 0) { gridCurrentX = 0; isForward = true; }
      }
      gridEl.style.transform = 'translateX(' + gridCurrentX + 'px)';
      updateIndicator(gridCurrentX);
    }, 16);
  })();

  // ── Polaroid ──
  (function(){
    var desk = document.getElementById('polaroid-desk');
    var pile = document.getElementById('polaroid-pile');
    var reshuffleBtn = document.getElementById('polaroid-reshuffle-btn');
    if (!pile) return;
    var cards = pile.querySelectorAll('.polaroid-card');
    if (!cards.length) return;
    var activeIdx = -1;
    function scatterCards(){
      var dW = desk ? desk.clientWidth : window.innerWidth;
      var dH = desk ? desk.clientHeight : 600;
      cards.forEach(function(card, i){
        if (i === activeIdx) return;
        var x = 20 + Math.random() * (Math.max(20, dW - 210 - 20) - 20);
        var y = 60 + Math.random() * (Math.max(60, dH - 265 - 20) - 60);
        var rot = (Math.random() * 30) - 15;
        card.classList.remove('focused');
        card.style.left = x + 'px';
        card.style.top = y + 'px';
        card.style.transform = 'rotate(' + rot + 'deg)';
        card.style.zIndex = Math.floor(Math.random() * 40) + 10;
      });
    }
    function selectPolaroid(idx){
      if (activeIdx !== -1) {
        var old = document.getElementById(pile.querySelectorAll('.polaroid-card')[activeIdx]?.id);
        if (old) old.classList.remove('focused');
      }
      activeIdx = idx;
      var activeCard = cards[idx];
      if (!activeCard) return;
      scatterCards();
      var dW = desk ? desk.clientWidth : window.innerWidth;
      var dH = desk ? desk.clientHeight : 600;
      var cx = (dW / 2) - 105;
      var cy = (dH / 2) - 132 + 10;
      activeCard.classList.add('focused');
      activeCard.style.left = cx + 'px';
      activeCard.style.top = cy + 'px';
      activeCard.style.transform = 'scale(1.3) rotate(0deg)';
      activeCard.style.zIndex = 2000;
    }
    cards.forEach(function(card, i){
      card.addEventListener('click', function(e){
        e.stopPropagation();
        if (activeIdx === i) {
          var imgs = card.querySelectorAll('img');
          if (imgs.length) showLightbox(imgs[0].src);
        } else {
          selectPolaroid(i);
        }
      });
    });
    if (desk) {
      desk.addEventListener('click', function(){
        if (activeIdx !== -1) {
          var ac = cards[activeIdx];
          if (ac) ac.classList.remove('focused');
          activeIdx = -1;
          scatterCards();
        }
      });
    }
    if (reshuffleBtn) {
      reshuffleBtn.addEventListener('click', function(e){
        e.stopPropagation();
        activeIdx = -1;
        scatterCards();
      });
    }
    scatterCards();
  })();
}catch(e){console.error('[Preview] Gallery JS error:', e);}
});
  </script>
</body>
</html>`;

      const blob = new Blob([fullDoc], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const win = window.open(url, '_blank');
      if (!win) {
        alert('Please allow popups to use the preview feature.');
      }
      setTimeout(() => URL.revokeObjectURL(url), 120000);
    } catch (err) {
      console.error('[Preview] Failed:', err);
      alert('Failed to generate preview: ' + (err instanceof Error ? err.message : err));
    }
  }

  async save(): Promise<void> {
    if (!this.editor) return;
    try {
      const html = this.editor.getHtml();
      const css = this.editor.getCss();

      const currentTemplate = this.editingTemplate();
      if (currentTemplate) {
        const updatedTemplate: SavedTemplate = {
          ...currentTemplate,
          html,
          css,
          updated_at: new Date().toISOString(),
        };
        const result = await this.store.updateTemplate(updatedTemplate);
        if (result) {
          this.editingTemplate.set(null);
          this.store.setToastMessage('Template saved successfully!');
        }
        return;
      }

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
      alert('Failed to save changes: ' + (err instanceof Error ? err.message : err));
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
.luxury-gallery-container .gallery-lookbook, .luxury-gallery-container .gallery-filmstrip, .luxury-gallery-container .gallery-curtain, .luxury-gallery-container .gallery-scatter, .luxury-gallery-container .gallery-3d-carousel, .luxury-gallery-container .gallery-isometric-grid, .luxury-gallery-container .gallery-masonry, .luxury-gallery-container .gallery-ken-burns, .luxury-gallery-container .gallery-accordion, .luxury-gallery-container .gallery-parallax, .luxury-gallery-container .gallery-polaroid { display: none !important; }
.luxury-gallery-container[data-gallery-type="lookbook"] .gallery-lookbook { display: grid !important; }
.luxury-gallery-container[data-gallery-type="filmstrip"] .gallery-filmstrip { display: block !important; }
.luxury-gallery-container[data-gallery-type="curtain"] .gallery-curtain { display: block !important; }
.luxury-gallery-container[data-gallery-type="scatter"] .gallery-scatter { display: block !important; }
.luxury-gallery-container[data-gallery-type="3d-carousel"] .gallery-3d-carousel { display: block !important; }
.luxury-gallery-container[data-gallery-type="isometric-grid"] .gallery-isometric-grid { display: block !important; }
.luxury-gallery-container[data-gallery-type="masonry"] .gallery-masonry { display: block !important; }
.luxury-gallery-container[data-gallery-type="ken-burns"] .gallery-ken-burns { display: block !important; }
.luxury-gallery-container[data-gallery-type="accordion"] .gallery-accordion { display: block !important; }
.luxury-gallery-container[data-gallery-type="parallax"] .gallery-parallax { display: block !important; }
.luxury-gallery-container[data-gallery-type="polaroid"] .gallery-polaroid { display: block !important; }
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
    const curtainHtml = `<div class="gallery-curtain"><div class="curtain-container">${curtainSlides}<div class="curtain-controls"><button class="curtain-btn" onclick="var s=this.closest('.curtain-container').querySelectorAll('.curtain-slide');var a=Array.from(s).findIndex(x=>x.classList.contains('active'));s[a].classList.remove('active');var n=(a+1)%s.length;s[n].classList.add('active');">Next</button></div></div></div>`;
    
    const scatterHtml = `<div class="gallery-scatter" data-photos='${photosJson}' onmousemove="
      
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

    const count = Math.min(photos.length, 20);
    const carouselItems = photos.slice(0, count).map((src, i) => {
      const angle = i * (360 / Math.min(count, photos.length));
      return `<div class="carousel-item-3d" style="transform:rotateY(${angle}deg) translateZ(280px)"><img src="${src}" /><div class="card-meta"><span class="card-tag">Photo</span><h4 class="card-title">Photo ${i + 1}</h4></div></div>`;
    }).join('');
    const carousel3dHtml = `<div class="gallery-3d-carousel"><div class="carousel-perspective"><div class="carousel-3d-stage" id="carousel-stage">${carouselItems}</div><div class="carousel-controls"><button class="control-btn" id="carousel-prev">&#10094;</button><button class="control-btn play-pause-btn" id="carousel-play-pause"><svg class="play-icon" viewBox="0 0 24 24" width="16" height="16"><path d="M8 5v14l11-7z" fill="currentColor"/></svg><svg class="pause-icon" viewBox="0 0 24 24" width="16" height="16" style="display:none"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" fill="currentColor"/></svg></button><button class="control-btn" id="carousel-next">&#10095;</button></div><div class="carousel-hint">Drag or swipe to spin</div></div></div>`;

    const isoCards = photos.slice(0, count).map(src => `
      <div class="iso-card"><img src="${src}" class="iso-card-image" /><div class="iso-card-overlay"><span class="iso-tag">Photo</span><h4 class="iso-title">Photo</h4></div></div>
    `).join('');
    const isometricHtml = `<div class="gallery-isometric-grid"><div class="iso-workspace"><div class="iso-controls"><div class="iso-hint">Hover cards for 3D elevation</div><button class="iso-toggle-btn" id="iso-toggle-angle-btn"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"/></svg><span>Toggle 3D View</span></button></div><div class="iso-stage"><div class="iso-grid active-3d" id="iso-grid">${isoCards}</div></div></div></div>`;

    const masonryItems = photos.slice(0, count).map(src => `
      <div class="masonry-item"><img src="${src}" /><div class="masonry-overlay"><span class="masonry-meta-tag">Photo</span><h4 class="masonry-meta-title">Photo</h4></div></div>
    `).join('');
    const masonryHtml = `<div class="gallery-masonry"><div class="masonry-wrapper-field"><div class="filter-toolbar" id="filter-tabs"><button class="filter-tab active" data-filter="all">All</button></div><div class="masonry-grid-canvas" id="masonry-canvas">${masonryItems}</div></div></div>`;

    const kenSlides = photos.slice(0, count).map((src, i) => `
      <div class="ken-slide ${i === 0 ? 'active' : ''}" id="slide-${i}"><img src="${src}" /></div>
    `).join('');
    const kenBurnsHtml = `<div class="gallery-ken-burns"><div class="slideshow-stage-ken"><div class="slideshow-canvas" id="slideshow-canvas">${kenSlides}</div><div class="slideshow-overlay-card"><span class="slideshow-cat" id="slide-tag">Photo</span><h2 class="slideshow-headline" id="slide-title">Photo</h2><p class="slideshow-synopsis" id="slide-desc">Property photo</p><div class="slideshow-action-bar"><button class="action-btn prev-btn" id="slide-prev">&#10094;</button><button class="action-btn action-circle-btn" id="slide-play-pause"><svg class="play-svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M8 5v14l11-7z"/></svg><svg class="pause-svg" viewBox="0 0 24 24" width="20" height="20" fill="currentColor" style="display:none"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg></button><button class="action-btn next-btn" id="slide-next">&#10095;</button></div></div><div class="slideshow-progress-track"><div class="slideshow-progress-bar" id="slide-progress-bar"></div></div><div class="slideshow-bullets" id="slide-bullets"></div></div></div>`;

    const accordionPanes = photos.slice(0, count).map((src, i) => `
      <div class="accordion-pane ${i === 0 ? 'active' : ''}"><img src="${src}" /><div class="pane-shroud"></div><div class="pane-text-card"><span class="pane-tag">Photo</span><h4 class="pane-title">Photo ${i + 1}</h4></div><span class="pane-collapsed-line">Photo ${i + 1}</span></div>
    `).join('');
    const accordionHtml = `<div class="gallery-accordion"><div class="accordion-container" id="accordion-container">${accordionPanes}</div></div>`;

    const parallaxCards = photos.slice(0, count).map((src, i) => `
      <div class="strip-card"><div class="strip-card-image-box"><img src="${src}" /></div><div class="strip-card-overlay"><span class="strip-tag">Photo</span><h4 class="strip-title">Photo ${i + 1}</h4></div></div>
    `).join('');
    const parallaxHtml = `<div class="gallery-parallax"><div class="parallax-strip-viewport" id="strip-viewport"><div class="parallax-strip-grid" id="strip-grid">${parallaxCards}</div><div class="strip-footer"><div class="strip-hint">Drag horizontally</div><div class="strip-scroll-track"><div class="strip-scroll-bar" id="strip-bar"></div></div></div></div></div>`;

    const polaroidCards = photos.slice(0, count).map((src, i) => `
      <div class="polaroid-card"><img src="${src}" /><div class="polaroid-text-pane"><div class="polaroid-card-title">Photo ${i + 1}</div></div></div>
    `).join('');
    const polaroidHtml = `<div class="gallery-polaroid"><div class="polaroid-desk" id="polaroid-desk"><div class="polaroid-desk-header"><div class="polaroid-desk-hint">Click photo to focus</div><button class="reshuffle-btn" id="polaroid-reshuffle-btn"><svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.656 48.656 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3"/></svg>Reshuffle</button></div><div class="polaroid-pile" id="polaroid-pile">${polaroidCards}</div></div></div>`;

    return `${styleBlock}${lookbookHtml}${filmstripHtml}${curtainHtml}${scatterHtml}${carousel3dHtml}${isometricHtml}${masonryHtml}${kenBurnsHtml}${accordionHtml}${parallaxHtml}${polaroidHtml}`;
  }

  private getAmenityIcon(name: string): string {
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
  }

  private iconSvgMap: Record<string, string> = {
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
    beach: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 18h20"/><path d="M3 14c1-1 2-1 3 0s2 1 3 0 2-1 3 0 2-1 3 0 2-1 3 0 2-1 3 0 2-1 3 0"/><path d="M12 2L2 18"/></svg>',
    default: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>',
  };

  private getIconSvg(symbol: string): string {
    return this.iconSvgMap[symbol] || this.iconSvgMap['default'];
  }

  async mapTemplateToPropertyData(html: string, css: string): Promise<{ html: string; css: string }> {
    const propData = this.store.propertyData();
    const photos = this.store.photos() || [];
    const fullProp = await this.repository.getPropertyByName(this.propertyName());
    const equipments = fullProp?.property_equipments || [];

    const title = propData?.listing_title || propData?.name || 'The Luxury Estate';
    const location = propData?.address || 'Location, Country';
    const description = propData?.listing_description || 'This prestigious property blends refined luxury with serene surroundings...';
    const coverImage = propData?.cover_image_url || (photos.length > 0 ? photos[0].url : 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1200&q=80');
    const guestsVal = String(propData?.max_guests || 12);
    const bedroomsVal = String(propData?.bedrooms || 6);
    const bathroomsVal = String(propData?.bathrooms || 6);

    const hasPool = equipments.some((eq: any) => eq.name.toLowerCase().includes('pool') || eq.name.toLowerCase().includes('piscine'));
    const hasSpa = equipments.some((eq: any) => eq.name.toLowerCase().includes('spa') || eq.name.toLowerCase().includes('sauna') || eq.name.toLowerCase().includes('hammam') || eq.name.toLowerCase().includes('jacuzzi'));
    const poolStatus = hasPool ? 'Heated' : 'No';
    const spaStatus = hasSpa ? 'Yes' : 'No';

    // 1. Parse HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // 2. Map Headings / Titles
    const h1s = doc.querySelectorAll('h1');
    h1s.forEach(h1 => {
      h1.textContent = title;
    });

    const titleElements = doc.querySelectorAll('.brand, .hero-title, .luxury-hero-title, .serenity-hero-title, .serenity-brand');
    titleElements.forEach(el => {
      el.textContent = title;
    });

    // 3. Map Subtitles / Locations
    const subtitleElements = doc.querySelectorAll('.luxury-hero-subtitle, .serenity-hero-subtitle, .hero-loc, .section-tag');
    subtitleElements.forEach(el => {
      const txt = el.textContent || '';
      if (/Amalfi Coast|Italy|Location|Country/i.test(txt) || el.classList.contains('hero-loc') || el.classList.contains('luxury-hero-subtitle')) {
        el.textContent = location;
      }
    });

    // 4. Map Description
    const descElements = doc.querySelectorAll('.luxury-story-text, .serenity-desc, .ov-desc');
    descElements.forEach(el => {
      el.textContent = description;
    });
    if (descElements.length === 0) {
      const ps = Array.from(doc.querySelectorAll('p'));
      if (ps.length > 0) {
        let longestP = ps[0];
        ps.forEach(p => {
          if ((p.textContent || '').length > (longestP.textContent || '').length) {
            longestP = p;
          }
        });
        if ((longestP.textContent || '').length > 40) {
          longestP.textContent = description;
        }
      }
    }

    // 5. Map Stats / Bar Characteristics
    const allElements = doc.querySelectorAll('span, div, p, strong, td, th');
    allElements.forEach(el => {
      const text = el.textContent || '';
      if (/guests/i.test(text)) {
        const strong = el.querySelector('strong');
        if (strong) strong.textContent = guestsVal;
      }
      if (/bedrooms/i.test(text)) {
        const strong = el.querySelector('strong');
        if (strong) strong.textContent = bedroomsVal;
      }
      if (/bathrooms/i.test(text)) {
        const strong = el.querySelector('strong');
        if (strong) strong.textContent = bathroomsVal;
      }
      if (/pool/i.test(text)) {
        const strong = el.querySelector('strong');
        if (strong) strong.textContent = poolStatus;
      }
      if (/spa/i.test(text)) {
        const strong = el.querySelector('strong');
        if (strong) strong.textContent = spaStatus;
      }
    });

    // Handle serenity-stats style explicitly
    const statVals = doc.querySelectorAll('.serenity-stat-val');
    statVals.forEach(val => {
      const lbl = val.nextElementSibling;
      if (lbl && lbl.classList.contains('serenity-stat-lbl')) {
        const txt = lbl.textContent || '';
        if (/guests/i.test(txt)) val.textContent = guestsVal;
        if (/bedrooms/i.test(txt)) val.textContent = bedroomsVal;
        if (/bathrooms/i.test(txt)) val.textContent = bathroomsVal;
      }
    });

    // 6. Map Images (src attribute)
    const imgs = doc.querySelectorAll('img');
    imgs.forEach((img, idx) => {
      const src = img.getAttribute('src') || '';
      if (src.startsWith('data:image/svg+xml') || src.endsWith('.svg') || src.includes('/icons/')) {
        return;
      }
      if (photos.length > 0) {
        img.setAttribute('src', photos[idx % photos.length].url);
      }
    });

    // 7. Map inline element style background images
    const elementsWithStyle = doc.querySelectorAll('[style]');
    elementsWithStyle.forEach(el => {
      const style = el.getAttribute('style') || '';
      if (/background(-image)?:\s*url\(/i.test(style)) {
        const newStyle = style.replace(/url\(['"]?[^'")]+['"]?\)/gi, `url('${coverImage}')`);
        el.setAttribute('style', newStyle);
      }
    });

    // 8. Map Dynamic Amenities Grid
    let amenitiesHtml = '';
    if (equipments.length > 0) {
      amenitiesHtml = equipments.map((eq: any) => {
        const symbol = this.getAmenityIcon(eq.name);
        const svgContent = this.getIconSvg(symbol);
        return '<div class="luxury-amenity-item"><span class="luxury-amenity-icon" data-icon-family="outline" data-icon-symbol="' + symbol + '">' + svgContent + '</span><span>' + eq.name + '</span></div>';
      }).join('\n');
    } else {
      const symbols = ['pool', 'spa', 'cinema', 'wine', 'gym', 'ac'];
      const labels = ['Heated Swimming Pool', 'Spa, Hammam & Sauna', 'Private Cinema Room', 'Cigar Room & Bar', 'Fitness Room', 'Air Conditioning'];
      amenitiesHtml = symbols.map((s, i) => '<div class="luxury-amenity-item"><span class="luxury-amenity-icon" data-icon-family="outline" data-icon-symbol="' + s + '">' + this.getIconSvg(s) + '</span><span>' + labels[i] + '</span></div>').join('\n');
    }

    const luxuryAmenitiesGrid = doc.querySelector('.luxury-amenities-grid');
    if (luxuryAmenitiesGrid) {
      luxuryAmenitiesGrid.innerHTML = amenitiesHtml;
    }

    const amGrid = doc.querySelector('.am-grid');
    if (amGrid && equipments.length > 0) {
      const serenityAmenitiesHtml = equipments.map((eq: any) => {
        const symbol = this.getAmenityIcon(eq.name);
        const svgContent = this.getIconSvg(symbol);
        return `<div class="am-card"><div class="am-icon">${svgContent}</div><h3 class="am-title">${eq.name}</h3><p class="am-desc">Premium quality property amenity</p></div>`;
      }).join('\n');
      amGrid.innerHTML = serenityAmenitiesHtml;
    }

    // 9. Map Gallery Container
    const luxuryGallery = doc.querySelector('.luxury-gallery-container');
    if (luxuryGallery && photos.length > 0) {
      const newGalleryHtml = this.generateGalleryHtml(this.galleryMode(), photos.map(p => p.url));
      const tempDiv = doc.createElement('div');
      tempDiv.innerHTML = newGalleryHtml;
      if (tempDiv.firstElementChild) {
        luxuryGallery.parentNode?.replaceChild(tempDiv.firstElementChild, luxuryGallery);
      }
    }

    const galGrid = doc.querySelector('.gal-grid');
    if (galGrid && photos.length > 0) {
      const displayPhotos = photos.map(p => p.url);
      const villaPhotos = displayPhotos.length >= 6 ? displayPhotos.slice(0, 6) : [...displayPhotos, 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80'];
      const htmlContent = villaPhotos.map((u, i) => '<div class="gal-item' + (i === 0 ? ' featured' : '') + '"><img src="' + u + '" alt="Photo ' + (i+1) + '" loading="lazy" /></div>').join('');
      galGrid.innerHTML = htmlContent;
    }

    // 10. Map Price HTML Block in luxury booking card
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

    const bookingCard = doc.querySelector('.luxury-booking-card');
    if (bookingCard) {
      const priceLabel = bookingCard.querySelector('.luxury-price-label');
      const priceVal = bookingCard.querySelector('.luxury-price');
      if (priceLabel && priceVal) {
        if (priceAmount > 0) {
          if (pricePeriod === 'night') {
            const weeklyPrice = priceAmount * 7;
            priceLabel.textContent = 'Weekly Price From';
            priceVal.innerHTML = priceCurrency + weeklyPrice.toLocaleString() + ' <span style="font-size:0.9rem; font-weight:400; color:#757575;">/ week</span>';
            let subtext = bookingCard.querySelector('.luxury-price-subtext');
            if (!subtext) {
              subtext = doc.createElement('div');
              subtext.className = 'luxury-price-subtext';
              subtext.setAttribute('style', 'font-size: 0.8rem; color: #757575; margin-top: -16px; margin-bottom: 24px; text-align: center;');
              priceVal.parentNode?.insertBefore(subtext, priceVal.nextSibling);
            }
            subtext.textContent = `(${priceCurrency}${priceAmount.toLocaleString()} / night)`;
          } else {
            priceLabel.textContent = `${pricePeriod === 'week' ? 'Weekly' : 'Stay'} Price From`;
            priceVal.innerHTML = priceCurrency + priceAmount.toLocaleString() + ' <span style="font-size:0.9rem; font-weight:400; color:#757575;">/ ' + pricePeriod + '</span>';
            bookingCard.querySelector('.luxury-price-subtext')?.remove();
          }
        }
      }
    }

    // 11. CSS background-image updates
    let mappedCss = css;
    mappedCss = mappedCss.replace(/url\(['"]?([^'")]+)['"]?\)/gi, (match, url) => {
      if (url.startsWith('data:') || url.endsWith('.woff') || url.endsWith('.woff2') || url.endsWith('.ttf') || url.endsWith('.svg')) {
        return match;
      }
      return `url('${coverImage}')`;
    });

    const bodyContent = doc.body ? doc.body.innerHTML : doc.documentElement.innerHTML;

    return {
      html: bodyContent,
      css: mappedCss
    };
  }
}
