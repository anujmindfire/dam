import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';

/**
 * Centralised HTTP error interceptor.
 *
 * • 401 → clears auth state and redirects to /login
 * • 403 → navigates to an "access denied" fallback route
 * • 5xx → wraps the error so components can show a friendly message
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        auth.logout();
        router.navigate(['/login'], { queryParams: { reason: 'session_expired' } });
      } else if (err.status === 403) {
        router.navigate(['/']);
      }
      // Preserve original error so component-level handlers still work
      return throwError(() => err);
    }),
  );
};
