
import { Component, computed, inject, signal, effect, OnInit, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../../pipes/translate.pipe';
import { SessionStore } from '../../../../state/session.store';
import { FormsModule } from '@angular/forms';
import { SupabaseService } from '../../../../services/supabase.service';

interface LedgerEntry {
    id: string;
    type: 'income' | 'expense';
    category: string;
    amount: number;
    description: string;
    entry_date: string;
    counterparty?: string;
}

@Component({
    selector: 'fin-11-smart-ledger',
    standalone: true,
    imports: [CommonModule, FormsModule, TranslatePipe],
    template: `
    <div class="h-full flex flex-col gap-6 animate-fade-in-up">
      <!-- Header -->
      <div class="flex justify-between items-start">
        <div>
          <h2 class="text-2xl font-bold text-white">
            {{ 'FIN_11.Title' | translate }}
          </h2>
          <p class="text-slate-400 text-sm mt-1">{{ 'FIN_11.Subtitle' | translate }}</p>
        </div>
        <div class="flex items-center gap-3">
            <select [(ngModel)]="selectedPeriod" class="bg-slate-800 border border-white/10 text-white text-sm rounded-lg px-3 py-2">
                <option value="monthly">{{ 'LEDGER.Monthly' | translate }}</option>
                <option value="quarterly">{{ 'LEDGER.Quarterly' | translate }}</option>
                <option value="yearly">{{ 'LEDGER.Yearly' | translate }}</option>
            </select>
        </div>
      </div>

      <!-- Summary Cards -->
      <div class="grid grid-cols-3 gap-4">
        <div class="bg-slate-800/50 rounded-xl p-4 border border-white/10">
            <p class="text-slate-400 text-xs uppercase font-bold">{{ 'LEDGER.TotalIncome' | translate }}</p>
            <p class="text-2xl font-bold text-green-400 mt-1">{{ formatCurrency(totalIncome()) }}</p>
        </div>
        <div class="bg-slate-800/50 rounded-xl p-4 border border-white/10">
            <p class="text-slate-400 text-xs uppercase font-bold">{{ 'LEDGER.TotalExpenses' | translate }}</p>
            <p class="text-2xl font-bold text-red-400 mt-1">{{ formatCurrency(totalExpenses()) }}</p>
        </div>
        <div class="bg-slate-800/50 rounded-xl p-4 border border-white/10">
            <p class="text-slate-400 text-xs uppercase font-bold">{{ 'LEDGER.NetBalance' | translate }}</p>
            <p class="text-2xl font-bold mt-1" [class]="netBalance() >= 0 ? 'text-green-400' : 'text-red-400'">{{ formatCurrency(netBalance()) }}</p>
        </div>
      </div>

      <!-- Main Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        
        <!-- Left: Ledger / Transaction List -->
        <div class="lg:col-span-2 flex flex-col gap-4 overflow-hidden">
            <button (click)="openAddForm()" class="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-colors shadow-lg flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd" /></svg>
                {{ 'LEDGER.AddTransaction' | translate }}
            </button>

            <!-- Transaction List -->
            <div class="flex-1 bg-slate-800/50 rounded-xl border border-white/5 overflow-y-auto custom-scrollbar">
                @if (entries().length === 0) {
                    <div class="flex flex-col items-center justify-center h-64 text-slate-500">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <p class="text-sm">{{ 'LEDGER.NoTransactions' | translate }}</p>
                        <p class="text-xs mt-1">{{ 'LEDGER.ClickAddToStart' | translate }}</p>
                    </div>
                } @else {
                    <table class="w-full text-left text-sm">
                        <thead class="bg-white/5 text-xs uppercase font-bold text-slate-500 sticky top-0">
                            <tr>
                                <th class="px-4 py-3">{{ 'LEDGER.Date' | translate }}</th>
                                <th class="px-4 py-3">{{ 'LEDGER.Counterparty' | translate }}</th>
                                <th class="px-4 py-3">{{ 'LEDGER.Description' | translate }}</th>
                                <th class="px-4 py-3">{{ 'LEDGER.Category' | translate }}</th>
                                <th class="px-4 py-3 text-right">{{ 'LEDGER.Amount' | translate }}</th>
                                <th class="px-4 py-3"></th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-white/5">
                            @for (entry of entries(); track entry.id) {
                                <tr class="hover:bg-white/5 transition-colors group">
                                    <td class="px-4 py-3 text-slate-400">{{ formatDate(entry.entry_date) }}</td>
                                    <td class="px-4 py-3">
                                        @if (entry.counterparty) {
                                            <span class="text-white font-medium">{{ entry.counterparty }}</span>
                                        } @else {
                                            <span class="text-slate-600">-</span>
                                        }
                                    </td>
                                    <td class="px-4 py-3 font-medium text-white">{{ entry.description }}</td>
                                    <td class="px-4 py-3">
                                        <span class="px-2 py-0.5 rounded-full text-xs" 
                                              [class]="entry.type === 'income' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'">
                                            {{ getCategoryLabel(entry.category) | translate }}
                                        </span>
                                    </td>
                                    <td class="px-4 py-3 text-right font-bold" 
                                        [class]="entry.type === 'income' ? 'text-green-400' : 'text-red-400'">
                                        {{ entry.type === 'income' ? '+' : '-' }}{{ formatCurrency(entry.amount) }}
                                    </td>
                                    <td class="px-2 py-3 text-right whitespace-nowrap">
                                        <div class="flex items-center justify-end gap-1">
                                            <button (click)="editEntry(entry)" class="p-1.5 text-slate-500 hover:text-blue-400 hover:bg-blue-400/10 rounded transition-colors" title="Edit">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                                </svg>
                                            </button>
                                            <button (click)="deleteEntry(entry.id)" class="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded transition-colors" title="Delete">
                                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                                                </svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            }
                        </tbody>
                    </table>
                }
            </div>
        </div>

        <!-- Right: Summary & Counterparties -->
        <div class="flex flex-col gap-4">
            <!-- Counterparties -->
            <div class="bg-slate-800 rounded-xl p-5 border border-white/10">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-sm font-bold text-slate-300">{{ 'LEDGER.Counterparties' | translate }}</h3>
                    <button (click)="openCounterpartyModal()" class="text-blue-400 hover:text-blue-300 text-xs font-bold">
                        + {{ 'LEDGER.AddNew' | translate }}
                    </button>
                </div>
                <div class="space-y-2">
                    @for (cp of counterparties(); track cp) {
                        <div class="flex justify-between items-center text-sm">
                            <span class="text-white">{{ cp }}</span>
                            <button (click)="removeCounterparty(cp)" class="text-slate-600 hover:text-red-400 text-xs opacity-0 group-hover:opacity-100">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                                </svg>
                            </button>
                        </div>
                    }
                    @if (counterparties().length === 0) {
                        <p class="text-slate-500 text-xs">{{ 'LEDGER.NoCounterparties' | translate }}</p>
                    }
                </div>
            </div>

            <!-- Monthly Breakdown -->
            <div class="bg-slate-800 rounded-xl p-5 border border-white/10">
                <h3 class="text-sm font-bold text-slate-300 mb-4">{{ 'LEDGER.MonthlyBreakdown' | translate }}</h3>
                <div class="space-y-3">
                    @for (month of monthlyData(); track month.month) {
                        <div class="flex justify-between items-center">
                            <span class="text-slate-400 text-sm">{{ month.month }}</span>
                            <span class="font-bold" [class]="month.net >= 0 ? 'text-green-400' : 'text-red-400'">
                                {{ formatCurrency(month.net) }}
                            </span>
                        </div>
                    }
                </div>
            </div>

            <!-- Categories -->
            <div class="bg-slate-800 rounded-xl p-5 border border-white/10">
                <h3 class="text-sm font-bold text-slate-300 mb-4">{{ 'LEDGER.Categories' | translate }}</h3>
                <div class="space-y-2">
                    @for (cat of categories(); track cat.key) {
                        <div class="flex justify-between items-center">
                            <div class="flex items-center gap-2">
                                <span class="w-2 h-2 rounded-full" [class]="cat.type === 'income' ? 'bg-green-500' : 'bg-red-500'"></span>
                                <span class="text-slate-400 text-sm">{{ cat.key | translate }}</span>
                            </div>
                            <span class="text-white font-bold text-sm">{{ formatCurrency(cat.total) }}</span>
                        </div>
                    }
                </div>
            </div>
        </div>
      </div>

      <!-- Add/Edit Transaction Modal -->
      @if (showModal()) {
        <div class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-md" (click)="closeModal()">
            <div class="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-white/20" (click)="$event.stopPropagation()">
                <div class="p-6 border-b border-white/10">
                    <h3 class="text-xl font-bold text-white">{{ isEditing() ? 'LEDGER.EditTransaction' : 'LEDGER.AddTransaction' | translate }}</h3>
                </div>
                <div class="p-6 space-y-4">
                    <!-- Type -->
                    <div>
                        <label class="block text-xs font-bold text-slate-400 uppercase mb-2">{{ 'LEDGER.Type' | translate }}</label>
                        <div class="flex gap-2">
                            <button (click)="formType.set('income')" class="flex-1 py-2 rounded-lg font-bold text-sm transition-colors"
                                    [class]="formType() === 'income' ? 'bg-green-600 text-white' : 'bg-slate-800 text-slate-400'">
                                {{ 'LEDGER.Income' | translate }}
                            </button>
                            <button (click)="formType.set('expense')" class="flex-1 py-2 rounded-lg font-bold text-sm transition-colors"
                                    [class]="formType() === 'expense' ? 'bg-red-600 text-white' : 'bg-slate-800 text-slate-400'">
                                {{ 'LEDGER.Expense' | translate }}
                            </button>
                        </div>
                    </div>
                    <!-- Counterparty -->
                    <div>
                        <label class="block text-xs font-bold text-slate-400 uppercase mb-2">
                            {{ getCounterpartyLabel() | translate }}
                        </label>
                        <div class="relative">
                            <input type="text" [(ngModel)]="formCounterparty" 
                                   [placeholder]="getCounterpartyPlaceholder() | translate"
                                   list="counterparty-list"
                                   class="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-3 text-white"
                                   (change)="onCounterpartyChange()">
                            <datalist id="counterparty-list">
                                @for (cp of counterparties(); track cp) {
                                    <option [value]="cp">{{ cp }}</option>
                                }
                            </datalist>
                        </div>
                    </div>
                    <!-- Amount -->
                    <div>
                        <label class="block text-xs font-bold text-slate-400 uppercase mb-2">{{ 'LEDGER.Amount' | translate }}</label>
                        <input type="number" [(ngModel)]="formAmount" placeholder="0.00" step="0.01"
                               class="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-3 text-white text-lg font-bold">
                    </div>
                    <!-- Category -->
                    <div>
                        <label class="block text-xs font-bold text-slate-400 uppercase mb-2">{{ 'LEDGER.Category' | translate }}</label>
                        <select [(ngModel)]="formCategory" class="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-3 text-white">
                            @if (formType() === 'income') {
                                <option value="rental">{{ 'LEDGER.RentalIncome' | translate }}</option>
                                <option value="cleaning">{{ 'LEDGER.CleaningFee' | translate }}</option>
                                <option value="other_income">{{ 'LEDGER.OtherIncome' | translate }}</option>
                            } @else {
                                <option value="maintenance">{{ 'LEDGER.Maintenance' | translate }}</option>
                                <option value="utilities">{{ 'LEDGER.Utilities' | translate }}</option>
                                <option value="cleaning">{{ 'LEDGER.Cleaning' | translate }}</option>
                                <option value="supplies">{{ 'LEDGER.Supplies' | translate }}</option>
                                <option value="management">{{ 'LEDGER.Management' | translate }}</option>
                                <option value="tax">{{ 'LEDGER.Tax' | translate }}</option>
                                <option value="insurance">{{ 'LEDGER.Insurance' | translate }}</option>
                                <option value="mortgage">{{ 'LEDGER.Mortgage' | translate }}</option>
                                <option value="other_expense">{{ 'LEDGER.OtherExpense' | translate }}</option>
                            }
                        </select>
                    </div>
                    <!-- Description -->
                    <div>
                        <label class="block text-xs font-bold text-slate-400 uppercase mb-2">{{ 'LEDGER.Description' | translate }}</label>
                        <input type="text" [(ngModel)]="formDescription" placeholder="{{ 'LEDGER.DescriptionPlaceholder' | translate }}"
                               class="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-3 text-white">
                    </div>
                    <!-- Date -->
                    <div>
                        <label class="block text-xs font-bold text-slate-400 uppercase mb-2">{{ 'LEDGER.Date' | translate }}</label>
                        <input type="date" [(ngModel)]="formDate"
                               class="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-3 text-white">
                    </div>
                </div>
                <div class="p-6 border-t border-white/10 flex gap-3">
                    <button (click)="closeModal()" class="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold transition-colors">
                        {{ 'COMMON.Cancel' | translate }}
                    </button>
                    <button (click)="saveEntry()" class="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-colors">
                        {{ 'COMMON.Save' | translate }}
                    </button>
                </div>
            </div>
        </div>
      }

      <!-- Add Counterparty Modal -->
      @if (showCounterpartyModal()) {
        <div class="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 backdrop-blur-md" (click)="closeCounterpartyModal()">
            <div class="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-sm border border-white/20" (click)="$event.stopPropagation()">
                <div class="p-6 border-b border-white/10">
                    <h3 class="text-xl font-bold text-white">{{ 'LEDGER.AddCounterparty' | translate }}</h3>
                </div>
                <div class="p-6 space-y-4">
                    <div>
                        <label class="block text-xs font-bold text-slate-400 uppercase mb-2">{{ 'LEDGER.Name' | translate }}</label>
                        <input type="text" [(ngModel)]="newCounterpartyName" placeholder="{{ 'LEDGER.NamePlaceholder' | translate }}"
                               class="w-full bg-slate-800 border border-white/10 rounded-lg px-4 py-3 text-white">
                    </div>
                </div>
                <div class="p-6 border-t border-white/10 flex gap-3">
                    <button (click)="closeCounterpartyModal()" class="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold transition-colors">
                        {{ 'COMMON.Cancel' | translate }}
                    </button>
                    <button (click)="addCounterparty()" class="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition-colors">
                        {{ 'COMMON.Add' | translate }}
                    </button>
                </div>
            </div>
        </div>
      }
    </div>
    `,
    styles: [`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 2px; }
    `]
})
export class SmartLedgerComponent implements OnInit {
    private session = inject(SessionStore);
    private supabase = inject(SupabaseService);

    propertyDetails = input<any>(null);

    entries = signal<LedgerEntry[]>([]);
    showModal = signal(false);
    isEditing = signal(false);
    editingId = signal<string | null>(null);

    showCounterpartyModal = signal(false);
    newCounterpartyName = '';

    selectedPeriod = 'monthly';

    formType = signal<'income' | 'expense'>('expense');
    formAmount = 0;
    formCategory = 'maintenance';
    formDescription = '';
    formDate = new Date().toISOString().split('T')[0];
    formCounterparty = '';

    counterparties = signal<string[]>(['Airbnb', 'Booking.com']);

    private currentPropertyId: string | null = null;

    constructor() {
        effect(() => {
            const props = this.propertyDetails();
            if (props?.id && props.id !== this.currentPropertyId) {
                this.currentPropertyId = props.id;
                this.loadEntries();
            }
        });
    }

    ngOnInit() {
        // Already handled by effect above
    }

    private async loadEntries() {
        if (!this.currentPropertyId) return;
        const { data } = await this.supabase.supabase
            .from('ledger_entries')
            .select('*')
            .eq('property_id', this.currentPropertyId)
            .order('entry_date', { ascending: false });
        
        if (data) {
            this.entries.set(data.map((e: any) => ({
                id: e.id,
                type: e.type,
                category: e.category,
                amount: parseFloat(e.amount),
                description: e.description,
                entry_date: e.entry_date,
                counterparty: e.counterparty
            })));
            this.loadCounterparties();
        }
    }

    private async saveEntryToDb(entry: LedgerEntry) {
        if (!this.currentPropertyId) return;
        await this.supabase.supabase
            .from('ledger_entries')
            .upsert({
                id: entry.id,
                property_id: this.currentPropertyId,
                type: entry.type,
                category: entry.category,
                amount: entry.amount,
                description: entry.description,
                entry_date: entry.entry_date,
                counterparty: entry.counterparty || null
            });
    }

    private async deleteEntryFromDb(id: string) {
        await this.supabase.supabase
            .from('ledger_entries')
            .delete()
            .eq('id', id);
    }

    private loadCounterparties() {
        const uniqueCounterparties = new Set<string>();
        this.entries().forEach(e => {
            if (e.counterparty) uniqueCounterparties.add(e.counterparty);
        });
        if (uniqueCounterparties.size > 0) {
            this.counterparties.set(Array.from(uniqueCounterparties).sort());
        }
    }

    private saveCounterpartiesToDb() {
        // Counterparties are derived from entries, no separate storage needed
    }

    incomeCategories = [
        { key: 'rental', labelKey: 'LEDGER.RentalIncome' },
        { key: 'cleaning', labelKey: 'LEDGER.CleaningFee' },
        { key: 'other_income', labelKey: 'LEDGER.OtherIncome' }
    ];

    expenseCategories = [
        { key: 'maintenance', labelKey: 'LEDGER.Maintenance' },
        { key: 'utilities', labelKey: 'LEDGER.Utilities' },
        { key: 'cleaning', labelKey: 'LEDGER.Cleaning' },
        { key: 'supplies', labelKey: 'LEDGER.Supplies' },
        { key: 'management', labelKey: 'LEDGER.Management' },
        { key: 'tax', labelKey: 'LEDGER.Tax' },
        { key: 'insurance', labelKey: 'LEDGER.Insurance' },
        { key: 'mortgage', labelKey: 'LEDGER.Mortgage' },
        { key: 'other_expense', labelKey: 'LEDGER.OtherExpense' }
    ];

    totalIncome = computed(() => 
        this.entries().filter(e => e.type === 'income').reduce((sum, e) => sum + e.amount, 0)
    );

    totalExpenses = computed(() => 
        this.entries().filter(e => e.type === 'expense').reduce((sum, e) => sum + e.amount, 0)
    );

    netBalance = computed(() => this.totalIncome() - this.totalExpenses());

    monthlyData = computed(() => {
        const months: Record<string, { income: number; expenses: number; net: number }> = {};
        this.entries().forEach(e => {
            const month = e.entry_date.substring(0, 7);
            if (!months[month]) months[month] = { income: 0, expenses: 0, net: 0 };
            if (e.type === 'income') months[month].income += e.amount;
            else months[month].expenses += e.amount;
            months[month].net = months[month].income - months[month].expenses;
        });
        return Object.entries(months)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([month, data]) => ({ month, ...data }))
            .slice(0, 6);
    });

    categories = computed(() => {
        const cats: Record<string, { key: string; type: string; total: number }> = {};
        this.entries().forEach(e => {
            const key = e.category;
            if (!cats[key]) cats[key] = { key: key, type: e.type, total: 0 };
            cats[key].total += e.amount;
        });
        return Object.values(cats).sort((a, b) => b.total - a.total);
    });

    onCounterpartyChange() {
        if (this.formCounterparty && !this.counterparties().includes(this.formCounterparty)) {
            this.counterparties.update(list => [...list, this.formCounterparty]);
        }
    }

    openAddForm() {
        this.isEditing.set(false);
        this.editingId.set(null);
        this.formType.set('expense');
        this.formAmount = 0;
        this.formCategory = 'maintenance';
        this.formDescription = '';
        this.formDate = new Date().toISOString().split('T')[0];
        this.formCounterparty = '';
        this.showModal.set(true);
    }

    closeModal() {
        this.showModal.set(false);
    }

    openCounterpartyModal() {
        this.newCounterpartyName = '';
        this.showCounterpartyModal.set(true);
    }

    closeCounterpartyModal() {
        this.showCounterpartyModal.set(false);
    }

    addCounterparty() {
        if (this.newCounterpartyName.trim() && !this.counterparties().includes(this.newCounterpartyName.trim())) {
            this.counterparties.update(list => [...list, this.newCounterpartyName.trim()]);
        }
        this.closeCounterpartyModal();
    }

    removeCounterparty(name: string) {
        this.counterparties.update(list => list.filter(c => c !== name));
    }

    saveEntry() {
        const entry: LedgerEntry = {
            id: this.editingId() || crypto.randomUUID(),
            type: this.formType(),
            amount: this.formAmount,
            category: this.formCategory,
            description: this.formDescription,
            entry_date: this.formDate,
            counterparty: this.formCounterparty || undefined
        };

        if (this.isEditing()) {
            this.entries.update(list => list.map(e => e.id === entry.id ? entry : e));
        } else {
            this.entries.update(list => [entry, ...list]);
        }

        if (this.formCounterparty && !this.counterparties().includes(this.formCounterparty)) {
            this.counterparties.update(list => [...list, this.formCounterparty]);
        }

        this.saveEntryToDb(entry);
        this.closeModal();
    }

    editEntry(entry: LedgerEntry) {
        this.isEditing.set(true);
        this.editingId.set(entry.id);
        this.formType.set(entry.type);
        this.formAmount = entry.amount;
        this.formCategory = entry.category;
        this.formDescription = entry.description;
        this.formDate = entry.entry_date;
        this.formCounterparty = entry.counterparty || '';
        this.showModal.set(true);
    }

    deleteEntry(id: string) {
        this.entries.update(list => list.filter(e => e.id !== id));
        this.deleteEntryFromDb(id);
    }

    formatCurrency(amount: number): string {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'EUR' }).format(amount);
    }

    formatDate(dateStr: string): string {
        return new Date(dateStr).toLocaleDateString();
    }

    getCategoryLabel(key: string): string {
        const allCats = [...this.incomeCategories, ...this.expenseCategories];
        const cat = allCats.find(c => c.key === key);
        return cat ? cat.labelKey : key;
    }

    getCounterpartyLabel(): string {
        return this.formType() === 'income' ? 'LEDGER.FromWho' : 'LEDGER.ToWhom';
    }

    getCounterpartyPlaceholder(): string {
        return this.formType() === 'income' ? 'LEDGER.FromWhoPlaceholder' : 'LEDGER.ToWhomPlaceholder';
    }
}
