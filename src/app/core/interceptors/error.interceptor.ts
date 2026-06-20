import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { catchError, throwError } from 'rxjs';

/**
 * Intercepta errores HTTP y muestra un Toast legible extraído de ProblemDetails.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: extractMessage(error),
        life: 5000,
      });
      return throwError(() => error);
    }),
  );
};

function extractMessage(error: HttpErrorResponse): string {
  if (error.status === 0) {
    return 'No se pudo conectar con el servidor.';
  }

  const problem = error.error;
  if (problem?.errors && typeof problem.errors === 'object') {
    const firstField = Object.values(problem.errors)[0];
    if (Array.isArray(firstField) && firstField.length > 0) {
      return String(firstField[0]);
    }
  }
  return problem?.detail ?? problem?.title ?? 'Ocurrió un error inesperado.';
}
