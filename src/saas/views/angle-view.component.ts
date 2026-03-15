
import { ChangeDetectionStrategy, Component, computed, inject, input, signal, OnInit, effect, Type } from '@angular/core';
import { FEATURE_COMPONENTS } from '../features/feature-registry';

import { CommonModule } from '@angular/common';
import { View, Feature } from '../../types';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HostRepository } from '../../services/host-repository.service';
import { GeminiService } from '../../services/gemini.service';
import { SessionStore } from '../../state/session.store';

import { MicrositeConfig, BuilderPhoto, SectionDef, resolveMicrositeConfig } from './welcome-booklet/booklet-definitions';
import { MicrositeContainerComponent } from '../features/legacy/microsite/microsite-container.component';
import { AiPromptsComponent } from '../features/legacy/ai-prompts/ai-prompts.component';
import { VisibilityAuditComponent } from '../features/legacy/visibility-audit/visibility-audit.component';
import { BookletToolComponent } from '../features/legacy/booklet-tool/booklet-tool.component';
import { AiMessageAssistantComponent } from '../features/legacy/ai-message-assistant/ai-message-assistant.component';
import { ChecklistsToolComponent } from '../features/legacy/checklists/checklists-tool.component';
import { DelegationSimulatorComponent } from '../features/legacy/delegation/delegation-simulator.component';
import { CalendarToolComponent } from '../features/legacy/calendar-tool/components/calendar-tool.component';
import { ProfitabilityCalculatorComponent } from '../features/legacy/profitability/profitability-calculator.component';
import { MarketAlertsComponent } from '../features/legacy/market-alerts/market-alerts.component';
import { PropertyAuditComponent } from '../features/legacy/property-audit/property-audit.component';
import { TranslationService } from '../../services/translation.service';

import { TranslatePipe } from '../../pipes/translate.pipe';
import { WelcomeBookletService } from './welcome-booklet/welcome-booklet.service';
import { OnboardingService, OnboardingQuestion } from '../../services/onboarding.service';
import { DEFAULT_QUESTIONS } from '../../services/data/default-questions';
import { WelcomeBookletViewComponent } from './welcome-booklet-view.component';



@Component({
    selector: 'saas-angle-view',
    standalone: true,
    imports: [
        CommonModule,
        TranslatePipe,
        ReactiveFormsModule,
        AiPromptsComponent,
        VisibilityAuditComponent,
        BookletToolComponent,
        AiMessageAssistantComponent,
        ChecklistsToolComponent,
        MicrositeContainerComponent,
        DelegationSimulatorComponent,
        CalendarToolComponent,
        ProfitabilityCalculatorComponent,
        MarketAlertsComponent,
        PropertyAuditComponent,
        WelcomeBookletViewComponent
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './angle-view.component.html',
})
export class PhaseViewComponent implements OnInit {
    translationService = inject(TranslationService);
    view = input.required<View>();
    userPlan = input.required<string>();

    private repository = inject(HostRepository);
    public store = inject(SessionStore); // Public for template access
    private bookletService = inject(WelcomeBookletService);
    private onboardingService = inject(OnboardingService);
    private fb: FormBuilder = inject(FormBuilder);
    private geminiService = inject(GeminiService); // Injected but maybe unused if logic moved

    // Legacy support state
    activeToolId = signal<string | null>(null);
    currentPropertyId = signal<string | null>(null);
    propertyDetails = signal<any>(null);
    isModalOpen = signal(false);
    onboardingForm = signal<FormGroup | null>(null);
    currentQuestions = signal<OnboardingQuestion[]>([]);
    saveMessage = signal<string | null>(null);

    // New Feature System State
    activeFeatureComponent = signal<Type<any> | null>(null);
    activeFeature = signal<Feature | null>(null);

    // Maturity for legacy badge in header
    maturityInfo = signal<any>(null);

    // Computed Data for Phase View
    phaseFeatures = computed(() => {
        const viewId = this.view().id;
        const allFeatures = this.store.featuresByPhase();
        return allFeatures[viewId] || [];
    });

    phaseDimensions = computed(() => {
        const features = this.phaseFeatures();
        const groups: Record<string, { id: string, name: string, features: Feature[] }> = {};

        features.forEach(f => {
            const dimId = f.dimension_id;
            if (!groups[dimId]) {
                groups[dimId] = {
                    id: dimId,
                    name: f.dimension_name || dimId,
                    features: []
                };
            }
            groups[dimId].features.push(f);
        });

        const result = Object.values(groups);

        // Move Operations (DIM_OPS) to the front
        const opsIndex = result.findIndex(d => d.id === 'DIM_OPS');
        if (opsIndex > 0) {
            const opsDim = result.splice(opsIndex, 1)[0];
            result.unshift(opsDim);
        }

        return result;
    });

    private legacyToolMapping: Record<string, string> = {
        'EXP_01': 'booklet',
        'EXP_02': 'ai-assistant',
        'EXP_03': 'microsite',
        'EXP_04': 'ai-assistant',
        'OPS_01': 'construction-schedule',
        'OPS_02': 'calendar-sync',
        'OPS_03': 'calendar-sync',
        'OPS_11': 'checklists',
        'FIN_01': 'profitability',
        'FIN_09': 'delegation-sim',
        'PRI_03': 'market-alerts',
        'LEG_00': 'property-audit'
    };

    constructor() {
        effect(() => {
            this.activeToolId.set(null);
            this.activeFeature.set(null);
            this.activeFeatureComponent.set(null);
            this.loadPropertyData();
            const currentProp = this.view().propertyName;
            if (currentProp && this.bookletService.propertyName() !== currentProp) {
                this.bookletService.propertyName.set(currentProp);
            }
        });
    }

    ngOnInit() {
        this.loadPropertyData();
    }

    async loadPropertyData() {
        const v = this.view();
        if (v.propertyName) {
            try {
                const prop = await this.repository.getPropertyByName(v.propertyName);
                if (prop) {
                    this.currentPropertyId.set(prop.id);
                    this.propertyDetails.set(prop);
                }
            } catch (e) {
                console.error("Error loading property:", e);
            }
        }
    }

    openFeature(feature: Feature) {
        this.activeToolId.set(null);
        this.activeFeatureComponent.set(null);

        const ComponentClass = FEATURE_COMPONENTS[feature.id];
        if (ComponentClass) {
            this.activeFeature.set(feature);
            this.activeFeatureComponent.set(ComponentClass);
            return;
        }


        const legacyId = this.legacyToolMapping[feature.id];
        if (legacyId) {
            this.activeToolId.set(legacyId);
        } else {
            console.log("Opening new feature (not implemented):", feature.name);
            this.saveMessage.set(`Feature "${feature.name}" is coming soon!`);
            setTimeout(() => this.saveMessage.set(null), 3000);
        }
    }

    closeTool() {
        this.activeToolId.set(null);
        this.activeFeatureComponent.set(null);
    }


    isFeatureLocked(feature: Feature): boolean {
        return this.store.userTierRank() < this.store.getTierRank(feature.required_tier);
    }

    isFlavorLocked(tierId: string): boolean {
        return this.store.userTierRank() < this.store.getTierRank(tierId);
    }

    formatFlavor(tierId: string, config: any): string {
        if (!config) return '';
        if (config.projects_limit) return `${config.projects_limit} Prj`;
        if (config.monthly_limit) return `${config.monthly_limit} Gen`;
        if (config.model) return `AI: ${config.model}`;
        if (config.export_pdf) return `PDF Exp`;
        if (config.custom_branding) return `Branding`;
        if (config.automation === 'full_api') return `API Auto`;
        if (config.mode === 'advanced_amortization') return `Adv Amort`;
        if (config.refresh_rate) return `Ref: ${config.refresh_rate}`;
        if (config.strategies) return `Strat: ${config.strategies.length}`;
        return 'Premium';
    }

    getSortedFlavors(feature: Feature) {
        if (!feature.flavors) return [];
        return [...feature.flavors].sort((a, b) => this.store.getTierRank(a.tier_id) - this.store.getTierRank(b.tier_id));
    }

    getTierClass(tier: string | undefined): string {
        return this.store.getTierClass(tier);
    }

    getTierLabel(tier: string | undefined): string {
        return this.translationService.translate(this.store.getTierTranslationKey(tier));
    }

    // --- Property Audit / Onboarding Logic ---

    async openPropertyAudit(dimensionId: string) {
        try {
            const propertyId = this.currentPropertyId();
            if (!propertyId) return;

            console.log("Opening Property Audit for dimension:", dimensionId);

            // Map dimension ID if necessary? 
            // The DB dimensions are 'MKT', 'EXP', 'OPS', etc.
            // The property audit expects 'DIM_MKT', 'DIM_EXP', etc.
            let legacyDimId = dimensionId;
            if (!dimensionId.startsWith('DIM_')) {
                const map: Record<string, string> = {
                    'Marketing': 'DIM_MKT', 'marketing': 'DIM_MKT', 'MKT': 'DIM_MKT',
                    'Experience': 'DIM_EXP', 'experience': 'DIM_EXP', 'EXP': 'DIM_EXP',
                    'Operations': 'DIM_OPS', 'operations': 'DIM_OPS', 'OPS': 'DIM_OPS',
                    'Pricing': 'DIM_PRICING', 'pricing': 'DIM_PRICING', 'PRI': 'DIM_PRICING',
                    'Legal': 'DIM_LEGAL', 'legal': 'DIM_LEGAL', 'LEG': 'DIM_LEGAL',
                    'Mindset': 'mindset', 'mindset': 'mindset',
                    'Finance': 'DIM_FINANCE', 'finance': 'DIM_FINANCE', 'FIN': 'DIM_FINANCE'
                };
                legacyDimId = map[dimensionId] || map[dimensionId.charAt(0).toUpperCase() + dimensionId.slice(1)] || dimensionId;
            }
            console.log("Mapped to Legacy ID:", legacyDimId);

            // Load questions
            let questions: OnboardingQuestion[] = [];
            try {
                questions = await this.onboardingService.getQuestionsByDimension(legacyDimId);
            } catch (err) {
                console.warn(`[PropertyAudit] DB fetch failed for ${legacyDimId}, falling back to synthetic generation.`, err);
                questions = [];
            }

            // Seeding Logic: Ensure Default Questions Exist
            // Primarily for DIM_OPS but we can extend for others if we have default data
            if (legacyDimId === 'DIM_OPS') {
                await this.onboardingService.ensureQuestions(DEFAULT_QUESTIONS);
            }

            // Re-fetch in case we just seeded
            if (questions.length === 0) {
                try {
                    questions = await this.onboardingService.getQuestionsByDimension(legacyDimId);
                } catch (err) {
                    console.warn(`[PropertyAudit] Retry fetch failed for ${legacyDimId}`, err);
                }
            }

            if (!questions || questions.length === 0) {
                // Fallback or alert
                console.warn("No questions for", legacyDimId);
                this.saveMessage.set("Audit non disponible pour cette dimension.");
                setTimeout(() => this.saveMessage.set(null), 3000);
                return;
            }

            this.currentQuestions.set(questions);

            let answersMap = new Map<string, any>();
            try {
                // If we are using synthetic questions (because DB fetch failed), 
                // getAnswers will likely fail too if it tries to fetch questions again.
                // We should ideally have a way to fetch answers without fetching questions,
                // but for now, we just suppress the error to ensure the modal opens.
                answersMap = await this.onboardingService.getAnswers(propertyId, legacyDimId);
            } catch (err) {
                console.warn("[LegacyAudit] Failed to load existing answers:", err);
            }
            const formControls = questions.reduce((acc, q) => {
                const answer = answersMap.get(q.id);
                acc[q.id] = [answer ? answer.answer : false];
                if (q.sub_question_config) {
                    acc[q.sub_question_config.id] = [answer ? answer.sub_answer : ''];
                }
                return acc;
            }, {} as Record<string, any>);

            this.onboardingForm.set(this.fb.group(formControls));
            this.isModalOpen.set(true);

        } catch (e) {
            console.error("Error opening audit:", e);
        }
    }

    closeOnboarding() {
        this.isModalOpen.set(false);
    }

    async saveOnboarding() {
        // Reuse logic
        const form = this.onboardingForm();
        const propertyId = this.currentPropertyId();
        const questions = this.currentQuestions();

        console.log('Attempting to save onboarding...');
        console.log('Form Valid:', form?.valid);
        console.log('Form Value:', form?.value);
        console.log('Property ID:', propertyId);
        console.log('Questions Count:', questions.length);

        if (!form?.valid) {
            console.warn('Cannot save: Form is invalid.');
            // Log invalid controls
            Object.keys(form.controls).forEach(key => {
                if (form.get(key)?.invalid) {
                    console.log(`Invalid control: ${key}`, form.get(key)?.errors);
                }
            });
            alert("Form is invalid. Please check all fields."); // Temporary alert for user feedback
            return;
        }

        if (form?.valid && propertyId && questions.length > 0) {
            try {
                const formValues = form.value;
                const answersToSave = questions.map(q => ({
                    question_id: q.id,
                    answer: formValues[q.id],
                    sub_answer: q.sub_question_config ? formValues[q.sub_question_config.id] : undefined
                }));

                // Ensure questions exist in DB (if they were synthetic)
                await this.onboardingService.ensureQuestions(questions);

                await this.onboardingService.saveAnswers(propertyId, answersToSave);
                this.saveMessage.set(this.translationService.translate('COMMON.AuditSaved'));
                setTimeout(() => this.saveMessage.set(null), 3000);
                this.closeOnboarding();
            } catch (error) {
                console.error('Error saving onboarding:', error);
            }
        }
    }
}
