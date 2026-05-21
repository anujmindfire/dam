import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../constants';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class ApprovalService {
  private readonly APPROVAL_URL = API_ENDPOINTS.APPROVAL;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders() {
    return { headers: this.authService.getAuthHeaders() };
  }

  getApprovals(status?: string, limit?: number): Observable<any> {
    let url = this.APPROVAL_URL;
    const params = [];
    if (status) params.push(`status=${status}`);
    if (limit) params.push(`limit=${limit}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    return this.http.get<any>(url, this.getHeaders());
  }

  approve(id: string | number): Observable<any> {
    return this.http.patch<any>(`${this.APPROVAL_URL}/${id}/approve`, {}, this.getHeaders());
  }

  reject(id: string | number, reason: string): Observable<any> {
    return this.http.patch<any>(`${this.APPROVAL_URL}/${id}/reject`, { reason }, this.getHeaders());
  }
}
