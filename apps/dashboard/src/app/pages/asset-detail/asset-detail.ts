import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardBodyComponent } from '../../components/ui/card/card';
import { ButtonComponent } from '../../components/ui/button/button';
import { BadgeComponent } from '../../components/ui/badge/badge';
import { AssetService } from '../../services/asset.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-asset-detail',
  standalone: true,
  imports: [CommonModule, CardComponent, CardHeaderComponent, CardTitleComponent, CardBodyComponent, ButtonComponent, BadgeComponent],
  templateUrl: './asset-detail.html',
  styleUrl: './asset-detail.css',
})
export class AssetDetailComponent implements OnInit {
  activeTab = 'activity';
  asset: any = null;
  isLoading = true;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private assetService: AssetService,
    private location: Location,
    private toast: ToastService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadAsset(id);
    } else {
      this.error = 'Invalid Asset ID';
      this.isLoading = false;
    }
  }

  loadAsset(id: string) {
    this.isLoading = true;
    this.assetService.getAsset(id).subscribe({
      next: (res: any) => {
        this.asset = res.data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load asset details', err);
        this.error = 'Failed to load asset details';
        this.isLoading = false;
      }
    });
  }

  deleteAsset() {
    if (!this.asset?.id) return;
    if (confirm(`Are you sure you want to delete ${this.asset.filename || this.asset.name}?`)) {
      this.assetService.deleteAsset(this.asset.id).subscribe({
        next: () => {
          this.toast.show('Asset deleted successfully', 'success');
          this.goBack();
        },
        error: (err) => {
          console.error('Failed to delete asset', err);
          this.toast.show('Failed to delete asset', 'error');
        }
      });
    }
  }

  goBack() {
    this.location.back();
  }
}
