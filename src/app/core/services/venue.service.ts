import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Venue } from '../models/venue.model';

@Injectable({ providedIn: 'root' })
export class VenueService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/venues`;

  readonly venues = signal<Venue[]>([]);

  load(): void {
    this.http.get<Venue[]>(this.baseUrl).subscribe((venues) => this.venues.set(venues));
  }
}
