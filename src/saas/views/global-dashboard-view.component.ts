import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { SupabaseService } from '../../services/supabase.service';

interface DashboardKPI {
    label: string;
    value: string;
    subValue?: string;
    color: string;
}

interface PropertyPerformance {
    name: string;
    occupancy: number;
    adr: number;
    revpar: number;
    revenue: number;
    margin: number;
}

@Component({
    selector: 'saas-global-dashboard-view',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslatePipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div class="space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-3xl font-bold text-white">
                    {{ 'DASHBOARD.GlobalDashboard' | translate }}
                </h1>
                <p class="mt-1 text-slate-400">
                    {{ 'DASHBOARD.OverviewAllProperties' | translate }}
                </p>
            </div>
            <!-- Period Selector -->
            <select [(ngModel)]="selectedPeriod" (ngModelChange)="loadData()" 
                    class="bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-sm text-white">
                <option value="month" class="bg-slate-800">{{ 'DASHBOARD.ThisMonth' | translate }}</option>
                <option value="quarter" class="bg-slate-800">{{ 'DASHBOARD.ThisQuarter' | translate }}</option>
                <option value="year" class="bg-slate-800">{{ 'DASHBOARD.ThisYear' | translate }}</option>
                <option value="all" class="bg-slate-800">{{ 'DASHBOARD.AllTime' | translate }}</option>
            </select>
        </div>

        <!-- KPI Cards -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            @for (kpi of kpis(); track kpi.label) {
                <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-5">
                    <p class="text-xs font-semibold text-slate-400 uppercase tracking-wide">{{ kpi.label | translate }}</p>
                    <p class="mt-2 text-2xl font-bold" [class]="kpi.color">{{ kpi.value }}</p>
                    @if (kpi.subValue) {
                        <p class="text-xs text-slate-500 mt-1">{{ kpi.subValue }}</p>
                    }
                </div>
            }
        </div>

        <!-- Revenue & Expenses Breakdown -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Revenue by Source -->
            <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 class="text-lg font-bold text-white mb-4">{{ 'DASHBOARD.RevenueBySource' | translate }}</h3>
                @if (revenueBySource().length > 0) {
                    <div class="space-y-3">
                        @for (source of revenueBySource(); track source.name) {
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-3">
                                    <div class="w-3 h-3 rounded-full" [style.background-color]="source.color"></div>
                                    <span class="text-sm text-slate-300">{{ source.name }}</span>
                                </div>
                                <span class="font-semibold text-white">{{ source.amount | currency:'EUR' }}</span>
                            </div>
                        }
                    </div>
                } @else {
                    <p class="text-slate-500 text-sm text-center py-4">{{ 'DASHBOARD.NoRevenueData' | translate }}</p>
                }
            </div>

            <!-- Expenses by Category -->
            <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
                <h3 class="text-lg font-bold text-white mb-4">{{ 'DASHBOARD.ExpensesByCategory' | translate }}</h3>
                @if (expensesByCategory().length > 0) {
                    <div class="space-y-3">
                        @for (exp of expensesByCategory(); track exp.name) {
                            <div class="flex items-center justify-between">
                                <div class="flex items-center gap-3">
                                    <div class="w-3 h-3 rounded-full" [style.background-color]="exp.color"></div>
                                    <span class="text-sm text-slate-300">{{ exp.name }}</span>
                                </div>
                                <span class="font-semibold text-white">{{ exp.amount | currency:'EUR' }}</span>
                            </div>
                        }
                    </div>
                } @else {
                    <p class="text-slate-500 text-sm text-center py-4">{{ 'DASHBOARD.NoExpenseData' | translate }}</p>
                }
            </div>
        </div>

        <!-- Properties Performance -->
        <div class="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 class="text-lg font-bold text-white mb-4">{{ 'DASHBOARD.PropertiesPerformance' | translate }}</h3>
            @if (properties().length > 0) {
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead>
                            <tr class="border-b border-white/10">
                                <th class="text-left py-3 px-4 font-semibold text-slate-300">{{ 'DASHBOARD.Property' | translate }}</th>
                                <th class="text-right py-3 px-4 font-semibold text-slate-300">{{ 'DASHBOARD.Occupancy' | translate }}</th>
                                <th class="text-right py-3 px-4 font-semibold text-slate-300">{{ 'DASHBOARD.ADR' | translate }}</th>
                                <th class="text-right py-3 px-4 font-semibold text-slate-300">{{ 'DASHBOARD.RevPAR' | translate }}</th>
                                <th class="text-right py-3 px-4 font-semibold text-slate-300">{{ 'DASHBOARD.Revenue' | translate }}</th>
                                <th class="text-right py-3 px-4 font-semibold text-slate-300">{{ 'DASHBOARD.Margin' | translate }}</th>
                            </tr>
                        </thead>
                        <tbody>
                            @for (prop of properties(); track prop.name) {
                                <tr class="border-b border-white/10 hover:bg-white/5">
                                    <td class="py-3 px-4 font-medium text-white">{{ prop.name }}</td>
                                    <td class="py-3 px-4 text-right text-slate-300">{{ prop.occupancy }}%</td>
                                    <td class="py-3 px-4 text-right text-slate-300">{{ prop.adr | currency:'EUR' }}</td>
                                    <td class="py-3 px-4 text-right text-slate-300">{{ prop.revpar | currency:'EUR' }}</td>
                                    <td class="py-3 px-4 text-right text-green-400 font-medium">{{ prop.revenue | currency:'EUR' }}</td>
                                    <td class="py-3 px-4 text-right" [class]="prop.margin >= 0 ? 'text-green-400' : 'text-red-400'">{{ prop.margin }}%</td>
                                </tr>
                            }
                        </tbody>
                    </table>
                </div>
            } @else {
                <p class="text-slate-500 text-sm text-center py-4">{{ 'DASHBOARD.NoPropertiesData' | translate }}</p>
            }
        </div>

        <!-- Loading State -->
        @if (isLoading()) {
            <div class="flex items-center justify-center py-12">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
        }
    </div>
    `
})
export class GlobalDashboardViewComponent implements OnInit {
    private supabase = inject(SupabaseService);

    selectedPeriod = 'month';
    isLoading = signal(false);
    properties = signal<PropertyPerformance[]>([]);
    propertyIds = signal<string[]>([]);

    calendarEvents = signal<any[]>([]);
    ledgerEntries = signal<any[]>([]);

    kpis = computed((): DashboardKPI[] => {
        const entries = this.ledgerEntries();
        const events = this.calendarEvents();
        const props = this.propertyIds();
        const totalDays = props.length > 0 ? props.length * this.getDaysInPeriod() : 365;
        const bookedDays = events.length;
        const occupancy = totalDays > 0 ? Math.round((bookedDays / totalDays) * 100) : 0;

        const totalRevenue = entries.filter(e => e.type === 'income').reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
        const totalExpenses = entries.filter(e => e.type === 'expense').reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
        const netProfit = totalRevenue - totalExpenses;
        const margin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;
        const adr = bookedDays > 0 ? totalRevenue / bookedDays : 0;
        const revpar = totalDays > 0 ? totalRevenue / totalDays : 0;

        return [
            {
                label: 'DASHBOARD.OccupancyRate',
                value: `${occupancy}%`,
                subValue: bookedDays + ' / ' + totalDays + ' days',
                color: occupancy >= 60 ? 'text-green-400' : occupancy >= 40 ? 'text-yellow-400' : 'text-red-400'
            },
            {
                label: 'DASHBOARD.AverageDailyRate',
                value: this.formatCurrency(adr),
                subValue: 'Per night',
                color: 'text-white'
            },
            {
                label: 'DASHBOARD.TotalRevenue',
                value: this.formatCurrency(totalRevenue),
                subValue: this.getPeriodLabel(),
                color: 'text-green-400'
            },
            {
                label: 'DASHBOARD.NetMargin',
                value: `${margin}%`,
                subValue: this.formatCurrency(netProfit),
                color: margin >= 30 ? 'text-green-400' : margin >= 15 ? 'text-yellow-400' : 'text-red-400'
            }
        ];
    });

    revenueBySource = computed(() => {
        const entries = this.ledgerEntries().filter(e => e.type === 'income');
        const byCategory: Record<string, number> = {};
        entries.forEach(e => {
            const cat = e.category || 'other';
            byCategory[cat] = (byCategory[cat] || 0) + parseFloat(e.amount || 0);
        });
        const colors = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444'];
        return Object.entries(byCategory).map(([name, amount], i) => ({
            name: this.getCategoryLabel(name),
            amount,
            color: colors[i % colors.length]
        })).sort((a, b) => b.amount - a.amount);
    });

    expensesByCategory = computed(() => {
        const entries = this.ledgerEntries().filter(e => e.type === 'expense');
        const byCategory: Record<string, number> = {};
        entries.forEach(e => {
            const cat = e.category || 'other';
            byCategory[cat] = (byCategory[cat] || 0) + parseFloat(e.amount || 0);
        });
        const colors = ['#EF4444', '#F59E0B', '#EC4899', '#8B5CF6', '#6366F1'];
        return Object.entries(byCategory).map(([name, amount], i) => ({
            name: this.getCategoryLabel(name),
            amount,
            color: colors[i % colors.length]
        })).sort((a, b) => b.amount - a.amount);
    });

    async ngOnInit() {
        await this.loadData();
    }

    async loadData() {
        this.isLoading.set(true);
        try {
            const { data: props } = await this.supabase.supabase
                .from('properties')
                .select('id, name');

            if (props && props.length > 0) {
                const ids = props.map((p: any) => p.id);
                this.propertyIds.set(ids);

                const { data: events } = await this.supabase.supabase
                    .from('calendar_events')
                    .select('*')
                    .in('property_id', ids)
                    .gte('start', this.getStartDate())
                    .lte('end', this.getEndDate());

                if (events) this.calendarEvents.set(events);

                const { data: entries } = await this.supabase.supabase
                    .from('ledger_entries')
                    .select('*')
                    .in('property_id', ids)
                    .gte('entry_date', this.getStartDate())
                    .lte('entry_date', this.getEndDate());

                if (entries) this.ledgerEntries.set(entries);

                const propPerformance: PropertyPerformance[] = props.map((p: any) => {
                    const propEntries = entries?.filter((e: any) => e.property_id === p.id) || [];
                    const propRevenue = propEntries.filter((e: any) => e.type === 'income').reduce((sum: number, e: any) => sum + parseFloat(e.amount || 0), 0);
                    const propExpenses = propEntries.filter((e: any) => e.type === 'expense').reduce((sum: number, e: any) => sum + parseFloat(e.amount || 0), 0);
                    const propEvents = events?.filter((e: any) => e.property_id === p.id) || [];
                    const bookedDays = propEvents.length;
                    const days = this.getDaysInPeriod();
                    const occupancy = days > 0 ? Math.round((bookedDays / days) * 100) : 0;
                    const adr = bookedDays > 0 ? propRevenue / bookedDays : 0;
                    const revpar = days > 0 ? propRevenue / days : 0;
                    const margin = propRevenue > 0 ? Math.round(((propRevenue - propExpenses) / propRevenue) * 100) : 0;
                    return {
                        name: p.name,
                        occupancy,
                        adr,
                        revpar,
                        revenue: propRevenue,
                        margin
                    };
                });
                this.properties.set(propPerformance);
            }
        } catch (e) {
            console.error('Error loading dashboard data:', e);
        }
        this.isLoading.set(false);
    }

    getDaysInPeriod(): number {
        switch (this.selectedPeriod) {
            case 'month': return 30;
            case 'quarter': return 90;
            case 'year': return 365;
            default: return 365;
        }
    }

    getStartDate(): string {
        const now = new Date();
        switch (this.selectedPeriod) {
            case 'month':
                return new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
            case 'quarter':
                const quarter = Math.floor(now.getMonth() / 3);
                return new Date(now.getFullYear(), quarter * 3, 1).toISOString().split('T')[0];
            case 'year':
                return new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
            default:
                return '2020-01-01';
        }
    }

    getEndDate(): string {
        return new Date().toISOString().split('T')[0];
    }

    getPeriodLabel(): string {
        switch (this.selectedPeriod) {
            case 'month': return 'This month';
            case 'quarter': return 'This quarter';
            case 'year': return 'This year';
            default: return 'All time';
        }
    }

    formatCurrency(value: number): string {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(value);
    }

    getCategoryLabel(key: string): string {
        const labels: Record<string, string> = {
            'rental': 'Rental Income',
            'cleaning': 'Cleaning Fee',
            'other_income': 'Other Income',
            'maintenance': 'Maintenance',
            'utilities': 'Utilities',
            'cleaning_exp': 'Cleaning',
            'supplies': 'Supplies',
            'management': 'Management',
            'tax': 'Tax',
            'insurance': 'Insurance',
            'mortgage': 'Mortgage',
            'other_expense': 'Other'
        };
        return labels[key] || key;
    }
}
