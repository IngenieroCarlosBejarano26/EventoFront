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
  templateUrl: './reservation-create.html',
  styleUrl: './reservation-create.scss',
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
