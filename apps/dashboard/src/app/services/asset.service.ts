import { Injectable } from '@angular/core';
import { HttpClient, HttpBackend, HttpRequest, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { AssetsProps, SuccessResponseProps } from '@dam/shared';
import { AuthService } from './auth.service';
import { API_ENDPOINTS } from '../constants';

@Injectable({
  providedIn: 'root',
})
export class AssetService {
  private readonly ASSETS_URL = API_ENDPOINTS.ASSETS;
  private httpWithoutInterceptor: HttpClient;

  constructor(private http: HttpClient, private handler: HttpBackend, private authService: AuthService) {
    this.httpWithoutInterceptor = new HttpClient(handler);
  }

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

  getThumbnailBlobUrl(id: string | number): Observable<string | null> {
    return this.http.get(`${this.ASSETS_URL}/${id}/thumbnail`, {
      headers: this.authService.getAuthHeaders(),
      responseType: 'blob',
    }).pipe(
      map(blob => URL.createObjectURL(blob)),
      catchError(() => of(null)),
    );
  }

  deleteAsset(id: string): Observable<SuccessResponseProps<void>> {
    return this.http.delete<SuccessResponseProps<void>>(`${this.ASSETS_URL}/${id}`, this.getHeaders());
  }

  getUploadUrl(data: { filename: string; mimetype: string }): Observable<SuccessResponseProps<any>> {
    return this.http.post<SuccessResponseProps<any>>(`${this.ASSETS_URL}/upload/presigned`, data, this.getHeaders());
  }

  completeUpload(data: any): Observable<SuccessResponseProps<any>> {
    return this.http.post<SuccessResponseProps<any>>(`${this.ASSETS_URL}/upload/complete`, data, this.getHeaders());
  }

  uploadToMinio(uploadUrl: string, file: File, mimetype: string): Observable<any> {
    const req = new HttpRequest('PUT', uploadUrl, file, {
      reportProgress: true,
      headers: new HttpHeaders({ 'Content-Type': mimetype })
    });
    return this.httpWithoutInterceptor.request(req);
  }
}
