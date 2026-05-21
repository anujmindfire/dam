import { Component, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Observable } from 'rxjs';
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
  thumbnailUrl: Observable<string | null> | null = null;
  mediaUrl: SafeResourceUrl | null = null;

  constructor(
    private route: ActivatedRoute,
    private assetService: AssetService,
    private location: Location,
    private toast: ToastService,
    private sanitizer: DomSanitizer
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
        if (this.asset.mimetype && (this.asset.mimetype.startsWith('video/') || this.asset.mimetype.startsWith('audio/'))) {
          this.assetService.getDownloadUrl(id).subscribe({
            next: (dlRes: any) => {
              const url = dlRes.data?.downloadUrl || dlRes.data?.data?.downloadUrl;
              if (url) {
                this.mediaUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
              }
            }
          });
        } else {
          this.thumbnailUrl = this.assetService.getThumbnailBlobUrl(id);
        }
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

  downloadAsset() {
    if (!this.asset?.id) return;
    this.assetService.getDownloadUrl(this.asset.id).subscribe({
      next: (res: any) => {
        const url = res.data?.downloadUrl || res.data?.data?.downloadUrl;
        if (url) {
          window.open(url, '_blank');
          this.toast.show('Asset download initiated!', 'success');
        }
      },
      error: () => {
        this.toast.show('Failed to generate download link', 'error');
      }
    });
  }

  shareAsset() {
    if (!this.asset?.id) return;
    this.assetService.getDownloadUrl(this.asset.id).subscribe({
      next: (res: any) => {
        const url = res.data?.downloadUrl || res.data?.data?.downloadUrl;
        if (!url) return;
        this.copyToClipboard(url);
      },
      error: () => {
        this.toast.show('Failed to generate sharing link', 'error');
      }
    });
  }

  /** Copies text to clipboard — works on http:// via execCommand fallback */
  private copyToClipboard(text: string) {
    // Modern API (requires HTTPS or localhost)
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => {
        this.toast.show('Direct asset link copied to clipboard!', 'success');
      }).catch(() => this.fallbackCopy(text));
    } else {
      this.fallbackCopy(text);
    }
  }

  private fallbackCopy(text: string) {
    const el = document.createElement('textarea');
    el.value = text;
    el.style.cssText = 'position:fixed;left:-9999px;top:-9999px;opacity:0';
    document.body.appendChild(el);
    el.focus();
    el.select();
    try {
      const ok = document.execCommand('copy');
      this.toast.show(ok ? 'Direct asset link copied to clipboard!' : 'Copy failed — see console', ok ? 'success' : 'error');
    } catch {
      this.toast.show('Could not copy automatically', 'error');
      console.info('Share URL:', text);
    }
    document.body.removeChild(el);
  }

  goBack() {
    this.location.back();
  }
}
