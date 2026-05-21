import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { HttpHeaders } from '@angular/common/http';
import { AuthService } from './auth.service';
import { AssetService } from './asset.service';

const MOCK_HEADERS = new HttpHeaders({ Authorization: 'Bearer test-token' });

describe('AssetService', () => {
  let service: AssetService;
  let httpMock: HttpTestingController;
  let authService: AuthService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AssetService,
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(AssetService);
    httpMock = TestBed.inject(HttpTestingController);
    authService = TestBed.inject(AuthService);
    vi.spyOn(authService, 'getAuthHeaders').mockReturnValue(MOCK_HEADERS);
    vi.spyOn(authService, 'getToken').mockReturnValue('test-token');
  });

  afterEach(() => httpMock.verify());

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getAssets() should GET /api/v1/assets', () => {
    service.getAssets().subscribe();
    const req = httpMock.expectOne('/api/v1/assets');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: [], totalCount: 0 });
  });

  it('getAsset() should GET /api/v1/assets/:id', () => {
    service.getAsset('42').subscribe();
    const req = httpMock.expectOne('/api/v1/assets/42');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: { id: 42 } });
  });

  it('deleteAsset() should DELETE /api/v1/assets/:id', () => {
    service.deleteAsset('42').subscribe();
    const req = httpMock.expectOne('/api/v1/assets/42');
    expect(req.request.method).toBe('DELETE');
    req.flush({ success: true, message: 'Assets deleted successfully' });
  });

  it('getDownloadUrl() should GET /api/v1/assets/:id/download', () => {
    service.getDownloadUrl('99').subscribe();
    const req = httpMock.expectOne('/api/v1/assets/99/download');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: { downloadUrl: 'http://dam.local:8080/minio/test.mp4' } });
  });

  it('getDownloadUrl() should return a URL with correct host', () => {
    let resultUrl = '';
    service.getDownloadUrl('99').subscribe((res: any) => {
      resultUrl = res.data.downloadUrl;
    });
    const req = httpMock.expectOne('/api/v1/assets/99/download');
    req.flush({ success: true, data: { downloadUrl: 'http://dam.local:8080/minio/test.mp4' } });
    expect(resultUrl).toContain('dam.local:8080');
  });

  it('getThumbnailBlobUrl() should GET /api/v1/assets/:id/thumbnail as blob', () => {
    service.getThumbnailBlobUrl('5').subscribe();
    const req = httpMock.expectOne('/api/v1/assets/5/thumbnail');
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('blob');
    req.flush(new Blob([''], { type: 'image/webp' }));
  });
});
