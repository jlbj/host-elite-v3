import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Language } from '../../../../services/translation.service';
import { jsPDF } from 'jspdf';
import { CONTRACT_TRANSLATIONS } from './contract-translations';

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
  templateUrl: './rental-contract-template.component.html',
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
    return CONTRACT_TRANSLATIONS[lang]?.[key] || CONTRACT_TRANSLATIONS['en']?.[key] || key;
  }

  generatePDF() {
    const doc = new jsPDF();
    const lang = this.selectedLanguage();
    const t = (key: string) => this.getTranslation(key);
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

    doc.save('rental-contract.pdf');
  }
}
