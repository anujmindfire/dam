import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardBodyComponent } from '../../components/ui/card/card';
import { ButtonComponent } from '../../components/ui/button/button';
import { BadgeComponent } from '../../components/ui/badge/badge';
import { DashboardService } from '../../services/dashboard.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-jobs',
  standalone: true,
  imports: [CommonModule, CardComponent, CardHeaderComponent, CardTitleComponent, CardBodyComponent, ButtonComponent, BadgeComponent],
  templateUrl: './jobs.html',
})
export class JobsComponent implements OnInit {
  jobs: any[] = [];
  isLoading = true;

  constructor(
    private dashboardService: DashboardService,
    private toast: ToastService
  ) {}

  ngOnInit() {
    this.fetchJobs();
  }

  fetchJobs() {
    this.isLoading = true;
    this.dashboardService.getJobs().subscribe({
      next: (res: any) => {
        this.jobs = res.data?.result || res.data || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load background tasks', err);
        this.toast.show('Failed to load background tasks', 'error');
        this.isLoading = false;
      }
    });
  }

  getDuration(job: any): string {
    if (job.status !== 'completed' || !job.startedAt || !job.completedAt) {
      return '--';
    }
    const start = new Date(job.startedAt).getTime();
    const end = new Date(job.completedAt).getTime();
    const diffInSeconds = Math.max(0, Math.floor((end - start) / 1000));

    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    const mins = Math.floor(diffInSeconds / 60);
    const secs = diffInSeconds % 60;
    return secs > 0 ? `${mins}m ${secs}s` : `${mins}m`;
  }
}
