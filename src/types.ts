
export interface ContextData {
  situation: string;
  challenge: string;
}

export interface Scores {
  marketing: number;
  experience: number;
  operations: number;
  pricing: number;
  accomodation: number;
  legal: number;
  mindset: number;
}

export type UserRole = 'user' | 'admin' | 'supplier' | 'property_manager' | 'owner';
export type AppPlan = 'Freemium' | 'Bronze' | 'Silver' | 'Gold' | 'TIER_0' | 'TIER_1' | 'TIER_2' | 'TIER_3';

export interface AppTier {
  tier_id: string;
  name: string;
  rank_order: number;
  description: string;
}

export interface ReportData {
  strengths: string[];
  opportunities: string[];
  recommendedPlan: AppPlan;
  planJustification: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: UserRole;
  plan: AppPlan;
  stripe_customer_id?: string;
  subscription_status?: string;
  email_confirmed?: boolean;
  language?: string;
}

export interface ApiKey {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
}

export interface PlanConfig {
  id: string; // The Plan Name (PK)
  price: number;
  features: string[]; // List of enabled feature IDs
}

export interface AppSettings {
  show_plan_badges: boolean;
}

// Moved from SidebarComponent to prevent circular dependencies
export interface View {
  id: string;
  title: string;
  icon: string;
  propertyName?: string;
  featureId?: string; // Links this view to a specific feature for badge resolution
  phase?: 'preparation' | 'launch' | 'exploitation' | 'excellence'; // New for UI Overhaul
  requiredTier?: AppPlan; // Explicit tier requirement for the tool/view
}

export interface Property {
  id: string;
  name: string;
  subViews: View[];
}

// --- New Features System Types ---

export interface AppPhase {
  id: string;
  name: string;
  sort_order: number;
  description?: string;
}

export interface AppDimension {
  dimension_id: string;
  name: string;
  description?: string;
}

export interface Feature {
  id: string;
  parent_feature_id?: string;
  dimension_id: string;
  phase_id: string;
  name: string;
  description?: string;
  is_active?: boolean;
  // Joined fields
  dimension_name?: string;
  phase_name?: string;
  config?: any; // The configuration value specific to the user's tier
  required_tier?: string; // The tier required for this feature (derived from configs)
  flavors?: { tier_id: string, config: any }[]; // [NEW] All available tier-specific configs
  feature_configurations?: any[]; // [NEW] Join results from database
}

// --- Feature-Specific Data Entities ---

export interface RenovationRoom {
  id: string;
  property_id: string;
  type: string;
  area: number;
  finish_level: 'Standard' | 'Premium' | 'Luxury';
  budget_estimate: number;
  actual_spend: number;
  created_at?: string;
}

export interface RenovationQuote {
  id: string;
  room_id: string;
  vendor_name: string;
  amount: number;
  is_preferred: boolean;
  created_at?: string;
}

export interface QuoteFile {
  id: string;
  property_id: string;
  file_name: string;
  file_path: string;
  file_size: number;
  uploaded_at: string;
  created_at?: string;
}

export interface CapexAnalysis {
  overallScore: number;
  budgetVsQuotes: {
    totalBudget: number;
    totalQuotes: number;
    variance: number;
    variancePercent: number;
  };
  recommendations: string[];
  risks: string[];
  opportunities: string[];
  propertyInsights?: {
    location?: string;
    estimatedValue?: number;
    marketTrends?: string;
  };
}

export interface ComplianceRule {
  id: string;
  city: string;
  limit_days: number;
  mandatory_req: string;
  risk_level: number;
  keywords: string[];
  description: string;
}

export interface ConstructionTask {
  id: string;
  property_id: string;
  title: string;
  start_date: string;
  end_date: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  milestone_type?: string;
}