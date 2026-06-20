import { ReservationStatus } from './enums';

export interface ReservationDto {
  id: string;
  eventId: string;
  quantity: number;
  buyerName: string;
  buyerEmail: string;
  status: ReservationStatus;
  code: string | null;
  createdAt: string;
  confirmedAt: string | null;
  cancelledAt: string | null;
}

export interface CreateReservationRequest {
  eventId: string;
  quantity: number;
  buyerName: string;
  buyerEmail: string;
}
