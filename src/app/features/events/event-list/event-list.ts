import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';
import { ProgressBarModule } from 'primeng/progressbar';
import { EventService } from '../../../core/services/event.service';
import { VenueService } from '../../../core/services/venue.service';
import { EVENT_STATUSES, EVENT_TYPES, EventStatus, EventType } from '../../../core/models/enums';
import { EventDto } from '../../../core/models/event.model';

@Component({
  selector: 'app-event-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    CardModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TagModule,
    ProgressBarModule,
  ],
  templateUrl: './event-list.html',
  styleUrl: './event-list.scss',
})
export class EventList {
  protected readonly eventService = inject(EventService);
  protected readonly venueService = inject(VenueService);
  private readonly fb = inject(FormBuilder);

  protected readonly types = EVENT_TYPES;
  protected readonly statuses = EVENT_STATUSES;

  protected readonly filterForm = this.fb.group({
    title: this.fb.control<string | null>(null),
    type: this.fb.control<EventType | null>(null),
    status: this.fb.control<EventStatus | null>(null),
    venueId: this.fb.control<number | null>(null),
  });

  constructor() {
    this.venueService.load();
    this.eventService.load();
  }

  protected occupancy(ev: EventDto): number {
    if (ev.maxCapacity <= 0) {
      return 0;
    }
    return Math.round(((ev.maxCapacity - ev.availableTickets) / ev.maxCapacity) * 100);
  }

  protected statusSeverity(status: EventStatus): 'success' | 'danger' | 'secondary' {
    switch (status) {
      case 'Activo':
        return 'success';
      case 'Cancelado':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  protected applyFilters(): void {
    this.eventService.load(this.filterForm.getRawValue());
  }

  protected reset(): void {
    this.filterForm.reset();
    this.eventService.load();
  }
}
