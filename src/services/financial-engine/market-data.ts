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

/**
 * Fuzzy-match an address string to the closest known market.
 * Uses keyword matching against known city/region names for each market.
 *
 * Examples:
 *   "Calle Mayor, Madrid, Spain"            -> "Madrid Centre"
 *   "12 Rue de Rivoli, Paris, France"       -> "Paris Central"
 *   "Somewhere in the Cotswolds, UK"        -> "Cotswolds Villages"
 *   "Calle de la Mar, Barcelona, Spain"     -> "Barcelona Beach"
 *   "Unknown Village, Nowhere"              -> undefined
 */
export function findClosestMarket(address: string): MarketData | undefined {
  if (!address) return undefined;

  const addr = address.toLowerCase();

  // Priority-ordered keywords map: each entry maps a market name to its identifying keywords.
  // More specific/unique keywords should come before generic ones.
  const marketKeywords: Array<{ name: string; keywords: string[] }> = [
    // ── FRANCE ──
    {
      name: 'Paris Central',
      keywords: ['paris', 'ile de france', 'île-de-france', 'arrondissement'],
    },
    {
      name: 'French Alps Ski',
      keywords: [
        'alps', 'alpes', 'chamonix', 'courchevel', 'val thorens',
        'méribel', 'meribel', 'megève', 'megeve', 'tignes',
        "val d'isère", 'val disere', 'les arcs', 'savoie', 'haute-savoie',
      ],
    },
    {
      name: 'Cote d Azur',
      keywords: [
        "côte d'azur", 'cote d azur', 'nice', 'cannes', 'saint-tropez',
        'antibes', 'monaco', 'monte carlo', 'villefranche', 'menton',
        'eze', 'grasse',
      ],
    },
    {
      name: 'Provence Rural',
      keywords: [
        'provence', 'aix-en-provence', 'aix en provence', 'avignon',
        'arles', 'apt', 'gordes', 'roussillon', 'lourmarin',
        'vaucluse', 'luberon',
      ],
    },
    {
      name: 'Dordogne Valley',
      keywords: ['dordogne', 'périgord', 'perigord', 'sarlat', 'bergerac'],
    },
    {
      name: 'Brittany Coast',
      keywords: [
        'brittany', 'bretagne', 'rennes', 'brest', 'saint-malo',
        'lorient', 'vannes', 'quimper', 'dinard', "côtes d'armor",
        'cotes d armor', 'finistère', 'finistere', 'morbihan',
      ],
    },
    {
      name: 'Bordeaux Wine',
      keywords: [
        'bordeaux', 'saint-émilion', 'saint emilion', 'médoc',
        'medoc', 'pomerol', 'graves', 'entre-deux-mers',
      ],
    },
    {
      name: 'Lyon Gastronomy',
      keywords: ['lyon', 'rhône', 'rhone', 'villeurbanne'],
    },
    {
      name: 'Biarritz Surf',
      keywords: [
        'biarritz', 'bayonne', 'basque', 'pays basque', 'anglet',
        'saint-jean-de-luz', 'hendaye',
      ],
    },
    {
      name: 'Montpellier Growth',
      keywords: [
        'montpellier', 'languedoc', 'sète', 'sete', 'nîmes', 'nimes',
        'hérault', 'herault',
      ],
    },

    // ── SPAIN ──
    {
      name: 'Madrid Centre',
      keywords: ['madrid'],
    },
    {
      name: 'Barcelona Beach',
      keywords: ['barcelona', 'catalunya', 'cataluña', 'catalonia', 'sitges'],
    },
    {
      name: 'Marbella Premium',
      keywords: ['marbella', 'puerto banús', 'puerto banus', 'estepona', 'mijas'],
    },
    {
      name: 'Costa del Sol',
      keywords: [
        'costa del sol', 'costa de la luz', 'málaga', 'malaga', 'torremolinos',
        'fuengirola', 'benalmádena', 'benalmadena', 'chiclana',
        'cadiz', 'cádiz', 'conil', 'vejer', 'san fernando',
        'puerto real', 'el puerto de santa maría', 'rota', 'chipiona',
        'sanlúcar', 'sanlucar',
      ],
    },
    {
      name: 'Balearic Islands',
      keywords: [
        'balearic', 'baleares', 'mallorca', 'ibiza', 'menorca',
        'palma', 'mahón', 'mahon',
      ],
    },
    {
      name: 'Canary Islands',
      keywords: [
        'canary', 'canarias', 'tenerife', 'gran canaria',
        'lanzarote', 'fuerteventura', 'la palma',
      ],
    },
    {
      name: 'Valencia City',
      keywords: ['valencia'],
    },
    {
      name: 'Alicante Value',
      keywords: ['alicante', 'costa blanca', 'benidorm', 'elche'],
    },
    {
      name: 'San Sebastian',
      keywords: ['san sebastian', 'donostia', 'san sebastián', 'san sebastian spain'],
    },
    {
      name: 'Costa Brava',
      keywords: [
        'costa brava', 'girona', 'lloret', 'figueres',
        'cadaqués', 'cadaques', 'roses', 'tossa de mar',
      ],
    },

    // ── UK ──
    {
      name: 'London Zone 1',
      keywords: [
        'london', 'westminster', 'kensington', 'chelsea',
        'mayfair', 'soho', 'city of london', 'covent garden',
      ],
    },
    {
      name: 'Cornwall Coastal',
      keywords: [
        'cornwall', 'st ives', 'newquay', 'penzance',
        'falmouth', 'truro', 'padstow',
      ],
    },
    {
      name: 'Cotswolds Villages',
      keywords: [
        'cotswolds', 'cotswold', 'cheltenham',
        'stow-on-the-wold', 'bourton-on-the-water', 'broadway',
      ],
    },
    {
      name: 'Scottish Highlands',
      keywords: [
        'highlands', 'scottish', 'inverness', 'loch ness',
        'isle of skye', 'fort william', 'ben nevis',
        'sutherland', 'caithness',
      ],
    },
    {
      name: 'Lake District',
      keywords: [
        'lake district', 'windermere', 'keswick', 'ambleside',
        'cumbria', 'grasmere',
      ],
    },
    {
      name: 'Edinburgh City',
      keywords: ['edinburgh'],
    },
    {
      name: 'Manchester Tech',
      keywords: ['manchester', 'salford'],
    },
    {
      name: 'Birmingham Hub',
      keywords: ['birmingham', 'west midlands'],
    },
    {
      name: 'Brighton Pier',
      keywords: ['brighton', 'hove', 'east sussex'],
    },
    {
      name: 'Bath Heritage',
      keywords: ['bath', 'bristol'],
    },
  ];

  // Score each market by counting how many of its keywords appear in the address
  let bestMatch: MarketData | undefined;
  let bestScore = 0;

  for (const entry of marketKeywords) {
    const matchScore = entry.keywords.reduce((score, kw) => {
      return score + (addr.includes(kw) ? 1 : 0);
    }, 0);

    if (matchScore > bestScore) {
      bestScore = matchScore;
      bestMatch = MARKET_DATA.find((m) => m.marketName === entry.name);
    }
  }

  // Only return a match if at least one keyword was found
  return bestScore > 0 ? bestMatch : undefined;
}
