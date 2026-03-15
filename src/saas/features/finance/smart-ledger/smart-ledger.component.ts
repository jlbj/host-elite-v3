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
    templateUrl: './smart-ledger.component.html',
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
