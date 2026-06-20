import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, finalize, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateEventRequest, EventDto, EventFilter, OccupancyReport } from '../models/event.model';
import { EventStatus } from '../models/enums';

/** Actualización en vivo recibida por SignalR. */
export interface EventRealtimeUpdate {
  eventId: string;
  availableTickets: number;
  maxCapacity: number;
  soldTickets: number;
  status: string;
}

@Injectable({ providedIn: 'root' })
export class EventService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/events`;

  readonly events = signal<EventDto[]>([]);
  readonly loading = signal(false);

  load(filter: EventFilter = {}): void {
    this.loading.set(true);
    this.http
      .get<EventDto[]>(this.baseUrl, { params: this.buildParams(filter) })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe((events) => this.events.set(events));
  }

  create(request: CreateEventRequest): Observable<EventDto> {
    return this.http
      .post<EventDto>(this.baseUrl, request)
      .pipe(tap(() => this.load()));
  }

  getOccupancyReport(eventId: string): Observable<OccupancyReport> {
    return this.http.get<OccupancyReport>(`${this.baseUrl}/${eventId}/occupancy-report`);
  }

  /** Aplica una actualización en tiempo real sobre el evento correspondiente (sin recargar la lista). */
  patchAvailability(update: EventRealtimeUpdate): void {
    this.events.update((list) =>
      list.map((e) =>
        e.id === update.eventId
          ? { ...e, availableTickets: update.availableTickets, status: update.status as EventStatus }
          : e,
      ),
    );
  }

  /** Inserta (o reemplaza) un evento recibido en vivo, manteniéndolo ordenado por fecha de inicio. */
  upsertEvent(event: EventDto): void {
    this.events.update((list) => {
      const others = list.filter((e) => e.id !== event.id);
      return [...others, event].sort((a, b) => a.startDate.localeCompare(b.startDate));
    });
  }

  private buildParams(filter: EventFilter): HttpParams {
    let params = new HttpParams();
    if (filter.type) params = params.set('type', filter.type);
    if (filter.status) params = params.set('status', filter.status);
    if (filter.venueId != null) params = params.set('venueId', filter.venueId);
    if (filter.title) params = params.set('title', filter.title);
    if (filter.startDateFrom) params = params.set('startDateFrom', filter.startDateFrom);
    if (filter.startDateTo) params = params.set('startDateTo', filter.startDateTo);
    return params;
  }
}
