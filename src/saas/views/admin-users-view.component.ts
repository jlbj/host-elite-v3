
import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HostRepository } from '../../services/host-repository.service';
import { SessionStore } from '../../state/session.store';
import { UserProfile, AppPlan, ApiKey, PlanConfig, Feature } from '../../types';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AIProviderType } from '../../services/ai/ai.service';
import { AIConfigService } from '../../services/ai/ai-config.service';

@Component({
    selector: 'saas-admin-users-view',
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    changeDetection: ChangeDetectionStrategy.OnPush,
    styles: [`
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(5px); }
        to { opacity: 1; transform: translateY(0); }
    }
    .animate-fade-in {
        animation: fadeIn 0.4s ease-out forwards;
    }
    @keyframes bounceIn {
        0% { transform: scale(0.1); opacity: 0; }
        60% { transform: scale(1.2); opacity: 1; }
        100% { transform: scale(1); }
    }
    .animate-bounce-in {
        animation: bounceIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .toggle-checkbox:checked {
        right: 0;
        border-color: #68D391;
    }
    .toggle-checkbox {
        right: auto;
        left: 0;
        transition: all 0.3s;
    }
    .toggle-checkbox:checked {
        left: auto;
        right: 0;
    }
  `],
    templateUrl: './admin-users-view.component.html'
})
export class AdminUsersViewComponent implements OnInit {
    private repository = inject(HostRepository);
    private store = inject(SessionStore);
    private fb: FormBuilder = inject(FormBuilder);
    private aiConfigService = inject(AIConfigService);

    // Global Config (Linked to store for reading, but local signal for form state)
    showPlanBadges = signal(false);

    // Users State
    users = signal<UserProfile[]>([]);
    isUserModalOpen = signal(false);
    editingUserId = signal<string | null>(null);

    // API Keys State
    apiKeys = signal<ApiKey[]>([]);
    isKeyModalOpen = signal(false);
    processingKeyId = signal<string | null>(null);

    // Plans State
    plans = signal<PlanConfig[]>([]);
    loadingPlans = signal(false);

    // New Features Matrix State
    allFeatures = signal<Feature[]>([]);
    selectedCountry = signal<string>('GLOBAL');
    isConfigModalOpen = signal(false);
    editingConfig = signal<{ feature: Feature, tierId: string, value: any } | null>(null);
    configJsonStr = signal('');
    availableCountries = ['GLOBAL', 'FR', 'ES', 'UK', 'DE'];
    availableTiers = ['TIER_0', 'TIER_1', 'TIER_2', 'TIER_3'];

    // Search/Filter
    featureSearch = signal('');

    // AI Config State
    aiProvider = signal<AIProviderType>('gemini');
    aiModel = signal<string>('gemini-2.0-flash');
    availableProviders: AIProviderType[] = ['gemini', 'openai', 'claude', 'openrouter', 'ollama'];
    isAiConfigSaving = signal(false);

    // Built-in Templates and Help
    readonly FEATURE_TEMPLATES: Record<string, any> = {
        'FIN_01': { projects_limit: 5, export_pdf: true },
        'FIN_02': { export_pdf: true },
        'FIN_03': { calculation_method: 'LMNP_2024', social_security: true },
        'FIN_04': { mode: 'advanced_relief' },
        'FIN_05': { history_months: 6 },
        'FIN_06': { export_format: 'FEC_2025' },
        'FIN_08': { commission_rate: 20 },
        'FIN_09': { fixed_management_fee: 50 },
        'LEG_01': { view_only: true },
        'LEG_03': { auto_fill: true },
        'EXP_01': { format: 'pdf', custom_logo: false },
        'EXP_02': { rooms_limit: 15 },
        'EXP_03': { custom_domain: false, branding_color: '#4F46E5' },
        'EXP_04': { support_languages: ['FR', 'EN'] },
        'OPS_01': { calendar_sync: true },
        'OPS_02': { sync_interval_min: 60 },
        'OPS_03': { max_listings: 10, channel_refresh_min: 30 },
        'OPS_06': { seats_limit: 5, roles: ['manager', 'cleaner'] },
        'OPS_08': { automated_tasks: true },
        'OPS_11': { photo_proof_required: true },
        'MKT_01': { guide_level: 'expert' },
        'MKT_02': { monthly_description_limit: 10, ai_model: 'gpt-4' },
        'PRI_01': { strategy: 'balanced' },
        'PRI_02': { dynamic_pricing: true },
        'PRI_03': { alert_threshold_percent: 10 }
    };

    readonly FEATURE_HELP: Record<string, string> = {
        'FIN_01': 'projects_limit (int): Max projects, export_pdf (bool): Enable PDF export',
        'FIN_02': 'export_pdf (bool): Allow budget PDF export',
        'FIN_03': 'calculation_method (string): LMNP_2024/SCI, social_security (bool)',
        'FIN_04': 'mode (string): basic_relief/advanced_relief',
        'FIN_05': 'history_months (int): Months of stats history',
        'FIN_06': 'export_format (string): FEC_2025/EXCEL_V1',
        'FIN_08': 'commission_rate (int): Manager share (0-100)',
        'FIN_09': 'fixed_management_fee (int): Monthly fixed fee',
        'LEG_01': 'view_only (bool): Restrict interaction to read-only',
        'LEG_03': 'auto_fill (bool): Auto-fill official Cerfa fields',
        'EXP_01': 'format (string): pdf/digital, custom_logo (bool)',
        'EXP_02': 'rooms_limit (int): Max rooms in inventory',
        'EXP_03': 'custom_domain (bool): Enable CNAME support, branding_color (hex)',
        'EXP_04': 'support_languages (array[string]): UI languages for guest AI',
        'OPS_01': 'calendar_sync (bool): Enable external iCal import',
        'OPS_02': 'sync_interval_min (int): Minutes between background syncs',
        'OPS_03': 'max_listings (int): Multi-calendar limit, channel_refresh_min (int)',
        'OPS_06': 'seats_limit (int): Extra staff IDs, roles (array): [manager, cleaner, inspector]',
        'OPS_08': 'automated_tasks (bool): Enable rule-based scheduling',
        'OPS_11': 'photo_proof_required (bool): Staff must upload photos for validation',
        'MKT_01': 'guide_level (string): basic/expert instructions',
        'MKT_02': 'monthly_description_limit (int): AI tokens per month, ai_model (string)',
        'PRI_01': 'strategy (string): aggressive/balanced/economy',
        'PRI_02': 'dynamic_pricing (bool): Enable real-time rate adjustments',
        'PRI_03': 'alert_threshold_percent (int): Sensitivity for market trend notifications'
    };

    // General State
    successMessage = signal<string | null>(null);
    showSqlError = signal(false);

    userForm: FormGroup;
    apiKeyForm: FormGroup;

    // Dictionary of all possible features in the system
    readonly availableFeatures = [
        { id: 'wheel', label: 'Roue de l\'Hôte (Diag)' },
        { id: 'report', label: 'Rapport IA' },
        { id: 'microsite', label: 'Microsite Public' },
        { id: 'booklet', label: 'Livret d\'Accueil' },
        { id: 'checklists', label: 'Checklists Opér.' },
        { id: 'ical-sync', label: 'Synchro iCal' },
        { id: 'ai-assistant', label: 'Assistant IA (Msg)' },
        { id: 'ai-prompts', label: 'IA Générative (Remplissage)' },
        { id: 'vocal-concierge', label: 'Concierge Vocal' },
        { id: 'training', label: 'Académie' },
        { id: 'analytics', label: 'Analytics' },
        { id: 'coaching', label: 'Coaching' }
    ];

    constructor() {
        this.userForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            fullName: ['', Validators.required],
            role: ['user', Validators.required],
            plan: ['Freemium', Validators.required],
            email_confirmed: [true]
        });

        this.apiKeyForm = this.fb.group({
            name: ['', Validators.required],
            provider: ['gemini', Validators.required],
            key: ['', Validators.required]
        });
    }

    async ngOnInit() {
        this.refreshSettings();
        this.refreshUsers();
        this.refreshApiKeys();
        this.refreshPlans();
        this.refreshFeatures();
        this.refreshAiConfig();
    }

    async refreshAiConfig() {
        try {
            await this.aiConfigService.initialize();
            this.aiProvider.set(this.aiConfigService.activeProvider);
            this.aiModel.set(this.aiConfigService.activeModel);
        } catch (e) {
            console.error("Error loading AI config:", e);
        }
    }

    async saveAiConfig() {
        this.isAiConfigSaving.set(true);
        try {
            await this.aiConfigService.setProviderAndSave(this.aiProvider(), this.aiModel());
            this.showSuccess(`IA configurée: ${this.aiProvider()} / ${this.aiModel()}`);
        } catch (e: any) {
            console.error("Error saving AI config:", e);
            alert(`Erreur: ${e?.message || e}`);
        } finally {
            this.isAiConfigSaving.set(false);
        }
    }

    async refreshFeatures() {
        try {
            const features = await this.repository.getFeaturesHierarchy();
            this.allFeatures.set(features);
        } catch (e) {
            console.error("Error fetching features:", e);
        }
    }

    async refreshSettings() {
        try {
            const settings = await this.repository.getGlobalSettings();
            this.showPlanBadges.set(settings.show_plan_badges);
            // Sync store immediately to ensure sidebar reflects current DB state on load
            this.store.showPlanBadges.set(settings.show_plan_badges);
        } catch (e) {
            console.error("Error loading settings:", e);
        }
    }

    async refreshUsers() {
        try {
            const users = await this.repository.getAllUsers();
            this.users.set(users);
        } catch (e) {
            console.error("Error refreshing users:", e);
        }
    }

    async refreshApiKeys() {
        try {
            const keys = await this.repository.listApiKeys();
            this.apiKeys.set(keys);
        } catch (e: any) {
            console.error("Error fetching API keys:", e);
        }
    }

    async refreshPlans() {
        this.loadingPlans.set(true);
        try {
            const data = await this.repository.getPlans();
            // Ensure features is array
            const cleanData = data.map(p => ({
                ...p,
                features: Array.isArray(p.features) ? p.features : []
            }));
            this.plans.set(cleanData);
            // Update store plans too to ensure badge logic is up to date
            this.store.allPlans.set(cleanData);
        } catch (e) {
            console.error("Error fetching plans:", e);
        } finally {
            this.loadingPlans.set(false);
        }
    }

    // Helper to extract clean message from Error object or Supabase PostgREST error
    private getErrorMessage(e: any): string {
        console.log('Raw error object:', e);
        if (!e) return "Erreur inconnue";

        if (typeof e === 'string') return e;
        if (e instanceof Error) return e.message;

        const code = e.code;
        let message = e.message || e.msg || e.error_description;

        if (typeof message === 'object' && message !== null) {
            try {
                message = JSON.stringify(message);
            } catch {
                message = "Détails illisibles";
            }
        }

        if (message && typeof message === 'string') {
            return code ? `Erreur (${code}): ${message}` : message;
        }

        if (code) {
            return `Erreur SQL ${code}: ${e.details || e.hint || 'Détails non disponibles'}`;
        }

        try {
            return JSON.stringify(e);
        } catch (err) {
            return "Erreur (Objet non affichable)";
        }
    }

    // New Helper for RLS Error Handling
    private handleDatabaseError(e: any) {
        console.error("DB Error:", e);
        const code = (e as any).code;

        if (code === "RLS_BLOCKED_PROFILE" || code === "RLS_BLOCKED_PLAN") {
            alert("Erreur de permission : La base de données a bloqué la modification (RLS). Veuillez vérifier les logs console pour le script SQL de correction.");
            console.warn(`
⚠️ SQL FIX SUGGESTION FOR RLS ⚠️
--------------------------------
-- 1. Activer RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_plans ENABLE ROW LEVEL SECURITY;

-- 2. Policies pour PROFILS
DROP POLICY IF EXISTS "Read all profiles" ON profiles;
CREATE POLICY "Read all profiles" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Update own profile" ON profiles;
CREATE POLICY "Update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admin update all profiles" ON profiles;
CREATE POLICY "Admin update all profiles" ON profiles FOR UPDATE USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);

-- 3. Policies pour PLANS
DROP POLICY IF EXISTS "Read plans" ON app_plans;
CREATE POLICY "Read plans" ON app_plans FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin update plans" ON app_plans;
CREATE POLICY "Admin update plans" ON app_plans FOR UPDATE USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
);
          `);
            return;
        }

        const err = this.getErrorMessage(e);
        alert(`Erreur: ${err}`);
    }

    // --- SETTINGS ACTIONS ---
    async toggleBadges(event: Event) {
        const isChecked = (event.target as HTMLInputElement).checked;

        // 1. Update Local UI State
        this.showPlanBadges.set(isChecked);

        // 2. Update Global Store (Instant feedback for Sidebar)
        this.store.showPlanBadges.set(isChecked);

        // 3. Persist to DB
        try {
            await this.repository.updateGlobalSettings({ show_plan_badges: isChecked });
            this.showSuccess("Paramètres globaux mis à jour.");
        } catch (e) {
            console.error(e);
            // Revert on error
            this.showPlanBadges.set(!isChecked);
            this.store.showPlanBadges.set(!isChecked);
            this.handleDatabaseError(e);
        }
    }

    // --- API KEY ACTIONS ---

    openAddKeyModal() {
        this.apiKeyForm.reset();
        this.isKeyModalOpen.set(true);
    }

    closeKeyModal() {
        this.isKeyModalOpen.set(false);
    }

    async submitApiKey() {
        if (this.apiKeyForm.valid) {
            const { name, provider, key } = this.apiKeyForm.value;
            try {
                await this.repository.addApiKey(name, key, provider);
                this.showSuccess(`Clé ${provider.toUpperCase()} ajoutée !`);
                this.closeKeyModal();
                await this.refreshApiKeys();
            } catch (e: any) {
                console.error(e);
                alert(`Erreur lors de l'ajout : ${this.getErrorMessage(e)}`);
            }
        }
    }

    async activateKey(key: ApiKey) {
        if (this.processingKeyId()) return;

        this.processingKeyId.set(key.id);
        try {
            await this.repository.setActiveApiKey(key.id);
            this.showSuccess(`Clé "${key.name}" activée.`);
            await this.refreshApiKeys();
        } catch (e: any) {
            console.error("Activation failed:", e);
            const msg = this.getErrorMessage(e);
            const hint = (msg.includes('function') || (e && e.code === '42883'))
                ? "\n\nAstuce: Vérifiez que la fonction SQL 'set_active_api_key' existe dans Supabase."
                : "";

            alert(`Erreur lors de l'activation : ${msg}${hint}`);
        } finally {
            this.processingKeyId.set(null);
        }
    }

    async deleteApiKey(key: ApiKey) {
        if (confirm(`Supprimer la clé "${key.name}" ?`)) {
            this.processingKeyId.set(key.id);
            try {
                await this.repository.deleteApiKey(key.id);
                this.showSuccess("Clé supprimée.");
                await this.refreshApiKeys();
            } catch (e: any) {
                alert(`Erreur lors de la suppression : ${this.getErrorMessage(e)}`);
            } finally {
                this.processingKeyId.set(null);
            }
        }
    }

    // --- PLANS ACTIONS ---

    getPlanStyle(planId: string): { header: string, text: string, accent: string } {
        const id = planId.toLowerCase();
        if (id.includes('freemium')) return { header: 'bg-slate-900 text-white', text: 'text-slate-900', accent: 'accent-slate-900' };
        if (id.includes('bronze')) return { header: 'bg-amber-700 text-white', text: 'text-amber-800', accent: 'accent-amber-700' };
        if (id.includes('silver')) return { header: 'bg-slate-400 text-white', text: 'text-slate-600', accent: 'accent-slate-400' };
        if (id.includes('gold')) return { header: 'bg-yellow-500 text-white', text: 'text-yellow-600', accent: 'accent-yellow-500' };
        return { header: 'bg-indigo-600 text-white', text: 'text-indigo-900', accent: 'accent-indigo-600' };
    }

    isFeatureEnabled(plan: PlanConfig, featureId: string): boolean {
        return plan.features.includes(featureId);
    }

    toggleFeature(plan: PlanConfig, featureId: string, event: Event) {
        const checked = (event.target as HTMLInputElement).checked;
        let newFeatures = [...plan.features];

        if (checked) {
            if (!newFeatures.includes(featureId)) newFeatures.push(featureId);
        } else {
            newFeatures = newFeatures.filter(f => f !== featureId);
        }

        // Optimistic Update for UI responsiveness
        const updatedPlans = this.plans().map(p => p.id === plan.id ? { ...p, features: newFeatures } : p);
        this.plans.set(updatedPlans);

        // Update Store immediately so badges update in Sidebar
        this.store.allPlans.set(updatedPlans);

        // Auto-save logic
        this.savePlan({ ...plan, features: newFeatures });
    }

    updatePrice(plan: PlanConfig, event: Event) {
        const newPrice = Number((event.target as HTMLInputElement).value);
        this.plans.update(plans => plans.map(p => p.id === plan.id ? { ...p, price: newPrice } : p));
        this.savePlan({ ...plan, price: newPrice });
    }

    async savePlan(plan: PlanConfig) {
        try {
            await this.repository.updatePlanConfig(plan.id, plan.price, plan.features);
            this.showSuccess(`Offre ${plan.id} mise à jour !`);
            // Verify persistence
            await this.refreshPlans();
        } catch (e: any) {
            this.handleDatabaseError(e);
            this.refreshPlans(); // Revert
        }
    }

    // --- FEATURE MATRIX ACTIONS ---

    getTierName(tierId: string): string {
        const names: Record<string, string> = {
            'TIER_0': 'Free',
            'TIER_1': 'Bronze',
            'TIER_2': 'Silver',
            'TIER_3': 'Gold'
        };
        return names[tierId] || tierId;
    }

    getFeatureConfig(feature: Feature, tierId: string, country: string): any {
        // Find exact match (Feature + Tier + Country)
        let config = feature.feature_configurations?.find((c: any) =>
            c.tier_id === tierId && c.country_code === country
        );

        // Fallback to GLOBAL for same tier
        if (!config && country !== 'GLOBAL') {
            config = feature.feature_configurations?.find((c: any) =>
                c.tier_id === tierId && c.country_code === 'GLOBAL'
            );
        }

        return config ? config.config_value : null;
    }

    getFilteredFeatures() {
        const search = this.featureSearch().toLowerCase();
        return this.allFeatures().filter(f =>
            f.name.toLowerCase().includes(search) ||
            f.dimension_name?.toLowerCase().includes(search) ||
            f.phase_name?.toLowerCase().includes(search)
        ).sort((a, b) => (a.phase_id + a.dimension_id).localeCompare(b.phase_id + b.dimension_id));
    }

    openConfigEditor(feature: Feature, tierId: string) {
        const currentValue = this.getFeatureConfig(feature, tierId, this.selectedCountry());
        this.editingConfig.set({ feature, tierId, value: currentValue });
        this.configJsonStr.set(JSON.stringify(currentValue || {}, null, 2));
        this.isConfigModalOpen.set(true);
    }

    closeConfigModal() {
        this.isConfigModalOpen.set(false);
        this.editingConfig.set(null);
    }

    async saveFeatureConfig() {
        const editing = this.editingConfig();
        if (!editing) return;

        try {
            const newValue = JSON.parse(this.configJsonStr());
            await this.repository.upsertFeatureConfiguration(
                editing.feature.id,
                editing.tierId,
                this.selectedCountry(),
                newValue
            );
            this.showSuccess(`Configuration ${editing.feature.name} enregistrée pour ${this.selectedCountry()}.`);
            this.closeConfigModal();
            await this.refreshFeatures();
        } catch (e: any) {
            alert("Erreur JSON ou DB : " + e.message);
        }
    }

    applyTemplate() {
        const editing = this.editingConfig();
        if (!editing) return;

        const template = this.FEATURE_TEMPLATES[editing.feature.id] || {};
        this.configJsonStr.set(JSON.stringify(template, null, 2));
    }

    async toggleFeatureActive(feature: Feature, event: Event) {
        const isChecked = (event.target as HTMLInputElement).checked;
        try {
            await this.repository.toggleFeatureActive(feature.id, isChecked);
            this.showSuccess(`Fonctionnalité "${feature.name}" ${isChecked ? 'activée' : 'désactivée'}.`);
            await this.refreshFeatures();
        } catch (e: any) {
            this.handleDatabaseError(e);
            await this.refreshFeatures();
        }
    }

    // --- USER ACTIONS ---

    showSuccess(msg: string) {
        this.successMessage.set(msg);
        setTimeout(() => this.successMessage.set(null), 3000);
    }

    async updatePlan(user: UserProfile, newPlan: AppPlan) {
        try {
            await this.repository.updateUserProfile(user.id, { plan: newPlan });
            // Force refresh from DB to confirm persistence and remove any doubt
            await this.refreshUsers();
            this.showSuccess(`Plan de ${user.full_name} mis à jour vers ${newPlan} !`);
        } catch (e: any) {
            this.handleDatabaseError(e);
            // Refresh to revert UI to actual DB state
            await this.refreshUsers();
        }
    }

    async toggleEmailConfirmed(user: UserProfile, event: Event) {
        const isChecked = (event.target as HTMLInputElement).checked;
        try {
            this.users.update(users => users.map(u => u.id === user.id ? { ...u, email_confirmed: isChecked } : u));
            await this.repository.toggleUserConfirmation(user.id, isChecked);
            this.showSuccess('Accès utilisateur mis à jour (Sync Auth) !');
        } catch (e: any) {
            console.error("RPC Error details:", e);
            const errorStr = this.getErrorMessage(e);

            if (errorStr.includes('function') && (errorStr.includes('does not exist') || errorStr.includes('not found'))) {
                this.showSqlError.set(true);
                alert("Erreur SQL: Fonction manquante. Vérifiez les scripts Supabase.");
            } else {
                alert("Erreur: " + errorStr);
            }
            this.refreshUsers();
        }
    }

    async deleteUser(user: UserProfile) {
        if (confirm(`Êtes-vous sûr de vouloir supprimer ${user.full_name} ?`)) {
            try {
                await this.repository.deleteUser(user.id);
                this.showSuccess('Utilisateur supprimé !');
                this.refreshUsers();
            } catch (e) {
                alert("Erreur lors de la suppression.");
            }
        }
    }

    async resetPassword(user: UserProfile) {
        if (confirm(`Voulez-vous envoyer un email de réinitialisation de mot de passe à ${user.email} ?`)) {
            try {
                await this.repository.resetUserPassword(user.email);
                this.showSuccess('Email de réinitialisation envoyé !');
            } catch (e: any) {
                alert(`Erreur: ${this.getErrorMessage(e)}`);
            }
        }
    }

    openEditUserModal(user: UserProfile) {
        this.editingUserId.set(user.id);
        this.userForm.patchValue({
            email: user.email,
            fullName: user.full_name,
            role: user.role,
            plan: user.plan,
            email_confirmed: user.email_confirmed
        });
        this.isUserModalOpen.set(true);
    }

    openAddUserModal() {
        this.editingUserId.set(null);
        this.userForm.reset({ role: 'user', plan: 'Freemium', email_confirmed: true });
        this.isUserModalOpen.set(true);
    }

    closeUserModal() {
        this.isUserModalOpen.set(false);
        this.editingUserId.set(null);
    }

    async submitUserForm() {
        if (this.userForm.valid) {
            const formData = this.userForm.value;
            const id = this.editingUserId();

            try {
                if (id) {
                    await this.repository.updateUserProfile(id, {
                        email: formData.email,
                        full_name: formData.fullName,
                        role: formData.role,
                        plan: formData.plan
                    });
                    try {
                        await this.repository.toggleUserConfirmation(id, formData.email_confirmed);
                    } catch (rpcError: any) {
                        // Handle potential RPC missing error silently if update succeeded
                    }
                    this.showSuccess('Utilisateur modifié avec succès !');
                } else {
                    await this.repository.createUser(formData);
                    this.showSuccess('Utilisateur créé avec succès !');
                }
                this.closeUserModal();
                this.refreshUsers();
            } catch (e) {
                this.handleDatabaseError(e);
            }
        }
    }
}
