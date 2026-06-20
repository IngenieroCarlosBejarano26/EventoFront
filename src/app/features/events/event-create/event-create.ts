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
  template: `
    <section class="page">
      <header class="page-header">
        <h1>Crear evento</h1>
      </header>

      <p-card>
        <form [formGroup]="form" (ngSubmit)="submit()" class="form-grid">
          <div class="field span-2">
            <label for="title">Título</label>
            <input pInputText id="title" formControlName="title" maxlength="100" />
            @if (form.controls.title.touched && form.controls.title.invalid) {
              <small class="error">El título es obligatorio (5-100 caracteres).</small>
            }
          </div>

          <div class="field span-2">
            <label for="description">Descripción</label>
            <textarea pTextarea id="description" formControlName="description" rows="3" maxlength="500"></textarea>
            @if (form.controls.description.touched && form.controls.description.invalid) {
              <small class="error">La descripción es obligatoria (10-500 caracteres).</small>
            }
          </div>

          <div class="field">
            <label>Venue</label>
            <p-select
              formControlName="venueId"
              [options]="venueService.venues()"
              optionLabel="name"
              optionValue="id"
              placeholder="Selecciona un venue"
            />
            @if (form.controls.venueId.touched && form.controls.venueId.invalid) {
              <small class="error">Selecciona un venue.</small>
            }
          </div>

          <div class="field">
            <label>Tipo</label>
            <p-select formControlName="type" [options]="types" />
          </div>

          <div class="field">
            <label>Capacidad máxima</label>
            <p-inputNumber formControlName="maxCapacity" [min]="1" [showButtons]="true" />
          </div>

          <div class="field">
            <label>Precio (USD)</label>
            <p-inputNumber
              formControlName="price"
              mode="currency"
              currency="USD"
              locale="en-US"
              [min]="0.01"
            />
          </div>

          <div class="field">
            <label>Inicio</label>
            <p-datepicker formControlName="startDate" [showTime]="true" [showIcon]="true" dateFormat="yy-mm-dd" appendTo="body" />
          </div>

          <div class="field">
            <label>Fin</label>
            <p-datepicker formControlName="endDate" [showTime]="true" [showIcon]="true" dateFormat="yy-mm-dd" appendTo="body" />
          </div>

          <div class="actions span-2">
            <p-button type="submit" icon="pi pi-save" label="Guardar evento" [disabled]="submitting()" />
            <p-button type="button" label="Cancelar" [text]="true" (onClick)="router.navigate(['/events'])" />
          </div>
        </form>
      </p-card>
    </section>
  `,
  styles: [
    `
      .actions {
        display: flex;
        gap: 8px;
        margin-top: 8px;
      }
      :host ::ng-deep .p-inputnumber,
      :host ::ng-deep .p-select,
      :host ::ng-deep .p-datepicker {
        width: 100%;
      }
    `,
  ],
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
