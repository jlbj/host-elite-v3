
import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { ContextData, Scores, ReportData, UserProfile, AppPlan, ApiKey, PlanConfig, AppSettings, View, Property, AppTier, RenovationRoom, RenovationQuote, QuoteFile, CapexAnalysis, ComplianceRule, ConstructionTask } from '../types';

@Injectable({
    providedIn: 'root'
})
export class HostRepository {
    private supabaseService = inject(SupabaseService);

    // Helper to access raw client if needed, guarded by service configuration
    private get supabase() { return this.supabaseService.supabase; }

    async getTiers(): Promise<AppTier[]> {
        if (!this.supabaseService.isConfigured) return [];
        const { data, error } = await this.supabase
            .from('app_tiers')
            .select('*')
            .order('rank_order', { ascending: true });

        if (error) {
            console.error('Error fetching tiers:', error);
            return [];
        }
        return data || [];
    }

    async getPhases(): Promise<any[]> {
        if (!this.supabaseService.isConfigured) return [];
        const { data, error } = await this.supabase
            .from('phases')
            // Order by sort_order
            .select('*')
            .order('sort_order', { ascending: true });

        if (error) {
            console.error('Error fetching phases:', error);
            return [];
        }
        return data || [];
    }

    async getFeaturesHierarchy(): Promise<any[]> {
        if (!this.supabaseService.isConfigured) return [];

        // Join features with dimensions and phases
        const { data, error } = await this.supabase
            .from('features')
            .select(`
                *,
                app_dimensions (
                    dimension_id,
                    name
                ),
                phases (
                    id,
                    name
                ),
                feature_configurations (
                    tier_id,
                    country_code,
                    config_value
                )
            `);

        if (error) {
            console.error('Error fetching features hierarchy:', error);
            return [];
        }

        // Map valid data to flat structure if needed, or keep relational
        return (data || []).map(f => ({
            ...f,
            dimension_name: f.app_dimensions?.name,
            phase_name: f.phases?.name
        }));
    }

    async toggleFeatureActive(featureId: string, isActive: boolean): Promise<void> {
        if (!this.supabaseService.isConfigured) throw new Error("DB not configured");
        const { error } = await this.supabase
            .from('features')
            .update({ is_active: isActive })
            .eq('id', featureId);
        if (error) throw error;
    }

    // Static sub-views configuration
    // Static sub-views configuration reorganized by Phases
    private readonly defaultSubViews: View[] = [
        // Phase 1: Préparation
        { id: 'manage-property', title: 'Manage', icon: 'settings', phase: 'preparation', requiredTier: 'TIER_1' },
        { id: 'welcome-booklet', title: 'NAV.welcome-booklet', icon: 'info', featureId: 'MKT_00', phase: 'preparation', requiredTier: 'TIER_1' },

        // Phase 2: Lancement
        { id: 'widget-library', title: 'NAV.widget-library', icon: 'widgets', featureId: 'MKT_02', phase: 'launch', requiredTier: 'TIER_1' },

        // Phase 3: Exploitation
        { id: 'property-calendar', title: 'NAV.property-calendar', icon: 'calendar', phase: 'exploitation', requiredTier: 'TIER_2' },
        { id: 'vocal-concierge', title: 'NAV.vocal-concierge', icon: 'concierge', featureId: 'vocal-concierge', phase: 'exploitation', requiredTier: 'TIER_2' },

        // Phase 4: Excellence
    ];

    async hasDiagnostic(userId: string): Promise<boolean> {
        if (!this.supabaseService.isConfigured) return false;
        const { count, error } = await this.supabase
            .from('diagnostics')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

        if (error) {
            // If table doesn't exist, assume no diagnostic
            if (error.code === '42P01') return false;
            console.warn("Error checking diagnostic:", error);
            return false;
        }
        return (count || 0) > 0;
    }

    async getLatestDiagnostic(userId: string): Promise<{ scores: Scores; report: ReportData; context: ContextData } | null> {
        if (!this.supabaseService.isConfigured) return null;

        const { data, error } = await this.supabase
            .from('diagnostics')
            .select(`
              *,
              diagnostic_points (*)
          `)
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

        if (error || !data) return null;

        const scores: Scores = {
            marketing: data.score_marketing,
            experience: data.score_experience,
            operations: data.score_operations,
            pricing: data.score_pricing,
            accomodation: data.score_accomodation,
            legal: data.score_legal,
            mindset: data.score_mindset
        };

        const context: ContextData = {
            situation: data.situation,
            challenge: data.challenge
        };

        const strengths = data.diagnostic_points
            .filter((p: any) => p.type === 'strength')
            .map((p: any) => p.content);

        const opportunities = data.diagnostic_points
            .filter((p: any) => p.type === 'opportunity')
            .map((p: any) => p.content);

        const report: ReportData = {
            recommendedPlan: data.recommended_plan,
            planJustification: data.plan_justification,
            strengths,
            opportunities
        };

        return { scores, report, context };
    }

    async saveDiagnosticResult(context: ContextData, scores: Scores, report: ReportData): Promise<void> {
        if (!this.supabaseService.isConfigured) throw new Error("Database not configured");

        const { user } = await this.supabaseService.getUser();
        if (!user) throw new Error("User not authenticated");

        // 1. Insert the main Diagnostic row
        const { data: diagnostic, error: diagError } = await this.supabase
            .from('diagnostics')
            .insert({
                user_id: user.id,
                situation: context.situation,
                challenge: context.challenge,
                score_marketing: scores.marketing,
                score_experience: scores.experience,
                score_operations: scores.operations,
                score_pricing: scores.pricing,
                score_accomodation: scores.accomodation,
                score_legal: scores.legal,
                score_mindset: scores.mindset,
                recommended_plan: report.recommendedPlan,
                plan_justification: report.planJustification
            })
            .select('id')
            .single();

        if (diagError) {
            console.error('Error saving diagnostic (DB):', diagError);
            throw new Error(`Database Error: ${diagError.message} (Code: ${diagError.code})`);
        }

        if (!diagnostic) {
            throw new Error("Error: Diagnostic could not be created (no data returned).");
        }

        // 2. Insert Strengths and Opportunities
        const points = [
            ...report.strengths.map(s => ({ diagnostic_id: diagnostic.id, type: 'strength', content: s })),
            ...report.opportunities.map(o => ({ diagnostic_id: diagnostic.id, type: 'opportunity', content: o }))
        ];

        const { error: pointsError } = await this.supabase
            .from('diagnostic_points')
            .insert(points);

        if (pointsError) {
            console.error('Error saving points:', pointsError);
        }
    }

    async getProperties(): Promise<Property[]> {
        if (!this.supabaseService.isConfigured) return [];

        const { user } = await this.supabaseService.getUser();
        if (!user) return [];

        const { data, error } = await this.supabase
            .from('properties')
            .select('id, name')
            .eq('owner_id', user.id);

        if (error) {
            // Table doesn't exist yet or other error
            if (error.code !== '42P01') console.error('Error fetching properties:', error);
            return [];
        }

        if (!data || data.length === 0) {
            return [];
        }

        return data.map(row => ({
            id: row.id,
            name: row.name,
            subViews: this.defaultSubViews
        }));
    }

    async getPropertyById(id: string): Promise<any> {
        if (!this.supabaseService.isConfigured) return null;
        const { data, error } = await this.supabase
            .from('properties')
            .select(`
            *,
            property_equipments (name, manual_url),
            property_photos (url, category)
        `)
            .eq('id', id)
            .single();

        if (error) {
            console.error("Error fetching property details by ID:", error);
            return null;
        }
        return data;
    }

    async getPropertyByName(name: string): Promise<any> {
        if (!this.supabaseService.isConfigured) return null;
        const { user } = await this.supabaseService.getUser();
        if (!user) return null;

        const { data, error } = await this.supabase
            .from('properties')
            .select(`
            *,
            property_equipments (name, manual_url),
            property_photos (url, category)
        `)
            .eq('owner_id', user.id)
            .eq('name', name)
            .single();

        if (error) {
            console.error("Error fetching property details:", error);
            return null;
        }
        return data;
    }

    async createProperty(ownerId: string, name: string): Promise<void> {
        if (!this.supabaseService.isConfigured) throw new Error("Database not configured");

        const { data, error } = await this.supabase
            .from('properties')
            .insert({
                owner_id: ownerId,
                name: name,
                listing_title: name,
                address: 'Adresse à compléter'
            })
            .select()
            .single();

        if (error) {
            console.error("Error creating property:", JSON.stringify(error));
            throw new Error(error.message || "Unable to create property");
        }

        // Automatically create a default internal calendar source
        if (data && data.id) {
            const { error: calError } = await this.supabase
                .from('calendar_sources')
                .insert({
                    name: `Calendrier ${data.name}`,
                    color: '#10b981', // Default green
                    type: 'internal',
                    property_id: data.id
                });

            if (calError) {
                console.warn("Could not create default calendar source, but property was created:", calError);
            }
        }
    }

    async updatePropertyData(propertyId: string, formData: any): Promise<void> {
        if (!this.supabaseService.isConfigured) throw new Error("Database not configured");

        const flatData = {
            listing_title: formData.marketing?.title,
            listing_description: formData.marketing?.description,
            cover_image_url: formData.marketing?.coverImageUrl,
            address: formData.operational?.address,
            ical_url: formData.operational?.icalUrl,
            cleaning_contact_info: formData.operational?.cleaningContact,
            wifi_code: formData.experience?.wifiCode,
            arrival_instructions: formData.experience?.arrivalInstructions,
            house_rules_text: formData.experience?.houseRules,
            emergency_contact_info: formData.experience?.emergencyContact,
            property_type: formData.propertyDetails?.property_type,
            rooms: formData.propertyDetails?.rooms,
            bedrooms: formData.propertyDetails?.bedrooms,
            bathrooms: formData.propertyDetails?.bathrooms,
            surface_area: formData.propertyDetails?.surface_area,
            max_guests: formData.propertyDetails?.max_guests,
            bed_count: formData.propertyDetails?.bed_count,
        };

        const { error: propError } = await this.supabase
            .from('properties')
            .update(flatData)
            .eq('id', propertyId);

        if (propError) throw propError;

        // Handle Equipments
        if (formData.equipments && Array.isArray(formData.equipments.checklist)) {
            // Checklist is now an array of {name, checked, manualUrl} objects
            const selectedEquipments = formData.equipments.checklist
                .filter((item: any) => item.checked)
                .map((item: any) => ({
                    property_id: propertyId,
                    name: item.name,
                    manual_url: item.manualUrl || null
                }));

            await this.supabase.from('property_equipments').delete().eq('property_id', propertyId);

            if (selectedEquipments.length > 0) {
                await this.supabase.from('property_equipments').insert(selectedEquipments);
            }
        }

        // Handle Photos via updatePropertyData (if called from property-data-view)
        if (formData.photos && Array.isArray(formData.photos)) {
            await this.savePropertyPhotos(propertyId, formData.photos);
        }
    }

    async savePropertyPhotos(propertyId: string, photos: { url: string, category: string }[]): Promise<void> {
        if (!this.supabaseService.isConfigured) throw new Error("Database not configured");

        // Delete existing photos to replace with new set (simplest approach for order/updates)
        // In production, we might want to be smarter to avoid ID churn, but this works for now.
        await this.supabase.from('property_photos').delete().eq('property_id', propertyId);

        const validPhotos = photos
            .filter(p => p.url && p.url.trim() !== '')
            .map(p => ({
                property_id: propertyId,
                url: p.url,
                category: p.category
            }));

        if (validPhotos.length > 0) {
            const { error } = await this.supabase.from('property_photos').insert(validPhotos);
            if (error) throw error;
        }
    }

    // NEW: Get booklet data
    async getBooklet(propertyName: string): Promise<any> {
        if (!this.supabaseService.isConfigured) return null;

        const { data: propData } = await this.supabase
            .from('properties')
            .select('id')
            .eq('name', propertyName)
            .single();

        if (!propData) return null;

        const { data } = await this.supabase
            .from('booklet_content')
            .select('*')
            .eq('property_id', propData.id);

        if (!data || data.length === 0) return null;

        const result: any = {};

        data.forEach((row: any) => {
            if (row.section_id === 'general') {
                // Champs racine (ex: coverImageUrl)
                result[row.field_key] = row.field_value;
            } else if (row.section_id === 'widgets') {
                // Widgets special handling - assume it's JSON stored as value or multiple keys
                if (!result['widgets']) result['widgets'] = {};
                result['widgets'][row.field_key] = (row.field_value === 'true');
            } else if (row.section_id === 'configuration' && row.field_key === 'photo_categories') {
                // Custom Categories List stored as JSON string
                try {
                    result['photo_categories'] = JSON.parse(row.field_value);
                } catch (e) {
                    result['photo_categories'] = [];
                }
            } else {
                // Champs imbriqués (sections)
                if (!result[row.section_id]) {
                    result[row.section_id] = {};
                }
                let val = row.field_value;
                // Conversion basique pour les booléens (toggles)
                if (row.section_id === 'toggles') {
                    val = (val === 'true');
                }
                result[row.section_id][row.field_key] = val;
            }
        });
        return result;
    }

    async saveBooklet(propertyName: string, bookletFormValue: any): Promise<void> {
        if (!this.supabaseService.isConfigured) throw new Error("Database not configured");

        const { data: propData } = await this.supabase
            .from('properties')
            .select('id')
            .eq('name', propertyName)
            .single();

        if (!propData) throw new Error("Property not found");

        const propertyId = propData.id;
        const rowsToUpsert: any[] = [];

        Object.entries(bookletFormValue).forEach(([sectionId, sectionData]) => {
            // Skip 'photos' as it's handled separately in savePropertyPhotos call usually,
            // but if it leaks here, we ignore it for booklet_content table.
            if (sectionId === 'photos') return;

            // Custom Categories handling (passed as a virtual section or root key)
            if (sectionId === 'photo_categories') {
                rowsToUpsert.push({
                    property_id: propertyId,
                    section_id: 'configuration',
                    field_key: 'photo_categories',
                    field_value: JSON.stringify(sectionData)
                });
                return;
            }

            if (typeof sectionData === 'object' && sectionData !== null) {
                // Sections imbriquées (ex: 'cuisine', 'toggles', 'widgets')
                Object.entries(sectionData as object).forEach(([fieldKey, fieldValue]) => {
                    let valToStore = String(fieldValue);
                    if (fieldValue === null || fieldValue === undefined) valToStore = '';

                    rowsToUpsert.push({
                        property_id: propertyId,
                        section_id: sectionId, // 'widgets' will fall here
                        field_key: fieldKey,
                        field_value: valToStore
                    });
                });
            } else if (typeof sectionData === 'string') {
                // Champs racine (ex: 'coverImageUrl') sauvegardés dans une section virtuelle 'general'
                rowsToUpsert.push({
                    property_id: propertyId,
                    section_id: 'general',
                    field_key: sectionId,
                    field_value: sectionData
                });
            }
        });

        if (rowsToUpsert.length > 0) {
            const { error } = await this.supabase
                .from('booklet_content')
                .upsert(rowsToUpsert, { onConflict: 'property_id,section_id,field_key' });

            if (error) throw error;
        }
    }

    // --- Helpers for Category Management ---

    async getPropertyCategories(propertyName: string): Promise<string[] | null> {
        const data = await this.getBooklet(propertyName);
        return data?.photo_categories || null;
    }

    async savePropertyCategories(propertyName: string, categories: string[]): Promise<void> {
        await this.saveBooklet(propertyName, { photo_categories: categories });
    }

    // --- App Settings (Global) ---

    async getGlobalSettings(): Promise<AppSettings> {
        if (!this.supabaseService.isConfigured) return { show_plan_badges: false };

        const { data, error } = await this.supabase
            .from('app_settings')
            .select('value')
            .eq('key', 'global_config')
            .single();

        if (error || !data) {
            // Return default if not set or error
            return { show_plan_badges: false };
        }
        return data.value as AppSettings;
    }

    async updateGlobalSettings(settings: AppSettings): Promise<void> {
        if (!this.supabaseService.isConfigured) throw new Error("DB not configured");

        const { error } = await this.supabase
            .from('app_settings')
            .upsert({ key: 'global_config', value: settings });

        if (error) throw error;
    }

    // --- Plan Management (Admin) ---

    async getPlans(): Promise<PlanConfig[]> {
        if (!this.supabaseService.isConfigured) return [];
        const { data, error } = await this.supabase
            .from('app_plans')
            .select('*')
            .order('price', { ascending: true });

        if (error) {
            console.error('Error fetching plans:', error);
            return [];
        }

        // Robustly handle 'features' whether it comes as an array or a JSON string
        return (data || []).map((p: any) => {
            let features = p.features;
            if (typeof features === 'string') {
                try {
                    features = JSON.parse(features);
                } catch (e) {
                    console.warn(`Failed to parse features for plan ${p.id}`, e);
                    features = [];
                }
            }
            return {
                id: p.id,
                price: p.price,
                features: Array.isArray(features) ? features : []
            };
        });
    }

    async getPlanFeatures(planId: string): Promise<string[]> {
        if (!this.supabaseService.isConfigured) return [];
        const { data, error } = await this.supabase
            .from('app_plans')
            .select('features')
            .eq('id', planId)
            .single();

        if (error || !data) {
            return [];
        }

        let features = data.features;
        // Handle stringified JSON just in case
        if (typeof features === 'string') {
            try {
                features = JSON.parse(features);
            } catch (e) {
                features = [];
            }
        }

        return Array.isArray(features) ? features : [];
    }

    async updatePlanConfig(planId: string, price: number, features: string[]): Promise<void> {
        if (!this.supabaseService.isConfigured) throw new Error("DB not configured");

        const { data, error } = await this.supabase
            .from('app_plans')
            .update({ price, features: features })
            .eq('id', planId)
            .select();

        if (error) throw error;

        if (!data || data.length === 0) {
            const err = new Error("Unable to update plan.");
            (err as any).code = "RLS_BLOCKED_PLAN"; // Critical for UI handler
            throw err;
        }
    }

    // --- User Administration ---

    async getUserProfile(userId: string): Promise<UserProfile | null> {
        if (!this.supabaseService.isConfigured) return null;

        const { data, error } = await this.supabase.from('profiles').select('*').eq('id', userId).single();
        if (error || !data) return null;

        return {
            id: data.id,
            email: data.email,
            full_name: data.full_name,
            role: data.role,
            plan: data.plan,
            subscription_status: data.subscription_status,
            email_confirmed: data.email_confirmed ?? false,
            language: data.language,
            avatar_url: data.avatar_url,
            stripe_customer_id: data.stripe_customer_id
        };
    }

    async getAllUsers(): Promise<UserProfile[]> {
        if (!this.supabaseService.isConfigured) return [];

        const { data, error } = await this.supabase.from('profiles').select('*').order('created_at', { ascending: false });
        if (error) {
            console.error("Error fetching users", error);
            return [];
        }
        return data.map((row: any) => ({
            id: row.id,
            email: row.email,
            full_name: row.full_name,
            avatar_url: row.avatar_url,
            role: row.role,
            plan: row.plan,
            stripe_customer_id: row.stripe_customer_id,
            subscription_status: row.subscription_status,
            email_confirmed: row.email_confirmed ?? false
        }));
    }

    async updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<void> {
        if (!this.supabaseService.isConfigured) throw new Error("Database not configured");

        const payload: any = {};

        // Explicitly check for keys to ensure even false/empty values are transmitted if intended
        if ('plan' in updates) payload.plan = updates.plan;
        if ('role' in updates) payload.role = updates.role;
        if ('full_name' in updates) payload.full_name = updates.full_name;
        if ('email' in updates) payload.email = updates.email;
        if ('email_confirmed' in updates) payload.email_confirmed = updates.email_confirmed;
        if ('stripe_customer_id' in updates) payload.stripe_customer_id = updates.stripe_customer_id;
        if ('language' in updates) payload.language = updates.language;
        if ('avatar_url' in updates) payload.avatar_url = updates.avatar_url;

        // Use select() to ensure the row was actually found and updated
        const { data, error } = await this.supabase
            .from('profiles')
            .update(payload)
            .eq('id', userId)
            .select();

        if (error) {
            console.error("Update User Error:", error);
            throw error;
        }

        if (!data || data.length === 0) {
            // This usually happens if RLS blocks the update or ID doesn't exist
            const err = new Error("Update failed (RLS or invalid ID)");
            (err as any).code = "RLS_BLOCKED_PROFILE"; // Critical for UI handler
            throw err;
        }
    }

    async toggleUserConfirmation(userId: string, isConfirmed: boolean): Promise<void> {
        if (!this.supabaseService.isConfigured) throw new Error("Database not configured");

        const { error } = await this.supabase.rpc('toggle_user_confirmation', {
            target_user_id: userId,
            should_confirm: isConfirmed
        });

        if (error) {
            console.error('RPC Error:', error);
            throw new Error(error.message || "Error synchronizing email status.");
        }
    }

    async createProfile(id: string, email: string, fullName: string, role: string = 'user', plan: string = 'Freemium'): Promise<void> {
        if (!this.supabaseService.isConfigured) throw new Error("Database not configured");

        const { error } = await this.supabase.from('profiles').upsert({
            id: id,
            email: email,
            full_name: fullName,
            role: role,
            plan: plan,
            subscription_status: 'active'
        }, { onConflict: 'id' });

        if (error) {
            console.error("Error creating profile:", JSON.stringify(error));
            throw new Error(error.message || "Error creating profile");
        }
    }

    async deleteUser(userId: string): Promise<void> {
        if (!this.supabaseService.isConfigured) throw new Error("Database not configured");

        const { error } = await this.supabase.from('profiles').delete().eq('id', userId);
        if (error) throw error;
    }

    async createUser(user: { email: string; fullName: string; role: string; plan: string; email_confirmed: boolean }, explicitId?: string): Promise<void> {
        if (!this.supabaseService.isConfigured) throw new Error("Database not configured");

        const id = explicitId || crypto.randomUUID();
        const { error } = await this.supabase.from('profiles').insert({
            id: id,
            email: user.email,
            full_name: user.fullName,
            role: user.role,
            plan: user.plan,
            subscription_status: 'active',
            email_confirmed: user.email_confirmed
        });

        if (error) {
            console.error("Error creating user row:", JSON.stringify(error));
            throw new Error(error.message);
        }
    }

    async resetUserPassword(email: string): Promise<void> {
        const { error } = await this.supabaseService.sendPasswordResetEmail(email);
        if (error) {
            console.error("Password reset error:", error);
            throw new Error(error.message || "Could not send password reset email.");
        }
    }

    // --- API Key Management (RPC) ---

    async listApiKeys(): Promise<ApiKey[]> {
        if (!this.supabaseService.isConfigured) return [];
        const { data, error } = await this.supabase.rpc('list_api_keys');
        if (error) throw error;
        return data as ApiKey[];
    }

    async addApiKey(name: string, clearKey: string, provider: string = 'gemini'): Promise<void> {
        if (!this.supabaseService.isConfigured) throw new Error("DB not configured");
        const { error } = await this.supabase.rpc('add_api_key', { key_name: name, clear_key: clearKey, p_provider: provider });
        if (error) throw error;
    }

    async setActiveApiKey(id: string): Promise<void> {
        if (!this.supabaseService.isConfigured) throw new Error("DB not configured");

        // Try using the RPC function first
        const { error: rpcError } = await this.supabase.rpc('set_active_api_key', { target_id: id });

        if (!rpcError) return;

        // Fallback: If RPC is missing (error code 42883) or fails, try direct manipulation
        console.warn("RPC set_active_api_key failed, attempting manual fallback. Error:", JSON.stringify(rpcError));

        // Use system_api_keys (secure table) instead of api_keys based on DB errors
        const tableName = 'system_api_keys';

        // 1. Deactivate all keys
        const { error: deactivateError } = await this.supabase
            .from(tableName)
            .update({ is_active: false })
            .neq('id', '00000000-0000-0000-0000-000000000000');

        if (deactivateError) {
            console.error("Manual fallback: deactivation failed", JSON.stringify(deactivateError));
        }

        // 2. Activate the specific key
        const { error: activateError } = await this.supabase
            .from(tableName)
            .update({ is_active: true })
            .eq('id', id);

        if (activateError) {
            const msg = typeof activateError === 'object' && activateError !== null
                ? (activateError.message || activateError.details || JSON.stringify(activateError))
                : String(activateError);

            const enhancedError = new Error(`Manual Activation Failed: ${msg}`);
            (enhancedError as any).code = (activateError as any)?.code;
            throw enhancedError;
        }
    }

    async deleteApiKey(id: string): Promise<void> {
        if (!this.supabaseService.isConfigured) throw new Error("DB not configured");
        const { error } = await this.supabase.rpc('delete_api_key', { target_id: id });
        if (error) throw error;
    }

    async upsertFeatureConfiguration(featureId: string, tierId: string, countryCode: string, configValue: any): Promise<void> {
        if (!this.supabaseService.isConfigured) throw new Error("DB not configured");

        // We use a combination of feature_id, tier_id, and country_code for matching
        // In the migration, we don't have a unique constraint on these three, so we query first or use a known config_id if we had it.
        // Assuming we want to upsert based on these criteria:
        const { data: existing } = await this.supabase
            .from('feature_configurations')
            .select('config_id')
            .eq('feature_id', featureId)
            .eq('tier_id', tierId)
            .eq('country_code', countryCode)
            .single();

        if (existing) {
            const { error } = await this.supabase
                .from('feature_configurations')
                .update({ config_value: configValue })
                .eq('config_id', existing.config_id);
            if (error) throw error;
        } else {
            // Get max ID for simple manual increment (or let DB handle if it were serial, but migration used PRIMARY KEY)
            const { data: maxIdData } = await this.supabase
                .from('feature_configurations')
                .select('config_id')
                .order('config_id', { ascending: false })
                .limit(1);

            const nextId = (maxIdData && maxIdData.length > 0) ? maxIdData[0].config_id + 1 : 1;

            const { error } = await this.supabase
                .from('feature_configurations')
                .insert({
                    config_id: nextId,
                    feature_id: featureId,
                    tier_id: tierId,
                    country_code: countryCode,
                    config_value: configValue
                });
            if (error) throw error;
        }
    }

    // --- Renovation Budget (FIN_02) ---

    async getRenovationRooms(propertyId: string): Promise<RenovationRoom[]> {
        if (!this.supabaseService.isConfigured) return [];
        const { data, error } = await this.supabase
            .from('renovation_rooms')
            .select('*')
            .eq('property_id', propertyId)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching renovation rooms:', error);
            return [];
        }
        return data || [];
    }

    async upsertRenovationRoom(room: Partial<RenovationRoom>): Promise<RenovationRoom | null> {
        if (!this.supabaseService.isConfigured) throw new Error("DB not configured");
        const { data, error } = await this.supabase
            .from('renovation_rooms')
            .upsert(room)
            .select()
            .single();

        if (error) throw error;
        return data;
    }

    async deleteRenovationRoom(roomId: string): Promise<void> {
        if (!this.supabaseService.isConfigured) throw new Error("DB not configured");
        const { error } = await this.supabase
            .from('renovation_rooms')
            .delete()
            .eq('id', roomId);
        if (error) throw error;
    }

    async getRenovationQuotes(roomId: string): Promise<RenovationQuote[]> {
        if (!this.supabaseService.isConfigured) return [];
        const { data, error } = await this.supabase
            .from('renovation_quotes')
            .select('*')
            .eq('room_id', roomId);

        if (error) {
            console.error('Error fetching renovation quotes:', error);
            return [];
        }
        return data || [];
    }

    async upsertRenovationQuote(quote: Partial<RenovationQuote>): Promise<void> {
        if (!this.supabaseService.isConfigured) throw new Error("DB not configured");
        const { error } = await this.supabase
            .from('renovation_quotes')
            .upsert(quote);
        if (error) throw error;
    }

    // --- Quote File Management (Smart Capex Planner) ---

    async uploadQuoteFile(propertyId: string, file: File): Promise<QuoteFile | null> {
        if (!this.supabaseService.isConfigured) throw new Error("DB not configured");

        // Validate file type
        if (file.type !== 'application/pdf') {
            throw new Error("Only PDF files are allowed");
        }

        // Validate file size (5MB limit)
        const MAX_SIZE = 5 * 1024 * 1024;
        if (file.size > MAX_SIZE) {
            throw new Error("File size must be less than 5MB");
        }

        const fileExt = file.name.split('.').pop();
        const fileName = `${propertyId}/quote_${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${fileName}`;

        // 1. Upload the file to Supabase Storage
        const { error: uploadError } = await this.supabase.storage
            .from('renovation-quotes')
            .upload(filePath, file, { upsert: false });

        if (uploadError) {
            console.error('Error uploading quote file:', uploadError);
            throw uploadError;
        }

        // 2. Save metadata to database
        const { data, error: dbError } = await this.supabase
            .from('renovation_quote_files')
            .insert({
                property_id: propertyId,
                file_name: file.name,
                file_path: filePath,
                file_size: file.size
            })
            .select()
            .single();

        if (dbError) {
            // Cleanup: delete uploaded file if DB insert fails
            await this.supabase.storage.from('renovation-quotes').remove([filePath]);
            throw dbError;
        }

        return data;
    }

    async getQuoteFiles(propertyId: string): Promise<QuoteFile[]> {
        if (!this.supabaseService.isConfigured) return [];
        const { data, error } = await this.supabase
            .from('renovation_quote_files')
            .select('*')
            .eq('property_id', propertyId)
            .order('uploaded_at', { ascending: false });

        if (error) {
            console.error('Error fetching quote files:', error);
            return [];
        }
        return data || [];
    }

    async deleteQuoteFile(fileId: string): Promise<void> {
        if (!this.supabaseService.isConfigured) throw new Error("DB not configured");

        // Get file path before deleting from DB
        const { data: fileData } = await this.supabase
            .from('renovation_quote_files')
            .select('file_path')
            .eq('id', fileId)
            .single();

        if (fileData?.file_path) {
            // Delete from storage
            await this.supabase.storage
                .from('renovation-quotes')
                .remove([fileData.file_path]);
        }

        // Delete from database
        const { error } = await this.supabase
            .from('renovation_quote_files')
            .delete()
            .eq('id', fileId);

        if (error) throw error;
    }

    async getQuoteFileUrl(filePath: string): Promise<string> {
        if (!this.supabaseService.isConfigured) throw new Error("DB not configured");

        const { data } = this.supabase.storage
            .from('renovation-quotes')
            .getPublicUrl(filePath);

        return data.publicUrl;
    }

    // --- Compliance Checker (LEG_00) ---

    async getComplianceRuleForCity(city: string): Promise<ComplianceRule | null> {
        if (!this.supabaseService.isConfigured) return null;

        // Try exact match first
        let { data, error } = await this.supabase
            .from('compliance_rules')
            .select('*')
            .eq('city', city)
            .maybeSingle();

        if (error) {
            console.error('Error fetching compliance rule:', error);
            return null;
        }

        if (!data) {
            // Try matching keywords if city not found directly
            const { data: allRules } = await this.supabase
                .from('compliance_rules')
                .select('*');

            const cityLower = city.toLowerCase();
            data = allRules?.find(r =>
                r.keywords?.some((k: string) => cityLower.includes(k.toLowerCase())) ||
                cityLower.includes(r.city.toLowerCase())
            ) || null;
        }

        return data;
    }

    // --- Construction Schedule (OPS_01) ---

    async getConstructionTasks(propertyId: string): Promise<ConstructionTask[]> {
        if (!this.supabaseService.isConfigured) return [];
        const { data, error } = await this.supabase
            .from('construction_tasks')
            .select('*')
            .eq('property_id', propertyId)
            .order('start_date', { ascending: true });

        if (error) {
            console.error('Error fetching construction tasks:', error);
            return [];
        }
        return data || [];
    }

    async upsertConstructionTask(task: Partial<ConstructionTask>): Promise<void> {
        if (!this.supabaseService.isConfigured) throw new Error("DB not configured");
        const { error } = await this.supabase
            .from('construction_tasks')
            .upsert(task);
        if (error) throw error;
    }

    // --- Profitability Simulations (Tier 1+) ---

    async saveSimulation(name: string, inputs: any, results: any): Promise<void> {
        if (!this.supabaseService.isConfigured) throw new Error("DB not configured");
        const { user } = await this.supabaseService.getUser();
        if (!user) throw new Error("User not authenticated");

        // Limit check based on Tier could be here, but we'll do it in UI for UX.
        const { error } = await this.supabase
            .from('saved_simulations')
            .insert({
                user_id: user.id,
                name: name,
                inputs: inputs,
                results: results
            });

        if (error) throw error;
    }

    async getSimulations(): Promise<any[]> {
        if (!this.supabaseService.isConfigured) return [];
        const { data, error } = await this.supabase
            .from('saved_simulations')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error("Error fetching simulations:", error);
            return [];
        }
        return data || [];
    }

    async deleteSimulation(id: string): Promise<void> {
        if (!this.supabaseService.isConfigured) throw new Error("DB not configured");
        const { error } = await this.supabase
            .from('saved_simulations')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
}
