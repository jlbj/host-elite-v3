
import { Injectable, computed, signal, inject } from '@angular/core';
import { ContextData, ReportData, Scores, UserProfile, AppPlan, PlanConfig, AppTier, AppPhase, Feature, UserRole } from '../types';
import { GeminiService } from '../services/gemini.service';
import { HostRepository } from '../services/host-repository.service';
import { SupabaseService } from '../services/supabase.service';
import { TranslationService } from '../services/translation.service';

export type AppStep = 'landing' | 'onboarding_context' | 'evaluation' | 'loading' | 'results' | 'dashboard';

@Injectable({
    providedIn: 'root'
})
export class SessionStore {
    // Dependencies
    private geminiService = inject(GeminiService);
    private repository = inject(HostRepository);
    private supabaseService = inject(SupabaseService);
    private translationService = inject(TranslationService); // NEW

    // ... (rest of store)

    readonly currentStep = signal<AppStep>('landing');
    readonly contextData = signal<ContextData | null>(null);
    readonly scores = signal<Scores | null>(null);
    readonly reportData = signal<ReportData | null>(null);
    readonly userProfile = signal<UserProfile | null>(null);
    readonly error = signal<string | null>(null);
    readonly isLoading = signal<boolean>(false);

    // New Signal for Grace Period Warning
    readonly showEmailWarning = signal<boolean>(false);

    // New Signal for Plan Features
    readonly userFeatures = signal<string[]>([]);

    // Global Config Signals
    readonly showPlanBadges = signal<boolean>(false);
    readonly showLanguageSwitcher = signal<boolean>(true);
    readonly allPlans = signal<PlanConfig[]>([]);
    readonly appTiers = signal<AppTier[]>([]);



    // UI Structure Signals (Phases & Features)
    readonly phases = signal<AppPhase[]>([]);
    readonly featuresHierarchy = signal<any[]>([]);

    // Computed Features by Phase
    readonly featuresByPhase = computed(() => {
        const rawFeatures = this.featuresHierarchy();
        if (!rawFeatures.length) return {};

        // 1. Determine Current Country from Language
        const currentLang = this.translationService.currentLang();
        // const currentLang = 'fr'; // DEBUG FORCE
        let currentCountry = 'GLOBAL';
        if (currentLang === 'fr') currentCountry = 'FR';
        else if (currentLang === 'en') currentCountry = 'UK'; // Default EN to UK
        else if (currentLang === 'es') currentCountry = 'ES';

        // Group features by phase_id
        const grouped: Record<string, Feature[]> = {};
        rawFeatures.forEach(row => {
            const configs = row.feature_configurations || [];

            // FILTERING LOGIC:
            // Include feature ONLY if it has a 'GLOBAL' config OR a specific config for the current country.
            // (e.g. A feature with ONLY 'DE' config should NOT appear for 'FR' user)
            const hasGlobal = configs.some((c: any) => c.country_code === 'GLOBAL');
            const hasLocal = configs.some((c: any) => c.country_code === currentCountry);

            if (!hasGlobal && !hasLocal) {
                return; // Skip filtering
            }

            const phaseId = row.phase_id;
            if (!grouped[phaseId]) grouped[phaseId] = [];

            const feature: Feature = {
                id: row.id,
                name: row.name,
                description: row.description,
                dimension_id: row.dimension_id,
                phase_id: row.phase_id,
                parent_feature_id: row.parent_feature_id,
                dimension_name: row.app_dimensions?.name,
                phase_name: row.phases?.name,
                required_tier: 'TIER_0',
                flavors: []
            };

            // Calculate context-specific config (Local > Global)
            const contextConfigs = configs.filter((c: any) => c.country_code === currentCountry || c.country_code === 'GLOBAL');

            // Populate all flavors (one per tier)
            const tierList = ['TIER_0', 'TIER_1', 'TIER_2', 'TIER_3'];
            tierList.forEach(t => {
                const tierConfigs = contextConfigs.filter((c: any) => c.tier_id === t);
                const bestForTier = tierConfigs.find((c: any) => c.country_code === currentCountry) || tierConfigs.find((c: any) => c.country_code === 'GLOBAL');
                if (bestForTier) {
                    feature.flavors!.push({ tier_id: t, config: bestForTier.config_value });
                }
            });

            // Set effective required_tier as the lowest tier that HAS a config for this feature
            if (feature.flavors!.length > 0) {
                feature.required_tier = feature.flavors![0].tier_id;
            }

            grouped[phaseId].push(feature);
        });
        return grouped;
    });

    // Computed
    readonly stepIndex = computed(() => {
        switch (this.currentStep()) {
            case 'onboarding_context': return 1;
            case 'evaluation': return 2;
            case 'loading': return 3;
            case 'results': return 3;
            case 'dashboard': return 4;
            default: return 0;
        }
    });

    constructor() {
        this.initSession();
    }

    // Feature Helper
    hasFeature(featureId: string): boolean {
        return this.userFeatures().includes(featureId);
    }

    public normalizeTierId(plan: string | undefined): AppPlan {
        if (!plan) return 'TIER_0';
        const p = plan.toString().toLowerCase();
        if (p === 'tier_0' || p === 'freemium' || p === 'free') return 'TIER_0';
        if (p === 'tier_1' || p === 'bronze') return 'TIER_1';
        if (p === 'tier_2' || p === 'silver') return 'TIER_2';
        if (p === 'tier_3' || p === 'gold') return 'TIER_3';
        return 'TIER_0';
    }

    readonly userTierId = computed(() => {
        return this.normalizeTierId(this.userProfile()?.plan);
    });

    readonly userTierRank = computed(() => {
        const id = this.userTierId();
        const ranks: Record<string, number> = { 'TIER_0': 0, 'TIER_1': 1, 'TIER_2': 2, 'TIER_3': 3 };
        return ranks[id] || 0;
    });

    getTierRank(tierId: string | undefined): number {
        const id = this.normalizeTierId(tierId);
        const ranks: Record<string, number> = { 'TIER_0': 0, 'TIER_1': 1, 'TIER_2': 2, 'TIER_3': 3 };
        return ranks[id] || 0;
    }

    getTierClass(tierId: string | undefined): string {
        const id = this.normalizeTierId(tierId);
        switch (id) {
            case 'TIER_3': return 'bg-yellow-400 shadow-[0_0_5px_rgba(250,204,21,0.5)]'; // Gold
            case 'TIER_2': return 'bg-slate-400 shadow-[0_0_5px_rgba(148,163,184,0.5)]'; // Silver
            case 'TIER_1': return 'bg-amber-500 shadow-[0_0_5px_rgba(245,158,11,0.5)]'; // Bronze
            default: return 'bg-slate-600'; // Free/Starter
        }
    }

    getTierTranslationKey(tierId: string | undefined): string {
        const id = this.normalizeTierId(tierId);
        switch (id) {
            case 'TIER_3': return 'COMMON.Tier.Gold';
            case 'TIER_2': return 'COMMON.Tier.Silver';
            case 'TIER_1': return 'COMMON.Tier.Bronze';
            default: return 'COMMON.Tier.Free';
        }
    }

    // Badge Logic helper
    // Determines which plan *introduces* a feature first.
    getFeatureBadge(featureId: string): { label: string, colorClass: string } | null {
        if (!this.showPlanBadges()) return null;

        const plans = this.allPlans();
        const tiers = this.appTiers();
        if (!plans || plans.length === 0 || !tiers || tiers.length === 0) return null;

        // Find the first plan (cheapest) that has this feature
        const featurePlan = plans.find(p => p.features.includes(featureId));

        if (!featurePlan) return null;

        const planId = featurePlan.id;
        const effectiveId = this.normalizeTierId(planId);

        let colorClass = 'bg-gray-100 text-gray-600'; // Default

        switch (effectiveId) {
            case 'TIER_0': colorClass = 'bg-slate-800 text-white'; break;
            case 'TIER_1': colorClass = 'bg-amber-100 text-amber-800 border border-amber-200'; break;
            case 'TIER_2': colorClass = 'bg-slate-200 text-slate-700 border border-slate-300'; break;
            case 'TIER_3': colorClass = 'bg-yellow-100 text-yellow-800 border border-yellow-300'; break;
        }

        // Special concise label logic
        let label = 'FREE';
        if (effectiveId === 'TIER_1') label = 'BRZ';
        else if (effectiveId === 'TIER_2') label = 'SIL';
        else if (effectiveId === 'TIER_3') label = 'GOLD';

        return { label, colorClass };
    }

    async initSession() {
        try {
            // Load Global Config immediately (parallel)
            this.loadGlobalConfig();

            const { session, error } = await this.supabaseService.getSession();
            if (error) {
                console.warn("Session init error (safe to ignore if offline):", error);
                return;
            }
            if (session?.user) {
                await this.processAuthenticatedUser(session.user);
            }
        } catch (e) {
            console.warn("Unexpected session init error:", e);
        }
    }

    async loadGlobalConfig() {
        try {
            const settings = await this.repository.getGlobalSettings();
            this.showPlanBadges.set(settings.show_plan_badges);

            const plans = await this.repository.getPlans();
            // Ensure features are arrays
            const cleanPlans = plans.map(p => ({
                ...p,
                features: Array.isArray(p.features) ? p.features : []
            }));
            this.allPlans.set(cleanPlans);

            const tiers = await this.repository.getTiers();
            this.appTiers.set(tiers);

            // Load Phases and Features Structure
            const phases = await this.repository.getPhases();
            this.phases.set(phases);

            const features = await this.repository.getFeaturesHierarchy();
            this.featuresHierarchy.set(features);

        } catch (e) {
            console.warn("Failed to load global config:", e);
        }
    }

    // --- Auth Actions ---

    async login(email: string, password: string): Promise<boolean> {
        this.isLoading.set(true);
        this.error.set(null);

        try {
            const { user, error } = await this.supabaseService.signIn(email, password);
            if (error) throw error;
            if (user) {
                await this.processAuthenticatedUser(user);
                return true;
            }
        } catch (e: any) {
            let msg = e.message || "Erreur de connexion";
            if (msg.includes("Email not confirmed")) {
                msg = "Email non confirmé. Si vous venez de vous inscrire, vérifiez vos spams ou demandez à l'admin de désactiver la confirmation obligatoire.";
            }
            this.error.set(msg);
        } finally {
            this.isLoading.set(false);
        }
        return false;
    }

    async register(email: string, password: string, fullName: string): Promise<boolean> {
        this.isLoading.set(true);
        this.error.set(null);
        try {
            // L'inscription crée l'utilisateur dans auth.users
            const { user, session, error } = await this.supabaseService.signUp(email, password, fullName);
            if (error) throw error;

            if (user) {
                // Si une session existe (email confirmation désactivé), on essaie de finaliser
                if (session) {
                    try {
                        // On tente de créer le profil, mais on n'échoue pas si ça plante (car le Trigger SQL peut l'avoir déjà fait)
                        await this.repository.createProfile(user.id, email, fullName);
                    } catch (dbError: any) {
                        // On ignore l'erreur RLS (42501) ou Duplicate Key (23505) ici.
                        // Cela signifie généralement que le Trigger a déjà fait le travail ou que la sécurité bloque l'écriture manuelle.
                        console.log("Info: Tentative de création de profil ignorée (gérée par Trigger ou déjà existant).", dbError.message);
                    }

                    await this.processAuthenticatedUser(user);
                    return true;
                } else {
                    // Pas de session => Confirmation Email requise
                    this.error.set("Compte créé ! Veuillez vérifier vos emails pour activer le compte.");
                    return false;
                }
            }
        } catch (e: any) {
            console.error("Registration error:", e);
            let msg = e.message || "Erreur d'inscription";
            const lowerMsg = msg.toLowerCase();

            if (lowerMsg.includes("security purposes") || lowerMsg.includes("seconds") || lowerMsg.includes("rate limit")) {
                msg = "Trop de tentatives rapides. Veuillez patienter une minute avant de réessayer.";
            }

            this.error.set(msg);
        } finally {
            this.isLoading.set(false);
        }
        return false;
    }

    private async processAuthenticatedUser(user: any) {
        // Refresh Global Config now that we are authenticated (or just to be sure)
        await this.loadGlobalConfig();

        // 1. Fetch Profile
        let profile = null;
        try {
            profile = await this.repository.getUserProfile(user.id);
        } catch (e) { console.warn("Could not fetch profile", e); }

        // 2. Load Plan Features based on profile plan
        if (profile) {
            try {
                const features = await this.repository.getPlanFeatures(profile.plan);
                this.userFeatures.set(features);
            } catch (e) {
                console.warn("Could not fetch plan features", e);
                this.userFeatures.set([]);
            }
        }

        // 3. Check 48h Grace Period Logic
        const createdDate = new Date(user.created_at);
        const now = new Date();
        const hoursSinceCreation = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60);

        const isConfirmed = !!user.email_confirmed_at || profile?.email_confirmed === true;

        if (!isConfirmed) {
            if (hoursSinceCreation > 48) {
                this.error.set("Votre période d'essai de 48h est terminée. Veuillez confirmer votre email pour accéder à votre compte.");
                await this.supabaseService.signOut();
                this.currentStep.set('landing');
                return; // Block access
            } else {
                this.showEmailWarning.set(true);
            }
        } else {
            this.showEmailWarning.set(false);
        }

        this.setUserFromSupabase(user, profile);
        console.log('[SessionStore] User processed. Profile:', profile);

        // 4. Force Diagnostic Logic (non-admin)
        const role = profile?.role || user.app_metadata?.role || 'user';
        if (role !== 'admin') {
            const hasDiagnostic = await this.repository.hasDiagnostic(user.id);
            if (!hasDiagnostic) {
                this.currentStep.set('onboarding_context');
                return;
            }
        }

        // 5. Fetch Latest Diagnostic Data to populate Dashboard & Wheel
        try {
            const latestDiag = await this.repository.getLatestDiagnostic(user.id);
            if (latestDiag) {
                this.scores.set(latestDiag.scores);
                this.contextData.set(latestDiag.context);
                this.reportData.set(latestDiag.report);
            }
        } catch (e) {
            console.warn("Failed to load latest diagnostic:", e);
        }

        this.currentStep.set('dashboard');

        // Apply Debug Overrides if they exist
        await this.checkDebugOverrides();
    }

    private setUserFromSupabase(user: any, profile: UserProfile | null = null) {
        const role = profile?.role || user.app_metadata?.role || 'user';
        const lang = profile?.language || 'fr'; // Default to FR

        this.userProfile.set({
            id: user.id,
            email: user.email || '',
            full_name: profile?.full_name || user.user_metadata?.full_name || 'Hôte',
            role: role,
            plan: this.normalizeTierId(profile?.plan),
            subscription_status: profile?.subscription_status || 'active',
            email_confirmed: profile?.email_confirmed || false,
            language: lang,
            avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url || undefined,
            stripe_customer_id: profile?.stripe_customer_id
        });

        // Set App Language
        if (lang) {
            this.translationService.setLanguage(lang as any);
        }

        // Default placeholder data if fetch fails later
        if (!this.contextData()) {
            this.contextData.set({ situation: 'Membre', challenge: 'Optimisation' });
        }
        if (!this.scores()) {
            this.scores.set({ marketing: 0, experience: 0, operations: 0, pricing: 0, accomodation: 0, legal: 0, mindset: 0 });
        }
        if (!this.reportData()) {
            this.reportData.set({
                strengths: ["Diagnostic manquant"], opportunities: ["Faites le diagnostic"],
                recommendedPlan: 'Freemium', planJustification: 'En attente'
            });
        }
    }

    // --- Logic Actions ---

    setContext(data: ContextData): void {
        this.contextData.set(data);
        this.currentStep.set('evaluation');
    }

    async submitEvaluation(scores: Scores): Promise<void> {
        this.scores.set(scores);
        this.currentStep.set('loading');
        this.error.set(null);
        this.isLoading.set(true);

        try {
            const context = this.contextData();
            if (!context) throw new Error("Missing context data");

            // 1. Call AI Logic
            const report = await this.geminiService.generateReport(context, scores);
            this.reportData.set(report);

            // 2. Persist Data via Repository
            await this.repository.saveDiagnosticResult(context, scores, report);

            // 3. Update profile Plan recommendation locally
            if (this.userProfile()) {
                this.userProfile.update(u => u ? { ...u, plan: report.recommendedPlan } : null);
            }

            this.currentStep.set('results');
        } catch (err: any) {
            console.error("Evaluation Error:", err);

            // Safe error extraction
            let msg = 'Une erreur inconnue est survenue.';
            if (err instanceof Error) {
                msg = err.message;
            } else if (typeof err === 'object' && err !== null) {
                // Supabase sometimes returns an error object with message or details
                msg = err.message || err.details || JSON.stringify(err);
            } else if (typeof err === 'string') {
                msg = err;
            }

            this.error.set(msg);
            // Stay on evaluation step to allow retry
            this.currentStep.set('evaluation');
        } finally {
            this.isLoading.set(false);
        }
    }

    enterDashboard(): void {
        this.currentStep.set('dashboard');
    }

    async resetSession(): Promise<void> {
        await this.supabaseService.signOut();
        this.contextData.set(null);
        this.scores.set(null);
        this.reportData.set(null);
        this.userProfile.set(null);
        this.userFeatures.set([]); // Reset features
        this.error.set(null);
        this.showEmailWarning.set(false);
        this.currentStep.set('landing');
    }

    // Debug Helper
    async setRole(role: UserRole) {
        if (this.userProfile()) {
            localStorage.setItem('debug_simulated_role', role);
            this.userProfile.update(u => u ? { ...u, role } : null);
        }
    }

    // Debug Helper
    async setPlan(plan: AppPlan) {
        if (this.userProfile()) {
            // If we are "turning off" simulation (returning to real plan), we might need a way to know what the real plan was. 
            // But simpler: just update and store. "Freemium" is default but we don't know if it's the real one.
            // Ideally we shouldn't persist simulation unless explicitly desired. 
            // Let's assume user wants it persisted.
            localStorage.setItem('debug_simulated_plan', plan);

            const normalizedPlan = this.normalizeTierId(plan);
            this.userProfile.update(u => u ? { ...u, plan: normalizedPlan } : null);
            // Reload features for this plan
            try {
                const features = await this.repository.getPlanFeatures(normalizedPlan);
                this.userFeatures.set(features);
            } catch (e) {
                console.warn("Could not fetch plan features for debug:", e);
            }
        }
    }

    // Internal: Check for debug overrides and apply them
    private async checkDebugOverrides() {
        const debugPlan = localStorage.getItem('debug_simulated_plan') as AppPlan | null;
        if (debugPlan && this.userProfile()) {
            console.log("Applying Debug Plan Override:", debugPlan);
            await this.setPlan(debugPlan);
        }

        const debugRole = localStorage.getItem('debug_simulated_role') as UserRole | null;
        if (debugRole && this.userProfile()) {
            console.log("Applying Debug Role Override:", debugRole);
            this.userProfile.update(u => u ? { ...u, role: debugRole } : null);
        }
    }

    async updateProfile(data: Partial<UserProfile>): Promise<void> {
        const profile = this.userProfile();
        if (!profile) return;

        this.isLoading.set(true);
        try {
            await this.repository.updateUserProfile(profile.id, data);

            // Update local state
            this.userProfile.update(u => u ? { ...u, ...data } : null);

            // Synchronize language if changed
            if (data.language) {
                this.translationService.setLanguage(data.language as any);
            }
        } catch (e) {
            console.error("Failed to update profile:", e);
            throw e;
        } finally {
            this.isLoading.set(false);
        }
    }
}
