import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { SelectModule } from 'primeng/select';
import { ProgressBarModule } from 'primeng/progressbar';
import { TagModule } from 'primeng/tag';
import { EventService } from '../../../core/services/event.service';
import { OccupancyReport } from '../../../core/models/event.model';

@Component({
  selector: 'app-occupancy-report',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ReactiveFormsModule, CardModule, SelectModule, ProgressBarModule, TagModule],
  template: `
    <section class="page">
      <header class="page-header">
        <h1>Reporte de ocupación</h1>
      </header>

      <p-card>
        <div class="field full-width">
          <label>Selecciona un evento</label>
          <p-select
            [formControl]="eventControl"
            [options]="eventService.events()"
            optionLabel="title"
            optionValue="id"
            placeholder="Selecciona un evento"
            [filter]="true"
            filterBy="title"
            (onChange)="loadReport($event.value)"
            styleClass="full-width"
          />
        </div>
      </p-card>

      @if (loading()) {
        <p-progressBar mode="indeterminate" [style]="{ height: '6px', 'margin-top': '12px' }" />
      }

      @if (report(); as r) {
        <div class="stat-grid">
          <div class="stat-card">
            <div class="stat-icon"><i class="pi pi-shopping-cart"></i></div>
            <div>
              <p class="muted">Entradas vendidas</p>
              <p class="stat">{{ r.soldTickets }}</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon green"><i class="pi pi-ticket"></i></div>
            <div>
              <p class="muted">Disponibles</p>
              <p class="stat">{{ r.availableTickets }}</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon amber"><i class="pi pi-chart-pie"></i></div>
            <div>
              <p class="muted">Ocupación</p>
              <p class="stat">{{ r.occupancyPercentage }}%</p>
            </div>
          </div>
          <div class="stat-card">
            <div class="stat-icon pink"><i class="pi pi-dollar"></i></div>
            <div>
              <p class="muted">Ingresos</p>
              <p class="stat">{{ r.totalRevenue | currency: 'USD' }}</p>
            </div>
          </div>
        </div>

        <p-card>
          <div class="report-head">
            <h2>{{ r.eventTitle }}</h2>
            <p-tag [value]="r.status" [severity]="statusSeverity(r.status)" />
          </div>
          <p-progressBar [value]="r.occupancyPercentage" [style]="{ 'margin-top': '12px' }" />
          <p class="muted">
            {{ r.soldTickets }} de {{ r.maxCapacity }} entradas ({{ r.occupancyPercentage }}%)
          </p>
        </p-card>
      }
    </section>
  `,
  styles: [
    `
      h2 {
        margin: 0;
      }
      .report-head {
        display: flex;
        align-items: center;
        gap: 12px;
      }
    `,
  ],
})
export class OccupancyReportPage {
  protected readonly eventService = inject(EventService);

  protected readonly eventControl = new FormControl<string | null>(null);
  protected readonly report = signal<OccupancyReport | null>(null);
  protected readonly loading = signal(false);

  constructor() {
    this.eventService.load();
  }

  protected statusSeverity(status: OccupancyReport['status']): 'success' | 'danger' | 'secondary' {
    switch (status) {
      case 'Activo':
        return 'success';
      case 'Cancelado':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  protected loadReport(eventId: string): void {
    if (!eventId) {
      this.report.set(null);
      return;
    }
    this.loading.set(true);
    this.eventService.getOccupancyReport(eventId).subscribe({
      next: (report) => this.report.set(report),
      complete: () => this.loading.set(false),
      error: () => this.loading.set(false),
    });
  }
}
