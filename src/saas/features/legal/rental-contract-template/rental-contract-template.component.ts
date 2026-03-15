import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Language } from '../../../../services/translation.service';
import { jsPDF } from 'jspdf';

interface ContractData {
  language: Language;
  hostName: string;
  hostId: string;
  hostAddress: string;
  hostPhone: string;
  hostEmail: string;
  guestName: string;
  guestId: string;
  guestAddress: string;
  propertyAddress: string;
  propertyDescription: string;
  amenities: string;
  checkInDate: string;
  checkInTime: string;
  checkOutDate: string;
  checkOutTime: string;
  maxGuests: number;
  rentalAmount: string;
  cleaningFee: string;
  securityDeposit: string;
  paymentSchedule: string;
  cancellationPolicy: string;
  houseRules: string;
  liability: string;
}

@Component({
  selector: 'leg-09-rental-contract',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="p-8 bg-slate-900 rounded-2xl border border-white/10 animate-fade-in">
      <div class="flex items-center justify-between gap-4 mb-6">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
            <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z"/></svg>
          </div>
          <div>
            <h1 class="text-3xl font-bold text-white">{{ getTranslation('CONTRACT.ContractTitle') }}</h1>
            <p class="text-slate-400">{{ getTranslation('CONTRACT.ContractDesc') }}</p>
          </div>
        </div>
        <div class="flex gap-2">
          @for (lang of languages; track lang.code) {
            <button 
              (click)="setLanguage(lang.code)"
              class="px-3 py-1 rounded text-xs font-bold uppercase transition-all"
              [class]="selectedLanguage() === lang.code ? 'bg-indigo-500 text-white' : 'bg-white/10 text-slate-400 hover:bg-white/20'"
            >
              {{ lang.label }}
            </button>
          }
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Form Section -->
        <div class="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
          <!-- Parties Section -->
          <div class="bg-white/5 rounded-xl border border-white/5 p-6">
            <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
              {{ getTranslation('CONTRACT.Parties') }}
            </h3>
            
            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-slate-400 text-xs uppercase font-bold mb-1">{{ getTranslation('CONTRACT.HostName') }}</label>
                  <input type="text" [(ngModel)]="contractData.hostName" class="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white text-sm" [placeholder]="getTranslation('CONTRACT.HostNamePlaceholder')">
                </div>
                <div>
                  <label class="block text-slate-400 text-xs uppercase font-bold mb-1">{{ getTranslation('CONTRACT.HostId') }}</label>
                  <input type="text" [(ngModel)]="contractData.hostId" class="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white text-sm" [placeholder]="getTranslation('CONTRACT.HostIdPlaceholder')">
                </div>
              </div>
              <div>
                <label class="block text-slate-400 text-xs uppercase font-bold mb-1">{{ getTranslation('CONTRACT.HostAddress') }}</label>
                <input type="text" [(ngModel)]="contractData.hostAddress" class="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white text-sm" [placeholder]="getTranslation('CONTRACT.HostAddressPlaceholder')">
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-slate-400 text-xs uppercase font-bold mb-1">{{ getTranslation('CONTRACT.HostPhone') }}</label>
                  <input type="tel" [(ngModel)]="contractData.hostPhone" class="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white text-sm" [placeholder]="getTranslation('CONTRACT.HostPhonePlaceholder')">
                </div>
                <div>
                  <label class="block text-slate-400 text-xs uppercase font-bold mb-1">{{ getTranslation('CONTRACT.HostEmail') }}</label>
                  <input type="email" [(ngModel)]="contractData.hostEmail" class="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white text-sm" [placeholder]="getTranslation('CONTRACT.HostEmailPlaceholder')">
                </div>
              </div>
            </div>

            <div class="mt-4 pt-4 border-t border-white/10">
              <h4 class="text-sm font-semibold text-indigo-300 mb-3">{{ getTranslation('CONTRACT.GuestInfo') }}</h4>
              <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-slate-400 text-xs uppercase font-bold mb-1">{{ getTranslation('CONTRACT.GuestName') }}</label>
                    <input type="text" [(ngModel)]="contractData.guestName" class="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white text-sm" [placeholder]="getTranslation('CONTRACT.GuestNamePlaceholder')">
                  </div>
                  <div>
                    <label class="block text-slate-400 text-xs uppercase font-bold mb-1">{{ getTranslation('CONTRACT.GuestId') }}</label>
                    <input type="text" [(ngModel)]="contractData.guestId" class="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white text-sm" [placeholder]="getTranslation('CONTRACT.GuestIdPlaceholder')">
                  </div>
                </div>
                <div>
                  <label class="block text-slate-400 text-xs uppercase font-bold mb-1">{{ getTranslation('CONTRACT.GuestAddress') }}</label>
                  <input type="text" [(ngModel)]="contractData.guestAddress" class="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white text-sm" [placeholder]="getTranslation('CONTRACT.GuestAddressPlaceholder')">
                </div>
              </div>
            </div>
          </div>

          <!-- Property Section -->
          <div class="bg-white/5 rounded-xl border border-white/5 p-6">
            <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/></svg>
              {{ getTranslation('CONTRACT.Property') }}
            </h3>
            <div class="space-y-4">
              <div>
                <label class="block text-slate-400 text-xs uppercase font-bold mb-1">{{ getTranslation('CONTRACT.PropertyAddress') }}</label>
                <input type="text" [(ngModel)]="contractData.propertyAddress" class="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white text-sm" [placeholder]="getTranslation('CONTRACT.PropertyAddressPlaceholder')">
              </div>
              <div>
                <label class="block text-slate-400 text-xs uppercase font-bold mb-1">{{ getTranslation('CONTRACT.PropertyDescription') }}</label>
                <textarea [(ngModel)]="contractData.propertyDescription" rows="2" class="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white text-sm" [placeholder]="getTranslation('CONTRACT.PropertyDescriptionPlaceholder')"></textarea>
              </div>
              <div>
                <label class="block text-slate-400 text-xs uppercase font-bold mb-1">{{ getTranslation('CONTRACT.Amenities') }}</label>
                <textarea [(ngModel)]="contractData.amenities" rows="2" class="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white text-sm" [placeholder]="getTranslation('CONTRACT.AmenitiesPlaceholder')"></textarea>
              </div>
            </div>
          </div>

          <!-- Dates Section -->
          <div class="bg-white/5 rounded-xl border border-white/5 p-6">
            <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm-8 4H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/></svg>
              {{ getTranslation('CONTRACT.RentalPeriod') }}
            </h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-slate-400 text-xs uppercase font-bold mb-1">{{ getTranslation('CONTRACT.CheckInDate') }}</label>
                <input type="date" [(ngModel)]="contractData.checkInDate" class="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white text-sm">
              </div>
              <div>
                <label class="block text-slate-400 text-xs uppercase font-bold mb-1">{{ getTranslation('CONTRACT.CheckInTime') }}</label>
                <input type="time" [(ngModel)]="contractData.checkInTime" class="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white text-sm">
              </div>
              <div>
                <label class="block text-slate-400 text-xs uppercase font-bold mb-1">{{ getTranslation('CONTRACT.CheckOutDate') }}</label>
                <input type="date" [(ngModel)]="contractData.checkOutDate" class="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white text-sm">
              </div>
              <div>
                <label class="block text-slate-400 text-xs uppercase font-bold mb-1">{{ getTranslation('CONTRACT.CheckOutTime') }}</label>
                <input type="time" [(ngModel)]="contractData.checkOutTime" class="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white text-sm">
              </div>
            </div>
            <div class="mt-4">
              <label class="block text-slate-400 text-xs uppercase font-bold mb-1">{{ getTranslation('CONTRACT.MaxGuests') }}</label>
              <input type="number" [(ngModel)]="contractData.maxGuests" min="1" class="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white text-sm">
            </div>
          </div>

          <!-- Fees Section -->
          <div class="bg-white/5 rounded-xl border border-white/5 p-6">
            <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/></svg>
              {{ getTranslation('CONTRACT.FinancialTerms') }}
            </h3>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-slate-400 text-xs uppercase font-bold mb-1">{{ getTranslation('CONTRACT.RentalAmount') }}</label>
                <input type="text" [(ngModel)]="contractData.rentalAmount" class="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white text-sm" [placeholder]="getTranslation('CONTRACT.RentalAmountPlaceholder')">
              </div>
              <div>
                <label class="block text-slate-400 text-xs uppercase font-bold mb-1">{{ getTranslation('CONTRACT.CleaningFee') }}</label>
                <input type="text" [(ngModel)]="contractData.cleaningFee" class="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white text-sm" [placeholder]="getTranslation('CONTRACT.CleaningFeePlaceholder')">
              </div>
              <div class="col-span-2">
                <label class="block text-slate-400 text-xs uppercase font-bold mb-1">{{ getTranslation('CONTRACT.SecurityDeposit') }}</label>
                <input type="text" [(ngModel)]="contractData.securityDeposit" class="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white text-sm" [placeholder]="getTranslation('CONTRACT.SecurityDepositPlaceholder')">
              </div>
              <div class="col-span-2">
                <label class="block text-slate-400 text-xs uppercase font-bold mb-1">{{ getTranslation('CONTRACT.PaymentSchedule') }}</label>
                <input type="text" [(ngModel)]="contractData.paymentSchedule" class="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white text-sm" [placeholder]="getTranslation('CONTRACT.PaymentSchedulePlaceholder')">
              </div>
            </div>
          </div>

          <!-- Policies Section -->
          <div class="bg-white/5 rounded-xl border border-white/5 p-6">
            <h3 class="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/></svg>
              {{ getTranslation('CONTRACT.Policies') }}
            </h3>
            <div class="space-y-4">
              <div>
                <label class="block text-slate-400 text-xs uppercase font-bold mb-1">{{ getTranslation('CONTRACT.CancellationPolicy') }}</label>
                <textarea [(ngModel)]="contractData.cancellationPolicy" rows="3" class="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white text-sm" [placeholder]="getTranslation('CONTRACT.CancellationPolicyPlaceholder')"></textarea>
              </div>
              <div>
                <label class="block text-slate-400 text-xs uppercase font-bold mb-1">{{ getTranslation('CONTRACT.HouseRules') }}</label>
                <textarea [(ngModel)]="contractData.houseRules" rows="3" class="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white text-sm" [placeholder]="getTranslation('CONTRACT.HouseRulesPlaceholder')"></textarea>
              </div>
              <div>
                <label class="block text-slate-400 text-xs uppercase font-bold mb-1">{{ getTranslation('CONTRACT.Liability') }}</label>
                <textarea [(ngModel)]="contractData.liability" rows="2" class="w-full bg-black/30 border border-white/10 rounded px-3 py-2 text-white text-sm" [placeholder]="getTranslation('CONTRACT.LiabilityPlaceholder')"></textarea>
              </div>
            </div>
          </div>

          <!-- Download Button -->
          <button 
            (click)="generatePDF()" 
            class="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
            {{ getTranslation('CONTRACT.DownloadContract') }}
          </button>
        </div>

        <!-- Preview Section -->
        <div class="bg-white text-slate-900 p-8 rounded-xl shadow-2xl overflow-y-auto max-h-[70vh] font-serif text-sm leading-relaxed">
          <h2 class="text-xl font-bold text-center mb-6 uppercase tracking-widest border-b-2 border-slate-900 pb-4">
            {{ getTranslation('CONTRACT.ShortTermRentalAgreement') }}
          </h2>

          <p class="mb-2"><strong>{{ getTranslation('CONTRACT.ContractDate') }}:</strong> {{ today }}</p>

          <div class="mb-6">
            <h3 class="font-bold mb-2 uppercase text-xs tracking-wider">1. {{ getTranslation('CONTRACT.Parties') }}</h3>
            <p class="mb-2"><strong>{{ getTranslation('CONTRACT.Landlord') }}:</strong> {{ contractData.hostName || '[Host Name]' }}</p>
            <p class="mb-1 ml-4 text-slate-600">{{ contractData.hostId ? getTranslation('CONTRACT.ID') + ': ' + contractData.hostId : '' }}</p>
            <p class="mb-1 ml-4 text-slate-600">{{ contractData.hostAddress || '[Address]' }}</p>
            <p class="mb-1 ml-4 text-slate-600">{{ contractData.hostPhone ? contractData.hostPhone + ' | ' + contractData.hostEmail : '' }}</p>
            
            <p class="mb-2 mt-3"><strong>{{ getTranslation('CONTRACT.Guest') }}:</strong> {{ contractData.guestName || '[Guest Name]' }}</p>
            <p class="mb-1 ml-4 text-slate-600">{{ contractData.guestId ? getTranslation('CONTRACT.ID') + ': ' + contractData.guestId : '' }}</p>
            <p class="mb-1 ml-4 text-slate-600">{{ contractData.guestAddress || '[Address]' }}</p>
          </div>

          <div class="mb-6">
            <h3 class="font-bold mb-2 uppercase text-xs tracking-wider">2. {{ getTranslation('CONTRACT.Property') }}</h3>
            <p class="mb-2"><strong>{{ getTranslation('CONTRACT.Address') }}:</strong> {{ contractData.propertyAddress || '[Property Address]' }}</p>
            <p class="mb-2 text-justify">{{ contractData.propertyDescription || '[Property Description]' }}</p>
            <p class="text-slate-600"><strong>{{ getTranslation('CONTRACT.Amenities') }}:</strong> {{ contractData.amenities || '[Amenities List]' }}</p>
          </div>

          <div class="mb-6">
            <h3 class="font-bold mb-2 uppercase text-xs tracking-wider">3. {{ getTranslation('CONTRACT.RentalPeriod') }}</h3>
            <p><strong>{{ getTranslation('CONTRACT.CheckIn') }}:</strong> {{ contractData.checkInDate || '[Date]' }} {{ contractData.checkInTime ? 'at ' + contractData.checkInTime : '' }}</p>
            <p><strong>{{ getTranslation('CONTRACT.CheckOut') }}:</strong> {{ contractData.checkOutDate || '[Date]' }} {{ contractData.checkOutTime ? 'at ' + contractData.checkOutTime : '' }}</p>
            <p><strong>{{ getTranslation('CONTRACT.MaxGuests') }}:</strong> {{ contractData.maxGuests || '[Number]' }} {{ getTranslation('CONTRACT.Guests') }}</p>
          </div>

          <div class="mb-6">
            <h3 class="font-bold mb-2 uppercase text-xs tracking-wider">4. {{ getTranslation('CONTRACT.PaymentTerms') }}</h3>
            <p><strong>{{ getTranslation('CONTRACT.RentalAmount') }}:</strong> {{ contractData.rentalAmount || '[Amount]' }}</p>
            <p><strong>{{ getTranslation('CONTRACT.CleaningFee') }}:</strong> {{ contractData.cleaningFee || '[Fee]' }}</p>
            <p><strong>{{ getTranslation('CONTRACT.SecurityDeposit') }}:</strong> {{ contractData.securityDeposit || '[Deposit]' }}</p>
            <p class="mt-2"><strong>{{ getTranslation('CONTRACT.PaymentSchedule') }}:</strong> {{ contractData.paymentSchedule || '[Schedule]' }}</p>
          </div>

          <div class="mb-6">
            <h3 class="font-bold mb-2 uppercase text-xs tracking-wider">5. {{ getTranslation('CONTRACT.CancellationPolicy') }}</h3>
            <p class="text-justify">{{ contractData.cancellationPolicy || getTranslation('CONTRACT.DefaultCancellation') }}</p>
          </div>

          <div class="mb-6">
            <h3 class="font-bold mb-2 uppercase text-xs tracking-wider">6. {{ getTranslation('CONTRACT.HouseRules') }}</h3>
            <p class="text-justify">{{ contractData.houseRules || getTranslation('CONTRACT.DefaultHouseRules') }}</p>
          </div>

          <div class="mb-6">
            <h3 class="font-bold mb-2 uppercase text-xs tracking-wider">7. {{ getTranslation('CONTRACT.Liability') }}</h3>
            <p class="text-justify">{{ contractData.liability || getTranslation('CONTRACT.DefaultLiability') }}</p>
          </div>

          <div class="mt-12 pt-8 border-t border-slate-300">
            <div class="grid grid-cols-2 gap-8">
              <div>
                <p class="text-xs uppercase tracking-wider mb-8">{{ getTranslation('CONTRACT.LandlordSignature') }}</p>
                <div class="border-t border-slate-400 pt-2">
                  <p class="text-xs text-slate-500">{{ contractData.hostName || '[Host Name]' }}</p>
                  <p class="text-xs text-slate-500">{{ getTranslation('CONTRACT.Date') }}: ____________</p>
                </div>
              </div>
              <div>
                <p class="text-xs uppercase tracking-wider mb-8">{{ getTranslation('CONTRACT.GuestSignature') }}</p>
                <div class="border-t border-slate-400 pt-2">
                  <p class="text-xs text-slate-500">{{ contractData.guestName || '[Guest Name]' }}</p>
                  <p class="text-xs text-slate-500">{{ getTranslation('CONTRACT.Date') }}: ____________</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: rgba(255,255,255,0.05); }
    ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 3px; }
    input[type="date"]::-webkit-calendar-picker-indicator,
    input[type="time"]::-webkit-calendar-picker-indicator {
      filter: invert(1);
    }
  `]
})
export class RentalContractTemplateComponent {
  languages = [
    { code: 'en' as Language, label: 'EN' },
    { code: 'es' as Language, label: 'ES' },
    { code: 'fr' as Language, label: 'FR' }
  ];

  selectedLanguage = signal<Language>('en');
  
  today = new Date().toLocaleDateString();

  contractData: ContractData = {
    language: 'en',
    hostName: '',
    hostId: '',
    hostAddress: '',
    hostPhone: '',
    hostEmail: '',
    guestName: '',
    guestId: '',
    guestAddress: '',
    propertyAddress: '',
    propertyDescription: '',
    amenities: '',
    checkInDate: '',
    checkInTime: '15:00',
    checkOutDate: '',
    checkOutTime: '11:00',
    maxGuests: 2,
    rentalAmount: '',
    cleaningFee: '',
    securityDeposit: '',
    paymentSchedule: '',
    cancellationPolicy: '',
    houseRules: '',
    liability: ''
  };

  private translations: Record<Language, Record<string, string>> = {
    en: {
      'CONTRACT.ContractTitle': 'Short-Term Rental Contract',
      'CONTRACT.ContractDesc': 'Generate a professional rental agreement for your property',
      'CONTRACT.Parties': 'Parties',
      'CONTRACT.HostName': 'Host Name',
      'CONTRACT.HostNamePlaceholder': 'Full name or company name',
      'CONTRACT.HostId': 'ID / Tax ID',
      'CONTRACT.HostIdPlaceholder': 'Passport or company number',
      'CONTRACT.HostAddress': 'Address',
      'CONTRACT.HostAddressPlaceholder': 'Full address',
      'CONTRACT.HostPhone': 'Phone',
      'CONTRACT.HostPhonePlaceholder': '+1 234 567 890',
      'CONTRACT.HostEmail': 'Email',
      'CONTRACT.HostEmailPlaceholder': 'email@example.com',
      'CONTRACT.GuestInfo': 'Guest Information',
      'CONTRACT.GuestName': 'Guest Name',
      'CONTRACT.GuestNamePlaceholder': 'Full name',
      'CONTRACT.GuestId': 'ID / Passport',
      'CONTRACT.GuestIdPlaceholder': 'Passport or ID number',
      'CONTRACT.GuestAddress': 'Address',
      'CONTRACT.GuestAddressPlaceholder': 'Full address',
      'CONTRACT.Property': 'Property',
      'CONTRACT.PropertyAddress': 'Property Address',
      'CONTRACT.PropertyAddressPlaceholder': 'Full address of rental property',
      'CONTRACT.PropertyDescription': 'Description',
      'CONTRACT.PropertyDescriptionPlaceholder': 'Number of rooms, bedrooms, bathrooms...',
      'CONTRACT.Amenities': 'Amenities',
      'CONTRACT.AmenitiesPlaceholder': 'WiFi, Kitchen, Parking, Pool...',
      'CONTRACT.RentalPeriod': 'Rental Period',
      'CONTRACT.CheckInDate': 'Check-in Date',
      'CONTRACT.CheckInTime': 'Check-in Time',
      'CONTRACT.CheckOutDate': 'Check-out Date',
      'CONTRACT.CheckOutTime': 'Check-out Time',
      'CONTRACT.MaxGuests': 'Maximum Guests',
      'CONTRACT.FinancialTerms': 'Financial Terms',
      'CONTRACT.RentalAmount': 'Rental Amount',
      'CONTRACT.RentalAmountPlaceholder': '\$1,000 USD total',
      'CONTRACT.CleaningFee': 'Cleaning Fee',
      'CONTRACT.CleaningFeePlaceholder': '\$100 USD',
      'CONTRACT.SecurityDeposit': 'Security Deposit',
      'CONTRACT.SecurityDepositPlaceholder': '\$500 USD (refundable)',
      'CONTRACT.PaymentSchedule': 'Payment Schedule',
      'CONTRACT.PaymentSchedulePlaceholder': '50% upon booking, 50% upon check-in',
      'CONTRACT.Policies': 'Policies',
      'CONTRACT.CancellationPolicy': 'Cancellation Policy',
      'CONTRACT.CancellationPolicyPlaceholder': 'Full refund if cancelled 14 days before...',
      'CONTRACT.CancellationPolicyDefault': 'Guest may cancel up to 14 days before check-in for a full refund. Cancellations within 14 days are non-refundable unless the property cannot be rented.',
      'CONTRACT.HouseRules': 'House Rules',
      'CONTRACT.HouseRulesPlaceholder': 'No smoking, no parties, quiet hours 10pm-8am...',
      'CONTRACT.HouseRulesDefault': 'No smoking inside. No parties or events. Quiet hours from 10 PM to 8 AM. Pets are not allowed unless explicitly agreed.',
      'CONTRACT.Liability': 'Liability',
      'CONTRACT.LiabilityPlaceholder': 'Guest is responsible for damages...',
      'CONTRACT.LiabilityDefault': 'The guest is responsible for any damage to the property during their stay. The security deposit will be used to cover damages. The host is not liable for accidents or injuries occurring on the premises.',
      'CONTRACT.DownloadContract': 'Download Contract (PDF)',
      'CONTRACT.ShortTermRentalAgreement': 'Short-Term Rental Agreement',
      'CONTRACT.ContractDate': 'Contract Date',
      'CONTRACT.Landlord': 'Landlord/Host',
      'CONTRACT.Guest': 'Guest/Tenant',
      'CONTRACT.ID': 'ID',
      'CONTRACT.Address': 'Address',
      'CONTRACT.CheckIn': 'Check-in',
      'CONTRACT.CheckOut': 'Check-out',
      'CONTRACT.Guests': 'guests',
      'CONTRACT.PaymentTerms': 'Payment Terms',
      'CONTRACT.DefaultCancellation': 'Guest may cancel up to 14 days before check-in for a full refund. Cancellations within 14 days are non-refundable unless the property cannot be rented.',
      'CONTRACT.DefaultHouseRules': 'No smoking inside. No parties or events. Quiet hours from 10 PM to 8 AM. Pets are not allowed unless explicitly agreed.',
      'CONTRACT.DefaultLiability': 'The guest is responsible for any damage to the property during their stay. The security deposit will be used to cover damages. The host is not liable for accidents or injuries occurring on the premises.',
      'CONTRACT.LandlordSignature': 'Landlord/Host Signature',
      'CONTRACT.GuestSignature': 'Guest Signature',
      'CONTRACT.Date': 'Date',
    },
    es: {
      'CONTRACT.ContractTitle': 'Contrato de Alquiler Turístico',
      'CONTRACT.ContractDesc': 'Genera un acuerdo de alquiler profesional para tu propiedad',
      'CONTRACT.Parties': 'Partes',
      'CONTRACT.HostName': 'Nombre del Anfitrión',
      'CONTRACT.HostNamePlaceholder': 'Nombre completo o razón social',
      'CONTRACT.HostId': 'DNI / NIF',
      'CONTRACT.HostIdPlaceholder': 'Pasaporte o número fiscal',
      'CONTRACT.HostAddress': 'Dirección',
      'CONTRACT.HostAddressPlaceholder': 'Dirección completa',
      'CONTRACT.HostPhone': 'Teléfono',
      'CONTRACT.HostPhonePlaceholder': '+34 612 345 678',
      'CONTRACT.HostEmail': 'Correo electrónico',
      'CONTRACT.HostEmailPlaceholder': 'email@ejemplo.com',
      'CONTRACT.GuestInfo': 'Información del Invitado',
      'CONTRACT.GuestName': 'Nombre del Invitado',
      'CONTRACT.GuestNamePlaceholder': 'Nombre completo',
      'CONTRACT.GuestId': 'DNI / Pasaporte',
      'CONTRACT.GuestIdPlaceholder': 'Número de identificación',
      'CONTRACT.GuestAddress': 'Dirección',
      'CONTRACT.GuestAddressPlaceholder': 'Dirección completa',
      'CONTRACT.Property': 'Propiedad',
      'CONTRACT.PropertyAddress': 'Dirección de la Propiedad',
      'CONTRACT.PropertyAddressPlaceholder': 'Dirección completa del inmueble',
      'CONTRACT.PropertyDescription': 'Descripción',
      'CONTRACT.PropertyDescriptionPlaceholder': 'Número de habitaciones, dormitorios, baños...',
      'CONTRACT.Amenities': 'Comodidades',
      'CONTRACT.AmenitiesPlaceholder': 'WiFi, Cocina, Parking, Piscina...',
      'CONTRACT.RentalPeriod': 'Período de Alquiler',
      'CONTRACT.CheckInDate': 'Fecha de Entrada',
      'CONTRACT.CheckInTime': 'Hora de Entrada',
      'CONTRACT.CheckOutDate': 'Fecha de Salida',
      'CONTRACT.CheckOutTime': 'Hora de Salida',
      'CONTRACT.MaxGuests': 'Máximo de Huéspedes',
      'CONTRACT.FinancialTerms': 'Términos Financieros',
      'CONTRACT.RentalAmount': 'Monto del Alquiler',
      'CONTRACT.RentalAmountPlaceholder': '1.000 € total',
      'CONTRACT.CleaningFee': 'Tarifa de Limpieza',
      'CONTRACT.CleaningFeePlaceholder': '100 €',
      'CONTRACT.SecurityDeposit': 'Depósito de Seguridad',
      'CONTRACT.SecurityDepositPlaceholder': '500 € (reembolsable)',
      'CONTRACT.PaymentSchedule': 'Calendario de Pago',
      'CONTRACT.PaymentSchedulePlaceholder': '50% al reservar, 50% al entrada',
      'CONTRACT.Policies': 'Políticas',
      'CONTRACT.CancellationPolicy': 'Política de Cancelación',
      'CONTRACT.CancellationPolicyPlaceholder': 'Reembolso total si se cancela 14 días antes...',
      'CONTRACT.HouseRules': 'Normas de la Casa',
      'CONTRACT.HouseRulesPlaceholder': 'No fumar, sin fiestas, horas silenciosas 22h-8h...',
      'CONTRACT.Liability': 'Responsabilidad',
      'CONTRACT.LiabilityPlaceholder': 'El huésped es responsable de los daños...',
      'CONTRACT.DownloadContract': 'Descargar Contrato (PDF)',
      'CONTRACT.ShortTermRentalAgreement': 'Contrato de Alquiler Turístico',
      'CONTRACT.ContractDate': 'Fecha del Contrato',
      'CONTRACT.Landlord': 'Propietario/Anfitrión',
      'CONTRACT.Guest': 'Huésped/Inquilino',
      'CONTRACT.ID': 'DNI',
      'CONTRACT.Address': 'Dirección',
      'CONTRACT.CheckIn': 'Entrada',
      'CONTRACT.CheckOut': 'Salida',
      'CONTRACT.Guests': 'huéspedes',
      'CONTRACT.PaymentTerms': 'Términos de Pago',
      'CONTRACT.LandlordSignature': 'Firma del Propietario',
      'CONTRACT.GuestSignature': 'Firma del Huésped',
      'CONTRACT.Date': 'Fecha',
      'CONTRACT.DefaultCancellation': 'El huésped puede cancelar hasta 14 días antes de la entrada para obtener un reembolso completo. Las cancelaciones dentro de los 14 días no son reembolsables.',
      'CONTRACT.DefaultHouseRules': 'Prohibido fumar en el interior. Prohibido organizar fiestas. Horas silenciosas de 22:00 a 08:00. No se admiten mascotas.',
      'CONTRACT.DefaultLiability': 'El huésped es responsable de cualquier daño a la propiedad durante su estancia. El depósito de seguridad se utilizará para cubrir daños.',
    },
    fr: {
      'CONTRACT.ContractTitle': 'Contrat de Location Touristique',
      'CONTRACT.ContractDesc': 'Générez un contrat de location professionnel pour votre propriété',
      'CONTRACT.Parties': 'Parties',
      'CONTRACT.HostName': 'Nom du Propriétaire',
      'CONTRACT.HostNamePlaceholder': 'Nom complet ou raison sociale',
      'CONTRACT.HostId': 'CNI / SIRET',
      'CONTRACT.HostIdPlaceholder': 'Passeport ou numéro fiscal',
      'CONTRACT.HostAddress': 'Adresse',
      'CONTRACT.HostAddressPlaceholder': 'Adresse complète',
      'CONTRACT.HostPhone': 'Téléphone',
      'CONTRACT.HostPhonePlaceholder': '+33 6 12 34 56 78',
      'CONTRACT.HostEmail': 'Email',
      'CONTRACT.HostEmailPlaceholder': 'email@exemple.com',
      'CONTRACT.GuestInfo': 'Informations du Locataire',
      'CONTRACT.GuestName': 'Nom du Locataire',
      'CONTRACT.GuestNamePlaceholder': 'Nom complet',
      'CONTRACT.GuestId': 'CNI / Passeport',
      'CONTRACT.GuestIdPlaceholder': 'Numéro d\'identification',
      'CONTRACT.GuestAddress': 'Adresse',
      'CONTRACT.GuestAddressPlaceholder': 'Adresse complète',
      'CONTRACT.Property': 'Propriété',
      'CONTRACT.PropertyAddress': 'Adresse de la Propriété',
      'CONTRACT.PropertyAddressPlaceholder': 'Adresse complète du bien',
      'CONTRACT.PropertyDescription': 'Description',
      'CONTRACT.PropertyDescriptionPlaceholder': 'Nombre de pièces, chambres, salles de bain...',
      'CONTRACT.Amenities': 'Équipements',
      'CONTRACT.AmenitiesPlaceholder': 'WiFi, Cuisine, Parking, Piscine...',
      'CONTRACT.RentalPeriod': 'Période de Location',
      'CONTRACT.CheckInDate': 'Date d\'Arrivée',
      'CONTRACT.CheckInTime': 'Heure d\'Arrivée',
      'CONTRACT.CheckOutDate': 'Date de Départ',
      'CONTRACT.CheckOutTime': 'Heure de Départ',
      'CONTRACT.MaxGuests': 'Nombre Maximum d\'Occupants',
      'CONTRACT.FinancialTerms': 'Conditions Financières',
      'CONTRACT.RentalAmount': 'Montant de la Location',
      'CONTRACT.RentalAmountPlaceholder': '1 000 € total',
      'CONTRACT.CleaningFee': 'Frais de Ménage',
      'CONTRACT.CleaningFeePlaceholder': '100 €',
      'CONTRACT.SecurityDeposit': 'Dépôt de Garantie',
      'CONTRACT.SecurityDepositPlaceholder': '500 € (remboursable)',
      'CONTRACT.PaymentSchedule': 'Échéancier de Paiement',
      'CONTRACT.PaymentSchedulePlaceholder': '50% à la réservation, 50% à l\'arrivée',
      'CONTRACT.Policies': 'Politiques',
      'CONTRACT.CancellationPolicy': 'Politique d\'Annulation',
      'CONTRACT.CancellationPolicyPlaceholder': 'Remboursement total si annulation 14 jours avant...',
      'CONTRACT.HouseRules': 'Règlement Intérieur',
      'CONTRACT.HouseRulesPlaceholder': 'Interdiction de fumar, pas de fête, heures silencieuses 22h-8h...',
      'CONTRACT.Liability': 'Responsabilité',
      'CONTRACT.LiabilityPlaceholder': 'Le locataire est responsable des dommages...',
      'CONTRACT.DownloadContract': 'Télécharger le Contrat (PDF)',
      'CONTRACT.ShortTermRentalAgreement': 'Contrat de Location Touristique',
      'CONTRACT.ContractDate': 'Date du Contrat',
      'CONTRACT.Landlord': 'Propriétaire/Bailleur',
      'CONTRACT.Guest': 'Locataire',
      'CONTRACT.ID': 'CNI',
      'CONTRACT.Address': 'Adresse',
      'CONTRACT.CheckIn': 'Arrivée',
      'CONTRACT.CheckOut': 'Départ',
      'CONTRACT.Guests': 'personnes',
      'CONTRACT.PaymentTerms': 'Conditions de Paiement',
      'CONTRACT.LandlordSignature': 'Signature du Propriétaire',
      'CONTRACT.GuestSignature': 'Signature du Locataire',
      'CONTRACT.Date': 'Date',
      'CONTRACT.DefaultCancellation': 'Le locataire peut annuler jusqu\'à 14 jours avant l\'arrivée pour un remboursement complet. Les annulations dans les 14 jours ne sont pas remboursables.',
      'CONTRACT.DefaultHouseRules': 'Interdiction de fumer à l\'intérieur. Interdiction de fête. Heures silencieuses de 22h à 8h. Animaux non admis sauf accord explicite.',
      'CONTRACT.DefaultLiability': 'Le locataire est responsable de tout dommage causé à la propriété pendant son séjour. Le dépôt de garantie sera utilisé pour couvrir les dommages.',
    }
  };

  constructor() {
    const browserLang = navigator.language.split('-')[0];
    if (browserLang === 'es' || browserLang === 'fr') {
      this.selectedLanguage.set(browserLang as Language);
    }
  }

  setLanguage(lang: Language) {
    this.selectedLanguage.set(lang);
  }

  getTranslation(key: string): string {
    const lang = this.selectedLanguage();
    return this.translations[lang]?.[key] || this.translations['en']?.[key] || key;
  }

  generatePDF() {
    const doc = new jsPDF();
    const lang = this.selectedLanguage();
    const t = (key: string) => this.getTranslation(key);
    const line = (text: string, indent = 0) => doc.text(text, 20 + indent, doc.getCurrentPageInfo().pageNumber === 1 ? 20 : 20);
    let y = 20;

    const addPageIfNeeded = () => {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    };

    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text(t('CONTRACT.ShortTermRentalAgreement'), 105, y, { align: 'center' });
    y += 15;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`${t('CONTRACT.ContractDate')}: ${this.today}`, 20, y);
    y += 15;

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('1. ' + t('CONTRACT.Parties'), 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    doc.text(`${t('CONTRACT.Landlord')}: ${this.contractData.hostName || '[Name]'}`, 25, y);
    y += 6;
    if (this.contractData.hostId) {
      doc.text(`${t('CONTRACT.ID')}: ${this.contractData.hostId}`, 25, y);
      y += 6;
    }
    if (this.contractData.hostAddress) {
      doc.text(this.contractData.hostAddress, 25, y);
      y += 6;
    }
    if (this.contractData.hostPhone || this.contractData.hostEmail) {
      doc.text(`${this.contractData.hostPhone || ''} ${this.contractData.hostEmail || ''}`.trim(), 25, y);
      y += 6;
    }
    y += 4;
    
    doc.text(`${t('CONTRACT.Guest')}: ${this.contractData.guestName || '[Name]'}`, 25, y);
    y += 6;
    if (this.contractData.guestId) {
      doc.text(`${t('CONTRACT.ID')}: ${this.contractData.guestId}`, 25, y);
      y += 6;
    }
    if (this.contractData.guestAddress) {
      doc.text(this.contractData.guestAddress, 25, y);
      y += 6;
    }
    y += 8;
    addPageIfNeeded();

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('2. ' + t('CONTRACT.Property'), 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`${t('CONTRACT.Address')}: ${this.contractData.propertyAddress || '[Address]'}`, 25, y);
    y += 6;
    if (this.contractData.propertyDescription) {
      const descLines = doc.splitTextToSize(this.contractData.propertyDescription, 160);
      doc.text(descLines, 25, y);
      y += descLines.length * 5 + 2;
    }
    if (this.contractData.amenities) {
      doc.text(`${t('CONTRACT.Amenities')}: ${this.contractData.amenities}`, 25, y);
      y += 6;
    }
    y += 8;
    addPageIfNeeded();

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('3. ' + t('CONTRACT.RentalPeriod'), 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`${t('CONTRACT.CheckIn')}: ${this.contractData.checkInDate || '[Date]'} ${this.contractData.checkInTime ? 'at ' + this.contractData.checkInTime : ''}`, 25, y);
    y += 6;
    doc.text(`${t('CONTRACT.CheckOut')}: ${this.contractData.checkOutDate || '[Date]'} ${this.contractData.checkOutTime ? 'at ' + this.contractData.checkOutTime : ''}`, 25, y);
    y += 6;
    doc.text(`${t('CONTRACT.MaxGuests')}: ${this.contractData.maxGuests || '[Number]'} ${t('CONTRACT.Guests')}`, 25, y);
    y += 8;
    addPageIfNeeded();

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('4. ' + t('CONTRACT.PaymentTerms'), 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`${t('CONTRACT.RentalAmount')}: ${this.contractData.rentalAmount || '[Amount]'}`, 25, y);
    y += 6;
    doc.text(`${t('CONTRACT.CleaningFee')}: ${this.contractData.cleaningFee || '[Fee]'}`, 25, y);
    y += 6;
    doc.text(`${t('CONTRACT.SecurityDeposit')}: ${this.contractData.securityDeposit || '[Deposit]'}`, 25, y);
    y += 6;
    if (this.contractData.paymentSchedule) {
      doc.text(`${t('CONTRACT.PaymentSchedule')}: ${this.contractData.paymentSchedule}`, 25, y);
      y += 6;
    }
    y += 8;
    addPageIfNeeded();

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('5. ' + t('CONTRACT.CancellationPolicy'), 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const cancelText = this.contractData.cancellationPolicy || t('CONTRACT.DefaultCancellation');
    const cancelLines = doc.splitTextToSize(cancelText, 160);
    doc.text(cancelLines, 25, y);
    y += cancelLines.length * 5 + 8;
    addPageIfNeeded();

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('6. ' + t('CONTRACT.HouseRules'), 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const rulesText = this.contractData.houseRules || t('CONTRACT.DefaultHouseRules');
    const rulesLines = doc.splitTextToSize(rulesText, 160);
    doc.text(rulesLines, 25, y);
    y += rulesLines.length * 5 + 8;
    addPageIfNeeded();

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('7. ' + t('CONTRACT.Liability'), 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const liabilityText = this.contractData.liability || t('CONTRACT.DefaultLiability');
    const liabilityLines = doc.splitTextToSize(liabilityText, 160);
    doc.text(liabilityLines, 25, y);
    y += liabilityLines.length * 5 + 20;
    addPageIfNeeded();

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(t('CONTRACT.LandlordSignature'), 40, y);
    doc.text(t('CONTRACT.GuestSignature'), 130, y);
    y += 15;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('_______________________', 30, y);
    doc.text('_______________________', 120, y);
    y += 6;
    doc.text(`${this.contractData.hostName || '[Name]'}`, 30, y);
    doc.text(`${this.contractData.guestName || '[Name]'}`, 120, y);
    y += 6;
    doc.text(`${t('CONTRACT.Date')}: ____/____/________`, 30, y);
    doc.text(`${t('CONTRACT.Date')}: ____/____/________`, 120, y);

    const fileName = `rental-contract-${this.selectedLanguage()}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  }
}
