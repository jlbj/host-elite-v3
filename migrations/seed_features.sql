-- Seed Features from CSV
-- Generated automatically


INSERT INTO features (id, parent_feature_id, dimension_id, phase_id, name, description, detailed_description, dev_prompt, scope, behavior_matrix)
VALUES (
    'FIN_00',
    NULL,
    'DIM_FINANCE',
    'PH_1_INVEST',
    'Profitability Suite',
    'Financial Intelligence Command Center',
    'An advanced multi-dimensional financial hub that aggregates macro-economic trends and property-specific data. TIER 3 transforms it into a predictive command center capable of simulating 10-year market cycles and portfolio-wide risk assessments.',
    '1. Pedagogical Objective: Strategic vision over simple math. Investors often fail by viewing properties in isolation. This suite teaches the ''Portfolio mindset,'' showing how macro-trends and micro-decisions intersect over a 10-year horizon. 2. Behavior Matrix: TIER_0: Dashboard Sandbox with static sample data. TIER_1/2: Active Project Management for up to 5 properties with manual updates. TIER_3: Predictive Command Center with real-time portfolio aggregation and ''Global Risk'' scoring. 3. User Journey & UI: Input: High-level financial goals and asset types. Logic: Aggregation of all sub-financial modules. Output: A multi-layered heat map showing ROI, Equity growth, and Tax burden. Coach: Tooltip on ''Portfolio Diversification'' to explain why putting all capital in one city is a high-risk move. 4. Business Logic: RG-01 (Tier 0): Lock ''Consolidated View'' and trigger Upsell modal. RG-02 (Expert): TIER_3 allows ''Stress Test'' simulations (e.g., simulating a 2% interest rate hike across all assets).',
    'GLOBAL',
    'TIER_0: Dashboard Sandbox with static sample data. TIER_1/2: Active Project Management for up to 5 properties with manual updates. TIER_3: Predictive Command Center with real-time portfolio aggregation and ''Global Risk'' scoring.'
)
ON CONFLICT (id) DO UPDATE SET
    parent_feature_id = EXCLUDED.parent_feature_id,
    dimension_id = EXCLUDED.dimension_id,
    phase_id = EXCLUDED.phase_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    detailed_description = EXCLUDED.detailed_description,
    dev_prompt = EXCLUDED.dev_prompt,
    scope = EXCLUDED.scope,
    behavior_matrix = EXCLUDED.behavior_matrix;

INSERT INTO features (id, parent_feature_id, dimension_id, phase_id, name, description, detailed_description, dev_prompt, scope, behavior_matrix)
VALUES (
    'FIN_01',
    'FIN_00',
    'DIM_FINANCE',
    'PH_1_INVEST',
    'ROI Simulator',
    'Real-time Yield & Cashflow Engine',
    'A high-precision engine calculating net cash flow with real-time adjustments for local market shifts. TIER 3 integrates live mortgage data and local rental demand indices to ensure surgical accuracy in yield forecasting.',
    '1. Pedagogical Objective: Cash-flow is king. Beginners confuse revenue with profit. This tool forces users to account for hidden leakages (maintenance, vacancy, taxes) to focus on net monthly liquidity. 2. Behavior Matrix: TIER_0: 3-field manual simulator (Rent, Price, Loan). No saving. TIER_1/2: Full expense itemization (condo, insurance, repairs). Save 5 sims. TIER_3: Real-time Ingestion Assistant. Auto-fills demand indices and interest rates via public central bank APIs and official national statistics. 3. User Journey & UI: Input: Price, Expected Rent, Loan details. Logic: Net Cash-flow = Rent - (Loan + Fixed Charges + Variable Reserves). Output: ''Traffic Light'' visual (Red: Negative, Orange: Break-even, Green: Positive). Coach: Pop-up at ''Charges'' field suggesting a 10% provision for unexpected repairs. 4. Business Logic: RG-01 (Tier 0): Clicking ''Save'' triggers TIER_1 modal. RG-02 (Guardrail): Block calculation if user enters unrealistic data (e.g., 0% vacancy rate) without a warning label.',
    'GLOBAL',
    'TIER_0: 3-field manual simulator (Rent, Price, Loan). No saving. TIER_1/2: Full expense itemization (condo, insurance, repairs). Save 5 sims. TIER_3: Real-time Ingestion Assistant. Auto-fills demand indices and interest rates via public central bank APIs and official national statistics.'
)
ON CONFLICT (id) DO UPDATE SET
    parent_feature_id = EXCLUDED.parent_feature_id,
    dimension_id = EXCLUDED.dimension_id,
    phase_id = EXCLUDED.phase_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    detailed_description = EXCLUDED.detailed_description,
    dev_prompt = EXCLUDED.dev_prompt,
    scope = EXCLUDED.scope,
    behavior_matrix = EXCLUDED.behavior_matrix;

INSERT INTO features (id, parent_feature_id, dimension_id, phase_id, name, description, detailed_description, dev_prompt, scope, behavior_matrix)
VALUES (
    'FIN_02',
    'FIN_00',
    'DIM_FINANCE',
    'PH_1_INVEST',
    'Renovation Budget',
    'Smart Capex & Furnishing Planner',
    'A strategic Capex management tool to prevent budget overruns. TIER 3 features intelligent anomaly detection that compares quotes against regional labor benchmarks and suggests cost-saving material alternatives.',
    '1. Pedagogical Objective: Protect the initial ROI. Renovation creep is the #1 profit killer. This teaches users to itemize costs before the first hammer swing and maintain a 5-star experience on a budget. 2. Behavior Matrix: TIER_0: Generic room-by-room PDF checklist. TIER_1/2: Interactive budget tracker with actual vs. estimated cost tracking. TIER_3: AI Quote Auditor. Compares user-uploaded quotes against official government construction cost indices (e.g., INSEE, ONS). 3. User Journey & UI: Input: Room dimensions and desired finish level (Standard/Luxury). Logic: Dynamic total calculation + 10% contingency buffer. Output: Spend-per-room breakdown chart. Coach: ''Pro Tip'' on focusing budget on ''Hero Amenities'' (Kitchen/Bath) to maximize ADR. 4. Business Logic: RG-01 (Tier 3): If a line item is 20% above regional average, trigger ''Negotiation Alert''. RG-02: Link results directly to FIN_01 to update the total ROI calculation.',
    'GLOBAL',
    'TIER_0: Generic room-by-room PDF checklist. TIER_1/2: Interactive budget tracker with actual vs. estimated cost tracking. TIER_3: AI Quote Auditor. Compares user-uploaded quotes against official government construction cost indices (e.g., INSEE, ONS).'
)
ON CONFLICT (id) DO UPDATE SET
    parent_feature_id = EXCLUDED.parent_feature_id,
    dimension_id = EXCLUDED.dimension_id,
    phase_id = EXCLUDED.phase_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    detailed_description = EXCLUDED.detailed_description,
    dev_prompt = EXCLUDED.dev_prompt,
    scope = EXCLUDED.scope,
    behavior_matrix = EXCLUDED.behavior_matrix;

INSERT INTO features (id, parent_feature_id, dimension_id, phase_id, name, description, detailed_description, dev_prompt, scope, behavior_matrix)
VALUES (
    'FIN_03',
    'FIN_00',
    'DIM_FINANCE',
    'PH_1_INVEST',
    'LMNP Tax Simulator',
    'French Fiscal Strategy Optimizer',
    'A specialized French tax simulator comparing Micro-BIC vs. Réel regimes. TIER 3 generates a 15-year automated depreciation and amortization roadmap, optimizing the ''zero-tax'' period.',
    '1. Pedagogical Objective: Tax efficiency as a yield booster. In France, choosing ''Réel'' over ''Micro-BIC'' can double net cash flow. This tool simplifies complex accounting for non-experts. 2. Behavior Matrix: TIER_0: Theory guide on French tax regimes. TIER_1/2: Annual comparison simulator. TIER_3: 15-Year Amortization Roadmap with automated depreciation scheduling for components. 3. User Journey & UI: Input: Purchase price, notary fees, renovation costs. Logic: Component-based depreciation (structure, roof, furniture). Output: Comparison table showing cumulative tax savings over 10 years. Coach: ''Why Amortization?'' explains how it acts as a ''ghost expense'' to zero out taxes. 4. Business Logic: RG-01: Country scope check (FR only). RG-02: Automatic inclusion of property tax (1 month rent default) if not entered by user based on local tax data.',
    'LOC_PROPERTY',
    'TIER_0: Theory guide on French tax regimes. TIER_1/2: Annual comparison simulator. TIER_3: 15-Year Amortization Roadmap with automated depreciation scheduling for components.'
)
ON CONFLICT (id) DO UPDATE SET
    parent_feature_id = EXCLUDED.parent_feature_id,
    dimension_id = EXCLUDED.dimension_id,
    phase_id = EXCLUDED.phase_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    detailed_description = EXCLUDED.detailed_description,
    dev_prompt = EXCLUDED.dev_prompt,
    scope = EXCLUDED.scope,
    behavior_matrix = EXCLUDED.behavior_matrix;

INSERT INTO features (id, parent_feature_id, dimension_id, phase_id, name, description, detailed_description, dev_prompt, scope, behavior_matrix)
VALUES (
    'FIN_04',
    'FIN_00',
    'DIM_FINANCE',
    'PH_1_INVEST',
    'Section 24 Simulator',
    'UK Interest Relief Decision Matrix',
    'UK-specific interest relief impact analyzer. TIER 3 acts as a corporate structure advisor, simulating the delta between personal ownership and Limited Company incorporation.',
    '1. Pedagogical Objective: Anticipate structural shifts. Section 24 changed the UK landscape. This tool helps UK hosts decide when incorporation (Limited Co) beats individual ownership. 2. Behavior Matrix: TIER_0: Warning card on Section 24 laws. TIER_1/2: Basic impact calculator for higher-rate taxpayers. TIER_3: Structural Decision Matrix (Individual vs. Ltd Co) including SDLT and Dividend tax simulations based on public HMRC tax tables. 3. User Journey & UI: Input: Global income, mortgage interest, property yield. Logic: Tax liability delta calculation. Output: ''Break-even point'' for incorporation. Coach: Explains ''Mortgage Interest Relief'' changes in layman terms. 4. Business Logic: RG-01: Scope check (UK only). RG-02 (Tier 3): Simulate transition costs (Stamp Duty/Capital Gains) to provide a true net-benefit score.',
    'LOC_HOST',
    'TIER_0: Warning card on Section 24 laws. TIER_1/2: Basic impact calculator for higher-rate taxpayers. TIER_3: Structural Decision Matrix (Individual vs. Ltd Co) including SDLT and Dividend tax simulations based on public HMRC tax tables.'
)
ON CONFLICT (id) DO UPDATE SET
    parent_feature_id = EXCLUDED.parent_feature_id,
    dimension_id = EXCLUDED.dimension_id,
    phase_id = EXCLUDED.phase_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    detailed_description = EXCLUDED.detailed_description,
    dev_prompt = EXCLUDED.dev_prompt,
    scope = EXCLUDED.scope,
    behavior_matrix = EXCLUDED.behavior_matrix;

INSERT INTO features (id, parent_feature_id, dimension_id, phase_id, name, description, detailed_description, dev_prompt, scope, behavior_matrix)
VALUES (
    'FIN_09',
    'FIN_00',
    'DIM_FINANCE',
    'PH_1_INVEST',
    'Non-Resident Tax Sim',
    'Cross-Border Fiscal Compliance Agent',
    'Calculates specific tax liabilities for international owners. TIER 3 automates the generation of country-specific non-resident forms, ensuring global compliance without expensive legal consults.',
    '1. Pedagogical Objective: Global mindset, local compliance. Investing abroad requires understanding ''Double Taxation''. This tool ensures cross-border compliance without hiring an army of lawyers. 2. Behavior Matrix: TIER_0: Directory of non-resident tax rates per country. TIER_1/2: Foreign tax liability estimator. TIER_3: Compliance Agent with pre-filled local tax form generation based on public tax regulations. 3. User Journey & UI: Input: Residency status, property country, net income. Logic: Apply Double Taxation Treaty rules between Country A and B using public OECD/Bilateral data. Output: Quarterly tax due summary. Coach: Explains ''Withholding Tax'' and how to claim it back. 4. Business Logic: RG-01: Check for Treaty presence in internal open-source DB. RG-02 (Tier 3): Auto-conversion of currencies using public European Central Bank (ECB) exchange rate data.',
    'LOC_PROPERTY',
    'TIER_0: Directory of non-resident tax rates per country. TIER_1/2: Foreign tax liability estimator. TIER_3: Compliance Agent with pre-filled local tax form generation based on public tax regulations.'
)
ON CONFLICT (id) DO UPDATE SET
    parent_feature_id = EXCLUDED.parent_feature_id,
    dimension_id = EXCLUDED.dimension_id,
    phase_id = EXCLUDED.phase_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    detailed_description = EXCLUDED.detailed_description,
    dev_prompt = EXCLUDED.dev_prompt,
    scope = EXCLUDED.scope,
    behavior_matrix = EXCLUDED.behavior_matrix;

INSERT INTO features (id, parent_feature_id, dimension_id, phase_id, name, description, detailed_description, dev_prompt, scope, behavior_matrix)
VALUES (
    'LEG_00',
    NULL,
    'DIM_LEGAL',
    'PH_1_INVEST',
    'Compliance Checker',
    'Zoning & Regulatory Sentinel',
    'A high-performance compliance engine verifying property legality. TIER 3 activates a real-time ''Legislative Watch'' that monitors municipal gazettes for zoning changes or new STR moratoriums.',
    '1. Pedagogical Objective: Legal safety first. Regulations move faster than owners. This feature shifts the user from ''reactive panic'' to ''proactive compliance'' in a changing legal environment. 2. Behavior Matrix: TIER_0: Generic municipal law database. TIER_1/2: City-level compliance audit based on manual input. TIER_3: ''Regulatory Sentinel'' with automated scraping of public municipal gazettes and city council open data. 3. User Journey & UI: Input: Exact property address. Logic: Geo-spatial check against local STR restrictions. Output: ''Legality Score'' (0-100). Coach: Contextual tooltip on ''Moratoriums'' explaining why some cities block new licenses. 4. Business Logic: RG-01 (Tier 3): Send Push Notification within 24h of a new public decree detection. RG-02: Alert user if their property address is in a ''Restricted Zone''.',
    'GLOBAL',
    'TIER_0: Generic municipal law database. TIER_1/2: City-level compliance audit based on manual input. TIER_3: ''Regulatory Sentinel'' with automated scraping of public municipal gazettes and city council open data.'
)
ON CONFLICT (id) DO UPDATE SET
    parent_feature_id = EXCLUDED.parent_feature_id,
    dimension_id = EXCLUDED.dimension_id,
    phase_id = EXCLUDED.phase_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    detailed_description = EXCLUDED.detailed_description,
    dev_prompt = EXCLUDED.dev_prompt,
    scope = EXCLUDED.scope,
    behavior_matrix = EXCLUDED.behavior_matrix;

INSERT INTO features (id, parent_feature_id, dimension_id, phase_id, name, description, detailed_description, dev_prompt, scope, behavior_matrix)
VALUES (
    'LEG_01',
    'LEG_00',
    'DIM_LEGAL',
    'PH_1_INVEST',
    'Regulatory Checklist',
    'Adaptive Compliance Workflow',
    'Interactive compliance management with automatic document validation. TIER 3 features proactive license tracking and automated proof-of-compliance syncing for municipal audits.',
    '1. Pedagogical Objective: Administrative discipline. A missing certificate can lead to closure. This teaches the user to manage their business like a professional operator, not a hobbyist. 2. Behavior Matrix: TIER_0: Downloadable PDF Checklist. TIER_1/2: Interactive tracker with ''Progress Bar''. TIER_3: Adaptive Compliance Workflow with document lifecycle management and auto-reminders. 3. User Journey & UI: Input: Uploading ID, Insurance, and Safety certs. Logic: Expiration date tracking and status validation. Output: ''Audit-Ready'' badge. Coach: Explains ''Public Liability Insurance'' and why standard home insurance is insufficient. 4. Business Logic: RG-01: Prohibit ''Launch'' phase if ''Mandatory'' checklist items are incomplete. RG-02: TIER_3 triggers email reminders 60 days before any document expires.',
    'GLOBAL',
    'TIER_0: Downloadable PDF Checklist. TIER_1/2: Interactive tracker with ''Progress Bar''. TIER_3: Adaptive Compliance Workflow with document lifecycle management and auto-reminders.'
)
ON CONFLICT (id) DO UPDATE SET
    parent_feature_id = EXCLUDED.parent_feature_id,
    dimension_id = EXCLUDED.dimension_id,
    phase_id = EXCLUDED.phase_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    detailed_description = EXCLUDED.detailed_description,
    dev_prompt = EXCLUDED.dev_prompt,
    scope = EXCLUDED.scope,
    behavior_matrix = EXCLUDED.behavior_matrix;

INSERT INTO features (id, parent_feature_id, dimension_id, phase_id, name, description, detailed_description, dev_prompt, scope, behavior_matrix)
VALUES (
    'LEG_02',
    'LEG_00',
    'DIM_LEGAL',
    'PH_1_INVEST',
    'Zweckentfremdungsverbot',
    'German Anti-Misuse Ban Analyzer',
    'Specific analyzer for German ''Misuse Ban'' laws in high-pressure cities. TIER 3 utilizes AI to draft administrative permit applications following strict German legal formatting (Bescheid).',
    '1. Pedagogical Objective: Navigating German bureaucracy. Misuse bans are complex. This feature empowers users to understand local ''Zweckentfremdung'' rules to avoid heavy fines. 2. Behavior Matrix: TIER_0: Textual warning on German city bans from official sources. TIER_1/2: Interactive zone map for Berlin/Munich/Hamburg based on public municipal GIS data. TIER_3: Legal Drafting Assistant for permit applications using open-source LLM logic. 3. User Journey & UI: Input: Address + Intent of use. Logic: GIS mapping against restriction zones. Output: Probability of permit approval score. Coach: Explains the ''Primary Residence'' exception in German law. 4. Business Logic: RG-01: Address-level accuracy required. RG-02 (Tier 3): AI-generated drafts must follow formal German administrative language protocols.',
    'LOC_PROPERTY',
    'TIER_0: Textual warning on German city bans from official sources. TIER_1/2: Interactive zone map for Berlin/Munich/Hamburg based on public municipal GIS data. TIER_3: Legal Drafting Assistant for permit applications using open-source LLM logic.'
)
ON CONFLICT (id) DO UPDATE SET
    parent_feature_id = EXCLUDED.parent_feature_id,
    dimension_id = EXCLUDED.dimension_id,
    phase_id = EXCLUDED.phase_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    detailed_description = EXCLUDED.detailed_description,
    dev_prompt = EXCLUDED.dev_prompt,
    scope = EXCLUDED.scope,
    behavior_matrix = EXCLUDED.behavior_matrix;

INSERT INTO features (id, parent_feature_id, dimension_id, phase_id, name, description, detailed_description, dev_prompt, scope, behavior_matrix)
VALUES (
    'LEG_08',
    'LEG_00',
    'DIM_LEGAL',
    'PH_1_INVEST',
    'Foreign ID Assistant',
    'International Admin Onboarding Agent',
    'Step-by-step guide for non-residents to obtain administrative IDs. TIER 3 provides direct API integration with concierge partners for end-to-end automated processing.',
    '1. Pedagogical Objective: Breaking the entry barrier. The ''NIE'' or ''Siret'' is the first wall for foreigners. This module removes friction and teaches the administrative sequence of foreign investing. 2. Behavior Matrix: TIER_0: List of required documents from official government websites. TIER_1/2: Interactive ''Admin Stepper'' with pre-filled letter templates based on public forms. TIER_3: Concierge Bridge with automated status polling from partner systems. 3. User Journey & UI: Input: Personal PII + Passport scan. Logic: Workflow automation based on the host/property country delta. Output: Application tracker. Coach: ''What is a NIE?'' tooltip explaining its necessity for tax and utility contracts. 4. Business Logic: RG-01: Trigger only for non-resident profiles. RG-02 (Tier 3): Secure PII handover to partners via encrypted webhooks only after user consent.',
    'LOC_PROPERTY',
    'TIER_0: List of required documents from official government websites. TIER_1/2: Interactive ''Admin Stepper'' with pre-filled letter templates based on public forms. TIER_3: Concierge Bridge with automated status polling from partner systems.'
)
ON CONFLICT (id) DO UPDATE SET
    parent_feature_id = EXCLUDED.parent_feature_id,
    dimension_id = EXCLUDED.dimension_id,
    phase_id = EXCLUDED.phase_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    detailed_description = EXCLUDED.detailed_description,
    dev_prompt = EXCLUDED.dev_prompt,
    scope = EXCLUDED.scope,
    behavior_matrix = EXCLUDED.behavior_matrix;

INSERT INTO features (id, parent_feature_id, dimension_id, phase_id, name, description, detailed_description, dev_prompt, scope, behavior_matrix)
VALUES (
    'EXP_01',
    NULL,
    'DIM_EXP',
    'PH_2_DESIGN',
    'Essentials List',
    'Dynamic Procurement Optimizer',
    'A curated procurement list for high-conversion listings. TIER 3 transforms it into a dynamic procurement engine with live price-tracking and ROI impact scores for each amenity.',
    '1. Pedagogical Objective: Invest in what matters. Guests care about specific items. This feature teaches users to prioritize ''high-impact'' amenities that drive 5-star reviews. 2. Behavior Matrix: TIER_0: Static PDF list. TIER_1/2: Customizable inventory list with budget tracking. TIER_3: Procurement Optimizer with live pricing fetched via open web scraping of public retail catalogs. 3. User Journey & UI: Input: Property size + Listing level (Budget/Luxury). Logic: Price-to-Value score for each item. Output: Interactive shopping cart with direct links. Coach: ''The Coffee Rule'': why a good coffee machine pays for itself in 10 bookings. 4. Business Logic: RG-01: Sync total spend to FIN_02. RG-02 (Tier 3): Auto-refresh prices weekly from major public retail sites.',
    'GLOBAL',
    'TIER_0: Static PDF list. TIER_1/2: Customizable inventory list with budget tracking. TIER_3: Procurement Optimizer with live pricing fetched via open web scraping of public retail catalogs.'
)
ON CONFLICT (id) DO UPDATE SET
    parent_feature_id = EXCLUDED.parent_feature_id,
    dimension_id = EXCLUDED.dimension_id,
    phase_id = EXCLUDED.phase_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    detailed_description = EXCLUDED.detailed_description,
    dev_prompt = EXCLUDED.dev_prompt,
    scope = EXCLUDED.scope,
    behavior_matrix = EXCLUDED.behavior_matrix;

INSERT INTO features (id, parent_feature_id, dimension_id, phase_id, name, description, detailed_description, dev_prompt, scope, behavior_matrix)
VALUES (
    'EXP_02',
    NULL,
    'DIM_EXP',
    'PH_2_DESIGN',
    'Inventory Generator',
    'Computer Vision Inventory Agent',
    'Digital inventory management for insurance and asset tracking. TIER 3 uses advanced Computer Vision to automatically catalog and value every item in a room from a single 360° photo.',
    '1. Pedagogical Objective: Protect your assets. Breakage happens. This feature teaches users to document everything to secure security deposits and insurance claims. 2. Behavior Matrix: TIER_0: Manual text table. TIER_1/2: Mobile-first photo inventory with serial number logging. TIER_3: AI Vision Agent using open-source Computer Vision libraries (e.g., OpenCV/YOLO) that identifies items from photos. 3. User Journey & UI: Input: Photo upload. Logic: Image label detection + estimated market value assignment using public price indices. Output: Digital Asset Register. Coach: ''Check-in Proof'': Why taking photos between every guest is your best insurance. 4. Business Logic: RG-01: Mandatory ''Safety Equipment'' detection. RG-02 (Tier 3): Link items to EXP_01 to track depreciation over time.',
    'GLOBAL',
    'TIER_0: Manual text table. TIER_1/2: Mobile-first photo inventory with serial number logging. TIER_3: AI Vision Agent using open-source Computer Vision libraries (e.g., OpenCV/YOLO) that identifies items from photos.'
)
ON CONFLICT (id) DO UPDATE SET
    parent_feature_id = EXCLUDED.parent_feature_id,
    dimension_id = EXCLUDED.dimension_id,
    phase_id = EXCLUDED.phase_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    detailed_description = EXCLUDED.detailed_description,
    dev_prompt = EXCLUDED.dev_prompt,
    scope = EXCLUDED.scope,
    behavior_matrix = EXCLUDED.behavior_matrix;

INSERT INTO features (id, parent_feature_id, dimension_id, phase_id, name, description, detailed_description, dev_prompt, scope, behavior_matrix)
VALUES (
    'OPS_01',
    NULL,
    'DIM_OPS',
    'PH_2_DESIGN',
    'Construction Schedule',
    'Critical Path Operations Engine',
    'A high-level timeline tool for property readiness. TIER 3 features a self-healing Gantt engine that automatically re-calculates dependencies and alerts contractors via instant messaging when delays occur.',
    '1. Pedagogical Objective: Operations are a sequence. One delay shouldn''t crash the launch. This teaches users ''Dependency Management'' and the cost of idle time. 2. Behavior Matrix: TIER_0: Date-only countdown to opening. TIER_1/2: Task calendar with manual artisan assignment. TIER_3: Self-healing Gantt Engine with dependency logic and automated delay alerts. 3. User Journey & UI: Input: Task list + Relationships (Task B starts after A). Logic: Critical Path Calculation. Output: Interactive Gantt chart. Coach: ''The Slack Factor'': explaining why adding 20% time buffer to artisans is professional practice. 4. Business Logic: RG-01: If a ''Critical Path'' task is delayed -> Auto-reschedule all downstream tasks. RG-02: Trigger ''Launch Countdown'' marketing tasks in Dimension MKT.',
    'GLOBAL',
    'TIER_0: Date-only countdown to opening. TIER_1/2: Task calendar with manual artisan assignment. TIER_3: Self-healing Gantt Engine with dependency logic and automated delay alerts.'
)
ON CONFLICT (id) DO UPDATE SET
    parent_feature_id = EXCLUDED.parent_feature_id,
    dimension_id = EXCLUDED.dimension_id,
    phase_id = EXCLUDED.phase_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    detailed_description = EXCLUDED.detailed_description,
    dev_prompt = EXCLUDED.dev_prompt,
    scope = EXCLUDED.scope,
    behavior_matrix = EXCLUDED.behavior_matrix;

INSERT INTO features (id, parent_feature_id, dimension_id, phase_id, name, description, detailed_description, dev_prompt, scope, behavior_matrix)
VALUES (
    'MKT_00',
    NULL,
    'DIM_MKT',
    'PH_3_LAUNCH',
    'Listing',
    'Property listing optimization',
    'A performance-focused auditor for listing visibility. TIER 3 uses competitive intelligence to benchmark listing photos and titles against top-performing properties in the same neighborhood.',
    '1. Pedagogical Objective: Perception is reality. A great flat with a bad title won''t book. This teaches users ''Click-Through-Rate'' (CTR) optimization and platform algorithms. 2. Behavior Matrix: TIER_0: 10 ''Pro-tips'' for listings. TIER_1/2: Manual audit checklist against current listing URL. TIER_3: AI Auditor with Competitive Benchmarking against open data (e.g., Inside Airbnb) and neighborhood benchmarks. 3. User Journey & UI: Input: Listing URL. Logic: Multi-factor score (Photo count, title keywords, description depth). Output: ''Performance Score'' (0-100) + Actionable Tasks. Coach: ''Hero Photo'' tooltip explaining the importance of the first image. 4. Business Logic: RG-01: Score < 60 prevents ''Launch Phase'' completion. RG-02 (Tier 3): Scrape public listing amenities to suggest ''Missing High-Demand Features''.',
    'GLOBAL',
    'TIER_0: 10 ''Pro-tips'' for listings. TIER_1/2: Manual audit checklist against current listing URL. TIER_3: AI Auditor with Competitive Benchmarking against open data (e.g., Inside Airbnb) and neighborhood benchmarks.'
)
ON CONFLICT (id) DO UPDATE SET
    parent_feature_id = EXCLUDED.parent_feature_id,
    dimension_id = EXCLUDED.dimension_id,
    phase_id = EXCLUDED.phase_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    detailed_description = EXCLUDED.detailed_description,
    dev_prompt = EXCLUDED.dev_prompt,
    scope = EXCLUDED.scope,
    behavior_matrix = EXCLUDED.behavior_matrix;

INSERT INTO features (id, parent_feature_id, dimension_id, phase_id, name, description, detailed_description, dev_prompt, scope, behavior_matrix)
VALUES (
    'MKT_01',
    NULL,
    'DIM_MKT',
    'PH_3_LAUNCH',
    'Welcome Book',
    'Digital welcome book for guests',
    'Pro-level photography guidance with AI post-processing. TIER 3 features automated image enhancement that corrects lighting, geometry, and adds virtual staging to empty rooms.',
    '1. Pedagogical Objective: Sell the dream. High-quality visuals increase ADR by 20%. This teaches users professional framing and lighting techniques. 2. Behavior Matrix: TIER_0: Framing guides and tutorials. TIER_1/2: Framing overlay on mobile camera. TIER_3: AI Enhancement Engine using open-source image processing frameworks. 3. User Journey & UI: Input: Raw smartphone photo. Logic: AI HDR, Lens correction, and lighting balance. Output: Before/After comparison view. Coach: ''Golden Hour'' tip for exterior shots. 4. Business Logic: RG-01 (Tier 3): Max 20 enhancements per month for Tier 2; Unlimited for Tier 3. RG-02: Prevent upload of low-resolution or blurry images to the main gallery.',
    'GLOBAL',
    'TIER_0: Framing guides and tutorials. TIER_1/2: Framing overlay on mobile camera. TIER_3: AI Enhancement Engine using open-source image processing frameworks.'
)
ON CONFLICT (id) DO UPDATE SET
    parent_feature_id = EXCLUDED.parent_feature_id,
    dimension_id = EXCLUDED.dimension_id,
    phase_id = EXCLUDED.phase_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    detailed_description = EXCLUDED.detailed_description,
    dev_prompt = EXCLUDED.dev_prompt,
    scope = EXCLUDED.scope,
    behavior_matrix = EXCLUDED.behavior_matrix;

INSERT INTO features (id, parent_feature_id, dimension_id, phase_id, name, description, detailed_description, dev_prompt, scope, behavior_matrix)
VALUES (
    'MKT_02',
    NULL,
    'DIM_MKT',
    'PH_3_LAUNCH',
    'Microsite',
    'Direct booking microsite',
    'A copywriting engine for high-conversion descriptions. TIER 3 allows for ''Psychological Triggering''—adapting the text to specific guest personas and maximizing SEO for platform algorithms.',
    '1. Pedagogical Objective: Copy that converts. Different guests look for different things. This teaches users ''Persona-Based Marketing'' and Semantic SEO. 2. Behavior Matrix: TIER_0: Text templates. TIER_1/2: ''Mad-libs'' style listing generator. TIER_3: Persona-Based LLM Generator using open-source models with SEO Keyword injection. 3. User Journey & UI: Input: Key features + Target Audience. Logic: Semantic mapping to high-volume search terms. Output: Multi-platform titles and descriptions. Coach: ''The Hook'': Why the first 2 lines are the only ones guests read. 4. Business Logic: RG-01 (Tier 3): Multi-language generation support. RG-02: Force inclusion of ''Mandatory Disclosures'' based on LEG dimension data.',
    'GLOBAL',
    'TIER_0: Text templates. TIER_1/2: ''Mad-libs'' style listing generator. TIER_3: Persona-Based LLM Generator using open-source models with SEO Keyword injection.'
)
ON CONFLICT (id) DO UPDATE SET
    parent_feature_id = EXCLUDED.parent_feature_id,
    dimension_id = EXCLUDED.dimension_id,
    phase_id = EXCLUDED.phase_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    detailed_description = EXCLUDED.detailed_description,
    dev_prompt = EXCLUDED.dev_prompt,
    scope = EXCLUDED.scope,
    behavior_matrix = EXCLUDED.behavior_matrix;

INSERT INTO features (id, parent_feature_id, dimension_id, phase_id, name, description, detailed_description, dev_prompt, scope, behavior_matrix)
VALUES (
    'LEG_03',
    NULL,
    'DIM_LEGAL',
    'PH_3_LAUNCH',
    'Cerfa Generator',
    'French Administrative Automation Bot',
    'Automated filler for mandatory French municipal declarations. TIER 3 features direct digital submission to city halls with automated registration number tracking.',
    '1. Pedagogical Objective: Compliance is non-negotiable. French ''Cerfa'' forms are tedious but vital. This module automates the chore and ensures the user is legally registered. 2. Behavior Matrix: TIER_0: Link to French government portal. TIER_1/2: Interactive form that generates a pre-filled PDF Cerfa based on public templates. TIER_3: Digital Admin Proxy with direct submission to city hall digital portals. 3. User Journey & UI: Input: Host data + Property specifics. Logic: Mappings to public Cerfa 14004*04. Output: Signed PDF + Submission receipt. Coach: Explains the difference between ''Residence Principale'' and ''Secondaire'' for registration. 4. Business Logic: RG-01: French scope only. RG-02 (Tier 3): If registration number is received, auto-update the Listing (Dimension MKT).',
    'LOC_PROPERTY',
    'TIER_0: Link to French government portal. TIER_1/2: Interactive form that generates a pre-filled PDF Cerfa based on public templates. TIER_3: Digital Admin Proxy with direct submission to city hall digital portals.'
)
ON CONFLICT (id) DO UPDATE SET
    parent_feature_id = EXCLUDED.parent_feature_id,
    dimension_id = EXCLUDED.dimension_id,
    phase_id = EXCLUDED.phase_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    detailed_description = EXCLUDED.detailed_description,
    dev_prompt = EXCLUDED.dev_prompt,
    scope = EXCLUDED.scope,
    behavior_matrix = EXCLUDED.behavior_matrix;

INSERT INTO features (id, parent_feature_id, dimension_id, phase_id, name, description, detailed_description, dev_prompt, scope, behavior_matrix)
VALUES (
    'LEG_04',
    NULL,
    'DIM_LEGAL',
    'PH_3_LAUNCH',
    'VUT License Assistant',
    'Spanish Licensing Expert System',
    'Comprehensive guide for Spanish VUT licenses. TIER 3 uses AI to analyze building statutes (Estatutos) to identify potential legal blockers before the application is filed.',
    '1. Pedagogical Objective: Due diligence before commitment. Spanish VUT licenses are often blocked by ''Estatutos''. This teaches users to check building rules first. 2. Behavior Matrix: TIER_0: Regional guide to Spanish licenses from official sources. TIER_1/2: Interactive requirement checklist per province. TIER_3: ''Statute Analyzer'' with open-source AI-based prohibition detection in PDF documents. 3. User Journey & UI: Input: Province + Building Statutes PDF. Logic: Keyword extraction and prohibition analysis. Output: ''Licensability Report''. Coach: Explains ''Moratoriums'' in cities like Barcelona or Madrid. 4. Business Logic: RG-01: Spain scope only. RG-02 (Tier 3): Flag ''High Risk'' if statutes mention ''Vivienda de Uso Turístico'' restrictions.',
    'LOC_PROPERTY',
    'TIER_0: Regional guide to Spanish licenses from official sources. TIER_1/2: Interactive requirement checklist per province. TIER_3: ''Statute Analyzer'' with open-source AI-based prohibition detection in PDF documents.'
)
ON CONFLICT (id) DO UPDATE SET
    parent_feature_id = EXCLUDED.parent_feature_id,
    dimension_id = EXCLUDED.dimension_id,
    phase_id = EXCLUDED.phase_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    detailed_description = EXCLUDED.detailed_description,
    dev_prompt = EXCLUDED.dev_prompt,
    scope = EXCLUDED.scope,
    behavior_matrix = EXCLUDED.behavior_matrix;

INSERT INTO features (id, parent_feature_id, dimension_id, phase_id, name, description, detailed_description, dev_prompt, scope, behavior_matrix)
VALUES (
    'LEG_05',
    NULL,
    'DIM_LEGAL',
    'PH_3_LAUNCH',
    'Impressum Generator',
    'German Compliance Hosting Service',
    'Generates and hosts mandatory German legal notices. TIER 3 ensures the notice is dynamically updated based on the latest EU and German tele-media laws.',
    '1. Pedagogical Objective: Professional identity. In Germany, the ''Impressum'' is a legal shield against ''Abmahnung'' (lawsuits). This teaches users commercial transparency. 2. Behavior Matrix: TIER_0: Impressum template text based on German law (§5 TMG). TIER_1/2: Dynamic generator with hosted URL. TIER_3: Adaptive Compliance Hosting with automated legal updates based on public legislative changes. 3. User Journey & UI: Input: VAT number + Contact data. Logic: Legal text generation according to official protocols. Output: A permalink URL to embed in listings. Coach: Why German law requires a physical address and email on every commercial page. 4. Business Logic: RG-01: Germany scope only. RG-02: Trigger email alert if host contact data changes to update the Impressum.',
    'LOC_PROPERTY',
    'TIER_0: Impressum template text based on German law (§5 TMG). TIER_1/2: Dynamic generator with hosted URL. TIER_3: Adaptive Compliance Hosting with automated legal updates based on public legislative changes.'
)
ON CONFLICT (id) DO UPDATE SET
    parent_feature_id = EXCLUDED.parent_feature_id,
    dimension_id = EXCLUDED.dimension_id,
    phase_id = EXCLUDED.phase_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    detailed_description = EXCLUDED.detailed_description,
    dev_prompt = EXCLUDED.dev_prompt,
    scope = EXCLUDED.scope,
    behavior_matrix = EXCLUDED.behavior_matrix;

INSERT INTO features (id, parent_feature_id, dimension_id, phase_id, name, description, detailed_description, dev_prompt, scope, behavior_matrix)
VALUES (
    'PRI_01',
    NULL,
    'DIM_PRICING',
    'PH_3_LAUNCH',
    'Yield Setup',
    'Market-Adaptive Pricing Configurator',
    'Initial pricing setup based on cost-plus and market data. TIER 3 utilizes real-time neighborhood demand indices to suggest a ''Perfect Launch Price'' that balances occupancy and rate.',
    '1. Pedagogical Objective: Pricing as a lever, not a guess. Most hosts underprice their first month. This teaches users to balance ''Review Gathering'' with ''Revenue Protection''. 2. Behavior Matrix: TIER_0: Base price calculator based on costs. TIER_1/2: Seasonal price grid (High/Low season). TIER_3: Demand-Adaptive Setup with ''Launch Discount'' strategy and local open benchmark data (Inside Airbnb). 3. User Journey & UI: Input: Costs (from FIN_01) + Desired profit. Logic: Cost-plus + Market index delta. Output: Suggested 12-month pricing calendar. Coach: ''The New Listing Boost'': Why you should start 15% below market for the first 3 reviews. 4. Business Logic: RG-01: Minimum price = Costs + 10%. RG-02 (Tier 3): Ingest publicly available competitor prices to show ''Market Position'' chart.',
    'GLOBAL',
    'TIER_0: Base price calculator based on costs. TIER_1/2: Seasonal price grid (High/Low season). TIER_3: Demand-Adaptive Setup with ''Launch Discount'' strategy and local open benchmark data (Inside Airbnb).'
)
ON CONFLICT (id) DO UPDATE SET
    parent_feature_id = EXCLUDED.parent_feature_id,
    dimension_id = EXCLUDED.dimension_id,
    phase_id = EXCLUDED.phase_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    detailed_description = EXCLUDED.detailed_description,
    dev_prompt = EXCLUDED.dev_prompt,
    scope = EXCLUDED.scope,
    behavior_matrix = EXCLUDED.behavior_matrix;

INSERT INTO features (id, parent_feature_id, dimension_id, phase_id, name, description, detailed_description, dev_prompt, scope, behavior_matrix)
VALUES (
    'OPS_02',
    NULL,
    'DIM_OPS',
    'PH_4_OPS',
    'iCal Sync',
    'Redundant Calendar Sync Engine',
    'Basic calendar synchronization to prevent double bookings. TIER 3 increases sync frequency to near-real-time (sub-5 minutes) with collision-detection logic.',
    '1. Pedagogical Objective: Trust is built on reliability. A double booking is the fastest way to lose status. This teaches users the technical foundations of multi-channel distribution. 2. Behavior Matrix: TIER_0: 1-way iCal export. TIER_1/2: 2-way sync with 1-hour refresh. TIER_3: High-Frequency Sync (5m) with ''Collision Detection'' and conflict resolution UI. 3. User Journey & UI: Input: iCal URLs from Airbnb/Booking. Logic: Chronological merge + overlap detection. Output: Unified calendar view. Coach: Why iCal is a ''best effort'' sync and not a professional API connection. 4. Business Logic: RG-01: Alert if sync fails for > 15 minutes. RG-02 (Tier 3): If two bookings overlap within the sync window, trigger ''High-Priority Resolution'' modal.',
    'GLOBAL',
    'TIER_0: 1-way iCal export. TIER_1/2: 2-way sync with 1-hour refresh. TIER_3: High-Frequency Sync (5m) with ''Collision Detection'' and conflict resolution UI.'
)
ON CONFLICT (id) DO UPDATE SET
    parent_feature_id = EXCLUDED.parent_feature_id,
    dimension_id = EXCLUDED.dimension_id,
    phase_id = EXCLUDED.phase_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    detailed_description = EXCLUDED.detailed_description,
    dev_prompt = EXCLUDED.dev_prompt,
    scope = EXCLUDED.scope,
    behavior_matrix = EXCLUDED.behavior_matrix;

INSERT INTO features (id, parent_feature_id, dimension_id, phase_id, name, description, detailed_description, dev_prompt, scope, behavior_matrix)
VALUES (
    'OPS_03',
    NULL,
    'DIM_OPS',
    'PH_4_OPS',
    'Channel Manager',
    'API-Direct Distribution Engine',
    'A centralized hub for property distribution. TIER 3 enables ''API-First'' synchronization, pushing rates, content, and availability instantly across 50+ platforms.',
    '1. Pedagogical Objective: Scale through automation. Managing 3+ channels manually is impossible. This teaches users the power of a ''Single Source of Truth''. 2. Behavior Matrix: TIER_0: iCal Basic. TIER_1/2: API Connection for 2 platforms (Airbnb/Booking). TIER_3: Unlimited API Distribution with Content/Photo/Price synchronization. 3. User Journey & UI: Input: Platform credentials. Logic: Direct API data push/pull. Output: Sync Status Dashboard. Coach: Why API is better than iCal. 4. Business Logic: RG-01: TIER_2 required for > 1 channel. RG-02: ''Global Markup'' logic to cover platform commissions.',
    'GLOBAL',
    'TIER_0: iCal Basic. TIER_1/2: API Connection for 2 platforms (Airbnb/Booking). TIER_3: Unlimited API Distribution with Content/Photo/Price synchronization.'
)
ON CONFLICT (id) DO UPDATE SET
    parent_feature_id = EXCLUDED.parent_feature_id,
    dimension_id = EXCLUDED.dimension_id,
    phase_id = EXCLUDED.phase_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    detailed_description = EXCLUDED.detailed_description,
    dev_prompt = EXCLUDED.dev_prompt,
    scope = EXCLUDED.scope,
    behavior_matrix = EXCLUDED.behavior_matrix;

INSERT INTO features (id, parent_feature_id, dimension_id, phase_id, name, description, detailed_description, dev_prompt, scope, behavior_matrix)
VALUES (
    'OPS_03_AIRBNB',
    'OPS_03',
    'DIM_OPS',
    'PH_4_OPS',
    'Airbnb Connector',
    'Official Airbnb API Agent',
    'Real-time direct connection with Airbnb. TIER 3 enables full content management, guest messaging, and AI-automated review responses directly from the dashboard.',
    '1. Pedagogical Objective: Channel-specific mastery. Airbnb is guest-centric. This teaches users to leverage Airbnb''s unique features (House Rules, Reviews) directly. 2. Behavior Matrix: TIER_1/2: Availability sync. TIER_3: Full API Agent with Unified Inbox and AI Review Assistant. 3. User Journey & UI: Input: Airbnb login. Logic: Content mapping. Output: Real-time sync status. Coach: Why your ''First Response Time'' matters for Airbnb''s ranking. 4. Business Logic: RG-01: Automatic re-auth every 90 days. RG-02 (Tier 3): Sync ''Review'' events to trigger the automated reply workflow.',
    'GLOBAL',
    'TIER_1/2: Availability sync. TIER_3: Full API Agent with Unified Inbox and AI Review Assistant.'
)
ON CONFLICT (id) DO UPDATE SET
    parent_feature_id = EXCLUDED.parent_feature_id,
    dimension_id = EXCLUDED.dimension_id,
    phase_id = EXCLUDED.phase_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    detailed_description = EXCLUDED.detailed_description,
    dev_prompt = EXCLUDED.dev_prompt,
    scope = EXCLUDED.scope,
    behavior_matrix = EXCLUDED.behavior_matrix;

INSERT INTO features (id, parent_feature_id, dimension_id, phase_id, name, description, detailed_description, dev_prompt, scope, behavior_matrix)
VALUES (
    'OPS_03_BOOKING',
    'OPS_03',
    'DIM_OPS',
    'PH_4_OPS',
    'Booking.com Connector',
    'Booking.com XML Specialist',
    'Advanced XML connection for professional Booking.com management. TIER 3 automates complex promotion rules and handles credit card processing through integrated gateways.',
    '1. Pedagogical Objective: Professional rigor. Booking.com is a ''hotel-style'' platform. This teaches users to manage complex ''Rate Plans'' and payment security. 2. Behavior Matrix: TIER_1/2: Availability sync. TIER_3: XML Specialist with Promotion management and automated Payment processing. 3. User Journey & UI: Input: Booking.com Legal ID. Logic: Rate Plan mapping. Output: ''Policy Compliance'' dashboard. Coach: Why ''Non-Refundable'' rates are essential for Booking.com volume. 4. Business Logic: RG-01 (Tier 3): Automated capturing of ''Virtual Credit Cards'' (VCC).',
    'GLOBAL',
    'TIER_1/2: Availability sync. TIER_3: XML Specialist with Promotion management and automated Payment processing.'
)
ON CONFLICT (id) DO UPDATE SET
    parent_feature_id = EXCLUDED.parent_feature_id,
    dimension_id = EXCLUDED.dimension_id,
    phase_id = EXCLUDED.phase_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    detailed_description = EXCLUDED.detailed_description,
    dev_prompt = EXCLUDED.dev_prompt,
    scope = EXCLUDED.scope,
    behavior_matrix = EXCLUDED.behavior_matrix;

INSERT INTO features (id, parent_feature_id, dimension_id, phase_id, name, description, detailed_description, dev_prompt, scope, behavior_matrix)
VALUES (
    'OPS_03_VRBO',
    'OPS_03',
    'DIM_OPS',
    'PH_4_OPS',
    'Vrbo Connector',
    'Vrbo Multi-Unit Distribution Agent',
    'Direct connection for family-oriented bookings on Vrbo. TIER 3 enables automated cross-platform content synchronization and guest vetting logic.',
    '1. Pedagogical Objective: Niche targeting. Vrbo is for families. This teaches users to adapt their content to a ''Long-Stay/Family'' audience. 2. Behavior Matrix: TIER_1/2: Basic sync. TIER_3: Multi-Unit Agent with automated amenity sync for family-filters. 3. User Journey & UI: Input: Vrbo account. Logic: Content optimization for ''Child-friendly'' tags. Output: Listing health check for Vrbo. Coach: Why high-quality kitchen photos matter more on Vrbo. 4. Business Logic: RG-01: Sync ''House Rules'' specifically regarding age limits/parties.',
    'GLOBAL',
    'TIER_1/2: Basic sync. TIER_3: Multi-Unit Agent with automated amenity sync for family-filters.'
)
ON CONFLICT (id) DO UPDATE SET
    parent_feature_id = EXCLUDED.parent_feature_id,
    dimension_id = EXCLUDED.dimension_id,
    phase_id = EXCLUDED.phase_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    detailed_description = EXCLUDED.detailed_description,
    dev_prompt = EXCLUDED.dev_prompt,
    scope = EXCLUDED.scope,
    behavior_matrix = EXCLUDED.behavior_matrix;

INSERT INTO features (id, parent_feature_id, dimension_id, phase_id, name, description, detailed_description, dev_prompt, scope, behavior_matrix)
VALUES (
    'OPS_04',
    NULL,
    'DIM_OPS',
    'PH_4_OPS',
    'Police Connection',
    'Automated Law Enforcement Reporter',
    'Automated reporting of guest IDs to local police (Spain/Italy/Portugal). TIER 3 features mobile ID scanning for guests and instant API submission within the 24h legal window.',
    '1. Pedagogical Objective: Legal peace of mind. Manual police reporting is a daily burden. This teaches the importance of ''Identity Management'' and automated compliance. 2. Behavior Matrix: TIER_0: Police portal links. TIER_1/2: CSV Export of guest data. TIER_3: Automated Reporter with Mobile OCR Scanner using open-source libraries and API Submission. 3. User Journey & UI: Input: Guest ID scan (Mobile). Logic: Formatting to official XML standards. Output: Submission receipt PDF. Coach: Explains the ''24-hour'' rule and potential fines for non-reporting. 4. Business Logic: RG-01: Trigger alert if a guest checks in but ID isn''t sent. RG-02 (Tier 3): Encrypted ID storage with auto-purge.',
    'LOC_PROPERTY',
    'TIER_0: Police portal links. TIER_1/2: CSV Export of guest data. TIER_3: Automated Reporter with Mobile OCR Scanner using open-source libraries and API Submission.'
)
ON CONFLICT (id) DO UPDATE SET
    parent_feature_id = EXCLUDED.parent_feature_id,
    dimension_id = EXCLUDED.dimension_id,
    phase_id = EXCLUDED.phase_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    detailed_description = EXCLUDED.detailed_description,
    dev_prompt = EXCLUDED.dev_prompt,
    scope = EXCLUDED.scope,
    behavior_matrix = EXCLUDED.behavior_matrix;

INSERT INTO features (id, parent_feature_id, dimension_id, phase_id, name, description, detailed_description, dev_prompt, scope, behavior_matrix)
VALUES (
    'OPS_05',
    NULL,
    'DIM_OPS',
    'PH_4_OPS',
    '90-Day Counter',
    'Smart Regulatory Compliance Cap',
    'Automated tracking of the 90-day rental limit in London. TIER 3 proactively blocks calendars across all channels as the limit approaches to prevent platform bans.',
    '1. Pedagogical Objective: Respect local limits. London''s 90-day rule is strictly enforced. This teaches users to balance ''Short-term'' vs. ''Mid-term'' stays to maximize the year. 2. Behavior Matrix: TIER_0: Manual night counter. TIER_1/2: Automated counter with ''Approaching Limit'' email. TIER_3: Smart Cap with automated calendar blocking at 90 days. 3. User Journey & UI: Input: Booking data. Logic: Nights = Checkout - Check-in. Output: Progress bar on Dashboard. Coach: Strategy tip on switching to ''30+ day rentals'' after the 90-day cap is hit. 4. Business Logic: RG-01: Scope check (London only). RG-02 (Tier 3): At 91 days, push ''Blocked'' status to all API channels.',
    'LOC_PROPERTY',
    'TIER_0: Manual night counter. TIER_1/2: Automated counter with ''Approaching Limit'' email. TIER_3: Smart Cap with automated calendar blocking at 90 days.'
)
ON CONFLICT (id) DO UPDATE SET
    parent_feature_id = EXCLUDED.parent_feature_id,
    dimension_id = EXCLUDED.dimension_id,
    phase_id = EXCLUDED.phase_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    detailed_description = EXCLUDED.detailed_description,
    dev_prompt = EXCLUDED.dev_prompt,
    scope = EXCLUDED.scope,
    behavior_matrix = EXCLUDED.behavior_matrix;

INSERT INTO features (id, parent_feature_id, dimension_id, phase_id, name, description, detailed_description, dev_prompt, scope, behavior_matrix)
VALUES (
    'OPS_08',
    NULL,
    'DIM_OPS',
    'PH_4_OPS',
    'Task Automation',
    'Event-Driven Operations Engine',
    'Automation of cleaning and maintenance tasks. TIER 3 features ''Intelligent Rescheduling''—if a guest checks out early, the cleaning team is notified to move up the intervention.',
    '1. Pedagogical Objective: Efficiency through events. Operations shouldn''t wait for humans. This teaches users ''Workflow Automation'' and resource optimization. 2. Behavior Matrix: TIER_0: Manual task creation. TIER_1/2: Triggered tasks (e.g., ''Clean after Checkout''). TIER_3: Intelligent Event-Driven Engine with Smart Lock integration and dynamic rescheduling. 3. User Journey & UI: Input: Automation rules (Triggers/Actions). Logic: If event 

$$Checkout$$

 -> Create task 

$$Clean$$

. Output: ''Automation History'' log. Coach: Why ''Early Check-in'' starts with an ''Early Checkout'' detection. 4. Business Logic: RG-01: Sync with OPS_09 (Provider App). RG-02 (Tier 3): Use Smart Lock door-locking events to trigger ''Ready for Cleaning'' status.',
    'GLOBAL',
    'TIER_0: Manual task creation. TIER_1/2: Triggered tasks (e.g., ''Clean after Checkout''). TIER_3: Intelligent Event-Driven Engine with Smart Lock integration and dynamic rescheduling.'
)
ON CONFLICT (id) DO UPDATE SET
    parent_feature_id = EXCLUDED.parent_feature_id,
    dimension_id = EXCLUDED.dimension_id,
    phase_id = EXCLUDED.phase_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    detailed_description = EXCLUDED.detailed_description,
    dev_prompt = EXCLUDED.dev_prompt,
    scope = EXCLUDED.scope,
    behavior_matrix = EXCLUDED.behavior_matrix;

INSERT INTO features (id, parent_feature_id, dimension_id, phase_id, name, description, detailed_description, dev_prompt, scope, behavior_matrix)
VALUES (
    'OPS_09',
    'OPS_08',
    'DIM_OPS',
    'PH_4_OPS',
    'Provider App',
    'Field Operations Terminal',
    'Mobile-optimized interface for field staff. TIER 3 features interactive checklists with mandatory photo proofing and instant inventory depletion alerts.',
    '1. Pedagogical Objective: Control quality remotely. You can''t be at every turnover. This teaches users to manage field teams via ''Evidence-Based Reporting''. 2. Behavior Matrix: TIER_0: Email notification to cleaner. TIER_1/2: WebApp with task list and ''Done'' button. TIER_3: Field Terminal with mandatory ''Photo Proof'' and Inventory Alerting. 3. User Journey & UI: Input: Tap to start / Take photo to finish. Logic: Geofenced check-in (optional). Output: ''Cleanliness Certificate'' for the owner. Coach: Why ''After'' photos are your best defense against ''Dirty Room'' complaints. 4. Business Logic: RG-01: Task cannot be closed without at least 3 photos. RG-02 (Tier 3): Low-stock button triggers an entry in Dimension EXP (Procurement).',
    'GLOBAL',
    'TIER_0: Email notification to cleaner. TIER_1/2: WebApp with task list and ''Done'' button. TIER_3: Field Terminal with mandatory ''Photo Proof'' and Inventory Alerting.'
)
ON CONFLICT (id) DO UPDATE SET
    parent_feature_id = EXCLUDED.parent_feature_id,
    dimension_id = EXCLUDED.dimension_id,
    phase_id = EXCLUDED.phase_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    detailed_description = EXCLUDED.detailed_description,
    dev_prompt = EXCLUDED.dev_prompt,
    scope = EXCLUDED.scope,
    behavior_matrix = EXCLUDED.behavior_matrix;

INSERT INTO features (id, parent_feature_id, dimension_id, phase_id, name, description, detailed_description, dev_prompt, scope, behavior_matrix)
VALUES (
    'OPS_10',
    'OPS_08',
    'DIM_OPS',
    'PH_4_OPS',
    'Ticketing System',
    'Property Maintenance & Incident Tracker',
    'Systematic tracking of maintenance issues. TIER 3 enables ''Automated Security Deposit Claims''—linking a reported damage ticket directly to the platform''s caution claim process.',
    '1. Pedagogical Objective: Close the loop on breakage. Small issues become big if untracked. This teaches users ''Asset Maintenance'' and dispute resolution. 2. Behavior Matrix: TIER_1/2: Incident list (Open/Closed). TIER_3: Integrated Ticketing with Damage-to-Claim bridge and automated cost recovery. 3. User Journey & UI: Input: Report issue (Photo + Category). Logic: Priority assignment + Cost tracking. Output: Incident history per property. Coach: Explains ''Normal Wear and Tear'' vs. ''Damage'' for security deposit claims. 4. Business Logic: RG-01: Link incident photos to Dimension OPS (Provider App). RG-02 (Tier 3): Auto-generate ''Damage Report'' PDF with replacement cost from EXP_01.',
    'GLOBAL',
    'TIER_1/2: Incident list (Open/Closed). TIER_3: Integrated Ticketing with Damage-to-Claim bridge and automated cost recovery.'
)
ON CONFLICT (id) DO UPDATE SET
    parent_feature_id = EXCLUDED.parent_feature_id,
    dimension_id = EXCLUDED.dimension_id,
    phase_id = EXCLUDED.phase_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    detailed_description = EXCLUDED.detailed_description,
    dev_prompt = EXCLUDED.dev_prompt,
    scope = EXCLUDED.scope,
    behavior_matrix = EXCLUDED.behavior_matrix;

INSERT INTO features (id, parent_feature_id, dimension_id, phase_id, name, description, detailed_description, dev_prompt, scope, behavior_matrix)
VALUES (
    'FIN_08',
    NULL,
    'DIM_FINANCE',
    'PH_4_OPS',
    'Commission Splitter',
    'Concierge Revenue Distribution Engine',
    'Automated revenue sharing for property managers. TIER 3 automates owner payouts and generates professional monthly financial reports with one-click tax exports.',
    '1. Pedagogical Objective: Financial transparency. If you manage for others, trust is your currency. This teaches the importance of ''Net-to-Owner'' clarity. 2. Behavior Matrix: TIER_1/2: Manual % calculator per booking. TIER_3: Automated Distribution Engine with Stripe Connect payouts and Whitelabel Owner Reports. 3. User Journey & UI: Input: Commission % + Deductible expense rules. Logic: Gross - Fees - Expenses = Net Owner. Output: Monthly ''Statement of Account'' PDF. Coach: Why showing ''Expense Proofs'' (Receipts) reduces owner friction. 4. Business Logic: RG-01: Mandatory TIER_2. RG-02 (Tier 3): Automated withholding of ''Management Fee'' during the payout cycle.',
    'GLOBAL',
    'TIER_1/2: Manual % calculator per booking. TIER_3: Automated Distribution Engine with Stripe Connect payouts and Whitelabel Owner Reports.'
)
ON CONFLICT (id) DO UPDATE SET
    parent_feature_id = EXCLUDED.parent_feature_id,
    dimension_id = EXCLUDED.dimension_id,
    phase_id = EXCLUDED.phase_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    detailed_description = EXCLUDED.detailed_description,
    dev_prompt = EXCLUDED.dev_prompt,
    scope = EXCLUDED.scope,
    behavior_matrix = EXCLUDED.behavior_matrix;

INSERT INTO features (id, parent_feature_id, dimension_id, phase_id, name, description, detailed_description, dev_prompt, scope, behavior_matrix)
VALUES (
    'LEG_07',
    NULL,
    'DIM_LEGAL',
    'PH_4_OPS',
    'Mandate Generator',
    'Legal Property Management Contract Suite',
    'Generates legally binding management contracts. TIER 3 includes integrated e-signatures and automated clause adaptation based on the property''s local jurisdiction.',
    '1. Pedagogical Objective: Legally secure delegation. A handshake is not a contract. This teaches users the legal boundaries of ''Concierge/Property Management'' services. 2. Behavior Matrix: TIER_1/2: Downloadable Word templates. TIER_3: Dynamic Mandate Generator with e-Signature integration and automatic clause adaptation (Region-specific). 3. User Journey & UI: Input: Fee structure + Liability limits. Logic: Variable-based legal text generation. Output: Digital contract link. Coach: Explains ''Liability'' and why you need professional indemnity insurance. 4. Business Logic: RG-01: Mandatory ''Termination Clause''. RG-02 (Tier 3): Store signed docs in ''Legal Vault'' with hash-based verification.',
    'LOC_PROPERTY',
    'TIER_1/2: Downloadable Word templates. TIER_3: Dynamic Mandate Generator with e-Signature integration and automatic clause adaptation (Region-specific).'
)
ON CONFLICT (id) DO UPDATE SET
    parent_feature_id = EXCLUDED.parent_feature_id,
    dimension_id = EXCLUDED.dimension_id,
    phase_id = EXCLUDED.phase_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    detailed_description = EXCLUDED.detailed_description,
    dev_prompt = EXCLUDED.dev_prompt,
    scope = EXCLUDED.scope,
    behavior_matrix = EXCLUDED.behavior_matrix;

INSERT INTO features (id, parent_feature_id, dimension_id, phase_id, name, description, detailed_description, dev_prompt, scope, behavior_matrix)
VALUES (
    'EXP_03',
    NULL,
    'DIM_EXP',
    'PH_4_OPS',
    'Web Welcome Book',
    'Interactive Guest Experience Portal',
    'Digital welcome book reducing guest inquiries. TIER 3 features an ''Upsell Engine''—allowing guests to purchase late checkouts or breakfast hampers directly from the page.',
    '1. Pedagogical Objective: Automate the obvious. 90% of guest questions are about WiFi or Parking. This teaches users to ''Front-load'' information to free up their time. 2. Behavior Matrix: TIER_0: Text-only ''Home Rules''. TIER_1/2: Interactive Web Guide with Map and Icons. TIER_3: Experience Portal with ''Upsell Store'' and multi-language AI auto-translation using open-source models. 3. User Journey & UI: Input: WiFi code, House rules, Local tips. Logic: Status-aware content. Output: PWA / QR Code. Coach: Why the first 5 mins of arrival defines the whole review. 4. Business Logic: RG-01: Generate QR Code PDF for printing. RG-02 (Tier 3): Integration with Stripe for extras (Late Checkout, etc.).',
    'GLOBAL',
    'TIER_0: Text-only ''Home Rules''. TIER_1/2: Interactive Web Guide with Map and Icons. TIER_3: Experience Portal with ''Upsell Store'' and multi-language AI auto-translation using open-source models.'
)
ON CONFLICT (id) DO UPDATE SET
    parent_feature_id = EXCLUDED.parent_feature_id,
    dimension_id = EXCLUDED.dimension_id,
    phase_id = EXCLUDED.phase_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    detailed_description = EXCLUDED.detailed_description,
    dev_prompt = EXCLUDED.dev_prompt,
    scope = EXCLUDED.scope,
    behavior_matrix = EXCLUDED.behavior_matrix;

INSERT INTO features (id, parent_feature_id, dimension_id, phase_id, name, description, detailed_description, dev_prompt, scope, behavior_matrix)
VALUES (
    'EXP_04',
    NULL,
    'DIM_EXP',
    'PH_4_OPS',
    'Guest AI Chatbot',
    'Contextual AI Guest Assistant',
    '24/7 AI support for guest questions. TIER 3 uses RAG (Retrieval-Augmented Generation) to answer technical questions by ''reading'' house manuals and boiler instructions.',
    '1. Pedagogical Objective: 24/7 responsiveness without burnout. This teaches users to scale communication through ''Knowledge Base'' management. 2. Behavior Matrix: TIER_1/2: Automated SMS triggers. TIER_3: Contextual AI Assistant using RAG on property documents with open-source LLM frameworks. 3. User Journey & UI: Input: Chat interface. Logic: Search within 

$$Welcome Book + Manuals + Previous Chats$$

. Output: Conversational answer. Coach: Why ''Speed of Response'' is the #1 factor in guest satisfaction scores. 4. Business Logic: RG-01 (Tier 3): If AI confidence < 80%, escalate to ''Human Host'' immediately. RG-02: Support for 20+ languages.',
    'GLOBAL',
    'TIER_1/2: Automated SMS triggers. TIER_3: Contextual AI Assistant using RAG on property documents with open-source LLM frameworks.'
)
ON CONFLICT (id) DO UPDATE SET
    parent_feature_id = EXCLUDED.parent_feature_id,
    dimension_id = EXCLUDED.dimension_id,
    phase_id = EXCLUDED.phase_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    detailed_description = EXCLUDED.detailed_description,
    dev_prompt = EXCLUDED.dev_prompt,
    scope = EXCLUDED.scope,
    behavior_matrix = EXCLUDED.behavior_matrix;

INSERT INTO features (id, parent_feature_id, dimension_id, phase_id, name, description, detailed_description, dev_prompt, scope, behavior_matrix)
VALUES (
    'FIN_05',
    NULL,
    'DIM_FINANCE',
    'PH_5_ANALYZE',
    'Occupancy Stats',
    'Market-Relative Performance Dashboard',
    'Basic occupancy and revenue tracking. TIER 3 features ''Predictive Performance Benchmarking''—comparing your actual results against a local ''Comp-set'' of similar properties.',
    '1. Pedagogical Objective: Don''t celebrate in a vacuum. A 90% occupancy is bad if everyone else is at 100%. This teaches the ''Yield Management'' metric (RevPAR). 2. Behavior Matrix: TIER_1/2: Personal occupancy & ADR charts. TIER_3: Predictive Benchmarking with ''Comp-set'' comparison against open data benchmarks. 3. User Journey & UI: Input: Booking data. Logic: RevPAR = ADR x Occupancy Rate. Output: Performance comparison graph vs. Market. Coach: ''The RevPAR Myth'': Why high occupancy with low rates can kill your profit. 4. Business Logic: RG-01: Calculate on ''Confirmed'' bookings only. RG-02 (Tier 3): Flag ''Underperforming'' dates.',
    'GLOBAL',
    'TIER_1/2: Personal occupancy & ADR charts. TIER_3: Predictive Benchmarking with ''Comp-set'' comparison against open data benchmarks.'
)
ON CONFLICT (id) DO UPDATE SET
    parent_feature_id = EXCLUDED.parent_feature_id,
    dimension_id = EXCLUDED.dimension_id,
    phase_id = EXCLUDED.phase_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    detailed_description = EXCLUDED.detailed_description,
    dev_prompt = EXCLUDED.dev_prompt,
    scope = EXCLUDED.scope,
    behavior_matrix = EXCLUDED.behavior_matrix;

INSERT INTO features (id, parent_feature_id, dimension_id, phase_id, name, description, detailed_description, dev_prompt, scope, behavior_matrix)
VALUES (
    'FIN_06',
    NULL,
    'DIM_FINANCE',
    'PH_5_ANALYZE',
    'FEC Export',
    'FR Standardized Accounting Exporter',
    'French ''Fichier des Écritures Comptables'' (FEC) generator. TIER 3 provides a direct real-time sync with major French accounting software.',
    '1. Pedagogical Objective: Accounting as a habit, not a crisis. An audit shouldn''t be scary. This teaches users ''Digital Record Keeping'' to ensure long-term business survival. 2. Behavior Matrix: TIER_1/2: Annual CSV export of income/expenses. TIER_3: Standardized FEC Exporter with real-time shadow ledger and direct software sync. 3. User Journey & UI: Input: Expense receipts + Income. Logic: Double-entry accounting bridge. Output: .txt FEC file. Coach: Why the ''FEC'' is mandatory for any French commercial activity. 4. Business Logic: RG-01: France scope only. RG-02: Block export if ''Journal balance'' is not zero.',
    'LOC_PROPERTY',
    'TIER_1/2: Annual CSV export of income/expenses. TIER_3: Standardized FEC Exporter with real-time shadow ledger and direct software sync.'
)
ON CONFLICT (id) DO UPDATE SET
    parent_feature_id = EXCLUDED.parent_feature_id,
    dimension_id = EXCLUDED.dimension_id,
    phase_id = EXCLUDED.phase_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    detailed_description = EXCLUDED.detailed_description,
    dev_prompt = EXCLUDED.dev_prompt,
    scope = EXCLUDED.scope,
    behavior_matrix = EXCLUDED.behavior_matrix;

INSERT INTO features (id, parent_feature_id, dimension_id, phase_id, name, description, detailed_description, dev_prompt, scope, behavior_matrix)
VALUES (
    'FIN_07',
    NULL,
    'DIM_FINANCE',
    'PH_5_ANALYZE',
    'MTD Export',
    'UK HMRC Compliance Bridge',
    'UK HMRC ''Making Tax Digital'' (MTD) compliant data exporter. TIER 3 enables direct submission of quarterly tax returns to HMRC via their official API gateway.',
    '1. Pedagogical Objective: Compliance through digital links. MTD is about removing manual error. This teaches the ''Audit Trail'' concept required by UK tax authorities. 2. Behavior Matrix: TIER_1/2: HMRC-ready spreadsheet export. TIER_3: MTD Compliance Bridge with direct quarterly submission to HMRC API. 3. User Journey & UI: Input: Income/Expense ledger. Logic: VAT & Income tax calculation per quarter. Output: Submission receipt from HMRC. Coach: Explains ''Digital Links'' and why manual copy-pasting is high risk. 4. Business Logic: RG-01: UK scope only. RG-02 (Tier 3): Authenticate via HMRC Gov-Gateway before submission.',
    'LOC_HOST',
    'TIER_1/2: HMRC-ready spreadsheet export. TIER_3: MTD Compliance Bridge with direct quarterly submission to HMRC API.'
)
ON CONFLICT (id) DO UPDATE SET
    parent_feature_id = EXCLUDED.parent_feature_id,
    dimension_id = EXCLUDED.dimension_id,
    phase_id = EXCLUDED.phase_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    detailed_description = EXCLUDED.detailed_description,
    dev_prompt = EXCLUDED.dev_prompt,
    scope = EXCLUDED.scope,
    behavior_matrix = EXCLUDED.behavior_matrix;

INSERT INTO features (id, parent_feature_id, dimension_id, phase_id, name, description, detailed_description, dev_prompt, scope, behavior_matrix)
VALUES (
    'FIN_10',
    NULL,
    'DIM_FINANCE',
    'PH_5_ANALYZE',
    'Double Tax Report',
    'Consolidated Cross-Border Tax Summary',
    'Report for declaring foreign income while avoiding double taxation. TIER 3 provides a case-by-case ''Filing Map''—indicating the exact tax credits available under international treaties.',
    '1. Pedagogical Objective: Global profit, home protection. Don''t pay tax twice. This teaches the user how to navigate international treaties to protect their bottom line. 2. Behavior Matrix: TIER_1/2: Consolidated income summary per country. TIER_3: Tax Treaty Advisor with ''Filing Map'' using public OECD/Treaty data. 3. User Journey & UI: Input: Residency + Property locations. Logic: Apply OECD Model Treaty rules. Output: A step-by-step ''Filing Guide''. Coach: What is a ''Double Tax Treaty'' and how it saves you money. 4. Business Logic: RG-01: Flag if no treaty exists between the two selected countries in public databases. RG-02: Support for ''Gross vs Net'' reporting requirements per jurisdiction.',
    'LOC_HOST',
    'TIER_1/2: Consolidated income summary per country. TIER_3: Tax Treaty Advisor with ''Filing Map'' using public OECD/Treaty data.'
)
ON CONFLICT (id) DO UPDATE SET
    parent_feature_id = EXCLUDED.parent_feature_id,
    dimension_id = EXCLUDED.dimension_id,
    phase_id = EXCLUDED.phase_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    detailed_description = EXCLUDED.detailed_description,
    dev_prompt = EXCLUDED.dev_prompt,
    scope = EXCLUDED.scope,
    behavior_matrix = EXCLUDED.behavior_matrix;

INSERT INTO features (id, parent_feature_id, dimension_id, phase_id, name, description, detailed_description, dev_prompt, scope, behavior_matrix)
VALUES (
    'PRI_02',
    NULL,
    'DIM_PRICING',
    'PH_5_ANALYZE',
    'RevPAR Optimizer',
    'AI-Driven Dynamic Pricing Algorithm',
    'Automated pricing algorithm maximizing total revenue. TIER 3 features ''Demand Elasticity Modeling''—adjusting rates based on weather, local events, and competitor velocity in real-time.',
    '1. Pedagogical Objective: Pricing as a living strategy. Fixed prices are a 1990s relic. This teaches ''Demand Elasticity'' and maximizing the ''Yield Curve''. 2. Behavior Matrix: TIER_1/2: Rule-based pricing. TIER_3: AI Dynamic Pricing with 20+ variables using public weather, holiday, and event data. 3. User Journey & UI: Input: Min/Max Price + Strategy. Logic: Demand Elasticity Modeling. Output: ''Price Forecast'' chart. Coach: Why ''Leaving a night empty'' is sometimes better than selling it too cheap. 4. Business Logic: RG-01 (Tier 3): Unlimited sync frequency. RG-02: Never drop below ''Min Price'' defined in FIN_01.',
    'GLOBAL',
    'TIER_1/2: Rule-based pricing. TIER_3: AI Dynamic Pricing with 20+ variables using public weather, holiday, and event data.'
)
ON CONFLICT (id) DO UPDATE SET
    parent_feature_id = EXCLUDED.parent_feature_id,
    dimension_id = EXCLUDED.dimension_id,
    phase_id = EXCLUDED.phase_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    detailed_description = EXCLUDED.detailed_description,
    dev_prompt = EXCLUDED.dev_prompt,
    scope = EXCLUDED.scope,
    behavior_matrix = EXCLUDED.behavior_matrix;

INSERT INTO features (id, parent_feature_id, dimension_id, phase_id, name, description, detailed_description, dev_prompt, scope, behavior_matrix)
VALUES (
    'MKT_03',
    NULL,
    'DIM_MKT',
    'PH_6_SCALE',
    'Direct Booking Site',
    'Conversion-Optimized Direct Booking Engine',
    'Commission-free website builder for direct bookings. TIER 3 features ''Instant Inventory Sync'' and a high-performance checkout with integrated loyalty/referral modules.',
    '1. Pedagogical Objective: Take back control. Platforms are for acquisition; your site is for retention. This teaches users the value of ''Direct Traffic'' and zero-commission profit. 2. Behavior Matrix: TIER_1/2: Single property landing page with inquiry form. TIER_3: High-Performance Direct Booking Engine with multi-unit search, live checkout, and Loyalty module. 3. User Journey & UI: Input: Logo + Custom domain. Logic: Real-time availability pull from OPS_03. Output: Fully hosted booking site. Coach: The ''Billboard Effect''. 4. Business Logic: RG-01 (Tier 3): Stripe payment required. RG-02: Automatic SSL certificate generation.',
    'GLOBAL',
    'TIER_1/2: Single property landing page with inquiry form. TIER_3: High-Performance Direct Booking Engine with multi-unit search, live checkout, and Loyalty module.'
)
ON CONFLICT (id) DO UPDATE SET
    parent_feature_id = EXCLUDED.parent_feature_id,
    dimension_id = EXCLUDED.dimension_id,
    phase_id = EXCLUDED.phase_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    detailed_description = EXCLUDED.detailed_description,
    dev_prompt = EXCLUDED.dev_prompt,
    scope = EXCLUDED.scope,
    behavior_matrix = EXCLUDED.behavior_matrix;

INSERT INTO features (id, parent_feature_id, dimension_id, phase_id, name, description, detailed_description, dev_prompt, scope, behavior_matrix)
VALUES (
    'OPS_06',
    NULL,
    'DIM_OPS',
    'PH_6_SCALE',
    'Team Management',
    'Granular RBAC Operations Portal',
    'Multi-user access control for delegating operations. TIER 3 enables ''Feature-Level Permissions''—ensuring staff can manage messages but never view sensitive financial data or exports.',
    '1. Pedagogical Objective: Delegation without risk. You can''t scale if you can''t trust. This teaches users ''Role-Based Access Control'' (RBAC) and process isolation. 2. Behavior Matrix: TIER_1/2: Multi-user (Owner/Co-host). TIER_3: Granular RBAC Portal with custom permission sets and full Audit Logging. 3. User Journey & UI: Input: Team member email + Role selection. Logic: Permission mask application. Output: ''Team Activity'' audit log. Coach: Why you should never share your primary Airbnb password with staff. 4. Business Logic: RG-01: ''Owner'' cannot be deleted. RG-02 (Tier 3): Ability to restrict access to ''Finance'' dimension specifically.',
    'GLOBAL',
    'TIER_1/2: Multi-user (Owner/Co-host). TIER_3: Granular RBAC Portal with custom permission sets and full Audit Logging.'
)
ON CONFLICT (id) DO UPDATE SET
    parent_feature_id = EXCLUDED.parent_feature_id,
    dimension_id = EXCLUDED.dimension_id,
    phase_id = EXCLUDED.phase_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    detailed_description = EXCLUDED.detailed_description,
    dev_prompt = EXCLUDED.dev_prompt,
    scope = EXCLUDED.scope,
    behavior_matrix = EXCLUDED.behavior_matrix;

INSERT INTO features (id, parent_feature_id, dimension_id, phase_id, name, description, detailed_description, dev_prompt, scope, behavior_matrix)
VALUES (
    'OPS_07',
    'OPS_06',
    'DIM_OPS',
    'PH_6_SCALE',
    'Investor Portal',
    'Transparency & ROI Reporting Dashboard',
    'Read-only portal for property owners to track their investment. TIER 3 features ''Whitelabel Reporting''—allowing managers to present the data under their own brand with custom performance narratives.',
    '1. Pedagogical Objective: Professionalism as a service. Investors pay for peace of mind. This teaches property managers how to provide ''Institutional-Grade'' transparency. 2. Behavior Matrix: TIER_1/2: Monthly PDF reports via email. TIER_3: Live Read-Only Portal with Whitelabel branding and custom ROI commentary. 3. User Journey & UI: Input: Manager commentary + Investor invite. Logic: Real-time filtering of operational noise. Output: Investor-specific performance view. Coach: Why ''Context'' is more important than raw numbers. 4. Business Logic: RG-01: Read-only access enforced. RG-02: Mandatory ''Manager Review'' before stats are visible to the investor.',
    'GLOBAL',
    'TIER_1/2: Monthly PDF reports via email. TIER_3: Live Read-Only Portal with Whitelabel branding and custom ROI commentary.'
)
ON CONFLICT (id) DO UPDATE SET
    parent_feature_id = EXCLUDED.parent_feature_id,
    dimension_id = EXCLUDED.dimension_id,
    phase_id = EXCLUDED.phase_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    detailed_description = EXCLUDED.detailed_description,
    dev_prompt = EXCLUDED.dev_prompt,
    scope = EXCLUDED.scope,
    behavior_matrix = EXCLUDED.behavior_matrix;

INSERT INTO features (id, parent_feature_id, dimension_id, phase_id, name, description, detailed_description, dev_prompt, scope, behavior_matrix)
VALUES (
    'LEG_06',
    NULL,
    'DIM_LEGAL',
    'PH_6_SCALE',
    'Company Audit',
    'Structural Wealth Optimization Simulator',
    'Simulation for transitioning from personal to corporate ownership. TIER 3 provides a ''Total Wealth Impact'' analysis, accounting for inheritance tax and future exit strategies.',
    '1. Pedagogical Objective: Long-term legacy. Real estate is a marathon. This teaches users to think about ''Succession'' and ''Exit taxes'' as much as monthly rent. 2. Behavior Matrix: TIER_1/2: Basic IR vs. IS (Personal vs. Corp) calculator. TIER_3: Wealth Optimization Simulator with 20-year exit strategy and inheritance tax planning based on public tax regulations. 3. User Journey & UI: Input: Portfolio value + Family status + Long-term goals. Logic: Total Wealth Impact simulation. Output: ''Strategic Transition Roadmap''. Coach: ''The Trap'': Why personal ownership feels good today but might cost you 40% in 30 years. 4. Business Logic: RG-01: Logic adaptation per host country tax rules. RG-02: Disclaimer: ''Simulated data only, consult a lawyer''.',
    'LOC_HOST',
    'TIER_1/2: Basic IR vs. IS (Personal vs. Corp) calculator. TIER_3: Wealth Optimization Simulator with 20-year exit strategy and inheritance tax planning based on public tax regulations.'
)
ON CONFLICT (id) DO UPDATE SET
    parent_feature_id = EXCLUDED.parent_feature_id,
    dimension_id = EXCLUDED.dimension_id,
    phase_id = EXCLUDED.phase_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    detailed_description = EXCLUDED.detailed_description,
    dev_prompt = EXCLUDED.dev_prompt,
    scope = EXCLUDED.scope,
    behavior_matrix = EXCLUDED.behavior_matrix;
