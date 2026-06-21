import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { EventService } from '../../core/services/event.service';
import { EventDto } from '../../core/models/event.model';

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, CardModule, ButtonModule, TagModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard {
  protected readonly eventService = inject(EventService);

  protected readonly total = computed(() => this.eventService.events().length);
  protected readonly active = computed(
    () => this.eventService.events().filter((e) => e.status === 'Activo').length,
  );
  protected readonly completed = computed(
    () => this.eventService.events().filter((e) => e.status === 'Completado').length,
  );
  protected readonly totalAvailable = computed(() =>
    this.eventService.events().reduce((sum, e) => sum + e.availableTickets, 0),
  );
  protected readonly upcoming = computed(() =>
    this.eventService
      .events()
      .filter((e) => e.status === 'Activo')
      .slice(0, 6),
  );

  protected occupancy(ev: EventDto): number {
    if (ev.maxCapacity <= 0) {
      return 0;
    }
    return Math.round(((ev.maxCapacity - ev.availableTickets) / ev.maxCapacity) * 100);
  }

  constructor() {
    this.eventService.load();
  }
}
