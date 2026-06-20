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
  template: `
    <section class="page">
      <header class="page-header">
        <h1>Eventos</h1>
        <a pButton routerLink="/events/create" icon="pi pi-plus" label="Crear evento"></a>
      </header>

      <p-card styleClass="filters">
        <form [formGroup]="filterForm" class="form-grid">
          <div class="field">
            <label for="title">Buscar por título</label>
            <input pInputText id="title" formControlName="title" placeholder="Ej. Conferencia" />
          </div>

          <div class="field">
            <label>Tipo</label>
            <p-select
              formControlName="type"
              [options]="types"
              placeholder="Todos"
              [showClear]="true"
            />
          </div>

          <div class="field">
            <label>Estado</label>
            <p-select
              formControlName="status"
              [options]="statuses"
              placeholder="Todos"
              [showClear]="true"
            />
          </div>

          <div class="field">
            <label>Venue</label>
            <p-select
              formControlName="venueId"
              [options]="venueService.venues()"
              optionLabel="name"
              optionValue="id"
              placeholder="Todos"
              [showClear]="true"
            />
          </div>

          <div class="filter-actions span-2">
            <p-button type="button" icon="pi pi-search" label="Filtrar" (onClick)="applyFilters()" />
            <p-button type="button" label="Limpiar" [text]="true" (onClick)="reset()" />
          </div>
        </form>
      </p-card>

      @if (eventService.loading()) {
        <p-progressBar mode="indeterminate" [style]="{ height: '6px' }" />
      }

      @if (!eventService.loading() && eventService.events().length === 0) {
        <p class="muted">No se encontraron eventos con esos criterios.</p>
      }

      <div class="cards-grid">
        @for (ev of eventService.events(); track ev.id) {
          <p-card [header]="ev.title" [subheader]="ev.venueName">
            <p class="muted description">{{ ev.description }}</p>
            <div class="tags">
              <p-tag [value]="ev.type" severity="info" />
              <p-tag [value]="ev.status" [severity]="statusSeverity(ev.status)" />
            </div>
            <p class="meta">
              <i class="pi pi-clock"></i>
              {{ ev.startDate | date: 'short' }} → {{ ev.endDate | date: 'short' }}
            </p>
            <p class="meta">
              <i class="pi pi-tag"></i>
              <strong>{{ ev.price | currency: 'USD' }}</strong>
            </p>

            <div class="occupancy">
              <div class="occupancy-track">
                <div
                  class="occupancy-fill"
                  [class.high]="occupancy(ev) >= 80"
                  [style.width.%]="occupancy(ev)"
                ></div>
              </div>
              <small class="muted">
                {{ ev.availableTickets }} / {{ ev.maxCapacity }} disponibles · {{ occupancy(ev) }}% ocupado
              </small>
            </div>

            <ng-template pTemplate="footer">
              <a
                pButton
                [routerLink]="['/events', ev.id, 'reserve']"
                icon="pi pi-ticket"
                label="Reservar"
                size="small"
                [class.p-disabled]="ev.status !== 'Activo'"
              ></a>
            </ng-template>
          </p-card>
        }
      </div>
    </section>
  `,
  styles: [
    `
      :host ::ng-deep .filters {
        margin-bottom: 16px;
      }
      .filter-actions {
        display: flex;
        align-items: flex-end;
        gap: 8px;
      }
      .tags {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-bottom: 8px;
      }
      .description {
        margin-top: 0;
      }
      .meta {
        display: flex;
        align-items: center;
        gap: 6px;
        margin: 4px 0;
      }
    `,
  ],
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
