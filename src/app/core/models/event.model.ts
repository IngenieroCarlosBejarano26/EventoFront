import { EventStatus, EventType } from './enums';

export interface EventDto {
  id: string;
  title: string;
  description: string;
  venueId: number;
  venueName: string;
  maxCapacity: number;
  availableTickets: number;
  startDate: string;
  endDate: string;
  price: number;
  type: EventType;
  status: EventStatus;
}

export interface CreateEventRequest {
  title: string;
  description: string;
  venueId: number;
  maxCapacity: number;
  startDate: string;
  endDate: string;
  price: number;
  type: EventType;
}

export interface EventFilter {
  type?: EventType | null;
  status?: EventStatus | null;
  venueId?: number | null;
  title?: string | null;
  startDateFrom?: string | null;
  startDateTo?: string | null;
}

export interface OccupancyReport {
  eventId: string;
  eventTitle: string;
  maxCapacity: number;
  soldTickets: number;
  availableTickets: number;
  occupancyPercentage: number;
  totalRevenue: number;
  status: EventStatus;
}
