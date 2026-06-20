import { Injectable, inject, signal } from '@angular/core';
import {
  HubConnection,
  HubConnectionBuilder,
  HubConnectionState,
  LogLevel,
} from '@microsoft/signalr';
import { environment } from '../../../environments/environment';
import { EventRealtimeUpdate, EventService } from './event.service';
import { EventDto } from '../models/event.model';

/**
 * Cliente SignalR. Mantiene una conexión con el hub de eventos y, al recibir un push,
 * actualiza los signals de EventService para que la UI refleje la disponibilidad en vivo.
 */
@Injectable({ providedIn: 'root' })
export class RealtimeService {
  private readonly eventService = inject(EventService);
  private connection?: HubConnection;

  /** Estado de la conexión expuesto como signal para indicadores en la UI. */
  readonly connected = signal(false);

  start(): void {
    if (this.connection) {
      return;
    }

    // El hub vive en el mismo origen que la API (apiUrl termina en "/api").
    const hubUrl = environment.apiUrl.replace(/\/api\/?$/, '') + '/hubs/events';

    this.connection = new HubConnectionBuilder()
      .withUrl(hubUrl)
      .withAutomaticReconnect()
      .configureLogging(LogLevel.Warning)
      .build();

    this.connection.on('EventUpdated', (update: EventRealtimeUpdate) =>
      this.eventService.patchAvailability(update),
    );

    this.connection.on('EventCreated', (event: EventDto) => this.eventService.upsertEvent(event));

    this.connection.onreconnected(() => this.connected.set(true));
    this.connection.onreconnecting(() => this.connected.set(false));
    this.connection.onclose(() => this.connected.set(false));

    this.connection
      .start()
      .then(() => this.connected.set(true))
      .catch((err) => console.error('No se pudo conectar a SignalR:', err));
  }

  stop(): void {
    if (this.connection && this.connection.state !== HubConnectionState.Disconnected) {
      this.connection.stop();
    }
    this.connection = undefined;
    this.connected.set(false);
  }
}
