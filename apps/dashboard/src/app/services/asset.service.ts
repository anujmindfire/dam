import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AssetsProps, SuccessResponseProps } from '@dam/shared';
import { AuthService } from './auth.service';
import { API_ENDPOINTS } from '../constants';

@Injectable({
  providedIn: 'root',
})
export class AssetService {
  private readonly ASSETS_URL = API_ENDPOINTS.ASSETS;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders() {
    return { headers: this.authService.getAuthHeaders() };
  }

  getAssets(): Observable<SuccessResponseProps<AssetsProps[]>> {
    return this.http.get<SuccessResponseProps<AssetsProps[]>>(this.ASSETS_URL, this.getHeaders());
  }

  getAsset(id: string): Observable<SuccessResponseProps<AssetsProps>> {
    return this.http.get<SuccessResponseProps<AssetsProps>>(`${this.ASSETS_URL}/${id}`, this.getHeaders());
  }

  uploadAsset(formData: FormData): Observable<SuccessResponseProps<AssetsProps>> {
    return this.http.post<SuccessResponseProps<AssetsProps>>(this.ASSETS_URL, formData, this.getHeaders());
  }

  getDownloadUrl(id: string): Observable<SuccessResponseProps<{ downloadUrl: string }>> {
    return this.http.get<SuccessResponseProps<{ downloadUrl: string }>>(`${this.ASSETS_URL}/${id}/download`, this.getHeaders());
  }

  deleteAsset(id: string): Observable<SuccessResponseProps<void>> {
    return this.http.delete<SuccessResponseProps<void>>(`${this.ASSETS_URL}/${id}`, this.getHeaders());
  }
}
