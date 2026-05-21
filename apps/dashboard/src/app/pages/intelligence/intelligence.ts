import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardBodyComponent } from '../../components/ui/card/card';
import { ButtonComponent } from '../../components/ui/button/button';
import { DashboardService } from '../../services/dashboard.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-intelligence',
  standalone: true,
  imports: [CommonModule, FormsModule, CardComponent, CardHeaderComponent, CardTitleComponent, CardBodyComponent, ButtonComponent],
  templateUrl: './intelligence.html',
})
export class IntelligenceComponent implements OnInit {
  stats: any = null;
  isLoading = true;
  isExporting = false;
  filters = {
    timeRange: 'Last 30 Days',
    department: 'All Departments',
    assetType: 'All Asset Types',
  };

  statsCards: any[] = [];
  memoizedTrends: any[] = [];

  constructor(
    private dashboardService: DashboardService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.fetchStats();
  }

  fetchStats() {
    this.isLoading = true;
    this.dashboardService.getOverview(this.filters).subscribe({
      next: (res: any) => {
        this.stats = res.data;
        this.updateDerivedData();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load intelligence stats', err);
        this.toast.show('Failed to load intelligence stats', 'error');
        this.isLoading = false;
      }
    });
  }

  handleExport() {
    this.isExporting = true;
    this.dashboardService.triggerReport().subscribe({
      next: (res: any) => {
        const reportData = res.data;
        if (reportData?.downloadUrl) {
          window.open(reportData.downloadUrl, '_blank');
          this.toast.show('Intelligence report downloaded successfully!', 'success');
        }
        this.fetchStats();
        this.isExporting = false;
      },
      error: (err) => {
        console.error('Failed to export report', err);
        this.toast.show('Failed to export intelligence report', 'error');
        this.isExporting = false;
      }
    });
  }

  updateDerivedData() {
    this.statsCards = [
      {
        label: 'Total Assets',
        value: this.stats?.totalAssets || 0,
        color: 'text-indigo-600',
        bg: 'bg-indigo-50',
        description: 'Total number of assets in the repository',
      },
      {
        label: 'Storage Used',
        value: this.stats?.totalStorage
          ? `${(this.stats.totalStorage / (1024 * 1024)).toFixed(1)} MB`
          : '0 MB',
        color: 'text-emerald-600',
        bg: 'bg-emerald-50',
        description: 'Total disk space consumed by assets',
      },
      {
        label: 'Active Jobs',
        value: this.stats?.activeJobsCount?.toString() || '0',
        color: 'text-amber-600',
        bg: 'bg-amber-50',
        description: 'Background processing jobs currently running',
      },
      {
        label: 'Compliance Score',
        value: this.stats?.complianceScore !== undefined ? `${this.stats.complianceScore}%` : '0%',
        color: 'text-blue-600',
        bg: 'bg-blue-50',
        description: 'Percentage of assets meeting governance standards',
      },
    ];

    if (!this.stats?.usageTrends) {
      this.memoizedTrends = [];
      return;
    }

    const maxCount = Math.max(...this.stats.usageTrends.map((t: any) => parseInt(t.count) || 0));
    this.memoizedTrends = this.stats.usageTrends.map((trend: any) => {
      const parsedDate = new Date(trend.date);
      return {
        ...trend,
        height: maxCount > 0 ? (parseInt(trend.count) / maxCount) * 100 : 0,
        displayDate: parsedDate.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
      };
    });
  }

  calculatePercentage(count: string | number): number {
    if (!this.stats?.totalAssets) return 0;
    return Math.round((parseInt(String(count)) / this.stats.totalAssets) * 100);
  }
}
