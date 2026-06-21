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
  templateUrl: './occupancy-report.html',
  styleUrl: './occupancy-report.scss',
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
