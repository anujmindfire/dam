import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonComponent } from '../../components/ui/button/button';
import { BadgeComponent } from '../../components/ui/badge/badge';
import { AppListComponent, Column } from '../../components/ui/list/list';
import { UploadModalComponent } from '../../components/ui/modal/upload-modal';
import { AddToCollectionModalComponent } from '../../components/ui/modal/collection-modal';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-assets',
  standalone: true,
  imports: [CommonModule, ButtonComponent, BadgeComponent, AppListComponent, UploadModalComponent, AddToCollectionModalComponent],
  templateUrl: './assets.html',
})
export class AssetsComponent {
  columns: Column[] = [
    { id: 'name', label: 'Asset Name', width: 40 },
    { id: 'type', label: 'Type' },
    { id: 'status', label: 'Status' },
    { id: 'updatedAt', label: 'Last Updated' },
    { id: 'actions', label: '', align: 'right' },
  ];

  assets = [
    { id: '1', name: 'Summer_Campaign_Main.mp4', mimeType: 'video/mp4', status: 'approved', updatedAt: '2026-05-14' },
    { id: '2', name: 'Logo_Final_2026.svg', mimeType: 'image/svg+xml', status: 'pending', updatedAt: '2026-05-13' },
    { id: '3', name: 'Brand_Guidelines_v2.pdf', mimeType: 'application/pdf', status: 'approved', updatedAt: '2026-05-12' },
  ];

  totalCount = 3;
  page = 1;
  limit = 10;
  isLoading = false;
  showUploadModal = false;
  showCollectionModal = false;
  selectedAssetId = '';

  mockCollections = [
    { id: 'c1', name: 'Summer 2026 Marketing', assetCount: 12 },
    { id: 'c2', name: 'Social Media Assets', assetCount: 45 },
    { id: 'c3', name: 'Brand Identity', assetCount: 8 },
  ];

  constructor(private router: Router, private toast: ToastService) {}

  handleSearch(term: string) {
    console.log('Searching for:', term);
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

  handleCollectionSelect(collectionId: string) {
    this.toast.show('Asset linked to collection successfully', 'success');
    this.showCollectionModal = false;
  }

  handleUploadSuccess() {
    this.toast.show('Asset uploaded and processing started', 'success');
  }
}
