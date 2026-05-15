import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';

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
  private readonly ANALYTICS_URL = '/api/v1/analytics';

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders() {
    return { headers: this.authService.getAuthHeaders() };
  }

  getOverview(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(`${this.ANALYTICS_URL}/overview`, this.getHeaders());
  }
}
