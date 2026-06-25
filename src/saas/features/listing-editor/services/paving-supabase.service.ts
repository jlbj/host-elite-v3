import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '../../../../supabase.config';
import type { PropertyData, PropertyPhoto, SavedTemplate } from '../models/paving.types';

export interface ListingLayout {
  id: string;
  name: string;
  type: 'predefined' | 'custom';
  grid_blocks: unknown;
  section_assignments: unknown;
  owner_id?: string;
  created_at: string;
}

class IndexedDbHelper {
  private dbPromise: Promise<IDBDatabase> | null = null;

  constructor() {
    if (typeof window !== 'undefined' && window.indexedDB) {
      this.dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open('host-elite-templates-db', 1);
        request.onupgradeneeded = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains('keyvalue')) {
            db.createObjectStore('keyvalue');
          }
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }
  }

  async getItem(key: string): Promise<string | null> {
    if (!this.dbPromise) return null;
    try {
      const db = await this.dbPromise;
      return new Promise<string | null>((resolve, reject) => {
        const tx = db.transaction('keyvalue', 'readonly');
        const store = tx.objectStore('keyvalue');
        const req = store.get(key);
        req.onsuccess = () => resolve(req.result || null);
        req.onerror = () => reject(req.error);
      });
    } catch (e) {
      console.warn('IndexedDB getItem failed:', e);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    if (!this.dbPromise) throw new Error('IndexedDB not supported');
    const db = await this.dbPromise;
    return new Promise<void>((resolve, reject) => {
      const tx = db.transaction('keyvalue', 'readwrite');
      const store = tx.objectStore('keyvalue');
      const req = store.put(value, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }
}

const MOCK_PROPERTY: PropertyData = {
  id: 'demo-property-1',
  owner_id: 'user-1',
  name: 'Beautiful Beach House',
  listing_title: 'Beautiful Beach House',
  listing_description: 'A stunning beachfront property with panoramic ocean views',
  cover_image_url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800',
  address: '123 Ocean Drive, Malibu, CA 90265',
  ical_url: null,
  cleaning_contact_info: null,
  wifi_code: null,
  arrival_instructions: null,
  house_rules_text: null,
  emergency_contact_info: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  property_type: 'house',
  rental_mode: 'entire_place',
  rooms: 8,
  bedrooms: 4,
  bathrooms: 3,
  surface_area: 2800,
  max_guests: 10,
  bed_count: 5,
  page_config: {
    layout: 'grid',
    theme: 'modern-ocean',
    sections: [
      {
        id: 'section-1',
        type: 'hero',
        order: 0,
        enabled: true,
        content: {
          title: 'Welcome to Your Dream Home',
          subtitle: 'Experience luxury living with breathtaking ocean views',
          ctaText: 'Schedule a Tour',
          ctaLink: '#contact',
        },
        style: {},
        animations: {},
      },
      {
        id: 'section-2',
        type: 'amenities',
        order: 1,
        enabled: true,
        content: {
          title: 'Property Features',
          list: ['Ocean View', 'Private Beach Access', 'Modern Kitchen', 'Heated Pool', 'Smart Home System', 'Wine Cellar'],
        },
        style: {},
        animations: {},
      },
      {
        id: 'section-3',
        type: 'photos',
        order: 2,
        enabled: true,
        content: { title: 'Photo Gallery', images: [] },
        style: {},
        animations: {},
      },
      {
        id: 'section-4',
        type: 'description',
        order: 3,
        enabled: true,
        content: {
          title: 'About This Property',
          body: 'This magnificent beach house offers the ultimate in luxury coastal living.',
        },
        style: {},
        animations: {},
      },
    ],
    globalStyle: {},
  },
};

const MOCK_PHOTOS: PropertyPhoto[] = [
  { id: 'photo-1', property_id: 'demo-property-1', url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800', category: 'living', created_at: new Date().toISOString() },
  { id: 'photo-2', property_id: 'demo-property-1', url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800', category: 'kitchen', created_at: new Date().toISOString() },
  { id: 'photo-3', property_id: 'demo-property-1', url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800', category: 'bedroom', created_at: new Date().toISOString() },
  { id: 'photo-4', property_id: 'demo-property-1', url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800', category: 'bathroom', created_at: new Date().toISOString() },
];

@Injectable({ providedIn: 'root' })
export class PavingSupabaseService {
  private supabaseClient: SupabaseClient | null = null;
  private useMock = false;
  private fallbackTemplatesToLocalStorage = false;
  private dbHelper = new IndexedDbHelper();

  constructor() {
    this.init();
  }

  private async getSavedTemplatesFromFallback(): Promise<SavedTemplate[]> {
    const stored = await this.dbHelper.getItem('saved_templates');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return [];
      }
    }
    // Migrate legacy localStorage data
    try {
      const legacy = localStorage.getItem('saved_templates');
      if (legacy) {
        await this.dbHelper.setItem('saved_templates', legacy);
        localStorage.removeItem('saved_templates');
        return JSON.parse(legacy);
      }
    } catch (e) {
      console.warn('Failed to migrate templates from localStorage:', e);
    }
    return [];
  }

  private async saveSavedTemplatesToFallback(templates: SavedTemplate[]): Promise<void> {
    const value = JSON.stringify(templates);
    await this.dbHelper.setItem('saved_templates', value);
    try {
      localStorage.setItem('saved_templates', value);
    } catch (e) {
      console.warn('LocalStorage save skipped (quota exceeded), safely stored in IndexedDB.');
    }
  }

  private isMissingTableError(error: any): boolean {
    if (!error) return false;
    const msg = error.message || '';
    const code = error.code || '';
    const status = error.status || 0;
    return (
      msg.includes('does not exist') ||
      msg.includes('schema cache') ||
      msg.includes('relation') ||
      code === '42P01' ||
      code.startsWith('PGRST') ||
      status === 404
    );
  }

  private init(): void {
    const { url, key } = SUPABASE_CONFIG;
    if (!url || !key || url === 'demo') {
      this.useMock = true;
      return;
    }
    try {
      this.useMock = false;
      this.supabaseClient = createClient(url, key);
    } catch {
      console.warn('Failed to initialize Supabase client. Falling back to mock mode.');
      this.useMock = true;
    }
  }

  async fetchProperty(propertyId: string): Promise<PropertyData | null> {
    if (this.useMock || !this.supabaseClient) {
      // In mock mode, check localStorage for any saved overrides
      try {
        const stored = localStorage.getItem('mock_property_config');
        if (stored) {
          const overrides = JSON.parse(stored);
          if (overrides && overrides.id === propertyId) {
            return overrides as PropertyData;
          }
        }
      } catch (e) {
        console.warn('[Mock] Failed to read localStorage:', e);
      }
      return MOCK_PROPERTY;
    }
    const { data, error } = await this.supabaseClient
      .from('properties')
      .select('*')
      .eq('id', propertyId)
      .single();

    if (error) {
      console.error('Error fetching property:', error);
      throw error;
    }

    return data as PropertyData;
  }

  async fetchPropertyPhotos(propertyId: string): Promise<PropertyPhoto[]> {
    if (this.useMock || !this.supabaseClient) {
      return MOCK_PHOTOS;
    }
    const { data, error } = await this.supabaseClient
      .from('property_photos')
      .select('*')
      .eq('property_id', propertyId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching photos:', error);
      throw error;
    }

    return data || [];
  }

  async savePropertyConfig(propertyId: string, pageConfig: unknown): Promise<void> {
    if (this.useMock || !this.supabaseClient) {
      // In mock mode, persist the full property (with updated page_config) to localStorage
      try {
        const existing = localStorage.getItem('mock_property_config');
        const base = existing ? JSON.parse(existing) : MOCK_PROPERTY;
        const updated = { ...base, id: propertyId, page_config: pageConfig, updated_at: new Date().toISOString() };
        localStorage.setItem('mock_property_config', JSON.stringify(updated));
      } catch (e) {
        console.warn('[Mock] Failed to write localStorage:', e);
      }
      return;
    }
    const { error } = await this.supabaseClient
      .from('properties')
      .update({ page_config: pageConfig } as never)
      .eq('id', propertyId) as { error: unknown };

    if (error) {
      console.error('Error saving property config:', error);
      throw error;
    }
  }

  async fetchListingLayouts(ownerId?: string): Promise<ListingLayout[]> {
    if (this.useMock || !this.supabaseClient) {
      return [];
    }
    const query = this.supabaseClient
      .from('listing_layouts')
      .select('*')
      .order('created_at', { ascending: true });

    if (ownerId) {
      query.or(`type.eq.predefined,owner_id.eq.${ownerId}`);
    } else {
      query.eq('type', 'predefined');
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching listing layouts:', error);
      return [];
    }
    return (data || []) as ListingLayout[];
  }

  async saveListingLayout(layout: Omit<ListingLayout, 'created_at'>): Promise<ListingLayout | null> {
    if (this.useMock || !this.supabaseClient) {
      console.log('Mock save layout:', layout);
      return layout as ListingLayout;
    }
    const { data, error } = await this.supabaseClient
      .from('listing_layouts')
      .upsert({
        id: layout.id,
        name: layout.name,
        type: layout.type,
        grid_blocks: layout.grid_blocks,
        section_assignments: layout.section_assignments,
        owner_id: layout.owner_id,
      } as never)
      .select()
      .single();

    if (error) {
      console.error('Error saving listing layout:', error);
      return null;
    }
    return data as ListingLayout;
  }

  async deleteListingLayout(layoutId: string): Promise<boolean> {
    if (this.useMock || !this.supabaseClient) {
      console.log('Mock delete layout:', layoutId);
      return true;
    }
    const { error } = await this.supabaseClient
      .from('listing_layouts')
      .delete()
      .eq('id', layoutId);

    if (error) {
      console.error('Error deleting listing layout:', error);
      return false;
    }
    return true;
  }

  async fetchTemplates(ownerId?: string): Promise<SavedTemplate[]> {
    if (this.useMock || !this.supabaseClient || this.fallbackTemplatesToLocalStorage) {
      return await this.getSavedTemplatesFromFallback();
    }
    const query = this.supabaseClient
      .from('listing_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (ownerId) {
      query.eq('owner_id', ownerId);
    }

    const { data, error } = await query;
    if (error) {
      console.error('Error fetching templates:', error);
      if (this.isMissingTableError(error)) {
        console.warn('listing_templates table does not exist. Falling back to IndexedDB/localStorage.');
        this.fallbackTemplatesToLocalStorage = true;
        return await this.getSavedTemplatesFromFallback();
      }
      return [];
    }
    return (data || []) as SavedTemplate[];
  }

  async saveTemplate(template: SavedTemplate): Promise<SavedTemplate | null> {
    if (this.useMock || !this.supabaseClient || this.fallbackTemplatesToLocalStorage) {
      const templates = await this.getSavedTemplatesFromFallback();
      const idx = templates.findIndex(t => t.id === template.id);
      if (idx >= 0) {
        templates[idx] = { ...template, updated_at: new Date().toISOString() };
      } else {
        templates.push({ ...template, created_at: new Date().toISOString(), updated_at: new Date().toISOString() });
      }
      await this.saveSavedTemplatesToFallback(templates);
      return template;
    }
    const { data, error } = await this.supabaseClient
      .from('listing_templates')
      .upsert({
        id: template.id,
        name: template.name,
        description: template.description,
        media: template.media,
        html: template.html,
        css: template.css,
        components: template.components,
        owner_id: template.owner_id,
      } as never)
      .select()
      .single();

    if (error) {
      console.error('Error saving template:', error);
      if (this.isMissingTableError(error)) {
        console.warn('listing_templates table does not exist. Falling back to IndexedDB/localStorage.');
        this.fallbackTemplatesToLocalStorage = true;
        return await this.saveTemplate(template);
      }
      return null;
    }
    return data as SavedTemplate;
  }

  async deleteTemplate(templateId: string): Promise<boolean> {
    if (this.useMock || !this.supabaseClient || this.fallbackTemplatesToLocalStorage) {
      const templates = await this.getSavedTemplatesFromFallback();
      await this.saveSavedTemplatesToFallback(templates.filter(t => t.id !== templateId));
      return true;
    }
    const { error } = await this.supabaseClient
      .from('listing_templates')
      .delete()
      .eq('id', templateId);

    if (error) {
      console.error('Error deleting template:', error);
      if (this.isMissingTableError(error)) {
        console.warn('listing_templates table does not exist. Falling back to IndexedDB/localStorage.');
        this.fallbackTemplatesToLocalStorage = true;
        return await this.deleteTemplate(templateId);
      }
      return false;
    }
    return true;
  }
}
