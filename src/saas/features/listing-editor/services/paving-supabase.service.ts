import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '../../../../supabase.config';
import type { PropertyData, PropertyPhoto } from '../models/paving.types';

export interface ListingLayout {
  id: string;
  name: string;
  type: 'predefined' | 'custom';
  grid_blocks: unknown;
  section_assignments: unknown;
  owner_id?: string;
  created_at: string;
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

  constructor() {
    this.init();
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
      console.log('Mock save:', propertyId, pageConfig);
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
}
