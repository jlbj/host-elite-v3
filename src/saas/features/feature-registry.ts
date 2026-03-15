import { Type } from '@angular/core';

// Finance
import { ProfitabilitySuiteComponent } from './finance/profitability-suite/profitability-suite.component';
import { RoiSimulatorComponent } from './finance/roi-simulator/roi-simulator.component';
import { RenovationBudgetComponent } from './finance/renovation-budget/renovation-budget.component';
import { LmnpTaxSimulatorComponent } from './finance/lmnp-tax-simulator/lmnp-tax-simulator.component';
import { Section24SimulatorComponent } from './finance/section-24-simulator/section-24-simulator.component';
import { OccupancyStatsComponent } from './finance/occupancy-stats/occupancy-stats.component';
import { FecExporterComponent } from './finance/fec-exporter/fec-exporter.component';
import { MtdExportComponent } from './finance/mtd-export/mtd-export.component';
import { CommissionSplitterComponent } from './finance/commission-splitter/commission-splitter.component';
import { NonResidentTaxComponent } from './finance/non-resident-tax/non-resident-tax.component';
import { DoubleTaxReportComponent } from './finance/double-tax-report/double-tax-report.component';
import { SmartLedgerComponent } from './finance/smart-ledger/smart-ledger.component';

// Legal
import { ComplianceCheckerComponent } from './legal/compliance-checker/compliance-checker.component';
import { RegulatoryChecklistComponent } from './legal/regulatory-checklist/regulatory-checklist.component';
import { ZweckentfremdungComponent } from './legal/zweckentfremdung/zweckentfremdung.component';
import { CerfaGeneratorComponent } from './legal/cerfa-generator/cerfa-generator.component';
import { VutLicenseComponent } from './legal/vut-license/vut-license.component';
import { ImpressumComponent } from './legal/impressum/impressum.component';
import { CompanyAuditComponent } from './legal/company-audit/company-audit.component';
import { MandateGeneratorComponent } from './legal/mandate-generator/mandate-generator.component';
import { ForeignIdComponent } from './legal/foreign-id/foreign-id.component';
import { RentalContractTemplateComponent } from './legal/rental-contract-template/rental-contract-template.component';
import { PropertyLicensingComponent } from './legal/property-licensing/property-licensing.component';
import { InsuranceRequirementsComponent } from './legal/insurance-requirements/insurance-requirements.component';
import { TaxObligationsComponent } from './legal/tax-obligations/tax-obligations.component';

// Operations
import { MaintenanceTrackerComponent } from './operations/maintenance-tracker/maintenance-tracker.component';
import { IcalSyncComponent } from './operations/ical-sync/ical-sync.component';
import { ChannelManagerComponent } from './operations/channel-manager/channel-manager.component';
import { TeamManagementComponent } from './operations/team-management/team-management.component';
import { InvestorPortalComponent } from './operations/investor-portal/investor-portal.component';
import { ConstructionScheduleComponent } from './operations/construction-schedule/construction-schedule.component';
import { PoliceConnectionComponent } from './operations/police-connection/police-connection.component';
import { NinetyDayCounterComponent } from './operations/ninety-day-counter/ninety-day-counter.component';
import { TaskAutomationComponent } from './operations/task-automation/task-automation.component';
import { ProviderAppComponent } from './operations/provider-app/provider-app.component';
import { ChecklistsToolComponent } from './operations/checklists-tool/checklists-tool.component';
import { DataEntryFeatureComponent } from './operations/data-entry-feature/data-entry-feature.component';

// Marketing
import { ListingOptimizationComponent } from './marketing/listing-optimization/listing-optimization.component';
import { PhotoGuideComponent } from './marketing/photo-guide/photo-guide.component';
import { AiListingWriterComponent } from './marketing/ai-listing-writer/ai-listing-writer.component';
import { DirectBookingComponent } from './marketing/direct-booking/direct-booking.component';

// Pricing
import { YieldSetupComponent } from './pricing/yield-setup/yield-setup.component';
import { RevparOptimizerComponent } from './pricing/revpar-optimizer/revpar-optimizer.component';
import { MarketAlertsComponent } from './pricing/market-alerts/market-alerts.component';

// experience
import { EssentialsListComponent } from './experience/essentials-list/essentials-list.component';
import { WelcomeBookComponent } from './experience/welcome-book/welcome-book.component';
import { InventoryGeneratorComponent } from './experience/inventory-generator/inventory-generator.component';
import { GuestAiChatbotComponent } from './experience/guest-ai-chatbot/guest-ai-chatbot.component';

// Welcome Booklet (Marketing)
import { WelcomeBookletListingComponent } from '../views/welcome-booklet/components/welcome-booklet-listing.component';
import { WelcomeBookletPreviewComponent } from '../views/welcome-booklet/components/welcome-booklet-preview.component';
import { WelcomeBookletMicrositeComponent } from '../views/welcome-booklet/components/welcome-booklet-microsite.component';

export const FEATURE_COMPONENTS: Record<string, Type<any>> = {
    // Finance (11)
    'FIN_00_CONSULT': ProfitabilitySuiteComponent,
    'FIN_01': RoiSimulatorComponent,
    'FIN_02': RenovationBudgetComponent,
    'FIN_03': LmnpTaxSimulatorComponent,
    'FIN_04': Section24SimulatorComponent,
    'FIN_05': OccupancyStatsComponent,
    'FIN_06': FecExporterComponent,
    'FIN_07': MtdExportComponent,
    'FIN_08': CommissionSplitterComponent,
    'FIN_09': NonResidentTaxComponent,
    'FIN_10': DoubleTaxReportComponent,

    // Legal (9)
    'LEG_00': ComplianceCheckerComponent,
    'LEG_01': RegulatoryChecklistComponent,
    'LEG_02': ZweckentfremdungComponent,
    'LEG_03': CerfaGeneratorComponent,
    'LEG_04': VutLicenseComponent,
    'LEG_05': ImpressumComponent,
    'LEG_06': CompanyAuditComponent,
    'LEG_07': MandateGeneratorComponent,
    'LEG_08': ForeignIdComponent,
    'LEG_09': RentalContractTemplateComponent,
    'LEG_10': PropertyLicensingComponent,
    'LEG_11': InsuranceRequirementsComponent,
    'LEG_12': TaxObligationsComponent,

    // Operations (14 - including sub-features)
    'OPS_01': ConstructionScheduleComponent,
    'OPS_02': IcalSyncComponent,
    'OPS_03': ChannelManagerComponent,
    'OPS_03_AIRBNB': ChannelManagerComponent,
    'OPS_03_BOOKING': ChannelManagerComponent,
    'OPS_03_VRBO': ChannelManagerComponent,
    'OPS_04': PoliceConnectionComponent,
    'OPS_05': NinetyDayCounterComponent,
    'OPS_06': TeamManagementComponent,
    'OPS_07': InvestorPortalComponent,
    'OPS_08': TaskAutomationComponent,
    'OPS_09': ProviderAppComponent,
    'OPS_10': MaintenanceTrackerComponent,
    'OPS_11': ChecklistsToolComponent,
    'OPS_12': DataEntryFeatureComponent,

    // Marketing (4)
    'MKT_00': WelcomeBookletListingComponent,
    'MKT_01': WelcomeBookletPreviewComponent,
    'MKT_02': WelcomeBookletMicrositeComponent,
    'MKT_03': DirectBookingComponent,
    'MKT_04': ListingOptimizationComponent, // Placeholder

    // Pricing (3)
    'PRI_01': YieldSetupComponent,
    'PRI_02': RevparOptimizerComponent,
    'PRI_03': MarketAlertsComponent,

    // Experience (4)
    'EXP_01': EssentialsListComponent,
    'EXP_02': InventoryGeneratorComponent,
    'EXP_03': WelcomeBookComponent,
    'EXP_04': GuestAiChatbotComponent,
};
