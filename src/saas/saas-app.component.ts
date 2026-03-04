
import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SidebarComponent } from './sidebar.component';
import { DashboardViewComponent } from './views/dashboard-view.component';
import { HostWheelViewComponent } from './views/host-wheel-view.component';
import { PhaseViewComponent } from './views/angle-view.component';
import { ContextData, ReportData, Scores, UserRole, View, Property } from '../types';
import { PhasesMenuComponent } from './angles-menu.component';
import { WelcomeBookletViewComponent } from './views/welcome-booklet-view.component';
import { WidgetLibraryViewComponent } from './views/widget-library-view.component';
import { VocalConciergeViewComponent } from './views/vocal-concierge-view.component';
import { GlobalDashboardViewComponent } from './views/global-dashboard-view.component';
import { TrainingViewComponent } from './views/training-view.component';
import { HostInfoViewComponent } from './views/host-info-view.component';
import { PropertyViewComponent } from './views/property-view.component';

import { AdminUsersViewComponent } from './views/admin-users-view.component';
import { AdminDebugViewComponent } from './views/admin-debug-view.component';
import { HostRepository } from '../services/host-repository.service';
import { SessionStore } from '../state/session.store';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslationService } from '../services/translation.service';
import { TranslatePipe } from '../pipes/translate.pipe';
import { NotificationBellComponent } from './components/notification-bell.component';
import { NotificationCenterComponent } from './components/notification-center.component';
import { NotificationService } from '../services/notification.service';
import { ProfileModalComponent } from './components/profile-settings-modal.component';
import { CalendarToolComponent } from './features/legacy/calendar-tool/components/calendar-tool.component';

import { ProfitabilityViewComponent } from './views/profitability-view.component';

@Component({
  selector: 'saas-app',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    SidebarComponent,
    DashboardViewComponent,
    HostWheelViewComponent,
    PhaseViewComponent,
    PhasesMenuComponent,
    WelcomeBookletViewComponent,
    WidgetLibraryViewComponent,
    VocalConciergeViewComponent,
    GlobalDashboardViewComponent,
    TrainingViewComponent,
    HostInfoViewComponent,
    PropertyViewComponent,
    ProfitabilityViewComponent,

    AdminUsersViewComponent,
    AdminDebugViewComponent,
    TranslatePipe,
    NotificationBellComponent,
    NotificationCenterComponent,
    ProfileModalComponent,
    CalendarToolComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './saas-app.component.html',
})
export class SaaSAppComponent implements OnInit {
  // Inputs from Global Store
  contextData = input.required<ContextData>();
  scores = input.required<Scores>();
  reportData = input.required<ReportData>();
  logout = output<void>();

  // Data Layer Injection
  private repository = inject(HostRepository);
  protected store = inject(SessionStore);
  private fb: FormBuilder = inject(FormBuilder);
  translationService = inject(TranslationService);
  notifService = inject(NotificationService);

  // Local State
  initialView: View = { id: 'dashboard', title: 'Bienvenue', icon: 'home' };
  activeView = signal<View>(this.initialView);
  properties = signal<Property[]>([]);

  // Debug: Available Tiers for Selector
  availableTiers = [
    { id: 'TIER_0', name: 'Freemium' },
    { id: 'TIER_1', name: 'Bronze' },
    { id: 'TIER_2', name: 'Silver' },
    { id: 'TIER_3', name: 'Gold' }
  ];
  availableRoles = ['user', 'admin', 'supplier', 'property_manager', 'owner'];

  onPlanChange(plan: string): void {
    console.log('[SaaSApp] Switching Plan to:', plan);
    this.store.setPlan(plan as any);
  }

  onRoleChange(role: string): void {
    console.log('[SaaSApp] Switching Role to:', role);
    this.store.setRole(role as any);
  }

  // Computed values
  userRole = computed<UserRole>(() => this.store.userProfile()?.role || 'user');
  userName = computed<string>(() => this.store.userProfile()?.full_name || 'Hôte');
  userPlan = computed<string>(() => this.store.userProfile()?.plan || this.reportData().recommendedPlan);
  userAvatar = computed<string | undefined>(() => this.store.userProfile()?.avatar_url);

  // private readonly angleIds = ['DIM_MKT', 'DIM_EXP', 'DIM_OPS', 'DIM_PRICING', 'DIM_LEGAL', 'mindset'];
  isAngleView = computed(() => this.activeView().id.startsWith('PH_'));

  selectedPropertyDetails = computed(() => {
    const propName = this.activeView().propertyName;
    const props = this.properties();
    if (!props || props.length === 0) return null;

    if (!propName) {
      return props[0];
    }
    return props.find(p => p.name === propName) || props[0];
  });

  // Create Property Form
  createPropertyForm: FormGroup;
  isCreatingProperty = signal(false);
  isProfileModalOpen = signal(false);

  constructor() {
    this.createPropertyForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]]
    });

    // Global helper for the modal to close itself
    (window as any).closeProfileModal = () => {
      this.isProfileModalOpen.set(false);
    };
  }

  openProfileModal() {
    console.log('[SaaSApp] openProfileModal called');
    this.isProfileModalOpen.set(true);
  }

  async ngOnInit() {
    await this.refreshProperties();

    // Redirect admin to admin view immediately
    if (this.userRole() === 'admin') {
      this.activeView.set({ id: 'admin-users', title: 'Utilisateurs', icon: 'users' });
    }
  }

  async refreshProperties() {
    const props = await this.repository.getProperties();
    this.properties.set(props);
  }

  onViewChange(view: View): void {
    if (view.id === 'create-property') {
      this.createPropertyForm.reset();
      this.isCreatingProperty.set(true);
    } else {
      this.isCreatingProperty.set(false);
    }

    // UX Improvement: Preserve or Default property when switching angles/tabs
    let targetPropertyName = view.propertyName;

    // 1. If no specific property requested, try to keep the current one
    if (!targetPropertyName) {
      targetPropertyName = this.activeView().propertyName;
    }

    // 2. If still no property and we are going to a Phase view, try to pick the first one
    // This ensures components like 'Marketing Description' have a context to load data.
    if (!targetPropertyName && view.id.startsWith('PH_')) {
      const props = this.properties();
      if (props.length > 0) {
        targetPropertyName = props[0].name;
      }
    }

    // 3. Update the view
    if (targetPropertyName && view.id.startsWith('PH_')) {
      this.activeView.set({ ...view, propertyName: targetPropertyName });
    } else {
      this.activeView.set(view);
    }
  }

  goToPropertyHome(): void {
    const propertyName = this.activeView().propertyName;
    if (propertyName) {
      const property = this.properties().find(p => p.name === propertyName);
      if (property) {
        const manageView = property.subViews.find(v => v.id === 'manage-property') || property.subViews[0];
        this.onViewChange({ ...manageView, propertyName: property.name });
      }
    }
  }

  onLogout(): void {
    this.logout.emit();
  }

  async submitCreateProperty() {
    if (this.createPropertyForm.valid && this.store.userProfile()) {
      const name = this.createPropertyForm.value.name;
      try {
        await this.repository.createProperty(this.store.userProfile()!.id, name);
        await this.refreshProperties();

        // Switch to the new property
        const newProp = this.properties().find(p => p.name === name);
        if (newProp) {
          const manageView = newProp.subViews[0];
          this.onViewChange({ ...manageView, propertyName: newProp.name });
        }

      } catch (e) {
        alert("Erreur lors de la création de la propriété.");
        console.error(e);
      }
    }
  }
}