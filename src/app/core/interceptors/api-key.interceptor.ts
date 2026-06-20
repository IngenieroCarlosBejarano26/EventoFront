import { HttpInterceptorFn } from '@angular/common/http';
import { environment } from '../../../environments/environment';

/**
 * Adjunta la API Key en cada solicitud. El backend solo la exige en endpoints
 * administrativos, pero enviarla siempre simplifica el cliente.
 */
export const apiKeyInterceptor: HttpInterceptorFn = (req, next) => {
  const cloned = req.clone({
    setHeaders: { 'X-API-KEY': environment.apiKey },
  });
  return next(cloned);
};
