import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { API_ENDPOINTS } from '../constants';

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface AuthUser {
  userId: number;
  email: string;
  name: string;
  roleId: number;
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly AUTH_URL = API_ENDPOINTS.AUTH;
  private currentUserSubject = new BehaviorSubject<AuthUser | null>(null);

  constructor(private http: HttpClient) {
    const savedUser = localStorage.getItem('dam_user');
    if (savedUser) {
      try {
        this.currentUserSubject.next(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem('dam_user');
        localStorage.removeItem('dam_token');
      }
    }
  }

  login(credentials: LoginCredentials): Observable<ApiResponse<AuthUser>> {
    return this.http.post<ApiResponse<AuthUser>>(`${this.AUTH_URL}/login`, credentials).pipe(
      tap((response) => {
        if (response.success && response.data?.accessToken) {
          localStorage.setItem('dam_token', response.data.accessToken);
          localStorage.setItem('dam_refresh_token', response.data.refreshToken);
          localStorage.setItem('dam_user', JSON.stringify(response.data));
          this.currentUserSubject.next(response.data);
        }
      }),
    );
  }

  signup(data: any): Observable<any> {
    return this.http.post(`${this.AUTH_URL}/signup`, data);
  }

  logout(): void {
    localStorage.removeItem('dam_token');
    localStorage.removeItem('dam_refresh_token');
    localStorage.removeItem('dam_user');
    this.currentUserSubject.next(null);
  }

  get currentUser$(): Observable<AuthUser | null> {
    return this.currentUserSubject.asObservable();
  }

  get currentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  getToken(): string | null {
    return localStorage.getItem('dam_token');
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${this.getToken()}`,
    });
  }
}
