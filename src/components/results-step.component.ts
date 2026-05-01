
import { ChangeDetectionStrategy, Component, computed, input, output, SecurityContext } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { ReportData, Scores } from '../types';

@Component({
  selector: 'app-results-step',
  templateUrl: './results-step.component.html',
  styleUrls: ['./results-step.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
})
export class ResultsStepComponent {
  report = input.required<ReportData>();
  scores = input.required<Scores>();
  restart = output<void>();
  explorePlan = output<void>();

  readonly angleLabels = ['Marketing', 'Expérience', 'Opérations', 'Pricing', 'Logement', 'Légal', 'Mindset'];
  readonly size = 300;
  readonly center = this.size / 2;
  readonly levels = 5;

  radarChartPolygons = computed(() => {
    const scoresData = this.scores();
    if (!scoresData) return { grid: [], data: '' };

    const scoreOrder: (keyof Scores)[] = ['marketing', 'experience', 'operations', 'pricing', 'accomodation', 'legal', 'mindset'];
    const scoresArray = scoreOrder.map(key => scoresData[key]);
    
    const gridPolygons = [];
    for (let i = this.levels; i > 0; i--) {
        gridPolygons.push(this.getPolygonPoints(Array(7).fill((10 / this.levels) * i)));
    }

    const dataPolygon = this.getPolygonPoints(scoresArray);
    return { grid: gridPolygons, data: dataPolygon };
  });
  
  radarChartLabels = computed(() => {
    return this.angleLabels.map((label, i) => {
      const angle = (Math.PI / 2) - (2 * Math.PI * i) / 7;
      const radius = this.center * 1.1;
      return {
        x: this.center + radius * Math.cos(angle),
        y: this.center - radius * Math.sin(angle),
        text: label,
      };
    });
  });

  private getPolygonPoints(data: number[]): string {
    const maxRadius = this.center * 0.8;
    return data.map((value, i) => {
      const angle = (Math.PI / 2) - (2 * Math.PI * i) / 7;
      const radius = (value / 10) * maxRadius;
      const x = this.center + radius * Math.cos(angle);
      const y = this.center - radius * Math.sin(angle);
      return `${x},${y}`;
    }).join(' ');
  }

  getPlanClasses(plan: string): string {
    const isRecommended = this.report().recommendedPlan === plan;
    const base = 'px-6 py-2 rounded-full text-sm font-semibold';
    if (isRecommended) {
        return `${base} bg-slate-900 text-white`;
    }
    return `${base} bg-gray-200 text-gray-800`;
  }
  
  onRestartClick(): void {
    this.restart.emit();
  }

  onExplorePlanClick(): void {
    this.explorePlan.emit();
  }
}