import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [AuthService, provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('isAuthenticated() returns false when no token in localStorage', () => {
    expect(service.isAuthenticated()).toBe(false);
  });

  it('isAuthenticated() returns true when token exists', () => {
    localStorage.setItem('dam_token', 'some-token');
    expect(service.isAuthenticated()).toBe(true);
  });

  it('login() should POST /api/v1/auth/login', () => {
    service.login({ email: 'admin@dam.com', password: 'Admin1234' }).subscribe();
    const req = httpMock.expectOne('/api/v1/auth/login');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.email).toBe('admin@dam.com');
    req.flush({ success: true, data: { accessToken: 'tok', refreshToken: 'ref', userId: 1, email: 'admin@dam.com', name: 'Admin', roleId: 1 } });
  });

  it('login() stores token in localStorage on success', () => {
    service.login({ email: 'admin@dam.com', password: 'Admin1234' }).subscribe();
    const req = httpMock.expectOne('/api/v1/auth/login');
    req.flush({ success: true, data: { accessToken: 'mock-token', refreshToken: 'mock-refresh', userId: 1, email: 'admin@dam.com', name: 'Admin', roleId: 1 } });
    expect(localStorage.getItem('dam_token')).toBe('mock-token');
    expect(service.isAuthenticated()).toBe(true);
  });

  it('logout() clears all auth state from localStorage', () => {
    localStorage.setItem('dam_token', 'some-token');
    localStorage.setItem('dam_refresh_token', 'refresh');
    service.logout();
    expect(service.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('dam_token')).toBeNull();
    expect(localStorage.getItem('dam_refresh_token')).toBeNull();
  });

  it('currentUser should be null when not logged in', () => {
    expect(service.currentUser).toBeNull();
  });

  it('getToken() returns null when no token', () => {
    expect(service.getToken()).toBeNull();
  });

  it('getToken() returns stored token', () => {
    localStorage.setItem('dam_token', 'abc123');
    // Re-initialize to pick up localStorage
    expect(service.getToken()).toBe('abc123');
  });

  it('currentUser$ emits null when not logged in', () => {
    return new Promise<void>((resolve) => {
      service.currentUser$.subscribe((user) => {
        expect(user).toBeNull();
        resolve();
      });
    });
  });
});
