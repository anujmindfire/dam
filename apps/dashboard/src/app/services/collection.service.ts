import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { API_ENDPOINTS } from '../constants';

export interface CollectionProps {
  id: number;
  name: string;
  userId: number;
  parentId?: number | string | null;
  createdAt: string;
  updatedAt: string;
  assets?: any[];
}

@Injectable({
  providedIn: 'root',
})
export class CollectionService {
  private readonly COLLECTION_URL = API_ENDPOINTS.COLLECTION;

  constructor(private http: HttpClient, private authService: AuthService) {}

  private getHeaders() {
    return { headers: this.authService.getAuthHeaders() };
  }

  getCollections(params?: { parentId?: string | number | null; search?: string; limit?: number; page?: number }): Observable<any> {
    let url = this.COLLECTION_URL;
    const query = [];
    if (params?.parentId) query.push(`parentId=${params.parentId}`);
    if (params?.search) query.push(`searchKey=${params.search}`);
    if (params?.limit) query.push(`limit=${params.limit}`);
    if (params?.page) query.push(`page=${params.page}`);
    if (query.length > 0) url += `?${query.join('&')}`;
    return this.http.get<any>(url, this.getHeaders());
  }

  createCollection(name: string, parentId?: string | number | null): Observable<any> {
    return this.http.post<any>(this.COLLECTION_URL, { name, parentId }, this.getHeaders());
  }

  getCollection(id: string): Observable<any> {
    return this.http.get<any>(`${this.COLLECTION_URL}/${id}`, this.getHeaders());
  }

  deleteCollection(id: string): Observable<any> {
    return this.http.delete<any>(`${this.COLLECTION_URL}/${id}`, this.getHeaders());
  }

  addAssetToCollection(collectionId: string, assetId: string): Observable<any> {
    return this.http.post<any>(`${this.COLLECTION_URL}/${collectionId}/assets`, { assetId }, this.getHeaders());
  }
}
