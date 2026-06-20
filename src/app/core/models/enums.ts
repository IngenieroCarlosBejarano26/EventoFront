export type EventType = 'Conferencia' | 'Taller' | 'Concierto';
export type EventStatus = 'Activo' | 'Cancelado' | 'Completado';
export type ReservationStatus = 'PendientePago' | 'Confirmada' | 'Cancelada' | 'Perdida';

export const EVENT_TYPES: EventType[] = ['Conferencia', 'Taller', 'Concierto'];
export const EVENT_STATUSES: EventStatus[] = ['Activo', 'Cancelado', 'Completado'];

export const RESERVATION_STATUS_LABELS: Record<ReservationStatus, string> = {
  PendientePago: 'Pendiente de pago',
  Confirmada: 'Confirmada',
  Cancelada: 'Cancelada',
  Perdida: 'Perdida (penalización)',
};
