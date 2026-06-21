import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { EventService } from '../../../core/services/event.service';
import { VenueService } from '../../../core/services/venue.service';
import { EVENT_TYPES, EventType } from '../../../core/models/enums';

@Component({
  selector: 'app-event-create',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    InputNumberModule,
    SelectModule,
    DatePickerModule,
  ],
  templateUrl: './event-create.html',
  styleUrl: './event-create.scss',
})
export class EventCreate {
  protected readonly venueService = inject(VenueService);
  private readonly eventService = inject(EventService);
  private readonly fb = inject(FormBuilder);
  protected readonly router = inject(Router);
  private readonly messageService = inject(MessageService);

  protected readonly types = EVENT_TYPES;
  protected readonly submitting = signal(false);

  protected readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
    description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
    venueId: this.fb.control<number | null>(null, Validators.required),
    type: this.fb.nonNullable.control<EventType>('Conferencia', Validators.required),
    maxCapacity: [100, [Validators.required, Validators.min(1)]],
    price: [50, [Validators.required, Validators.min(0.01)]],
    startDate: this.fb.control<Date | null>(null, Validators.required),
    endDate: this.fb.control<Date | null>(null, Validators.required),
  });

  constructor() {
    this.venueService.load();
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.getRawValue();
    this.submitting.set(true);

    this.eventService
      .create({
        title: value.title,
        description: value.description,
        venueId: value.venueId!,
        type: value.type,
        maxCapacity: value.maxCapacity,
        price: value.price,
        startDate: value.startDate!.toISOString(),
        endDate: value.endDate!.toISOString(),
      })
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Evento creado',
            detail: 'El evento se creó correctamente.',
            life: 4000,
          });
          this.router.navigate(['/events']);
        },
        complete: () => this.submitting.set(false),
        error: () => this.submitting.set(false),
      });
  }
}
