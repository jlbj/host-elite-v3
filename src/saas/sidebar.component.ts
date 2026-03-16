
import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { UserRole, View, Property } from '../types';
import { SessionStore } from '../state/session.store';

import { TranslationService } from '../services/translation.service';
import { TranslatePipe } from '../pipes/translate.pipe';

@Component({
    selector: 'saas-sidebar',
    standalone: true,
    imports: [CommonModule, TranslatePipe],
    template: `
    <aside class="w-64 flex-shrink-0 flex flex-col h-full bg-slate-900 border-r border-white/10 text-white transition-all duration-300 relative z-20">
      <!-- Logo Header -->
      <div class="px-6 h-16 flex items-center border-b border-white/10 flex-shrink-0" data-debug-id="nav-logo">
        <h1 class="text-lg font-bold flex items-center space-x-3 leading-tight tracking-wide">
            <div class="p-1.5 bg-white/10 rounded-lg backdrop-blur-sm border border-white/5 shadow-inner">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5 text-[#D4AF37]"><path fill-rule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" clip-rule="evenodd" /></svg>
            </div>
            <span class="truncate bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
                Hôte d'Exception
            </span>
        </h1>
      </div>
      
      <!-- Scrollable Nav -->
      <nav class="flex-1 px-3 py-6 space-y-1 overflow-y-auto custom-scrollbar">
        

        @if (userRole() !== 'admin') {
            <!-- Main Navigation -->
            <div class="space-y-1">
            @for (view of mainViews; track view.id) {
                <a (click)="isLocked(view) ? null : changeView(view)"
                class="group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg cursor-pointer transition-all duration-200 border border-transparent"
                [class]="activeView().id === view.id 
                    ? 'bg-white/10 text-[#D4AF37] border-l-2 border-[#D4AF37] shadow-inner' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'"
                [class.opacity-50]="isLocked(view)"
                [class.cursor-not-allowed]="isLocked(view)"
                [attr.data-debug-id]="'nav-link-' + view.id">
                <div class="flex items-center">
                    <span class="w-5 h-5 mr-3 flex items-center justify-center transition-colors" 
                          [class]="activeView().id === view.id ? 'text-[#D4AF37]' : 'text-slate-500 group-hover:text-white'"
                          [innerHTML]="getIcon(view.icon)"></span>
                    {{ 'NAV.' + view.id | translate }}
                </div>
                <!-- Badge -->
                @if (view.featureId) {
                    @if (getBadge(view.featureId); as badge) {
                        <span class="text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider ml-2 whitespace-nowrap opacity-80" [class]="badge.colorClass">
                            {{ badge.label }}
                        </span>
                    }
                }
                <!-- Lock Icon -->
                @if (isLocked(view)) {
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 text-slate-600 ml-2"><path fill-rule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clip-rule="evenodd" /></svg>
                }
                </a>
            }
            </div>
            
            <!-- Properties Menu -->
            @if (userRole() === 'owner' || properties().length > 0) {
                <div class="pt-6">
                    <div class="px-3 pb-3">
                        <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{{ 'SIDEBAR.Management' | translate }}</span>
                    </div>
                <div class="px-2 space-y-2">
                    @if(properties().length > 0) {
                    <div class="relative">
                        <!-- Dropdown Trigger -->
                        <button (click)="togglePropertyDropdown()" 
                                class="w-full flex items-center justify-between px-3 py-2.5 text-sm font-bold rounded-lg cursor-pointer transition-all border border-white/10 bg-white/5 text-white hover:bg-white/10 hover:border-white/20 shadow-lg group"
                                data-debug-id="nav-properties-dropdown">
                            <div class="flex items-center min-w-0">
                                <span class="w-5 h-5 mr-2 flex items-center justify-center flex-shrink-0 text-[#D4AF37]" [innerHTML]="getIcon('property')"></span>
                                <span class="truncate">{{ 'SIDEBAR.MyProperties' | translate }}</span>
                            </div>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 transition-transform duration-200 flex-shrink-0 text-slate-400 group-hover:text-white" [class.rotate-180]="isPropertyDropdownOpen()">
                                <path fill-rule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                            </svg>
                        </button>

                        @if(isPropertyDropdownOpen()) {
                        <div class="absolute z-50 left-0 right-0 mt-2 bg-slate-800 rounded-lg shadow-2xl border border-white/10 overflow-hidden ring-1 ring-black/20 backdrop-blur-md">
                            @for (property of properties(); track property.id) {
                            <a (click)="selectProperty(property)" 
                            class="w-full text-left px-4 py-3 text-sm cursor-pointer flex items-center justify-between group border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors"
                            [class]="property.name === selectedProperty()?.name ? 'text-[#D4AF37] font-semibold bg-white/5' : 'text-slate-300'"
                            [attr.data-debug-id]="'nav-property-select-' + property.id">
                                <span class="truncate">{{ property.name }}</span>
                                @if(property.name === selectedProperty()?.name) {
                                    <span class="w-1.5 h-1.5 rounded-full bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]"></span>
                                }
                            </a>
                            }
                            <div class="bg-slate-900/50">
                                <a (click)="createProperty()" class="block w-full text-left px-4 py-3 text-xs text-blue-400 hover:bg-white/5 hover:text-blue-300 cursor-pointer font-bold uppercase tracking-wide flex items-center border-t border-white/10"
                                   data-debug-id="nav-create-property">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3 h-3 mr-2"><path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" /></svg>
                                    {{ 'SIDEBAR.NewProperty' | translate }}
                                </a>
                            </div>
                        </div>
                        }
                    </div>

                    <!-- Sub-views for the currently active property -->
                    @if(selectedProperty(); as prop) {
                        <div class="pl-2 mt-3 ml-2 space-y-4">
                            <!-- Property Label (Concise) -->
                            <div class="px-3 flex items-center justify-between group/label">
                                <p class="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1 truncate opacity-60">{{ prop.name }}</p>
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3 h-3 text-slate-600 group-hover/label:text-[#D4AF37] transition-colors cursor-pointer" (click)="togglePropertyDropdown()">
                                    <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
                                    <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
                                </svg>
                            </div>

                            <div class="space-y-6 mt-1">
                                <!-- Management Tools -->
                                <div class="space-y-1">
                                    @for(subView of prop.subViews; track subView.id) {
                                        @if (subView.id === 'manage-property' || subView.id === 'welcome-booklet') {
                                        <a (click)="isLocked(subView) ? null : changeView(subView, prop.name)"
                                        class="group flex items-center justify-between px-3 py-2 text-sm font-medium rounded-r-lg cursor-pointer transition-all relative"
                                        [class]="activeView().id === subView.id && activeView().propertyName === prop.name 
                                            ? 'text-white bg-white/5 border-l-2 border-[#D4AF37] -ml-[1px]' 
                                            : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'"
                                        [class.opacity-50]="isLocked(subView)"
                                        [class.cursor-not-allowed]="isLocked(subView)"
                                        [attr.data-debug-id]="'nav-subview-' + subView.id">
                                        
                                        <div class="flex items-center min-w-0">
                                            <span class="w-5 h-5 mr-3 flex items-center justify-center flex-shrink-0 transition-colors" 
                                                  [class]="activeView().id === subView.id && activeView().propertyName === prop.name ? 'text-[#D4AF37]' : 'text-slate-600 group-hover:text-slate-400'"
                                                  [innerHTML]="getIcon(subView.icon)"></span>
                                            <span class="truncate">{{ (subView.title.startsWith('NAV.') ? (subView.title | translate) : subView.title) }}</span>
                                        </div>

                                        <div class="flex items-center space-x-2 ml-2">
                                            @if (isLocked(subView)) {
                                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-3 h-3 text-slate-600"><path fill-rule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clip-rule="evenodd" /></svg>
                                            }
                                        </div>
                                        </a>
                                        }
                                    }
                                </div>
                            </div>
                        </div>
                    } @else {
                        <!-- No property state -->
                        <button (click)="createProperty()" class="w-full flex items-center justify-center px-3 py-3 text-sm font-bold rounded-lg cursor-pointer transition-colors bg-[#D4AF37] text-slate-900 hover:bg-yellow-500 shadow-lg"
                                data-debug-id="nav-create-first-property">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 mr-2"><path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" /></svg>
                            {{ 'SIDEBAR.CreateFirst' | translate }}
                        </button>
                    }
                    }
                </div>
            </div>
            }

        }

        <!-- Support -->
        <div class="pt-6">
            <div class="px-3 pb-3">
                <span class="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{{ 'NAV.support' | translate }}</span>
            </div>
            <div class="space-y-1">
            @for (view of supportViews; track view.id) {
                <a (click)="isLocked(view) ? null : changeView(view)"
                class="group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg cursor-pointer transition-all duration-200 border border-transparent"
                [class]="activeView().id === view.id 
                    ? 'bg-white/10 text-[#D4AF37] border-l-2 border-[#D4AF37] shadow-inner' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'"
                [class.opacity-50]="isLocked(view)"
                [class.cursor-not-allowed]="isLocked(view)"
                [attr.data-debug-id]="'nav-support-' + view.id">
                <div class="flex items-center">
                    <span class="w-5 h-5 mr-3 flex items-center justify-center transition-colors"
                          [class]="activeView().id === view.id ? 'text-[#D4AF37]' : 'text-slate-500 group-hover:text-white'"
                          [innerHTML]="getIcon(view.icon)"></span>
                    {{ 'NAV.' + view.id | translate }}
                </div>
                </a>
            }
            </div>
        </div>

        <!-- Academy (Moved to bottom) -->
        <div class="pt-6 pb-6">
            <div class="px-3 pb-2">
                <span class="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest">{{ 'SIDEBAR.Academy' | translate }}</span>
            </div>
            <div class="space-y-1">
                @for (view of trainingViews; track view.id) {
                    <a (click)="isLocked(view) ? null : changeView(view)"
                    class="group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg cursor-pointer transition-all duration-200 border border-transparent"
                    [class]="activeView().id === view.id 
                        ? 'bg-white/10 text-[#D4AF37] border-l-2 border-[#D4AF37] shadow-inner' 
                        : 'text-slate-400 hover:text-white hover:bg-white/5'"
                    [class.opacity-50]="isLocked(view)"
                    [class.cursor-not-allowed]="isLocked(view)"
                    [attr.data-debug-id]="'nav-academy-' + view.id">
                        <div class="flex items-center">
                            <span class="w-5 h-5 mr-3 flex items-center justify-center transition-colors"
                                  [class]="activeView().id === view.id ? 'text-[#D4AF37]' : 'text-slate-500 group-hover:text-white'"
                                  [innerHTML]="getIcon(view.icon)"></span>
                            {{ 'NAV.' + view.id | translate }}
                        </div>
                        
                        <!-- Lock / Tier indicator -->
                        <div class="flex items-center space-x-2 ml-2">
                            @if (isLocked(view)) {
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 text-slate-600"><path fill-rule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clip-rule="evenodd" /></svg>
                            }
                            @if (view.featureId) {
                                <span class="w-2 h-2 rounded-full shadow-sm" [class]="getTierIndicatorClass(view.featureId)"></span>
                            }
                        </div>
                    </a>
                }
            </div>
        </div>

        <!-- Administration (Visible only for Admins) -->
        @if (userRole() === 'admin') {
            <div class="pt-6">
                <div class="px-3 pb-3">
                    <span class="text-[10px] font-bold text-purple-400 uppercase tracking-widest">Administration</span>
                </div>
                <div class="space-y-1">
                    @for (view of adminViews; track view.id) {
                        <a (click)="changeView(view)"
                        class="group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg cursor-pointer transition-colors border border-transparent"
                        [class]="activeView().id === view.id 
                            ? 'bg-purple-900/30 text-purple-300 border-purple-500/20' 
                            : 'text-slate-400 hover:text-white hover:bg-white/5'"
                        [attr.data-debug-id]="'nav-admin-' + view.id">
                        <span class="w-5 h-5 mr-3 flex items-center justify-center text-purple-500 group-hover:text-purple-300" [innerHTML]="getIcon(view.icon)"></span>
                        {{ view.title }}
                        </a>
                    }
                </div>
            </div>
        }
      </nav>

      <!-- Footer User Profile -->
      <div class="px-4 py-4 border-t border-white/10 flex-shrink-0 bg-black/20 backdrop-blur-sm">
        <div class="flex items-center cursor-pointer group/profile" (click)="onOpenSettings()" data-debug-id="nav-profile-settings">
            <div class="w-9 h-9 rounded-full bg-gradient-to-br from-slate-700 to-slate-900 text-white flex items-center justify-center font-bold mr-3 shadow-md border border-white/10 overflow-hidden transition-all duration-300 group-hover/profile:border-[#D4AF37]/50"
                 [class.from-purple-900.to-purple-700]="userRole() === 'admin'"
                 [class.from-yellow-700.to-yellow-900]="userRole() === 'owner'"
                 [class.ring-2.ring-yellow-500.ring-offset-2.ring-offset-slate-900]="userRole() === 'owner'">
                @if (userAvatar()) {
                    <img [src]="userAvatar()" class="w-full h-full object-cover" />
                } @else {
                    {{ userName().charAt(0) }}
                }
            </div>
            <div class="overflow-hidden flex-1">
                <p class="text-sm font-bold text-slate-200 truncate group-hover/profile:text-[#D4AF37] transition-colors">{{ userName() }}</p>
                <div class="flex items-center text-xs mt-0.5">
                    <span class="w-1.5 h-1.5 rounded-full mr-2 shadow-sm" [class]="getTierIndicatorClass(userPlan())"></span>
                    <span class="font-semibold" [class]="getPlanColor()">{{ displayPlanName() }}</span>
                    
                    @if(userRole() === 'admin') {
                        <span class="bg-purple-900/50 text-purple-300 border border-purple-500/30 text-[9px] px-1.5 py-0.5 rounded-full ml-2 uppercase font-mono font-bold">Admin</span>
                    } @else if(userRole() === 'owner') {
                        <span class="bg-yellow-900/50 text-yellow-300 border border-yellow-500/30 text-[9px] px-1.5 py-0.5 rounded-full ml-2 uppercase font-mono font-bold shadow-[0_0_8px_rgba(234,179,8,0.2)]">Owner</span>
                    } @else if(userRole() === 'property_manager') {
                        <span class="bg-blue-900/50 text-blue-300 border border-blue-500/30 text-[9px] px-1.5 py-0.5 rounded-full ml-2 uppercase font-mono font-bold">Manager</span>
                    } @else if(userRole() === 'supplier') {
                        <span class="bg-green-900/50 text-green-300 border border-green-500/30 text-[9px] px-1.5 py-0.5 rounded-full ml-2 uppercase font-mono font-bold">Supplier</span>
                    }
                </div>
            </div>
            <div class="opacity-0 group-hover/profile:opacity-100 transition-opacity">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-4 h-4 text-[#D4AF37]">
                    <path fill-rule="evenodd" d="M7.84 4.51a.75.75 0 0 1 .2 1.04l-3.26 4.7a.75.75 0 0 1-1.23-.01L1.03 6.94a.75.75 0 0 1 1.13-.98l1.79 2.05L6.8 4.31a.75.75 0 0 1 1.04-.2ZM10.75 4a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-1.5 0V4.75A.75.75 0 0 1 10.75 4ZM15.25 4a.75.75 0 0 1 .75.75v10.5a.75.75 0 0 1-1.5 0V4.75A.75.75 0 0 1 15.25 4Z" clip-rule="evenodd" />
                </svg>
            </div>
        </div>
        <button (click)="onLogout()" class="w-full mt-4 text-left flex items-center px-3 py-2 text-xs font-medium rounded-md text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
                data-debug-id="nav-logout">
            <span class="w-4 h-4 mr-2 flex items-center justify-center" [innerHTML]="getIcon('logout')"></span>
            {{ 'SIDEBAR.Logout' | translate }}
        </button>
      </div>
    </aside>
  `
})
export class SidebarComponent {
    activeView = input.required<View>();
    userPlan = input.required<string>();
    userName = input.required<string>();
    userRole = input.required<UserRole>();
    userAvatar = input<string | undefined>();
    properties = input.required<Property[]>();
    viewChange = output<View>();
    logout = output<void>();
    openSettings = output<void>();

    public store = inject(SessionStore); // Injected to resolve badges and phases
    private sanitizer: DomSanitizer = inject(DomSanitizer);
    private translationService = inject(TranslationService);

    constructor() {
        console.log('[Sidebar] Component initialized');
    }

    isPropertyDropdownOpen = signal<boolean>(false);

    selectedProperty = computed(() => {
        const propName = this.activeView().propertyName;
        const props = this.properties();
        if (!props || props.length === 0) return null;

        if (!propName) {
            return props[0];
        }
        return props.find(p => p.name === propName) ?? props[0];
    });

    mainViews: View[] = [
        { id: 'dashboard', title: 'Bienvenue', icon: 'home' },
        { id: 'global-dashboard', title: 'Tableau de bord', icon: 'dashboard', featureId: 'analytics' },
        { id: 'my-calendars', title: 'Mes Calendriers', icon: 'calendar' },
    ];

    trainingViews: View[] = [
        { id: 'wheel', title: 'Ma Roue de l\'Hôte', icon: 'wheel', featureId: 'wheel' },
        { id: 'training', title: 'Formations', icon: 'training', featureId: 'training' }
    ];

    supportViews: View[] = [
        { id: 'support', title: 'Support', icon: 'support' },
    ];

    adminViews: View[] = [
        { id: 'admin-users', title: 'Utilisateurs', icon: 'users' },
        { id: 'admin-debug', title: 'Debug Console', icon: 'bug' }
    ];

    private readonly icons: Record<string, string> = {
        home: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5"><path fill-rule="evenodd" d="M9.293 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 17 10.414V18a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-7.586a1 1 0 0 1 .293-.707l7-7Z" clip-rule="evenodd" /></svg>`,
        dashboard: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5"><path d="M7 3a1 1 0 0 0-1 1v12a1 1 0 1 0 2 0V4a1 1 0 0 0-1-1ZM13 5a1 1 0 0 0-1 1v10a1 1 0 1 0 2 0V6a1 1 0 0 0-1-1Z" /><path fill-rule="evenodd" d="M3 9a1 1 0 0 1 1-1h.5a.5.5 0 0 0 .5-.5V6a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1.5a.5.5 0 0 0 .5.5H9a1 1 0 1 1 0 2H7.5a.5.5 0 0 0-.5.5V14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-1.5a.5.5 0 0 0-.5-.5H3a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1Zm12 0a1 1 0 0 1 1-1h.5a.5.5 0 0 0 .5-.5V6a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1.5a.5.5 0 0 0 .5.5H9a1 1 0 1 1 0 2h-1.5a.5.5 0 0 0-.5.5V14a1 1 0 0 1-1 1h-1a1 1 0 0 1-1-1v-1.5a.5.5 0 0 0-.5-.5H15a1 1 0 0 1 0-2Z" clip-rule="evenodd" /></svg>`,
        wheel: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5"><path d="M16.313 5.422a7.5 7.5 0 0 1 0 9.156 1 1 0 0 0-1.24 1.562 9.5 9.5 0 0 0 0-12.28 1 1 0 0 0 1.24 1.562ZM18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0ZM5.5 10a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0Z" /><path d="M10 6.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Z" /></svg>`,
        logout: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5"><path fill-rule="evenodd" d="M3 4.25A2.25 2.25 0 0 1 5.25 2h5.5A2.25 2.25 0 0 1 13 4.25v2a.75.75 0 0 1-1.5 0v-2a.75.75 0 0 0-.75-.75h-5.5a.75.75 0 0 0-.75.75v11.5c0 .414.336.75.75.75h5.5a.75.75 0 0 0 .75-.75v-2a.75.75 0 0 1 1.5 0v2A2.25 2.25 0 0 1 10.75 18h-5.5A2.25 2.25 0 0 1 3 15.75V4.25Z" clip-rule="evenodd" /><path fill-rule="evenodd" d="M19 10a.75.75 0 0 0-.75-.75H8.75a.75.75 0 0 0 0 1.5h9.5a.75.75 0 0 0 .75-.75Z" clip-rule="evenodd" /><path fill-rule="evenodd" d="M15.28 6.22a.75.75 0 0 0-1.06 1.06L16.44 9.5H8.75a.75.75 0 0 0 0 1.5h7.69l-2.22 2.22a.75.75 0 1 0 1.06 1.06l3.5-3.5a.75.75 0 0 0 0-1.06l-3.5-3.5Z" clip-rule="evenodd" /></svg>`,
        support: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5"><path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8.5-2.5a.75.75 0 0 1 1.5 0v.5c0 .534.213.984.57 1.332l.716.67c.5.471.814 1.12.814 1.849a3.5 3.5 0 0 1-7 0c0-.73.314-1.378.814-1.849l.716-.67A1.99 1.99 0 0 0 9.5 8v-.5a.75.75 0 0 1 .75-.75Z M10 15a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clip-rule="evenodd" /></svg>`,
        property: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5"><path d="M5.5 10.5a2.5 2.5 0 1 1 5 0 2.5 2.5 0 0 1-5 0Z" /><path fill-rule="evenodd" d="m.842 6.417 5.694 2.135a.75.75 0 0 0 .868-.14l5.695-4.272a.75.75 0 0 1 .983-.026l5.043 3.782a.75.75 0 0 1 .16.945l-2.424 4.31a.75.75 0 0 1-1.012.316l-5.74-2.152a.75.75 0 0 0-.868.14l-5.695 4.272a.75.75 0 0 1-.983.026L.99 11.62a.75.75 0 0 1-.148-.945L3.266 6.36a.75.75 0 0 1 1.012-.316l.011.004Z" clip-rule="evenodd" /></svg>`,
        widgets: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5"><path d="M3 4.75A.75.75 0 0 1 3.75 4h4.5a.75.75 0 0 1 0 1.5h-4.5A.75.75 0 0 1 3 4.75ZM3 9.75A.75.75 0 0 1 3.75 9h4.5a.75.75 0 0 1 0 1.5h-4.5A.75.75 0 0 1 3 9.75ZM3 14.75A.75.75 0 0 1 3.75 14h4.5a.75.75 0 0 1 0 1.5h-4.5A.75.75 0 0 1 3 14.75ZM9.75 4a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5ZM9.75 9a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5ZM9.75 14a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z" /></svg>`,
        concierge: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5"><path d="M7 4a3 3 0 0 1 6 0v6a3 3 0 1 1-6 0V4ZM5.25 4a.75.75 0 0 0-1.5 0v6a4.5 4.5 0 1 0 9 0V4a.75.75 0 0 0-1.5 0v6a3 3 0 1 1-6 0V4Z" /></svg>`,
        settings: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5"><path fill-rule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 0 1-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 0 1 .947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 0 1-2.287-.947ZM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clip-rule="evenodd" /></svg>`,
        users: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5"><path d="M7 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM14.5 9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM1.615 16.428a1.224 1.224 0 0 1-.569-1.175 6.002 6.002 0 0 1 11.532-2.405 1.968 1.968 0 0 1 1.45 2.318c-.81 3.074-2.474 4.463-5.494 4.463-2.178 0-4.653-.642-6.919-3.201ZM19.777 15.277a1.968 1.968 0 0 0-1.64-2.363 6.58 6.58 0 0 0-3.41-1.302 7.36 7.36 0 0 1-.409 3.078c.156.058.316.128.478.214.616.33 2.987 1.761 2.144 5.096h.002c.932 0 1.908-.481 2.835-3.042V16.96a1.223 1.223 0 0 0-.001-1.683Z" /></svg>`,
        info: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5"><path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z" clip-rule="evenodd" /></svg>`,
        training: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5"><path d="M10 1a6 6 0 0 0-3.815 10.631C7.237 12.5 8 13.443 8 14.456v.644a.75.75 0 0 0 .572.729 6.016 6.016 0 0 0 2.856 0A.75.75 0 0 0 12 15.1v-.644c0-1.013.762-1.957 1.815-2.825A6 6 0 0 0 10 1ZM8.863 17.414a.75.75 0 0 0-.226 1.483 9.001 9.001 0 0 0 2.726 0 .75.75 0 0 0-.226-1.483 7.5 7.5 0 0 1-2.274 0Z" /></svg>`,
        calendar: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5"><path fill-rule="evenodd" d="M5.75 2a.75.75 0 0 1 .75.75V4h7V2.75a.75.75 0 0 1 1.5 0V4h.25A2.75 2.75 0 0 1 18 6.75v8.5A2.75 2.75 0 0 1 15.25 18H4.75A2.75 2.75 0 0 1 2 15.25v-8.5A2.75 2.75 0 0 1 4.75 4H5V2.75A.75.75 0 0 1 5.75 2Zm-1 5.5c-.69 0-1.25.56-1.25 1.25v6.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25v-6.5c0-.69-.56-1.25-1.25-1.25H4.75Z" clip-rule="evenodd" /></svg>`,
        calculator: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5"><path fill-rule="evenodd" d="M3.75 2A1.75 1.75 0 0 0 2 3.75v12.5c0 .966.784 1.75 1.75 1.75h12.5A1.75 1.75 0 0 0 18 16.25V3.75A1.75 1.75 0 0 0 16.25 2H3.75ZM6 8V6h3v2H6Zm0 2.5v2h3v-2H6Zm0 5v2h3v-2H6Zm5-5v-1.55c.34-.09.673-.204 1-.336v1.886h2V10.5h1.25a.75.75 0 0 1 0 1.5h-1.25v2h1.25a.75.75 0 0 1 0 1.5H13v-1.5h-2ZM11 6v2h3V6h-3Z" clip-rule="evenodd" /></svg>`,
        bug: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5"><path fill-rule="evenodd" d="M10 2a1 1 0 0 1 1 1v1.323l3.954 1.582 1.599-.8a1 1 0 0 1 1.486 1.125l-2.001 5.097 2.01 4.757a1 1 0 0 1-1.353 1.258l-8.695-4.524-8.695 4.524a1 1 0 0 1-1.353-1.258l2.01-4.757-2.001-5.097a1 1 0 0 1 1.486-1.125l1.6-.8L9 4.323V3a1 1 0 0 1 1-1Z" clip-rule="evenodd" /></svg>`,
        bookmark: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5"><path d="M10 2c-1.716 0-3.408.106-5.07.31C3.806 2.45 3 3.414 3 4.517V17.25a.75.75 0 0 0 1.075.676L10 15.08l5.925 2.846A.75.75 0 0 0 17 17.25V4.517c0-1.103-.806-2.068-1.93-2.207A41.403 41.403 0 0 0 10 2Z" /></svg>`,
        book: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5"><path d="M10.75 16.82A7.462 7.462 0 0 1 15 15.5c.71 0 1.396.098 2.046.282A.75.75 0 0 0 18 15.06v-11a.75.75 0 0 0-.546-.721A9.006 9.006 0 0 0 15 3a8.963 8.963 0 0 0-4.25 1.065V16.82ZM9.25 4.065A8.963 8.963 0 0 0 5 3c-.85 0-1.673.118-2.454.339A.75.75 0 0 0 2 4.06v11a.75.75 0 0 0 .954.721A7.506 7.506 0 0 1 5 15.5c1.579 0 3.042.487 4.25 1.32V4.065Z" /></svg>`,
        globe: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" class="w-5 h-5"><path fill-rule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-1.503.204A6.5 6.5 0 1 0 4.147 9.191c.423.048.85.098 1.279.15C7.37 9.638 9.3 10 10 10c.463 0 1.2-.19 2.2-.453a28.048 28.048 0 0 1 4.297-.343ZM7.779 7.379A2 2 0 0 0 9.75 9a.75.75 0 0 1 0 1.5A3.5 3.5 0 0 1 6.25 7a.75.75 0 0 1 1.529-.121ZM13.25 7c.022.277.022.557 0 .834a.75.75 0 0 1-1.496-.084 2 2 0 0 0-.004-.75.75.75 0 1 1 1.5 0Z" clip-rule="evenodd" /></svg>`
    };

    getIcon(id: string): SafeHtml {
        const iconSvg = this.icons[id] || id;
        return this.sanitizer.bypassSecurityTrustHtml(iconSvg);
    }

    getBadge(featureId: string) {
        return this.store.getFeatureBadge(featureId);
    }

    // New Helper to check permission
    isLocked(view: View): boolean {
        try {
            // 1. Check feature lock if applicable
            if (view.featureId && !this.store.hasFeature(view.featureId)) {
                return true;
            }

            // 2. Check Plan Lock
            if (view.requiredTier) {
                return this.store.userTierRank() < this.store.getTierRank(view.requiredTier);
            }

            return false;
        } catch (e) {
            console.error('[Sidebar] Error in isLocked for view:', view.id, e);
            return false;
        }
    }

    getViewsForPhase(views: View[], phase: string): View[] {
        return views.filter(v => v.phase === phase);
    }

    getTierIndicatorClass(tier: string): string {
        return this.store.getTierClass(tier);
    }

    displayPlanName = computed(() => {
        const tier = this.userPlan();
        return this.translationService.translate(this.store.getTierTranslationKey(tier));
    });

    getPlanColor = computed(() => {
        const tier = this.userPlan();
        const tierId = this.store.normalizeTierId(tier);

        switch (tierId) {
            case 'TIER_1': return 'text-amber-500';
            case 'TIER_2': return 'text-slate-400';
            case 'TIER_3': return 'text-yellow-400';
            default: return 'text-slate-500';
        }
    });

    changeView(view: View, propertyName?: string): void {
        if (propertyName) {
            this.viewChange.emit({ ...view, propertyName });
        } else {
            this.viewChange.emit(view);
        }
    }

    onLogout(): void {
        this.logout.emit();
    }

    togglePropertyDropdown(): void {
        this.isPropertyDropdownOpen.update(v => !v);
    }

    onOpenSettings(): void {
        console.log('[Sidebar] onOpenSettings clicked');
        this.openSettings.emit();
    }

    selectProperty(property: Property): void {
        this.isPropertyDropdownOpen.set(false);
        const manageView = property.subViews.find(v => v.id === 'manage-property') || property.subViews[0];
        // Check lock on first available view if managed view is locked? 
        // For simplicity, we assume 'manage-property' is always available or we check lock inside changeView
        this.changeView(manageView, property.name);
    }

    createProperty(): void {
        this.isPropertyDropdownOpen.set(false);
        this.viewChange.emit({ id: 'create-property', title: 'Nouvelle Propriété', icon: 'property' });
    }
}