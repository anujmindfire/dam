import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('authGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: { createUrlTree: vi.fn(() => ({ redirect: '/login' })), navigate: vi.fn() } },
      ],
    });
  });

  function runGuard(): unknown {
    return TestBed.runInInjectionContext(() =>
      authGuard({} as any, {} as any)
    );
  }

  it('should return true when user is authenticated', () => {
    const auth = TestBed.inject(AuthService);
    vi.spyOn(auth, 'isAuthenticated').mockReturnValue(true);
    expect(runGuard()).toBe(true);
  });

  it('should redirect to /login when user is not authenticated', () => {
    const auth = TestBed.inject(AuthService);
    const router = TestBed.inject(Router);
    vi.spyOn(auth, 'isAuthenticated').mockReturnValue(false);
    runGuard();
    expect(router.createUrlTree).toHaveBeenCalledWith(['/login']);
  });
});
