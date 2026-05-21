import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Observable, of, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ButtonComponent } from '../../components/ui/button/button';
import { BadgeComponent } from '../../components/ui/badge/badge';
import { AppListComponent, Column } from '../../components/ui/list/list';
import { UploadModalComponent } from '../../components/ui/modal/upload-modal';
import { AddToCollectionModalComponent } from '../../components/ui/modal/collection-modal';
import { ConfirmDialogComponent } from '../../components/ui/confirm-dialog/confirm-dialog';
import { MimeLabelPipe } from '../../pipes/mime-label.pipe';
import { RelativeTimePipe } from '../../pipes/relative-time.pipe';
import { ToastService } from '../../services/toast.service';
import { AssetService } from '../../services/asset.service';
import { HasRoleDirective } from '../../directives/has-role.directive';

@Component({
  selector: 'app-assets',
  standalone: true,
  imports: [
    CommonModule,
    ButtonComponent,
    BadgeComponent,
    AppListComponent,
    UploadModalComponent,
    AddToCollectionModalComponent,
    ConfirmDialogComponent,
    MimeLabelPipe,
    RelativeTimePipe,
    HasRoleDirective
  ],
  templateUrl: './assets.html',
})
export class AssetsComponent implements OnInit, OnDestroy {
  columns: Column[] = [
    { id: 'filename', label: 'Name', width: 30, sortable: true },
    { id: 'type', label: 'Type', width: 10 },
    { id: 'status', label: 'Status', width: 15, align: 'center' },
    { id: 'owner', label: 'Owner', width: 15, align: 'center' },
    { id: 'createdAt', label: 'Last Updated', width: 15, align: 'center' },
    { id: 'actions', label: 'Actions', width: 15, align: 'right' },
  ];

  assets: any[] = [];
  allAssets: any[] = [];
  totalCount = 0;
  page = 1;
  limit = 10;
  isLoading = false;
  showUploadModal = false;
  showCollectionModal = false;
  selectedAssetId = '';
  thumbnailUrls: Map<string | number, Observable<string | null>> = new Map();

  // Custom Delete Confirm Modal State
  showConfirmDelete = false;
  assetToDeleteId = '';

  /** Emits once on destroy to complete all takeUntil subscriptions. */
  private readonly destroy$ = new Subject<void>();

  getThumbnail(id: string | number): Observable<string | null> {
    if (!this.thumbnailUrls.has(id)) {
      this.thumbnailUrls.set(id, this.assetService.getThumbnailBlobUrl(id));
    }
    return this.thumbnailUrls.get(id)!;
  }

  constructor(
    private router: Router,
    private toast: ToastService,
    private assetService: AssetService
  ) {}

  ngOnInit() {
    this.loadAssets();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAssets() {
    this.isLoading = true;
    this.assetService.getAssets()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          const payload = res.data?.data || res.data || {};
          const rawList = Array.isArray(payload) ? payload : (payload.result || []);
          this.allAssets = rawList.map((asset: any) => ({
            id: asset.id,
            filename: asset.filename || asset.name,
            mimetype: asset.mimetype || asset.mimeType || 'application/octet-stream',
            status: asset.status || 'pending',
            owner: asset.uploader?.name || asset.owner || 'System',
            createdAt: asset.createdAt || asset.updatedAt
          }));
          this.filterAssets('');
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to load assets', err);
          this.toast.show('Failed to load assets from server', 'error');
          this.isLoading = false;
        }
      });
  }

  filterAssets(term: string) {
    if (!term) {
      this.assets = [...this.allAssets];
    } else {
      const search = term.toLowerCase();
      this.assets = this.allAssets.filter(asset =>
        (asset.filename || '').toLowerCase().includes(search) ||
        (asset.mimetype || '').toLowerCase().includes(search)
      );
    }
    this.totalCount = this.assets.length;
  }

  handleSearch(term: string) {
    this.filterAssets(term);
  }

  handlePageChange(p: number) {
    this.page = p;
  }

  handleLimitChange(l: number) {
    this.limit = l;
    this.page = 1;
  }

  viewDetail(id: string) {
    this.router.navigate(['/assets', id]);
  }

  addToCollection(id: string) {
    this.selectedAssetId = id;
    this.showCollectionModal = true;
  }

  handleDownload(id: string) {
    this.assetService.getDownloadUrl(id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (res: any) => {
          const downloadUrl = res.data?.downloadUrl || res.data?.data?.downloadUrl;
          if (downloadUrl) {
            window.open(downloadUrl, '_blank');
            this.toast.show('Download started successfully', 'success');
          } else {
            this.toast.show('Download URL not found', 'error');
          }
        },
        error: () => this.toast.show('Failed to generate download link', 'error')
      });
  }

  handleDelete(id: string) {
    this.assetToDeleteId = id;
    this.showConfirmDelete = true;
  }

  executeDelete() {
    this.showConfirmDelete = false;
    if (!this.assetToDeleteId) return;

    this.assetService.deleteAsset(this.assetToDeleteId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          // Optimistically remove from local arrays immediately — no server round-trip needed
          this.allAssets = this.allAssets.filter(a => String(a.id) !== String(this.assetToDeleteId));
          this.thumbnailUrls.delete(this.assetToDeleteId);
          this.filterAssets('');
          this.toast.show('Asset deleted successfully', 'success');
          this.assetToDeleteId = '';
        },
        error: () => {
          this.toast.show('Failed to delete asset', 'error');
          this.assetToDeleteId = '';
        }
      });
  }

  handleUploadSuccess() {
    this.toast.show('Asset uploaded successfully', 'success');
    this.loadAssets();
  }
}

