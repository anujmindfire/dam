import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ui } from '../../constants';

@Component({
  selector: 'app-assets',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './assets.html',
  styleUrl: './assets.css',
})
export class AssetsComponent {
  ui = ui;
  viewMode: 'grid' | 'list' = 'grid';
  isUploadModalOpen = false;
  searchQuery = '';
  filterStatus = 'all';
  filterType = 'all';

  assets = [
    {
      id: '1',
      name: 'SummerCampaign_Hero.jpg',
      type: 'Image',
      status: 'Approved',
      owner: 'Mkt',
      date: '2 days ago',
      size: '2.4 MB',
    },
    {
      id: '2',
      name: 'ProductLaunch_Walkthrough.mp4',
      type: 'Video',
      status: 'Pending',
      owner: 'PR',
      date: '5 hours ago',
      size: '156 MB',
    },
    {
      id: '3',
      name: 'BrandGuidelines_2026.pdf',
      type: 'Document',
      status: 'Approved',
      owner: 'Design',
      date: '1 week ago',
      size: '12.8 MB',
    },
    {
      id: '4',
      name: 'RadioSpot_v1.mp3',
      type: 'Audio',
      status: 'Under Review',
      owner: 'Mkt',
      date: 'Yesterday',
      size: '4.2 MB',
    },
    {
      id: '5',
      name: 'Q1_Results.pptx',
      type: 'Document',
      status: 'Approved',
      owner: 'Finance',
      date: '3 days ago',
      size: '5.6 MB',
    },
    {
      id: '6',
      name: 'Promo_Video_30sec.mp4',
      type: 'Video',
      status: 'Pending',
      owner: 'Marketing',
      date: 'Today',
      size: '45 MB',
    },
  ];

  constructor(private router: Router) {}

  get filteredAssets() {
    return this.assets.filter((asset) => {
      const matchesSearch = asset.name.toLowerCase().includes(this.searchQuery.toLowerCase());
      const matchesStatus =
        this.filterStatus === 'all' || asset.status.toLowerCase().includes(this.filterStatus);
      const matchesType =
        this.filterType === 'all' || asset.type.toLowerCase().includes(this.filterType);
      return matchesSearch && matchesStatus && matchesType;
    });
  }

  getStatusColor(status: string) {
    switch (status) {
      case 'Approved':
        return '#10b981';
      case 'Pending':
        return 'var(--color-secondary)';
      case 'Under Review':
        return 'var(--color-accent-purple)';
      default:
        return 'var(--color-text-dim)';
    }
  }

  viewAsset(id: string) {
    this.router.navigate(['/assets', id]);
  }
}
