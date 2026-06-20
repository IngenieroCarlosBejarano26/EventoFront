import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { TagModule } from 'primeng/tag';
import { EventService } from '../../../core/services/event.service';
import { ReservationService } from '../../../core/services/reservation.service';
import { ReservationDto } from '../../../core/models/reservation.model';

@Component({
  selector: 'app-reservation-create',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    CardModule,
    ButtonModule,
    InputTextModule,
    InputNumberModule,
    TagModule,
  ],
  template: `
    <section class="page">
      <header class="page-header">
        <h1>Reservar entradas</h1>
        <a pButton routerLink="/events" icon="pi pi-arrow-left" label="Volver" [text]="true"></a>
      </header>

      @if (event(); as ev) {
        <p-card [header]="ev.title" [subheader]="ev.venueName + ' · ' + (ev.startDate | date: 'short')" styleClass="summary">
          <p>
            {{ ev.availableTickets }} entradas disponibles ·
            <strong>{{ ev.price | currency: 'USD' }}</strong>
          </p>
        </p-card>
      }

      @if (!result()) {
        <p-card>
          <form [formGroup]="form" (ngSubmit)="submit()" class="form-grid">
            <div class="field">
              <label for="buyerName">Nombre del comprador</label>
              <input pInputText id="buyerName" formControlName="buyerName" />
            </div>

            <div class="field">
              <label for="buyerEmail">Email</label>
              <input pInputText id="buyerEmail" type="email" formControlName="buyerEmail" />
              @if (form.controls.buyerEmail.touched && form.controls.buyerEmail.invalid) {
                <small class="error">Email inválido.</small>
              }
            </div>

            <div class="field">
              <label>Cantidad</label>
              <p-inputNumber formControlName="quantity" [min]="1" [showButtons]="true" />
            </div>

            <div class="actions span-2">
              <p-button type="submit" icon="pi pi-ticket" label="Reservar" [disabled]="submitting()" />
            </div>
          </form>
        </p-card>
      } @else {
        <p-card styleClass="result">
          <i class="pi pi-check-circle ok"></i>
          <h2>Reserva creada</h2>
          <p>Estado: <p-tag [value]="result()!.status" severity="warn" /></p>
          <p>ID de reserva: <code>{{ result()!.id }}</code></p>
          <p class="muted">
            Guarda este ID para confirmar el pago o cancelar desde la sección Reservas.
          </p>
          <a pButton routerLink="/reservations" label="Ir a gestión de reservas"></a>
        </p-card>
      }
    </section>
  `,
  styles: [
    `
      :host ::ng-deep .summary {
        margin-bottom: 16px;
      }
      .actions {
        margin-top: 8px;
      }
      :host ::ng-deep .result .p-card-body {
        text-align: center;
      }
      .ok {
        font-size: 48px;
        color: var(--p-green-500, #22c55e);
      }
      :host ::ng-deep .p-inputnumber {
        width: 100%;
      }
    `,
  ],
})
export class ReservationCreate {
  readonly id = input<string>('');

  private readonly eventService = inject(EventService);
  private readonly reservationService = inject(ReservationService);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);

  protected readonly submitting = signal(false);
  protected readonly result = signal<ReservationDto | null>(null);

  protected readonly event = computed(() =>
    this.eventService.events().find((e) => e.id === this.id()),
  );

  protected readonly form = this.fb.nonNullable.group({
    buyerName: ['', [Validators.required, Validators.maxLength(150)]],
    buyerEmail: ['', [Validators.required, Validators.email]],
    quantity: [1, [Validators.required, Validators.min(1)]],
  });

  constructor() {
    if (this.eventService.events().length === 0) {
      this.eventService.load();
    }
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.submitting.set(true);

    this.reservationService.create({ eventId: this.id(), ...value }).subscribe({
      next: (reservation) => {
        this.result.set(reservation);
        this.messageService.add({
          severity: 'success',
          summary: 'Reserva creada',
          detail: 'Reserva creada (pendiente de pago).',
          life: 4000,
        });
      },
      complete: () => this.submitting.set(false),
      error: () => this.submitting.set(false),
    });
  }
}
