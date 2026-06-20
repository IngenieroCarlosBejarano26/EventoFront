import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { EventService } from '../../core/services/event.service';
import { EventDto } from '../../core/models/event.model';

@Component({
  selector: 'app-dashboard',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, RouterLink, CardModule, ButtonModule, TagModule],
  template: `
    <section class="page">
      <header class="page-header">
        <div>
          <h1>Panel</h1>
          <p class="subtitle">Resumen de eventos y disponibilidad de entradas.</p>
        </div>
        <a pButton routerLink="/events/create" icon="pi pi-plus" label="Crear evento" size="small"></a>
      </header>

      <div class="stat-grid">
        <div class="stat-card">
          <div class="stat-icon"><i class="pi pi-calendar"></i></div>
          <div>
            <p class="muted">Eventos totales</p>
            <p class="stat">{{ total() }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green"><i class="pi pi-check-circle"></i></div>
          <div>
            <p class="muted">Activos</p>
            <p class="stat">{{ active() }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon amber"><i class="pi pi-flag"></i></div>
          <div>
            <p class="muted">Completados</p>
            <p class="stat">{{ completed() }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon pink"><i class="pi pi-ticket"></i></div>
          <div>
            <p class="muted">Entradas disponibles</p>
            <p class="stat">{{ totalAvailable() }}</p>
          </div>
        </div>
      </div>

      <div class="section-head">
        <h2>Próximos eventos</h2>
        <a routerLink="/events" class="see-all">Ver todos <i class="pi pi-arrow-right"></i></a>
      </div>

      @if (eventService.loading()) {
        <p class="muted">Cargando…</p>
      } @else if (upcoming().length === 0) {
        <div class="empty">
          <i class="pi pi-calendar-plus"></i>
          <p>No hay eventos próximos.</p>
          <a pButton routerLink="/events/create" icon="pi pi-plus" label="Crear el primero" size="small"></a>
        </div>
      } @else {
        <div class="cards-grid">
          @for (ev of upcoming(); track ev.id) {
            <p-card [header]="ev.title" [subheader]="ev.venueName + ' · ' + (ev.startDate | date: 'short')">
              <div class="tags">
                <p-tag [value]="ev.type" severity="info" />
                <p-tag [value]="(ev.price | currency: 'USD') ?? ''" severity="contrast" />
              </div>

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
                <div class="card-actions">
                  <a pButton [routerLink]="['/events', ev.id, 'reserve']" icon="pi pi-ticket" label="Reservar" size="small"></a>
                  <a pButton routerLink="/reports" icon="pi pi-chart-bar" label="Reporte" size="small" [outlined]="true"></a>
                </div>
              </ng-template>
            </p-card>
          }
        </div>
      }
    </section>
  `,
  styles: [
    `
      .section-head {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        margin: 8px 0 16px;
      }
      .section-head h2 {
        margin: 0;
        font-size: 1.05rem;
        font-weight: 600;
      }
      .see-all {
        color: var(--text-2);
        font-weight: 550;
        font-size: 0.85rem;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .see-all:hover {
        color: var(--text);
      }
      .tags {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      .card-actions {
        display: flex;
        gap: 8px;
      }
      .empty {
        text-align: center;
        padding: 44px 16px;
        color: var(--muted);
        border: 1px dashed var(--border-strong);
        border-radius: var(--radius);
        background: var(--surface);
      }
      .empty i {
        font-size: 1.8rem;
        color: var(--muted);
        margin-bottom: 10px;
        display: block;
      }
      .empty p {
        margin: 0 0 14px;
      }
    `,
  ],
})
export class Dashboard {
  protected readonly eventService = inject(EventService);

  protected readonly total = computed(() => this.eventService.events().length);
  protected readonly active = computed(
    () => this.eventService.events().filter((e) => e.status === 'Activo').length,
  );
  protected readonly completed = computed(
    () => this.eventService.events().filter((e) => e.status === 'Completado').length,
  );
  protected readonly totalAvailable = computed(() =>
    this.eventService.events().reduce((sum, e) => sum + e.availableTickets, 0),
  );
  protected readonly upcoming = computed(() =>
    this.eventService
      .events()
      .filter((e) => e.status === 'Activo')
      .slice(0, 6),
  );

  protected occupancy(ev: EventDto): number {
    if (ev.maxCapacity <= 0) {
      return 0;
    }
    return Math.round(((ev.maxCapacity - ev.availableTickets) / ev.maxCapacity) * 100);
  }

  constructor() {
    this.eventService.load();
  }
}
