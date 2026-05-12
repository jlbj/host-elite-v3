import { Country, MarketData, MarketType } from './types';

export const MARKET_DATA: MarketData[] = [
    // FRANCE
    {
        country: Country.FRANCE,
        marketName: 'Paris Central',
        avgPrice2Bed: 95000000,
        capitalGrowthEst: 0.025,
        baseOccupancy: 0.72,
        baseADR: 24500,
        nightLimit: 120,
        type: MarketType.URBAN_STRICT,
        operationalCosts: { laborMultiplier: 1.25, utilityIndex: 1.15, avgTouristTax: 450, linenReplacementRoom: 16000, mgmtFeePct: 0.22, localPremiumType: 'Urban-Elevator', premiumCost: 4500 }
    },
    {
        country: Country.FRANCE,
        marketName: 'French Alps Ski',
        avgPrice2Bed: 55000000,
        capitalGrowthEst: 0.04,
        baseOccupancy: 0.45,
        baseADR: 35000,
        nightLimit: null,
        type: MarketType.SEASONAL_HIGH,
        operationalCosts: { laborMultiplier: 1.25, utilityIndex: 1.15, avgTouristTax: 450, linenReplacementRoom: 16000, mgmtFeePct: 0.22, localPremiumType: 'Ski-Maint', premiumCost: 15000 }
    },
    {
        country: Country.FRANCE,
        marketName: 'Cote d Azur',
        avgPrice2Bed: 68000000,
        capitalGrowthEst: 0.03,
        baseOccupancy: 0.58,
        baseADR: 28000,
        nightLimit: 90,
        type: MarketType.LUXURY_COASTAL,
        operationalCosts: { laborMultiplier: 1.25, utilityIndex: 1.15, avgTouristTax: 450, linenReplacementRoom: 16000, mgmtFeePct: 0.22, localPremiumType: '', premiumCost: 0 }
    },
    {
        country: Country.FRANCE,
        marketName: 'Provence Rural',
        avgPrice2Bed: 42000000,
        capitalGrowthEst: 0.05,
        baseOccupancy: 0.48,
        baseADR: 17500,
        nightLimit: null,
        type: MarketType.HERITAGE_RURAL,
        operationalCosts: { laborMultiplier: 1.25, utilityIndex: 1.15, avgTouristTax: 450, linenReplacementRoom: 16000, mgmtFeePct: 0.22, localPremiumType: '', premiumCost: 0 }
    },
    {
        country: Country.FRANCE,
        marketName: 'Dordogne Valley',
        avgPrice2Bed: 28000000,
        capitalGrowthEst: 0.03,
        baseOccupancy: 0.42,
        baseADR: 14500,
        nightLimit: null,
        type: MarketType.FAMILY_RURAL,
        operationalCosts: { laborMultiplier: 1.25, utilityIndex: 1.15, avgTouristTax: 450, linenReplacementRoom: 16000, mgmtFeePct: 0.22, localPremiumType: '', premiumCost: 0 }
    },
    {
        country: Country.FRANCE,
        marketName: 'Brittany Coast',
        avgPrice2Bed: 31000000,
        capitalGrowthEst: 0.04,
        baseOccupancy: 0.50,
        baseADR: 13500,
        nightLimit: null,
        type: MarketType.NATURE_COASTAL,
        operationalCosts: { laborMultiplier: 1.25, utilityIndex: 1.15, avgTouristTax: 450, linenReplacementRoom: 16000, mgmtFeePct: 0.22, localPremiumType: '', premiumCost: 0 }
    },
    {
        country: Country.FRANCE,
        marketName: 'Bordeaux Wine',
        avgPrice2Bed: 45000000,
        capitalGrowthEst: 0.04,
        baseOccupancy: 0.55,
        baseADR: 16000,
        nightLimit: 180,
        type: MarketType.WINE_TOURISM,
        operationalCosts: { laborMultiplier: 1.25, utilityIndex: 1.15, avgTouristTax: 450, linenReplacementRoom: 16000, mgmtFeePct: 0.22, localPremiumType: '', premiumCost: 0 }
    },
    {
        country: Country.FRANCE,
        marketName: 'Lyon Gastronomy',
        avgPrice2Bed: 48000000,
        capitalGrowthEst: 0.05,
        baseOccupancy: 0.65,
        baseADR: 14500,
        nightLimit: 180,
        type: MarketType.URBAN_VALUE,
        operationalCosts: { laborMultiplier: 1.25, utilityIndex: 1.15, avgTouristTax: 450, linenReplacementRoom: 16000, mgmtFeePct: 0.22, localPremiumType: '', premiumCost: 0 }
    },
    {
        country: Country.FRANCE,
        marketName: 'Biarritz Surf',
        avgPrice2Bed: 52000000,
        capitalGrowthEst: 0.06,
        baseOccupancy: 0.52,
        baseADR: 19500,
        nightLimit: null,
        type: MarketType.SPORTS_COASTAL,
        operationalCosts: { laborMultiplier: 1.25, utilityIndex: 1.15, avgTouristTax: 450, linenReplacementRoom: 16000, mgmtFeePct: 0.22, localPremiumType: '', premiumCost: 0 }
    },
    {
        country: Country.FRANCE,
        marketName: 'Montpellier Growth',
        avgPrice2Bed: 38000000,
        capitalGrowthEst: 0.075,
        baseOccupancy: 0.60,
        baseADR: 13000,
        nightLimit: 150,
        type: MarketType.EMERGING,
        operationalCosts: { laborMultiplier: 1.25, utilityIndex: 1.15, avgTouristTax: 450, linenReplacementRoom: 16000, mgmtFeePct: 0.22, localPremiumType: '', premiumCost: 0 }
    },

    // SPAIN
    {
        country: Country.SPAIN,
        marketName: 'Madrid Centre',
        avgPrice2Bed: 52000000,
        capitalGrowthEst: 0.07,
        baseOccupancy: 0.78,
        baseADR: 17000,
        nightLimit: 90,
        type: MarketType.URBAN_BUSINESS,
        operationalCosts: { laborMultiplier: 0.95, utilityIndex: 1.10, avgTouristTax: 220, linenReplacementRoom: 11000, mgmtFeePct: 0.18, localPremiumType: 'Urban-Communidad', premiumCost: 9500 }
    },
    {
        country: Country.SPAIN,
        marketName: 'Barcelona Beach',
        avgPrice2Bed: 48000000,
        capitalGrowthEst: 0.06,
        baseOccupancy: 0.74,
        baseADR: 21500,
        nightLimit: 31,
        type: MarketType.URBAN_COASTAL,
        operationalCosts: { laborMultiplier: 0.95, utilityIndex: 1.10, avgTouristTax: 220, linenReplacementRoom: 11000, mgmtFeePct: 0.18, localPremiumType: 'Urban-Communidad', premiumCost: 9500 }
    },
    {
        country: Country.SPAIN,
        marketName: 'Marbella Premium',
        avgPrice2Bed: 75000000,
        capitalGrowthEst: 0.08,
        baseOccupancy: 0.55,
        baseADR: 32000,
        nightLimit: null,
        type: MarketType.LUXURY,
        operationalCosts: { laborMultiplier: 0.95, utilityIndex: 1.10, avgTouristTax: 220, linenReplacementRoom: 11000, mgmtFeePct: 0.18, localPremiumType: '', premiumCost: 0 }
    },
    {
        country: Country.SPAIN,
        marketName: 'Costa del Sol',
        avgPrice2Bed: 32000000,
        capitalGrowthEst: 0.075,
        baseOccupancy: 0.62,
        baseADR: 18500,
        nightLimit: null,
        type: MarketType.RESORT,
        operationalCosts: { laborMultiplier: 0.95, utilityIndex: 1.10, avgTouristTax: 220, linenReplacementRoom: 11000, mgmtFeePct: 0.18, localPremiumType: '', premiumCost: 0 }
    },
    {
        country: Country.SPAIN,
        marketName: 'Balearic Islands',
        avgPrice2Bed: 65000000,
        capitalGrowthEst: 0.055,
        baseOccupancy: 0.58,
        baseADR: 31000,
        nightLimit: null,
        type: MarketType.HIGH_END_ISLAND,
        operationalCosts: { laborMultiplier: 0.95, utilityIndex: 1.10, avgTouristTax: 220, linenReplacementRoom: 11000, mgmtFeePct: 0.18, localPremiumType: 'Island-Water', premiumCost: 2500 }
    },
    {
        country: Country.SPAIN,
        marketName: 'Canary Islands',
        avgPrice2Bed: 28000000,
        capitalGrowthEst: 0.05,
        baseOccupancy: 0.82,
        baseADR: 13000,
        nightLimit: null,
        type: MarketType.STEADY_STATE,
        operationalCosts: { laborMultiplier: 0.95, utilityIndex: 1.10, avgTouristTax: 220, linenReplacementRoom: 11000, mgmtFeePct: 0.18, localPremiumType: 'Island-Water', premiumCost: 2500 }
    },
    {
        country: Country.SPAIN,
        marketName: 'Valencia City',
        avgPrice2Bed: 24500000,
        capitalGrowthEst: 0.085,
        baseOccupancy: 0.70,
        baseADR: 14500,
        nightLimit: null,
        type: MarketType.GROWTH,
        operationalCosts: { laborMultiplier: 0.95, utilityIndex: 1.10, avgTouristTax: 220, linenReplacementRoom: 11000, mgmtFeePct: 0.18, localPremiumType: 'Urban-Communidad', premiumCost: 9500 }
    },
    {
        country: Country.SPAIN,
        marketName: 'Alicante Value',
        avgPrice2Bed: 19500000,
        capitalGrowthEst: 0.065,
        baseOccupancy: 0.65,
        baseADR: 11500,
        nightLimit: null,
        type: MarketType.YIELD,
        operationalCosts: { laborMultiplier: 0.95, utilityIndex: 1.10, avgTouristTax: 220, linenReplacementRoom: 11000, mgmtFeePct: 0.18, localPremiumType: '', premiumCost: 0 }
    },
    {
        country: Country.SPAIN,
        marketName: 'San Sebastian',
        avgPrice2Bed: 58000000,
        capitalGrowthEst: 0.035,
        baseOccupancy: 0.68,
        baseADR: 24000,
        nightLimit: null,
        type: MarketType.GOURMET_PREMIUM,
        operationalCosts: { laborMultiplier: 0.95, utilityIndex: 1.10, avgTouristTax: 220, linenReplacementRoom: 11000, mgmtFeePct: 0.18, localPremiumType: '', premiumCost: 0 }
    },
    {
        country: Country.SPAIN,
        marketName: 'Costa Brava',
        avgPrice2Bed: 41000000,
        capitalGrowthEst: 0.04,
        baseOccupancy: 0.50,
        baseADR: 19000,
        nightLimit: null,
        type: MarketType.BOUTIQUE_COASTAL,
        operationalCosts: { laborMultiplier: 0.95, utilityIndex: 1.10, avgTouristTax: 220, linenReplacementRoom: 11000, mgmtFeePct: 0.18, localPremiumType: '', premiumCost: 0 }
    },

    // UK
    {
        country: Country.UK,
        marketName: 'London Zone 1',
        avgPrice2Bed: 95000000, // Converted to EUR for consistency? Or assume GBP? User said "for France, Spain, UK". 
        // Let's assume input is EUR converted or we display proper currency. 
        // For now, these are raw values from CSV. 950k GBP ~ 1.1M EUR. 
        // We will assume data provided is in LOCAL currency or unified. 
        // Given mixed inputs (EUR for France/Spain), let's treat numbers as raw distinct units
        // AND handle currency symbol in display. 
        capitalGrowthEst: 0.02,
        baseOccupancy: 0.82,
        baseADR: 27500,
        nightLimit: 90,
        type: MarketType.GLOBAL_HUB,
        operationalCosts: { laborMultiplier: 1.45, utilityIndex: 1.85, avgTouristTax: 0, linenReplacementRoom: 18500, mgmtFeePct: 0.20, localPremiumType: '', premiumCost: 0 }
    },
    {
        country: Country.UK,
        marketName: 'Cornwall Coastal',
        avgPrice2Bed: 52000000,
        capitalGrowthEst: 0.045,
        baseOccupancy: 0.60,
        baseADR: 21000,
        nightLimit: null,
        type: MarketType.PREMIUM_COASTAL,
        operationalCosts: { laborMultiplier: 1.45, utilityIndex: 1.85, avgTouristTax: 0, linenReplacementRoom: 18500, mgmtFeePct: 0.20, localPremiumType: 'Coast-Salt-Tax', premiumCost: 5000 }
    },
    {
        country: Country.UK,
        marketName: 'Cotswolds Villages',
        avgPrice2Bed: 58000000,
        capitalGrowthEst: 0.055,
        baseOccupancy: 0.64,
        baseADR: 23000,
        nightLimit: null,
        type: MarketType.LUXURY_RURAL,
        operationalCosts: { laborMultiplier: 1.45, utilityIndex: 1.85, avgTouristTax: 0, linenReplacementRoom: 18500, mgmtFeePct: 0.20, localPremiumType: '', premiumCost: 0 }
    },
    {
        country: Country.UK,
        marketName: 'Scottish Highlands',
        avgPrice2Bed: 31000000,
        capitalGrowthEst: 0.03,
        baseOccupancy: 0.52,
        baseADR: 16000,
        nightLimit: null,
        type: MarketType.REMOTE_NATURE,
        operationalCosts: { laborMultiplier: 1.45, utilityIndex: 1.85, avgTouristTax: 0, linenReplacementRoom: 18500, mgmtFeePct: 0.20, localPremiumType: 'Highland-Heat', premiumCost: 18000 }
    },
    {
        country: Country.UK,
        marketName: 'Lake District',
        avgPrice2Bed: 48000000,
        capitalGrowthEst: 0.04,
        baseOccupancy: 0.65,
        baseADR: 19500,
        nightLimit: null,
        type: MarketType.NATIONAL_PARK,
        operationalCosts: { laborMultiplier: 1.45, utilityIndex: 1.85, avgTouristTax: 0, linenReplacementRoom: 18500, mgmtFeePct: 0.20, localPremiumType: '', premiumCost: 0 }
    },
    {
        country: Country.UK,
        marketName: 'Edinburgh City',
        avgPrice2Bed: 41500000,
        capitalGrowthEst: 0.05,
        baseOccupancy: 0.75,
        baseADR: 22000,
        nightLimit: 90,
        type: MarketType.URBAN_FESTIVAL,
        operationalCosts: { laborMultiplier: 1.45, utilityIndex: 1.85, avgTouristTax: 0, linenReplacementRoom: 18500, mgmtFeePct: 0.20, localPremiumType: '', premiumCost: 0 }
    },
    {
        country: Country.UK,
        marketName: 'Manchester Tech',
        avgPrice2Bed: 28000000,
        capitalGrowthEst: 0.065,
        baseOccupancy: 0.72,
        baseADR: 13500,
        nightLimit: null,
        type: MarketType.URBAN_GROWTH,
        operationalCosts: { laborMultiplier: 1.45, utilityIndex: 1.85, avgTouristTax: 0, linenReplacementRoom: 18500, mgmtFeePct: 0.20, localPremiumType: '', premiumCost: 0 }
    },
    {
        country: Country.UK,
        marketName: 'Birmingham Hub',
        avgPrice2Bed: 25000000,
        capitalGrowthEst: 0.05,
        baseOccupancy: 0.68,
        baseADR: 12500,
        nightLimit: null,
        type: MarketType.CITY_CENTRAL,
        operationalCosts: { laborMultiplier: 1.45, utilityIndex: 1.85, avgTouristTax: 0, linenReplacementRoom: 18500, mgmtFeePct: 0.20, localPremiumType: '', premiumCost: 0 }
    },
    {
        country: Country.UK,
        marketName: 'Brighton Pier',
        avgPrice2Bed: 44500000,
        capitalGrowthEst: 0.035,
        baseOccupancy: 0.70,
        baseADR: 16500,
        nightLimit: null,
        type: MarketType.WEEKEND_COASTAL,
        operationalCosts: { laborMultiplier: 1.45, utilityIndex: 1.85, avgTouristTax: 0, linenReplacementRoom: 18500, mgmtFeePct: 0.20, localPremiumType: 'Coast-Salt-Tax', premiumCost: 5000 }
    },
    {
        country: Country.UK,
        marketName: 'Bath Heritage',
        avgPrice2Bed: 51000000,
        capitalGrowthEst: 0.04,
        baseOccupancy: 0.70,
        baseADR: 19000,
        nightLimit: null,
        type: MarketType.HISTORY_TOURISM,
        operationalCosts: { laborMultiplier: 1.45, utilityIndex: 1.85, avgTouristTax: 0, linenReplacementRoom: 18500, mgmtFeePct: 0.20, localPremiumType: '', premiumCost: 0 }
    }
];

export function getMarketsByCountry(country: Country): MarketData[] {
    return MARKET_DATA.filter(m => m.country === country);
}

export function getMarketByName(name: string): MarketData | undefined {
    return MARKET_DATA.find(m => m.marketName === name);
}
