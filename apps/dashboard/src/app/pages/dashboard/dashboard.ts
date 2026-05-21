import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardBodyComponent } from '../../components/ui/card/card';
import { ButtonComponent } from '../../components/ui/button/button';
import { DashboardService } from '../../services/dashboard.service';

interface ActivityItem {
  id: string;
  title: string;
  time: string;
  user: string;
  icon: string;
  date: Date;
  target?: string;
  timestamp?: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, CardComponent, CardHeaderComponent, CardTitleComponent, CardBodyComponent, ButtonComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit {
  isLoading = true;
  error: string | null = null;
  currentDate = new Date();

  stats: any[] = [
    { label: 'Total Assets', value: '0', trend: 'Active', trendUp: true, icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 6 4 14H4L8 6Z"/><path d="M12 6V2"/><path d="M9 2h6"/></svg>', color: 'bg-indigo-500', bg: 'bg-indigo-50', description: 'Total assets' },
    { label: 'Compliance Score', value: '0%', trend: 'Health', trendUp: true, icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/></svg>', color: 'bg-emerald-500', bg: 'bg-emerald-50', description: 'Compliance score' },
    { label: 'Duplicates', value: '0', trend: 'Review', trendUp: false, icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="m9 12 2 2 4-4"/></svg>', color: 'bg-amber-500', bg: 'bg-amber-50', description: 'Duplicates found' },
    { label: 'Expiring Soon', value: '0', trend: 'Action', trendUp: false, icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>', color: 'bg-rose-500', bg: 'bg-rose-50', description: 'Expiring assets' },
  ];

  statusDistribution = {
    pending: 0,
    processing: 0
  };

  trends: { label: string; count: number; height: number }[] = [];
  activity: ActivityItem[] = [];

  constructor(private dashboardService: DashboardService) {}

  ngOnInit() {
    this.fetchDashboardData();
  }

  fetchDashboardData() {
    this.isLoading = true;
    this.error = null;

    forkJoin({
      overview: this.dashboardService.getOverview().pipe(catchError(() => of(null))),
      usageLogs: this.dashboardService.getUsageLogs(10).pipe(catchError(() => of({ success: true, data: { result: [] } }))),
      pendingApprovals: this.dashboardService.getApprovals('pending').pipe(catchError(() => of({ success: true, data: { result: [] } }))),
      approvalHistory: this.dashboardService.getApprovals(undefined, 10).pipe(catchError(() => of({ success: true, data: { result: [] } }))),
      latestAssets: this.dashboardService.getAssets(5).pipe(catchError(() => of({ success: true, data: { result: [] } })))
    }).subscribe({
      next: (res) => {
        // 1. Process Overview Stats
        if (res.overview && res.overview.success && res.overview.data) {
          const data = res.overview.data;
          this.stats = [
            { label: 'Total Assets', value: data.totalAssets.toLocaleString(), trend: 'Active', trendUp: true, icon: this.stats[0].icon, color: this.stats[0].color },
            { label: 'Compliance Score', value: `${data.complianceScore}%`, trend: 'Health', trendUp: true, icon: this.stats[1].icon, color: this.stats[1].color },
            { label: 'Duplicates', value: data.duplicateCount.toLocaleString(), trend: 'Review', trendUp: false, icon: this.stats[2].icon, color: this.stats[2].color },
            { label: 'Expiring Soon', value: data.atRiskCount.toLocaleString(), trend: 'Action', trendUp: false, icon: this.stats[3].icon, color: this.stats[3].color },
          ];

          this.statusDistribution = {
            pending: data.statusDistribution?.['pending'] || 0,
            processing: data.statusDistribution?.['processing'] || 0
          };

          // Process Usage Trends (ensure 7 days baseline)
          let usageTrends = data.usageTrends || [];
          if (usageTrends.length < 7) {
            const filledTrends = [];
            for (let i = 6; i >= 0; i--) {
              const d = new Date();
              d.setDate(d.getDate() - i);
              const dateStr = d.toISOString().split('T')[0];
              const existing = usageTrends.find((t: any) => t.date === dateStr);
              filledTrends.push(existing || { date: dateStr, count: 0 });
            }
            usageTrends = filledTrends;
          }

          const maxCount = Math.max(...usageTrends.map((t: any) => parseInt(t.count) || 0));
          this.trends = usageTrends.map((trend: any) => ({
            label: new Date(trend.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' }),
            count: parseInt(trend.count) || 0,
            height: maxCount > 0 ? Math.max(((parseInt(trend.count) || 0) / maxCount) * 100, 8) : 8
          }));
        }

        // 2. Add extra pending count to approvals status log if available
        const rawPendingList = res.pendingApprovals?.data?.result || res.pendingApprovals?.data || [];
        this.statusDistribution.pending = (this.statusDistribution.pending || 0) + (rawPendingList.length || 0);

        // 3. Construct Merged Rich Activity Feed
        const rawUsage = res.usageLogs?.data?.result || res.usageLogs?.data || [];
        const rawApprovals = res.approvalHistory?.data?.result || res.approvalHistory?.data || [];
        const rawAssets = res.latestAssets?.data?.result || res.latestAssets?.data || [];

        const usageActivity: ActivityItem[] = rawUsage.map((log: any) => ({
          id: `u-${log.id}`,
          title: (log.action || 'system_event').replace(/_/g, ' '),
          time: this.formatTimeAgo(new Date(log.loggedAt)),
          user: `Asset ID: ${log.assetsId}`,
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path><path d="m9 12 2 2 4-4"></path></svg>',
          date: new Date(log.loggedAt)
        }));

        const approvalActivity: ActivityItem[] = rawApprovals.map((app: any) => ({
          id: `a-${app.id}`,
          title: `Review ${app.status}`,
          time: this.formatTimeAgo(new Date(app.createdAt)),
          user: `Asset ID: ${app.assetsId}`,
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle></svg>',
          date: new Date(app.createdAt)
        }));

        const uploadActivity: ActivityItem[] = rawAssets.map((asset: any) => ({
          id: `up-${asset.id}`,
          title: 'New Upload',
          time: this.formatTimeAgo(new Date(asset.createdAt)),
          user: asset.filename,
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>',
          date: new Date(asset.createdAt)
        }));

        this.activity = [...usageActivity, ...approvalActivity, ...uploadActivity]
          .sort((a, b) => b.date.getTime() - a.date.getTime())
          .slice(0, 7);

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load dashboard metrics aggregation', err);
        this.error = 'Failed to load Systems Overview. Please check connection.';
        this.isLoading = false;
      }
    });
  }

  private formatTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  }
}

