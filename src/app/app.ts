import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { RealtimeService } from './core/services/realtime.service';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, MenubarModule, ButtonModule, ToastModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly realtime = inject(RealtimeService);

  protected readonly navItems: MenuItem[] = [
    { label: 'Dashboard', icon: 'pi pi-home', routerLink: '/', routerLinkActiveOptions: { exact: true } },
    { label: 'Eventos', icon: 'pi pi-calendar', routerLink: '/events' },
    { label: 'Crear evento', icon: 'pi pi-plus-circle', routerLink: '/events/create', routerLinkActiveOptions: { exact: true } },
    { label: 'Reservas', icon: 'pi pi-ticket', routerLink: '/reservations' },
    { label: 'Reportes', icon: 'pi pi-chart-bar', routerLink: '/reports' },
  ];
}
