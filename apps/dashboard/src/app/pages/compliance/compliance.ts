import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { CardComponent, CardHeaderComponent, CardTitleComponent, CardBodyComponent } from '../../components/ui/card/card';
import { ButtonComponent } from '../../components/ui/button/button';
import { DashboardService } from '../../services/dashboard.service';
import { ToastService } from '../../services/toast.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-compliance',
  standalone: true,
  imports: [CommonModule, CardComponent, CardHeaderComponent, CardTitleComponent, CardBodyComponent, ButtonComponent],
  templateUrl: './compliance.html',
})
export class ComplianceComponent implements OnInit {
  complianceData: any = null;
  activity: any[] = [];
  isLoading = true;
  activeTab: 'policy' | 'history' = 'policy';

  constructor(
    private dashboardService: DashboardService,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit() {
    this.fetchCompliance();
  }

  fetchCompliance() {
    this.isLoading = true;
    forkJoin([
      this.dashboardService.getCompliance(),
      this.dashboardService.getUsageLogs(10)
    ]).subscribe({
      next: ([compRes, usageRes]: [any, any]) => {
        this.complianceData = compRes.data;
        this.activity = usageRes.data?.result || usageRes.data || [];
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load governance intelligence', err);
        this.toast.show('Failed to load governance intelligence', 'error');
        this.isLoading = false;
      }
    });
  }

  navigateViolation(v: any) {
    const searchParam = v.title.toLowerCase().includes('duplicate') ? 'duplicate' : '';
    this.router.navigate(['/assets'], { queryParams: { search: searchParam } });
  }
}
