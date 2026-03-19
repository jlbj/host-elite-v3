import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EvaluationStepComponent } from './components/evaluation-step.component';
import { ResultsStepComponent } from './components/results-step.component';
import { LandingPageComponent } from './components/landing-page.component';
import { ContextStepComponent } from './components/context-step.component';
import { SaaSAppComponent } from './saas/saas-app.component';
import { StepperComponent } from './components/stepper.component';
import { DebugTooltipComponent } from './components/debug-tooltip.component';
import { SessionStore } from './state/session.store';
import { NgxEditorModule } from 'ngx-editor';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    LandingPageComponent,
    ContextStepComponent,
    EvaluationStepComponent,
    ResultsStepComponent,
    SaaSAppComponent,
    StepperComponent,
    DebugTooltipComponent,
    NgxEditorModule
  ],
  styles: [`
    :host {
      display: block;
      width: 100%;
      min-height: 100vh;
    }
  `]
})
export class AppComponent {
  store = inject(SessionStore);

  constructor() {
    effect(() => {
      // Trigger scroll to top whenever the step changes
      const step = this.store.currentStep();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
}
