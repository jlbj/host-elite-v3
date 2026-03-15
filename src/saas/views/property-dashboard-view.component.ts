import { ChangeDetectionStrategy, Component, inject, signal, computed, OnInit, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../pipes/translate.pipe';
import { SupabaseService } from '../../services/supabase.service';
import { HostRepository } from '../../services/host-repository.service';

interface PropertyKPI {
    label: string;
    value: string;
    subValue?: string;
    color: string;
}

@Component({
    selector: 'saas-property-dashboard-view',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslatePipe],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
    <div class="space-y-6">
        <!-- Header with Property Name -->
        <div class="flex items-center justify-between">
            <div>
                <h1 class="text-3xl font-bold text-white">{{ displayName() || propertyName() }}</h1>
                <p class="mt-1 text-slate-400">{{ 'DASHBOARD.PropertyOverview' | translate }}</p>
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

        <!-- Loading State -->
        @if (isLoading()) {
            <div class="flex items-center justify-center py-12">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
            </div>
        }
    </div>
    `
})
export class PropertyDashboardViewComponent implements OnInit {
    private supabase = inject(SupabaseService);
    private repository = inject(HostRepository);

    propertyName = input<string>('');

    selectedPeriod = 'month';
    isLoading = signal(false);
    propertyId = signal<string | null>(null);
    displayName = signal<string>('');

    calendarEvents = signal<any[]>([]);
    ledgerEntries = signal<any[]>([]);

    kpis = computed((): PropertyKPI[] => {
        const entries = this.ledgerEntries();
        const events = this.calendarEvents();
        const days = this.getDaysInPeriod();
        
        const bookedDays = events.length;
        const occupancy = days > 0 ? Math.round((bookedDays / days) * 100) : 0;

        const totalRevenue = entries.filter(e => e.type === 'income').reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
        const totalExpenses = entries.filter(e => e.type === 'expense').reduce((sum, e) => sum + parseFloat(e.amount || 0), 0);
        const netProfit = totalRevenue - totalExpenses;
        const margin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;
        const adr = bookedDays > 0 ? totalRevenue / bookedDays : 0;
        const revpar = days > 0 ? totalRevenue / days : 0;

        return [
            {
                label: 'DASHBOARD.OccupancyRate',
                value: `${occupancy}%`,
                subValue: bookedDays + ' / ' + days + ' days',
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
        const propName = this.propertyName();
        if (propName) {
            try {
                const prop = await this.repository.getPropertyByName(propName);
                if (prop) {
                    this.propertyId.set(prop.id);
                    this.displayName.set(prop.name);
                    await this.loadData();
                }
            } catch (e) {
                console.error('Error loading property:', e);
            }
        }
    }

    async loadData() {
        const propId = this.propertyId();
        if (!propId) return;

        this.isLoading.set(true);
        try {
            const { data: events } = await this.supabase.supabase
                .from('calendar_events')
                .select('*')
                .eq('property_id', propId)
                .gte('start', this.getStartDate())
                .lte('end', this.getEndDate());

            if (events) this.calendarEvents.set(events);

            const { data: entries } = await this.supabase.supabase
                .from('ledger_entries')
                .select('*')
                .eq('property_id', propId)
                .gte('entry_date', this.getStartDate())
                .lte('entry_date', this.getEndDate());

            if (entries) this.ledgerEntries.set(entries);
        } catch (e) {
            console.error('Error loading property dashboard data:', e);
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
