import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AssetsProps, SuccessResponseProps } from '@dam/shared';

@Injectable({
  providedIn: 'root',
})
export class AssetService {
  private readonly ASSETS_URL = '/api/v1/assets';

  constructor(private http: HttpClient) {}

  private getHeaders() {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  getAssets(): Observable<SuccessResponseProps<AssetsProps[]>> {
    return this.http.get<SuccessResponseProps<AssetsProps[]>>(this.ASSETS_URL, {
      headers: this.getHeaders(),
    });
  }

  getAsset(id: string): Observable<SuccessResponseProps<AssetsProps>> {
    return this.http.get<SuccessResponseProps<AssetsProps>>(`${this.ASSETS_URL}/${id}`, {
      headers: this.getHeaders(),
    });
  }

  uploadAsset(formData: FormData): Observable<SuccessResponseProps<AssetsProps>> {
    return this.http.post<SuccessResponseProps<AssetsProps>>(this.ASSETS_URL, formData, {
      headers: this.getHeaders(),
    });
  }

  deleteAsset(id: string): Observable<SuccessResponseProps<void>> {
    return this.http.delete<SuccessResponseProps<void>>(`${this.ASSETS_URL}/${id}`, {
      headers: this.getHeaders(),
    });
  }
}
