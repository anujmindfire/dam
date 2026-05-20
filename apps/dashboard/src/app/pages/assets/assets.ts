import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../components/ui/button/button';
import { BadgeComponent } from '../../components/ui/badge/badge';
import { AppListComponent, Column } from '../../components/ui/list/list';
import { UploadModalComponent } from '../../components/ui/modal/upload-modal';
import { AddToCollectionModalComponent } from '../../components/ui/modal/collection-modal';
import { ToastService } from '../../services/toast.service';
import { AssetService } from '../../services/asset.service';

@Component({
  selector: 'app-assets',
  standalone: true,
  imports: [CommonModule, ButtonComponent, BadgeComponent, AppListComponent, UploadModalComponent, AddToCollectionModalComponent],
  templateUrl: './assets.html',
})
export class AssetsComponent implements OnInit {
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


  constructor(
    private router: Router, 
    private toast: ToastService,
    private assetService: AssetService
  ) {}

  ngOnInit() {
    this.loadAssets();
  }

  loadAssets() {
    this.isLoading = true;
    this.assetService.getAssets().subscribe({
      next: (res: any) => {
        const payload = res.data?.data || res.data || {};
        const rawList = Array.isArray(payload) ? payload : (payload.result || []);
        this.allAssets = rawList.map((asset: any) => ({
          id: asset.id,
          filename: asset.filename || asset.name,
          mimetype: asset.mimetype || asset.mimeType || 'application/octet-stream',
          status: asset.status || 'pending',
          owner: asset.uploader?.name || asset.owner || 'System',
          createdAt: new Date(asset.createdAt || asset.updatedAt).toLocaleDateString()
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
    this.assetService.getDownloadUrl(id).subscribe({
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
    if (!window.confirm('Are you sure you want to delete this asset?')) return;
    this.assetService.deleteAsset(id).subscribe({
      next: () => {
        this.toast.show('Asset deleted successfully', 'success');
        this.loadAssets();
      },
      error: () => this.toast.show('Failed to delete asset', 'error')
    });
  }


  handleUploadSuccess() {
    this.toast.show('Asset uploaded successfully', 'success');
    this.loadAssets();
  }
}
