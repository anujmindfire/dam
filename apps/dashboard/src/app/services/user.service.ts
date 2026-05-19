import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { API_ENDPOINTS } from '../constants';

export interface UserProps {
  id: number;
  name: string;
  email: string;
  roleId: number;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private readonly USER_URL = API_ENDPOINTS.USER;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders() {
    return { headers: this.authService.getAuthHeaders() };
  }

  getUsers(params?: { searchKey?: string; limit?: number; page?: number }): Observable<any> {
    let url = this.USER_URL;
    const query = [];
    if (params?.searchKey) query.push(`searchKey=${params.searchKey}`);
    if (params?.limit) query.push(`limit=${params.limit}`);
    if (params?.page) query.push(`page=${params.page}`);
    if (query.length > 0) url += `?${query.join('&')}`;
    return this.http.get<any>(url, this.getHeaders());
  }

  updateUser(id: number | string, data: { name: string }): Observable<any> {
    return this.http.patch<any>(`${this.USER_URL}/${id}`, data, this.getHeaders());
  }

  deleteUser(id: number | string): Observable<any> {
    return this.http.delete<any>(`${this.USER_URL}/${id}`, this.getHeaders());
  }
}
