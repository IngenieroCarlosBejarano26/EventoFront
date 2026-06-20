import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/dashboard/dashboard').then((m) => m.Dashboard),
    title: 'Dashboard | EventosVivos',
  },
  {
    path: 'events',
    loadComponent: () =>
      import('./features/events/event-list/event-list').then((m) => m.EventList),
    title: 'Eventos | EventosVivos',
  },
  {
    path: 'events/create',
    loadComponent: () =>
      import('./features/events/event-create/event-create').then((m) => m.EventCreate),
    title: 'Crear evento | EventosVivos',
  },
  {
    path: 'events/:id/reserve',
    loadComponent: () =>
      import('./features/reservations/reservation-create/reservation-create').then(
        (m) => m.ReservationCreate,
      ),
    title: 'Reservar | EventosVivos',
  },
  {
    path: 'reservations',
    loadComponent: () =>
      import('./features/reservations/reservation-manage/reservation-manage').then(
        (m) => m.ReservationManage,
      ),
    title: 'Reservas | EventosVivos',
  },
  {
    path: 'reports',
    loadComponent: () =>
      import('./features/reports/occupancy-report/occupancy-report').then(
        (m) => m.OccupancyReportPage,
      ),
    title: 'Reporte de ocupación | EventosVivos',
  },
  { path: '**', redirectTo: '' },
];
