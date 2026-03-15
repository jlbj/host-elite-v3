import { Component, input, computed, inject, signal, OnInit, effect, untracked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService } from '../../../../services/translation.service';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, FormsModule } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { Feature } from '../../../../types';
import { SessionStore } from '../../../../state/session.store';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { GeminiService } from '../../../../services/gemini.service';
import { TaxService } from '../../../../services/tax.service';
import { HostRepository } from '../../../../services/host-repository.service';
import { FeatureGatingComponent } from '../../../components/feature-gating.component';

@Component({
    selector: 'fin-01-roi-simulator',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslatePipe, FeatureGatingComponent],
    templateUrl: './roi-simulator.component.html',
    styles: [`:host { display: block; height: 100%; }`]
})
export class RoiSimulatorComponent {
    protected readonly Infinity = Infinity;
    feature = input.required<Feature>();
    propertyDetails = input<any>();
    session = inject(SessionStore);
    gemini = inject(GeminiService);
    taxService = inject(TaxService);
    hostRepo = inject(HostRepository);
    translation = inject(TranslationService);

    // Collapsible Sections State
    propertyProfilerExpanded = signal(true);
    taxBriefingExpanded = signal(false);
    designExpanded = signal(true);
    expensesExpanded = signal(true);
    seasonalityExpanded = signal(true);

    taxBriefing = signal<string | null>(null);
    isTaxLoading = signal(false);

    aiReport = signal<any>(null);
    isGeneratingReport = signal(false);
    reportExpanded = signal(false);

    form: FormGroup = this.fb.group({
        propertyType: ['apartment'],
        propertyCountry: ['France'],
        cityTier: ['tier1'],
        purchasePrice: [250000],
        notaryFees: [15000],
        renovationBudget: [20000],
        useMortgage: [true],
        downPaymentPercent: [20],
        interestRate: [4.5],
        loanTerm: [20],
        avgNightlyRate: [150],
        occupancyRate: [60],
        seasonality: ['medium'],
        managementFeePercent: [15],
        utilitiesMonthly: [150],
        maintenanceAnnual: [2000],
        insuranceAnnual: [1200],
        propertyTaxAnnual: [1500],
        cleaningFeePerStay: [50],
        suppliesPerGuest: [15]
    });

    formValues = computed(() => this.form.value);
    propertyAddress = computed(() => this.propertyDetails()?.address || 'Generic Model');
    propertyType = computed(() => this.propertyDetails()?.type || 'Investment Property');

    constructor(private fb: FormBuilder) {
        effect(() => {
            const details = this.propertyDetails();
            if (details?.purchase_price) {
                this.form.patchValue({ purchasePrice: details.purchase_price });
            }
            if (!this.formValues()) return;

            const fv = this.form.value;
            if (!fv.useMortgage || fv.purchasePrice <= 0) return;
        });
    }

    ngOnInit() {
        this.updateFromPropertyDetails();
    }

    async updateFromPropertyDetails() {
        if (!this.form.value.hostCountry || !this.form.value.propertyCountry) return;
        const countryMapping: Record<string, string> = {
            'FR': 'France', 'ES': 'Spain', 'PT': 'Portugal',
            'UK': 'UK', 'DE': 'Germany', 'IT': 'Italy', 'US': 'US'
        };
        const mappedCountry = countryMapping[this.form.value.hostCountry] || this.form.value.propertyCountry;
        this.form.patchValue({ propertyCountry: mappedCountry });
    }

    toggleProfiler() { this.propertyProfilerExpanded.set(!this.propertyProfilerExpanded()); }
    toggleReport() { this.reportExpanded.set(!this.reportExpanded()); }
    toggleDesign() { this.designExpanded.set(!this.designExpanded()); }
    toggleExpenses() { this.expensesExpanded.set(!this.expensesExpanded()); }
    toggleSeasonality() { this.seasonalityExpanded.set(!this.seasonalityExpanded()); }

    updateForm(field: string, value: any) {
        this.form.patchValue({ [field]: value });
    }

    getTierLabel(): string {
        const tier = this.session.userProfile()?.plan;
        const tierLabels: Record<string, string> = {
            'Freemium': 'Tier 0', 'TIER_0': 'Tier 0', 'TIER_1': 'Bronze', 'TIER_2': 'Silver', 'TIER_3': 'Gold'
        };
        return tierLabels[tier || ''] || 'Tier 0';
    }

    isTier3(): boolean {
        const tier = this.session.userProfile()?.plan;
        return tier === 'TIER_3' || tier === 'Gold';
    }

    formatCurrency(value: number): string {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value || 0);
    }

    // Financial Calculations
    grossPotentialRevenue = computed(() => {
        const fv = this.formValues();
        return (fv.avgNightlyRate * 365);
    });

    occupancyLoss = computed(() => {
        const fv = this.formValues();
        return this.grossPotentialRevenue() * (1 - fv.occupancyRate / 100);
    });

    otherIncome = computed(() => 0);

    annualRevenue = computed(() => {
        return this.grossPotentialRevenue() - this.occupancyLoss() + this.otherIncome();
    });

    managementFee = computed(() => {
        const fv = this.formValues();
        return this.annualRevenue() * (fv.managementFeePercent / 100);
    });

    utilitiesAnnual = computed(() => (this.formValues().utilitiesMonthly || 0) * 12);
    maintenanceAnnual = computed(() => this.formValues().maintenanceAnnual || 0);
    insuranceAnnual = computed(() => this.formValues().insuranceAnnual || 0);
    propertyTaxAnnual = computed(() => this.formValues().propertyTaxAnnual || 0);

    cleaningAnnual = computed(() => {
        const fv = this.formValues();
        const staysPerYear = (fv.occupancyRate / 100) * 365 / 3;
        return staysPerYear * (fv.cleaningFeePerStay || 0);
    });

    suppliesAnnual = computed(() => {
        const fv = this.formValues();
        const guestsPerYear = (fv.occupancyRate / 100) * 365 / 3;
        return guestsPerYear * (fv.suppliesPerGuest || 0);
    });

    mortgagePaymentAnnual = computed(() => {
        const fv = this.formValues();
        if (!fv.useMortgage) return 0;
        const principal = fv.purchasePrice * (1 - fv.downPaymentPercent / 100);
        const monthlyRate = (fv.interestRate / 100) / 12;
        const numPayments = fv.loanTerm * 12;
        const monthlyPayment = principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments) / (Math.pow(1 + monthlyRate, numPayments) - 1);
        return monthlyPayment * 12;
    });

    totalExpenses = computed(() => {
        return this.managementFee() + this.utilitiesAnnual() + this.maintenanceAnnual() + 
               this.insuranceAnnual() + this.propertyTaxAnnual() + this.cleaningAnnual() + 
               this.suppliesAnnual() + this.mortgagePaymentAnnual();
    });

    netOperatingIncome = computed(() => this.annualRevenue() - this.totalExpenses() + this.mortgagePaymentAnnual());

    totalInvestment = computed(() => {
        const fv = this.formValues();
        const downPayment = fv.purchasePrice * (fv.downPaymentPercent / 100);
        return downPayment + fv.notaryFees + fv.renovationBudget;
    });

    cashOnCashReturn = computed(() => {
        const investment = this.totalInvestment();
        if (investment === 0) return 0;
        return (this.netOperatingIncome() / investment) * 100;
    });

    projectedYears = computed(() => {
        const years = [];
        const fv = this.formValues();
        const revenueGrowth = fv.seasonality === 'high' ? 1.05 : fv.seasonality === 'medium' ? 1.03 : 1.02;
        const expenseGrowth = 1.02;
        
        for (let i = 1; i <= 10; i++) {
            const revenue = this.annualRevenue() * Math.pow(revenueGrowth, i - 1);
            const expenses = this.totalExpenses() * Math.pow(expenseGrowth, i - 1);
            const noi = revenue - expenses;
            const debtService = this.mortgagePaymentAnnual();
            const cashFlow = noi - debtService;
            const cocReturn = this.totalInvestment() > 0 ? (cashFlow / this.totalInvestment()) * 100 : 0;
            years.push({ year: i, revenue, expenses, noi, debtService, cashFlow, cocReturn });
        }
        return years;
    });

    async generateAIReview() {
        if (!this.isTier3()) return;
        this.isGeneratingReport.set(true);
        try {
            const prompt = `You are a real estate investment analyst. Analyze this property investment:

Property: ${this.propertyAddress()}
Type: ${this.propertyType()}
Purchase Price: ${this.formatCurrency(this.formValues().purchasePrice)}
Annual Revenue: ${this.formatCurrency(this.annualRevenue())}
Net Operating Income: ${this.formatCurrency(this.netOperatingIncome())}
Cash-on-Cash Return: ${this.cashOnCashReturn().toFixed(1)}%
Occupancy Rate: ${this.formValues().occupancyRate}%
Location: ${this.formValues().propertyCountry}, ${this.formValues().cityTier}

Provide a JSON response with:
- strengths: 3-4 key strengths of this investment
- opportunities: 3-4 potential risks or areas of concern
- comprehensive_verdict: A 2-3 sentence strategic recommendation

Respond ONLY with valid JSON.`;

            const result = await this.gemini.generateText(prompt);
            const jsonMatch = result.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                this.aiReport.set(parsed);
            }
        } catch (e) {
            console.error('Error generating AI report:', e);
        }
        this.isGeneratingReport.set(false);
    }
}
