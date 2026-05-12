export enum TierLevel {
    BASIC = 'BASIC',
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    EXPERT = 'EXPERT'
}

export enum Country {
    FRANCE = 'France',
    SPAIN = 'Spain',
    UK = 'UK'
}

export enum MarketType {
    URBAN_STRICT = 'Urban-Strict',
    SEASONAL_HIGH = 'Seasonal-High',
    LUXURY_COASTAL = 'Luxury-Coastal',
    HERITAGE_RURAL = 'Heritage-Rural',
    FAMILY_RURAL = 'Family-Rural',
    NATURE_COASTAL = 'Nature-Coastal',
    WINE_TOURISM = 'Wine-Tourism',
    URBAN_VALUE = 'Urban-Value',
    SPORTS_COASTAL = 'Sports-Coastal',
    EMERGING = 'Emerging',
    URBAN_BUSINESS = 'Urban-Business',
    URBAN_COASTAL = 'Urban-Coastal',
    LUXURY = 'Luxury',
    RESORT = 'Resort',
    HIGH_END_ISLAND = 'High-End-Island',
    STEADY_STATE = 'Steady-State',
    GROWTH = 'Growth',
    YIELD = 'Yield',
    GOURMET_PREMIUM = 'Gourmet-Premium',
    BOUTIQUE_COASTAL = 'Boutique-Coastal',
    GLOBAL_HUB = 'Global-Hub',
    PREMIUM_COASTAL = 'Premium-Coastal',
    LUXURY_RURAL = 'Luxury-Rural',
    REMOTE_NATURE = 'Remote-Nature',
    NATIONAL_PARK = 'National-Park',
    URBAN_FESTIVAL = 'Urban-Festival',
    URBAN_GROWTH = 'Urban-Growth',
    CITY_CENTRAL = 'City-Central',
    WEEKEND_COASTAL = 'Weekend-Coastal',
    HISTORY_TOURISM = 'History-Tourism'
}

export interface MarketData {
    country: Country;
    marketName: string;
    avgPrice2Bed: number; // in cents
    capitalGrowthEst: number; // 0.05 = 5%
    baseOccupancy: number; // 0.72 = 72%
    baseADR: number; // in cents
    nightLimit: number | null;
    regulatoryRisk?: 'Low' | 'Medium' | 'High' | 'Critical';
    type: MarketType;
    operationalCosts: OperationalCostData;
}

export interface OperationalCostData {
    laborMultiplier: number;
    utilityIndex: number;
    avgTouristTax: number; // in cents
    linenReplacementRoom: number; // in cents
    mgmtFeePct: number;
    localPremiumType: string;
    premiumCost: number; // in cents
}

export interface FinancialInput {
    tier: TierLevel;

    // Global Context
    selectedMarketId?: string; // e.g. "Paris Central" matching MarketData
    taxRegime?: string; // "LMNP_REEL", "LMNP_MICRO", "SPAIN_IVA", "UK_S24", etc.

    // Tier 1: Basic
    grossMonthlyRevenue: number; // in cents
    fixedCosts: number[]; // in cents (e.g. rent, internet)
    variableCosts: number[]; // in cents (e.g. cleaning, utilities)

    // Tier 2: Low (Investment & Seasonality)
    initialInvestment?: number; // total or residual
    furnitureCosts?: number; // in cents
    stagingCosts?: number; // in cents
    notaryFees?: number; // in cents
    // initialInvestment is now technically sum of these + works + residual, but we keep it for backward compat or direct entry
    monthlySeasonalityFactors?: number[]; // Array of 12 numbers (e.g. 1.2 for high season, 0.8 for low)

    // Tier 3: Medium (KPIs)
    totalBookedDays?: number;
    totalAvailableDays?: number;
    // Note: totalRevenue is derived or same as grossMonthlyRevenue * 12 for annual? 
    // For KPI calcs, we often need annual totals. 
    // Let's assume input can specify period, but for now we stick to monthly/annual standard.

    // Tier 4: Expert (Advanced Investment)
    purchasePrice?: number; // in cents
    closingCosts?: number; // in cents
    renovationCosts?: number; // in cents
    interestRate?: number; // percentage (e.g. 5.5 for 5.5%)
    loanTermYears?: number;
    downPayment?: number; // in cents
    loanAmount?: number; // in cents (Principal)
    taxRate?: number; // percentage (margin tax rate)
    depreciationYearType?: 'RESIDENTIAL_27_5' | 'COMMERCIAL_39';

    // Tier 3: AI Intelligence
    announcementUrl?: string; // URL for AI extraction
    currency?: 'EUR' | 'USD' | 'GBP'; // RG_FIN_05
}

export interface AiRiskScore {
    score: number; // 0-100 (100 = safe)
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
    message: string;
}

export interface RedFlag {
    code: 'BREAK_EVEN_HIGH' | 'EMERGENCY_FUND_LOW' | 'REGULATORY_RISK_CRITICAL' | 'NEGATIVE_CASHFLOW';
    severity: 'WARNING' | 'CRITICAL';
    message: string;
}

export interface FinancialOutput {
    // Tier 1
    netMonthlyCashFlow: number; // in cents
    totalMonthlyFixedCosts: number;
    totalMonthlyVariableCosts: number;

    // Tier 2
    annualizedROI?: number; // percentage
    paybackPeriodMonths?: number;

    // Tier 3
    adr?: number; // Average Daily Rate in cents
    occupancyRate?: number; // percentage (0-100)
    revPAR?: number; // Revenue Per Available Rental in cents
    sinkingFundContribution?: number; // Recommended reserve in cents
    breakEvenOccupancy?: number; // percentage

    // Tier 4
    noi?: number; // Net Operating Income (Annual) in cents
    capRate?: number; // percentage
    cashOnCashReturn?: number; // percentage
    grossYield?: number; // percentage
    netYield?: number; // percentage
    yearlyTax?: number; // in cents
    yearlyExpenses?: number; // in cents
    taxDepreciation?: number; // Annual deduction in cents
    ebitda?: number; // Earnings Before Interest, Taxes, Depreciation, Amortization
    irr5Year?: number; // Internal Rate of Return (5 year exit)

    // Expert Enhancements
    mortgage?: MortgageResult;
    projections?: YearlyProjection[];
    redFlags?: RedFlag[];
    seasonalityCurve?: number[]; // Projected monthly revenue for display

    // Intelligent Investor Specs
    aiScoring?: AiRiskScore;
}

export interface LoanDetails {
    principal: number; // in cents
    annualInterestRate: number; // percentage (e.g. 5.5)
    termYears: number;
    downPayment?: number; // in cents
}

export interface MortgageResult {
    monthlyPayment: number; // in cents
    totalInterest: number; // in cents
    yearlyAmortization: Array<{
        year: number;
        interest: number;
        principal: number;
        balance: number;
    }>;
}

export interface YearlyProjection {
    year: number;
    revenue: number;
    expenses: number;
    noi: number;
    cashFlow: number;
    equity: number;
    roi: number; // percentage
}

export interface ScenarioComparison {
    scenarioA: FinancialOutput;
    scenarioB: FinancialOutput;
    diff: Partial<FinancialOutput>; // B - A
}
