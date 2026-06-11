export type SectionType = 'hero' | 'photos' | 'description' | 'contact' | 'price' | 'header' | 'characteristics' | 'otherProperties' | 'bottom' | 'closeTo' | 'amenities' | 'map' | 'facilities' | 'floorPlan' | 'rules' | 'testimonials' | 'location' | 'recap' | 'ADAPTIVE' | 'FIXED';

export type RentalMode = 'entire_place' | 'private_rooms' | 'both';

export type BedType = 'king' | 'queen' | 'double' | 'twin' | 'bunk' | 'single' | 'sofa_bed' | 'crib';

export interface RentableRoom {
  id: string;
  name: string;
  description?: string;
  price: number;
  maxGuests: number;
  bedType: BedType;
  privateBathroom: boolean;
  surface?: number;
  amenities?: string[];
  photos?: string[];
}

export interface SectionContent {
  [key: string]: unknown;
}

export interface SectionStyle {
  textAlign?: 'left' | 'center' | 'right';
  fontSize?: string;
  color?: string;
  backgroundColor?: string;
  backgroundImage?: string;
  backgroundAttachment?: 'scroll' | 'fixed' | 'parallax';
  backgroundSize?: 'cover' | 'contain' | 'auto' | 'stretch';
  backgroundPosition?: string;
  scrollEffect?: 'none' | 'parallax' | 'zoom-parallax' | 'translate-parallax';
  galleryStyle?: 'grid' | 'masonry' | 'justified' | 'carousel-scroll' | 'carousel-interactive' | 'marquee';
  padding?: string;
}

export interface SectionAnimations {
  hover?: 'none' | 'zoom' | 'lift' | 'glow';
  scroll?: 'none' | 'fade-in' | 'fade-up' | 'slide';
}

export interface Section {
  id: string;
  type: SectionType;
  order: number;
  enabled: boolean;
  content: SectionContent;
  style: SectionStyle;
  animations: SectionAnimations;
}

export interface GlobalStyle {
  fontFamily?: string;
  headingFont?: string;
  primaryColor?: string;
  secondaryColor?: string;
  borderRadius?: string;
  animationSpeed?: string;
}

export interface PageConfig {
  layout: string;
  theme: string;
  sections: Section[];
  rootBlock?: Block | null;
  globalStyle: GlobalStyle;
}

export interface PropertyData {
  id: string;
  owner_id: string;
  name: string;
  listing_title: string;
  listing_description: string;
  cover_image_url: string;
  address: string;
  ical_url: string | null;
  cleaning_contact_info: string | null;
  wifi_code: string | null;
  arrival_instructions: string | null;
  house_rules_text: string | null;
  emergency_contact_info: string | null;
  created_at: string;
  updated_at: string;
  property_type: string | null;
  rental_mode: RentalMode;
  rooms: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  surface_area: number | null;
  max_guests: number | null;
  bed_count: number | null;
  page_config: PageConfig | null;
}

export interface PropertyPhoto {
  id: string;
  property_id: string;
  url: string;
  category: string;
  created_at: string;
}

export interface Theme {
  id: string;
  name: string;
  colors: {
    primary: string;
    primaryLight: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    textMuted: string;
    border: string;
  };
  typography: {
    headingFont: string;
    bodyFont: string;
    baseSize: string;
    headingWeight: number;
    bodyWeight: number;
  };
  spacing: { sectionPadding: string; gap: string };
  borders: { radius: string; style: string; width: string };
  buttons: { shape: 'square' | 'rounded' | 'pill'; variant: 'filled' | 'outline' | 'ghost'; shadow: string };
  animations: { hover: 'none' | 'scale' | 'lift' | 'glow'; scroll: 'none' | 'fade-up' | 'fade-in' | 'slide'; speed: string };
}

export interface Layout {
  id: string;
  name: string;
  thumbnail: string;
  description: string;
}

export interface Block {
  id: string;
  children?: Block[];
  direction?: 'horizontal' | 'vertical';
  sectionId?: string;
  flex: number;
  height?: number;
  width?: number;
}

export interface GridBounds {
  top: number;
  left: number;
  right: number;
  bottom: number;
}

export type DisplayMode = 'LOCKED' | 'UNLOCKED';

export interface GridBlock {
  id: string;
  sectionId?: string;
  row: number;
  col: number;
  bounds: GridBounds;
  displayMode?: DisplayMode;
  blockStyle?: Partial<SectionStyle>;
}

export type SplitDirection = 'horizontal' | 'vertical';

export interface SavedLayout {
  id: string;
  name: string;
  rootBlock?: Block;
  gridBlocks?: GridBlock[];
  sections?: Section[];
  createdAt: number;
  updatedAt: number;
}

export interface ListingLayout {
  id: string;
  name: string;
  type: 'custom' | 'predefined';
  owner_id?: string;
  grid_blocks: unknown;
  section_assignments: unknown;
  created_at: string;
}

export type ViewMode = 'mobile' | 'mobile-horizontal' | 'tablet' | 'desktop';
export type EditorMode = 'display' | 'layout' | 'config';

export interface EdgeDragState {
  active: boolean;
  orientation: 'H' | 'V';
  coordinate: number;
  affectedA: string[];
  affectedB: string[];
}

export interface BlockHistory {
  past: GridBlock[][];
  future: GridBlock[][];
}

export interface SectionLibraryItem {
  type: SectionType;
  label: string;
  icon: string;
  color: string;
}
