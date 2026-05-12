import { FinancialInput, FinancialOutput, TierLevel, ScenarioComparison, RedFlag, MarketData } from './types';
import * as Formulas from './formulas';
import { getMarketByName } from './market-data';
import { getTaxStrategy, TaxContext, TaxResult } from './tax-rules';

export class FinancialCalculator {

    /**
     * Main entry point to calculate financials based on the input tier.
     * @param input FinancialInput object
     * @returns FinancialOutput object
     */
    public calculate(input: FinancialInput): FinancialOutput {
        // 1. Basic Validations
        this.validateInput(input);

        // RG_FIN_05: Currency conversion placeholder (if needed in future)
        // const currency = input.currency || 'EUR';

        // 2. Initialize Output
        const output: FinancialOutput = {
            netMonthlyCashFlow: 0,
            totalMonthlyFixedCosts: 0,
            totalMonthlyVariableCosts: 0,
            redFlags: []
        };

        // Resolve Market Data if selected
        let marketData: MarketData | undefined;
        if (input.selectedMarketId) {
            marketData = getMarketByName(input.selectedMarketId);
        }

        // --- Tier 1 Calculations (Always run) ---
        const totalFixed = input.fixedCosts.reduce((a, b) => a + b, 0);
        const totalVariable = input.variableCosts.reduce((a, b) => a + b, 0);

        output.totalMonthlyFixedCosts = totalFixed;
        output.totalMonthlyVariableCosts = totalVariable;
        output.netMonthlyCashFlow = Formulas.calculateNetMonthlyCashFlow(input.grossMonthlyRevenue, totalFixed, totalVariable);

        if (input.tier === TierLevel.BASIC) return output; // Early exit for Basic

        // --- Tier 2 Calculations (Low) ---
        // Seasonality & Annual Revenue
        let annualGrossRevenue = input.grossMonthlyRevenue * 12; // Default

        // If MarketData exists, apply seasonality curve
        if (marketData) {
            const factors = Formulas.getSeasonalityFactors(marketData.type);
            output.seasonalityCurve = factors.map(f => Math.round(input.grossMonthlyRevenue * f));
            annualGrossRevenue = output.seasonalityCurve.reduce((a, b) => a + b, 0);
        } else if (input.monthlySeasonalityFactors && input.monthlySeasonalityFactors.length === 12) {
            output.seasonalityCurve = input.monthlySeasonalityFactors.map(f => Math.round(input.grossMonthlyRevenue * f));
            annualGrossRevenue = output.seasonalityCurve.reduce((a, b) => a + b, 0);
        }

        // Re-calculate Net Annual Cashflow based on Seasoned Revenue
        // Annual Net = Annual Gross - (Monthly Fixed * 12) - (Variable based on Gross?)
        // Assuming variable costs scale with revenue (approx), we might need to adjust.
        // For now, simpler: Annual Net = Annual Gross - Annual Costs
        const annualCosts = (totalFixed + totalVariable) * 12;
        const annualNetCashFlow = annualGrossRevenue - annualCosts;


        if (input.initialInvestment || input.furnitureCosts || input.renovationCosts || input.notaryFees) {
            const totalProjectCost =
                (input.initialInvestment || 0) +
                (input.furnitureCosts || 0) +
                (input.renovationCosts || 0) +
                (input.stagingCosts || 0) +
                (input.notaryFees || 0);

            output.annualizedROI = Formulas.calculateAnnualizedROI(annualNetCashFlow, totalProjectCost);
            output.paybackPeriodMonths = Formulas.calculatePaybackPeriod(totalProjectCost, output.netMonthlyCashFlow); // Use avg monthly?
        }

        if (input.tier === TierLevel.LOW) return output;

        // --- Tier 3 Calculations (Medium) ---
        if (input.totalBookedDays !== undefined && input.totalAvailableDays !== undefined) {
            output.adr = Formulas.calculateADR(annualGrossRevenue, input.totalBookedDays);
            output.occupancyRate = Formulas.calculateOccupancyRate(input.totalBookedDays, input.totalAvailableDays);
            output.revPAR = Formulas.calculateRevPAR(output.adr, output.occupancyRate);
            output.sinkingFundContribution = Formulas.calculateSinkingFund(annualGrossRevenue);
        }

        if (input.tier === TierLevel.MEDIUM) return output;

        // --- Tier 4 Calculations (Expert) ---
        if (input.purchasePrice) {
            output.noi = Formulas.calculateNOI(annualGrossRevenue, annualCosts);
            output.ebitda = Formulas.calculateEBITDA(output.noi);
            output.capRate = Formulas.calculateCapRate(output.noi, input.purchasePrice);

            // Mortgage & Debt Service
            let annualDebtService = 0;
            let mortgageDetails = undefined;
            let totalInterest = 0;

            if (input.interestRate && input.loanTermYears && input.loanAmount) {
                // RG_FIN_03: Amortization Formula Integration
                // The formula M = P(1+r)^n - 1 / r(1+r)^n is handled inside generateAmortizationSchedule > calculateMonthlyLoanPayment
                const schedule = Formulas.generateAmortizationSchedule(
                    input.loanAmount,
                    input.interestRate,
                    input.loanTermYears
                );

                output.mortgage = schedule;
                annualDebtService = schedule.monthlyPayment * 12;
                totalInterest = schedule.totalInterest; // Lifetime interest (not annual)
                // Use Year 1 Interest for Tax Calculation approx ? Or amortized?
                // Tax Strategy specific.

                mortgageDetails = { monthlyPayment: schedule.monthlyPayment, yearlyAmortization: schedule.yearlyAmortization };
            }

            // --- RED FLAGS ---
            if (output.adr) {
                const breakEvenOcc = Formulas.calculateBreakEvenOccupancy(totalFixed * 12, annualDebtService, output.adr / 100 /* cents to units for formula? No formula expects same units */);
                // Wait, formula expects raw numbers. ADR in cents. Fixed in cents. Debt in cents. Result %
                const beOccupancy = Formulas.calculateBreakEvenOccupancy(totalFixed * 12, annualDebtService, output.adr);
                output.breakEvenOccupancy = beOccupancy;

                if (beOccupancy > 60) {
                    output.redFlags?.push({
                        code: 'BREAK_EVEN_HIGH',
                        severity: (beOccupancy > 75) ? 'CRITICAL' : 'WARNING',
                        message: `Break-even occupancy is high (${beOccupancy.toFixed(1)}%). Recommended < 60%.`
                    });
                }
            }


            // --- TAX STRATEGY INTEGRATION ---
            if (marketData && input.taxRegime) {
                const taxStrategy = getTaxStrategy(marketData.country, input.taxRegime);

                // Get Year 1 Interest for Tax Deduction
                // If schedule exists, use year 1 interest.
                const year1Interest = output.mortgage?.yearlyAmortization[0]?.interest || 0;

                const taxContext: TaxContext = {
                    annualRevenue: annualGrossRevenue,
                    annualOperatingExpenses: annualCosts,
                    mortgageInterest: year1Interest,
                    amortizableBasis: input.purchasePrice + (input.renovationCosts || 0) + (input.furnitureCosts || 0), // Simplified
                    country: marketData.country as 'France' | 'Spain' | 'UK', // Type assertion safe due to enum match
                    taxRegime: input.taxRegime
                };

                // Helper to run strategy? We just calculate net after tax.
                // NOTE: Strategy class handles the logic.
                // We might want to expose the calculated tax in output? output.taxAmount?
                // For now, it affects Cash Flow.

                // const taxResult = taxStrategy.calculate(taxContext);
                // We don't have a field for "Annual Tax" in output extended yet globally, 
                // but we can deduct it from Cash Flow calculations (projections).

                // Quick estimation for PDF display (refined logic should use taxStrategy.calculate)
                // Assuming simplified flat tax for demo if detailed strategy not invoked
                const taxableIncome = Math.max(0, output.noi - year1Interest - (output.taxDepreciation || 0));
                // default 20% validation
                output.yearlyTax = taxableIncome * (input.taxRate ? input.taxRate / 100 : 0.20);
            }

            // Yields
            const totalInvested = input.purchasePrice + (input.renovationCosts || 0) + (input.furnitureCosts || 0) + (input.notaryFees || 0);
            if (totalInvested > 0) {
                output.grossYield = (annualGrossRevenue / totalInvested) * 100;
                output.netYield = (output.noi / totalInvested) * 100;
            }
            output.yearlyExpenses = annualCosts;

            // Cash on Cash Return
            const preTaxCashFlow = output.noi - annualDebtService; // Cents

            const initialCashInvested =
                (input.downPayment || 0) +
                (input.closingCosts || 0) +
                (input.renovationCosts || 0) +
                (input.furnitureCosts || 0) +
                (input.stagingCosts || 0) +
                (input.notaryFees || 0) +
                (input.initialInvestment || 0);

            if (initialCashInvested > 0) {
                output.cashOnCashReturn = Formulas.calculateCashOnCash(preTaxCashFlow, initialCashInvested);
            }

            if (output.cashOnCashReturn !== undefined && output.cashOnCashReturn < 0) {
                output.redFlags?.push({
                    code: 'NEGATIVE_CASHFLOW',
                    severity: 'CRITICAL',
                    message: 'Projected Cash Flow is negative.'
                });
            }


            // --- IRR CALCULATION ---
            // Need Projections first
            const annualRevenueIncrease = marketData ? (marketData.capitalGrowthEst * 100) : 2; // Use Cap Growth as Revenue Proxy? Or separate metric?
            // Usually revenue growth != capital growth. But let's use 2% default or user input.
            // marketData.capitalGrowthEst is for Property Value.
            const annualExpenseIncrease = 2; // Default 2% inflation

            output.projections = Formulas.generateProjections(
                annualGrossRevenue,
                annualCosts,
                2, // Rev Increase 2%
                annualExpenseIncrease, // Exp Increase 2%
                initialCashInvested,
                mortgageDetails
            );

            // IRR Stream: [ -InitialComp, CF1, CF2... CFn + SaleProceeds ]
            const years = 5;
            const flowStream = [-initialCashInvested];

            for (let i = 0; i < years; i++) {
                if (output.projections[i]) {
                    flowStream.push(output.projections[i].cashFlow);
                }
            }

            // Add Sale Proceeds at Year 5
            // Future Value = PurchasePrice * (1+Growth)^5
            // Exit Sale: Net of Fees? Assume 5% fees.
            const capGrowth = marketData ? marketData.capitalGrowthEst : 0.02;
            const futureValue = input.purchasePrice * Math.pow(1 + capGrowth, years);
            const saleProceeds = futureValue * 0.95; // 5% cost of sale
            const loanBalance = output.mortgage?.yearlyAmortization[years - 1]?.balance || 0;
            const netSale = saleProceeds - loanBalance;

            // Add net sale to last year cash flow
            flowStream[years] += netSale;

            output.irr5Year = Formulas.calculateIRR(flowStream);
        }

        return output;
    }

    /**
     * Compares two financial scenarios.
     */
    public compare(scenarioA: FinancialInput, scenarioB: FinancialInput): ScenarioComparison {
        const resA = this.calculate(scenarioA);
        const resB = this.calculate(scenarioB);

        const diff: Partial<FinancialOutput> = {};

        // Dynamic diff
        (Object.keys(resA) as Array<keyof FinancialOutput>).forEach(key => {
            const valA = resA[key];
            const valB = resB[key];
            if (typeof valA === 'number' && typeof valB === 'number') {
                // @ts-ignore
                diff[key] = valB - valA;
            }
        });

        return {
            scenarioA: resA,
            scenarioB: resB,
            diff
        };
    }

    private validateInput(input: FinancialInput) {
        if (input.grossMonthlyRevenue < 0) throw new Error("Revenue cannot be negative.");
        if (input.tier === TierLevel.MEDIUM || input.tier === TierLevel.EXPERT) {
            if (input.totalAvailableDays && input.totalBookedDays && input.totalBookedDays > input.totalAvailableDays) {
                throw new Error("Booked days cannot exceed available days.");
            }
        }
    }
}

