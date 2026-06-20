import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { ApplicationConfig, inject, provideAppInitializer, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import { MessageService } from 'primeng/api';
import Aura from '@primeng/themes/aura';
import { definePreset } from '@primeng/themes';
import { apiKeyInterceptor } from './core/interceptors/api-key.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { RealtimeService } from './core/services/realtime.service';
import { routes } from './app.routes';

/**
 * Preset basado en Aura con una identidad sobria: color primario neutro (ink),
 * botones de acción en tono casi negro y radios reducidos. El color se reserva
 * para los estados (tags de éxito/error/info), no para la decoración.
 */
const EventosVivosPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '{zinc.50}',
      100: '{zinc.100}',
      200: '{zinc.200}',
      300: '{zinc.300}',
      400: '{zinc.400}',
      500: '{zinc.500}',
      600: '{zinc.600}',
      700: '{zinc.700}',
      800: '{zinc.800}',
      900: '{zinc.900}',
      950: '{zinc.950}',
    },
    colorScheme: {
      light: {
        primary: {
          color: '{zinc.900}',
          contrastColor: '#ffffff',
          hoverColor: '{zinc.800}',
          activeColor: '{zinc.950}',
        },
      },
    },
  },
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([apiKeyInterceptor, errorInterceptor])),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: EventosVivosPreset,
        options: {
          // Desactiva el dark mode automático para un look corporativo consistente.
          darkModeSelector: false,
        },
      },
    }),
    // Servicio global de notificaciones (Toast) reutilizado por el interceptor de errores.
    MessageService,
    // Inicia la conexión de tiempo real al arrancar la app (fuera del componente).
    provideAppInitializer(() => inject(RealtimeService).start()),
  ],
};
