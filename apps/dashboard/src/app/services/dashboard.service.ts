import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { API_ENDPOINTS } from '../constants';

export interface DashboardStats {
  totalAssets: number;
  totalStorage: number;
  statusDistribution: Record<string, number>;
  mimetypeDistribution: { mimetype: string; count: string }[];
  duplicateCount: number;
  expiredCount: number;
  atRiskCount: number;
  usageTrends: any[];
  complianceScore: number;
}

export interface DashboardResponse {
  success: boolean;
  message: string;
  data: DashboardStats;
}

@Injectable({
  providedIn: 'root',
})
export class DashboardService {
  private readonly ANALYTICS_URL = API_ENDPOINTS.ANALYTICS;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders() {
    return { headers: this.authService.getAuthHeaders() };
  }

  getOverview(filters?: any): Observable<DashboardResponse> {
    let url = `${this.ANALYTICS_URL}/overview`;
    if (filters) {
      const params = new URLSearchParams(filters).toString();
      if (params) url += `?${params}`;
    }
    return this.http.get<DashboardResponse>(url, this.getHeaders());
  }

  getCompliance(): Observable<any> {
    return this.http.get<any>(`${this.ANALYTICS_URL}/compliance`, this.getHeaders());
  }

  triggerReport(): Observable<any> {
    return this.http.post<any>(`${this.ANALYTICS_URL}/report/trigger`, {}, this.getHeaders());
  }

  getUsageLogs(limit: number = 10): Observable<any> {
    return this.http.get<any>(`${API_ENDPOINTS.USAGE}?limit=${limit}`, this.getHeaders());
  }

  getJobs(): Observable<any> {
    return this.http.get<any>(API_ENDPOINTS.JOBS, this.getHeaders());
  }

  getApprovals(status?: string, limit?: number): Observable<any> {
    let url = API_ENDPOINTS.APPROVAL;
    const params = [];
    if (status) params.push(`status=${status}`);
    if (limit) params.push(`limit=${limit}`);
    if (params.length > 0) url += `?${params.join('&')}`;
    return this.http.get<any>(url, this.getHeaders());
  }

  getAssets(limit: number = 5): Observable<any> {
    return this.http.get<any>(`${API_ENDPOINTS.ASSETS}?limit=${limit}`, this.getHeaders());
  }
}
