import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';
import { ReservationService } from '../../../core/services/reservation.service';
import { ReservationDto } from '../../../core/models/reservation.model';
import { RESERVATION_STATUS_LABELS } from '../../../core/models/enums';

@Component({
  selector: 'app-reservation-manage',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    TagModule,
  ],
  templateUrl: './reservation-manage.html',
  styleUrl: './reservation-manage.scss',
})
export class ReservationManage {
  private readonly reservationService = inject(ReservationService);
  private readonly fb = inject(FormBuilder);
  private readonly messageService = inject(MessageService);

  protected readonly busy = signal(false);
  protected readonly result = signal<ReservationDto | null>(null);

  protected readonly form = this.fb.nonNullable.group({
    reservationId: ['', [Validators.required]],
  });

  protected statusLabel(status: ReservationDto['status']): string {
    return RESERVATION_STATUS_LABELS[status];
  }

  protected statusSeverity(status: ReservationDto['status']): 'success' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case 'Confirmada':
        return 'success';
      case 'PendientePago':
        return 'warn';
      case 'Cancelada':
      case 'Perdida':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  protected confirm(): void {
    this.run(this.reservationService.confirm(this.form.getRawValue().reservationId), 'Pago confirmado.');
  }

  protected cancel(): void {
    this.run(this.reservationService.cancel(this.form.getRawValue().reservationId), 'Reserva cancelada.');
  }

  private run(obs: ReturnType<ReservationService['confirm']>, successMessage: string): void {
    this.busy.set(true);
    obs.subscribe({
      next: (reservation) => {
        this.result.set(reservation);
        this.messageService.add({
          severity: 'success',
          summary: 'Operación exitosa',
          detail: successMessage,
          life: 4000,
        });
      },
      complete: () => this.busy.set(false),
      error: () => this.busy.set(false),
    });
  }
}
