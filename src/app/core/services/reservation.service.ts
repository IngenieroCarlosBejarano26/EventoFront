import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { CreateReservationRequest, ReservationDto } from '../models/reservation.model';

@Injectable({ providedIn: 'root' })
export class ReservationService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/reservations`;

  create(request: CreateReservationRequest): Observable<ReservationDto> {
    // Idempotencia: una clave única por intento evita reservas duplicadas ante reintentos.
    const headers = { 'X-Idempotency-Key': crypto.randomUUID() };
    return this.http.post<ReservationDto>(this.baseUrl, request, { headers });
  }

  confirm(reservationId: string): Observable<ReservationDto> {
    return this.http.post<ReservationDto>(`${this.baseUrl}/${reservationId}/confirm`, {});
  }

  cancel(reservationId: string): Observable<ReservationDto> {
    return this.http.post<ReservationDto>(`${this.baseUrl}/${reservationId}/cancel`, {});
  }
}
