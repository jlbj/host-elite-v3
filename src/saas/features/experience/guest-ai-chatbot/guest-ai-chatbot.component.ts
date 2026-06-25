import { Component, computed, inject, signal, input, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Feature } from '../../../../types';
import { SessionStore } from '../../../../state/session.store';
import { GeminiService } from '../../../../services/gemini.service';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../../pipes/translate.pipe';

interface ChatMessage {
    id: string;
    sender: 'user' | 'bot';
    text: string;
    timestamp: Date;
    isSms?: boolean; // Tier 1
}

@Component({
    selector: 'exp-04-chatbot',
    standalone: true,
    imports: [CommonModule, FormsModule,
        TranslatePipe
    ],
    template: `
    <div class="h-full flex flex-col gap-6 animate-fade-in-up">
      <!-- Header -->
      <div class="flex justify-between items-start">
        <div>
          <h1 class="text-3xl font-extrabold text-white tracking-tight">{{ 'GUEST_AI_C.ContextualHospitalityAgent' | translate }}</h1>
          <p class="text-slate-400 mt-2 max-w-2xl">{{ 'GUEST_AI_C.RagdrivenAiGuestAssistantFor' | translate }}</p>
        </div>
        <div class="flex gap-2">
             <div class="px-4 py-2 bg-indigo-500/10 text-indigo-300 rounded-lg border border-indigo-500/30 text-xs font-mono flex items-center gap-2">
                <span>🤖</span>{{ 'GUEST_AI_C.RagBot' | translate }}</div>
        </div>
      </div>

       <div class="flex-1 bg-slate-800 rounded-xl border border-white/10 overflow-hidden flex flex-col lg:flex-row">
            <!-- Left: Chat Interface -->
            <div class="flex-1 flex flex-col border-r border-white/10 relative">
                <!-- Tier 1 Indicator -->
                <div *ngIf="!isTier2OrAbove()" class="absolute top-0 left-0 w-full bg-amber-500/10 border-b border-amber-500/20 p-2 text-center text-[10px] text-amber-300 font-bold z-10">{{ 'GUEST_AI_C.SmsModeTier1Manual' | translate }}</div>

                <div #chatContainer class="flex-1 p-6 space-y-4 overflow-y-auto bg-slate-900/50 pt-10 scroll-smooth">
                    @for (msg of messages(); track msg.id) {
                        <div class="flex" [class.justify-end]="msg.sender === 'user'" [class.justify-start]="msg.sender === 'bot'">
                            @if (msg.sender === 'bot') {
                                <div class="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white text-xs font-bold mr-2 mt-auto shadow-lg shadow-indigo-500/20">AI</div>
                            }
                            <div class="max-w-[80%] p-3 text-sm shadow-xl transition-all hover:scale-[1.02]"
                                 [class.bg-indigo-600]="msg.sender === 'user' && !msg.isSms"
                                 [class.bg-slate-700]="msg.sender === 'bot' && !msg.isSms"
                                 [class.bg-emerald-600]="msg.sender === 'user' && msg.isSms"
                                 [class.bg-slate-600]="msg.sender === 'bot' && msg.isSms"
                                 [class.rounded-l-2xl]="msg.sender === 'user'"
                                 [class.rounded-tr-2xl]="msg.sender === 'user'"
                                 [class.rounded-r-2xl]="msg.sender === 'bot'"
                                 [class.rounded-tl-2xl]="msg.sender === 'bot'"
                                 [class.text-white]="true">
                                <div class="whitespace-pre-wrap">{{ msg.text }}</div>
                                <div class="text-[9px] opacity-50 mt-1 text-right">{{ msg.timestamp | date:'shortTime' }}</div>
                            </div>
                             @if (msg.sender === 'user') {
                                <div class="h-8 w-8 rounded-full bg-slate-600 flex items-center justify-center text-white text-xs font-bold ml-2 mt-auto shadow-lg">G</div>
                            }
                        </div>
                    }
                    
                    @if (isTyping()) {
                        <div class="flex justify-start animate-pulse">
                            <div class="h-8 w-8 rounded-full bg-indigo-500/50 flex items-center justify-center text-white text-xs font-bold mr-2">...</div>
                            <div class="bg-slate-700/50 rounded-r-xl rounded-tl-xl p-3 flex gap-1 items-center">
                                <span class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span class="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                            </div>
                        </div>
                    }
                </div>
                
                <div class="p-4 border-t border-white/10 bg-slate-800">
                    <div class="relative">
                        <input #chatInput [(ngModel)]="newMessage" (keyup.enter)="sendMessage()" type="text" 
                               [placeholder]="isTier3() ? 'Ask AI or Train...' : 'Type SMS reply...'" 
                               class="w-full bg-black/30 border border-white/10 rounded-full px-6 py-3 text-white focus:ring-2 focus:ring-indigo-500 transition-all shadow-inner" 
                               data-debug-id="chatbot-train-input">
                        <button (click)="sendMessage()" class="absolute right-2 top-1.5 h-9 w-9 bg-indigo-600 rounded-full flex items-center justify-center text-white hover:bg-indigo-500" data-debug-id="chatbot-train-btn">
                            <span class="material-icons text-sm">arrow_upward</span>
                        </button>
                    </div>
                </div>
            </div>

            <!-- Right: Knowledge & Insights -->
            <div class="w-full lg:w-80 bg-slate-800 p-6 flex flex-col gap-6 overflow-y-auto">
                <h3 class="text-white font-bold">{{ 'GUEST_AI_C.KnowledgeBase' | translate }}</h3>

                <!-- Coach Tip -->
                <div class="p-4 bg-indigo-900/20 border-l-4 border-indigo-500 rounded-r-lg">
                    <div class="flex items-center gap-2 mb-1">
                        <span class="text-lg">💡</span>
                        <span class="text-indigo-300 font-bold text-sm uppercase">{{ 'GUEST_AI_C.CoachTip' | translate }}</span>
                    </div>
                    <p class="text-slate-300 text-xs italic">
                        "Speed Wins. Replying under 5 mins increases booking conversion by 400%. If you sleep, the bot handles it."
                    </p>
                </div>
                
                <!-- Topic Frequency Word Cloud (Requirement) -->
                @if (isTier3()) {
                    <div class="bg-black/20 p-4 rounded-xl border border-white/5">
                        <h4 class="text-xs text-slate-400 font-bold uppercase mb-3">{{ 'GUEST_AI_C.TopicFrequencyWordcloud' | translate }}</h4>
                        <div class="flex flex-wrap gap-2 justify-center">
                            <span class="text-emerald-400 text-lg font-bold">{{ 'GUEST_AI_C.Wifi' | translate }}</span>
                            <span class="text-slate-300 text-xs">{{ 'GUEST_AI_C.Parking' | translate }}</span>
                            <span class="text-indigo-400 text-sm font-bold">{{ 'GUEST_AI_C.Heating' | translate }}</span>
                            <span class="text-slate-400 text-[10px]">{{ 'GUEST_AI_C.Keys' | translate }}</span>
                            <span class="text-pink-400 text-md font-bold">{{ 'GUEST_AI_C.Checkout' | translate }}</span>
                            <span class="text-slate-300 text-xs">{{ 'GUEST_AI_C.Pool' | translate }}</span>
                            <span class="text-amber-400 text-sm">{{ 'GUEST_AI_C.Late' | translate }}</span>
                            <span class="text-slate-500 text-[10px]">{{ 'GUEST_AI_C.Noise' | translate }}</span>
                        </div>
                    </div>
                }

                <!-- RAG Sources -->
                <div class="space-y-3">
                    <div class="p-3 bg-black/20 rounded border border-white/5 flex items-center gap-3">
                        <span class="material-icons text-slate-500">description</span>
                        <div class="flex-1">
                            <div class="text-white text-xs font-bold">{{ 'GUEST_AI_C.HouseManualpdf' | translate }}</div>
                            <div class="text-[10px] text-emerald-400">{{ 'GUEST_AI_C.IndexedRag' | translate }}</div>
                        </div>
                    </div>
                    @if (isTier2OrAbove()) {
                         <div class="p-3 bg-black/20 rounded border border-white/5 flex items-center gap-3">
                            <span class="material-icons text-slate-500">wifi</span>
                            <div class="flex-1">
                                <div class="text-white text-xs font-bold">{{ 'GUEST_AI_C.WifiAccess' | translate }}</div>
                                <div class="text-[10px] text-emerald-400">{{ 'GUEST_AI_C.FixedReply' | translate }}</div>
                            </div>
                        </div>
                    }
                    
                    @if (isTier3()) {
                        <button class="w-full mt-4 border border-dashed border-slate-600 p-2 rounded text-xs text-slate-400 hover:text-white hover:border-white transition-colors" data-debug-id="chatbot-upload-doc-btn">
                            + Upload Knowledge Source
                        </button>
                    }
                </div>
                
                @if (isTier3()) {
                    <div class="mt-auto">
                        <div class="text-[10px] uppercase font-bold text-slate-500 mb-2">{{ 'GUEST_AI_C.ConfidenceThreshold' | translate }}</div>
                        <input type="range" class="w-full h-1 bg-slate-600 rounded appearance-none" value="80" data-debug-id="chatbot-confidence-slider">
                        <div class="flex justify-between text-[10px] text-slate-400 mt-1">
                            <span>{{ 'GUEST_AI_C.Lax' | translate }}</span>
                            <span>{{ 'GUEST_AI_C.Strict80' | translate }}</span>
                        </div>
                    </div>
                }
            </div>
       </div>
    </div>
    `,
    styles: [`:host { display: block; height: 100%; }`]
})
export class GuestAiChatbotComponent implements AfterViewChecked {
    @ViewChild('chatContainer') private chatContainer!: ElementRef;
    @ViewChild('chatInput') private chatInput!: ElementRef;

    session = inject(SessionStore);
    gemini = inject(GeminiService);

    propertyDetails = input<any>();
    isTyping = signal(false);

    tier = computed(() => {
        const plan = this.session.userProfile()?.plan || 'TIER_0';
        return plan === 'Freemium' ? 'TIER_0' : plan;
    });

    isTier2OrAbove = computed(() => ['TIER_2', 'TIER_3'].includes(this.tier()));
    isTier3 = computed(() => this.tier() === 'TIER_3');

    newMessage = '';
    messages = signal<ChatMessage[]>([
        { id: '1', sender: 'bot', text: 'Hello! I am your AI concierge. How can I help you with your stay today?', timestamp: new Date(Date.now() - 3600000), isSms: false },
    ]);

    ngAfterViewChecked() {
        this.scrollToBottom();
    }

    private scrollToBottom(): void {
        try {
            this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
        } catch (err) { }
    }

    async sendMessage() {
        if (!this.newMessage.trim() || this.isTyping()) return;

        const isSms = !this.isTier2OrAbove();
        const userTxt = this.newMessage;
        this.newMessage = '';

        // Add User Message
        this.messages.update(msgs => [...msgs, {
            id: Date.now().toString(),
            sender: 'user',
            text: userTxt,
            timestamp: new Date(),
            isSms
        }]);

        if (isSms) return; // Manual mode only for Tier 1

        this.isTyping.set(true);

        try {
            let reply = "I don't know that yet.";

            if (this.isTier3()) {
                // RAG AI Mode
                const context = this.buildPropertyContext();
                reply = await this.gemini.getConciergeResponse(
                    this.propertyDetails()?.name || 'This Property',
                    context,
                    userTxt
                );
            } else {
                // Tier 2: Static Auto-Reply simulation
                reply = "Hello! I am the automated assistant. How can I help you today?";
                await new Promise(resolve => setTimeout(resolve, 1000));
            }

            this.messages.update(msgs => [...msgs, {
                id: Date.now().toString(),
                sender: 'bot',
                text: reply,
                timestamp: new Date(),
                isSms: false
            }]);
        } catch (error) {
            console.error('Chatbot error:', error);
        } finally {
            this.isTyping.set(false);
            setTimeout(() => this.chatInput?.nativeElement?.focus(), 100);
        }
    }

    private buildPropertyContext(): string {
        const p = this.propertyDetails();
        if (!p) return 'No property data available.';

        const rentalLabels: Record<string, string> = { entire_place: 'Entire Place', private_rooms: 'Private Rooms', both: 'Entire Place & Rooms' };
        return `
            Property Name: ${p.name}
            Address: ${p.address}
            Listing Title: ${p.listing_title}
            Description: ${p.listing_description}
            Rental Mode: ${rentalLabels[p.rental_mode] || 'Entire Place'}
            
            INSTRUCTIONS & RULES:
            - WiFi: ${p.wifi_code || 'Check house manual'}
            - Arrival: ${p.arrival_instructions || 'N/A'}
            - House Rules: ${p.house_rules_text || 'Standard rules apply'}
            - Emergency Contact: ${p.emergency_contact_info || 'N/A'}
            
            EQUIPMENT:
            ${(p.property_equipments || []).map((e: any) => `- ${e.name}`).join('\n')}
        `.trim();
    }
}
